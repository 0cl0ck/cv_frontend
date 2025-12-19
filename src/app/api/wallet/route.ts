import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Route BFF pour récupérer le solde et l'historique du wallet
 * Proxy vers le backend avec le token HttpOnly cookie
 */
export async function GET(request: NextRequest) {
  try {
    // Forward tous les cookies de la requête vers le backend
    const cookieHeader = request.headers.get('cookie');
    
    if (!cookieHeader) {
      console.warn('[BFF /api/wallet] No cookies in request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const response = await fetch(`${BACKEND_URL}/api/wallet`, {
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
    console.error('[BFF /api/wallet] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

/**
 * Route BFF pour appliquer le wallet à un panier
 * POST /api/wallet avec { cartTotal, amountToUse }
 */
export async function POST(request: NextRequest) {
  try {
    const cookieHeader = request.headers.get('cookie');
    
    if (!cookieHeader) {
      console.warn('[BFF /api/wallet POST] No cookies in request');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    
    const response = await fetch(`${BACKEND_URL}/api/wallet/apply`, {
      method: 'POST',
      headers: {
        'Cookie': cookieHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      cache: 'no-store',
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('[BFF /api/wallet POST] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}



