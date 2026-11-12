import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, MapPin } from 'lucide-react';
import { fetchData } from '../utils/api';

const claimedUrl = new URL('../data/claimedTickets.json', import.meta.url).href;

export default function AdminPenugasan() {
  const [admin, setAdmin] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [penugasan, setPenugasan] = useState([]);
  const [teknisi, setTeknisi] = useState([]);
  const [pilihan, setPilihan] = useState({}); // teknisi yang dipilih tiap tiket
  const [pesan, setPesan] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function ambilData() {
      try {
        const [claimed, dataTiket, users] = await Promise.all([
          fetchData(claimedUrl),
          fetchData('tickets'),
          fetchData('users'),
        ]);

        const tiketBaru = JSON.parse(localStorage.getItem('tult_tickets') || '[]');
        const statusBaru = JSON.parse(localStorage.getItem('tult_ticket_status') || '{}');
        const dariAdmin = Object.values(JSON.parse(localStorage.getItem('tult_assignments') || '{}'));

        setAdmin(JSON.parse(localStorage.getItem('activeUser')));
        setTeknisi(users.filter((u) => u.role === 'teknisi'));
        setPenugasan([...claimed.filter((c) => !dariAdmin.some((d) => d.ticketId === c.ticketId)), ...dariAdmin]);
        setTickets(
          [...dataTiket, ...tiketBaru]
            .map((t) => ({ ...t, status: statusBaru[t.id] ?? t.status }))
            .filter((t) => t.status !== 'Selesai') // tiket selesai tidak perlu ditugaskan
            .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
        );
      } catch (err) {
        setError('Gagal memuat data. Pastikan file JSON ada di folder src/data.');
      } finally {
        setIsLoading(false);
      }
    }
    ambilData();
  }, []);

  const namaTeknisi = (ticketId) => {
    const p = penugasan.find((item) => item.ticketId === ticketId);
    return p ? teknisi.find((t) => t.id === p.technicianId)?.name : null;
  };

  const tugaskan = (ticket) => {
    const technicianId = pilihan[ticket.id];

    // Simpan penugasan
    const tersimpan = JSON.parse(localStorage.getItem('tult_assignments') || '{}');
    tersimpan[ticket.id] = { ticketId: ticket.id, technicianId, claimedAt: new Date().toISOString() };
    localStorage.setItem('tult_assignments', JSON.stringify(tersimpan));

    // Tiket yang sudah ditugaskan otomatis berstatus Diproses
    const status = JSON.parse(localStorage.getItem('tult_ticket_status') || '{}');
    status[ticket.id] = 'Diproses';
    localStorage.setItem('tult_ticket_status', JSON.stringify(status));

    setPenugasan((prev) => [
      ...prev.filter((p) => p.ticketId !== ticket.id),
      tersimpan[ticket.id],
    ]);
    setTickets((prev) => prev.map((t) => (t.id === ticket.id ? { ...t, status: 'Diproses' } : t)));
    setPesan(`Tiket ${ticket.id} ditugaskan kepada ${teknisi.find((t) => t.id === technicianId).name}.`);
  };

  if (isLoading) {
    return (
      <p role="status" className="flex items-center gap-2 text-gray-600">
        <Loader2 size={18} className="animate-spin text-red-600" /> Memuat tiket...
      </p>
    );
  }

  if (error) {
    return <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>;
  }

  if (admin?.role !== 'admin') {
    return (
      <p className="text-sm text-gray-600">
        Halaman ini hanya untuk admin. <Link to="/login" className="font-medium text-red-600 hover:underline">Login sebagai admin</Link>
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h2 className="mb-2 text-2xl font-bold text-gray-800">Penugasan Teknisi</h2>
      <p className="mb-6 text-gray-600">Pilih teknisi yang akan mengerjakan tiap laporan.</p>

      {pesan && (
        <p role="status" className="mb-5 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {pesan}
        </p>
      )}

      <ul className="space-y-4">
        {tickets.map((ticket) => {
          const nama = namaTeknisi(ticket.id);
          return (
            <li key={ticket.id} className="rounded-xl border border-gray-200 bg-white p-5">
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">#{ticket.id}</span>
                <span className="text-xs font-medium text-gray-500">{ticket.status}</span>
              </div>
              <h3 className="font-semibold text-gray-800">{ticket.judul}</h3>
              <p className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                <MapPin size={16} className="text-gray-400" />
                {ticket.lantai === 'Basement' ? 'Basement' : `Lantai ${ticket.lantai}`}, {ticket.ruangan}
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Teknisi: <strong>{nama || 'Belum ditugaskan'}</strong>
              </p>

              <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                <select
                  aria-label={`Pilih teknisi untuk tiket ${ticket.id}`}
                  value={pilihan[ticket.id] ?? ''}
                  onChange={(e) => setPilihan({ ...pilihan, [ticket.id]: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 sm:flex-1"
                >
                  <option value="">Pilih teknisi</option>
                  {teknisi.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => tugaskan(ticket)}
                  disabled={!pilihan[ticket.id]}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                >
                  {nama ? 'Ganti Teknisi' : 'Tugaskan'}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}