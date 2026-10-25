import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, CalendarDays, Paperclip } from 'lucide-react';

const dummyTickets = [
  {
    id: 'TKT-001',
    judul: 'AC ruang kelas tidak dingin',
    lantai: '3',
    ruangan: 'R.301',
    deskripsi: 'AC menyala tetapi tidak mengeluarkan udara dingin.',
    namaFileBukti: 'foto-ac-r301.jpg',
    status: 'Diproses',
    tanggal: '2026-10-20',
  },
  {
    id: 'TKT-002',
    judul: 'Lampu koridor mati',
    lantai: '2',
    ruangan: 'Koridor Barat',
    deskripsi: 'Dua lampu koridor tidak menyala sejak kemarin.',
    namaFileBukti: 'lampu-koridor.png',
    status: 'Selesai',
    tanggal: '2026-10-15',
  },
  {
    id: 'TKT-003',
    judul: 'Proyektor tidak menampilkan gambar',
    lantai: '4',
    ruangan: 'R.405',
    deskripsi: 'Proyektor menyala tetapi layar tetap kosong.',
    namaFileBukti: '',
    status: 'Menunggu',
    tanggal: '2026-10-22',
  },
  {
    id: 'TKT-004',
    judul: 'Keran air toilet bocor',
    lantai: '1',
    ruangan: 'Toilet Pria',
    deskripsi: 'Keran wastafel bocor dan air terus menetes.',
    namaFileBukti: 'keran-bocor.jpg',
    status: 'Diproses',
    tanggal: '2026-10-18',
  },
];

function formatTanggal(value) {
  return new Date(value).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function TicketHistory() {
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const tickets = dummyTickets.filter(
    (t) => t.judul.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)
  );

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Riwayat Tiket Saya</h2>
      <p className="text-gray-600 mb-6">Daftar laporan yang pernah kamu buat sebelumnya.</p>

      {/* Search bar */}
      <div className="relative mb-6">
        <Search
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari berdasarkan judul atau ID laporan"
          className="w-full bg-white border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:border-red-500"
        />
      </div>

      {/* Daftar laporan */}
      {tickets.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-xl px-6 py-12 text-center text-sm text-gray-600">
          Laporan tidak ditemukan. Coba kata kunci lain.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl divide-y divide-gray-200 overflow-hidden">
          {tickets.map((t) => (
            <Link
              key={t.id}
              to="/ticket/1"
              className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 px-5 py-4 hover:bg-red-50/40 transition-colors"
            >
              {/* Judul + ID */}
              <div className="md:flex-1 min-w-0">
                <span className="inline-block text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-md mb-2">
                  #{t.id}
                </span>
                <h3 className="text-base font-semibold text-gray-800 break-words">{t.judul}</h3>
              </div>

              {/* Info */}
              <div className="flex flex-col gap-1.5 text-sm text-gray-600 md:w-72 shrink-0">
                <div className="flex items-center gap-2.5">
                  <CalendarDays size={16} className="text-gray-400 shrink-0" />
                  <span>{formatTanggal(t.tanggal)}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin size={16} className="text-gray-400 shrink-0" />
                  <span>Lantai {t.lantai}, {t.ruangan}</span>
                </div>
                {t.namaFileBukti && (
                  <div className="flex items-center gap-2.5">
                    <Paperclip size={16} className="text-gray-400 shrink-0" />
                    <span className="break-all">{t.namaFileBukti}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
