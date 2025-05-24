# INTEGRATION FRONTEND ↔ BACKEND (RÉALITÉ ACTUELLE)

Ce document reflète l’état actuel de l’intégration entre le frontend et le backend, avec ses points de rupture connus.

## 1. Structure

- `/frontend` : Next.js + React (UI, pages, hooks, appels API)
- `/backend`  : Next.js API + PayloadCMS (middlewares, schémas, contrôleurs)

## 2. Environnements

- **Frontend** : `NEXT_PUBLIC_API_URL`
- **Backend**  : `PAYLOAD_SECRET`, `CSRF_SECRET`, `VIVA_*`, `MONGO_URI`, etc.

## 3. Base API

- **URL de base** : `http(s)://<backend_host>:<port>/api`
- **Frontend** : configuré dans `frontend/src/lib/httpClient.ts`

## 4. Authentification

### 4.1. AuthController (clients et admins)

- **POST** `/api/auth/login`  
  - Exempté de CSRF (EXEMPT_ROUTES inclut `/api/auth/login`)  
  - Renvoie cookie `payload-token` (HttpOnly)
- **POST** `/api/auth/logout` également exempté

### 4.2. PayloadCMS Admin UI

- UI servie sur `/admin` (même domaine que le backend)
- **POST** `/api/admins/login`  
  - **Non exempté** de CSRF → actuellement bloqué par `csrfMiddleware`  
  - **Issue** : impossible de se connecter au panel admin tant qu’on n’ajoute pas cette route à EXEMPT_ROUTES

## 5. CORS (backend/src/middlewares/cors.middleware.ts)

- **allowedOrigins** = [
    'http://localhost:3001',
    'http://127.0.0.1:3001',
    'https://www.chanvre-vert.fr',
    'https://chanvre-vert.fr'
  ]
- **Methods** : GET, POST, PUT, PATCH, DELETE, OPTIONS
- **Headers** autorisés : `Content-Type, Authorization, x-csrf-token`
- **Allow-Credentials** : true
- Origines hors whitelist → headers minimal (GET, POST, OPTIONS)

## 6. CSRF (backend/src/middlewares/csrf.middleware.ts)

- **EXEMPT_ROUTES** = [
  `/api/webhooks`,
  `/api/auth/login`,
  `/api/auth/logout`,
  `/api/csrf`
]
- Middleware appliqué à **toutes** les routes `/api/:path*`
- Bloque POST/PUT/PATCH/DELETE si :
  - pas de cookie `csrf-token` ou `csrf-sign`
  - pas d'en-tête `X-CSRF-Token` égal au cookie `csrf-token`
  - signature HMAC invalide

### 6.1. Frontend CSRF

- **CsrfInitializer** (`frontend/src/components/CsrfInitializer.tsx`) :
  ```ts
  httpClient.get('/csrf', { withCredentials: true });
  ```
  → installe les cookies `csrf-token` et `csrf-sign`

- Sur chaque appel mutatif :
  ```ts
  headers: { 'X-CSRF-Token': document.cookie.match(/csrf-token=([^;]+)/)[1] }
  ```

- **Note** : le middleware Next.js frontend (`frontend/src/middleware/middleware.ts`) contient une logique CSRF partielle, mais c’est **le backend** qui valide réellement.

## 7. Flux typique

1. Frontend (port 3001) → **GET** `/api/csrf` → backend crée cookies CSRF
2. Frontend → **POST** `/api/auth/login` + header CSRF → backend renvoie `payload-token`
3. Frontend → requêtes protégées (cookies + header CSRF)
4. Admin UI → **POST** `/api/admins/login` → **bloqué** faute d’exemption CSRF

## 8. Points d’action

- Ajouter `/api/admins/login` et `/api/admins/logout` à `EXEMPT_ROUTES` dans `csrf.middleware.ts`
- (Optionnel) Simplifier ou retirer la logique CSRF redondante côté frontend
- Mettre à jour ce document à chaque évolution de l’interface
