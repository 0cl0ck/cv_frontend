import { LoyaltyReward } from '@/types/loyalty';
import { secureLogger as logger } from '@/utils/logger';
import { httpClient } from '@/lib/httpClient';

export function determineReward(): LoyaltyReward {
  // Récompenses ponctuelles supprimées
  return { type: 'none', claimed: false, description: 'Aucune récompense disponible' };
}

export function applyLoyaltyBenefits(
  ordersCount: number,
  cartTotal: number,
  shippingCost: number
) {
  // Ne calculer que la remise fidélité (5%/10%)
  let discount = 0;
  let message = '';
  if (ordersCount >= 5) {
    discount = Math.round(cartTotal * 0.10 * 100) / 100;
    message = 'Remise fidélité -10% appliquée';
  } else if (ordersCount >= 3) {
    discount = Math.round(cartTotal * 0.05 * 100) / 100;
    message = 'Remise fidélité -5% appliquée';
  }

  return {
    reward: { type: discount > 0 ? 'discount' : 'none', claimed: false, description: message },
    discount,
    originalShipping: shippingCost,
    newShippingCost: shippingCost,
    freeProductAdded: false,
    message,
    originalTotal: cartTotal,
    newTotal: Math.max(0, cartTotal - discount)
  };
}

export async function updateLoyaltyOrderCount(
  userId: string,
  authToken: string,
  orderId: string
): Promise<void> {
  try {
    logger.debug(`Mise à jour du compteur de fidélité pour l'utilisateur ${userId}, commande ${orderId}`);
    
    await httpClient.get('/users/me', { headers: { Authorization: `Bearer ${authToken}` } });
    const { data: ordersData } = await httpClient.get('/orders/me', { headers: { Authorization: `Bearer ${authToken}` } });

    const completedOrders = Array.isArray(ordersData.orders)
      ? ordersData.orders.filter((order: { status: string }) => order.status === 'delivered' || order.status === 'shipped')
      : [];
    const ordersCount = completedOrders.length;

    const loyaltyInfo = {
      ordersCount,
      currentReward: determineReward(),
      referralEnabled: ordersCount >= 1
    };

    await httpClient.patch(`/customers/${userId}`, { loyalty: loyaltyInfo }, {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${authToken}` }
    });

    logger.info(`Programme de fidélité mis à jour pour l'utilisateur ${userId}: ${ordersCount} commandes`);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du compteur de fidélité:', error);
  }
}
