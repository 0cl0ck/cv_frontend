import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.chanvre-vert.fr';

/**
 * GET /api/cart/sync - Récupère le panier sauvegardé du client
 */
export async function GET(_request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('payload-token')?.value;

    if (!token) {
      return NextResponse.json({ items: [], message: 'Non authentifié' }, { status: 401 });
    }

    // Récupérer l'utilisateur courant pour avoir son ID
    const meRes = await fetch(`${API_URL}/api/customers/me`, {
      headers: {
        'Cookie': `payload-token=${token}`,
      },
    });

    if (!meRes.ok) {
      return NextResponse.json({ items: [], message: 'Session invalide' }, { status: 401 });
    }

    const user = await meRes.json();

    // Chercher le panier du client
    const cartRes = await fetch(
      `${API_URL}/api/carts?where[customer][equals]=${user.user.id}&limit=1`,
      {
        headers: {
          'Cookie': `payload-token=${token}`,
        },
      }
    );

    if (!cartRes.ok) {
      return NextResponse.json({ items: [], shipping: null, promoCode: null });
    }

    const cartData = await cartRes.json();
    
    if (cartData.docs && cartData.docs.length > 0) {
      const cart = cartData.docs[0];
      return NextResponse.json({
        items: cart.items || [],
        shipping: cart.shipping || null,
        promoCode: cart.promoCode || null,
        lastUpdated: cart.lastUpdated,
      });
    }

    return NextResponse.json({ items: [], shipping: null, promoCode: null });
  } catch (error) {
    console.error('[Cart Sync] Error fetching cart:', error);
    return NextResponse.json({ items: [], error: 'Erreur serveur' }, { status: 500 });
  }
}

/**
 * POST /api/cart/sync - Sauvegarde le panier du client
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('payload-token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: 'Non authentifié' }, { status: 401 });
    }

    const body = await request.json();
    const { items, shipping, promoCode } = body;

    // Récupérer l'utilisateur courant
    const meRes = await fetch(`${API_URL}/api/customers/me`, {
      headers: {
        'Cookie': `payload-token=${token}`,
      },
    });

    if (!meRes.ok) {
      return NextResponse.json({ success: false, message: 'Session invalide' }, { status: 401 });
    }

    const user = await meRes.json();
    const customerId = user.user.id;

    // Chercher un panier existant
    const existingRes = await fetch(
      `${API_URL}/api/carts?where[customer][equals]=${customerId}&limit=1`,
      {
        headers: {
          'Cookie': `payload-token=${token}`,
        },
      }
    );

    const existingData = await existingRes.json();

    if (existingData.docs && existingData.docs.length > 0) {
      // Mettre à jour le panier existant
      const cartId = existingData.docs[0].id;
      await fetch(`${API_URL}/api/carts/${cartId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `payload-token=${token}`,
        },
        body: JSON.stringify({ items, shipping, promoCode }),
      });
    } else {
      // Créer un nouveau panier
      await fetch(`${API_URL}/api/carts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `payload-token=${token}`,
        },
        body: JSON.stringify({
          customer: customerId,
          items,
          shipping,
          promoCode,
        }),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Cart Sync] Error saving cart:', error);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
