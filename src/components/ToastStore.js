import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import ToastViewport from './Toast.jsx';

// Store toast global sederhana. Viewport di-mount sekali ke document.body,
// sehingga toast tetap tampil walaupun halaman pemanggil sudah berpindah route.
const EXIT_MS = 200;

let toasts = [];
let nextId = 0;
let root = null;
const listeners = new Set();

const emit = () => listeners.forEach((listener) => listener());

export function subscribeToasts(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getToasts() {
  return toasts;
}

function ensureViewport() {
  if (root || typeof document === 'undefined') return;
  const host = document.createElement('div');
  host.id = 'toast-root';
  document.body.appendChild(host);
  root = createRoot(host);
  root.render(createElement(ToastViewport));
}

export function dismissToast(id) {
  if (!toasts.some((t) => t.id === id && !t.leaving)) return;
  toasts = toasts.map((t) => (t.id === id ? { ...t, leaving: true } : t));
  emit();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, EXIT_MS);
}

/**
 * Tampilkan toast.
 * @param {string} message
 * @param {{ type?: 'success' | 'error', duration?: number }} [options]
 */
export function showToast(message, { type = 'success', duration = 3000 } = {}) {
  ensureViewport();
  const toast = { id: ++nextId, message, type, duration, leaving: false };
  toasts = [...toasts, toast];
  emit();
  setTimeout(() => dismissToast(toast.id), duration);
  return toast.id;
}