import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { checkOrigin } from '@/lib/security/origin-check';

const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Route BFF pour calculer les prix du panier
 * Proxy vers le backend qui gère TOUTES les remises automatiquement
 * (promo, fidélité via JWT, parrainage via cookie)
 */
export async function POST(request: NextRequest) {
  // Vérification Origin/Referer pour protection CSRF supplémentaire
  const originCheck = checkOrigin(request);
  if (originCheck) return originCheck;

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('payload-token')?.value;
    const referralCode = cookieStore.get('referral-code')?.value;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    // Forward JWT token pour la fidélité
    if (token) {
      headers['Authorization'] = `JWT ${token}`;
    }
    
    // Forward cookie de parrainage
    if (referralCode) {
      headers['Cookie'] = `referral-code=${encodeURIComponent(referralCode)}`;
    }

    // Lire le corps JSON
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    // Par défaut, appliquer 'FR' si aucun pays fourni
    const base = (typeof body === 'object' && body !== null ? (body as Record<string, unknown>) : {});
    const providedCountry = typeof base.country === 'string' ? base.country.trim() : '';
    const forwarded = {
      ...base,
      country: providedCountry && providedCountry.length > 0 ? providedCountry : 'FR',
    } as Record<string, unknown>;

    const response = await fetch(`${BACKEND_URL}/api/cart/pricing`, {
      method: 'POST',
      headers,
      body: JSON.stringify(forwarded),
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
