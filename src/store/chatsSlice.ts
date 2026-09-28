import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Chat, Message, MessageStatus } from '../types';
import { loadCredentials, logout, setCredentials } from './authSlice';

type ChatsState = {
  chats: Record<string, Chat>;
  order: string[];
  activeChatId: string | null;
};

const emptyState: ChatsState = { chats: {}, order: [], activeChatId: null };

const chatsKey = (idInstance: string) => `ga:chats:${idInstance}`;

type PersistedChats = Pick<ChatsState, 'chats' | 'order'>;

function isPersistedChats(value: unknown): value is PersistedChats {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const v = value as Record<string, unknown>;
  return typeof v.chats === 'object' && v.chats !== null && Array.isArray(v.order);
}

export function loadChats(idInstance: string): PersistedChats {
  try {
    const raw = localStorage.getItem(chatsKey(idInstance));
    if (!raw) {
      return { chats: {}, order: [] };
    }
    const parsed: unknown = JSON.parse(raw);
    return isPersistedChats(parsed) ? { chats: parsed.chats, order: parsed.order } : { chats: {}, order: [] };
  } catch {
    return { chats: {}, order: [] };
  }
}

export function persistChats(idInstance: string, state: ChatsState): void {
  try {
    const data: PersistedChats = { chats: state.chats, order: state.order };
    localStorage.setItem(chatsKey(idInstance), JSON.stringify(data));
  } catch {
    console.error("Ошибка сохранения данных:");
  }
}

function touchChat(state: ChatsState, chatId: string): void {
  state.order = [chatId, ...state.order.filter((id) => id !== chatId)];
}

function initialChatsState(): ChatsState {
  const credentials = loadCredentials();
  if (!credentials) {
    return emptyState;
  }
  const persisted = loadChats(credentials.idInstance);
  return { ...persisted, activeChatId: null };
}

const chatsSlice = createSlice({
  name: 'chats',
  initialState: initialChatsState(),
  reducers: {
    addChat(state, action: PayloadAction<{ chatId: string; name: string }>) {
      const { chatId, name } = action.payload;
      if (!state.chats[chatId]) {
        state.chats[chatId] = { chatId, name, messages: [] };
        state.order = [chatId, ...state.order];
      }
      state.activeChatId = chatId;
    },
    setActiveChat(state, action: PayloadAction<string | null>) {
      state.activeChatId = action.payload;
    },
    addMessage(state, action: PayloadAction<Message>) {
      const message = action.payload;
      const chat = state.chats[message.chatId];
      if (!chat) {
        return;
      }
      if (chat.messages.some((m) => m.id === message.id)) {
        return;
      }
      chat.messages.push(message);
      touchChat(state, message.chatId);
    },
    resolveOutgoingMessage(
      state,
      action: PayloadAction<{ chatId: string; tempId: string; idMessage: string }>,
    ) {
      const { chatId, tempId, idMessage } = action.payload;
      const message = state.chats[chatId]?.messages.find((m) => m.id === tempId);
      if (message) {
        message.id = idMessage;
        message.status = 'sent';
      }
    },
    setMessageStatus(
      state,
      action: PayloadAction<{ chatId: string; id: string; status: MessageStatus }>,
    ) {
      const { chatId, id, status } = action.payload;
      const message = state.chats[chatId]?.messages.find((m) => m.id === id);
      if (message) {
        message.status = status;
      }
    },
    removeMessage(state, action: PayloadAction<{ chatId: string; id: string }>) {
      const chat = state.chats[action.payload.chatId];
      if (chat) {
        chat.messages = chat.messages.filter((m) => m.id !== action.payload.id);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(setCredentials, (state, action) => {
        const persisted = loadChats(action.payload.idInstance);
        state.chats = persisted.chats;
        state.order = persisted.order;
        state.activeChatId = null;
      })
      .addCase(logout, () => emptyState);
  },
});

export const { addChat, setActiveChat, addMessage, resolveOutgoingMessage, setMessageStatus, removeMessage } =
  chatsSlice.actions;
export default chatsSlice.reducer;
