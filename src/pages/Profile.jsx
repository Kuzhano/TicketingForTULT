import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ToastNotification from '../components/ToastNotification';
import { fetchData } from '../utils/api';
import {
  Hash,
  BookOpen,
  Mail,
  GraduationCap,
  Briefcase,
  Building2,
  ShieldCheck,
  Wrench,
  Clock,
  LogOut,
  X,
  Loader2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();

  const [showModal, setShowModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const [userData, setUserData] = useState(null);
  const [stats, setStats] = useState({
    col1: { label: 'Total Laporan', value: 0 },
    col2: { label: 'Dalam Proses', value: 0 },
    col3: { label: 'Selesai', value: 0 },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const getInitials = (fullName = '') => {
    return fullName
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const buildRoleProfile = (activeUser) => {
    const base = {
      id: activeUser.id,
      initials: getInitials(activeUser.name),
      name: activeUser.name,
      role: activeUser.role,
      username: activeUser.username,
      lastLogin: 'Hari ini, 09:42 WIB via SSO Telkom',
    };

    if (activeUser.role === 'admin') {
      return {
        ...base,
        roleBadge: 'Admin Verifikator',
        infoCards: [
          { icon: Hash, label: 'ID Admin', value: activeUser.id },
          { icon: ShieldCheck, label: 'Otoritas Peran', value: 'Verifikator Legitimasi Tiket' },
          { icon: Mail, label: 'Email Dinas', value: activeUser.username },
          { icon: Building2, label: 'Unit Kerja', value: 'Manajemen Operasional & Logistik TULT' },
        ],
      };
    }

    if (activeUser.role === 'teknisi') {
      return {
        ...base,
        roleBadge: 'Teknisi Gedung',
        infoCards: [
          { icon: Hash, label: 'ID Teknisi', value: activeUser.id },
          { icon: Wrench, label: 'Bidang Tugas', value: 'Penanganan & Perbaikan Fasilitas' },
          { icon: Briefcase, label: 'Username SSO', value: activeUser.username },
          { icon: Building2, label: 'Unit Kerja', value: 'Tim Maintenance Gedung TULT' },
        ],
      };
    }

    return {
      ...base,
      roleBadge: 'Mahasiswa',
      infoCards: [
        { icon: Hash, label: 'ID Mahasiswa', value: activeUser.id },
        { icon: BookOpen, label: 'Program Studi', value: 'S1 Rekayasa Perangkat Lunak' },
        { icon: Mail, label: 'Email Institusi', value: activeUser.username },
        { icon: GraduationCap, label: 'Fakultas', value: 'Fakultas Informatika (FIF)' },
      ],
    };
  };

  const loadProfileAndStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);

      const [users, jsonTickets] = await Promise.all([
        fetchData('users'),
        fetchData('tickets'),
      ]);

      const savedUser = JSON.parse(localStorage.getItem('activeUser'));
      const activeUser =
        savedUser || users.find((u) => u.role === 'mahasiswa') || users[0];

      if (!activeUser) {
        throw new Error('Data pengguna aktif tidak ditemukan.');
      }

      setUserData(buildRoleProfile(activeUser));

      const localTickets = JSON.parse(localStorage.getItem('tult_tickets')) || [];
      const allTickets = [...jsonTickets, ...localTickets];

      if (activeUser.role === 'admin') {
        setStats({
          col1: { label: 'Total Tiket Masuk', value: allTickets.length },
          col2: {
            label: 'Menunggu Verifikasi',
            value: allTickets.filter((t) => t.status === 'Menunggu').length,
          },
          col3: {
            label: 'Terverifikasi / Selesai',
            value: allTickets.filter(
              (t) => t.status === 'Diproses' || t.status === 'Selesai'
            ).length,
          },
        });
      } else if (activeUser.role === 'teknisi') {
        setStats({
          col1: { label: 'Total Laporan Gedung', value: allTickets.length },
          col2: {
            label: 'Sedang Ditangani',
            value: allTickets.filter((t) => t.status === 'Diproses').length,
          },
          col3: {
            label: 'Selesai Diperbaiki',
            value: allTickets.filter((t) => t.status === 'Selesai').length,
          },
        });
      } else {
        const myTickets = allTickets.filter((t) => t.userId === activeUser.id);
        setStats({
          col1: { label: 'Total Laporan Saya', value: myTickets.length },
          col2: {
            label: 'Dalam Proses',
            value: myTickets.filter(
              (t) => t.status === 'Diproses' || t.status === 'Menunggu'
            ).length,
          },
          col3: {
            label: 'Masalah Selesai',
            value: myTickets.filter((t) => t.status === 'Selesai').length,
          },
        });
      }
    } catch (err) {
      setErrorMessage(
        err.message || 'Terjadi kendala saat mengambil data profil dan statistik tiket.'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfileAndStats();

    const handleRoleChange = () => loadProfileAndStats();
    window.addEventListener('userRoleChanged', handleRoleChange);
    return () => window.removeEventListener('userRoleChanged', handleRoleChange);
  }, [loadProfileAndStats]);

  const handleConfirmLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      localStorage.removeItem('activeUser');
      setIsLoggingOut(false);
      setShowModal(false);
      setShowToast(true);

      setTimeout(() => {
        navigate('/login');
      }, 800);
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
          {userData ? `Profil ${userData.role}` : 'Profil Pengguna'}
        </h2>
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 cursor-default">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>SSO Telkom University Aktif</span>
        </div>
      </div>

      {errorMessage && !isLoading && (
        <div className="bg-white rounded-2xl border border-red-200 p-8 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Gagal Memuat Data Profil
          </h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
            {errorMessage} Silakan periksa kembali ketersediaan data atau coba muat ulang.
          </p>
          <button
            onClick={loadProfileAndStats}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-red-600 hover:bg-red-700 cursor-pointer"
          >
            <RefreshCw size={16} />
            <span>Coba Lagi</span>
          </button>
        </div>
      )}

      {isLoading && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden animate-pulse">
          <div className="h-32 bg-gray-200"></div>
          <div className="px-6 sm:px-8 pb-6">
            <div className="flex items-end gap-4 -mt-12 mb-6">
              <div className="w-24 h-24 rounded-2xl bg-gray-300 border-4 border-white"></div>
              <div className="space-y-2 pb-1">
                <div className="h-5 w-40 bg-gray-300 rounded-md"></div>
                <div className="h-4 w-24 bg-gray-200 rounded-full"></div>
              </div>
            </div>
            <hr className="border-gray-100 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="h-16 bg-gray-100 rounded-xl"></div>
              <div className="h-16 bg-gray-100 rounded-xl"></div>
              <div className="h-16 bg-gray-100 rounded-xl"></div>
              <div className="h-16 bg-gray-100 rounded-xl"></div>
            </div>
            <div className="h-20 bg-gray-100 rounded-xl"></div>
          </div>
        </div>
      )}

      {!isLoading && !errorMessage && userData && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="h-32 bg-red-700 relative overflow-hidden">
            <div className="absolute -top-10 -left-10 w-44 h-44 rounded-full bg-red-600/70"></div>
            <div className="absolute top-6 left-1/3 w-48 h-48 rounded-full bg-red-600/50"></div>
            <div className="absolute -top-8 right-16 w-28 h-28 rounded-full bg-red-500/50"></div>
          </div>

          <div className="px-6 sm:px-8 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 mb-6 relative z-10">
              <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 border-4 border-white shadow-md flex items-center justify-center text-white text-2xl font-bold shrink-0 hover:brightness-105 cursor-default">
                {userData.initials}
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full"></span>
              </div>

              <div className="flex items-center gap-3 pb-1">
                <h3 className="text-xl font-bold text-slate-900">{userData.name}</h3>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                  {userData.roleBadge}
                </span>
              </div>
            </div>

            <hr className="border-gray-100 mb-6" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {userData.infoCards.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-3.5 p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-red-50/40 hover:border-red-200 group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0 group-hover:bg-red-600 group-hover:text-white">
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        {item.label}
                      </p>
                      <p
                        className="text-sm font-bold text-slate-800 truncate"
                        title={item.value}
                      >
                        {item.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-3 rounded-xl border border-gray-100 bg-gray-50/60 divide-x divide-gray-200/70 overflow-hidden">
              <div className="p-4 text-center hover:bg-gray-100/80 cursor-default">
                <p className="text-xs font-medium text-slate-500 mb-1">
                  {stats.col1.label}
                </p>
                <p className="text-2xl font-extrabold text-slate-900">
                  {stats.col1.value}
                </p>
              </div>
              <div className="p-4 text-center hover:bg-amber-50/60 cursor-default">
                <p className="text-xs font-semibold text-amber-700 mb-1">
                  {stats.col2.label}
                </p>
                <p className="text-2xl font-extrabold text-amber-600">
                  {stats.col2.value}
                </p>
              </div>
              <div className="p-4 text-center hover:bg-emerald-50/60 cursor-default">
                <p className="text-xs font-semibold text-emerald-700 mb-1">
                  {stats.col3.label}
                </p>
                <p className="text-2xl font-extrabold text-emerald-600">
                  {stats.col3.value}
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 sm:px-8 py-4 bg-gray-50/40 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Clock size={15} className="text-slate-400 shrink-0" />
              <span>
                Terakhir masuk: <strong className="text-slate-700 font-semibold">{userData.lastLogin}</strong>
              </span>
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-red-200 bg-white text-red-600 text-xs font-bold hover:bg-red-600 hover:text-white hover:border-red-600 cursor-pointer"
            >
              <LogOut size={15} />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}

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