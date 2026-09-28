import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Credentials } from '../types';

const CREDENTIALS_KEY = 'ga:credentials';

type AuthState = {
  credentials: Credentials | null;
};

function isCredentials(value: unknown): value is Credentials {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const v = value as Record<string, unknown>;
  return (
    typeof v.idInstance === 'string' &&
    typeof v.apiTokenInstance === 'string' &&
    typeof v.apiUrl === 'string'
  );
}

export function loadCredentials(): Credentials | null {
  try {
    const raw = localStorage.getItem(CREDENTIALS_KEY);
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    return isCredentials(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function persistCredentials(credentials: Credentials | null): void {
  try {
    if (credentials) {
      localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
    } else {
      localStorage.removeItem(CREDENTIALS_KEY);
    }
  } catch {
    console.error("Ошибка сохранения данных:");
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState: { credentials: loadCredentials() } as AuthState,
  reducers: {
    setCredentials(state, action: PayloadAction<Credentials>) {
      state.credentials = action.payload;
      persistCredentials(action.payload);
    },
    logout(state) {
      state.credentials = null;
      persistCredentials(null);
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
