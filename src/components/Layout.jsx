import { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  Home, 
  PlusCircle, 
  FolderClock, 
  Menu, 
  X, 
  Building2, 
  ChevronRight,
  Wrench,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { fetchData } from '../utils/api';

export default function Layout() {
  const [isOpen, setIsOpen] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(null);

  useEffect(() => {
    const loadActiveUser = async () => {
      try {
        const users = await fetchData('users');
        setAllUsers(users);

        const savedUser = JSON.parse(localStorage.getItem('activeUser'));
        if (savedUser) {
          setActiveUser(savedUser);
        } else {
          const defaultStudent = users.find((u) => u.role === 'mahasiswa') || users[0];
          setActiveUser(defaultStudent);
        }
      } catch (error) {
        console.error('Gagal memuat pengguna di sidebar:', error);
      }
    };

    loadActiveUser();
  }, []);

  const role = activeUser?.role || 'mahasiswa';

  const menus = [
    { name: 'Beranda Publik', path: '/', icon: Home, show: true },
    { 
      name: 'Buat Laporan', 
      path: '/create', 
      icon: PlusCircle, 
      show: role === 'mahasiswa' 
    },
    { 
      name: role === 'admin' 
        ? 'Penugasan Teknisi' 
        : role === 'teknisi' 
          ? 'Tugas Perbaikan' 
          : 'Riwayat Tiket', 
      path: role === 'teknisi' 
        ? '/teknisi' 
        : role === 'admin' 
          ? '/penugasan' 
          : '/history',
      icon: role === 'admin' ? UserCheck : role === 'teknisi' ? Wrench : FolderClock, 
      show: true 
    },
  ].filter((item) => item.show);

  const currentUser = {
    name: activeUser ? activeUser.name : 'Memuat...',
    id: activeUser ? activeUser.id : '...',
    role: activeUser ? activeUser.role : '',
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
      activeUser?.name || 'User'
    )}&background=dc2626&color=fff&bold=true`,
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <div className="bg-red-600 text-white p-1.5 rounded-lg">
            <Building2 size={18} />
          </div>
          <span className="font-bold text-gray-800 text-base">Ticketing TULT</span>
        </div>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="text-gray-600 focus:outline-none p-1 rounded-lg hover:bg-gray-100"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-20 md:hidden backdrop-blur-xs"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside 
        className={`fixed md:sticky md:top-0 inset-y-0 left-0 z-30 w-64 h-screen bg-white border-r border-gray-200 flex flex-col justify-between p-4 transform transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div>
          <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-gray-100">
            <div className="bg-red-600 text-white p-2.5 rounded-xl shadow-xs shadow-red-200">
              <Building2 size={22} />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-tight">
                Ticketing TULT
              </h1>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">
                Pelaporan Fasilitas Gedung
              </p>
            </div>
          </div>

          <div className="mb-2 px-3 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-600">
              Menu {role}
            </span>
          </div>

          <nav className="space-y-1">
            {menus.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                      isActive
                        ? 'bg-red-50 text-red-600 font-semibold shadow-2xs ring-1 ring-red-100'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 font-medium'
                    }`
                  }
                >
                  <Icon size={18} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="pt-3 border-t border-gray-100 space-y-3">
          <NavLink
            to="/profile"
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `flex items-center justify-between p-2.5 rounded-xl transition-all duration-150 group ${
                isActive
                  ? 'bg-red-50 ring-1 ring-red-200'
                  : 'hover:bg-gray-50 border border-transparent hover:border-gray-200'
              }`
            }
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full object-cover border border-red-100"
                />
                <span className="bottom-0 right-0 absolute w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
              </div>

              <div className="truncate">
                <p className="text-sm font-bold text-gray-800 group-hover:text-red-600 transition-colors truncate">
                  {currentUser.name}
                </p>
                <p className="text-xs text-gray-400 truncate capitalize">
                  {currentUser.id} {currentUser.role && `• ${currentUser.role}`}
                </p>
              </div>
            </div>

            <ChevronRight 
              size={16} 
              className="text-gray-400 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all shrink-0" 
            />
          </NavLink>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}