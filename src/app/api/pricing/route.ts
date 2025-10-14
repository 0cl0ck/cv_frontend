import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { checkOrigin } from '@/lib/security/origin-check';

type PricingItem = {
  price: number;
  quantity: number;
};

type PricingInput = {
  items?: PricingItem[];
  country?: string;
  loyaltyDiscount?: number;
  promoDiscount?: number;
  referralDiscount?: number;
};

export async function POST(request: NextRequest) {
  const originCheck = checkOrigin(request);
  if (originCheck) return originCheck;
  
  try {
    await cookies();

    const input = (await request.json()) as PricingInput;

    const items = Array.isArray(input.items) ? input.items : [];
    const toNumber = (n: unknown): number => (Number.isFinite(n as number) ? Number(n) : 0);
    const round2 = (n: number): number => Math.round(n * 100) / 100;
    const toCents = (n: number): number => Math.round(n * 100);
    const clampNonNegative = (n: number): number => (n < 0 ? 0 : n);

    const subtotal = round2(
      items.reduce((sum, it) => sum + toNumber(it.price) * toNumber(it.quantity), 0),
    );

    const computeShippingCost = (subtotalVal: number, c?: string): number => {
      const norm = (c || '').trim().toLowerCase();
      if (['belgique', 'belgium', 'be'].includes(norm)) {
        return subtotalVal >= 200 ? 0 : 10;
      }
      return subtotalVal >= 50 ? 0 : 5;
    };

    const shippingCost = round2(computeShippingCost(subtotal, input.country));

    const loyaltyDiscount = clampNonNegative(round2(toNumber(input.loyaltyDiscount)));
    const promoDiscount = clampNonNegative(round2(toNumber(input.promoDiscount)));
    const referralDiscount = clampNonNegative(round2(toNumber(input.referralDiscount)));

    const discountedTotal = subtotal + shippingCost - (loyaltyDiscount + promoDiscount + referralDiscount);
    const total = round2(Math.max(0, discountedTotal));

    const data = {
      success: true,
      subtotal,
      subtotalCents: toCents(subtotal),
      shippingCost,
      shippingCostCents: toCents(shippingCost),
      loyaltyDiscount,
      loyaltyDiscountCents: toCents(loyaltyDiscount),
      promoDiscount,
      promoDiscountCents: toCents(promoDiscount),
      referralDiscount,
      referralDiscountCents: toCents(referralDiscount),
      total,
      totalCents: toCents(total),
      currency: 'EUR',
      shippingMethod: 'standard',
    };

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('[BFF /api/pricing] Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

