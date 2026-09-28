import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import type { ReactElement, ReactNode } from 'react';
import { setupStore, type AppStore, type RootState } from '../store/store';
import Toaster from '../components/Toaster';

type RenderWithProvidersOptions = {
  preloadedState?: Partial<RootState>;
  store?: AppStore;
};

export function renderWithProviders(
  ui: ReactElement,
  { preloadedState, store = setupStore(preloadedState) }: RenderWithProvidersOptions = {},
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <Provider store={store}>
        {children}
        <Toaster />
      </Provider>
    );
  }
  return { store, ...render(ui, { wrapper: Wrapper }) };
}
