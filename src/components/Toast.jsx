import { useSyncExternalStore } from 'react';
import { CircleAlert, CircleCheck, X } from 'lucide-react';
import { dismissToast, getToasts, subscribeToasts } from './ToastStore';

const VARIANTS = {
  success: { bar: 'bg-emerald-500', icon: 'text-emerald-600', Icon: CircleCheck },
  error: { bar: 'bg-red-600', icon: 'text-red-600', Icon: CircleAlert },
};

export function Toast({ type = 'success', message, leaving = false, onClose }) {
  const variant = VARIANTS[type] ?? VARIANTS.success;
  const { Icon } = variant;

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={`pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-xl bg-white py-3.5 pl-5 pr-3 shadow-lg ring-1 ring-slate-900/10 ${
        leaving ? 'opacity-0 motion-safe:animate-toast-out' : 'motion-safe:animate-toast-in'
      }`}
    >
      <span aria-hidden="true" className={`absolute inset-y-0 left-0 w-1 ${variant.bar}`} />
      <Icon size={20} className={`mt-0.5 shrink-0 ${variant.icon}`} aria-hidden="true" />
      <p className="min-w-0 flex-1 pt-0.5 text-sm font-medium text-slate-800">{message}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup notifikasi"
        className="grid size-7 shrink-0 cursor-pointer place-items-center rounded-md text-slate-500 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 motion-reduce:transition-none"
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}

export default function ToastViewport() {
  const toasts = useSyncExternalStore(subscribeToasts, getToasts, getToasts);

  return (
    <div
      aria-live="polite"
      aria-label="Notifikasi"
      className="pointer-events-none fixed right-4 top-4 z-[60] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2"
    >
      {toasts.map((t) => (
        <Toast
          key={t.id}
          type={t.type}
          message={t.message}
          leaving={t.leaving}
          onClose={() => dismissToast(t.id)}
        />
      ))}
    </div>
  );
}