// Types for cart functionality

export interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  priceCents: number;
  quantity: number;
  weight?: number;
  image?: string;
  slug?: string;
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
