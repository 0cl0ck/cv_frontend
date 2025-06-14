// Types for cart functionality

export interface CartItem {
  productId: string;
  variantId?: string;
  variantName?: string; // Nom de la variante pour affichage dans le récapitulatif
  name: string;
  price: number;
  priceCents: number;
  quantity: number;
  weight?: number;
  image?: string;
  slug?: string;
  isGift?: boolean; // Indique si l'article est un cadeau automatique
  sku?: string; // Référence SKU pour les variantes
}

export interface ShippingMethod {
  id: string;
  name: string;
  cost: number;
  costCents: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  subtotalCents: number;
  shipping?: ShippingMethod;
  total: number;
  totalCents: number;
}
