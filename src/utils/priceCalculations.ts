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
    // Nouvelle politique d'expédition
    // - France et autres: 5€ si < 50€, gratuit à partir de 50€
    // - Belgique: 10€ si < 70€, gratuit à partir de 70€
    if (country === 'Belgique') {
      return subtotal >= 70 ? 0 : 10;
    }
    return subtotal >= 50 ? 0 : 5;
  }

  static isShippingFree(country?: string, subtotal?: number): boolean {
    if (typeof subtotal !== 'number') return false;
    return PriceService.calculateShippingCost(subtotal, country || '') === 0;
  }

  static calculateTotalPrice(
    cart: Cart,
    country: string,
    loyaltyBenefits: LoyaltyBenefits,
    promoResult: PromoResult
  ): PriceCalculationResult {
    const subtotal = cart.subtotal;
    const subtotalCents = cart.subtotalCents || Math.round(subtotal * 100);

    // Calcul des frais de livraison selon la politique actuelle
    const shippingCost = PriceService.calculateShippingCost(subtotal, country);
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

