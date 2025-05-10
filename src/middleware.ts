import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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
    // Vérifier simplement l'existence du token, sans validation JWT
    const token = request.cookies.get('payload-token')?.value;
    
    // Si non authentifié, rediriger vers la page de connexion
    if (!token) {
      const url = new URL('/connexion', request.url);
      // Ajouter le chemin de redirection pour revenir après connexion
      url.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
    
    // Optionnel: on pourrait vérifier la date d'expiration du JWT en le décodant
    // mais on délègue désormais cette responsabilité au backend
  }
  
  // Pour les routes d'API nécessitant une connexion admin
  if (request.nextUrl.pathname.startsWith('/api/admin')) {
    const token = request.cookies.get('payload-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    // Vérifier avec le backend si l'utilisateur est un admin
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`,
        { 
          headers: { 
            'Authorization': `Bearer ${token}` 
          } 
        }
      );
      
      if (!response.ok) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
      
      const payload = await response.json();
      if (!payload?.user || payload.user.collection !== 'admins') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } catch (error) {
      console.error('Erreur lors de la vérification admin:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
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
