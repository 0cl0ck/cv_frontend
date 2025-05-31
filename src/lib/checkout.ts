/**
 * Orchestrateur pour le processus de paiement
 * Ce module coordonne l'ensemble du flux checkout -> paiement -> fidélité
 */

import { httpClient } from './httpClient';
import logger from '@/utils/logger';

// Types
interface CheckoutItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    title: string;
  };
}

interface ShippingInfo {
  method: string;
  cost: number;
}

interface AddressInfo {
  name: string;
  line1: string;
  line2?: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface CheckoutData {
  items: CheckoutItem[];
  subtotal: number;
  shipping: ShippingInfo;
  shippingAddress: AddressInfo;
  billingAddress: AddressInfo;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  notes?: string;
}

export interface PaymentResult {
  success: boolean;
  orderCode?: string;
  smartCheckoutUrl?: string;
  orderId?: string;
  message: string;
  error?: string;
}

export interface LoyaltyBenefits {
  success: boolean;
  orderCount: number;
  message: string;
  discount: number;
  shippingDiscount?: number;
  freeProduct?: boolean;
  newTotal: number;
  originalTotal: number;
  error?: string;
}

/**
 * Récupère les avantages de fidélité applicables au panier actuel
 * @param cartTotal Total du panier avant remises
 * @param shippingCost Coût de livraison
 * @param items Articles du panier
 */
export async function getLoyaltyBenefits(
  cartTotal: number,
  shippingCost: number,
  items: CheckoutItem[]
): Promise<LoyaltyBenefits> {
  try {
    const { data } = await httpClient.post('/loyalty/cart', {
      cartTotal,
      shippingCost,
      items
    });
    
    return data;
  } catch (error) {
    logger.error('Erreur lors de la récupération des avantages de fidélité', { error });
    
    // Retourner un objet par défaut en cas d'erreur
    return {
      success: false,
      orderCount: 0,
      message: 'Impossible de récupérer les avantages de fidélité',
      discount: 0,
      newTotal: cartTotal,
      originalTotal: cartTotal,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

/**
 * Initialise un paiement pour une commande
 * @param checkoutData Données du panier et informations client
 * @param loyaltyDiscount Remise de fidélité à appliquer
 */
export async function initiatePayment(
  checkoutData: CheckoutData,
  loyaltyDiscount: number = 0
): Promise<PaymentResult> {
  try {
    // Préparer les données de paiement
    const paymentData = {
      order: {
        ...checkoutData,
        loyaltyDiscount,
        total: checkoutData.subtotal + checkoutData.shipping.cost - loyaltyDiscount
      },
      payment: {
        amount: checkoutData.subtotal + checkoutData.shipping.cost - loyaltyDiscount,
        description: `Commande CBD ${new Date().toISOString().split('T')[0]}`,
        fullName: `${checkoutData.firstName} ${checkoutData.lastName}`,
        email: checkoutData.email,
        clientReference: checkoutData.email
      }
    };
    
    // Appeler l'API de création de paiement
    const { data } = await httpClient.post('/payment/create', paymentData);
    
    return {
      success: true,
      orderCode: data.orderCode,
      smartCheckoutUrl: data.smartCheckoutUrl,
      orderId: data.orderId,
      message: data.message || 'Paiement initialisé avec succès'
    };
  } catch (error) {
    logger.error('Erreur lors de l\'initialisation du paiement', { error });
    
    return {
      success: false,
      message: 'Erreur lors de l\'initialisation du paiement',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}

/**
 * Vérifie le statut d'un paiement
 * @param orderCode Code de commande VivaWallet
 */
export async function verifyPayment(orderCode: string): Promise<{
  success: boolean;
  status?: string;
  message: string;
  orderId?: string;
}> {
  try {
    const { data } = await httpClient.get(`/payment/verify/${orderCode}`);
    
    return {
      success: data.success,
      status: data.status,
      message: data.message,
      orderId: data.orderId
    };
  } catch (error) {
    logger.error('Erreur lors de la vérification du paiement', { 
      error,
      orderCode 
    });
    
    return {
      success: false,
      message: 'Erreur lors de la vérification du paiement'
    };
  }
}

/**
 * Récupère l'état complet du programme de fidélité
 */
export async function getLoyaltyStatus(): Promise<{
  success: boolean;
  ordersCount?: number;
  currentReward?: {
    type: string;
    claimed: boolean;
    description: string;
    value?: number;
  };
  nextReward?: {
    type: string;
    claimed: boolean;
    description: string;
    value?: number;
  };
  nextRewardThreshold?: number;
  progress?: number;
  referralEnabled?: boolean;
  error?: string;
  message?: string;
}> {
  try {
    const { data } = await httpClient.get('/loyalty/status');
    
    return data;
  } catch (error) {
    logger.error('Erreur lors de la récupération de l\'état de fidélité', { error });
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
      message: 'Impossible de récupérer votre état de fidélité'
    };
  }
}

/**
 * Flux complet de checkout
 * Cette fonction orchestre l'ensemble du processus:
 * 1. Récupération des avantages de fidélité
 * 2. Initialisation du paiement
 * 3. Redirection vers la page de paiement
 */
export async function processCheckout(
  checkoutData: CheckoutData
): Promise<{
  success: boolean;
  redirectUrl?: string;
  message: string;
  error?: string;
  orderId?: string;
}> {
  try {
    // 1. Récupérer les avantages de fidélité
    const loyaltyBenefits = await getLoyaltyBenefits(
      checkoutData.subtotal,
      checkoutData.shipping.cost,
      checkoutData.items
    );
    
    if (!loyaltyBenefits.success) {
      logger.warn('Impossible d\'appliquer les avantages de fidélité', { 
        error: loyaltyBenefits.error 
      });
      // Continuer sans avantages de fidélité
    }
    
    // 2. Initialiser le paiement
    const paymentResult = await initiatePayment(
      checkoutData,
      loyaltyBenefits.success ? loyaltyBenefits.discount : 0
    );
    
    if (!paymentResult.success || !paymentResult.smartCheckoutUrl) {
      return {
        success: false,
        message: 'Erreur lors de l\'initialisation du paiement',
        error: paymentResult.error || 'Erreur inconnue'
      };
    }
    
    // 3. Tout est prêt pour la redirection
    return {
      success: true,
      redirectUrl: paymentResult.smartCheckoutUrl,
      message: 'Paiement initialisé avec succès',
      orderId: paymentResult.orderId
    };
  } catch (error) {
    logger.error('Erreur lors du processus de checkout', { error });
    
    return {
      success: false,
      message: 'Erreur lors du processus de checkout',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}
