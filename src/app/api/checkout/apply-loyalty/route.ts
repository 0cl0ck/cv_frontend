import { NextRequest, NextResponse } from 'next/server';
import { applyLoyaltyBenefits, determineReward } from '@/lib/loyalty';

// Interface pour le corps de la requête
interface ApplyLoyaltyRequest {
  cartTotal: number;
  shippingCost: number;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    // Récupérer le token d'authentification
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { message: 'Token d\'authentification manquant' },
        { status: 401 }
      );
    }

    // Récupérer les données du panier
    const body = await request.json() as ApplyLoyaltyRequest;
    
    // Vérifier les données nécessaires
    if (body.cartTotal === undefined || !Array.isArray(body.items)) {
      return NextResponse.json(
        { message: 'Données du panier incomplètes' },
        { status: 400 }
      );
    }

    // Récupérer les informations utilisateur et l'historique des commandes
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    // Récupérer les commandes passées de l'utilisateur
    const ordersResponse = await fetch(`${backendUrl}/api/orders/me`, {
      headers: {
        'Authorization': authHeader
      }
    });

    if (!ordersResponse.ok) {
      console.error(`Erreur lors de la récupération des commandes: ${ordersResponse.status}`);
      return NextResponse.json(
        { message: 'Erreur lors de la récupération des commandes' },
        { status: ordersResponse.status }
      );
    }

    const ordersData = await ordersResponse.json();
    
    // Compter uniquement les commandes complétées (livrées ou expédiées)
    const completedOrders = Array.isArray(ordersData.orders) 
      ? ordersData.orders.filter((order: any) => 
          order.status === 'delivered' || order.status === 'shipped'
        )
      : [];
    
    const ordersCount = completedOrders.length;
    
    // Appliquer les récompenses de fidélité au panier actuel
    const loyaltyBenefits = applyLoyaltyBenefits(
      ordersCount,
      body.cartTotal,
      body.shippingCost
    );
    
    console.log(`Application des avantages fidélité: ${loyaltyBenefits.message}`);
    
    // Préparer la réponse avec les modifications appliquées en utilisant les données de loyaltyBenefits
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
      nextOrderReward: determineReward(ordersCount + 2) // La récompense pour la commande suivante
    };

    console.info(`Récompense de fidélité appliquée: ${loyaltyBenefits.message} [Commandes: ${ordersCount}]`);
    
    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Erreur lors de l\'application des récompenses de fidélité:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de l\'application des récompenses de fidélité' },
      { status: 500 }
    );
  }
}
