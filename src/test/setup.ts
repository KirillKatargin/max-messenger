import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { server } from './server';

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
  Element.prototype.scrollIntoView = vi.fn();
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
  localStorage.clear();
  vi.restoreAllMocks();
});

afterAll(() => {
  server.close();
});
