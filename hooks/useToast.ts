import { useState, useCallback, useRef } from 'react';

type ToastType = 'info' | 'success' | 'warning' | 'error';

interface ToastState {
  isOpen: boolean;
  message: string;
  type: ToastType;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({ isOpen: false, message: '', type: 'info' });
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const showToast = useCallback((message: string, type: ToastType = 'info', duration = 4000) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ isOpen: true, message, type });

    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        setToast(prev => ({ ...prev, isOpen: false }));
      }, duration);
    }
  }, []);

  const closeToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(prev => ({ ...prev, isOpen: false }));
  }, []);

  return { toast, showToast, closeToast };
}
