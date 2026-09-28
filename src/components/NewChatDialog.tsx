import { useState, type FormEvent } from 'react';
import { addChat } from '../store/chatsSlice';
import { addToast } from '../store/uiSlice';
import { useAppDispatch } from '../hooks/hooks';
import { normalizePhoneToChatId, formatPhoneInput } from '../utils/phone';
import { cn } from '../utils/cn';

type NewChatDialogProps = {
  open: boolean;
  onClose: () => void;
};

export default function NewChatDialog({ open, onClose }: NewChatDialogProps) {
  const dispatch = useAppDispatch();
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return null;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const chatId = normalizePhoneToChatId(phone);
    if (!chatId) {
      setError('Введите корректный номер (10–15 цифр), например 79991234567');
      return;
    }
    dispatch(addChat({ chatId, name: phone }));
    dispatch(addToast({ type: 'success', message: `Чат ${phone} создан` }));
    setPhone('');
    setError(null);
    onClose();
  };

  const handleClose = () => {
    setPhone('');
    setError(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4"
      onClick={handleClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Новый чат"
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-gray-900">Новый чат</h2>
        <p className="mt-1 text-sm text-gray-500">Введите номер телефона получателя в MAX</p>
        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
          <input
            autoFocus
            type="tel"
            inputMode="tel"
            aria-label="Номер телефона"
            placeholder="+7 (999) 123-45-67"
            value={phone}
            onChange={(e) => {
              setPhone(formatPhoneInput(e.target.value));
              setError(null);
            }}
            className={cn(
              'w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-2',
              error
                ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200',
            )}
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="mt-1 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-600"
            >
              Создать
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
