/**
 * Module d'API pour accéder aux fonctionnalités de fidélité
 * Ce module sert d'adaptateur entre les anciennes et nouvelles API
 */

import { httpClient } from './httpClient';
import logger from '@/utils/logger';

export type LoyaltyCartResponse = {
  success: boolean;
  orderCount: number;
  guest?: boolean;
  message: string;
  discount: number;
  shippingDiscount?: number;
  freeProduct?: boolean;
  newTotal: number;
  originalTotal: number;
};

// Interface pour représenter un item du panier
interface CartItem {
  productId: string;
  quantity: number;
  price?: number;
}

/**
 * Récupère l'état complet du programme de fidélité
 * Nouvelle API centralisée
 */
export async function getLoyaltyStatus() {
  try {
    const { data } = await httpClient.get('/loyalty/status');
    return data;
  } catch (error) {
    logger.error('Erreur lors de la récupération de l\'état de fidélité', { error });
    // Fallback aux anciennes API si nécessaire
    return { 
      success: false, 
      ordersCount: 0,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

/**
 * Récupère les avantages de fidélité applicables au panier
 * Nouvelle API centralisée
 */
export async function getLoyaltyBenefits(
  cartTotal: number,
  country: string,
  items: CartItem[],
): Promise<LoyaltyCartResponse> {
  try {
    const { data } = await httpClient.post('/loyalty/cart', {
      cartTotal,
      country,
      items,
    });
    return data as LoyaltyCartResponse;
  } catch (error) {
    logger.error('Erreur avec l\'API fidélité /loyalty/cart', { error });
    return {
      success: false,
      orderCount: 0,
      message: 'Erreur lors de l\'application des avantages de fidélité',
      discount: 0,
      newTotal: cartTotal,
      originalTotal: cartTotal,
    } as LoyaltyCartResponse;
  }
}

/**
 * Réclame une récompense de fidélité
 * Nouvelle API centralisée
 */
export async function claimLoyaltyReward(rewardType: string) {
  try {
    const { data } = await httpClient.post('/loyalty/claim', {
      rewardType
    });
    return data;
  } catch (error) {
    logger.error('Erreur lors de la réclamation de la récompense', { error, rewardType });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

/**
 * Synchronise le compteur de commandes validées pour un utilisateur
 * Utile pour forcer une mise à jour en cas d'incohérence
 */
export async function syncLoyaltyOrderCount() {
  try {
    const { data } = await httpClient.post('/loyalty/sync');
    return data;
  } catch (error) {
    logger.error('Erreur lors de la synchronisation du compteur de fidélité', { error });
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}
