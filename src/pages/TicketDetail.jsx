
import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { CalendarDays, Image as ImageIcon } from 'lucide-react';

import { fetchData } from '../utils/api';
import useTickets from '../hooks/useTickets';
import StatusBadge from '../components/StatusBadge';
import LoadingError from '../components/LoadingError';

function formatTanggal(value) {
  if (!value) return 'Tanggal tidak tersedia';

  const tanggal = new Date(`${value}T00:00:00`);

  if (Number.isNaN(tanggal.getTime())) {
    return value;
  }

  return tanggal.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function keteranganStatus(status) {
  if (status === 'Menunggu') {
    return 'Laporan sudah diterima dan sedang menunggu penanganan teknisi.';
  }

  if (status === 'Diproses') {
    return 'Laporan sedang dalam proses penanganan oleh teknisi.';
  }

  if (status === 'Selesai') {
    return 'Kerusakan telah selesai ditangani oleh teknisi.';
  }

  if (status === 'Tervalidasi') {
    return 'Hasil pekerjaan teknisi telah diperiksa dan disetujui admin.';
  }

  return 'Informasi perkembangan laporan belum tersedia.';
}

function ambilGambar(tiket) {
  const gambar = tiket?.gambarBukti;

  if (
    typeof gambar === 'string' &&
    /^data:image\/(png|jpeg|webp|gif);base64,/i.test(gambar)
  ) {
    return gambar;
  }

  return null;
}

export default function TicketDetail() {
  const { id } = useParams();
  const location = useLocation();

  const { tickets, loading, error, reload } = useTickets();

  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [errorUser, setErrorUser] = useState('');
  const [lihatFoto, setLihatFoto] = useState(false);

  const dariTeknisi = location.state?.from === 'teknisi';

  const halamanKembali = dariTeknisi
    ? '/teknisi'
    : '/history';

  useEffect(() => {
    let aktif = true;

    async function ambilPengguna() {
      setLoadingUser(true);
      setErrorUser('');

      try {
        const users = await fetchData('users');

        if (!Array.isArray(users)) {
          throw new Error('Format data pengguna tidak valid.');
        }

        const savedUserValue = localStorage.getItem('activeUser');

        const savedUser = savedUserValue
          ? JSON.parse(savedUserValue)
          : null;

        const pengguna =
          savedUser ||
          users.find((user) => user.role === 'mahasiswa') ||
          users[0];

        if (!pengguna?.id) {
          throw new Error('Data pengguna aktif tidak ditemukan.');
        }

        if (aktif) {
          setCurrentUser(pengguna);
        }
      } catch (err) {
        if (aktif) {
          setErrorUser(
            err instanceof Error
              ? err.message
              : 'Gagal mengambil data pengguna.'
          );
        }
      } finally {
        if (aktif) {
          setLoadingUser(false);
        }
      }
    }

    ambilPengguna();

    return () => {
      aktif = false;
    };
  }, []);

  useEffect(() => {
    setLihatFoto(false);
  }, [id]);

  const tiket = tickets.find(
    (item) => String(item.id) === String(id)
  );

  const bolehMelihat =
    currentUser?.role !== 'mahasiswa' ||
    String(tiket?.userId) === String(currentUser?.id);

  const tiketDitampilkan =
    tiket && currentUser && bolehMelihat
      ? tiket
      : null;

  const gambar = ambilGambar(tiketDitampilkan);

  const sedangMemuat = loading || loadingUser;
  const pesanError = error || errorUser;

  return (
    <section className="max-w-3xl mx-auto">
      <Link
        to={halamanKembali}
        className="inline-flex items-center text-sm font-medium text-red-600 hover:underline mb-5"
      >
        &larr;{' '}
        {dariTeknisi
          ? 'Kembali ke Daftar Teknisi'
          : 'Kembali ke Riwayat Tiket'}
      </Link>

      <LoadingError
        loading={sedangMemuat}
        error={pesanError}
        onRetry={() => {
          if (errorUser) {
            window.location.reload();
          } else {
            reload();
          }
        }}
      />

      {!sedangMemuat && !pesanError && !tiketDitampilkan && (
        <div
          role="alert"
          className="bg-white border border-gray-200 rounded-xl p-8 text-center"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-3">
            Tiket Tidak Ditemukan
          </h2>

          <p className="text-gray-600 mb-5">
            Tiket tidak tersedia atau tidak dapat diakses
            oleh akun yang sedang digunakan.
          </p>

          <Link
            to={halamanKembali}
            className="text-red-600 font-medium hover:underline"
          >
            Kembali
          </Link>
        </div>
      )}

      {!sedangMemuat && !pesanError && tiketDitampilkan && (
        <article className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 sm:p-6">
          <header className="mb-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-red-600 mb-2">
                  #{tiketDitampilkan.id}
                </p>

                <h1 className="text-2xl font-bold text-gray-800 wrap-break-word">
                  {tiketDitampilkan.judul || 'Tanpa Judul'}
                </h1>

                <p className="flex items-center gap-2 text-sm text-gray-500 mt-3">
                  <CalendarDays size={16} />
                  Dibuat pada {formatTanggal(tiketDitampilkan.tanggal)}
                </p>
              </div>

              <StatusBadge status={tiketDitampilkan.status} />
            </div>
          </header>

          <section
            aria-labelledby="judul-perkembangan"
            className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6"
          >
            <h2
              id="judul-perkembangan"
              className="font-bold text-gray-800 mb-3"
            >
              Perkembangan Laporan
            </h2>

            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="text-sm text-gray-700">
                Status saat ini:
              </span>

              <StatusBadge status={tiketDitampilkan.status} />
            </div>

            <p className="text-sm text-gray-600">
              {keteranganStatus(tiketDitampilkan.status)}
            </p>
          </section>

          <section aria-labelledby="judul-informasi">
            <h2
              id="judul-informasi"
              className="font-bold text-gray-800 mb-4"
            >
              Informasi Laporan
            </h2>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-semibold text-gray-700 mb-2">
                  Lantai
                </dt>

                <dd className="border border-gray-200 rounded-lg px-3 py-3">
                  {tiketDitampilkan.lantai || '-'}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-semibold text-gray-700 mb-2">
                  Ruangan
                </dt>

                <dd className="border border-gray-200 rounded-lg px-3 py-3 wrap-break-word">
                  {tiketDitampilkan.ruangan || '-'}
                </dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-sm font-semibold text-gray-700 mb-2">
                  Deskripsi Kerusakan
                </dt>

                <dd className="border border-gray-200 rounded-lg p-3 whitespace-pre-wrap">
                  {tiketDitampilkan.deskripsi ||
                    'Tidak ada deskripsi.'}
                </dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-sm font-semibold text-gray-700 mb-2">
                  Bukti Kerusakan
                </dt>

                <dd className="border border-gray-200 rounded-lg p-4">
                  {gambar ? (
                    <div>
                      <button
                        type="button"
                        onClick={() => setLihatFoto(true)}
                        className="text-left rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                        aria-label={`Lihat foto kerusakan ${tiketDitampilkan.judul}`}
                      >
                        <img
                          src={gambar}
                          alt={`Foto kerusakan ${tiketDitampilkan.judul}`}
                          className="w-full max-w-md max-h-80 object-contain rounded-lg border border-gray-200 hover:opacity-90"
                        />

                        <span className="block mt-2 text-sm font-medium text-red-600">
                          Lihat Foto
                        </span>
                      </button>

                      <p className="mt-3 text-sm text-gray-500 break-all">
                        {tiketDitampilkan.namaFileBukti ||
                          'Foto kerusakan'}
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <ImageIcon
                        size={22}
                        className="text-gray-400 shrink-0"
                      />

                      <div>
                        <p className="text-sm text-gray-700 break-all">
                          {tiketDitampilkan.namaFileBukti ||
                            'Tidak ada foto'}
                        </p>

                        <p className="text-xs text-gray-500 mt-2">
                          {tiketDitampilkan.namaFileBukti &&
                          tiketDitampilkan.namaFileBukti !==
                            'Tidak ada file'
                            ? 'File bukti tercatat, tetapi gambar belum tersedia untuk ditampilkan.'
                            : 'Belum ada foto bukti kerusakan.'}
                        </p>
                      </div>
                    </div>
                  )}
                </dd>
              </div>
            </dl>
          </section>

          <footer className="mt-6 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Status laporan mengikuti perkembangan penanganan
              yang dicatat oleh teknisi.
            </p>
          </footer>
        </article>
      )}

      {lihatFoto && gambar && tiketDitampilkan && (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4"
          onClick={() => setLihatFoto(false)}
          role="presentation"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Preview bukti kerusakan"
            className="bg-white rounded-xl p-4 sm:p-5 max-w-3xl w-full shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="font-bold text-gray-800 text-lg">
                  Bukti Kerusakan
                </h2>

                <p className="text-sm text-gray-600 mt-1">
                  {tiketDitampilkan.judul}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setLihatFoto(false)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Tutup
              </button>
            </div>

            <img
              src={gambar}
              alt={`Bukti kerusakan ${tiketDitampilkan.judul}`}
              className="w-full max-h-[70vh] object-contain rounded-lg bg-gray-100"
            />
          </div>
        </div>
      )}
    </section>
  );
}
