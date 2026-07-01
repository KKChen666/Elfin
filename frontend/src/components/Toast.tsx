import { useState, useEffect, useCallback, useRef } from 'react';
import { X, CheckCircle, WarningCircle, Info } from '@phosphor-icons/react';
import { registerToastHandler, ToastType } from './toastBus';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

let toastId = 0;

export default function Toast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastRef = useRef<HTMLDivElement>(null);

  const addToast = useCallback((type: ToastItem['type'], message: string) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  useEffect(() => {
    registerToastHandler(addToast);
    return () => { registerToastHandler(null); };
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div ref={toastRef} className="fixed right-4 top-[max(1rem,env(safe-area-inset-top))] z-[9999] flex max-w-[calc(100vw-2rem)] flex-col gap-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`
            ios-frosted flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium text-[#1d1d1f]
          `}
        >
          {toast.type === 'success' && <CheckCircle size={18} weight="fill" className="text-[#34c759]" />}
          {toast.type === 'error' && <WarningCircle size={18} weight="fill" className="text-[#ff3b30]" />}
          {toast.type === 'info' && <Info size={18} weight="fill" className="text-[#202123]" />}
          <span>{toast.message}</span>
          <button
            onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
            className="ml-2 rounded-full p-1 text-[#8e8e93] hover:bg-black/5"
            aria-label="关闭提示"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

