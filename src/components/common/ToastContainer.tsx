import React from 'react';
import { useData } from '../../context/DataContext';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useData();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start p-4 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 animate-slide-up ${
              isSuccess
                ? 'bg-white border-green-200 text-content-primary'
                : isError
                ? 'bg-white border-red-200 text-content-primary'
                : isWarning
                ? 'bg-white border-yellow-200 text-content-primary'
                : 'bg-white border-purple-200 text-content-primary'
            }`}
          >
            <div className="flex-shrink-0 mr-3 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-status-success" />}
              {isError && <AlertCircle className="w-5 h-5 text-status-error" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-status-warning" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-brand-primary" />}
            </div>

            <div className="flex-1 pr-2">
              <p className="font-semibold text-sm text-content-primary">{toast.title}</p>
              {toast.message && (
                <p className="text-xs text-content-secondary mt-0.5 leading-relaxed">{toast.message}</p>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-content-muted hover:text-content-primary transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
