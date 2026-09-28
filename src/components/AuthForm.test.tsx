import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import AuthForm from './AuthForm';
import { server } from '../test/server';
import { renderWithProviders } from '../test/utils';

function mockStateInstance(stateInstance: string) {
  server.use(
    http.get('*/waInstance*/getStateInstance/*', () => HttpResponse.json({ stateInstance })),
  );
}

async function fillAndSubmit(
  user: ReturnType<typeof userEvent.setup>,
  idInstance: string,
  token: string,
) {
  await user.type(screen.getByLabelText('idInstance'), idInstance);
  await user.type(screen.getByLabelText('apiTokenInstance'), token);
  await user.click(screen.getByRole('button', { name: 'Войти' }));
}

describe('AuthForm', () => {
  it('should show validation error when idInstance is not numeric', async () => {
    const user = userEvent.setup();

    renderWithProviders(<AuthForm />);
    await fillAndSubmit(user, 'abc', 'token');

    expect(await screen.findByText('idInstance должен состоять из цифр')).toBeInTheDocument();
  });

  it('should save credentials when instance is authorized', async () => {
    mockStateInstance('authorized');
    const user = userEvent.setup();
    const { store } = renderWithProviders(<AuthForm />);

    await fillAndSubmit(user, '1234567890', 'valid-token');

    await waitFor(() => {
      expect(store.getState().auth.credentials).toEqual({
        idInstance: '1234567890',
        apiTokenInstance: 'valid-token',
        apiUrl: 'https://api.green-api.com',
      });
    });
    expect(await screen.findByText(/Инстанс авторизован/)).toBeInTheDocument();
  });

  it('should show error toast and keep user logged out when instance is not authorized', async () => {
    mockStateInstance('notAuthorized');
    const user = userEvent.setup();
    const { store } = renderWithProviders(<AuthForm />);

    await fillAndSubmit(user, '1234567890', 'valid-token');

    expect(await screen.findByText(/Инстанс не авторизован/)).toBeInTheDocument();
    expect(store.getState().auth.credentials).toBeNull();
  });

  it('should show error toast when the API rejects credentials', async () => {
    server.use(
      http.get('*/waInstance*/getStateInstance/*', () =>
        HttpResponse.json({ message: 'Invalid account data' }, { status: 401 }),
      ),
    );
    const user = userEvent.setup();
    renderWithProviders(<AuthForm />);

    await fillAndSubmit(user, '1234567890', 'wrong-token');

    expect(await screen.findByText(/Ошибка входа: Invalid account data/)).toBeInTheDocument();
  });
});
