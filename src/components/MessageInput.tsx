import { useRef, useState, type KeyboardEvent } from 'react';
import { MAX_MESSAGE_LENGTH } from '../api/greenApi';
import { useSendMessage } from '../hooks/useSendMessage';
import { cn } from '../utils/cn';

type MessageInputProps = {
  chatId: string;
};

export default function MessageInput({ chatId }: MessageInputProps) {
  const { send, sending } = useSendMessage();
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend = text.trim().length > 0 && text.length <= MAX_MESSAGE_LENGTH && !sending;

  const handleSend = async () => {
    if (!canSend) {
      return;
    }
    const sent = await send(chatId, text);
    if (sent) {
      setText('');
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  return (
    <div className="bg-white/60 px-6 pb-4 pt-2 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-end gap-3 rounded-2xl bg-white px-4 py-2 shadow">
        <textarea
          ref={textareaRef}
          aria-label="Сообщение"
          placeholder="Сообщение"
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          className="max-h-32 flex-1 resize-none bg-transparent py-1.5 text-sm text-gray-900 outline-none placeholder:text-gray-400"
        />
        <button
          type="button"
          aria-label="Отправить сообщение"
          disabled={!canSend}
          onClick={() => void handleSend()}
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition',
            canSend
              ? 'bg-blue-500 text-white hover:bg-blue-600'
              : 'cursor-not-allowed bg-gray-200 text-gray-400',
          )}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
