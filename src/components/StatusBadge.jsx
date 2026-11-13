
const warnaStatus = {
  Menunggu: 'bg-yellow-100 text-yellow-800',
  Diproses: 'bg-blue-100 text-blue-800',
  Selesai: 'bg-green-100 text-green-800',
  Tervalidasi: 'bg-emerald-100 text-emerald-800',
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
        warnaStatus[status] ||
        'bg-gray-100 text-gray-700'
      }`}
    >
      {status || 'Tidak diketahui'}
    </span>
  );
}
