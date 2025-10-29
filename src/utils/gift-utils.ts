import { CartItem } from '../types/cart';

// Threshold configuration for automatic gifts (order amount after discounts and loyalty)
export const GIFT_THRESHOLDS = {
  TIER_1: 50,  // 3g offered
  TIER_2: 80,  // 10g + goodies + 1 pre-roll
  TIER_3: 160, // 20g + goodies + 2 pre-rolls + surprise product
};

// Unique identifiers for automatic gifts
export const GIFT_IDS = {
  TIER_1_3G: 'gift-halloween-tier1-3g',
  TIER_2_10G: 'gift-halloween-tier2-10g',
  TIER_2_PREROLL: 'gift-halloween-tier2-preroll',
  GOODIES: 'gift-halloween-goodies',
  TIER_3_20G: 'gift-halloween-tier3-20g',
  TIER_3_PREROLL: 'gift-halloween-tier3-preroll',
  TIER_3_SURPRISE: 'gift-halloween-tier3-surprise',
} as const;

// Factory helper for gift line items
export const createGiftItem = (
  giftId: string,
  name: string,
  quantity: number = 1,
  imageUrl: string = '/images/gift-icon.png',
): CartItem => {
  return {
    productId: giftId,
    name,
    price: 0,
    priceCents: 0,
    quantity,
    image: imageUrl,
    isGift: true,
  };
};

// Determine which gifts apply to the current cart subtotal
export const determineGiftsForSubtotal = (subtotalInEuros: number): CartItem[] => {
  const gifts: CartItem[] = [];

  if (subtotalInEuros >= GIFT_THRESHOLDS.TIER_3) {
    gifts.push(createGiftItem(GIFT_IDS.TIER_3_20G, 'Cadeau: 20g de fleurs CBD'));
    gifts.push(createGiftItem(GIFT_IDS.TIER_3_PREROLL, 'Cadeau: Pre-roll CBD', 2));
    gifts.push(createGiftItem(GIFT_IDS.TIER_3_SURPRISE, 'Cadeau: Produit surprise'));
    gifts.push(createGiftItem(GIFT_IDS.GOODIES, 'Cadeau: Goodies exclusifs'));
    return gifts;
  }

  if (subtotalInEuros >= GIFT_THRESHOLDS.TIER_2) {
    gifts.push(createGiftItem(GIFT_IDS.TIER_2_10G, 'Cadeau: 10g de fleurs CBD'));
    gifts.push(createGiftItem(GIFT_IDS.TIER_2_PREROLL, 'Cadeau: Pre-roll CBD'));
    gifts.push(createGiftItem(GIFT_IDS.GOODIES, 'Cadeau: Goodies exclusifs'));
    return gifts;
  }

  if (subtotalInEuros >= GIFT_THRESHOLDS.TIER_1) {
    gifts.push(createGiftItem(GIFT_IDS.TIER_1_3G, 'Cadeau: 3g de fleurs CBD'));
  }

  return gifts;
};

// Compute subtotal excluding automatic gifts (euros)
export const calculateSubtotalWithoutGifts = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    if (item.isGift) return total;
    return total + item.price * item.quantity;
  }, 0);
};

// Compute subtotal excluding automatic gifts (cents)
export const calculateSubtotalCentsWithoutGifts = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    if (item.isGift) return total;
    return total + ((item.priceCents ?? Math.round(item.price * 100)) * item.quantity);
  }, 0);
};
