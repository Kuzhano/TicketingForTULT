import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, GraduationCap, Hash, LoaderCircle, LogOut, Mail } from 'lucide-react';
import Modal from '../components/Modal';
import { showToast } from '../components/ToastStore';
import { hitungDalamProses, user } from '../data/user';

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2';

function getInitials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function InfoTile({ icon: Icon, label, value, mono = false, truncate = false }) {
  return (
    <div className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3.5 transition duration-200 hover:border-red-100 hover:bg-white hover:shadow-md hover:shadow-slate-200/70 motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none">
      <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-red-50 text-red-600 transition-colors duration-200 group-hover:bg-red-600 group-hover:text-white motion-reduce:transition-none">
        <Icon size={17} aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        <p
          className={`mt-0.5 text-sm font-semibold text-slate-800 ${mono ? 'font-mono' : ''} ${truncate ? 'truncate' : ''}`}
          title={truncate ? value : undefined}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function StatItem({ label, value, labelClass, valueClass }) {
  return (
    <div className="px-2 py-4 text-center">
      <p className={`text-xs font-medium ${labelClass}`}>{label}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums sm:text-[26px] ${valueClass}`}>{value}</p>
    </div>
  );
}

const ghostButton = `inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none ${focusRing}`;

const solidButton = `inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-red-600/30 transition-colors duration-150 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-80 motion-reduce:transition-none ${focusRing}`;

export default function Profile() {
  const navigate = useNavigate();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const logoutButtonRef = useRef(null);
  const cancelLogoutRef = useRef(null);
  const logoutTimerRef = useRef(null);

  useEffect(() => () => clearTimeout(logoutTimerRef.current), []);

  const dalamProses = hitungDalamProses(user);
  const initials = getInitials(user.name);

  const handleConfirmLogout = () => {
    setLoggingOut(true);
    logoutTimerRef.current = setTimeout(() => {
      navigate('/');
      showToast('Berhasil keluar dari akun', { type: 'success' });
    }, 1000);
  };

  return (
    <div className="mx-auto w-full max-w-[720px]">
      {/* Header */}
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 sm:text-[28px]">Profil Mahasiswa</h1>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          <span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" />
          SSO Telkom University Aktif
        </span>
      </header>

      {/* Kartu utama */}
      <section
        aria-label="Informasi profil"
        className="overflow-hidden rounded-2xl bg-white shadow-[0_10px_40px_-12px_rgba(15,23,42,0.15)] ring-1 ring-slate-900/5"
      >
        {/* Hero banner */}
        <div className="relative h-[120px] overflow-hidden bg-linear-to-br from-red-600 to-red-700">
          <span aria-hidden="true" className="absolute -left-10 -top-16 size-48 rounded-full bg-white/10" />
          <span aria-hidden="true" className="absolute -bottom-20 left-1/3 size-40 rounded-full bg-white/10" />
          <span aria-hidden="true" className="absolute -top-6 right-24 size-24 rounded-full bg-white/10" />
        </div>

        <div className="px-5 sm:px-7">
          {/* Avatar + identitas */}
          <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-end sm:gap-5">
            <div className="relative -mt-12 grid size-24 shrink-0 place-items-center rounded-2xl border-4 border-white bg-linear-to-br from-red-500 to-red-700 text-3xl font-bold text-white shadow-lg shadow-red-900/20 transition duration-200 hover:shadow-xl hover:shadow-red-600/40 hover:ring-4 hover:ring-red-500/30 motion-safe:hover:scale-[1.04] motion-reduce:transition-none">
              <span aria-hidden="true">{initials}</span>
              <span
                role="img"
                aria-label="Online"
                className="absolute -bottom-1 -right-1 size-4 rounded-full border-[3px] border-white bg-emerald-500"
              />
            </div>

            <div className="flex min-w-0 flex-wrap items-center gap-2 sm:pb-3">
              <h2 className="truncate text-[22px] font-bold leading-tight text-slate-800">{user.name}</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                <span className="size-1.5 rounded-full bg-red-600" aria-hidden="true" />
                {user.role}
              </span>
            </div>
          </div>

          {/* Grid info */}
          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
            <InfoTile icon={Hash} label="NIM" value={user.nim} mono />
            <InfoTile icon={BookOpen} label="Program Studi" value={user.prodi} />
            <InfoTile icon={Mail} label="Email Institusi" value={user.email} mono truncate />
            <InfoTile icon={GraduationCap} label="Fakultas" value={user.fakultas} />
          </div>

          {/* Strip statistik */}
          <div className="mt-5 grid grid-cols-3 divide-x divide-slate-200 rounded-xl border border-slate-100 bg-slate-50">
            <StatItem
              label="Total Laporan"
              value={user.totalLaporan}
              labelClass="text-slate-500"
              valueClass="text-slate-800"
            />
            <StatItem label="Dalam Proses" value={dalamProses} labelClass="text-amber-700" valueClass="text-amber-600" />
            <StatItem
              label="Selesai"
              value={user.laporanSelesai}
              labelClass="text-emerald-700"
              valueClass="text-emerald-600"
            />
          </div>
        </div>

        {/* Footer kartu */}
        <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <p className="flex items-center gap-2 text-xs text-slate-500">
            <Clock size={14} className="shrink-0" aria-hidden="true" />
            <span>
              Terakhir masuk: <span className="font-medium text-slate-700">{user.terakhirMasuk}</span>
            </span>
          </p>
          <button
            ref={logoutButtonRef}
            type="button"
            onClick={() => setLogoutOpen(true)}
            className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 transition duration-200 hover:border-red-600 hover:bg-red-600 hover:text-white hover:shadow-md hover:shadow-red-600/25 motion-safe:hover:-translate-y-0.5 motion-reduce:transition-none ${focusRing}`}
          >
            <LogOut size={16} aria-hidden="true" />
            Log Out
          </button>
        </div>
      </section>

      {/* Modal konfirmasi Log Out */}
      <Modal
        open={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        title="Yakin ingin keluar?"
        description="Sesi SSO kamu akan berakhir di perangkat ini."
        icon={<LogOut size={18} aria-hidden="true" />}
        dismissible={!loggingOut}
        initialFocusRef={cancelLogoutRef}
        returnFocusRef={logoutButtonRef}
        footer={
          <>
            <button
              ref={cancelLogoutRef}
              type="button"
              onClick={() => setLogoutOpen(false)}
              disabled={loggingOut}
              className={ghostButton}
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirmLogout}
              disabled={loggingOut}
              aria-busy={loggingOut}
              className={solidButton}
            >
              {loggingOut ? (
                <>
                  <LoaderCircle size={16} className="motion-safe:animate-spin" aria-hidden="true" />
                  Memproses…
                </>
              ) : (
                <>
                  <LogOut size={16} aria-hidden="true" />
                  Keluar
                </>
              )}
            </button>
          </>
        }
      />
    </div>
  );
}