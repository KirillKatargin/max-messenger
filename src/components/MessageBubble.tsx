import { useMemo } from 'react';
import type { Message } from '../types';
import { removeMessage } from '../store/chatsSlice';
import { useAppDispatch } from '../hooks/hooks';
import { useSendMessage } from '../hooks/useSendMessage';
import { formatTime } from '../utils/datetime';
import { cn } from '../utils/cn';

type MessageBubbleProps = {
  message: Message;
};

function StatusIcon({ status }: { status: Message['status'] }) {
  if (status === 'sending') {
    return (
      <span aria-label="Отправляется" className="text-[10px] text-gray-400">
        🕓
      </span>
    );
  }
  return (
    <svg
      aria-label="Отправлено"
      className="h-3.5 w-3.5 text-blue-500"
      viewBox="0 0 16 16"
      fill="none"
    >
      <path
        d="M1.5 8.5l3 3 6-7M8 11.5l.9.9 6-7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const dispatch = useAppDispatch();
  const { send } = useSendMessage();
  const { outgoing } = message;
  const timeLabel = useMemo(() => formatTime(message.timestamp), [message.timestamp]);

  const handleRetry = async () => {
    dispatch(removeMessage({ chatId: message.chatId, id: message.id }));
    await send(message.chatId, message.text);
  };

  return (
    <div className={cn('flex px-6 py-0.5', outgoing ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[70%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm shadow-sm',
          outgoing
            ? 'rounded-br-md bg-[#d9fdd3] text-gray-900'
            : 'rounded-bl-md bg-white text-gray-900',
          message.status === 'error' && 'opacity-70 ring-1 ring-red-400',
        )}
      >
        <span>{message.text}</span>
        <span className="float-right ml-2 mt-1.5 inline-flex items-center gap-1 text-[10px] text-gray-500">
          {timeLabel}
          {outgoing && message.status === 'error' && (
            <button
              type="button"
              aria-label="Повторить отправку"
              title="Повторить отправку"
              onClick={() => void handleRetry()}
              className="text-xs text-red-500 transition hover:text-red-700"
            >
              ↻
            </button>
          )}
          {outgoing && message.status !== 'error' && <StatusIcon status={message.status} />}
        </span>
      </div>
    </div>
  );
}
