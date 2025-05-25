import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import React from 'react';
import useCheckout from '../useCheckout';
import { Cart, PromoResult, LoyaltyBenefits, CustomerInfo } from '@/app/panier/types';

function Wrapper({ customerInfo }: { customerInfo: CustomerInfo }) {
  const cart: Cart = { items: [], subtotal: 0, subtotalCents: 0, total: 0, totalCents: 0 };
  const promo: PromoResult = { applied: false, code: '', discount: 0, message: '', type: '' };
  const loyalty: LoyaltyBenefits = { active: false, message: '', discountAmount: 0, rewardType: 'none', orderCount: 0 };
  const clearCart = jest.fn();
  const { handleSubmit, errors } = useCheckout(cart, promo, loyalty, customerInfo, clearCart);

  return (
    <form onSubmit={handleSubmit} data-testid="form">
      <input name="firstName" defaultValue={customerInfo.firstName} />
      <input name="lastName" defaultValue={customerInfo.lastName} />
      <input name="email" defaultValue={customerInfo.email} />
      <input name="address" defaultValue={customerInfo.address} />
      <input name="city" defaultValue={customerInfo.city} />
      <input name="postalCode" defaultValue={customerInfo.postalCode} />
      <input name="phone" defaultValue={customerInfo.phone} />
      <button type="submit">Submit</button>
      <pre data-testid="errors">{JSON.stringify(errors)}</pre>
    </form>
  );
}

describe('useCheckout', () => {
  it('shows errors when required fields are missing', async () => {
    const customerInfo: CustomerInfo = {
      email: '',
      firstName: '',
      lastName: '',
      phone: '',
      address: '',
      addressLine2: '',
      city: '',
      postalCode: '',
      country: 'France',
    };

    render(<Wrapper customerInfo={customerInfo} />);

    fireEvent.submit(screen.getByTestId('form'));

    await waitFor(() => {
      const errors = JSON.parse(screen.getByTestId('errors').textContent || '{}');
      expect(errors).toHaveProperty('firstName');
      expect(errors).toHaveProperty('lastName');
      expect(errors).toHaveProperty('email');
      expect(errors).toHaveProperty('address');
      expect(errors).toHaveProperty('city');
      expect(errors).toHaveProperty('postalCode');
      expect(errors).toHaveProperty('phone');
    });
  });

  it('validates phone format', async () => {
    const customerInfo: CustomerInfo = {
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '12345',
      address: '1 rue ici',
      addressLine2: '',
      city: 'Paris',
      postalCode: '75000',
      country: 'France',
    };

    render(<Wrapper customerInfo={customerInfo} />);

    fireEvent.submit(screen.getByTestId('form'));

    await waitFor(() => {
      const errors = JSON.parse(screen.getByTestId('errors').textContent || '{}');
      expect(errors.phone).toMatch(/Format invalide/);
    });
  });
});
