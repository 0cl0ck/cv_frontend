import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import CheckoutSidebar from '../CheckoutSidebar';
import type { Cart, CustomerInfo, LoyaltyBenefits, PromoResult } from '@/app/panier/types';
import { httpClient } from '@/lib/httpClient';

jest.mock('@/lib/httpClient', () => {
  return {
    __esModule: true,
    httpClient: {
      post: jest.fn(),
    },
  };
});

// Mock nested components to avoid Next.js runtime specifics
jest.mock('../PromoCodeForm', () => ({ __esModule: true, default: () => <div data-testid="promo-form" /> }));
jest.mock('../GuestLoyaltyBanner', () => ({ __esModule: true, default: () => <div data-testid="guest-loyalty" /> }));
jest.mock('../LoyaltyBenefitsPanel', () => ({ __esModule: true, default: () => <div data-testid="loyalty-panel" /> }));
jest.mock('../CheckoutForm', () => ({ __esModule: true, default: () => <form data-testid="checkout-form" /> }));

describe('CheckoutSidebar summary (checkout mode)', () => {
  beforeEach(() => {
    (httpClient.post as jest.Mock).mockReset();
  });

  it('shows loyalty discount and message, and displays final total including loyalty in checkout mode', async () => {
    // Mock pricing totals returned by backend
    (httpClient.post as jest.Mock).mockImplementation((url: string) => {
      if (url === '/pricing') {
        return Promise.resolve({
          data: {
            success: true,
            subtotal: 100,
            subtotalCents: 10000,
            shippingCost: 5,
            shippingCostCents: 500,
            loyaltyDiscount: 10,
            loyaltyDiscountCents: 1000,
            promoDiscount: 0,
            promoDiscountCents: 0,
            referralDiscount: 0,
            referralDiscountCents: 0,
            total: 95,
            totalCents: 9500,
            currency: 'EUR',
            shippingMethod: 'standard',
          },
        });
      }
      return Promise.resolve({ data: {} });
    });

    const cart: Cart = {
      items: [
        { productId: 'p1', name: 'Produit test', price: 100, priceCents: 10000, quantity: 1 },
      ],
      subtotal: 100,
      subtotalCents: 10000,
      total: 0,
      totalCents: 0,
    };

    const customerInfo: CustomerInfo = {
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '0612345678',
      address: '1 rue ici',
      addressLine2: '',
      city: 'Paris',
      postalCode: '75000',
      country: 'France',
    };

    const loyaltyBenefits: LoyaltyBenefits = {
      active: true,
      message: 'Remise fidélité -10% appliquée',
      discountAmount: 10,
      rewardType: 'discount',
      orderCount: 5,
    };

    const promoResult: PromoResult = {
      applied: false,
      code: '',
      discount: 0,
      message: '',
      type: '',
    };

    render(
      <CheckoutSidebar
        isAuthenticated={true}
        loyaltyBenefits={loyaltyBenefits}
        loadingLoyalty={false}
        promoCode={''}
        setPromoCode={() => {}}
        promoResult={promoResult}
        isApplying={false}
        onApply={async () => {}}
        onCancel={() => {}}
        cart={cart}
        customerInfo={customerInfo}
        errors={{}}
        handleInputChange={() => {}}
        selectedAddressId={null}
        userAddresses={[]}
        handleSelectAddress={() => {}}
        checkoutMode={true}
        onCheckout={() => {}}
        onBackToCart={() => {}}
        onPaymentSubmit={async () => {}}
        clearCart={() => {}}
        isSubmitting={false}
        paymentMethod={'card'}
        setPaymentMethod={() => {}}
      />
    );

    // Loyalty message should be visible
    expect(screen.getByText(/Remise fidélité -10% appliquée/)).toBeInTheDocument();

    // Discount line should appear with -10,00 € (locale may include narrow no-break space)
    await waitFor(() => {
      expect(screen.getByText(/-10,00\s?€/)).toBeInTheDocument();
    });

    // Total should include loyalty discount: 100 + 5 - 10 = 95
    await waitFor(() => {
      expect(screen.getByText(/95,00\s?€/)).toBeInTheDocument();
    });
  });
});
