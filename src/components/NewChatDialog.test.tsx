import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import NewChatDialog from './NewChatDialog';
import { renderWithProviders } from '../test/utils';

function renderDialog() {
  const onClose = vi.fn();
  const result = renderWithProviders(<NewChatDialog open onClose={onClose} />);
  return { ...result, onClose };
}

describe('NewChatDialog', () => {
  it('should create a chat with a valid phone number and close', async () => {
    const user = userEvent.setup();
    const { store, onClose } = renderDialog();

    await user.type(screen.getByLabelText('Номер телефона'), '79536996906');
    await user.click(screen.getByRole('button', { name: 'Создать' }));

    const { chats } = store.getState().chats;
    expect(chats['79536996906@c.us']).toMatchObject({ name: '+7 (953) 699-69-06' });
    expect(store.getState().chats.activeChatId).toBe('79536996906@c.us');
    expect(onClose).toHaveBeenCalled();
  });

  it('should apply the phone mask while typing', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.type(screen.getByLabelText('Номер телефона'), '7953699');

    expect(screen.getByLabelText('Номер телефона')).toHaveValue('+7 (953) 699');
  });

  it('should show an error and not create a chat for an invalid number', async () => {
    const user = userEvent.setup();
    const { store, onClose } = renderDialog();

    await user.type(screen.getByLabelText('Номер телефона'), '123');
    await user.click(screen.getByRole('button', { name: 'Создать' }));

    expect(await screen.findByText(/Введите корректный номер/)).toBeInTheDocument();
    expect(store.getState().chats.order).toHaveLength(0);
    expect(onClose).not.toHaveBeenCalled();
  });
});
