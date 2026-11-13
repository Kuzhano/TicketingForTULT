import { useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, Clock3, Wrench } from 'lucide-react';
import tickets from '../data/tickets.json';

const monthNames = Array.from({ length: 12 }, (_, index) =>
  new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(new Date(2026, index, 1))
);

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
];

function getTicketDateParts(date) {
  const match = /^(\d{4})-(\d{2})-\d{2}$/.exec(date ?? '');
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  if (month < 1 || month > 12) return null;

  return { year, month: month - 1 };
}

function getTicketDates() {
  const storedTickets = JSON.parse(localStorage.getItem('tult_tickets') || '[]');
  const allTickets = [...tickets, ...(Array.isArray(storedTickets) ? storedTickets : [])];
  const uniqueTickets = [...new Map(allTickets.map((ticket) => [ticket.id, ticket])).values()];

  return uniqueTickets.map((ticket) => ({
    ticket,
    date: getTicketDateParts(ticket.tanggal),
  }));
}

export default function Dashboard() {
  const [ticketDates] = useState(getTicketDates);
  const availableYears = [
    ...new Set(ticketDates.flatMap(({ date }) => (date ? [date.year] : []))),
  ].sort((a, b) => b - a);
  const latestTicketDate = ticketDates
    .filter(({ date }) => date)
    .map(({ date }) => date)
    .sort((a, b) => b.year - a.year || b.month - a.month)[0];
  const [selectedYear, setSelectedYear] = useState(
    () => availableYears[0] ?? new Date().getFullYear()
  );
  const [selectedMonth, setSelectedMonth] = useState(
    () => latestTicketDate?.month ?? new Date().getMonth()
  );

  const monthlyData = useMemo(
    () =>
      Array.from({ length: 12 }, (_, month) => {
        const monthTickets = ticketDates.filter(
          ({ date }) => date?.year === selectedYear && date.month === month
        );
        const counts = statusGroups.map(
          ({ key }) => monthTickets.filter(({ ticket }) => ticket.status === key).length
        );

        return { month, counts, total: counts.reduce((sum, count) => sum + count, 0) };
      }),
    [selectedYear]
  );

  const selectedTickets = ticketDates.filter(
    ({ date }) => date?.year === selectedYear && date.month === selectedMonth
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
              value={selectedYear}
              onChange={(event) => setSelectedYear(Number(event.target.value))}
              className="max-w-32 bg-transparent font-medium text-gray-800 outline-none"
            >
              {(availableYears.length ? availableYears : [selectedYear]).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>
          <label className="flex min-h-11 items-center rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-600">
            <span className="sr-only">Pilih bulan</span>
            <select
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(Number(event.target.value))}
              className="max-w-40 bg-transparent font-medium text-gray-800 outline-none"
            >
              {monthNames.map((month, index) => (
                <option key={month} value={index}>
                  {month}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      <section aria-label={`Ringkasan tiket ${monthNames[selectedMonth]} ${selectedYear}`}>
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-lg font-bold text-gray-900">
            Rekap {monthNames[selectedMonth]} {selectedYear}
          </h2>
          <span className="text-sm text-gray-500">{selectedTickets.length} tiket masuk</span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
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
            <p className="mt-1 text-sm text-gray-500">Jumlah tiket masuk setiap bulan pada {selectedYear}.</p>
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
                  className={month === selectedMonth ? 'bg-red-50/60' : 'hover:bg-gray-50'}
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
            Belum ada tiket pada {monthNames[selectedMonth]} {selectedYear}.
          </p>
        )}
      </section>
    </div>
  );
}
