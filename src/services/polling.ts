import type { Store } from '@reduxjs/toolkit';
import { greenApi } from '../api/greenApi';
import { extractIncomingTextMessage, type Credentials } from '../types';
import { addChat, addMessage } from '../store/chatsSlice';
import { addToast, setPollingFailed } from '../store/uiSlice';
import type { RootState } from '../store/store';

// Каждое уведомление обязательно удаляется через deleteNotification,
// иначе GREEN-API пришлёт его повторно.
// GREEN-API для MAX не держит long-polling: пустой ответ приходит мгновенно,
// поэтому между пустыми опросами выдерживаем pollIntervalMs, чтобы не штормить API.
const MAX_BACKOFF_MS = 30_000;
const BASE_BACKOFF_MS = 1_000;
const DEFAULT_POLL_INTERVAL_MS = 1_000;
const MAX_SILENT_FAILURES = 3;

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve(), ms);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });
}

export class PollingService {
  private abortController: AbortController | null = null;
  private failCount = 0;
  private failureNotified = false;

  constructor(
    private readonly baseBackoffMs = BASE_BACKOFF_MS,
    private readonly pollIntervalMs = DEFAULT_POLL_INTERVAL_MS,
  ) {}

  get isRunning(): boolean {
    return this.abortController !== null;
  }

  start(store: Store<RootState>): void {
    if (this.isRunning) {
      return;
    }
    this.abortController = new AbortController();
    this.failCount = 0;
    void this.loop(store, this.abortController.signal);
  }

  stop(): void {
    this.abortController?.abort();
    this.abortController = null;
  }

  restart(store: Store<RootState>): void {
    this.stop();
    this.start(store);
  }

  private async loop(store: Store<RootState>, signal: AbortSignal): Promise<void> {
    while (!signal.aborted) {
      const credentials = store.getState().auth.credentials;
      if (!credentials) {
        return;
      }
      try {
        const received = await this.pollOnce(store, credentials, signal);
        this.failCount = 0;
        if (this.failureNotified) {
          this.failureNotified = false;
          store.dispatch(setPollingFailed(false));
        }
        if (!received) {
          await sleep(this.pollIntervalMs, signal);
        }
      } catch (error) {
        if (signal.aborted || (error instanceof DOMException && error.name === 'AbortError')) {
          return;
        }
        this.failCount += 1;
        if (this.failCount >= MAX_SILENT_FAILURES && !this.failureNotified) {
          this.failureNotified = true;
          store.dispatch(setPollingFailed(true));
        }
        const delay = Math.min(this.baseBackoffMs * 2 ** this.failCount, MAX_BACKOFF_MS);
        try {
          await sleep(delay, signal);
        } catch {
          return;
        }
      }
    }
  }

  private async pollOnce(
    store: Store<RootState>,
    credentials: Credentials,
    signal: AbortSignal,
  ): Promise<boolean> {
    const notification = await greenApi.receiveNotification(credentials, signal);
    if (!notification) {
      return false;
    }
    try {
      const incoming = extractIncomingTextMessage(notification.body);
      if (incoming) {
        store.dispatch(addChat({ chatId: incoming.chatId, name: incoming.senderName ?? incoming.chatId }));
        store.dispatch(
          addMessage({
            id: incoming.idMessage,
            chatId: incoming.chatId,
            text: incoming.text,
            timestamp: incoming.timestamp * 1000,
            outgoing: false,
            status: 'sent',
          }),
        );
      }
      // Прочие типы вебхуков игнорируем, но всё равно удаляем из очереди ниже.
    } finally {
      try {
        await greenApi.deleteNotification(credentials, notification.receiptId);
      } catch {
        store.dispatch(
          addToast({
            type: 'error',
            message: 'Не удалось подтвердить получение уведомления',
          }),
        );
      }
    }
    return true;
  }
}

export const pollingService = new PollingService();
