import { CartItem } from '../types/cart';

// Configuration des seuils pour les cadeaux automatiques
export const GIFT_THRESHOLDS = {
  // Seuils pour le premier cadeau (cadeau de base)
  BASE_GIFT: 0,  // Cadeau de base (2g) dès qu'un produit est dans le panier
  TIER_0: 50,   // Amélioration du cadeau de base : 5g si panier >= 50€
  
  // Seuils pour le deuxième cadeau (cadeau additionnel)
  TIER_2: 80,   // Palier 2: 80€ => +10g de fleurs CBD
  TIER_3: 160   // Palier 3: 160€ => +20g de fleurs CBD
};

// Identifiants uniques pour les cadeaux
export const GIFT_IDS = {
  // Cadeaux de base
  BASE_GIFT_2G: 'gift-base-2g',
  BASE_GIFT_5G: 'gift-base-5g',
  
  // Cadeaux additionnels
  TIER_2_GIFT: 'gift-tier2-10g',
  TIER_3_GIFT: 'gift-tier3-20g'
};

// Fonction pour créer un article cadeau
export const createGiftItem = (
  giftId: string, 
  name: string,
  quantity: number = 1,
  imageUrl: string = '/images/gift-icon.png' // Image par défaut pour les cadeaux
): CartItem => {
  return {
    productId: giftId,
    name,
    price: 0, // Les cadeaux ont un prix de 0
    priceCents: 0,
    quantity,
    image: imageUrl,
    isGift: true // Marquer comme cadeau
  };
};

// Fonction pour déterminer les cadeaux qui devraient être dans le panier en fonction du sous-total
export const determineGiftsForSubtotal = (subtotalInEuros: number): CartItem[] => {
  const gifts: CartItem[] = [];
  
  // PARTIE 1 : Cadeau de base (toujours présent si panier non vide)
  if (subtotalInEuros > 0) {
    // Version améliorée du cadeau de base (5g) si panier >= 50€
    if (subtotalInEuros >= GIFT_THRESHOLDS.TIER_0) {
      gifts.push(createGiftItem(GIFT_IDS.BASE_GIFT_5G, 'Cadeau: 5g de fleurs CBD'));
    } else {
      // Version standard du cadeau de base (2g) pour tout panier non vide
      gifts.push(createGiftItem(GIFT_IDS.BASE_GIFT_2G, 'Cadeau: 2g de fleurs CBD'));
    }
  }
  
  // PARTIE 2 : Cadeau additionnel aux paliers élevés (non cumulatifs entre eux)
  if (subtotalInEuros >= GIFT_THRESHOLDS.TIER_3) {
    // Palier 3: +20g de fleurs CBD si panier >= 160€
    gifts.push(createGiftItem(GIFT_IDS.TIER_3_GIFT, 'Cadeau: 20g de fleurs CBD'));
  } else if (subtotalInEuros >= GIFT_THRESHOLDS.TIER_2) {
    // Palier 2: +10g de fleurs CBD si panier >= 80€
    gifts.push(createGiftItem(GIFT_IDS.TIER_2_GIFT, 'Cadeau: 10g de fleurs CBD'));
  }
  
  return gifts;
};

// Fonction pour calculer le sous-total sans les articles cadeaux
export const calculateSubtotalWithoutGifts = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    // Ignorer les articles marqués comme cadeaux dans le calcul
    if (item.isGift) return total;
    return total + (item.price * item.quantity);
  }, 0);
};

// Fonction pour calculer le sous-total en centimes sans les articles cadeaux
export const calculateSubtotalCentsWithoutGifts = (items: CartItem[]): number => {
  return items.reduce((total, item) => {
    // Ignorer les articles marqués comme cadeaux dans le calcul
    if (item.isGift) return total;
    return total + ((item.priceCents ?? Math.round(item.price * 100)) * item.quantity);
  }, 0);
};
