import { useState, useEffect, useCallback } from 'react';
import { X, CheckCircle, WarningCircle, Info } from '@phosphor-icons/react';

interface ToastItem {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

let toastId = 0;
let addToastFn: ((type: ToastItem['type'], message: string) => void) | null = null;

export function showToast(type: ToastItem['type'], message: string) {
  addToastFn?.(type, message);
}

export default function Toast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((type: ToastItem['type'], message: string) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  useEffect(() => {
    addToastFn = addToast;
    return () => { addToastFn = null; };
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`
            flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium
            animate-[slideIn_0.3s_ease-out]
            ${toast.type === 'success' ? 'bg-[#00B578] text-white' : ''}
            ${toast.type === 'error' ? 'bg-[#FF3B30] text-white' : ''}
            ${toast.type === 'info' ? 'bg-[#3370FF] text-white' : ''}
          `}
        >
          {toast.type === 'success' && <CheckCircle size={18} />}
          {toast.type === 'error' && <WarningCircle size={18} />}
          {toast.type === 'info' && <Info size={18} />}
          <span>{toast.message}</span>
          <button
            onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
            className="ml-2 p-0.5 rounded hover:bg-white/20"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
