import { NextRequest, NextResponse } from 'next/server';
import { applyLoyaltyBenefits } from '@/lib/loyalty';
import { secureLogger as logger } from '@/utils/logger';
import type { GenericObject } from '@/utils/logger';

// Interface pour le corps de la requête
interface ApplyLoyaltyRequest {
  cartTotal: number;
  country?: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

const computeShippingCost = (subtotal: number, country?: string): number => {
  const norm = (country || '').trim().toLowerCase();
  if (['belgique', 'belgium', 'be'].includes(norm)) {
    return subtotal >= 200 ? 0 : 10;
  }
  return subtotal >= 50 ? 0 : 5;
};

export async function POST(request: NextRequest) {
  try {
    // Récupérer le token d'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { message: "Token d'authentification manquant" },
        { status: 401 }
      );
    }

    // Récupérer les données du panier
    const body = (await request.json()) as ApplyLoyaltyRequest;

    // Vérifier les données nécessaires
    if (body.cartTotal === undefined || !Array.isArray(body.items)) {
      return NextResponse.json(
        { message: 'Données du panier incomplètes' },
        { status: 400 }
      );
    }

    // Récupérer les informations utilisateur et l'historique des commandes
    const backendUrl =
      process.env.BACKEND_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://localhost:3000';

    // Récupérer les commandes passées de l'utilisateur
    const ordersResponse = await fetch(`${backendUrl}/api/orders/me`, {
      headers: {
        Authorization: authHeader,
      },
    });

    if (!ordersResponse.ok) {
      logger.error(
        `Erreur lors de la récupération des commandes: ${ordersResponse.status}`
      );
      return NextResponse.json(
        { message: 'Erreur lors de la récupération des commandes' },
        { status: ordersResponse.status }
      );
    }

    const ordersData = await ordersResponse.json();

    // Compter uniquement les commandes complètes (livrées ou expédiées)
    const completedOrders = Array.isArray(ordersData.orders)
      ? ordersData.orders.filter(
          (order: { status: string }) =>
            order.status === 'delivered' || order.status === 'shipped'
        )
      : [];

    const ordersCount = completedOrders.length;

    // Appliquer la remise fidélité au panier actuel
    const loyaltyBenefits = applyLoyaltyBenefits(
      ordersCount,
      body.cartTotal,
      computeShippingCost(body.cartTotal, body.country)
    );

    logger.info(
      `Application des avantages fidélité: ${loyaltyBenefits.message}`
    );

    // Préparer la réponse
    const response = {
      success: true,
      originalTotal: loyaltyBenefits.originalTotal,
      discount: loyaltyBenefits.discount,
      shippingCost: loyaltyBenefits.newShippingCost,
      newTotal: loyaltyBenefits.newTotal,
      freeProductAdded: loyaltyBenefits.freeProductAdded,
      reward: {
        type: loyaltyBenefits.reward.type,
        message: loyaltyBenefits.message,
      },
    };

    logger.info(
      `Remise fidélité appliquée: ${loyaltyBenefits.message} [Commandes: ${ordersCount}]`
    );

    return NextResponse.json(response);
  } catch (error: unknown) {
    const errorContext: GenericObject =
      error instanceof Error
        ? { name: error.name, message: error.message, stack: error.stack }
        : { error };
    logger.error("Erreur lors de l'application des avantages fidélité:", errorContext);
    return NextResponse.json(
      {
        message:
          "Une erreur est survenue lors de l'application des avantages fidélité",
      },
      { status: 500 }
    );
  }
}
