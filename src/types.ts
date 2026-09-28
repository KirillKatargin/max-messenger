export type Credentials = {
  idInstance: string;
  apiTokenInstance: string;
  apiUrl: string;
};

export type MessageStatus = 'sending' | 'sent' | 'error';

export type Message = {
  id: string;
  chatId: string;
  text: string;
  timestamp: number;
  outgoing: boolean;
  status: MessageStatus;
};

export type Chat = {
  chatId: string;
  name: string;
  messages: Message[];
};

export type WebhookBody = {
  typeWebhook: string;
  idMessage?: string;
  timestamp?: number;
  senderData?: {
    chatId?: string;
    sender?: string;
    senderName?: string;
    senderContactName?: string;
    chatName?: string;
    senderPhoneNumber?: number;
  };
  messageData?: {
    typeMessage?: string;
    textMessageData?: {
      textMessage?: string;
    };
    extendedTextMessageData?: {
      text?: string;
    };
  };
};

export type Notification = {
  receiptId: number;
  body: WebhookBody;
};

export type IncomingTextMessage = {
  chatId: string;
  text: string;
  idMessage: string;
  timestamp: number;
  senderName?: string;
};

export function extractIncomingTextMessage(body: WebhookBody): IncomingTextMessage | null {
  if (body.typeWebhook !== 'incomingMessageReceived') {
    return null;
  }
  const messageData = body.messageData;
  const text =
    messageData?.typeMessage === 'textMessage'
      ? messageData.textMessageData?.textMessage
      : messageData?.typeMessage === 'extendedTextMessage'
        ? messageData.extendedTextMessageData?.text
        : undefined;
  // В MAX senderData.chatId — внутренний числовой ID чата, а не 79XXX@c.us.
  // Маппим на телефонный chatId через senderPhoneNumber, чтобы входящие
  // попадали в тот же чат, что и исходящие.
  const phone = body.senderData?.senderPhoneNumber;
  const chatId =
    typeof phone === 'number' ? `${phone}@c.us` : body.senderData?.chatId;
  if (
    typeof text !== 'string' ||
    typeof chatId !== 'string' ||
    typeof body.idMessage !== 'string' ||
    typeof body.timestamp !== 'number'
  ) {
    return null;
  }
  return {
    chatId,
    text,
    idMessage: body.idMessage,
    timestamp: body.timestamp,
    senderName: body.senderData?.senderContactName ?? body.senderData?.senderName,
  };
}

export type SendMessageResponse = {
  idMessage: string;
};

export type StateInstanceResponse = {
  stateInstance: string;
};

export type DeleteNotificationResponse = {
  result: boolean;
};

export type InstanceSettings = {
  incomingWebhook?: string;
  outgoingWebhook?: string;
  outgoingMessageWebhook?: string;
  outgoingAPIMessageWebhook?: string;
  stateWebhook?: string;
  statusInstanceWebhook?: string;
  deviceWebhook?: string;
  [key: string]: unknown;
};

export type SetSettingsResponse = {
  saveSettings: boolean;
};
