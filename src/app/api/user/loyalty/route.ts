import { NextRequest, NextResponse } from 'next/server';
import { LoyaltyReward } from '@/types/loyalty';
import { determineReward } from '@/lib/loyalty';

// La fonction determineReward est maintenant importée depuis @/lib/loyalty

export async function GET(request: NextRequest) {
  try {
    // Récupérer le token d'authentification depuis la requête
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { message: 'Token d\'authentification manquant' },
        { status: 401 }
      );
    }

    // Appeler l'API backend pour obtenir les commandes de l'utilisateur
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    console.info('Récupération des commandes pour le programme de fidélité');
    // Utiliser le rewrite configuré dans next.config.js qui redirige /api/* vers le backend
    const ordersResponse = await fetch(`/api/orders/me`, {
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
    
    // Compter les commandes complétées (livrées ou expédiées)
    const ordersCount = Array.isArray(ordersData.orders) 
      ? ordersData.orders.filter((order: { status: string }) => 
          order.status === 'delivered' || order.status === 'shipped'
        ).length 
      : 0;
    
    console.info(`Nombre de commandes validées: ${ordersCount}`);

    // Récupérer l'utilisateur pour voir si une récompense est déjà réclamée
    const userResponse = await fetch(`/api/users/me`, {
      headers: {
        'Authorization': authHeader
      }
    });

    if (!userResponse.ok) {
      console.error(`Erreur lors de la récupération des informations utilisateur: ${userResponse.status}`);
      return NextResponse.json(
        { message: 'Erreur lors de la récupération des informations utilisateur' },
        { status: userResponse.status }
      );
    }

    const userData = await userResponse.json();
    const currentLoyalty = userData.loyalty || {};
    
    // Déterminer la récompense actuelle
    const calculatedReward = determineReward(ordersCount);
    
    // Si l'utilisateur a déjà une récompense réclamée, conserver cette information
    if (currentLoyalty.currentReward && calculatedReward.type === currentLoyalty.currentReward.type) {
      calculatedReward.claimed = currentLoyalty.currentReward.claimed;
    }

    // Construire l'objet de fidélité
    const loyaltyInfo = {
      ordersCount,
      currentReward: calculatedReward,
      referralEnabled: ordersCount >= 2
    };

    // Sauvegarder les infos de fidélité dans le profil utilisateur si elles ont changé
    if (JSON.stringify(currentLoyalty) !== JSON.stringify(loyaltyInfo)) {
      console.info(`Mise à jour des informations de fidélité pour l'utilisateur ${userData.id}`);
      await fetch(`/api/customers/${userData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify({
          loyalty: loyaltyInfo
        })
      });
    }

    return NextResponse.json({
      success: true,
      loyalty: loyaltyInfo
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des informations de fidélité:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de la récupération des informations de fidélité' },
      { status: 500 }
    );
  }
}
