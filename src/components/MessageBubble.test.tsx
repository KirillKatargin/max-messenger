import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import MessageBubble from './MessageBubble';
import { server } from '../test/server';
import { renderWithProviders } from '../test/utils';
import type { Message } from '../types';
import type { RootState } from '../store/store';

const CHAT_ID = '79991234567@c.us';

function makeState(message: Message): Partial<RootState> {
  return {
    auth: {
      credentials: {
        idInstance: '1234567890',
        apiTokenInstance: 'token',
        apiUrl: 'https://api.green-api.com',
      },
    },
    chats: {
      chats: { [CHAT_ID]: { chatId: CHAT_ID, name: '+79991234567', messages: [message] } },
      order: [CHAT_ID],
      activeChatId: CHAT_ID,
    },
  };
}

const failedMessage: Message = {
  id: 'temp-failed',
  chatId: CHAT_ID,
  text: 'Не ушло',
  timestamp: Date.now(),
  outgoing: true,
  status: 'error',
};

describe('MessageBubble', () => {
  it('should show a retry button for a failed outgoing message', () => {
    renderWithProviders(<MessageBubble message={failedMessage} />, {
      preloadedState: makeState(failedMessage),
    });

    expect(screen.getByRole('button', { name: 'Повторить отправку' })).toBeInTheDocument();
  });

  it('should resend the message when retry is clicked', async () => {
    server.use(
      http.post('*/waInstance*/sendMessage/*', () =>
        HttpResponse.json({ idMessage: 'server-id-retry' }),
      ),
    );
    const user = userEvent.setup();
    const { store } = renderWithProviders(<MessageBubble message={failedMessage} />, {
      preloadedState: makeState(failedMessage),
    });

    await user.click(screen.getByRole('button', { name: 'Повторить отправку' }));

    await waitFor(() => {
      const messages = store.getState().chats.chats[CHAT_ID].messages;
      expect(messages).toHaveLength(1);
      expect(messages[0]).toMatchObject({ id: 'server-id-retry', status: 'sent', text: 'Не ушло' });
    });
  });

  it('should not show a retry button for an incoming message', () => {
    const incoming: Message = { ...failedMessage, outgoing: false, status: 'sent' };

    renderWithProviders(<MessageBubble message={incoming} />, {
      preloadedState: makeState(incoming),
    });

    expect(screen.queryByRole('button', { name: 'Повторить отправку' })).not.toBeInTheDocument();
  });
});
