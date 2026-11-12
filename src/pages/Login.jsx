import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, User, Lock, LogIn, Loader2, AlertCircle } from 'lucide-react';
import { fetchData } from '../utils/api';

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password.trim()) {
      setErrorMessage('Username dan password wajib diisi.');
      return;
    }

    try {
      setIsLoading(true);

      const users = await fetchData('users');

      await new Promise((resolve) => setTimeout(resolve, 600));

      const matchedUser = users.find(
        (u) =>
          u.username.toLowerCase() === username.trim().toLowerCase() &&
          u.password === password
      );

      if (!matchedUser) {
        throw new Error('Username atau password yang kamu masukkan salah.');
      }

      localStorage.setItem('activeUser', JSON.stringify(matchedUser));

      window.dispatchEvent(new Event('userRoleChanged'));

      navigate('/');
    } catch (err) {
      setErrorMessage(
        err.message || 'Gagal terhubung ke server autentikasi. Silakan coba lagi.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        
        <div className="bg-red-700 px-6 py-8 text-center relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-36 h-36 rounded-full bg-red-600/70"></div>
          <div className="absolute -bottom-12 -right-8 w-36 h-36 rounded-full bg-red-600/50"></div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-14 h-14 rounded-2xl bg-white text-red-600 flex items-center justify-center shadow-md mb-3">
              <Building2 size={28} />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Ticketing TULT
            </h1>
            <p className="text-xs text-red-100 mt-1">
              Sistem Pelaporan Fasilitas Gedung TULT
            </p>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="mb-6 text-center">
            <h2 className="text-lg font-bold text-slate-900">Masuk ke Akun</h2>
            <p className="text-xs text-slate-500 mt-1">
              Gunakan akun SSO Mahasiswa, Teknisi, atau Admin
            </p>
          </div>

          {errorMessage && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4" noValidate>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Username / Email
              </label>
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  disabled={isLoading}
                  placeholder="Masukkan username atau email"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  disabled={isLoading}
                  placeholder="Masukkan password"
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600 disabled:opacity-60"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-bold text-sm py-2.5 px-4 rounded-xl shadow-xs cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    <span>Memverifikasi...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={18} />
                    <span>Login</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}