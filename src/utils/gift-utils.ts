import { CartItem } from '../types/cart';

// Threshold configuration for automatic gifts (order amount after discounts and loyalty)
export const GIFT_THRESHOLDS = {
  TIER_1: 60,  // 2g offered
  TIER_2: 100,  // 10g offered
  TIER_3: 180, // 20g offered
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

// Check if 4/20 BONUS X2 promo is active
export function is420PromoActive(): boolean {
  const now = new Date().getTime()
  const from = new Date('2026-04-18T00:00:00+02:00').getTime()
  const until = new Date('2026-04-22T23:59:59+02:00').getTime()
  return now >= from && now <= until
}

// Gift names during 4/20 promo
const GIFT_NAMES_420 = {
  TIER_1: 'Cadeau 4/20: 4g de fleurs CBD',
  TIER_2: 'Cadeau 4/20: 20g de fleurs CBD',
  TIER_3: 'Cadeau 4/20: 40g de fleurs CBD',
} as const

// Determine which gifts apply to the current cart subtotal
export const determineGiftsForSubtotal = (subtotalInEuros: number): CartItem[] => {
  const gifts: CartItem[] = [];
  const promo420 = is420PromoActive();

  if (subtotalInEuros >= GIFT_THRESHOLDS.TIER_3) {
    gifts.push(createGiftItem(
      promo420 ? 'gift-tier3-40g' : GIFT_IDS.TIER_3_20G,
      promo420 ? GIFT_NAMES_420.TIER_3 : 'Cadeau: 20g de fleurs CBD'
    ));
    return gifts;
  }

  if (subtotalInEuros >= GIFT_THRESHOLDS.TIER_2) {
    gifts.push(createGiftItem(
      promo420 ? 'gift-tier2-20g' : GIFT_IDS.TIER_2_10G,
      promo420 ? GIFT_NAMES_420.TIER_2 : 'Cadeau: 10g de fleurs CBD'
    ));
    return gifts;
  }

  if (subtotalInEuros >= GIFT_THRESHOLDS.TIER_1) {
    gifts.push(createGiftItem(
      promo420 ? 'gift-tier1-4g' : GIFT_IDS.TIER_1_2G,
      promo420 ? GIFT_NAMES_420.TIER_1 : 'Cadeau: 2g de fleurs CBD'
    ));
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
