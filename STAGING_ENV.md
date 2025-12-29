# Frontend Staging Environment Variables

Configure these in Vercel Dashboard under **Environment Variables** for the `staging` branch.

## Required Variables

```env
# URLs PUBLIQUES (exposées au client)
NEXT_PUBLIC_SITE_URL=https://staging.chanvre-vert.fr
NEXT_PUBLIC_API_URL=https://api-staging.chanvre-vert.fr
NEXT_PUBLIC_APP_URL=https://staging.chanvre-vert.fr

# URLs INTERNES (côté serveur uniquement)
BACKEND_INTERNAL_URL=https://api-staging.chanvre-vert.fr

# ENVIRONNEMENT
NODE_ENV=production
```

## Optional Variables

```env
RESEND_API_KEY=votre_resend_api_key
CSRF_SECRET=votre_csrf_secret
```
