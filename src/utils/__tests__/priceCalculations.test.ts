import { PriceService } from '../priceCalculations';
import type { PromoType } from '@/app/panier/types';

const baseCart = (subtotal: number) => ({
  items: [],
  subtotal,
  subtotalCents: Math.round(subtotal * 100),
  total: 0,
  totalCents: 0,
});

describe('PriceService.calculateShippingCost', () => {
  it('France: 5 if <50, free at >=50', () => {
    expect(PriceService.calculateShippingCost(0, 'France')).toBe(5);
    expect(PriceService.calculateShippingCost(49.99, 'France')).toBe(5);
    expect(PriceService.calculateShippingCost(50, 'France')).toBe(0);
  });

  it('Belgique: 10 if <200, free at >=200', () => {
    expect(PriceService.calculateShippingCost(199.99, 'Belgique')).toBe(10);
    expect(PriceService.calculateShippingCost(200, 'Belgique')).toBe(0);
  });
});

describe('PriceService.calculateTotalPrice', () => {
  it('computes totals with loyalty and promo', () => {
    const cart = baseCart(60);
    const res = PriceService.calculateTotalPrice(
      cart,
      'France',
      { active: true, message: '', discountAmount: 5, rewardType: 'none', orderCount: 1 },
      { applied: true, code: 'PROMO', discount: 3, message: '', type: '' as PromoType }
    );
    // Shipping free at 60
    expect(res.shippingCost).toBe(0);
    expect(res.total).toBe(60 - 5 - 3);
    expect(res.totalCents).toBe(Math.round((60 - 8) * 100));
  });
});
