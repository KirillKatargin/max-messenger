import { waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PollingService } from './polling';
import { greenApi } from '../api/greenApi';
import { setupStore, type AppStore } from '../store/store';
import type { Credentials, Notification } from '../types';

vi.mock('../api/greenApi', () => ({
  greenApi: {
    receiveNotification: vi.fn(),
    deleteNotification: vi.fn(async () => ({ result: true })),
  },
}));

const receiveMock = vi.mocked(greenApi.receiveNotification);
const deleteMock = vi.mocked(greenApi.deleteNotification);

const credentials: Credentials = {
  idInstance: '1234567890',
  apiTokenInstance: 'token',
  apiUrl: 'https://api.green-api.com',
};

const CHAT_ID = '79991234567@c.us';

const incomingTextNotification: Notification = {
  receiptId: 123,
  body: {
    typeWebhook: 'incomingMessageReceived',
    idMessage: 'MSG-1',
    timestamp: 1_700_000_000,
    senderData: { chatId: CHAT_ID, senderName: 'Тест' },
    messageData: {
      typeMessage: 'textMessage',
      textMessageData: { textMessage: 'Привет из MAX!' },
    },
  },
};

function makeStore(): AppStore {
  return setupStore({ auth: { credentials } });
}

function idleQueue() {
  receiveMock.mockImplementation(
    () => new Promise((resolve) => setTimeout(() => resolve(null), 5)),
  );
}

describe('PollingService', () => {
  let service: PollingService;

  afterEach(() => {
    service?.stop();
    vi.clearAllMocks();
  });

  it('should dispatch an incoming text message and delete the notification', async () => {
    const store = makeStore();
    receiveMock.mockResolvedValueOnce(incomingTextNotification);
    idleQueue();
    service = new PollingService(10, 5);

    service.start(store);

    await waitFor(() => {
      const chat = store.getState().chats.chats[CHAT_ID];
      expect(chat.messages).toHaveLength(1);
      expect(chat.messages[0]).toMatchObject({
        id: 'MSG-1',
        text: 'Привет из MAX!',
        outgoing: false,
      });
    });
    await waitFor(() => {
      expect(deleteMock).toHaveBeenCalledWith(credentials, 123);
    });
  });

  it('should delete non-text notifications without adding messages', async () => {
    const store = makeStore();
    const stateNotification: Notification = {
      receiptId: 456,
      body: { typeWebhook: 'stateInstanceChanged' },
    };
    receiveMock.mockResolvedValueOnce(stateNotification);
    idleQueue();
    service = new PollingService(10, 5);

    service.start(store);

    await waitFor(() => {
      expect(deleteMock).toHaveBeenCalledWith(credentials, 456);
    });
    expect(store.getState().chats.order).toHaveLength(0);
  });

  it('should keep polling after a receive error (backoff) and process the next notification', async () => {
    const store = makeStore();
    receiveMock.mockRejectedValueOnce(new Error('network down'));
    receiveMock.mockResolvedValueOnce(incomingTextNotification);
    idleQueue();
    service = new PollingService(10, 5);

    service.start(store);

    await waitFor(() => {
      expect(store.getState().chats.chats[CHAT_ID]?.messages).toHaveLength(1);
    });
    await waitFor(() => {
      expect(deleteMock).toHaveBeenCalledWith(credentials, 123);
    });
  });

  it('should set pollingFailed after several errors and clear it after recovery', async () => {
    const store = makeStore();
    receiveMock.mockRejectedValue(new Error('network down'));
    service = new PollingService(10, 5);

    service.start(store);

    await waitFor(() => {
      expect(store.getState().ui.pollingFailed).toBe(true);
    });

    receiveMock.mockResolvedValueOnce(incomingTextNotification);
    idleQueue();

    await waitFor(() => {
      expect(store.getState().ui.pollingFailed).toBe(false);
    });
  });
});
