import React from 'react';
import { ToastItem } from '../../types';
import { Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

interface ToastProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts }) => {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl bg-studio-card dark:bg-studio-darkCard border border-studio-border dark:border-studio-darkBorder shadow-warm-lg text-studio-text dark:text-studio-darkText text-xs font-medium animate-fadeIn transition-all duration-300"
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-studio-success shrink-0" />
          ) : toast.type === 'warning' ? (
            <AlertCircle className="w-4 h-4 text-studio-warning shrink-0" />
          ) : (
            <Sparkles className="w-4 h-4 text-studio-gold shrink-0" />
          )}
          <span className="flex-1 leading-snug">{toast.text}</span>
        </div>
      ))}
    </div>
  );
};
