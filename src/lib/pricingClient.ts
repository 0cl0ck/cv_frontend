import { httpClient } from '@/lib/httpClient';
import type { Cart } from '@/app/panier/types';

export interface PricingTotals {
  success: boolean;
  subtotal: number;
  subtotalCents: number;
  shippingCost: number;
  shippingCostCents: number;
  loyaltyDiscount: number;
  loyaltyDiscountCents: number;
  promoDiscount: number;
  promoDiscountCents: number;
  referralDiscount: number;
  referralDiscountCents: number;
  total: number;
  totalCents: number;
  currency: string;
  shippingMethod: string;
}

type CalculateCartTotalsOptions = {
  cart: Cart;
  country?: string;
  loyaltyDiscount?: number;
  promoDiscount?: number;
  referralDiscount?: number;
};

const sanitizeDiscount = (value?: number): number =>
  Number.isFinite(value) ? Math.max(0, Math.round((value as number) * 100) / 100) : 0;

export async function calculateCartTotals({
  cart,
  country,
  loyaltyDiscount,
  promoDiscount,
  referralDiscount,
}: CalculateCartTotalsOptions): Promise<PricingTotals> {
  const items = Array.isArray(cart.items)
    ? cart.items
        .filter((item) => !item.isGift)
        .map((item) => ({
          price: Number.isFinite(item.price) ? Number(item.price) : 0,
          quantity: Number.isFinite(item.quantity) ? Number(item.quantity) : 0,
        }))
    : [];

  const { data } = await httpClient.post<PricingTotals>(
    '/cart/pricing',
    {
      items,
      country,
      loyaltyDiscount: sanitizeDiscount(loyaltyDiscount),
      promoDiscount: sanitizeDiscount(promoDiscount),
      referralDiscount: sanitizeDiscount(referralDiscount),
    },
    { withCsrf: true },
  );

  if (!data?.success) {
    throw new Error('Le calcul du panier a échoué');
  }

  return data;
}
