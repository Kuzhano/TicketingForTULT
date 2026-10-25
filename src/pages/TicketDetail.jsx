import { useParams } from 'react-router-dom';

export default function TicketDetail() {
  const { id } = useParams();

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Detail Tiket #{id}</h2>
      <p className="text-gray-600">Informasi lengkap dan status perbaikan laporan.</p>
    </div>
  );
}