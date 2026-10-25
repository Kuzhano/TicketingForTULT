import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Home, PlusCircle, FolderClock, FileText, User, Menu, X } from 'lucide-react';

export default function Layout() {
  const [isOpen, setIsOpen] = useState(false);

  const menus = [
    { name: 'Beranda', path: '/', icon: Home },
    { name: 'Buat Laporan', path: '/create', icon: PlusCircle },
    { name: 'Riwayat Tiket', path: '/history', icon: FolderClock },
    { name: 'Detail Tiket', path: '/ticket/1', icon: FileText },
    { name: 'Profil', path: '/profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      {}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-20">
        <span className="font-bold text-red-600 text-lg">TULT-Fix</span>
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="text-gray-600 focus:outline-none p-1"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {}
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 px-4 py-6 transform transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        {}
        <div className="mb-8 px-3">
          <h1 className="text-xl font-bold text-gray-800">Ticketing TULT</h1>
          <p className="text-xs text-gray-400">Pelaporan Fasilitas Gedung TULT</p>
        </div>

        {}
        <div className="mb-3 px-3">
          <span className="text-xs font-bold text-red-600 tracking-wide">
            Menu Utama
          </span>
        </div>

        {}
        <nav className="space-y-1">
          {menus.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-red-50 text-red-600 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </aside>

      {}
      <main className="flex-1 p-6">
        <Outlet />
      </main>

    </div>
  );
}