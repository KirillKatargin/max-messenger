import type {
  Credentials,
  DeleteNotificationResponse,
  InstanceSettings,
  Notification,
  SendMessageResponse,
  SetSettingsResponse,
  StateInstanceResponse,
} from '../types';

export class GreenApiError extends Error {
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'GreenApiError';
    this.status = status;
  }
}

export const MAX_MESSAGE_LENGTH = 4000;
export const DEFAULT_RECEIVE_TIMEOUT = 20;

function buildUrl(credentials: Credentials, method: string, suffix = ''): string {
  const base = credentials.apiUrl.replace(/\/+$/, '');
  return `${base}/waInstance${credentials.idInstance}/${method}/${credentials.apiTokenInstance}${suffix}`;
}

async function parseError(response: Response): Promise<GreenApiError> {
  let message = `HTTP ${response.status}`;
  try {
    const data: unknown = await response.json();
    if (
      typeof data === 'object' &&
      data !== null &&
      'message' in data &&
      typeof (data as { message: unknown }).message === 'string'
    ) {
      message = (data as { message: string }).message;
    }
  } catch {
    console.error("Ошибка");
  }
  return new GreenApiError(message, response.status);
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw await parseError(response);
  }
  const text = await response.text();
  if (!text) {
    return null as T;
  }
  return JSON.parse(text) as T;
}

export const greenApi = {
  getStateInstance(credentials: Credentials): Promise<StateInstanceResponse> {
    return request<StateInstanceResponse>(buildUrl(credentials, 'getStateInstance'));
  },

  sendMessage(
    credentials: Credentials,
    chatId: string,
    message: string,
  ): Promise<SendMessageResponse> {
    return request<SendMessageResponse>(buildUrl(credentials, 'sendMessage'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, message }),
    });
  },

  async receiveNotification(
    credentials: Credentials,
    signal?: AbortSignal,
    receiveTimeout = DEFAULT_RECEIVE_TIMEOUT,
  ): Promise<Notification | null> {
    return request<Notification | null>(
      buildUrl(credentials, 'receiveNotification', `?receiveTimeout=${receiveTimeout}`),
      { signal },
    );
  },

  deleteNotification(
    credentials: Credentials,
    receiptId: number,
  ): Promise<DeleteNotificationResponse> {
    return request<DeleteNotificationResponse>(
      buildUrl(credentials, 'deleteNotification', `/${receiptId}`),
      { method: 'DELETE' },
    );
  },

  getSettings(credentials: Credentials): Promise<InstanceSettings> {
    return request<InstanceSettings>(buildUrl(credentials, 'getSettings'));
  },

  setSettings(
    credentials: Credentials,
    settings: InstanceSettings,
  ): Promise<SetSettingsResponse> {
    return request<SetSettingsResponse>(buildUrl(credentials, 'setSettings'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
  },
};
