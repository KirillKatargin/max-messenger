import { useMemo, useState } from 'react';
import { logout } from '../store/authSlice';
import { setActiveChat } from '../store/chatsSlice';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { formatListTimestamp } from '../utils/datetime';
import { cn } from '../utils/cn';
import Avatar from './Avatar';
import NewChatDialog from './NewChatDialog';

export default function ChatList() {
  const dispatch = useAppDispatch();
  const chats = useAppSelector((state) => state.chats.chats);
  const order = useAppSelector((state) => state.chats.order);
  const activeChatId = useAppSelector((state) => state.chats.activeChatId);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const visibleChats = useMemo(() => {
    const query = search.trim().toLowerCase();
    return order
      .map((chatId) => chats[chatId])
      .filter((chat) => chat && (!query || chat.name.toLowerCase().includes(query)));
  }, [chats, order, search]);

  return (
    <aside className="flex w-full max-w-[380px] shrink-0 flex-col border-r border-gray-200 bg-white">
      <header className="flex items-center justify-between gap-2 px-4 pb-2 pt-4">
        <h1 className="text-xl font-semibold text-gray-900">Чаты</h1>
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Новый чат"
            title="Новый чат"
            onClick={() => setDialogOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 text-white transition hover:bg-blue-600"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Выйти"
            title="Выйти из аккаунта"
            onClick={() => dispatch(logout())}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path
                d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </header>
      <div className="px-4 pb-2">
        <input
          type="search"
          aria-label="Найти чат"
          placeholder="Найти"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg bg-gray-100 px-3 py-2 text-sm outline-none transition placeholder:text-gray-400 focus:bg-gray-50 focus:ring-2 focus:ring-blue-200"
        />
      </div>
      <nav className="flex-1 overflow-y-auto">
        {visibleChats.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-gray-400">
            {search ? 'Ничего не найдено' : 'Нет чатов. Нажмите «+», чтобы начать.'}
          </p>
        )}
        {visibleChats.map((chat) => {
          const lastMessage = chat.messages[chat.messages.length - 1];
          const active = chat.chatId === activeChatId;
          return (
            <button
              key={chat.chatId}
              type="button"
              onClick={() => dispatch(setActiveChat(chat.chatId))}
              className={cn(
                'flex w-full items-center gap-3 px-4 py-3 text-left transition',
                active ? 'bg-blue-50' : 'hover:bg-gray-50',
              )}
            >
              <Avatar name={chat.name} />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="truncate font-medium text-gray-900">{chat.name}</span>
                  {lastMessage && (
                    <span className="shrink-0 text-xs text-gray-400">
                      {formatListTimestamp(lastMessage.timestamp)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {lastMessage?.outgoing && (
                    <svg
                      aria-label="Отправлено"
                      className="h-3.5 w-3.5 shrink-0 text-blue-500"
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
                  )}
                  <span className="truncate text-sm text-gray-500">
                    {lastMessage ? lastMessage.text : 'Нет сообщений'}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </nav>
      <NewChatDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </aside>
  );
}
