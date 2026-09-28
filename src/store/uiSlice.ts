import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export type ToastType = 'error' | 'info' | 'success';

export type Toast = {
  id: string;
  type: ToastType;
  message: string;
};

type UiState = {
  toasts: Toast[];
  pollingFailed: boolean;
};

const uiSlice = createSlice({
  name: 'ui',
  initialState: { toasts: [], pollingFailed: false } as UiState,
  reducers: {
    addToast(state, action: PayloadAction<{ type: ToastType; message: string }>) {
      state.toasts.push({
        id: crypto.randomUUID(),
        type: action.payload.type,
        message: action.payload.message,
      });
    },
    removeToast(state, action: PayloadAction<string>) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    setPollingFailed(state, action: PayloadAction<boolean>) {
      state.pollingFailed = action.payload;
    },
  },
});

export const { addToast, removeToast, setPollingFailed } = uiSlice.actions;
export default uiSlice.reducer;
