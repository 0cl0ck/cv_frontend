import { NextRequest, NextResponse } from 'next/server';
import { checkOrigin } from '@/lib/security/origin-check';

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Route BFF pour récupérer/mettre à jour le profil du customer connecté
 * Proxy vers l'endpoint custom du backend /api/customers/me
 * 
 * Note: On utilise un endpoint custom au lieu des routes REST natives PayloadCMS
 * car ces dernières ne peuplent pas req.user correctement lors d'appels serveur-to-serveur
 */

export async function GET(request: NextRequest) {
  try {
    // Extraire le token depuis les cookies
    const token = request.cookies.get('payload-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Appeler l'endpoint custom du backend qui gère l'auth correctement
    const response = await fetch(`${BACKEND_URL}/api/customers/me`, {
      headers: {
        'Authorization': `JWT ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('[BFF /api/customers/me GET] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  console.log('[BFF /api/customers/me PATCH] Entrée dans le handler');
  
  // Vérification Origin/Referer pour protection CSRF supplémentaire
  const originCheck = checkOrigin(request);
  if (originCheck) {
    console.log('[BFF /api/customers/me PATCH] Origin check failed');
    return originCheck;
  }
  
  try {
    // Extraire le token depuis les cookies
    const token = request.cookies.get('payload-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    
    // Appeler l'endpoint custom du backend (POST car PayloadCMS v3 ne supporte que GET/POST)
    const response = await fetch(`${BACKEND_URL}/api/customers-update`, {
      method: 'POST',
      headers: {
        'Authorization': `JWT ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('[BFF /api/customers/me PATCH] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}
