import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Loader2,
  MapPin,
  Paperclip,
  RefreshCw,
  RotateCcw,
} from 'lucide-react';
import { fetchData } from '../utils/api';

const claimedUrl = new URL('../data/claimedTickets.json', import.meta.url).href;
const ticketStorageKey = 'tult_tickets';
const statusStorageKey = 'tult_ticket_status';
const rejectionReasonStorageKey = 'tult_ticket_rejection_reasons';
const docStorageKey = 'tult_ticket_docs';

function formatTanggal(value) {
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp)
    ? 'Tanggal tidak tersedia'
    : new Date(timestamp).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
}

function getStatusStyle(status) {
  if (status === 'Tervalidasi') return 'bg-violet-100 text-violet-800 ring-violet-200';
  if (status === 'Selesai') return 'bg-emerald-100 text-emerald-800 ring-emerald-200';
  if (status === 'Diproses') return 'bg-blue-100 text-blue-800 ring-blue-200';
  return 'bg-amber-100 text-amber-800 ring-amber-200';
}

// Baca dan simpan data kecil di localStorage
function bacaStorage(key) {
  return JSON.parse(localStorage.getItem(key) || '{}');
}
function simpanStorage(key, nilai) {
  localStorage.setItem(key, JSON.stringify(nilai));
}

export default function TeknisiTaskDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [dokumentasi, setDokumentasi] = useState(null);
  const [catatan, setCatatan] = useState('');
  const [foto, setFoto] = useState(null);
  const [pesan, setPesan] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [notFound, setNotFound] = useState(false);

  const loadTicket = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');
    setNotFound(false);

    try {
      const [claimed, fetchedTickets, users] = await Promise.all([
        fetchData(claimedUrl),
        fetchData('tickets'),
        fetchData('users'),
      ]);

      const activeUser = JSON.parse(localStorage.getItem('activeUser'));

      // Tiket hanya boleh dibuka teknisi yang mengklaimnya
      const klaim = claimed.find((c) => c.ticketId === id && c.technicianId === activeUser?.id);
      const localTickets = JSON.parse(localStorage.getItem(ticketStorageKey) || '[]');
      const found = [...fetchedTickets, ...localTickets].find((t) => t.id === id);
      const alasanPenolakan = bacaStorage(rejectionReasonStorageKey)[id] || '';

      if (activeUser?.role !== 'teknisi' || !klaim || !found) {
        setNotFound(true);
        return;
      }

      const pelapor = users.find((u) => u.id === found.userId);
      const docTersimpan = bacaStorage(docStorageKey)[id] || null;

      setTicket({
        ...found,
        status: bacaStorage(statusStorageKey)[id] ?? found.status,
        alasanPenolakan,
        claimedAt: klaim.claimedAt,
        pelapor: pelapor ? pelapor.name : 'Tidak diketahui',
      });
      setDokumentasi(docTersimpan);
      setCatatan(docTersimpan?.catatan || '');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat tugas.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTicket();
  }, [loadTicket]);

  // Simpan catatan dan nama file foto sebagai dokumentasi
  const simpanDokumentasi = (e) => {
    e.preventDefault();

    const dokumentasiBaru = {
      catatan: catatan.trim(),
      namaFileFoto: foto ? foto.name : dokumentasi?.namaFileFoto,
      tanggal: new Date().toISOString().slice(0, 10),
    };

    const semuaDokumentasi = bacaStorage(docStorageKey);
    semuaDokumentasi[id] = dokumentasiBaru;
    simpanStorage(docStorageKey, semuaDokumentasi);

    setDokumentasi(dokumentasiBaru);
    setPesan('Dokumentasi berhasil disimpan.');
  };

  // Ubah status tiket, lalu simpan supaya tidak hilang saat halaman dimuat ulang
  const ubahStatus = (statusBaru) => {
    const semuaStatus = bacaStorage(statusStorageKey);
    semuaStatus[id] = statusBaru;
    simpanStorage(statusStorageKey, semuaStatus);

    const semuaAlasan = bacaStorage(rejectionReasonStorageKey);
    if (statusBaru === 'Selesai') delete semuaAlasan[id];
    simpanStorage(rejectionReasonStorageKey, semuaAlasan);

    setTicket((prev) => ({
      ...prev,
      status: statusBaru,
      alasanPenolakan: statusBaru === 'Selesai' ? '' : prev.alasanPenolakan,
    }));
    setPesan(`Status diubah menjadi ${statusBaru}.`);
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-600">
        <Loader2 size={26} className="mx-auto mb-3 animate-spin text-red-600" />
        Memuat tugas...
      </div>
    );
  }

  if (errorMessage || notFound || !ticket) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className={`rounded-xl border bg-white p-8 text-center ${errorMessage ? 'border-red-200' : 'border-gray-200'}`}>
          {errorMessage ? (
            <>
              <AlertTriangle size={26} className="mx-auto mb-3 text-red-600" />
              <h2 className="mb-2 text-lg font-bold text-gray-800">Gagal Memuat Tugas</h2>
              <p role="alert" className="mb-5 text-sm text-gray-600">{errorMessage}</p>
              <button
                type="button"
                onClick={loadTicket}
                className="mb-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                <RefreshCw size={16} />
                Coba Lagi
              </button>
            </>
          ) : (
            <>
              <h2 className="mb-2 text-2xl font-bold text-gray-800">Tugas tidak ditemukan</h2>
              <p className="mb-5 text-sm text-gray-600">
                Tugas ini tidak tersedia atau bukan diklaim oleh akun teknisi yang sedang digunakan.
              </p>
            </>
          )}
          <Link to="/teknisi" className="text-sm font-medium text-red-600 hover:underline">
            Kembali ke daftar tugas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link to="/teknisi" className="text-sm font-medium text-red-600 hover:underline">
        &larr; Kembali ke daftar tugas
      </Link>

      {/* Info tiket */}
      <article className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold text-red-600">#{ticket.id}</p>
            <h1 className="wrap-break-word text-2xl font-bold text-gray-800">{ticket.judul}</h1>
            <p className="mt-1 text-sm text-gray-500">Dilaporkan oleh {ticket.pelapor}</p>
          </div>
          <span className={`inline-flex w-fit shrink-0 rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ring-inset ${getStatusStyle(ticket.status)}`}>
            {ticket.status}
          </span>
        </div>

        <div className="mb-4 flex flex-col gap-1.5 text-sm text-gray-600">
          <div className="flex items-center gap-2.5">
            <MapPin size={16} className="shrink-0 text-gray-400" />
            <span>
              {ticket.lantai === 'Basement' ? 'Basement' : `Lantai ${ticket.lantai}`}, {ticket.ruangan}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <CalendarDays size={16} className="shrink-0 text-gray-400" />
            <span>Diklaim pada {formatTanggal(ticket.claimedAt)}</span>
          </div>
        </div>

        <p className="text-sm font-semibold text-gray-700">Deskripsi kerusakan</p>
        <p className="mt-1 whitespace-pre-wrap rounded-lg border border-gray-200 px-3 py-2 text-sm">
          {ticket.deskripsi}
        </p>
      </article>

      {pesan && (
        <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {pesan}
        </p>
      )}

      {/* Dokumentasi */}
      <form onSubmit={simpanDokumentasi} className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-bold text-gray-800">Dokumentasi Pekerjaan</h2>

        <div>
          <label htmlFor="catatan" className="mb-1 block text-sm font-medium text-gray-700">
            Catatan perbaikan
          </label>
          <textarea
            id="catatan"
            required
            rows="4"
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            placeholder="Jelaskan apa yang sudah dikerjakan..."
            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div>
          <label htmlFor="foto" className="mb-1 block text-sm font-medium text-gray-700">
            Foto hasil perbaikan
          </label>
          <input
            id="foto"
            type="file"
            accept="image/*"
            required={!dokumentasi?.namaFileFoto}
            onChange={(e) => setFoto(e.target.files[0])}
            className="w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-red-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-red-700 hover:file:bg-red-100"
          />
          {dokumentasi?.namaFileFoto && (
            <p className="mt-2 flex items-center gap-2 break-all text-sm text-gray-600">
              <Paperclip size={16} className="shrink-0 text-gray-400" />
              {dokumentasi.namaFileFoto}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-red-600 px-4 py-2.5 font-medium text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Simpan Dokumentasi
        </button>
      </form>

      {/* Ubah status */}
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-3 text-lg font-bold text-gray-800">Status Tiket</h2>

        {ticket.status === 'Diproses' && ticket.alasanPenolakan && (
          <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <strong>Catatan admin:</strong> {ticket.alasanPenolakan}
          </p>
        )}

        {ticket.status === 'Tervalidasi' ? (
          <p className="rounded-lg bg-violet-50 px-4 py-3 text-sm font-medium text-violet-800">
            Pekerjaan ini telah divalidasi oleh admin.
          </p>
        ) : ticket.status === 'Diproses' ? (
          <>
            <button
              type="button"
              onClick={() => ubahStatus('Selesai')}
              disabled={!dokumentasi}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              <CheckCircle2 size={16} />
              Tandai Selesai
            </button>
            {!dokumentasi && (
              <p className="mt-2 text-xs text-gray-500">
                Simpan dokumentasi dulu sebelum menandai tiket selesai.
              </p>
            )}
          </>
        ) : (
          <button
            type="button"
            onClick={() => ubahStatus('Diproses')}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <RotateCcw size={16} />
            Buka Kembali
          </button>
        )}
      </section>
    </div>
  );
}