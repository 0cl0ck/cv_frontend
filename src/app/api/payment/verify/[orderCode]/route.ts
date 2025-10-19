import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Route BFF pour vérifier le statut d'un paiement
 * Proxy vers le backend avec le token HttpOnly cookie
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderCode: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('payload-token')?.value;
    
    const { orderCode } = await params;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `JWT ${token}`;
    }

    // Forward full query string; if no identifier is present, add orderCode to satisfy backend validation
    const sp = request.nextUrl.searchParams;
    const hasIdentifier = sp.has('t') || sp.has('s') || sp.has('transactionId') || sp.has('orderCode');
    const qp = new URLSearchParams(sp);
    if (!hasIdentifier) {
      qp.set('orderCode', orderCode);
    }
    const targetUrl = `${BACKEND_URL}/api/payment/verify/${orderCode}${qp.toString() ? `?${qp.toString()}` : ''}`;

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers,
      cache: 'no-store',
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('[BFF /api/payment/verify/[orderCode]] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}


