import {
  determineGiftsForSubtotal,
  calculateSubtotalWithoutGifts,
  calculateSubtotalCentsWithoutGifts,
  GIFT_IDS,
} from '../gift-utils';
import type { CartItem } from '@/types/cart';

describe('gift-utils thresholds', () => {
  it('returns no gifts when subtotal is 0', () => {
    expect(determineGiftsForSubtotal(0)).toHaveLength(0);
  });

  it('returns base 2g gift for subtotal > 0 and < 50', () => {
    const gifts = determineGiftsForSubtotal(10);
    expect(gifts.some(g => g.productId === GIFT_IDS.BASE_GIFT_2G)).toBe(true);
    expect(gifts.some(g => g.productId === GIFT_IDS.TIER_2_GIFT)).toBe(false);
    expect(gifts.some(g => g.productId === GIFT_IDS.TIER_3_GIFT)).toBe(false);
  });

  it('returns base 5g gift at >= 50 and < 80', () => {
    const gifts = determineGiftsForSubtotal(50);
    expect(gifts.some(g => g.productId === GIFT_IDS.BASE_GIFT_5G)).toBe(true);
    expect(gifts.some(g => g.productId === GIFT_IDS.TIER_2_GIFT)).toBe(false);
  });

  it('returns base 5g + tier2 at >= 80 and < 160', () => {
    const gifts = determineGiftsForSubtotal(100);
    expect(gifts.some(g => g.productId === GIFT_IDS.BASE_GIFT_5G)).toBe(true);
    expect(gifts.some(g => g.productId === GIFT_IDS.TIER_2_GIFT)).toBe(true);
    expect(gifts.some(g => g.productId === GIFT_IDS.TIER_3_GIFT)).toBe(false);
  });

  it('returns base 5g + tier3 at >= 160', () => {
    const gifts = determineGiftsForSubtotal(200);
    expect(gifts.some(g => g.productId === GIFT_IDS.BASE_GIFT_5G)).toBe(true);
    expect(gifts.some(g => g.productId === GIFT_IDS.TIER_3_GIFT)).toBe(true);
  });
});

describe('gift-utils subtotal calculators', () => {
  const items: CartItem[] = [
    { productId: 'p1', name: 'Produit 1', price: 10, priceCents: 1000, quantity: 2, isGift: false },
    { productId: 'gift', name: 'Cadeau', price: 0, priceCents: 0, quantity: 1, isGift: true },
    { productId: 'p2', name: 'Produit 2', price: 5.5, priceCents: 550, quantity: 1, isGift: false },
  ];

  it('ignores gifts when calculating subtotal (euros)', () => {
    expect(calculateSubtotalWithoutGifts(items)).toBe(25.5);
  });

  it('ignores gifts when calculating subtotal (cents)', () => {
    expect(calculateSubtotalCentsWithoutGifts(items)).toBe(2550);
  });
});
