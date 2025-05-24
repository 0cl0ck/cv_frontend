# Frontend CSRF Flow

This document explains how the frontend handles CSRF protection when interacting with the backend API.

## 1. Obtain CSRF cookies

Call the endpoint `/api/csrf` using `httpClient` to generate the CSRF cookies:

```ts
import { httpClient } from '@/lib/httpClient';

await httpClient.get('/csrf', { withCredentials: true });
```

The backend responds with two cookies:

- `csrf-token`
- `csrf-sign`

These must be stored by the browser and sent with every mutating request.

## 2. Automatic header injection

`httpClient` includes an Axios interceptor that reads the `csrf-token` cookie and automatically adds it to every request under the header `X-CSRF-Token`.

```ts
httpClient.interceptors.request.use(config => {
  if (typeof document !== 'undefined') {
    const match = document.cookie.match(/csrf-token=([^;]+)/);
    if (match) {
      config.headers['X-CSRF-Token'] = match[1];
    }
  }
  return config;
});
```

All API calls must go through `httpClient` so the interceptor can work properly.

## 3. Example hook for secured requests

A custom hook can ensure the CSRF cookies are present and then perform a secured request:

```ts
import { useCallback } from 'react';
import { httpClient } from '@/lib/httpClient';

export function useSecureRequest() {
  const makeRequest = useCallback(async (path: string, data: unknown) => {
    await httpClient.get('/csrf');
    const response = await httpClient.post(path, data);
    return response.data;
  }, []);

  return { makeRequest };
}
```

This pattern ensures CSRF tokens are refreshed before each sensitive API call and that the proper header is included automatically.
