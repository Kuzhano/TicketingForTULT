import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Image as ImageIcon,
  Loader2,
  MapPin,
  X,
} from 'lucide-react';
import useTickets from '../hooks/useTickets';
import { fetchData } from '../utils/api';

const claimedUrl = new URL('../data/claimedTickets.json', import.meta.url).href;

function formatTanggal(value) {
  if (!value) return 'Tanggal tidak tersedia';

  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime())
    ? 'Tanggal tidak tersedia'
    : date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
}

function bacaObjekStorage(key) {
  const value = localStorage.getItem(key);
  const parsed = value ? JSON.parse(value) : {};

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`Format data ${key} di browser tidak valid.`);
  }

  return parsed;
}

function gambarValid(gambar) {
  return (
    typeof gambar === 'string' &&
    /^data:image\/(png|jpeg|jpg|webp|gif);base64,/i.test(gambar)
  );
}

export default function ValidasiTeknisi() {
  const { tickets, loading, error, reload, ubahStatus } = useTickets();
  const [admin, setAdmin] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('activeUser') || 'null');
    } catch {
      return null;
    }
  });
  const [users, setUsers] = useState([]);
  const [assignments, setAssignments] = useState({});
  const [documentation, setDocumentation] = useState({});
  const [supportLoading, setSupportLoading] = useState(true);
  const [supportError, setSupportError] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [askingForReason, setAskingForReason] = useState(false);
  const [reason, setReason] = useState('');
  const [actionError, setActionError] = useState('');
  const [message, setMessage] = useState('');
  const dialogRef = useRef(null);

  useEffect(() => {
    let active = true;

    async function loadSupportingData() {
      setSupportLoading(true);
      setSupportError('');

      try {
        const [userData, claimedData] = await Promise.all([
          fetchData('users'),
          fetchData(claimedUrl),
        ]);
        if (!Array.isArray(userData) || !Array.isArray(claimedData)) {
          throw new Error('Format data pengguna atau penugasan tidak valid.');
        }

        const savedAssignments = bacaObjekStorage('tult_assignments');
        const savedDocumentation = bacaObjekStorage('tult_ticket_docs');
        const activeUser = JSON.parse(localStorage.getItem('activeUser') || 'null');

        if (active) {
          setUsers(userData);
          setAssignments({
            ...Object.fromEntries(
              claimedData.map((item) => [String(item.ticketId), item])
            ),
            ...savedAssignments,
          });
          setDocumentation(savedDocumentation);
          setAdmin(activeUser);
        }
      } catch (loadError) {
        if (active) {
          setSupportError(
            loadError instanceof Error
              ? loadError.message
              : 'Terjadi kesalahan saat memuat informasi tiket.'
          );
        }
      } finally {
        if (active) setSupportLoading(false);
      }
    }

    loadSupportingData();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (selectedTicket && !dialog.open) dialog.showModal();
    if (!selectedTicket && dialog.open) dialog.close();
  }, [selectedTicket]);

  const pendingTickets = useMemo(
    () =>
      tickets
        .filter((ticket) => ticket.status === 'Selesai')
        .sort((a, b) => String(b.tanggal || '').localeCompare(String(a.tanggal || ''))),
    [tickets]
  );

  function closeDialog() {
    setSelectedTicket(null);
    setAskingForReason(false);
    setReason('');
    setActionError('');
  }

  function bukaDetail(ticket) {
    setSelectedTicket(ticket);
    setAskingForReason(false);
    setReason('');
    setActionError('');
    setMessage('');
  }

  function ubahStatusTiket(status, alasan = '') {
    if (!selectedTicket) return;

    const success = ubahStatus(selectedTicket.id, status, alasan);
    if (!success) {
      setActionError('Gagal menyimpan perubahan status tiket. Silakan coba lagi.');
      return;
    }

    setMessage(
      status === 'Tervalidasi'
        ? `Tiket ${selectedTicket.id} berhasil divalidasi.`
        : `Tiket ${selectedTicket.id} ditolak dan dikembalikan ke status Diproses.`
    );
    closeDialog();
  }

  if (admin?.role !== 'admin') {
    return (
      <section className="mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-8 text-center">
        <h1 className="mb-2 text-xl font-bold text-gray-900">Khusus Admin</h1>
        <p className="mb-5 text-sm text-gray-600">
          Halaman validasi pekerjaan teknisi hanya dapat diakses oleh admin.
        </p>
        <Link to="/login" className="font-medium text-red-600 hover:underline">
          Masuk sebagai admin
        </Link>
      </section>
    );
  }

  const isLoading = loading || supportLoading;
  const pageError = error || supportError;

  return (
    <section className="mx-auto max-w-5xl">
      <header className="mb-6">
        <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-600">
          <ClipboardCheck size={17} />
          Pemeriksaan pekerjaan teknisi
        </p>
        <h1 className="text-2xl font-bold text-gray-900">Validasi Pekerjaan</h1>
        <p className="mt-2 text-gray-600">
          Periksa tiket yang telah selesai sebelum menyetujui hasil pekerjaan.
        </p>
      </header>

      {message && (
        <p role="status" className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </p>
      )}

      {isLoading ? (
        <p role="status" className="flex items-center gap-2 text-sm text-gray-600">
          <Loader2 size={18} className="animate-spin text-red-600" />
          Memuat tiket...
        </p>
      ) : pageError ? (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p>{pageError}</p>
          <button type="button" onClick={reload} className="mt-3 font-semibold underline">
            Coba muat ulang tiket
          </button>
        </div>
      ) : pendingTickets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <BadgeCheck size={30} className="mx-auto mb-3 text-emerald-600" />
          <h2 className="font-semibold text-gray-800">Tidak ada pekerjaan untuk divalidasi</h2>
          <p className="mt-1 text-sm text-gray-500">
            Tiket dengan status Selesai akan muncul di halaman ini.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {pendingTickets.map((ticket) => (
            <li
              key={ticket.id}
              className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                    #{ticket.id}
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    Selesai
                  </span>
                </div>
                <h2 className="wrap-break-word font-semibold text-gray-900">{ticket.judul || 'Tanpa judul'}</h2>
                <p className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                  <MapPin size={15} className="shrink-0" />
                  {ticket.lantai === 'Basement' ? 'Basement' : `Lantai ${ticket.lantai || '-'}`}, {ticket.ruangan || 'Ruangan tidak tersedia'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => bukaDetail(ticket)}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
              >
                <ClipboardCheck size={16} />
                Periksa Pekerjaan
              </button>
            </li>
          ))}
        </ul>
      )}

      <dialog
        ref={dialogRef}
        aria-labelledby="judul-detail-validasi"
        onCancel={(event) => {
          event.preventDefault();
          closeDialog();
        }}
        onClose={() => {
          if (selectedTicket) closeDialog();
        }}
        className="m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-3xl rounded-2xl border-0 p-0 shadow-2xl backdrop:bg-black/50"
      >
        {selectedTicket && (
          <div className="max-h-[90vh] overflow-y-auto bg-white">
            <header className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-gray-200 bg-white px-5 py-4 sm:px-7">
              <div>
                <p className="mb-1 text-xs font-semibold text-red-600">#{selectedTicket.id}</p>
                <h2 id="judul-detail-validasi" className="text-xl font-bold text-gray-900">
                  Detail Pekerjaan
                </h2>
              </div>
              <button
                type="button"
                onClick={closeDialog}
                aria-label="Tutup detail"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              >
                <X size={20} />
              </button>
            </header>

            <div className="space-y-5 px-5 py-5 sm:px-7">
              <section>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="text-lg font-bold text-gray-900">{selectedTicket.judul || 'Tanpa judul'}</h3>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                    Selesai
                  </span>
                </div>
                <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="font-medium text-gray-500">Pelapor</dt>
                    <dd className="mt-1 text-gray-900">
                      {users.find((user) => String(user.id) === String(selectedTicket.userId))?.name || selectedTicket.namaPelapor || 'Tidak diketahui'}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Teknisi</dt>
                    <dd className="mt-1 text-gray-900">
                      {users.find((user) => String(user.id) === String(assignments[String(selectedTicket.id)]?.technicianId))?.name || 'Belum tersedia'}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Tanggal laporan</dt>
                    <dd className="mt-1 flex items-center gap-2 text-gray-900">
                      <CalendarDays size={15} className="text-gray-400" />
                      {formatTanggal(selectedTicket.tanggal)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500">Lokasi</dt>
                    <dd className="mt-1 flex items-center gap-2 text-gray-900">
                      <MapPin size={15} className="text-gray-400" />
                      {selectedTicket.lantai === 'Basement' ? 'Basement' : `Lantai ${selectedTicket.lantai || '-'}`}, {selectedTicket.ruangan || 'Ruangan tidak tersedia'}
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="grid gap-4 sm:grid-cols-2">
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-800">Deskripsi kerusakan</h3>
                  <p className="min-h-24 whitespace-pre-wrap rounded-lg border border-gray-200 p-3 text-sm text-gray-700">
                    {selectedTicket.deskripsi || 'Tidak ada deskripsi.'}
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-800">Bukti laporan</h3>
                  <div className="min-h-24 rounded-lg border border-gray-200 p-3 text-sm text-gray-700">
                    {gambarValid(selectedTicket.gambarBukti) ? (
                      <img
                        src={selectedTicket.gambarBukti}
                        alt={`Bukti kerusakan ${selectedTicket.judul}`}
                        className="max-h-48 rounded-lg object-contain"
                      />
                    ) : (
                      <span className="flex items-center gap-2">
                        <ImageIcon size={16} className="text-gray-400" />
                        {selectedTicket.namaFileBukti || 'Tidak ada foto'}
                      </span>
                    )}
                  </div>
                </div>
              </section>

              <section className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                <h3 className="font-semibold text-gray-900">Dokumentasi pekerjaan teknisi</h3>
                {documentation[String(selectedTicket.id)] ? (
                  <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <dt className="font-medium text-gray-500">Catatan perbaikan</dt>
                      <dd className="mt-1 whitespace-pre-wrap text-gray-800">
                        {documentation[String(selectedTicket.id)].catatan || 'Tidak ada catatan.'}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-500">Tanggal dokumentasi</dt>
                      <dd className="mt-1 text-gray-800">
                        {formatTanggal(documentation[String(selectedTicket.id)].tanggal)}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-500">Foto hasil perbaikan</dt>
                      <dd className="mt-1 break-all text-gray-800">
                        {documentation[String(selectedTicket.id)].namaFileFoto || 'Tidak ada foto'}
                      </dd>
                    </div>
                  </dl>
                ) : (
                  <p className="mt-2 text-sm text-gray-600">Dokumentasi pekerjaan belum tersedia.</p>
                )}
              </section>

              {selectedTicket.alasanPenolakan && (
                <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  Alasan penolakan sebelumnya: {selectedTicket.alasanPenolakan}
                </p>
              )}

              {actionError && (
                <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {actionError}
                </p>
              )}

              {askingForReason && (
                <div>
                  <label htmlFor="alasan-penolakan" className="mb-2 block text-sm font-semibold text-gray-800">
                    Alasan penolakan <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    id="alasan-penolakan"
                    rows={3}
                    required
                    autoFocus
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    placeholder="Jelaskan bagian pekerjaan yang perlu diperbaiki..."
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  />
                </div>
              )}

              <footer className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:justify-end">
                {askingForReason ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setAskingForReason(false);
                        setActionError('');
                      }}
                      className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                      Kembali
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!reason.trim()) {
                          setActionError('Alasan penolakan wajib diisi.');
                          return;
                        }
                        ubahStatusTiket('Diproses', reason.trim());
                      }}
                      disabled={!reason.trim()}
                      className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                    >
                      Tolak Pekerjaan
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setAskingForReason(true)}
                      className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50"
                    >
                      Tolak Pekerjaan
                    </button>
                    <button
                      type="button"
                      onClick={() => ubahStatusTiket('Tervalidasi')}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
                    >
                      <CheckCircle2 size={17} />
                      Validasi
                    </button>
                  </>
                )}
              </footer>
            </div>
          </div>
        )}
      </dialog>
    </section>
  );
}
