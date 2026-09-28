import { useEffect, useMemo, useRef } from 'react';
import type { Message } from '../types';
import { formatDateLabel, isSameDay } from '../utils/datetime';
import MessageBubble from './MessageBubble';

type MessageListProps = {
  messages: Message[];
};

type ListItem =
  | { kind: 'date'; key: string; label: string }
  | { kind: 'message'; key: string; message: Message };

function buildItems(messages: Message[]): ListItem[] {
  const items: ListItem[] = [];
  let previousDate: Date | null = null;
  for (const message of messages) {
    const date = new Date(message.timestamp);
    if (!previousDate || !isSameDay(previousDate, date)) {
      items.push({
        kind: 'date',
        key: `date-${date.toDateString()}`,
        label: formatDateLabel(message.timestamp),
      });
      previousDate = date;
    }
    items.push({ kind: 'message', key: message.id, message });
  }
  return items;
}

export default function MessageList({ messages }: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const items = useMemo(() => buildItems(messages), [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length]);

  if (messages.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="rounded-2xl bg-white/90 px-8 py-6 text-center shadow-sm">
          <p className="font-semibold text-gray-800">Сообщений пока нет</p>
          <p className="mt-1 text-sm text-gray-500">Напишите сообщение, чтобы начать диалог</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto py-4">
      <div className="flex min-h-full flex-col justify-end">
        {items.map((item) =>
          item.kind === 'date' ? (
            <div key={item.key} className="my-3 flex justify-center">
              <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-gray-600 shadow-sm">
                {item.label}
              </span>
            </div>
          ) : (
            <MessageBubble key={item.key} message={item.message} />
          ),
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
