import {
  createGiftItem,
  calculateSubtotalWithoutGifts,
  calculateSubtotalCentsWithoutGifts,
} from '../gift-utils';
import type { CartItem } from '@/types/cart';

describe('gift-utils helpers', () => {
  it('createGiftItem produces a zero-priced gift with the given quantity', () => {
    const gift = createGiftItem('gift-halloween-tier1-3g', 'Cadeau test', 2);
    expect(gift).toMatchObject({
      productId: 'gift-halloween-tier1-3g',
      name: 'Cadeau test',
      price: 0,
      priceCents: 0,
      quantity: 2,
      isGift: true,
    });
  });

  const items: CartItem[] = [
    { productId: 'p1', name: 'Produit 1', price: 10, priceCents: 1000, quantity: 2, isGift: false },
    { productId: 'gift', name: 'Cadeau', price: 0, priceCents: 0, quantity: 1, isGift: true },
    { productId: 'p2', name: 'Produit 2', price: 5.5, priceCents: 550, quantity: 1, isGift: false },
  ];

  it('calculateSubtotalWithoutGifts ignore les cadeaux en euros', () => {
    expect(calculateSubtotalWithoutGifts(items)).toBe(25.5);
  });

  it('calculateSubtotalCentsWithoutGifts ignore les cadeaux en centimes', () => {
    expect(calculateSubtotalCentsWithoutGifts(items)).toBe(2550);
  });
});
