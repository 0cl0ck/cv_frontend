import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { checkOrigin } from '@/lib/security/origin-check';

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Route BFF pour appliquer un code de parrainage au panier
 * Proxy vers le backend avec le token HttpOnly cookie
 */
export async function POST(request: NextRequest) {
  // Vérification Origin/Referer pour protection CSRF supplémentaire
  const originCheck = checkOrigin(request);
  if (originCheck) return originCheck;
  
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('payload-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await request.json();
    
    const response = await fetch(`${BACKEND_URL}/api/cart/apply-referral`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('[BFF /api/cart/apply-referral] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}


