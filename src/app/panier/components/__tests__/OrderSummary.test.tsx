import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import OrderSummary from '../OrderSummary';
import type { PromoType } from '@/app/panier/types';
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

    render(
      <OrderSummary
        subtotal={60}
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
      // Total should be 60 (subtotal, free shipping) - 4 (referral)
      expect(screen.getByText(/56,00/)).toBeInTheDocument();
    });
  });
});
