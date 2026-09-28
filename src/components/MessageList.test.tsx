import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import MessageList from './MessageList';
import { renderWithProviders } from '../test/utils';
import type { Message } from '../types';

const CHAT_ID = '79991234567@c.us';

function makeMessage(overrides: Partial<Message>): Message {
  return {
    id: 'msg-1',
    chatId: CHAT_ID,
    text: 'Текст',
    timestamp: new Date('2026-09-16T13:24:00').getTime(),
    outgoing: false,
    status: 'sent',
    ...overrides,
  };
}

describe('MessageList', () => {
  it('should show a placeholder when there are no messages', () => {
    renderWithProviders(<MessageList messages={[]} />);

    expect(screen.getByText('Сообщений пока нет')).toBeInTheDocument();
  });

  it('should render messages grouped under a date separator', () => {
    renderWithProviders(
      <MessageList
        messages={[
          makeMessage({ id: 'm1', text: 'Здравствуйте!' }),
          makeMessage({ id: 'm2', text: 'Добрый день', outgoing: true }),
        ]}
      />,
    );

    expect(screen.getByText('16 сентября 2026 г.')).toBeInTheDocument();
    expect(screen.getByText('Здравствуйте!')).toBeInTheDocument();
    expect(screen.getByText('Добрый день')).toBeInTheDocument();
  });

  it('should show a sent status icon only for outgoing messages', () => {
    renderWithProviders(
      <MessageList
        messages={[
          makeMessage({ id: 'm1', text: 'Входящее', outgoing: false }),
          makeMessage({ id: 'm2', text: 'Исходящее', outgoing: true }),
        ]}
      />,
    );

    expect(screen.getAllByLabelText('Отправлено')).toHaveLength(1);
  });
});
