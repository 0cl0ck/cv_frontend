/**
 * Utilitaire centralisé pour tous les calculs de prix dans l'application
 * Garantit une cohérence entre l'affichage panier et les commandes enregistrées
 */

import { Cart, LoyaltyBenefits, PromoResult } from '@/app/panier/types';

interface PriceCalculationResult {
  subtotal: number;
  subtotalCents: number;
  shippingCost: number;
  shippingCostCents: number;
  loyaltyDiscount: number;
  loyaltyDiscountCents: number;
  promoDiscount: number;
  promoDiscountCents: number;
  total: number;
  totalCents: number;
}

export class PriceService {
  static calculateShippingCost(subtotal: number, country: string): number {
    if (country === 'Belgique') {
      return 10;
    } else if (subtotal >= 49) {
      return 0;
    } else {
      return 4.95;
    }
  }

  static isShippingFree(): boolean {
    // 🎁 PROMOTION TEMPORAIRE: Frais de livraison offerts pour tous les clients
    // + 2g offerts pour la première commande sur le site (programme fidélité)
    return true;
    
    // Code commenté pendant la période promotionnelle
    /*
    // Livraison gratuite si c'est un avantage fidélité activé
    if (loyaltyBenefits?.active && loyaltyBenefits.rewardType === 'freeShipping') {
      return true;
    }
    // Livraison gratuite si c'est un code promo appliqué
    if (promoResult?.applied && promoResult.type === 'free_shipping') {
      return true;
    }
    // En Belgique, jamais de livraison gratuite par défaut
    if (country === 'Belgique') {
      return false;
    }
    // Sinon, livraison gratuite à partir de 49€
    return subtotal >= 49;
    */
  }

  static calculateTotalPrice(
    cart: Cart,
    country: string,
    loyaltyBenefits: LoyaltyBenefits,
    promoResult: PromoResult
  ): PriceCalculationResult {
    const subtotal = cart.subtotal;
    const subtotalCents = cart.subtotalCents || Math.round(subtotal * 100);
    
    // Vérifier si la livraison est gratuite (en tenant compte des avantages fidélité)
    const free = PriceService.isShippingFree();
    const shippingCost = free ? 0 : PriceService.calculateShippingCost(subtotal, country);
    const shippingCostCents = Math.round(shippingCost * 100);

    // Remise fidélité (renvoyée par le backend)
    const loyaltyDiscount = loyaltyBenefits.active ? loyaltyBenefits.discountAmount : 0;
    const loyaltyDiscountCents = Math.round(loyaltyDiscount * 100);

    // Remise promo
    const promoDiscount = promoResult.applied ? promoResult.discount : 0;
    const promoDiscountCents = Math.round(promoDiscount * 100);

    // Calcul du total final
    const total = subtotal + shippingCost - loyaltyDiscount - promoDiscount;
    const totalCents = Math.round(total * 100);

    return {
      subtotal,
      subtotalCents,
      shippingCost,
      shippingCostCents,
      loyaltyDiscount,
      loyaltyDiscountCents,
      promoDiscount,
      promoDiscountCents,
      total,
      totalCents,
    };
  }

  static formatPriceWithCurrency(price: number): string {
    return `${price.toFixed(2)} €`;
  }
}

export const calculateShippingCost = PriceService.calculateShippingCost;
export const isShippingFree = PriceService.isShippingFree;
export const calculateTotalPrice = PriceService.calculateTotalPrice;
export const formatPriceWithCurrency = PriceService.formatPriceWithCurrency;
