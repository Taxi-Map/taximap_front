import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  type?: ToastType;
  duration?: number;
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-success" />,
  error: <AlertCircle className="w-5 h-5 text-error" />,
  warning: <AlertTriangle className="w-5 h-5 text-warning" />,
  info: <Info className="w-5 h-5 text-info" />,
};

const bgMap: Record<ToastType, string> = {
  success: 'bg-success-bg border-success/20',
  error: 'bg-error-bg border-error/20',
  warning: 'bg-warning-bg border-warning/20',
  info: 'bg-info-bg border-info/20',
};

const textMap: Record<ToastType, string> = {
  success: 'text-success',
  error: 'text-error',
  warning: 'text-warning',
  info: 'text-info',
};

export const Toast: React.FC<ToastProps> = ({
  isOpen,
  onClose,
  message,
  type = 'info',
  duration = 4000,
}) => {
  useEffect(() => {
    if (isOpen && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, duration, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed top-4 right-4 z-[100] animate-in slide-in-from-right-5 fade-in duration-300">
      <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-sm ${bgMap[type]}`}>
        <span className="shrink-0 mt-0.5">{icons[type]}</span>
        <p className={`text-sm font-semibold flex-1 ${textMap[type]}`}>{message}</p>
        <button onClick={onClose} className="shrink-0 p-0.5 hover:opacity-70 transition-opacity">
          <X className={`w-4 h-4 ${textMap[type]}`} />
        </button>
      </div>
    </div>
  );
};
