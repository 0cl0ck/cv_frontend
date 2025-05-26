import axios from 'axios';

export const httpClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 50000,
});

// Intercepteur pour ajouter le token CSRF aux requêtes mutatives
httpClient.interceptors.request.use(config => {
  // S'assurer que les cookies sont toujours envoyés
  config.withCredentials = true;

  const method = config.method?.toLowerCase();
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

  return config;
});
