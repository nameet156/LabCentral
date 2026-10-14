import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextType {
  success: (msg: string) => void;
  error: (msg: string) => void;
  info: (msg: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const ICONS = {
  success: <CheckCircle2 className="h-5 w-5 text-status-completed" />,
  error: <XCircle className="h-5 w-5 text-status-rejected" />,
  info: <Info className="h-5 w-5 text-status-in-progress" />,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => {
      const next = [...prev, { id, type, message }];
      return next.length > 5 ? next.slice(next.length - 5) : next;
    });
    setTimeout(() => setToasts((prev) => prev.filter((toast) => toast.id !== id)), 4000);
  }, []);

  const removeToast = useCallback((id: string) => setToasts((prev) => prev.filter((toast) => toast.id !== id)), []);
  const toast = useMemo(() => ({
    success: (message: string) => addToast('success', message),
    error: (message: string) => addToast('error', message),
    info: (message: string) => addToast('info', message),
  }), [addToast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[90] flex w-[calc(100%-2rem)] flex-col gap-2 sm:w-auto" aria-live="polite" aria-relevant="additions">
        <AnimatePresence>
          {toasts.map((item) => (
            <motion.div
              key={item.id}
              layout
              role={item.type === 'error' ? 'alert' : 'status'}
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.98, transition: { duration: 0.16 } }}
              transition={{ duration: 0.18 }}
              className="ui-toast pointer-events-auto flex max-w-sm items-center gap-3 rounded-xl p-3.5"
            >
              {ICONS[item.type]}
              <p className="flex-1 text-[13px] leading-5">{item.message}</p>
              <button type="button" aria-label="Dismiss notification" onClick={() => removeToast(item.id)} className="rounded-md p-1 text-surface-400 transition hover:bg-surface-800 hover:text-surface-100">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
