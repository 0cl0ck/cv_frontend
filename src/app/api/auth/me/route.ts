import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Route BFF pour vérifier l'authentification de l'utilisateur
 * Proxy vers le backend avec le token HttpOnly cookie
 */
export async function GET(_request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('payload-token')?.value;
    
    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    
    const response = await fetch(`${BACKEND_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });
    
    if (!response.ok) {
      return NextResponse.json({ user: null }, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
    
  } catch (error) {
    console.error('[BFF /api/auth/me] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}

