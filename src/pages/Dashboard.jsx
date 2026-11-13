import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MapPin,
  RefreshCw,
  Wrench,
} from 'lucide-react';
import { fetchData } from '../utils/api';

const ticketStorageKey = 'tult_tickets';
const recentTicketLimit = 10;
const monthNames = Array.from({ length: 12 }, (_, index) =>
  new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date(2026, index, 1))
);

function getTicketDate(ticket) {
  const timestamp = Date.parse(`${ticket.tanggal}T00:00:00`);
  return Number.isNaN(timestamp) ? null : timestamp;
}

function formatTicketDate(ticket) {
  const timestamp = getTicketDate(ticket);
  return timestamp === null
    ? 'Tanggal tidak tersedia'
    : new Date(timestamp).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
}

function getStatusStyle(status) {
  if (status === 'Tervalidasi') return 'bg-violet-50 text-violet-700';
  if (status === 'Selesai') return 'bg-emerald-50 text-emerald-700';
  if (status === 'Diproses') return 'bg-blue-50 text-blue-700';
  return 'bg-amber-50 text-amber-700';
}

const statusGroups = [
  {
    key: 'Menunggu',
    label: 'Belum diklaim',
    icon: Clock3,
    textColor: 'text-amber-700',
    background: 'bg-amber-50',
    dot: 'bg-amber-500',
  },
  {
    key: 'Diproses',
    label: 'Sedang ditangani',
    icon: Wrench,
    textColor: 'text-blue-700',
    background: 'bg-blue-50',
    dot: 'bg-blue-500',
  },
  {
    key: 'Selesai',
    label: 'Telah diatasi',
    icon: CheckCircle2,
    textColor: 'text-emerald-700',
    background: 'bg-emerald-50',
    dot: 'bg-emerald-500',
  },
  {
    key: 'Tervalidasi',
    label: 'Telah divalidasi',
    icon: BadgeCheck,
    textColor: 'text-violet-700',
    background: 'bg-violet-50',
    dot: 'bg-violet-500',
  },
];

function getTicketDateParts(date) {
  const match = /^(\d{4})-(\d{2})-\d{2}$/.exec(date ?? '');
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;

  return { year, month: month - 1 };
}

function AdminDashboard({ tickets }) {
  const ticketDates = useMemo(
    () => tickets.map((ticket) => ({ ticket, date: getTicketDateParts(ticket.tanggal) })),
    [tickets]
  );
  const availableYears = [
    ...new Set(ticketDates.flatMap(({ date }) => (date ? [date.year] : []))),
  ].sort((a, b) => b - a);
  const latestTicketDate = ticketDates
    .filter(({ date }) => date)
    .map(({ date }) => date)
    .sort((a, b) => b.year - a.year || b.month - a.month)[0];
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const displayedYear = selectedYear ?? availableYears[0] ?? new Date().getFullYear();
  const displayedMonth = selectedMonth ?? latestTicketDate?.month ?? new Date().getMonth();

  const monthlyData = useMemo(
    () =>
      Array.from({ length: 12 }, (_, month) => {
        const monthTickets = ticketDates.filter(
          ({ date }) => date?.year === displayedYear && date.month === month
        );
        const counts = statusGroups.map(
          ({ key }) => monthTickets.filter(({ ticket }) => ticket.status === key).length
        );

        return { month, counts, total: counts.reduce((sum, count) => sum + count, 0) };
      }),
    [displayedYear, ticketDates]
  );

  const selectedTickets = ticketDates.filter(
    ({ date }) => date?.year === displayedYear && date.month === displayedMonth
  );
  const selectedCounts = statusGroups.map(
    ({ key }) => selectedTickets.filter(({ ticket }) => ticket.status === key).length
  );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-8">
      <header className="flex flex-col gap-5 border-b border-gray-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-sm font-semibold text-red-600">Ringkasan tiket fasilitas</p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard Admin</h1>
          <p className="mt-2 text-sm text-gray-500">
            Pantau laporan fasilitas berdasarkan status dan bulan.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <label className="flex min-h-11 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-600">
            <CalendarDays size={17} className="shrink-0 text-gray-400" />
            <span className="sr-only">Pilih tahun</span>
            <select
              value={displayedYear}
              onChange={(event) => setSelectedYear(Number(event.target.value))}
              className="max-w-32 bg-transparent font-medium text-gray-800 outline-none"
            >
              {(availableYears.length ? availableYears : [displayedYear]).map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </label>
          <label className="flex min-h-11 items-center rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-600">
            <span className="sr-only">Pilih bulan</span>
            <select
              value={displayedMonth}
              onChange={(event) => setSelectedMonth(Number(event.target.value))}
              className="max-w-40 bg-transparent font-medium text-gray-800 outline-none"
            >
              {monthNames.map((month, index) => (
                <option key={month} value={index}>{month}</option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <section aria-label={`Ringkasan tiket ${monthNames[displayedMonth]} ${displayedYear}`}>
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-bold text-gray-900">
            Rekap {monthNames[displayedMonth]} {displayedYear}
          </h2>
          <span className="text-sm text-gray-500">{selectedTickets.length} tiket masuk</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {statusGroups.map((group, index) => {
            const Icon = group.icon;
            return (
              <article
                key={group.key}
                className="flex min-h-32 items-center justify-between rounded-xl border border-gray-200 bg-white p-5"
              >
                <div>
                  <p className="text-sm font-medium text-gray-500">{group.label}</p>
                  <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900">
                    {selectedCounts[index]}
                  </p>
                  <p className="mt-1 text-xs text-gray-400">tiket pada bulan ini</p>
                </div>
                <span className={`rounded-lg p-3 ${group.background} ${group.textColor}`}>
                  <Icon size={21} />
                </span>
              </article>
            );
          })}
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-1 border-b border-gray-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-gray-900">Rekap bulanan</h2>
            <p className="mt-1 text-sm text-gray-500">
              Jumlah tiket masuk setiap bulan pada {displayedYear}.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2 sm:pt-0">
            {statusGroups.map((group) => (
              <span key={group.key} className="flex items-center gap-2 text-xs text-gray-600">
                <span className={`h-2 w-2 rounded-full ${group.dot}`} />
                {group.label}
              </span>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-160 border-collapse text-left text-sm">
            <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th scope="col" className="px-5 py-3">Bulan</th>
                <th scope="col" className="px-4 py-3 text-center">Total</th>
                {statusGroups.map((group) => (
                  <th key={group.key} scope="col" className="px-4 py-3 text-center">
                    {group.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {monthlyData.map(({ month, counts, total }) => (
                <tr
                  key={month}
                  className={month === displayedMonth ? 'bg-red-50/60' : 'hover:bg-gray-50'}
                >
                  <th scope="row" className="px-5 py-3.5 font-medium text-gray-800">
                    {monthNames[month]}
                  </th>
                  <td className="px-4 py-3.5 text-center font-semibold text-gray-800">{total}</td>
                  {counts.map((count, index) => (
                    <td key={statusGroups[index].key} className="px-4 py-3.5 text-center text-gray-600">
                      {count}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedTickets.length === 0 && (
          <p className="border-t border-gray-100 px-5 py-4 text-sm text-gray-500">
            Belum ada tiket pada {monthNames[displayedMonth]} {displayedYear}.
          </p>
        )}
      </section>
    </div>
  );
}

export default function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [period, setPeriod] = useState('latest');
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);

  const loadDashboardData = useCallback(async () => {
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

      const localTicketsValue = localStorage.getItem(ticketStorageKey);
      const localTickets = localTicketsValue ? JSON.parse(localTicketsValue) : [];
      if (!Array.isArray(localTickets)) {
        throw new Error('Format tiket tersimpan di browser tidak valid.');
      }
      const ticketStatuses = JSON.parse(localStorage.getItem('tult_ticket_status') || '{}');
      const legacyTicketStatuses = JSON.parse(localStorage.getItem('statusTiket') || '{}');

      const savedUserValue = localStorage.getItem('activeUser');
      const savedUser = savedUserValue ? JSON.parse(savedUserValue) : null;
      const user =
        savedUser || users.find((item) => item.role === 'mahasiswa') || users[0];
      if (!user) {
        throw new Error('Data pengguna aktif tidak ditemukan.');
      }

      const uniqueTickets = [
        ...new Map(
          [...fetchedTickets, ...localTickets].map((ticket) => [ticket.id, ticket])
        ).values(),
      ].map((ticket) => ({
        ...ticket,
        status:
          ticketStatuses[String(ticket.id)] ||
          legacyTicketStatuses[String(ticket.id)] ||
          ticket.status,
      }));

      setTickets(uniqueTickets);
      setActiveUser(user);
      const latestTicket = uniqueTickets
        .filter((ticket) => getTicketDate(ticket) !== null)
        .sort((a, b) => getTicketDate(b) - getTicketDate(a))[0];
      if (latestTicket) {
        setSelectedMonth((month) => month ?? Number(latestTicket.tanggal.slice(5, 7)) - 1);
        setSelectedYear((year) => year ?? Number(latestTicket.tanggal.slice(0, 4)));
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat tiket.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();

    const handleRoleChange = () => {
      try {
        const savedUserValue = localStorage.getItem('activeUser');
        setActiveUser(savedUserValue ? JSON.parse(savedUserValue) : null);
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : 'Gagal memuat pengguna aktif.'
        );
      }
    };

    window.addEventListener('userRoleChanged', handleRoleChange);
    return () => window.removeEventListener('userRoleChanged', handleRoleChange);
  }, [loadDashboardData]);

  const availableYears = useMemo(
    () => [...new Set(
      tickets
        .filter((ticket) => getTicketDate(ticket) !== null)
        .map((ticket) => Number(ticket.tanggal.slice(0, 4)))
    )].sort((a, b) => b - a),
    [tickets]
  );

  const visibleTickets = useMemo(() => {
    const datedTickets = tickets
      .filter((ticket) => getTicketDate(ticket) !== null)
      .sort((a, b) => getTicketDate(b) - getTicketDate(a));

    if (period === 'month') {
      return datedTickets.filter((ticket) => {
        const [year, month] = ticket.tanggal.split('-').map(Number);
        return year === selectedYear && month === selectedMonth + 1;
      });
    }

    return datedTickets.slice(0, recentTicketLimit);
  }, [period, selectedMonth, selectedYear, tickets]);

  if (activeUser?.role === 'admin') {
    return <AdminDashboard tickets={tickets} />;
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <header className="flex flex-col gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-1 text-sm font-semibold capitalize text-red-600">
            {activeUser?.role || 'Pengguna'}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Tiket Fasilitas Terbaru
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Lihat laporan fasilitas terbaru atau pilih bulan tertentu.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:gap-3">
          <label className="flex min-h-11 min-w-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-600">
            <CalendarDays size={17} className="shrink-0 text-gray-400" />
            <span className="sr-only">Pilih periode tiket</span>
            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              className="w-full bg-transparent font-medium text-gray-800 outline-none"
            >
              <option value="latest">Tiket terbaru</option>
              <option value="month">Pilih bulan</option>
            </select>
          </label>

          {period === 'month' && (
            <>
            <label className="flex min-h-11 min-w-0 items-center rounded-lg border border-gray-200 bg-white px-3 text-sm">
              <span className="sr-only">Pilih bulan</span>
              <select
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(Number(event.target.value))}
                className="w-full bg-transparent font-medium text-gray-800 outline-none"
              >
                {monthNames.map((month, index) => (
                  <option key={month} value={index}>
                    {month}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex min-h-11 min-w-0 items-center rounded-lg border border-gray-200 bg-white px-3 text-sm">
              <span className="sr-only">Pilih tahun</span>
              <select
                value={selectedYear}
                onChange={(event) => setSelectedYear(Number(event.target.value))}
                className="w-full bg-transparent font-medium text-gray-800 outline-none"
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>
            </>
          )}
        </div>
      </header>

      {isLoading ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-600">
          <RefreshCw size={22} className="mx-auto mb-3 animate-spin text-red-600" />
          Memuat tiket terbaru...
        </div>
      ) : errorMessage ? (
        <div className="rounded-xl border border-red-200 bg-white p-8 text-center">
          <AlertTriangle size={24} className="mx-auto mb-3 text-red-600" />
          <p role="alert" className="mb-4 text-sm text-gray-700">{errorMessage}</p>
          <button
            type="button"
            onClick={loadDashboardData}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            <RefreshCw size={16} />
            Coba Lagi
          </button>
        </div>
      ) : visibleTickets.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-12 text-center text-sm text-gray-600">
          Tidak ada tiket pada periode ini.
        </div>
      ) : (
        <>
          <div className="space-y-3 md:hidden">
            {visibleTickets.map((ticket) => (
              <article key={ticket.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="min-w-0 wrap-break-word text-sm font-semibold text-gray-900">
                    {ticket.judul}
                  </h2>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyle(ticket.status)}`}>
                    {ticket.status}
                  </span>
                </div>
                {ticket.deskripsi && (
                  <p className="mt-2 text-sm leading-5 text-gray-600">{ticket.deskripsi}</p>
                )}
                <div className="mt-4 space-y-2 border-t border-gray-100 pt-3 text-xs text-gray-500">
                  <p className="flex items-start gap-2">
                    <MapPin size={15} className="mt-0.5 shrink-0 text-gray-400" />
                    <span className="wrap-break-word">Lantai {ticket.lantai}, {ticket.ruangan}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <CalendarDays size={15} className="shrink-0 text-gray-400" />
                    {formatTicketDate(ticket)}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-xl border border-gray-200 bg-white md:block">
            <div className="overflow-x-auto">
              <table className="w-full min-w-190 divide-y divide-gray-200 text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Laporan</th>
                    <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Lokasi</th>
                    <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Tanggal</th>
                    <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {visibleTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-gray-900">{ticket.judul}</p>
                        {ticket.deskripsi && (
                          <p className="mt-1 max-w-sm truncate text-xs text-gray-500">{ticket.deskripsi}</p>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={14} className="shrink-0 text-gray-400" />
                          Lantai {ticket.lantai}, {ticket.ruangan}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={14} className="shrink-0 text-gray-400" />
                          {formatTicketDate(ticket)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusStyle(ticket.status)}`}>
                          {ticket.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!isLoading && !errorMessage && period === 'latest' && visibleTickets.length > 0 && (
        <p className="text-center text-xs text-gray-500">
          Menampilkan maksimal {recentTicketLimit} tiket terbaru.
        </p>
      )}
    </div>
  );
}
