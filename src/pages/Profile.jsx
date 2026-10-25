import { useNavigate } from 'react-router-dom';
import { User, Mail, Hash, BookOpen, LogOut } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();

  // Data dummy mahasiswa (bisa diganti sesuai kebutuhan)
  const user = {
    name: 'Shiki',
    nim: '103022400090',
    prodi: 'S1 Rekayasa Perangkat Lunak',
    email: 'mohammaddzaki@student.telkomuniversity.ac.id',
    role: 'Mahasiswa',
    totalLaporan: 4,
    laporanSelesai: 3,
  };

  const handleLogout = () => {
    const confirmLogout = window.confirm('Apakah kamu yakin ingin keluar dari akun?');
    if (confirmLogout) {
      // Jika nanti ada localStorage / state login, bisa dihapus di sini
      // localStorage.removeItem('user');
      alert('Berhasil logout!');
      navigate('/');
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Profil</h2>

      {/* Kartu Utama Profil */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-6 mb-6">
        
        {/* Header Nama & Inisial */}
        <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-2xl font-bold">
            {user.name.charAt(0)}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">{user.name}</h3>
            <span className="inline-block mt-1 px-2.5 py-0.5 text-xs font-medium bg-red-50 text-red-600 rounded-full">
              {user.role}
            </span>
          </div>
        </div>

        {/* Detail Informasi Akademik */}
        <div className="py-5 space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <Hash size={18} className="text-gray-400" />
            <div>
              <p className="text-gray-400 text-xs">NIM</p>
              <p className="font-medium text-gray-700">{user.nim}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <BookOpen size={18} className="text-gray-400" />
            <div>
              <p className="text-gray-400 text-xs">Program Studi</p>
              <p className="font-medium text-gray-700">{user.prodi}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Mail size={18} className="text-gray-400" />
            <div>
              <p className="text-gray-400 text-xs">Email</p>
              <p className="font-medium text-gray-700">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Statistik Singkat Tiket */}
        {/* <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 mb-6">
          <div className="bg-gray-50 p-3 rounded-lg text-center">
            <p className="text-xl font-bold text-gray-800">{user.totalLaporan}</p>
            <p className="text-xs text-gray-500">Total Laporan</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg text-center">
            <p className="text-xl font-bold text-green-600">{user.laporanSelesai}</p>
            <p className="text-xs text-gray-500">Masalah Selesai</p>
          </div>
        </div> */}

        {/* Tombol Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut size={18} />
          <span>Log Out</span>
        </button>

      </div>
    </div>
  );
}