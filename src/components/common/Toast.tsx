import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-[var(--color-success)] shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-[var(--color-error)] shrink-0" />,
    info: <Info className="w-5 h-5 text-[var(--color-accent)] shrink-0" />,
  };

  const bgColors = {
    success: 'border-[var(--color-success)]/30 bg-[var(--color-surface)]',
    error: 'border-[var(--color-error)]/30 bg-[var(--color-surface)]',
    info: 'border-[var(--color-accent)]/30 bg-[var(--color-surface)]',
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 p-4 rounded-[var(--radius-lg)] border shadow-xl max-w-md w-full animate-bounce-short ${bgColors[toast.type]}`}
    >
      {icons[toast.type]}
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{toast.title}</h3>
        {toast.message && (
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{toast.message}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] rounded-[var(--radius-sm)] cursor-pointer"
        aria-label="Fechar notificação"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
