import { useCallback, useState } from 'react';
import { greenApi, GreenApiError, MAX_MESSAGE_LENGTH } from '../api/greenApi';
import { addMessage, resolveOutgoingMessage, setMessageStatus } from '../store/chatsSlice';
import { addToast } from '../store/uiSlice';
import { useAppDispatch, useAppSelector } from './hooks';

export function useSendMessage() {
  const dispatch = useAppDispatch();
  const credentials = useAppSelector((state) => state.auth.credentials);
  const [sending, setSending] = useState(false);

  const send = useCallback(
    async (chatId: string, text: string): Promise<boolean> => {
      const trimmed = text.trim();
      if (!credentials || !trimmed || trimmed.length > MAX_MESSAGE_LENGTH) {
        return false;
      }
      const tempId = `temp-${crypto.randomUUID()}`;
      setSending(true);
      dispatch(
        addMessage({
          id: tempId,
          chatId,
          text: trimmed,
          timestamp: Date.now(),
          outgoing: true,
          status: 'sending',
        }),
      );
      try {
        const { idMessage } = await greenApi.sendMessage(credentials, chatId, trimmed);
        dispatch(resolveOutgoingMessage({ chatId, tempId, idMessage }));
        return true;
      } catch (error) {
        dispatch(setMessageStatus({ chatId, id: tempId, status: 'error' }));
        const message =
          error instanceof GreenApiError ? error.message : 'Ошибка сети при отправке сообщения';
        dispatch(addToast({ type: 'error', message: `Сообщение не отправлено: ${message}` }));
        return false;
      } finally {
        setSending(false);
      }
    },
    [credentials, dispatch],
  );

  return { send, sending };
}
