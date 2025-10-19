import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { checkOrigin } from '@/lib/security/origin-check';

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Route BFF pour calculer les prix du panier
 * Proxy vers le backend avec le token HttpOnly cookie
 */
export async function POST(request: NextRequest) {
  // Vérification Origin/Referer pour protection CSRF supplémentaire
  const originCheck = checkOrigin(request);
  if (originCheck) return originCheck;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('payload-token')?.value;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `JWT ${token}`;
    }

    const response = await fetch(`${BACKEND_URL}/api/cart/pricing`, {
      method: 'POST',
      headers,
      body: await request.text(),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status, headers: { 'Cache-Control': 'no-store' } });

  } catch (error) {
    console.error('[BFF /api/pricing] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
