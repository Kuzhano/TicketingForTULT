import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function ToastNotification({ 
  show, 
  message, 
  type = 'success', 
  onClose 
}) {
  if (!show) return null;

  const isSuccess = type === 'success';

  return (
    <div 
      className={`fixed top-6 right-6 z-50 flex items-center justify-between gap-6 bg-white border border-gray-100 border-l-4 ${
        isSuccess ? 'border-l-emerald-500' : 'border-l-red-500'
      } shadow-lg rounded-xl px-4 py-3.5 min-w-[320px]`}
    >
      <div className="flex items-center gap-3">
        {isSuccess ? (
          <CheckCircle2 size={22} className="text-emerald-500 shrink-0" />
        ) : (
          <AlertCircle size={22} className="text-red-500 shrink-0" />
        )}
        <span className="text-sm font-semibold text-slate-800">
          {message}
        </span>
      </div>

      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 cursor-pointer"
      >
        <X size={16} />
      </button>
    </div>
  );
}