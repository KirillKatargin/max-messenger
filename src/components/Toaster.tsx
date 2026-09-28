import { useEffect } from 'react';
import { removeToast } from '../store/uiSlice';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { cn } from '../utils/cn';

const TOAST_TTL_MS = 5000;

export default function Toaster() {
  const toasts = useAppSelector((state) => state.ui.toasts);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (toasts.length === 0) {
      return;
    }
    const timers = toasts.map((toast) =>
      setTimeout(() => dispatch(removeToast(toast.id)), TOAST_TTL_MS),
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts, dispatch]);

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="alert"
          className={cn(
            'pointer-events-auto max-w-sm rounded-lg px-4 py-3 text-sm text-white shadow-lg',
            toast.type === 'error' && 'bg-red-500',
            toast.type === 'success' && 'bg-emerald-500',
            toast.type === 'info' && 'bg-gray-700',
          )}
        >
          <div className="flex items-start gap-3">
            <span className="flex-1">{toast.message}</span>
            <button
              type="button"
              aria-label="Закрыть уведомление"
              className="text-white/70 transition hover:text-white"
              onClick={() => dispatch(removeToast(toast.id))}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
