import { useState, type FormEvent } from 'react';
import { greenApi, GreenApiError } from '../api/greenApi';
import { setCredentials } from '../store/authSlice';
import { addToast } from '../store/uiSlice';
import { useAppDispatch } from '../hooks/hooks';
import { cn } from '../utils/cn';

const DEFAULT_API_URL = 'https://api.green-api.com';

type FormErrors = {
  idInstance?: string;
  apiTokenInstance?: string;
  apiUrl?: string;
};

function validate(idInstance: string, apiTokenInstance: string, apiUrl: string): FormErrors {
  const errors: FormErrors = {};
  if (!/^\d+$/.test(idInstance.trim())) {
    errors.idInstance = 'idInstance должен состоять из цифр';
  }
  if (!apiTokenInstance.trim()) {
    errors.apiTokenInstance = 'Введите apiTokenInstance';
  }
  try {
    const url = new URL(apiUrl.trim());
    if (url.protocol !== 'https:') {
      errors.apiUrl = 'API URL должен использовать https';
    }
  } catch {
    errors.apiUrl = 'Некорректный URL';
  }
  return errors;
}

const inputClass = (hasError: boolean) =>
  cn(
    'w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:ring-2',
    hasError
      ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200',
  );

export default function AuthForm() {
  const dispatch = useAppDispatch();
  const [idInstance, setIdInstance] = useState('');
  const [apiTokenInstance, setApiTokenInstance] = useState('');
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formErrors = validate(idInstance, apiTokenInstance, apiUrl);
    setErrors(formErrors);
    if (Object.keys(formErrors).length > 0) {
      return;
    }
    const credentials = {
      idInstance: idInstance.trim(),
      apiTokenInstance: apiTokenInstance.trim(),
      apiUrl: apiUrl.trim(),
    };
    setLoading(true);
    try {
      const { stateInstance } = await greenApi.getStateInstance(credentials);
      if (stateInstance === 'authorized') {
        dispatch(setCredentials(credentials));
        dispatch(addToast({ type: 'success', message: 'Инстанс авторизован, добро пожаловать!' }));
      } else {
        dispatch(
          addToast({
            type: 'error',
            message: `Инстанс не авторизован (статус: ${stateInstance}). Авторизуйте его в личном кабинете GREEN-API.`,
          }),
        );
      }
    } catch (error) {
      const message =
        error instanceof GreenApiError
          ? error.message
          : 'Не удалось подключиться к GREEN-API. Проверьте данные и сеть.';
      dispatch(addToast({ type: 'error', message: `Ошибка входа: ${message}` }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-100 to-blue-200 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold text-gray-900">MAX Чат</h1>
          <p className="mt-1 text-sm text-gray-500">
            Войдите с учётными данными GREEN-API
          </p>
        </div>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <div>
            <label htmlFor="idInstance" className="mb-1 block text-sm font-medium text-gray-700">
              idInstance
            </label>
            <input
              id="idInstance"
              name="idInstance"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              placeholder="1101234567"
              value={idInstance}
              onChange={(e) => setIdInstance(e.target.value)}
              className={inputClass(Boolean(errors.idInstance))}
            />
            {errors.idInstance && (
              <p className="mt-1 text-xs text-red-500">{errors.idInstance}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="apiTokenInstance"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              apiTokenInstance
            </label>
            <input
              id="apiTokenInstance"
              name="apiTokenInstance"
              type="password"
              autoComplete="off"
              placeholder="••••••••••••••••"
              value={apiTokenInstance}
              onChange={(e) => setApiTokenInstance(e.target.value)}
              className={inputClass(Boolean(errors.apiTokenInstance))}
            />
            {errors.apiTokenInstance && (
              <p className="mt-1 text-xs text-red-500">{errors.apiTokenInstance}</p>
            )}
          </div>
          <div>
            <label htmlFor="apiUrl" className="mb-1 block text-sm font-medium text-gray-700">
              API URL
            </label>
            <input
              id="apiUrl"
              name="apiUrl"
              type="url"
              autoComplete="off"
              placeholder={DEFAULT_API_URL}
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              className={inputClass(Boolean(errors.apiUrl))}
            />
            {errors.apiUrl && <p className="mt-1 text-xs text-red-500">{errors.apiUrl}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className={cn(
              'mt-2 w-full rounded-lg py-2.5 text-sm font-medium text-white transition',
              loading
                ? 'cursor-not-allowed bg-blue-300'
                : 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700',
            )}
          >
            {loading ? 'Проверка…' : 'Войти'}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-gray-400">
          Данные хранятся только в вашем браузере (localStorage)
        </p>
      </div>
    </div>
  );
}
