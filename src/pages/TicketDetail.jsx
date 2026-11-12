import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertTriangle, CalendarDays, Loader2, Paperclip, RefreshCw } from 'lucide-react';
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

export default function TicketDetail() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [notFound, setNotFound] = useState(false);

  const loadTicket = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');
    setNotFound(false);

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
          [...fetchedTickets, ...localTickets].map((item) => [item.id, item])
        ).values(),
      ];
      const foundTicket = allTickets.find((item) => item.id === id);

      if (!foundTicket || (currentUser.role === 'mahasiswa' && foundTicket.userId !== currentUser.id)) {
        setNotFound(true);
        return;
      }

      setTicket(foundTicket);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat detail tiket.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadTicket();
  }, [loadTicket]);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-600">
        <Loader2 size={26} className="mx-auto mb-3 animate-spin text-red-600" />
        Memuat detail tiket...
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
              <h2 className="mb-2 text-lg font-bold text-gray-800">Gagal Memuat Tiket</h2>
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
              <h2 className="mb-2 text-2xl font-bold text-gray-800">Tiket tidak ditemukan</h2>
              <p className="mb-5 text-sm text-gray-600">
                Tiket ini tidak tersedia atau bukan milik akun mahasiswa yang sedang digunakan.
              </p>
            </>
          )}
          <Link to="/history" className="text-sm font-medium text-red-600 hover:underline">
            Kembali ke riwayat tiket
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/history" className="text-sm font-medium text-red-600 hover:underline">
        &larr; Kembali ke riwayat
      </Link>

      <article className="mt-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-1 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold text-red-600">#{ticket.id}</p>
            <h1 className="break-words text-2xl font-bold text-gray-800">{ticket.judul}</h1>
          </div>
          <span className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ring-inset ${getStatusStyle(ticket.status)}`}>
            <span className={`h-2 w-2 rounded-full ${getStatusDotStyle(ticket.status)}`} />
            {ticket.status}
          </span>
        </div>
        <p className="mb-6 flex items-center gap-2 text-sm text-gray-600">
          <CalendarDays size={16} className="shrink-0 text-gray-400" />
          Dibuat pada {formatTanggal(ticket.tanggal)}
        </p>

        <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-semibold text-gray-700">Lantai</p>
            <p className="mt-1 rounded-lg border border-gray-200 px-3 py-2">{ticket.lantai}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700">Ruangan</p>
            <p className="mt-1 break-words rounded-lg border border-gray-200 px-3 py-2">{ticket.ruangan}</p>
          </div>
        </div>

        <div className="mb-5">
          <p className="text-sm font-semibold text-gray-700">Deskripsi detail</p>
          <p className="mt-1 whitespace-pre-wrap rounded-lg border border-gray-200 px-3 py-2">
            {ticket.deskripsi}
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold text-gray-700">Bukti kerusakan</p>
          <p className="mt-1 flex items-center gap-2 break-all text-red-600">
            <Paperclip size={16} className="shrink-0" />
            {ticket.namaFileBukti || 'Tidak ada file'}
          </p>
        </div>
      </article>
    </div>
  );
}
