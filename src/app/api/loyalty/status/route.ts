import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Route BFF pour récupérer le statut de fidélité du client
 * Proxy vers le backend avec le token HttpOnly cookie
 */
export async function GET(request: NextRequest) {
  try {
    // Forward tous les cookies de la requête vers le backend
    const cookieHeader = request.headers.get('cookie');
    
    if (!cookieHeader) {
      console.warn('[BFF /api/loyalty/status] No cookies in request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const response = await fetch(`${BACKEND_URL}/api/loyalty/status`, {
      method: 'GET',
      headers: {
        'Cookie': cookieHeader,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('[BFF /api/loyalty/status] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

