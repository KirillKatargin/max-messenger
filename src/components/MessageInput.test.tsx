import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse, type HttpResponseResolver } from 'msw';
import { describe, expect, it } from 'vitest';
import MessageInput from './MessageInput';
import { server } from '../test/server';
import { renderWithProviders } from '../test/utils';
import type { RootState } from '../store/store';

const CHAT_ID = '79991234567@c.us';

const preloadedState: Partial<RootState> = {
  auth: {
    credentials: {
      idInstance: '1234567890',
      apiTokenInstance: 'token',
      apiUrl: 'https://api.green-api.com',
    },
  },
  chats: {
    chats: {
      [CHAT_ID]: { chatId: CHAT_ID, name: '+79991234567', messages: [] },
    },
    order: [CHAT_ID],
    activeChatId: CHAT_ID,
  },
};

function mockSendMessage(handler?: HttpResponseResolver) {
  server.use(
    http.post(
      '*/waInstance*/sendMessage/*',
      handler ?? (() => HttpResponse.json({ idMessage: 'server-id-1' })),
    ),
  );
}

describe('MessageInput', () => {
  it('should send the message, clear the input and mark it as sent', async () => {
    mockSendMessage();
    const user = userEvent.setup();
    const { store } = renderWithProviders(<MessageInput chatId={CHAT_ID} />, { preloadedState });

    await user.type(screen.getByLabelText('Сообщение'), 'Привет!');
    await user.click(screen.getByRole('button', { name: 'Отправить сообщение' }));

    await waitFor(() => {
      const messages = store.getState().chats.chats[CHAT_ID].messages;
      expect(messages).toHaveLength(1);
      expect(messages[0].status).toBe('sent');
      expect(messages[0].id).toBe('server-id-1');
    });
    expect(screen.getByLabelText('Сообщение')).toHaveValue('');
  });

  it('should mark the message as failed and show a toast when the API returns an error', async () => {
    mockSendMessage(() => HttpResponse.json({ message: 'Forbidden' }, { status: 403 }));
    const user = userEvent.setup();
    const { store } = renderWithProviders(<MessageInput chatId={CHAT_ID} />, { preloadedState });

    await user.type(screen.getByLabelText('Сообщение'), 'Привет!');
    await user.click(screen.getByRole('button', { name: 'Отправить сообщение' }));

    expect(await screen.findByText(/Сообщение не отправлено: Forbidden/)).toBeInTheDocument();
    await waitFor(() => {
      expect(store.getState().chats.chats[CHAT_ID].messages[0].status).toBe('error');
    });
  });

  it('should keep the send button disabled while the input is empty', () => {
    renderWithProviders(<MessageInput chatId={CHAT_ID} />, { preloadedState });

    expect(screen.getByRole('button', { name: 'Отправить сообщение' })).toBeDisabled();
  });
});
