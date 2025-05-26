import axios, { InternalAxiosRequestConfig } from 'axios';

// Determine the base URL based on environment
const getBaseUrl = () => {
  // In the browser, use relative URL
  if (typeof window !== 'undefined') {
    return '/api';
  }
  
  // During build/SSR, use the environment variable or a default
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  
  // Make sure we're using the proper API URL
  return apiUrl.endsWith('/api') ? apiUrl : `${apiUrl}/api`;
};

export const httpClient = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
  timeout: 50000,
});

// Type augmentation pour le config d'Axios
declare module 'axios' {
  interface AxiosRequestConfig {
    withCsrf?: boolean;
  }
}

// Intercepteur pour ajouter le token CSRF aux requêtes mutatives
httpClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // S'assurer que les cookies sont toujours envoyés
  config.withCredentials = true;

  const method = config.method?.toLowerCase();
  const needsCsrf =
  (method && ['post', 'put', 'patch', 'delete'].includes(method)) ||
  config.withCsrf === true;

if (needsCsrf) {
  if (method && ['post', 'put', 'patch', 'delete'].includes(method)) {
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/(?:^|; )csrf-token=([^;]+)/);
      if (match) {
        if (!config.headers) config.headers = new axios.AxiosHeaders();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (config.headers as any)['X-CSRF-Token'] = decodeURIComponent(match[1]);
      }
    }
  }
}
  return config;
});
