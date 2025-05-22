export interface HttpError extends Error {
  status?: number;
  data?: unknown;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function fetchJson<T>(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<T> {
  const url =
    typeof input === 'string' && !input.startsWith('http')
      ? `${API_BASE_URL}${input.startsWith('/') ? '' : '/'}${input}`
      : input;

  const response = await fetch(url, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    ...init,
  });

  const text = await response.text();
  const data: unknown = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const errorMessage =
      data && typeof data === 'object' && 'message' in data
        ? (data as { message?: string }).message
        : response.statusText;
    const error: HttpError = new Error(errorMessage || response.statusText);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data as T;
}

const client = {
  get: <T>(url: string, init?: RequestInit) =>
    fetchJson<T>(url, { method: 'GET', ...init }),
  post: <T, U>(url: string, body: U, init?: RequestInit) =>
    fetchJson<T>(url, {
      method: 'POST',
      body: JSON.stringify(body),
      ...init,
    }),
  put: <T, U>(url: string, body: U, init?: RequestInit) =>
    fetchJson<T>(url, {
      method: 'PUT',
      body: JSON.stringify(body),
      ...init,
    }),
  patch: <T, U>(url: string, body: U, init?: RequestInit) =>
    fetchJson<T>(url, {
      method: 'PATCH',
      body: JSON.stringify(body),
      ...init,
    }),
  delete: <T>(url: string, init?: RequestInit) =>
    fetchJson<T>(url, { method: 'DELETE', ...init }),
};

export default client;
