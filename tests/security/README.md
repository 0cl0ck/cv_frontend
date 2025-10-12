# Tests de Sécurité

Suite complète de tests automatisés pour valider les protections de sécurité implémentées.

## Vue d'Ensemble

Cette batterie de tests vérifie:
- ✅ **localStorage**: Aucun token JWT stocké (protection XSS)
- ✅ **CSRF**: Protection double-submit + Origin check
- ✅ **Sanitisation**: DOMPurify bloque XSS via HTML
- ✅ **Headers**: Présence des headers de sécurité
- ✅ **BFF Auth**: Architecture BFF et authentification

## Installation

```bash
cd frontend
pnpm install
```

## Lancer les Tests

###

 Tous les tests de sécurité
```bash
pnpm test tests/security
```

### Par catégorie

```bash
# localStorage
pnpm test tests/security/localStorage.test.ts

# CSRF
pnpm test tests/security/csrf.test.ts

# Sanitisation HTML
pnpm test tests/security/sanitization.test.tsx

# Headers HTTP
pnpm test tests/security/headers.test.ts

# BFF & Auth
pnpm test tests/security/bff-auth.test.ts
```

### Mode watch (développement)
```bash
pnpm test:watch tests/security
```

### Avec couverture
```bash
pnpm test:coverage tests/security
```

## Structure des Tests

```
tests/security/
├── localStorage.test.ts      # Protection XSS via localStorage
├── csrf.test.ts              # Protection CSRF (Origin + double-submit)
├── sanitization.test.tsx     # Sanitisation HTML avec DOMPurify
├── headers.test.ts           # Headers de sécurité HTTP
├── bff-auth.test.ts          # Architecture BFF et authentification
└── README.md                 # Ce fichier
```

## Détail des Tests

### 1. localStorage.test.ts

**Objectif:** Vérifier qu'aucun token JWT n'est stocké en localStorage

**Tests:**
- ❌ Pas de token `auth_bearer`
- ❌ Pas de JWT dans aucune clé localStorage
- ❌ httpClient ne lit pas localStorage pour Authorization
- ✅ Données non-sensibles OK (theme, language, etc.)

**Protection:** XSS token theft

### 2. csrf.test.ts

**Objectif:** Valider la protection CSRF sur toutes routes mutatives

**Tests:**
- ❌ Requêtes sans Origin/Referer rejetées
- ❌ Origin malveillant rejeté (`https://evil.com`)
- ✅ Origin valide accepté (`https://chanvre-vert.fr`)
- ✅ Cookie CSRF lisible en JS (pattern double-submit)
- ❌ Cookie payload-token HttpOnly (invisible JS)
- ✅ Header X-CSRF-Token envoyé pour POST/PUT/PATCH/DELETE

**Protection:** Attaques CSRF cross-origin

### 3. sanitization.test.tsx

**Objectif:** Vérifier que DOMPurify sanitise tout HTML

**Tests:**
- ❌ Scripts inline bloqués: `<script>alert('XSS')</script>`
- ❌ Event handlers bloqués: `onerror`, `onclick`, etc.
- ❌ Iframes malveillants bloqués
- ❌ Attributs dangereux bloqués: `javascript:`, `data:text/html`
- ✅ HTML légitime préservé: `<strong>`, `<em>`, `<ul>`, etc.

**Protection:** Attaques XSS via contenu utilisateur

### 4. headers.test.ts

**Objectif:** Valider la présence des headers de sécurité

**Tests:**
- ✅ Content-Security-Policy (CSP)
- ✅ X-Frame-Options: DENY
- ✅ X-Content-Type-Options: nosniff
- ✅ Referrer-Policy: strict-origin-when-cross-origin
- ✅ Permissions-Policy
- ❌ X-Powered-By désactivé
- ✅ Cookies: HttpOnly, Secure (prod), SameSite=lax

**Protection:** Clickjacking, XSS, MIME sniffing

### 5. bff-auth.test.ts

**Objectif:** Vérifier l'architecture BFF et l'authentification

**Tests:**
- ✅ httpClient pointe vers `/api` (pas backend direct)
- ❌ Aucun token JWT accessible depuis le client
- ✅ 14+ routes BFF implémentées
- ✅ Routes protégées vérifient `payload-token`
- ❌ Requêtes sans token → 401 Unauthorized
- ✅ Routes BFF transmettent Authorization au backend
- ❌ Client ne peut pas appeler backend directement (CORS)
- ✅ Vérification Origin sur routes mutatives

**Protection:** XSS token theft, bypass d'authentification

## Interprétation des Résultats

### ✅ Tests passés (PASS)
Toutes les protections sont en place et fonctionnelles.

### ⚠️ Tests avec warnings
Certaines vérifications ont trouvé des anomalies non-critiques.
Consulter les logs pour les détails.

### ❌ Tests échoués (FAIL)
**CRITIQUE**: Une protection de sécurité est manquante ou défaillante.
À corriger immédiatement avant déploiement.

## CI/CD Integration

### GitHub Actions

Ajouter dans `.github/workflows/security.yml`:

```yaml
name: Security Tests

on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install pnpm
        uses: pnpm/action-setup@v2
      
      - name: Install dependencies
        run: cd frontend && pnpm install
      
      - name: Run security tests
        run: cd frontend && pnpm test tests/security
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./frontend/coverage/lcov.info
```

## Tests Manuels Complémentaires

### Test XSS Manuel

1. Ouvrir DevTools → Console
2. Tenter d'accéder aux cookies:
```javascript
document.cookie
// payload-token ne doit PAS apparaître (HttpOnly)
```

3. Tenter de lire localStorage:
```javascript
localStorage.getItem('auth_bearer')
// Doit retourner null
```

### Test CSRF Manuel

1. Créer une page HTML sur un autre domaine:
```html
<form action="https://chanvre-vert.fr/api/checkout" method="POST">
  <input name="amount" value="999999">
  <button>Attaquer</button>
</form>
```

2. Soumettre le formulaire
3. ✅ La requête doit être bloquée (Origin check + pas de CSRF token)

### Test Sanitisation Manuel

1. En tant qu'admin, créer un produit avec description:
```html
<script>alert('XSS')</script><p>Description</p>
```

2. Afficher le produit côté client
3. ✅ Le script ne doit PAS s'exécuter
4. ✅ Seul `<p>Description</p>` doit apparaître

## Maintenance

### Ajouter un nouveau test

1. Créer le fichier de test dans `tests/security/`
2. Utiliser le pattern existant (describe/it)
3. Documenter l'objectif et la protection testée
4. Ajouter au README

### Mettre à jour les tests

Lors de changements de sécurité:
1. Mettre à jour les tests correspondants
2. Vérifier que tous les tests passent
3. Commit avec message `test(security): ...`

## Ressources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [DOMPurify](https://github.com/cure53/DOMPurify)

## Support

Questions sur les tests de sécurité:
- Consulter `frontend/docs/CSRF-SECURITY.md`
- Consulter `frontend/docs/SECURITY-AUDIT-IMPLEMENTATION.md`
- Consulter les commentaires dans les fichiers de test

