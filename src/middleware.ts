import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { verifyAuth } from './lib/auth';

export async function middleware(request: NextRequest) {
  // Protection contre CVE-2025-29927 (contournement du middleware)
  // Bloquer les requêtes avec l'en-tête x-middleware-subrequest
  if (request.headers.get('x-middleware-subrequest')) {
    return NextResponse.json(
      { error: 'Unauthorized middleware subrequest' },
      { status: 400 }
    );
  }
  
  // Routes protégées nécessitant une authentification
  const protectedPaths = [
    '/compte',
    '/compte/commandes',
    '/compte/adresses',
    '/checkout/paiement'
  ];
  
  // Vérifier si le chemin actuel est protégé
  const isProtectedPath = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  );
  
  if (isProtectedPath) {
    // Vérification sécurisée du JWT pour les routes protégées
    const auth = await verifyAuth(request);
    
    // Si non authentifié, rediriger vers la page de connexion
    if (!auth) {
      const url = new URL('/connexion', request.url);
      // Ajouter le chemin de redirection pour revenir après connexion
      url.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
  }
  
  // Pour les routes d'API nécessitant une connexion admin
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    const auth = await verifyAuth(request);
    
    // Vérifier que l'utilisateur est un admin
    if (!auth || auth.collection !== 'admins') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
  }
  
  return NextResponse.next();
}

// Configurer le middleware pour s'exécuter sur toutes les routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon\.ico).*)',
  ],
};
