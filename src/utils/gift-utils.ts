import { CartItem } from '../types/cart';

// Threshold configuration for automatic gifts (order amount after discounts and loyalty)
export const GIFT_THRESHOLDS = {
  TIER_1: 50,  // 2g offered
  TIER_2: 90,  // 10g + 1 pre-roll
  TIER_3: 160, // 20g + 2 pre-rolls
};

// Unique identifiers for automatic gifts
export const GIFT_IDS = {
  TIER_1_2G: 'gift-tier1-2g',
  TIER_2_10G: 'gift-tier2-10g',
  TIER_2_PREROLL: 'gift-tier2-preroll',
  GOODIES: 'gift-goodies',
  TIER_3_20G: 'gift-tier3-20g',
  TIER_3_PREROLL: 'gift-tier3-preroll',
  TIER_3_SURPRISE: 'gift-tier3-surprise',
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
    return gifts;
  }

  if (subtotalInEuros >= GIFT_THRESHOLDS.TIER_2) {
    gifts.push(createGiftItem(GIFT_IDS.TIER_2_10G, 'Cadeau: 10g de fleurs CBD'));
    gifts.push(createGiftItem(GIFT_IDS.TIER_2_PREROLL, 'Cadeau: Pre-roll CBD'));
    return gifts;
  }

  if (subtotalInEuros >= GIFT_THRESHOLDS.TIER_1) {
    gifts.push(createGiftItem(GIFT_IDS.TIER_1_2G, 'Cadeau: 2g de fleurs CBD'));
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
