
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import useTickets from '../hooks/useTickets';
import StatusBadge from '../components/StatusBadge';
import LoadingError from '../components/LoadingError';

const statusBerikutnya = {
  Menunggu: 'Diproses',
  Diproses: 'Selesai',
};

const namaTombol = {
  Menunggu: 'Mulai Proses',
  Diproses: 'Tandai Selesai',
};

function namaPelapor(tiket) {
  const nama =
    tiket.namaPelapor ||
    tiket.userName ||
    tiket.namaUser ||
    tiket.pelapor?.name ||
    tiket.pelapor?.nama;

  if (nama) return nama;

  if (tiket.userId !== undefined && tiket.userId !== null) {
    return `User ID: ${tiket.userId}`;
  }

  return 'Belum tersedia';
}

function gambarValid(gambar) {
  return (
    typeof gambar === 'string' &&
    /^data:image\/(png|jpeg|jpg|webp|gif);base64,/i.test(gambar)
  );
}

function BuktiFoto({ tiket, onLihatFoto }) {
  const gambar = tiket.gambarBukti;

  if (!gambarValid(gambar)) {
    return (
      <span className="text-xs text-gray-500">
        {tiket.namaFileBukti &&
        tiket.namaFileBukti !== 'Tidak ada file'
          ? 'Foto belum tersedia'
          : 'Tidak ada foto'}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onLihatFoto(tiket)}
      className="inline-block text-left rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
      aria-label={`Lihat foto kerusakan ${tiket.judul}`}
    >
      <img
        src={gambar}
        alt={`Bukti kerusakan ${tiket.judul}`}
        className="w-24 h-20 object-cover rounded-lg border border-gray-200 hover:opacity-80"
      />

      <span className="block text-xs text-red-600 mt-1">
        Lihat Foto
      </span>
    </button>
  );
}

export default function TeknisiTickets() {
  const {
    tickets,
    loading,
    error,
    reload,
    ubahStatus,
  } = useTickets();

  const [pencarian, setPencarian] = useState('');
  const [filter, setFilter] = useState('Semua');
  const [pesan, setPesan] = useState('');
  const [tiketDipilih, setTiketDipilih] = useState(null);
  const [tiketFoto, setTiketFoto] = useState(null);

  const dialogStatusRef = useRef(null);
  const dialogFotoRef = useRef(null);

  useEffect(() => {
    const dialog = dialogStatusRef.current;

    if (!dialog) return;

    if (tiketDipilih) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [tiketDipilih]);

  useEffect(() => {
    const dialog = dialogFotoRef.current;

    if (!dialog) return;

    if (tiketFoto) {
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [tiketFoto]);

  const hasilFilter = tickets.filter((tiket) => {
    const kataKunci = pencarian.toLowerCase().trim();

    const cocokPencarian =
      String(tiket.id).toLowerCase().includes(kataKunci) ||
      String(tiket.judul || '').toLowerCase().includes(kataKunci) ||
      namaPelapor(tiket).toLowerCase().includes(kataKunci);

    const cocokStatus =
      filter === 'Semua' || tiket.status === filter;

    return cocokPencarian && cocokStatus;
  });

  function bukaKonfirmasi(tiket) {
    setPesan('');
    setTiketDipilih(tiket);
  }

  function tutupKonfirmasi() {
    setTiketDipilih(null);
  }

  function konfirmasiStatus() {
    if (!tiketDipilih) return;

    const tiketTerbaru = tickets.find(
      (item) => String(item.id) === String(tiketDipilih.id)
    );

    const statusBaru = statusBerikutnya[tiketTerbaru?.status];

    if (!statusBaru) {
      setPesan('Status tiket tidak dapat diubah.');
      tutupKonfirmasi();
      return;
    }

    const berhasil = ubahStatus(tiketTerbaru.id, statusBaru);

    if (berhasil) {
      setPesan(
        `Status tiket ${tiketTerbaru.id} berhasil diubah menjadi ${statusBaru}.`
      );
    } else {
      setPesan('Gagal mengubah status tiket.');
    }

    tutupKonfirmasi();
  }

  function bukaFoto(tiket) {
    setTiketFoto(tiket);
  }

  function tutupFoto() {
    setTiketFoto(null);
  }

  function tombolAksi(tiket) {
    if (!statusBerikutnya[tiket.status]) {
      return (
        <span className="text-sm text-gray-500">
          Sudah selesai
        </span>
      );
    }

    return (
      <button
        type="button"
        onClick={() => bukaKonfirmasi(tiket)}
        className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
        aria-label={`${namaTombol[tiket.status]} untuk tiket ${tiket.judul}`}
      >
        {namaTombol[tiket.status]}
      </button>
    );
  }

  return (
    <section className="max-w-7xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Daftar Tiket Teknisi
        </h1>

        <p className="text-gray-600">
          Kelola laporan kerusakan fasilitas TULT.
        </p>
      </header>

      <div className="bg-white border border-gray-200 rounded-xl p-4 mb-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="cari-tiket"
            className="block text-sm font-medium mb-2"
          >
            Cari Tiket
          </label>

          <input
            id="cari-tiket"
            type="search"
            value={pencarian}
            onChange={(e) => setPencarian(e.target.value)}
            placeholder="Cari judul, ID, atau pelapor"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div>
          <label
            htmlFor="filter-status"
            className="block text-sm font-medium mb-2"
          >
            Filter Status
          </label>

          <select
            id="filter-status"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="Semua">Semua Status</option>
            <option value="Menunggu">Menunggu</option>
            <option value="Diproses">Diproses</option>
            <option value="Selesai">Selesai</option>
          </select>
        </div>
      </div>

      {pesan && (
        <p
          role="status"
          className={`mb-4 border p-4 rounded-lg ${
            pesan.startsWith('Gagal') ||
            pesan.includes('tidak dapat')
              ? 'bg-red-50 text-red-800 border-red-200'
              : 'bg-green-50 text-green-800 border-green-200'
          }`}
        >
          {pesan}
        </p>
      )}

      <LoadingError
        loading={loading}
        error={error}
        onRetry={reload}
      />

      {!loading && !error && hasilFilter.length === 0 && (
        <p
          role="status"
          className="bg-white border rounded-xl p-6 text-center text-gray-600"
        >
          Tidak ada tiket yang sesuai dengan pencarian.
        </p>
      )}

      {!loading && !error && hasilFilter.length > 0 && (
        <>
          <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-x-auto">
            <table className="w-full min-w-[950px] text-left">
              <caption className="sr-only">
                Daftar tiket teknisi dan bukti kerusakan
              </caption>

              <thead className="bg-gray-100 text-sm text-gray-700">
                <tr>
                  <th scope="col" className="p-4">ID</th>
                  <th scope="col" className="p-4">Judul</th>
                  <th scope="col" className="p-4">Pelapor</th>
                  <th scope="col" className="p-4">Lokasi</th>
                  <th scope="col" className="p-4">Tanggal</th>
                  <th scope="col" className="p-4">Bukti Foto</th>
                  <th scope="col" className="p-4">Status</th>
                  <th scope="col" className="p-4">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {hasilFilter.map((tiket) => (
                  <tr
                    key={tiket.id}
                    className="border-t border-gray-200 hover:bg-gray-50"
                  >
                    <td className="p-4">
                      {tiket.id}
                    </td>

                    <td className="p-4">
                      <Link
                        to={`/ticket/${encodeURIComponent(tiket.id)}`}
                        state={{ from: 'teknisi' }}
                        className="text-red-600 font-semibold hover:underline"
                      >
                        {tiket.judul}
                      </Link>
                    </td>

                    <td className="p-4">
                      {namaPelapor(tiket)}
                    </td>

                    <td className="p-4">
                      {tiket.lantai}, {tiket.ruangan}
                    </td>

                    <td className="p-4">
                      {tiket.tanggal}
                    </td>

                    <td className="p-4">
                      <BuktiFoto
                        tiket={tiket}
                        onLihatFoto={bukaFoto}
                      />
                    </td>

                    <td className="p-4">
                      <StatusBadge status={tiket.status} />
                    </td>

                    <td className="p-4">
                      {tombolAksi(tiket)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden space-y-4">
            {hasilFilter.map((tiket) => (
              <article
                key={tiket.id}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
              >
                <div className="flex justify-between items-center gap-3 mb-3">
                  <p className="text-sm text-gray-500">
                    #{tiket.id}
                  </p>

                  <StatusBadge status={tiket.status} />
                </div>

                <h2 className="text-lg font-bold mb-3">
                  <Link
                    to={`/ticket/${encodeURIComponent(tiket.id)}`}
                    state={{ from: 'teknisi' }}
                    className="text-red-600 hover:underline"
                  >
                    {tiket.judul}
                  </Link>
                </h2>

                <dl className="text-sm space-y-3 mb-4">
                  <div>
                    <dt className="font-semibold">Pelapor</dt>
                    <dd>{namaPelapor(tiket)}</dd>
                  </div>

                  <div>
                    <dt className="font-semibold">Lokasi</dt>
                    <dd>
                      {tiket.lantai}, {tiket.ruangan}
                    </dd>
                  </div>

                  <div>
                    <dt className="font-semibold">Tanggal</dt>
                    <dd>{tiket.tanggal}</dd>
                  </div>

                  <div>
                    <dt className="font-semibold mb-2">
                      Bukti Kerusakan
                    </dt>

                    <dd>
                      <BuktiFoto
                        tiket={tiket}
                        onLihatFoto={bukaFoto}
                      />
                    </dd>
                  </div>
                </dl>

                {tombolAksi(tiket)}
              </article>
            ))}
          </div>
        </>
      )}

      <dialog
        ref={dialogStatusRef}
        onClose={tutupKonfirmasi}
        aria-labelledby="judul-konfirmasi"
        aria-describedby="isi-konfirmasi"
        className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-xl p-6 shadow-2xl backdrop:bg-black/50"
      >
        <h2
          id="judul-konfirmasi"
          className="text-xl font-bold text-gray-800 mb-3"
        >
          Konfirmasi Perubahan Status
        </h2>

        <p
          id="isi-konfirmasi"
          className="text-gray-600 mb-6"
        >
          Apakah kamu yakin ingin mengubah status tiket{' '}
          <strong>{tiketDipilih?.judul}</strong> dari{' '}
          <strong>{tiketDipilih?.status}</strong> menjadi{' '}
          <strong>
            {statusBerikutnya[tiketDipilih?.status] || '-'}
          </strong>
          ?
        </p>

        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={tutupKonfirmasi}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={konfirmasiStatus}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
          >
            Ya, Ubah Status
          </button>
        </div>
      </dialog>

      <dialog
        ref={dialogFotoRef}
        onClose={tutupFoto}
        aria-labelledby="judul-foto"
        className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl p-4 sm:p-6 shadow-2xl backdrop:bg-black/70"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2
              id="judul-foto"
              className="text-xl font-bold text-gray-800"
            >
              Bukti Kerusakan
            </h2>

            <p className="text-sm text-gray-600 mt-1">
              {tiketFoto?.judul}
            </p>
          </div>

          <button
            type="button"
            onClick={tutupFoto}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
          >
            Tutup
          </button>
        </div>

        {tiketFoto && gambarValid(tiketFoto.gambarBukti) && (
          <div>
            <img
              src={tiketFoto.gambarBukti}
              alt={`Bukti kerusakan ${tiketFoto.judul}`}
              className="w-full max-h-[65vh] object-contain rounded-lg bg-gray-100"
            />

            <p className="text-sm text-gray-500 mt-3 break-all">
              {tiketFoto.namaFileBukti || 'Foto kerusakan'}
            </p>
          </div>
        )}
      </dialog>
    </section>
  );
}
