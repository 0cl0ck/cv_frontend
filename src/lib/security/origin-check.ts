import { NextRequest, NextResponse } from 'next/server';

/**
 * Liste des origines autorisées pour les requêtes mutatives
 * Protection CSRF supplémentaire via vérification Origin/Referer
 */
const ALLOWED_ORIGINS = [
  // Production
  'https://chanvre-vert.fr',
  'https://www.chanvre-vert.fr',
  // Staging
  'https://chanvre-vert-front-jkoaxswuv-hughsaweds-projects.vercel.app',
  // Development
  'http://localhost:3001',
  'http://127.0.0.1:3001',
];

// Ajouter dynamiquement NEXT_PUBLIC_SITE_URL si défini
if (process.env.NEXT_PUBLIC_SITE_URL) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!ALLOWED_ORIGINS.includes(siteUrl)) {
    ALLOWED_ORIGINS.push(siteUrl);
  }
}

// En développement, autoriser localhost avec n'importe quel port
if (process.env.NODE_ENV === 'development') {
  ALLOWED_ORIGINS.push('http://localhost:3000', 'http://127.0.0.1:3000');
}

/**
 * Vérifie que l'origine de la requête est autorisée
 * Protection contre les attaques CSRF cross-origin
 * 
 * @param request - La requête Next.js
 * @returns NextResponse avec erreur 403 si origine invalide, null si OK
 */
export function checkOrigin(request: NextRequest): NextResponse | null {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  
  // Si on a un origin header, le vérifier
  if (origin) {
    if (!ALLOWED_ORIGINS.includes(origin)) {
      console.warn('[Security] Origine non autorisée détectée:', origin);
      return NextResponse.json(
        { error: 'Forbidden - Invalid origin' },
        { status: 403 }
      );
    }
    return null; // OK
  }
  
  // Si pas d'origin mais un referer, vérifier le referer
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`;
      
      if (!ALLOWED_ORIGINS.includes(refererOrigin)) {
        console.warn('[Security] Referer non autorisé détecté:', refererOrigin);
        return NextResponse.json(
          { error: 'Forbidden - Invalid referer' },
          { status: 403 }
        );
      }
      return null; // OK
    } catch (error) {
      console.error('[Security] Erreur parsing referer:', error);
      return NextResponse.json(
        { error: 'Forbidden - Invalid referer format' },
        { status: 403 }
      );
    }
  }
  
  // Pas d'origin ni de referer - suspect mais on laisse passer
  // (certains clients/proxies peuvent les supprimer)
  console.warn('[Security] Requête sans origin ni referer');
  return null;
}

/**
 * Liste des origines autorisées (pour référence externe)
 */
export { ALLOWED_ORIGINS };

