import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'primary' | 'danger' | 'whatsapp';
  onConfirm: () => void;
  onCancel: () => void;
  icon?: React.ReactNode;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  description,
  confirmLabel = 'تأكيد',
  cancelLabel = 'إلغاء',
  variant = 'primary',
  onConfirm,
  onCancel,
  icon,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl text-right animate-in zoom-in-95 duration-200"
        id="confirm-modal-box"
      >
        <button
          id="btn-close-modal"
          onClick={onCancel}
          className="absolute top-4 left-4 text-zinc-400 hover:text-zinc-200 transition-colors p-1 rounded-lg hover:bg-zinc-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              variant === 'whatsapp'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : variant === 'danger'
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
            }`}
          >
            {icon || <AlertCircle className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-100">{title}</h3>
          </div>
        </div>

        <p className="text-zinc-300 text-sm leading-relaxed mb-6 whitespace-pre-line">{description}</p>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-800/80">
          <button
            id="btn-modal-cancel"
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-zinc-700 bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 text-sm font-medium transition-all"
          >
            {cancelLabel}
          </button>
          <button
            id="btn-modal-confirm"
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg ${
              variant === 'whatsapp'
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
                : variant === 'danger'
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/30'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/30'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
