import { combineReducers, configureStore, type PreloadedStateShapeFromReducersMapObject } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import chatsReducer, { persistChats } from './chatsSlice';
import uiReducer from './uiSlice';

const rootReducer = combineReducers({
  auth: authReducer,
  chats: chatsReducer,
  ui: uiReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export function setupStore(preloadedState?: PreloadedStateShapeFromReducersMapObject<typeof rootReducer>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
  });
}

export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];

export const store = setupStore();

let persistTimer: ReturnType<typeof setTimeout> | undefined;

store.subscribe(() => {
  clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    const state = store.getState();
    const idInstance = state.auth.credentials?.idInstance;
    if (idInstance) {
      persistChats(idInstance, state.chats);
    }
  }, 300);
});
