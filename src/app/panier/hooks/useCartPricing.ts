import { useEffect, useMemo, useState } from 'react';
import type { Cart, LoyaltyBenefits, PromoResult } from '../types';
import type { PricingTotals } from '@/lib/pricingClient';
import { calculateCartTotals } from '@/lib/pricingClient';

type UseCartPricingResult = {
  totals: PricingTotals | null;
  loading: boolean;
  error: string | null;
};

const emptyTotals: PricingTotals = {
  success: true,
  subtotal: 0,
  subtotalCents: 0,
  shippingCost: 0,
  shippingCostCents: 0,
  loyaltyDiscount: 0,
  loyaltyDiscountCents: 0,
  promoDiscount: 0,
  promoDiscountCents: 0,
  referralDiscount: 0,
  referralDiscountCents: 0,
  total: 0,
  totalCents: 0,
  currency: 'EUR',
  shippingMethod: 'standard',
};

export function useCartPricing(
  cart: Cart,
  country: string | undefined,
  loyaltyBenefits: LoyaltyBenefits,
  promoResult: PromoResult,
  referralDiscount: number = 0,
): UseCartPricingResult {
  const [totals, setTotals] = useState<PricingTotals | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const signature = useMemo(() => {
    const items = Array.isArray(cart.items)
      ? cart.items
          .filter((item) => !item.isGift)
          .map((item) => ({
            id: item.productId,
            variant: item.variantId,
            qty: item.quantity,
            price: item.price,
          }))
      : [];

    return JSON.stringify({
      items,
      subtotal: cart.subtotal,
      country: country || 'FR',
      loyaltyDiscount: loyaltyBenefits.discountAmount,
      promoApplied: promoResult.applied ? promoResult.discount : 0,
      referralDiscount,
    });
  }, [cart.items, cart.subtotal, country, loyaltyBenefits.discountAmount, promoResult.applied, promoResult.discount, referralDiscount]);

  useEffect(() => {
    let cancelled = false;

    async function refreshTotals() {
      if (!Array.isArray(cart.items) || cart.items.filter((item) => !item.isGift).length === 0) {
        setTotals(emptyTotals);
        setLoading(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await calculateCartTotals({
          cart,
          country,
          loyaltyDiscount: loyaltyBenefits.discountAmount,
          promoDiscount: promoResult.applied ? promoResult.discount : 0,
          referralDiscount,
        });
        if (!cancelled) {
          setTotals(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Une erreur est survenue lors du calcul du total.');
          setTotals(emptyTotals);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    refreshTotals();

    return () => {
      cancelled = true;
    };
  }, [cart, country, loyaltyBenefits.discountAmount, promoResult.applied, promoResult.discount, referralDiscount, signature]);

  return {
    totals,
    loading,
    error,
  };
}
