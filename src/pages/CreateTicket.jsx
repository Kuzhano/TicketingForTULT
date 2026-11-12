import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import ToastNotification from '../components/ToastNotification';
import { fetchData, postData } from '../utils/api';

export default function CreateTicket() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [submissionSucceeded, setSubmissionSucceeded] = useState(false);
  const [formData, setFormData] = useState({
    judul: '',
    lantai: '',
    ruangan: '',
    deskripsi: '',
    bukti: null
  });

  const loadFormData = useCallback(async () => {
    setIsLoading(true);
    setLoadError('');

    try {
      const [users, fetchedTickets] = await Promise.all([
        fetchData('users'),
        fetchData('tickets'),
      ]);

      if (!Array.isArray(users) || !Array.isArray(fetchedTickets)) {
        throw new Error('Format data pengguna atau tiket tidak valid.');
      }

      const savedUser = JSON.parse(localStorage.getItem('activeUser'));
      const activeUser =
        savedUser || users.find((user) => user.role === 'mahasiswa') || users[0];

      if (!activeUser?.id) {
        throw new Error('Data pengguna aktif tidak ditemukan.');
      }

      setCurrentUser(activeUser);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat data.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFormData();
  }, [loadFormData]);

  useEffect(() => {
    if (!submissionSucceeded) return undefined;

    const navigationTimeout = setTimeout(() => navigate('/history'), 2000);
    return () => clearTimeout(navigationTimeout);
  }, [submissionSucceeded, navigate]);

  const totalLantai = 20;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, bukti: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');

    try {
      const latestUser = JSON.parse(localStorage.getItem('activeUser')) || currentUser;
      if (!latestUser?.id) {
        throw new Error('Data pengguna aktif tidak ditemukan.');
      }

      await postData('tickets', {
        userId: latestUser.id,
        judul: formData.judul,
        lantai: String(formData.lantai),
        ruangan: formData.ruangan,
        deskripsi: formData.deskripsi,
        namaFileBukti: formData.bukti ? formData.bukti.name : 'Tidak ada file',
        status: 'Menunggu',
        tanggal: new Date().toISOString().slice(0, 10)
      });

      setShowSuccessToast(true);
      setSubmissionSucceeded(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Terjadi kesalahan saat mengirim laporan.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl border border-gray-200 shadow-sm text-center">
        <Loader2 size={28} className="mx-auto mb-3 animate-spin text-red-600" />
        <p className="text-sm text-gray-600">Memuat data form...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl border border-red-200 shadow-sm text-center">
        <AlertTriangle size={28} className="mx-auto mb-3 text-red-600" />
        <h2 className="text-lg font-bold text-gray-800 mb-2">Gagal Memuat Form</h2>
        <p role="alert" className="text-sm text-gray-600 mb-5">{loadError}</p>
        <button
          type="button"
          onClick={loadFormData}
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <RefreshCw size={16} />
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <ToastNotification
        show={showSuccessToast}
        message="Laporan kerusakan fasilitas berhasil dikirim!"
        type="success"
        onClose={() => setShowSuccessToast(false)}
      />

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Buat Laporan Fasilitas</h2>
        <p className="text-gray-600 text-sm">Form untuk melaporkan kerusakan fasilitas di gedung TULT.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {submitError && (
          <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <span>{submitError}</span>
          </div>
        )}

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
            <input
              type="text"
              name="ruangan"
              required
              value={formData.ruangan}
              onChange={handleChange}
              placeholder="Contoh: TULT.03.01, Koridor Barat"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
            />
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
            required
            onChange={handleFileChange}
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 transition-colors"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            {isSubmitting ? 'Mengirim...' : 'Kirim Laporan'}
          </button>
        </div>
      </form>
    </div>
  );
}