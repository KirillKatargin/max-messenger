import { useEffect } from 'react';
import AuthForm from './components/AuthForm';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';
import Toaster from './components/Toaster';
import { useAppSelector } from './hooks/hooks';
import { pollingService } from './services/polling';
import { store } from './store/store';

export default function App() {
  const credentials = useAppSelector((state) => state.auth.credentials);
  const pollingFailed = useAppSelector((state) => state.ui.pollingFailed);

  useEffect(() => {
    if (!credentials) {
      pollingService.stop();
      return;
    }
    pollingService.start(store);
    return () => pollingService.stop();
  }, [credentials]);

  return (
    <>
      {credentials && pollingFailed && (
        <div
          role="alert"
          className="fixed left-1/2 top-0 z-50 -translate-x-1/2 rounded-b-lg bg-amber-500 px-4 py-1.5 text-xs font-medium text-white shadow"
        >
          Нет соединения с GREEN-API — повторная попытка…
        </div>
      )}
      {credentials ? (
        <main className="flex h-screen overflow-hidden bg-white">
          <ChatList />
          <ChatWindow />
        </main>
      ) : (
        <AuthForm />
      )}
      <Toaster />
    </>
  );
}
