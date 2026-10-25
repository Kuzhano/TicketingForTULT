import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CreateTicket() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    judul: '',
    lantai: '',
    ruangan: '',
    deskripsi: '',
    bukti: null
  });

  const totalLantai = 20;
  const ruanganPerLantai = 18;

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const updatedData = { ...prev, [name]: value };
      
      if (name === 'lantai') {
        if (value === 'Basement') {
          updatedData.ruangan = 'Area Basement';
        } else {
          updatedData.ruangan = '';
        }
      }
      
      return updatedData;
    });
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, bukti: e.target.files[0] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const existingTickets = JSON.parse(localStorage.getItem('tult_tickets')) || [];
    
    const newTicket = {
      id: Date.now(),
      judul: formData.judul,
      lantai: formData.lantai,
      ruangan: formData.ruangan,
      deskripsi: formData.deskripsi,
      namaFileBukti: formData.bukti ? formData.bukti.name : 'Tidak ada file',
      status: 'Menunggu',
      tanggal: new Date().toLocaleDateString('id-ID')
    };

    existingTickets.push(newTicket);
    localStorage.setItem('tult_tickets', JSON.stringify(existingTickets));
    alert('Laporan kerusakan fasilitas berhasil dikirim!');
    navigate('/history');
  };

  const getRuanganOptions = () => {
    if (!formData.lantai || formData.lantai === 'Basement') return [];
    
    const lantaiStr = formData.lantai.toString().padStart(2, '0');
    return Array.from({ length: ruanganPerLantai }, (_, i) => {
      const ruanganStr = (i + 1).toString().padStart(2, '0');
      return `TULT.${lantaiStr}.${ruanganStr}`;
    });
  };

  return (
    <div className="max-w-2xl bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Buat Laporan Fasilitas</h2>
        <p className="text-gray-600 text-sm">Form untuk melaporkan kerusakan fasilitas di gedung TULT.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Judul Laporan</label>
          <input
            type="text"
            name="judul"
            required
            value={formData.judul}
            onChange={handleChange}
            placeholder="Contoh: AC Mati, Proyektor Rusak"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lantai</label>
            <select
              name="lantai"
              required
              value={formData.lantai}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
            >
              <option value="" disabled>Pilih Lantai</option>
              <option value="Basement">Basement</option>
              {Array.from({ length: totalLantai }, (_, i) => i + 1).map(num => (
                <option key={num} value={num}>
                  Lantai {num}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ruangan</label>
            <select
              name="ruangan"
              required={formData.lantai !== 'Basement'}
              value={formData.ruangan}
              onChange={handleChange}
              disabled={!formData.lantai || formData.lantai === 'Basement'}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white disabled:bg-gray-100 disabled:text-gray-500"
            >
              <option value="" disabled>
                {!formData.lantai 
                  ? 'Pilih Lantai Dahulu' 
                  : formData.lantai === 'Basement' 
                    ? 'Tidak ada ruangan (Area Terbuka)' 
                    : 'Pilih Ruangan'}
              </option>
              
              {formData.lantai === 'Basement' && (
                <option value="Area Basement">Area Basement / Umum</option>
              )}

              {getRuanganOptions().map(ruangan => (
                <option key={ruangan} value={ruangan}>
                  {ruangan}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Detail</label>
          <textarea
            name="deskripsi"
            required
            rows="4"
            value={formData.deskripsi}
            onChange={handleChange}
            placeholder="Jelaskan secara detail kerusakan yang terjadi..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors resize-none"
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Upload Bukti Kerusakan (Gambar)</label>
          <input
            type="file"
            name="bukti"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 transition-colors"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Kirim Laporan
          </button>
        </div>
      </form>
    </div>
  );
}