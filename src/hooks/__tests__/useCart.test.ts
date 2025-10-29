import { renderHook, act, waitFor } from '@testing-library/react';
import { useCart } from '../useCart';
import type { Product, ProductVariation } from '@/types/product';

jest.mock('@/lib/pricingClient', () => ({
  __esModule: true,
  calculateCartTotals: jest.fn(() =>
    Promise.resolve({
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
    }),
  ),
}));

const product: Product = { id: 'p1', name: 'Prod 1', slug: 'prod-1', price: 10 };
const variant: ProductVariation = { id: 'v1', weight: 5, price: 10 };

describe('useCart', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with empty cart', async () => {
    const { result } = renderHook(() => useCart());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.cart.items).toHaveLength(0);
    expect(result.current.cart.subtotal).toBe(0);
  });

  it('adds a new item with correct totals', async () => {
    const { result } = renderHook(() => useCart());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.addItem({ ...product }, 2, { ...variant }));

    await waitFor(() => expect(result.current.cart.items.length).toBe(1));
    expect(result.current.cart.subtotal).toBe(20);
    expect(result.current.cart.subtotalCents).toBe(2000);
    expect(result.current.cart.totalCents).toBe(2000);
  });

  it('increments existing item when adding same product/variant', async () => {
    const { result } = renderHook(() => useCart());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.addItem({ ...product }, 1, { ...variant }));
    act(() => result.current.addItem({ ...product }, 3, { ...variant }));

    await waitFor(() => expect(result.current.cart.items[0].quantity).toBe(4));
    expect(result.current.cart.subtotal).toBe(40);
    expect(result.current.cart.subtotalCents).toBe(4000);
  });

  it('updates quantity and recalculates totals', async () => {
    const { result } = renderHook(() => useCart());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.addItem({ ...product }, 1, { ...variant }));

    act(() => result.current.updateQuantity(0, 5));
    await waitFor(() => expect(result.current.cart.items[0].quantity).toBe(5));
    expect(result.current.cart.subtotalCents).toBe(5000);
  });

  it('sets shipping method and affects totalCents', async () => {
    const { result } = renderHook(() => useCart());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.addItem({ ...product }, 1, { ...variant }));

    act(() => result.current.setShippingMethod('std', 4, 'Standard'));
    await waitFor(() => expect(result.current.cart.totalCents).toBe(1400));
  });

  it('removes item and resets to empty cart', async () => {
    const { result } = renderHook(() => useCart());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    act(() => result.current.addItem({ ...product }, 1, { ...variant }));

    act(() => result.current.removeItem(0));
    await waitFor(() => expect(result.current.cart.items.length).toBe(0));
    expect(result.current.cart.subtotal).toBe(0);
    expect(result.current.cart.totalCents).toBe(0);
  });
});
