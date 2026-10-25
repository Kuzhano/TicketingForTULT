import { useParams, Link } from 'react-router-dom';

export default function TicketDetail() {
  const { id } = useParams();

  const daftarTiket = [
    {
      id: 1,
      judul: 'AC Mati',
      lantai: 'Lantai 1',
      ruangan: 'TULT.01.04',
      deskripsi: 'AC di ruangan ini hanya mengeluarkan angin tanpa dingin sejak Senin.',
      namaFileBukti: 'foto-ac.jpg',
      status: 'Menunggu',
      tanggal: '20/10/2026',
    },
  ];

  const tiket = daftarTiket.find((t) => String(t.id) === id);

  if (!tiket) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Tiket tidak ditemukan</h2>
        <Link to="/history" className="text-red-600 hover:underline">
          Kembali ke riwayat tiket
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <Link to="/history" className="text-sm text-red-600 hover:underline">
        &larr; Kembali ke riwayat
      </Link>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-3">
        <div className="flex justify-between items-start mb-1">
          <h2 className="text-2xl font-bold text-gray-800">{tiket.judul}</h2>
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
            {tiket.status}
          </span>
        </div>
        <p className="text-gray-600 mb-6">Dibuat pada {tiket.tanggal}</p>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <p className="text-sm font-semibold text-gray-700">Lantai</p>
            <p className="border border-gray-200 rounded-lg px-3 py-2 mt-1">{tiket.lantai}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">Ruangan</p>
            <p className="border border-gray-200 rounded-lg px-3 py-2 mt-1">{tiket.ruangan}</p>
          </div>
        </div>

        <div className="mb-5">
          <p className="text-sm font-semibold text-gray-700">Deskripsi detail</p>
          <p className="border border-gray-200 rounded-lg px-3 py-2 mt-1">{tiket.deskripsi}</p>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-700">Bukti kerusakan</p>
          <p className="mt-1 text-red-600">{tiket.namaFileBukti}</p>
        </div>
      </div>
    </div>
  );
}