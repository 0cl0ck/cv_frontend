import { useEffect, useState } from 'react';
import type { Cart } from '../types';
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
  siteDiscount: 0,
  siteDiscountCents: 0,
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
  appliedSitePromotion: null,
  appliedPromo: null,
  appliedLoyalty: null,
  appliedReferral: null,
  automaticGifts: [],
};

export function useCartPricing(
  cart: Cart,
  country: string | undefined,
  promoCode?: string,
): UseCartPricingResult {
  const [totals, setTotals] = useState<PricingTotals | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Recalculer lorsque le panier, le pays ou le code promo changent

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
          country: country || 'FR',
          promoCode,
        });
        if (!cancelled) {
          setTotals(data);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('[useCartPricing] Échec du calcul du panier', err);
          setError("Impossible de recalculer le panier pour le moment. Merci de réessayer.");
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
  }, [cart, country, promoCode]);

  return {
    totals,
    loading,
    error,
  };
}

