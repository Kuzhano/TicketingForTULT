import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CalendarDays, ChevronRight, FileCheck2, Loader2, MapPin, RefreshCw } from 'lucide-react';
import { fetchData } from '../utils/api';

const claimedUrl = new URL('../data/claimedTickets.json', import.meta.url).href;
const ticketStorageKey = 'tult_tickets';
const statusStorageKey = 'tult_ticket_status'; // status baru hasil ubahan teknisi
const docStorageKey = 'tult_ticket_docs';      // dokumentasi pekerjaan teknisi

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

export default function TicketTeknisi() {
  const [teknisi, setTeknisi] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadTickets = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const [claimed, fetchedTickets, users] = await Promise.all([
        fetchData(claimedUrl),
        fetchData('tickets'),
        fetchData('users'),
      ]);

      const activeUser = JSON.parse(localStorage.getItem('activeUser'));
      setTeknisi(activeUser);

      // Hanya teknisi yang boleh membuka halaman ini
      if (activeUser?.role !== 'teknisi') return;

      const localTickets = JSON.parse(localStorage.getItem(ticketStorageKey) || '[]');
      const statusBaru = JSON.parse(localStorage.getItem(statusStorageKey) || '{}');
      const dokumentasi = JSON.parse(localStorage.getItem(docStorageKey) || '{}');
      const allTickets = [...fetchedTickets, ...localTickets];

      // Ambil tiket yang diklaim teknisi ini, lalu gabungkan dengan data tiketnya
      const list = claimed
        .filter((c) => c.technicianId === activeUser.id)
        .map((c) => {
          const ticket = allTickets.find((t) => t.id === c.ticketId);
          if (!ticket) return null;
          const pelapor = users.find((u) => u.id === ticket.userId);
          return {
            ...ticket,
            status: statusBaru[ticket.id] ?? ticket.status,
            claimedAt: c.claimedAt,
            pelapor: pelapor ? pelapor.name : 'Tidak diketahui',
            sudahDidokumentasi: Boolean(dokumentasi[ticket.id]),
          };
        })
        .filter(Boolean);

      setTickets(list);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat tiket.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl rounded-xl border border-gray-200 bg-white px-6 py-12 text-center text-sm text-gray-600">
        <Loader2 size={24} className="mx-auto mb-3 animate-spin text-red-600" />
        Memuat tiket teknisi...
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="mx-auto max-w-4xl rounded-xl border border-red-200 bg-white px-6 py-10 text-center">
        <AlertTriangle size={24} className="mx-auto mb-3 text-red-600" />
        <p role="alert" className="mb-4 text-sm text-gray-700">{errorMessage}</p>
        <button
          type="button"
          onClick={loadTickets}
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          <RefreshCw size={16} />
          Coba Lagi
        </button>
      </div>
    );
  }

  if (teknisi?.role !== 'teknisi') {
    return (
      <div className="mx-auto max-w-4xl rounded-xl border border-gray-200 bg-white px-6 py-12 text-center text-sm text-gray-600">
        Halaman ini hanya untuk teknisi. Silakan <Link to="/login" className="font-medium text-red-600 hover:underline">login sebagai teknisi</Link>.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <h2 className="mb-2 text-2xl font-bold text-gray-800">Tugas Perbaikan</h2>
      <p className="mb-6 text-gray-600">
        Daftar tiket yang diklaim oleh {teknisi.name}. Buka tiket untuk menambahkan dokumentasi dan mengubah status.
      </p>

      {tickets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center text-sm text-gray-600">
          Kamu belum mengklaim tiket apa pun.
        </div>
      ) : (
        <ul className="overflow-hidden rounded-xl border border-gray-200 bg-white divide-y divide-gray-200">
          {tickets.map((ticket) => (
            <li key={ticket.id}>
              <Link
                to={`/teknisi/${encodeURIComponent(ticket.id)}`}
                className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-red-50/40 md:flex-row md:items-center md:gap-6"
              >
                <div className="min-w-0 md:flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                      #{ticket.id}
                    </span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusStyle(ticket.status)}`}>
                      {ticket.status}
                    </span>
                    {ticket.sudahDidokumentasi && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                        <FileCheck2 size={14} />
                        Sudah ada dokumentasi
                      </span>
                    )}
                  </div>
                  <h3 className="wrap-break-word text-base font-semibold text-gray-800">{ticket.judul}</h3>
                  <p className="mt-1 text-sm text-gray-500">Dilaporkan oleh {ticket.pelapor}</p>
                </div>

                <div className="flex shrink-0 flex-col gap-1.5 text-sm text-gray-600 md:w-72">
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

                <ChevronRight size={18} className="hidden shrink-0 text-gray-400 md:block" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}