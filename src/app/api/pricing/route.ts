import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Route BFF pour calculer le pricing
 * Proxy vers le backend avec le token HttpOnly cookie (optionnel)
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('payload-token')?.value;
    
    const body = await request.json();
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    // Ajouter le token si disponible (pour les utilisateurs connectés)
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${BACKEND_URL}/api/pricing`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('[BFF /api/pricing] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}


