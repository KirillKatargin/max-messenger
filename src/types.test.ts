import { describe, expect, it } from 'vitest';
import { extractIncomingTextMessage, type WebhookBody } from './types';

const baseBody: WebhookBody = {
  typeWebhook: 'incomingMessageReceived',
  idMessage: 'MSG-1',
  timestamp: 1_700_000_000,
  senderData: { chatId: '79991234567@c.us', senderName: 'Тест' },
};

describe('extractIncomingTextMessage', () => {
  it('should extract a plain textMessage webhook', () => {
    const body: WebhookBody = {
      ...baseBody,
      messageData: { typeMessage: 'textMessage', textMessageData: { textMessage: 'Привет' } },
    };

    expect(extractIncomingTextMessage(body)).toMatchObject({
      chatId: '79991234567@c.us',
      text: 'Привет',
      idMessage: 'MSG-1',
    });
  });

  it('should extract an extendedTextMessage webhook', () => {
    const body: WebhookBody = {
      ...baseBody,
      messageData: {
        typeMessage: 'extendedTextMessage',
        extendedTextMessageData: { text: 'Со ссылкой https://example.com' },
      },
    };

    expect(extractIncomingTextMessage(body)).toMatchObject({
      text: 'Со ссылкой https://example.com',
    });
  });

  it('should map the chat to a phone-based chatId when senderPhoneNumber is present (MAX internal chat ids)', () => {
    const body: WebhookBody = {
      ...baseBody,
      senderData: { chatId: '65934219', senderPhoneNumber: 79536996906 },
      messageData: { typeMessage: 'textMessage', textMessageData: { textMessage: 'Привет' } },
    };

    expect(extractIncomingTextMessage(body)).toMatchObject({
      chatId: '79536996906@c.us',
    });
  });

  it('should return null for a non-message webhook', () => {
    const body: WebhookBody = { typeWebhook: 'stateInstanceChanged' };

    expect(extractIncomingTextMessage(body)).toBeNull();
  });

  it('should return null for an incoming webhook of a non-text type', () => {
    const body: WebhookBody = {
      ...baseBody,
      messageData: { typeMessage: 'imageMessage' },
    };

    expect(extractIncomingTextMessage(body)).toBeNull();
  });
});
