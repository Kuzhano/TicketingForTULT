import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
const EXIT_MS = 150;

/**
 * Modal reusable.
 * - Tutup dengan Escape, klik backdrop, atau tombol X (bisa dimatikan lewat `dismissible`).
 * - Focus trap. Fokus awal ke `initialFocusRef` (atau elemen fokus pertama).
 * - Saat ditutup, fokus kembali ke `returnFocusRef` (atau elemen yang aktif saat modal dibuka).
 */
export default function Modal({
  open,
  onClose,
  title,
  description,
  icon,
  children,
  footer,
  dismissible = true,
  initialFocusRef,
  returnFocusRef,
}) {
  const titleId = useId();
  const descId = useId();
  const panelRef = useRef(null);

  // Simpan nilai prop terbaru di ref agar effect fokus tidak perlu dijalankan ulang.
  const latest = useRef({ onClose, dismissible, initialFocusRef, returnFocusRef });
  useEffect(() => {
    latest.current = { onClose, dismissible, initialFocusRef, returnFocusRef };
  });

  // Tetap ter-mount sebentar setelah `open` jadi false agar animasi keluar sempat jalan.
  const [mounted, setMounted] = useState(open);
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) setMounted(true);
  }

  useEffect(() => {
    if (open || !mounted) return undefined;
    const t = setTimeout(() => setMounted(false), EXIT_MS);
    return () => clearTimeout(t);
  }, [open, mounted]);

  useEffect(() => {
    if (!open) return undefined;

    const trigger = document.activeElement;
    const panel = panelRef.current;
    const initial = latest.current.initialFocusRef?.current ?? panel?.querySelector(FOCUSABLE) ?? panel;
    initial?.focus();

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (latest.current.dismissible) {
          e.preventDefault();
          latest.current.onClose?.();
        }
        return;
      }
      if (e.key !== 'Tab' || !panel) return;

      const items = Array.from(panel.querySelectorAll(FOCUSABLE));
      if (items.length === 0) {
        e.preventDefault();
        panel.focus();
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      const outside = !panel.contains(active);

      if (e.shiftKey && (active === first || outside)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || outside)) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
      const target = latest.current.returnFocusRef?.current ?? trigger;
      if (target instanceof HTMLElement && document.contains(target)) target.focus();
    };
  }, [open]);

  if (!mounted) return null;
  const closing = !open;
  const requestClose = () => {
    if (dismissible) onClose?.();
  };

  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${closing ? 'pointer-events-none' : ''}`}
    >
      <div
        aria-hidden="true"
        onClick={requestClose}
        className={`absolute inset-0 bg-slate-900/40 backdrop-blur-sm ${
          closing ? 'opacity-0 motion-safe:animate-fade-out' : 'motion-safe:animate-fade-in'
        }`}
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={`relative w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5 focus:outline-none ${
          closing ? 'opacity-0 motion-safe:animate-modal-out' : 'motion-safe:animate-modal-in'
        }`}
      >
        <div className="flex items-start gap-3 px-6 pt-6">
          {icon && (
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-red-50 text-red-600">
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1 pt-0.5">
            <h2 id={titleId} className="text-lg font-bold text-slate-800">
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-1 text-sm text-slate-500">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={requestClose}
            disabled={!dismissible}
            aria-label="Tutup"
            className="-mr-2 -mt-1 grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg text-slate-500 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {children && <div className="px-6 pt-5">{children}</div>}

        {footer && (
          <div className="mt-6 flex flex-col-reverse gap-2 rounded-b-2xl border-t border-slate-100 bg-slate-50/60 px-6 py-4 sm:flex-row sm:justify-end">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}