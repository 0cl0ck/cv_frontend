import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/utils/logger';

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Route BFF pour vérifier l'authentification de l'utilisateur
 * Proxy vers le backend avec le token HttpOnly cookie
 * Retourne toujours 200 avec { user: null } si non authentifié
 * pour éviter que le navigateur affiche un 401 dans la console
 */
export async function GET(request: NextRequest) {
  try {
    // Forward tous les cookies de la requête vers le backend
    const cookieHeader = request.headers.get('cookie');
    
    if (!cookieHeader) {
      return NextResponse.json({ user: null }, { status: 200 });
    }
    
    const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Cookie': cookieHeader,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      // Non-authentifié ou erreur backend → retourner 200 avec user null
      // pour éviter le log navigateur natif des réponses ≥400
      return NextResponse.json({ user: null }, { status: 200 });
    }
    
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
    
  } catch (error) {
    logger.warn('[BFF /api/auth/me] Error', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { user: null }, 
      { status: 200 }
    );
  }
}

