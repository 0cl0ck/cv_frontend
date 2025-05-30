# Variables d'environnement Frontend

## Production

Les variables suivantes doivent être définies en production :

```bash
# URL de l'API backend en production
NEXT_PUBLIC_API_URL=https://api.chanvre-vert.fr
# Ou alternativement
NEXT_PUBLIC_BACKEND_URL=https://api.chanvre-vert.fr

# URLs de développement (optionnelles, utilisées en local)
BACKEND_INTERNAL_URL=http://localhost:3000
```

## Configuration

Le frontend utilise cette logique de fallback pour les URLs :

1. `NEXT_PUBLIC_BACKEND_URL` (priorité)
2. `NEXT_PUBLIC_API_URL` (fallback)
3. URLs par défaut selon l'environnement :
   - Production : `https://api.chanvre-vert.fr`
   - Développement : `http://localhost:3000`

## Déploiement

Pour déployer en production, assurez-vous que votre plateforme de déploiement a :
- `NEXT_PUBLIC_API_URL=https://api.chanvre-vert.fr`

Cette variable permettra au frontend de communiquer avec la bonne API.
