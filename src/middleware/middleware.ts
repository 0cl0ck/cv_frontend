import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { httpClient } from '@/lib/httpClient';

// Stockage des demandes pour le rate limiting (en production, utiliser Redis)
type RequestRecord = { count: number; timestamps: number[] };
const ipRequestMap = new Map<string, Record<string, RequestRecord>>();

/**
 * Obtient l'adresse IP du client à partir de la requête
 */
function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  const ip = request.headers.get('x-real-ip');
  if (ip) {
    return ip;
  }
  
  return 'unknown-ip';
}

/**
 * Vérifie si une route est soumise au rate limiting
 */
function isRateLimitedRoute(pathname: string): [boolean, string, number, number] {
  // Configurer les routes sensibles avec leurs limites
  // [est limité, type de limite, max requêtes, fenêtre en secondes]
  
  // Routes d'authentification (login, inscription, mot de passe oublié)
  if (pathname.startsWith('/api/auth/login')) {
    return [true, 'auth_login', 10, 60]; // 10 tentatives par minute
  }
  
  if (pathname.startsWith('/api/auth/register')) {
    return [true, 'auth_register', 5, 60]; // 5 tentatives par minute
  }
  
  if (pathname.startsWith('/api/auth/forgot-password')) {
    return [true, 'auth_recovery', 5, 300]; // 5 tentatives par 5 minutes
  }
  
  if (pathname.startsWith('/api/auth/reset-password')) {
    return [true, 'auth_reset', 5, 300]; // 5 tentatives par 5 minutes
  }
  
  // Routes de paiement
  if (pathname.startsWith('/api/payment')) {
    return [true, 'payment', 20, 300]; // 20 tentatives par 5 minutes
  }
  
  // Routes de webhook (pas de limite pour permettre les callbacks)
  if (pathname.startsWith('/api/webhooks')) {
    return [false, '', 0, 0];
  }
  
  // Par défaut, pas de rate limiting
  return [false, '', 0, 0];
}

/**
 * Applique le rate limiting à une requête
 */
function applyRateLimit(request: NextRequest, routeType: string, maxRequests: number, windowInSeconds: number): NextResponse | null {
  const clientIp = getClientIp(request);
  
  // Initialiser les enregistrements pour cette IP si nécessaire
  if (!ipRequestMap.has(clientIp)) {
    ipRequestMap.set(clientIp, {});
  }
  
  const ipData = ipRequestMap.get(clientIp)!;
  
  // Initialiser l'enregistrement pour ce type de route si nécessaire
  if (!ipData[routeType]) {
    ipData[routeType] = { count: 0, timestamps: [] };
  }
  
  const routeData = ipData[routeType];
  const now = Date.now();
  
  // Supprimer les timestamps plus anciens que la fenêtre
  const windowStart = now - windowInSeconds * 1000;
  routeData.timestamps = routeData.timestamps.filter(t => t >= windowStart);
  routeData.count = routeData.timestamps.length;
  
  // Vérifier si la limite est dépassée
  if (routeData.count >= maxRequests) {
    const oldestTimestamp = routeData.timestamps[0];
    const retryAfterMs = oldestTimestamp + windowInSeconds * 1000 - now;
    const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);
    
    // Journaliser la tentative bloquée
    console.warn(`Rate limit dépassé: ${clientIp} ${request.method} ${request.nextUrl.pathname}`);
    
    return NextResponse.json(
      {
        error: 'Trop de requêtes, veuillez réessayer plus tard',
        retryAfter: retryAfterSeconds
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfterSeconds),
          'X-RateLimit-Limit': String(maxRequests),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil((oldestTimestamp + windowInSeconds * 1000) / 1000))
        }
      }
    );
  }
  
  // Ajouter le timestamp actuel
  routeData.timestamps.push(now);
  routeData.count++;
  
  return null;
}

// Nettoyer les anciennes entrées toutes les 15 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    ipRequestMap.forEach((routes, ip) => {
      let empty = true;
      
      Object.entries(routes).forEach(([, data]) => {
        // Conserver uniquement les timestamps de moins d'une heure
        data.timestamps = data.timestamps.filter(t => now - t < 3600 * 1000);
        data.count = data.timestamps.length;
        
        if (data.count > 0) {
          empty = false;
        }
      });
      
      // Supprimer l'IP si tous les compteurs sont à zéro
      if (empty) {
        ipRequestMap.delete(ip);
      }
    });
  }, 15 * 60 * 1000);
}

export async function middleware(request: NextRequest) {
  // Protection contre CVE-2025-29927 (contournement du middleware)
  // Bloquer les requêtes avec l'en-tête x-middleware-subrequest
  if (request.headers.get('x-middleware-subrequest')) {
    return NextResponse.json(
      { error: 'Unauthorized middleware subrequest' },
      { status: 400 }
    );
  }
  
  // Appliquer le rate limiting pour les routes sensibles
  const [isLimited, routeType, maxRequests, windowInSeconds] = isRateLimitedRoute(request.nextUrl.pathname);
  if (isLimited) {
    const rateLimitResponse = applyRateLimit(request, routeType, maxRequests, windowInSeconds);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
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
      const { data: payload } = await httpClient.get('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!payload?.user || payload.user.collection !== 'admins') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Erreur lors de la vérification admin:', error);
      }
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
