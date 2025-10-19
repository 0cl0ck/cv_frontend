import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { checkOrigin } from '@/lib/security/origin-check';

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * BFF route: applique/valide un code promo
 * Proxie vers le backend /api/cart/apply-promo
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // CSRF baseline protection
  const originCheck = checkOrigin(request);
  if (originCheck) return originCheck;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('payload-token')?.value;

    const body = await request.json();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) headers['Authorization'] = `JWT ${token}`;

    const response = await fetch(`${BACKEND_URL}/api/cart/apply-promo`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      cache: 'no-store',
    });

    const text = await response.text();
    return new NextResponse(text, {
      status: response.status,
      headers: { 'Content-Type': response.headers.get('content-type') || 'application/json' },
    });
  } catch {
    return NextResponse.json({ success: false, valid: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
