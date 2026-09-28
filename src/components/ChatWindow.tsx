import { useAppSelector } from '../hooks/hooks';
import { chatIdToPhone } from '../utils/phone';
import Avatar from './Avatar';
import MessageInput from './MessageInput';
import MessageList from './MessageList';

export default function ChatWindow() {
  const activeChatId = useAppSelector((state) => state.chats.activeChatId);
  const chat = useAppSelector((state) =>
    state.chats.activeChatId ? state.chats.chats[state.chats.activeChatId] : undefined,
  );

  if (!activeChatId || !chat) {
    return (
      <section className="flex flex-1 items-center justify-center bg-[#a8c8e8]">
        <p className="rounded-full bg-white/80 px-4 py-2 text-sm text-gray-600 shadow-sm">
          Выберите чат или создайте новый
        </p>
      </section>
    );
  }

  return (
    <section className="flex flex-1 flex-col bg-[#a8c8e8]">
      <header className="flex items-center gap-3 border-b border-gray-200 bg-white px-4 py-2.5">
        <Avatar name={chat.name} size="sm" />
        <div className="min-w-0">
          <p className="truncate font-medium text-gray-900">{chat.name}</p>
          <p className="text-xs text-gray-500">+{chatIdToPhone(chat.chatId)}</p>
        </div>
      </header>
      <MessageList messages={chat.messages} />
      <MessageInput chatId={chat.chatId} />
    </section>
  );
}
