import { useState } from 'react';
import ToastNotification from '../components/ToastNotification';
import usersData from '../data/users.json';
import {
  Hash,
  BookOpen,
  Mail,
  GraduationCap,
  Clock,
  LogOut,
  X,
  Loader2
} from 'lucide-react';

export default function Profile() {
  const [showModal, setShowModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const savedUser = JSON.parse(localStorage.getItem('activeUser'));
  const activeUser = savedUser || usersData.find((u) => u.role === 'mahasiswa') || usersData[0];

  const getInitials = (fullName) => {
    return fullName
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const user = {
    id: activeUser.id,
    initials: getInitials(activeUser.name),
    name: activeUser.name,
    role: activeUser.role, // "mahasiswa", "teknisi", atau "admin"
    username: activeUser.username,
    prodi: activeUser.role === 'mahasiswa' ? 'S1 Rekayasa Perangkat Lunak' : 'Manajemen Gedung TULT',
    fakultas: activeUser.role === 'mahasiswa' ? 'Fakultas Informatika (FIF)' : 'Direktorat Aset & Logistik',
    stats: {
      total: 4,
      proses: 1,
      selesai: 3,
    },
  };

  const handleConfirmLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem('activeUser');
      setIsLoggingOut(false);
      setShowModal(false);
      setShowToast(true);
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto relative">
      {showToast && (
        <ToastNotification
          show={showToast}
          message="Berhasil keluar dari akun"
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-slate-900 capitalize">
          Profil {user.role}
        </h2>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 cursor-default">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>SSO Telkom University Aktif</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        
        <div className="h-32 bg-red-700 relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-44 h-44 rounded-full bg-red-600/70"></div>
          <div className="absolute top-6 left-1/3 w-48 h-48 rounded-full bg-red-600/50"></div>
          <div className="absolute -top-8 right-16 w-28 h-28 rounded-full bg-red-500/50"></div>
        </div>

        <div className="px-6 sm:px-8 pb-6">
          
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 mb-6 relative z-10">
            <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 border-4 border-white shadow-md flex items-center justify-center text-white text-2xl font-bold shrink-0 hover:brightness-105 cursor-default">
              {user.initials}
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></span>
            </div>

            <div className="flex items-center gap-3 pb-1">
              <h3 className="text-xl font-bold text-slate-900">{user.name}</h3>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100 capitalize">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                {user.role}
              </span>
            </div>
          </div>

          <hr className="border-gray-100 mb-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            
            <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-red-50/40 hover:border-red-200 group">
              <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0 group-hover:bg-red-600 group-hover:text-white">
                <Hash size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  ID Pengguna
                </p>
                <p className="text-sm font-bold text-slate-800 truncate">
                  {user.id}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-red-50/40 hover:border-red-200 group">
              <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0 group-hover:bg-red-600 group-hover:text-white">
                <BookOpen size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Program Studi
                </p>
                <p className="text-sm font-bold text-slate-800 truncate">
                  {user.prodi}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-red-50/40 hover:border-red-200 group">
              <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0 group-hover:bg-red-600 group-hover:text-white">
                <Mail size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Email / Username
                </p>
                <p
                  className="text-sm font-bold text-slate-800 truncate"
                  title={user.username}
                >
                  {user.username}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-red-50/40 hover:border-red-200 group">
              <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0 group-hover:bg-red-600 group-hover:text-white">
                <GraduationCap size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Fakultas
                </p>
                <p className="text-sm font-bold text-slate-800 truncate">
                  {user.fakultas}
                </p>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-3 rounded-xl border border-gray-100 bg-gray-50/60 divide-x divide-gray-200/70 overflow-hidden">
            <div className="p-4 text-center hover:bg-gray-100/80 cursor-default">
              <p className="text-xs font-medium text-slate-500 mb-1">Total Laporan</p>
              <p className="text-2xl font-extrabold text-slate-900">{user.stats.total}</p>
            </div>
            <div className="p-4 text-center hover:bg-amber-50/60 cursor-default">
              <p className="text-xs font-semibold text-amber-700 mb-1">Dalam Proses</p>
              <p className="text-2xl font-extrabold text-amber-600">{user.stats.proses}</p>
            </div>
            <div className="p-4 text-center hover:bg-emerald-50/60 cursor-default">
              <p className="text-xs font-semibold text-emerald-700 mb-1">Selesai</p>
              <p className="text-2xl font-extrabold text-emerald-600">{user.stats.selesai}</p>
            </div>
          </div>
        </div>

        <div className="px-6 sm:px-8 py-4 bg-gray-50/40 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">

          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-red-200 bg-white text-red-600 text-xs font-bold hover:bg-red-600 hover:text-white hover:border-red-600 cursor-pointer"
          >
            <LogOut size={15} />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl max-w-md w-full overflow-hidden">
            <div className="p-6 flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <LogOut size={22} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-900">
                    Yakin ingin keluar?
                  </h4>
                  <p className="text-sm text-slate-500 mt-1">
                    Sesi SSO kamu akan berakhir di perangkat ini.
                  </p>
                </div>
              </div>
              <button
                onClick={() => !isLoggingOut && setShowModal(false)}
                disabled={isLoggingOut}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={isLoggingOut}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-gray-200/70 hover:text-slate-900 disabled:opacity-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmLogout}
                disabled={isLoggingOut}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 min-w-[125px] cursor-pointer"
              >
                {isLoggingOut ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <LogOut size={16} />
                    <span>Keluar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}