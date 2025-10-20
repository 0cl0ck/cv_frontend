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
  // Détails des remises appliquées (optionnels)
  appliedPromo?: { 
    code: string; 
    type: string; 
    value: number; 
    applied: boolean;
    categoryRestrictionType?: 'none' | 'exclude' | 'include';
    restrictedCategories?: Array<{ id: string; name: string }>;
    message?: string;
  } | null;
  appliedLoyalty?: { 
    eligible: boolean; 
    tier: string; 
    ordersCount: number;
    discount?: number;
    message?: string;
    nextLevel?: { name: string; ordersRequired: number; remainingOrders: number };
  } | null;
  appliedReferral?: { eligible: boolean; code: string; discount: number } | null;
}

type CalculateCartTotalsOptions = {
  cart: Cart;
  country?: string;
  promoCode?: string;
};


export async function calculateCartTotals({
  cart,
  country,
  promoCode,
}: CalculateCartTotalsOptions): Promise<PricingTotals> {
  const items = Array.isArray(cart.items)
    ? cart.items
        .filter((item) => !item.isGift)
        .map((item) => {
          const parseLocaleDecimal = (value: unknown): number => {
            if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
            const raw = String(value ?? '').trim();
            if (raw.length === 0) return 0;
            // Keep only digits, comma, dot, minus
            const cleaned = raw.replace(/[^0-9,.-]/g, '');
            const hasComma = cleaned.includes(',');
            const hasDot = cleaned.includes('.');
            let normalized = cleaned;
            if (hasComma && hasDot) {
              // Decide decimal separator as the last occurring symbol
              const lastComma = cleaned.lastIndexOf(',');
              const lastDot = cleaned.lastIndexOf('.');
              const decimalSep = lastComma > lastDot ? ',' : '.';
              // Remove the other separator(s) as thousands
              if (decimalSep === ',') normalized = cleaned.replace(/\./g, '');
              else normalized = cleaned.replace(/,/g, '');
              // Unify decimal sep to dot
              normalized = normalized.replace(',', '.');
            } else if (hasComma && !hasDot) {
              normalized = cleaned.replace(',', '.');
            } // if only dot, keep as is
            const n = Number(normalized);
            return Number.isFinite(n) ? n : 0;
          };
          const parseIntSafe = (value: unknown): number => {
            if (typeof value === 'number') return Number.isFinite(value) ? Math.trunc(value) : 0;
            const digitsOnly = String(value ?? '').replace(/[^0-9-]/g, '');
            const n = Number(digitsOnly);
            return Number.isFinite(n) ? Math.trunc(n) : 0;
          };
          return {
            price: parseLocaleDecimal(item.price as unknown),
            quantity: parseIntSafe(item.quantity as unknown),
            productId: item.productId,
            categoryId: item.categoryId,
          };
        })
    : [];

  const { data } = await httpClient.post<PricingTotals>(
    '/pricing',
    {
      items,
      country,
      promoCode,
    },
    { withCsrf: true },
  );

  if (!data?.success) {
    throw new Error('Le calcul du panier a échoué');
  }

  return data;
}
