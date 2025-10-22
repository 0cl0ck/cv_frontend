import axios from 'axios';

// Instance axios configurée pour notre API
// En développement : pointe vers backend PayloadCMS sur port 8080
// En production : utilise les routes BFF Next.js (/api/*) comme proxy vers le backend
// BaseURL dynamique: absolue côté serveur (SSR), relative côté navigateur
const isServer = typeof window === 'undefined';
const devPort = process.env.PORT || '3000';
const siteUrl = isServer
  ? (process.env.NEXT_PUBLIC_SITE_URL
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${devPort}`))
  : '';

export const httpClient = axios.create({
  baseURL: isServer ? `${siteUrl}/api` : '/api',
  // CORS: toujours envoyer les cookies (httpOnly)
  withCredentials: true,
  // Timeout raisonnable
  timeout: 10000,
  // Headers par défaut
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token CSRF aux requêtes mutatives
httpClient.interceptors.request.use((config) => {
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
          const token = decodeURIComponent(match[1]);
          // Ensure both canonical and lowercase header keys are set for tests and server compatibility
          if (config.headers instanceof axios.AxiosHeaders) {
            config.headers.set('X-CSRF-Token', token);
            config.headers.set('x-csrf-token', token);
          } else {
            const headers = new axios.AxiosHeaders(config.headers);
            headers.set('X-CSRF-Token', token);
            headers.set('x-csrf-token', token);
            config.headers = headers;
          }
        }
      }
    }
  }
  return config;
}, (error) => {
  console.error('[httpClient] Erreur de requête:', error.message);
  return Promise.reject(error);
});

// Intercepteur de réponse pour gérer les erreurs CORS et authentification
httpClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      console.error('[httpClient] Erreur réseau - vérifiez CORS/backend:', error);
    }
    
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Token expiré ou invalide - déclencher refresh auth
      window.dispatchEvent(new CustomEvent('auth-expired'));
    }
    
    return Promise.reject(error);
  }
);

// Déclaration de type pour withCsrf
declare module 'axios' {
  interface AxiosRequestConfig {
    withCsrf?: boolean;
  }
}
