import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';
import usePromoCode from '../usePromoCode';
import { Cart, CustomerInfo } from '@/app/panier/types';
import { fetchWithCsrf } from '@/lib/security/csrf';

jest.mock('@/lib/security/csrf', () => ({
  fetchWithCsrf: jest.fn(),
}));

// Mock fetchWithCsrf to use global fetch for tests
jest.mock('@/lib/security/csrf', () => ({
  fetchWithCsrf: (url: string, options?: RequestInit) => fetch(url, options).then(res => res.json()),
}));

function Wrapper({ cart, customerInfo }: { cart: Cart; customerInfo: CustomerInfo }) {
  const { promoCode, setPromoCode, promoResult, applyPromo } = usePromoCode(cart, customerInfo);

  return (
    <form onSubmit={applyPromo} data-testid="form">
      <input
        data-testid="promo-input"
        value={promoCode}
        onChange={(e) => setPromoCode(e.target.value)}
      />
      <button type="submit">Apply</button>
      <span data-testid="message">{promoResult.message}</span>
    </form>
  );
}

describe('usePromoCode', () => {
  beforeEach(() => {
    (fetchWithCsrf as jest.Mock).mockReset();
  });

  it('does not call API when code is empty', () => {
    const cart: Cart = { items: [], subtotal: 0, subtotalCents: 0, total: 0, totalCents: 0 };
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

    render(<Wrapper cart={cart} customerInfo={customerInfo} />);
    fireEvent.submit(screen.getByTestId('form'));
    expect(fetchWithCsrf).not.toHaveBeenCalled();
  });

  it('shows message when promo code is invalid', async () => {
    const cart: Cart = { items: [], subtotal: 0, subtotalCents: 0, total: 0, totalCents: 0 };
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

    (fetchWithCsrf as jest.Mock).mockResolvedValueOnce({ success: false, valid: false, message: 'Code invalide' });

    render(<Wrapper cart={cart} customerInfo={customerInfo} />);
    fireEvent.change(screen.getByTestId('promo-input'), { target: { value: 'BAD' } });
    fireEvent.submit(screen.getByTestId('form'));

    await waitFor(() => {
      expect(screen.getByTestId('message').textContent).toBe('Code invalide');
    });
    expect(fetchWithCsrf).toHaveBeenCalledTimes(1);
  });
});
