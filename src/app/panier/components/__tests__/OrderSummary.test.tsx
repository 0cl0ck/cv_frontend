import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import OrderSummary from '../OrderSummary';
import type { Cart, PromoType } from '@/app/panier/types';
import { httpClient } from '@/lib/httpClient';

jest.mock('@/lib/httpClient', () => {
  return {
    __esModule: true,
    httpClient: {
      post: jest.fn(),
    },
  };
});

describe('OrderSummary referral', () => {
  beforeEach(() => {
    (httpClient.post as jest.Mock).mockReset();
  });

  it('applies referral discount from backend when eligible', async () => {
    (httpClient.post as jest.Mock).mockResolvedValueOnce({ data: { success: true, eligible: true, discount: 4 } });

    const cart: Cart = {
      subtotal: 60,
      subtotalCents: 6000,
      total: 0,
      totalCents: 0,
      items: [
        { productId: 'p1', name: 'Produit test', price: 60, priceCents: 6000, quantity: 1, isGift: false },
      ],
    };

    const totals = {
      success: true,
      subtotal: 60,
      subtotalCents: 6000,
      shippingCost: 0,
      shippingCostCents: 0,
      loyaltyDiscount: 0,
      loyaltyDiscountCents: 0,
      promoDiscount: 0,
      promoDiscountCents: 0,
      referralDiscount: 0,
      referralDiscountCents: 0,
      total: 60,
      totalCents: 6000,
      currency: 'EUR',
      shippingMethod: 'standard',
    };

    render(
      <OrderSummary
        cart={cart}
        totals={totals}
        loadingTotals={false}
        promoResult={{ applied: false, code: '', discount: 0, message: '', type: '' as PromoType }}
        loyaltyBenefits={{ active: false, message: '', discountAmount: 0, rewardType: 'none', orderCount: 1 }}
        isAuthenticated={false}
        onCheckout={() => {}}
        checkoutMode={false}
        onBackToCart={() => {}}
        onClearCart={() => {}}
        country="France"
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/56,00 €|56,00 €/)).toBeInTheDocument();
    });
  });
});
