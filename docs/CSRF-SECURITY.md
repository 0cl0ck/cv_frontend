# Stratégie de Protection CSRF

## Vue d'ensemble

Cette application utilise une approche **double-submit cookie** pour la protection CSRF, complétée par une architecture BFF (Backend For Frontend) avec des cookies HttpOnly pour les tokens d'authentification.

## Architecture de Sécurité

### 1. Tokens d'Authentification (HttpOnly)

- Les tokens JWT sont stockés dans des cookies **HttpOnly** (`payload-token`)
- Ces cookies ne sont **jamais accessibles** depuis JavaScript côté client
- Les tokens sont transmis automatiquement par le navigateur via les cookies
- ✅ Protection contre XSS : impossible de voler les tokens via JavaScript injecté

### 2. Protection CSRF (Double-Submit Cookie)

#### Pourquoi le cookie CSRF n'est pas HttpOnly

Le pattern double-submit CSRF **nécessite** que le cookie soit lisible en JavaScript car:

1. Le client lit le cookie `csrf-token`
2. Le client envoie ce token dans le header `X-CSRF-Token`
3. Le serveur compare les deux valeurs

**C'est par design** : si le cookie CSRF était HttpOnly, le JavaScript ne pourrait pas le lire pour l'ajouter au header.

#### Protection Offerte

Même si le cookie CSRF est lisible en JS:
- Une attaque CSRF depuis un autre domaine ne peut pas lire les cookies (Same-Origin Policy)
- L'attaquant ne peut donc pas récupérer le token pour l'envoyer dans le header
- Le serveur rejette la requête si le header ne match pas le cookie

### 3. Architecture BFF (Backend For Frontend)

Toutes les requêtes sensibles passent par des routes Next.js qui agissent comme proxy:

```
Client (Browser) → /api/* (Next.js BFF) → Backend (PayloadCMS)
```

**Avantages:**
- Les tokens JWT restent côté serveur (dans les routes BFF)
- Pas d'exposition des tokens au navigateur
- Contrôle centralisé de l'authentification
- Possibilité d'ajouter des vérifications supplémentaires (Origin, Referer)

## Routes BFF Implémentées

### Authentification
- `POST /api/auth/login` - Connexion avec pose du cookie HttpOnly
- `POST /api/auth/logout` - Déconnexion avec suppression du cookie
- `GET /api/auth/me` - Vérification de l'authentification

### Panier & Checkout
- `POST /api/cart/apply-referral` - Application code parrainage
- `POST /api/cart/apply-loyalty` - Application avantages fidélité
- `POST /api/checkout` - Processus de paiement

### Client & Adresses
- `GET /api/customers/addresses` - Liste des adresses
- `POST /api/customers/addresses` - Création d'adresse
- `DELETE /api/customers/addresses/[index]` - Suppression d'adresse
- `POST /api/customers/addresses/[index]/default` - Définir adresse par défaut

### Fidélité
- `GET /api/loyalty/status` - Statut de fidélité
- `POST /api/loyalty/cart` - Application fidélité au panier
- `POST /api/loyalty/claim` - Réclamer une récompense
- `POST /api/loyalty/sync` - Synchroniser le statut

### Paiement
- `POST /api/payment/create` - Créer un paiement
- `GET /api/payment/verify/[orderCode]` - Vérifier un paiement

### Pricing
- `POST /api/pricing` - Calcul des prix

## Configuration des Cookies

### Cookie d'Authentification (`payload-token`)

```typescript
{
  httpOnly: true,           // Inaccessible depuis JavaScript
  secure: NODE_ENV === 'production',  // HTTPS uniquement en prod
  sameSite: 'lax',         // Protection CSRF basique
  maxAge: 60 * 60 * 24 * 7, // 7 jours
  path: '/',
}
```

### Cookie CSRF (`csrf-token`)

```typescript
{
  httpOnly: false,          // ⚠️ Doit être lisible (voir ci-dessus)
  secure: NODE_ENV === 'production',
  sameSite: 'lax',
  // Pas de maxAge : cookie de session
  path: '/',
}
```

## Améliorations Futures (P2)

### Vérification Origin/Referer

Ajouter dans chaque route BFF mutative:

```typescript
const origin = request.headers.get('origin');
const referer = request.headers.get('referer');
const allowedOrigins = [
  'https://chanvre-vert.fr',
  'http://localhost:3001'
];

if (!origin || !allowedOrigins.includes(origin)) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

### Signature du Token CSRF

Plutôt qu'un simple token aléatoire, signer le token CSRF côté serveur pour éviter la falsification.

## Risques Évalués et Atténués

| Vulnérabilité | Risque | Mitigation |
|---------------|--------|------------|
| **XSS → Vol de Token JWT** | ❌ ÉLIMINÉ | Cookies HttpOnly + BFF |
| **XSS → Vol de Token CSRF** | ⚠️ FAIBLE | Le token CSRF seul est inutile sans le cookie |
| **CSRF classique** | ❌ ÉLIMINÉ | Double-submit + SameSite=lax |
| **CSRF depuis sous-domaine** | ⚠️ MOYEN | SameSite=lax protège (pas 'none') |
| **Man-in-the-Middle** | ❌ ÉLIMINÉ | HTTPS + Secure cookies en prod |

## Tests de Sécurité Recommandés

1. **Test XSS → Token JWT**
   - Injecter `<script>alert(document.cookie)</script>`
   - ✅ Vérifier que `payload-token` n'apparaît pas

2. **Test CSRF**
   - Créer une page malveillante sur autre domaine
   - Tenter une requête POST vers `/api/checkout`
   - ✅ Vérifier échec (pas de header CSRF)

3. **Test BFF**
   - Tenter d'appeler directement le backend depuis le navigateur
   - ✅ Vérifier que seules les routes BFF fonctionnent

## Références

- [OWASP CSRF Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [Double Submit Cookie Pattern](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html#double-submit-cookie)
- [SameSite Cookie Attribute](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)


