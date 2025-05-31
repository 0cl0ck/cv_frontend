/**
 * Module d'API pour accéder aux fonctionnalités de fidélité
 * Ce module sert d'adaptateur entre les anciennes et nouvelles API
 */

import { httpClient } from './httpClient';
import logger from '@/utils/logger';

// Interface pour représenter un item du panier
interface CartItem {
  productId: string;
  quantity: number;
  price?: number;
  variant?: string;
  [key: string]: unknown; // Pour les propriétés supplémentaires
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
export async function getLoyaltyBenefits(cartTotal: number, shippingCost: number, items: CartItem[]) {
  try {
    // Nouvelle API
    const { data } = await httpClient.post('/loyalty/cart', {
      cartTotal,
      shippingCost,
      items
    });
    return data;
  } catch (error) {
    logger.warn('Erreur avec la nouvelle API de fidélité, fallback vers l\'ancienne', { error });
    
    // Fallback vers l'ancienne API en cas d'erreur
    try {
      const { data } = await httpClient.post('/cart/apply-loyalty', {
        cartTotal,
        shippingCost,
        items
      });
      return data;
    } catch (fallbackError) {
      logger.error('Erreur également avec l\'ancienne API de fidélité', { fallbackError });
      return {
        success: false,
        orderCount: 0,
        message: 'Erreur lors de l\'application des avantages de fidélité',
        discount: 0,
        newTotal: cartTotal,
        originalTotal: cartTotal
      };
    }
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
