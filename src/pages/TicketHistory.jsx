import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CalendarDays, Loader2, MapPin, Paperclip, RefreshCw, Search } from 'lucide-react';
import { fetchData } from '../utils/api';

const ticketStorageKey = 'tult_tickets';

function formatTanggal(value) {
  const timestamp = Date.parse(`${value}T00:00:00`);
  return Number.isNaN(timestamp)
    ? 'Tanggal tidak tersedia'
    : new Date(timestamp).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
}

function getStatusStyle(status) {
      if (status === 'Selesai') return 'bg-emerald-100 text-emerald-800 ring-emerald-200';
      if (status === 'Diproses') return 'bg-blue-100 text-blue-800 ring-blue-200';
      return 'bg-amber-100 text-amber-800 ring-amber-200';
}

function getStatusDotStyle(status) {
      if (status === 'Selesai') return 'bg-emerald-600';
      if (status === 'Diproses') return 'bg-blue-600';
      return 'bg-amber-600';
}

export default function TicketHistory() {
  const [query, setQuery] = useState('');
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadTickets = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const [fetchedTickets, users] = await Promise.all([
        fetchData('tickets'),
        fetchData('users'),
      ]);
      if (!Array.isArray(fetchedTickets) || !Array.isArray(users)) {
        throw new Error('Format data tiket atau pengguna tidak valid.');
      }

      const savedTicketsValue = localStorage.getItem(ticketStorageKey);
      const localTickets = savedTicketsValue ? JSON.parse(savedTicketsValue) : [];
      if (!Array.isArray(localTickets)) {
        throw new Error('Format tiket tersimpan di browser tidak valid.');
      }

      const savedUserValue = localStorage.getItem('activeUser');
      const savedUser = savedUserValue ? JSON.parse(savedUserValue) : null;
      const currentUser =
        savedUser || users.find((user) => user.role === 'mahasiswa') || users[0];
      if (!currentUser?.id) {
        throw new Error('Data pengguna aktif tidak ditemukan.');
      }

      const allTickets = [
        ...new Map(
          [...fetchedTickets, ...localTickets].map((ticket) => [ticket.id, ticket])
        ).values(),
      ];

      setTickets(
        allTickets.filter(
          (ticket) => ticket.userId === currentUser.id && currentUser.role === 'mahasiswa'
        )
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat riwayat tiket.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const filteredTickets = useMemo(() => {
    const searchTerm = query.trim().toLowerCase();
    return tickets
      .filter(
        (ticket) =>
          ticket.judul.toLowerCase().includes(searchTerm) ||
          ticket.id.toLowerCase().includes(searchTerm)
      )
      .sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  }, [query, tickets]);

  return (
    <div className="mx-auto max-w-4xl">
      <h2 className="mb-2 text-2xl font-bold text-gray-800">Riwayat Tiket Saya</h2>
      <p className="mb-6 text-gray-600">Daftar laporan yang pernah kamu buat sebelumnya.</p>

      <div className="relative mb-6">
        <Search
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari berdasarkan judul atau ID laporan"
          className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-800 placeholder:text-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/30"
        />
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center text-sm text-gray-600">
          <Loader2 size={24} className="mx-auto mb-3 animate-spin text-red-600" />
          Memuat riwayat tiket...
        </div>
      ) : errorMessage ? (
        <div className="rounded-xl border border-red-200 bg-white px-6 py-10 text-center">
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
      ) : filteredTickets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center text-sm text-gray-600">
          {tickets.length === 0
            ? 'Kamu belum memiliki laporan tiket.'
            : 'Laporan tidak ditemukan. Coba kata kunci lain.'}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white divide-y divide-gray-200">
          {filteredTickets.map((ticket) => (
            <Link
              key={ticket.id}
              to={`/ticket/${encodeURIComponent(ticket.id)}`}
              className="flex flex-col gap-3 px-5 py-4 transition-colors hover:bg-red-50/40 md:flex-row md:items-center md:gap-6"
            >
              <div className="min-w-0 md:flex-1">
                <span className="mb-2 inline-block rounded-md bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                  #{ticket.id}
                </span>
                <h3 className="break-words text-base font-semibold text-gray-800">
                  {ticket.judul}
                </h3>
                <span className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusStyle(ticket.status)}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${getStatusDotStyle(ticket.status)}`} />
                  {ticket.status}
                </span>
              </div>

              <div className="flex shrink-0 flex-col gap-1.5 text-sm text-gray-600 md:w-72">
                <div className="flex items-center gap-2.5">
                  <CalendarDays size={16} className="shrink-0 text-gray-400" />
                  <span>{formatTanggal(ticket.tanggal)}</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MapPin size={16} className="shrink-0 text-gray-400" />
                  <span>Lantai {ticket.lantai}, {ticket.ruangan}</span>
                </div>
                {ticket.namaFileBukti && ticket.namaFileBukti !== 'Tidak ada file' && (
                  <div className="flex items-center gap-2.5">
                    <Paperclip size={16} className="shrink-0 text-gray-400" />
                    <span className="break-all">{ticket.namaFileBukti}</span>
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
