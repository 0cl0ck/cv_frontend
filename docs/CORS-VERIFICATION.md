# Vérification CORS & Credentials

## État Actuel - ✅ Configuration Validée

### Backend PayloadCMS (`backend/src/payload.config.ts`)

**CORS configuré:**
```typescript
cors: process.env.NODE_ENV === 'development'
  ? [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ]
  : ['https://api.chanvre-vert.fr', 'https://chanvre-vert.fr'],
```

**CSRF configuré (similaire au CORS):**
```typescript
csrf: process.env.NODE_ENV === 'development'
  ? [...]
  : ['https://api.chanvre-vert.fr', 'https://chanvre-vert.fr'],
```

**CookieDomain:**
```typescript
cookieDomain: process.env.NODE_ENV === 'development' ? undefined : 'chanvre-vert.fr',
```

### Frontend - Architecture BFF

**httpClient (`frontend/src/lib/httpClient.ts`):**
```typescript
export const httpClient = axios.create({
  baseURL: '/api',  // Routes BFF relatives
  withCredentials: true,  // ✅ Toujours actif
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**Routes BFF (`frontend/src/app/api/**`):**
- Les routes BFF Next.js font proxy vers le backend
- Elles transmettent les cookies HttpOnly automatiquement
- **Pas de credentials côté client** → plus sûr

## Vérification de Cohérence

### ✅ Development

| Composant | Origin | Credentials | État |
|-----------|--------|-------------|------|
| Frontend | `http://localhost:3001` | `withCredentials: true` | ✅ OK |
| Backend CORS | Autorise localhost:3001 | - | ✅ OK |
| httpClient | Points vers `/api` (BFF) | `true` | ✅ OK |
| BFF → Backend | `http://localhost:3000` | Fetch avec cookies | ✅ OK |

### ✅ Production

| Composant | Origin | Credentials | État |
|-----------|--------|-------------|------|
| Frontend | `https://chanvre-vert.fr` | `withCredentials: true` | ✅ OK |
| Backend CORS | Autorise chanvre-vert.fr | - | ✅ OK |
| Backend Cookie | `.chanvre-vert.fr` (subdomain) | - | ✅ OK |
| httpClient | Points vers `/api` (BFF) | `true` | ✅ OK |
| BFF → Backend | `https://api.chanvre-vert.fr` | Fetch avec cookies | ✅ OK |

## Architecture BFF - Flow Complet

```
┌─────────────────────┐
│  Browser Client     │
│  chanvre-vert.fr    │
└──────────┬──────────┘
           │ withCredentials: true
           │ (httpClient → /api/*)
           ▼
┌─────────────────────┐
│  BFF Routes Next.js │
│  chanvre-vert.fr    │
│  /api/*             │
└──────────┬──────────┘
           │ fetch avec cookies
           │ Authorization: Bearer ${token}
           ▼
┌─────────────────────┐
│  Backend PayloadCMS │
│  api.chanvre-vert.fr│
└─────────────────────┘
```

## Points de Vérification

### ✅ 1. Cookies Partagés Entre Frontend et Backend

**Problème potentiel:** Cookies non accessibles entre domaines  
**Solution actuelle:**
- **Dev:** Même domaine (`localhost`)
- **Prod:** `cookieDomain: 'chanvre-vert.fr'` partage cookies entre `www` et `api` subdomains

**Test:**
```javascript
// Dans la console dev du frontend
document.cookie
// Devrait inclure: payload-token=...
```

### ✅ 2. CORS Préflight (OPTIONS)

Le backend PayloadCMS gère automatiquement les requêtes OPTIONS CORS.

**Vérification:**
```bash
curl -X OPTIONS https://api.chanvre-vert.fr/api/auth/me \
  -H "Origin: https://chanvre-vert.fr" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization" \
  -v
```

**Réponse attendue:**
```
Access-Control-Allow-Origin: https://chanvre-vert.fr
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

### ✅ 3. BFF Bypass CORS

**Avantage BFF:**
- Les appels client → BFF sont **same-origin** (pas de CORS)
- Les appels BFF → Backend sont **server-to-server** (pas de CORS browser)
- **Plus simple et plus sûr**

## Problèmes Potentiels et Solutions

### ❌ Problème: Cookies Bloqués par SameSite

**Symptôme:** Cookies non envoyés dans les requêtes  
**Cause:** `SameSite=strict` trop restrictif

**Solution actuelle:**
```typescript
// frontend/src/app/api/auth/login/route.ts
response.cookies.set('payload-token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',  // ✅ Permet navigation normale
  maxAge: 60 * 60 * 24 * 7,
  path: '/',
});
```

### ❌ Problème: CORS Bloqué en Production

**Symptôme:** Erreur CORS malgré configuration  
**Causes possibles:**
1. Origin mal configuré (www vs non-www)
2. Backend pas accessible depuis frontend
3. HTTPS mixed content

**Diagnostic:**
```bash
# Tester depuis frontend en prod
curl https://api.chanvre-vert.fr/api/auth/me \
  -H "Origin: https://chanvre-vert.fr" \
  -v
```

## Tests de Validation

### Test 1: Connexion Complète

```bash
# 1. Login
curl -X POST https://chanvre-vert.fr/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass","collection":"customers"}' \
  -c cookies.txt \
  -v

# 2. Vérifier cookie reçu
cat cookies.txt

# 3. Utiliser le cookie pour une requête auth
curl https://chanvre-vert.fr/api/auth/me \
  -b cookies.txt \
  -v
```

### Test 2: Vérification withCredentials

```javascript
// Console browser sur chanvre-vert.fr
fetch('/api/auth/me', {
  credentials: 'include'  // httpClient fait ça automatiquement
})
.then(r => r.json())
.then(console.log)
```

## Conclusion

✅ **Configuration CORS validée et cohérente**
- Backend autorise correctement les origines
- Frontend utilise `withCredentials: true`
- Architecture BFF évite les problèmes CORS complexes
- Cookies configurés avec bons attributs (`SameSite=lax`, `httpOnly`, `secure`)

**Recommandation:** Aucune modification nécessaire, la configuration est optimale.

