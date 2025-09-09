import { LoyaltyReward } from '@/types/loyalty';
import { secureLogger as logger } from '@/utils/logger';
import { httpClient } from '@/lib/httpClient';

/**
 * Détermine la récompense en fonction du nombre de commandes
 * @param ordersCount Nombre de commandes complétées
 * @returns L'objet de récompense applicable
 */
export function determineReward(ordersCount: number): LoyaltyReward {
  if (ordersCount === 2) {
    return { 
      type: 'sample', 
      claimed: false, 
      description: 'Échantillon offert' 
    };
  }
  if (ordersCount === 3) {
    return { 
      type: 'freeShipping', 
      claimed: false, 
      value: 5, 
      description: 'Livraison offerte (5€ de remise)' 
    };
  }
  if (ordersCount === 5) {
    return { 
      type: 'freeProduct', 
      claimed: false, 
      value: 10, 
      description: 'Produit offert (valeur 10€)' 
    };
  }
  if (ordersCount === 10) {
    return { 
      type: 'discount', 
      claimed: false, 
      value: 20, 
      description: 'Réduction 20€ ou Produit Offert' 
    };
  }
  return { 
    type: 'none', 
    claimed: false, 
    description: 'Aucune récompense disponible' 
  };
}

/**
 * Calcule et applique automatiquement les avantages de fidélité au panier
 * @param ordersCount Nombre de commandes complétées
 * @param cartTotal Total du panier avant remises
 * @param shippingCost Coût de livraison
 * @returns Objet contenant les modifications à appliquer
 */
export function applyLoyaltyBenefits(
  ordersCount: number,
  cartTotal: number,
  shippingCost: number
) {
  // Déterminer la récompense applicable pour cette commande
  const reward = determineReward(ordersCount + 1); // +1 car on considère la commande en cours
  
  // Initialiser les modifications à appliquer
  let discount = 0;
  let newShippingCost = shippingCost;
  let freeProductAdded = false;
  let message = '';

  // Appliquer la récompense en fonction du type
  switch (reward.type) {
    case 'freeShipping':
      if (shippingCost > 0) {
        newShippingCost = 0;
        discount += shippingCost;
        message = 'Livraison offerte appliquée !';
      }
      break;
      
    case 'freeProduct':
      // En réalité, on ajouterait un produit gratuit au panier
      // Pour simplifier, on applique une remise de 10€
      discount += 10;
      freeProductAdded = true;
      message = 'Produit offert (valeur 10€) appliqué !';
      break;
      
    case 'discount':
      discount += 20;
      message = 'Réduction de 20€ appliquée !';
      break;
      
    case 'sample':
      message = 'Un échantillon sera ajouté à votre commande !';
      break;
      
    default:
      message = 'Aucune récompense applicable pour cette commande';
  }

  // Calculer le nouveau total
  const newTotal = Math.max(0, cartTotal - discount + newShippingCost - shippingCost);
  
  return {
    reward,
    discount,
    originalShipping: shippingCost,
    newShippingCost,
    freeProductAdded,
    message,
    originalTotal: cartTotal,
    newTotal
  };
}
/**
 * Met à jour le compteur de commandes après une commande finalisée
 * @param userId ID de l'utilisateur
 * @param authToken Token d'authentification
 * @param orderId ID de la commande finalisée
 */
export async function updateLoyaltyOrderCount(
  userId: string,
  authToken: string,
  orderId: string
): Promise<void> {
  try {
    logger.debug(`Mise à jour du compteur de fidélité pour l'utilisateur ${userId}, commande ${orderId}`);
    
    // Récupérer les informations utilisateur actuelles
    await httpClient.get('/users/me', {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    
    // Récupérer les commandes de l'utilisateur
    const { data: ordersData } = await httpClient.get('/orders/me', {
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
    
    // Compter les commandes complétées (livrées ou expédiées)
    const completedOrders = Array.isArray(ordersData.orders) 
      ? ordersData.orders.filter((order: { status: string }) => 
          order.status === 'delivered' || order.status === 'shipped'
        )
      : [];
    
    const ordersCount = completedOrders.length;
    
    // Mettre à jour l'objet de fidélité
    const loyaltyInfo = {
      ordersCount,
      currentReward: determineReward(ordersCount),
      referralEnabled: ordersCount >= 1
    };
    
    // Mettre à jour le profil utilisateur
    await httpClient.patch(`/customers/${userId}`, {
      loyalty: loyaltyInfo
    }, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      }
    });
    
    logger.info(`Programme de fidélité mis à jour pour l'utilisateur ${userId}: ${ordersCount} commandes`);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du compteur de fidélité:', error);
  }
}
