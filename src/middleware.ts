import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';



// Routes qui ne nécessitent pas d'authentification
const PUBLIC_PATHS = ['/login', '/api/auth'];

// Extensions de fichiers statiques à autoriser sans authentification
const STATIC_EXTENSIONS = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.json', '.woff', '.woff2'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Autoriser les chemins publics
  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }
  
  // Autoriser les fichiers statiques
  if (STATIC_EXTENSIONS.some(ext => pathname.endsWith(ext)) || pathname.startsWith('/_next/')) {
    return NextResponse.next();
  }
  
  // Vérifier si l'utilisateur est authentifié
  const isAuthenticated = request.cookies.has('auth_token');
  
  // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
  if (!isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
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
