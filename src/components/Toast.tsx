import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss?: (id: string) => void;
  onCloseToast?: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss, onCloseToast }) => {
  const dismiss = React.useCallback(
    (id: string) => {
      if (typeof onDismiss === 'function') {
        onDismiss(id);
      } else if (typeof onCloseToast === 'function') {
        onCloseToast(id);
      }
    },
    [onDismiss, onCloseToast]
  );

  React.useEffect(() => {
    if (toasts.length === 0) return;
    const timers = toasts.map((toast) =>
      setTimeout(() => {
        dismiss(toast.id);
      }, 5000)
    );
    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [toasts, dismiss]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 left-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          id={`toast-${toast.id}`}
          className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${
            toast.type === 'success'
              ? 'bg-zinc-900/95 border-emerald-500/40 text-emerald-100 shadow-emerald-950/40'
              : toast.type === 'error'
              ? 'bg-zinc-900/95 border-red-500/40 text-red-100 shadow-red-950/40'
              : toast.type === 'warning'
              ? 'bg-zinc-900/95 border-amber-500/40 text-amber-100 shadow-amber-950/40'
              : 'bg-zinc-900/95 border-cyan-500/40 text-cyan-100 shadow-cyan-950/40'
          }`}
        >
          <div className="shrink-0 mt-0.5">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
            {toast.type === 'error' && <XCircle className="w-5 h-5 text-red-400" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-cyan-400" />}
          </div>
          <div className="flex-1 text-right">
            <h4 className="font-bold text-sm text-zinc-100">{toast.title}</h4>
            {toast.message && <p className="text-xs text-zinc-300 mt-1 leading-relaxed">{toast.message}</p>}
          </div>
          <button
            id={`dismiss-toast-${toast.id}`}
            type="button"
            onClick={() => dismiss(toast.id)}
            className="text-zinc-400 hover:text-zinc-200 transition-colors p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
