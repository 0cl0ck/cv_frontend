// Types pour le panier

export interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  price: number; // Prix unitaire en euros (pour l'affichage)
  priceCents: number; // Prix unitaire en centimes (pour les calculs)
  quantity: number;
  weight?: number;
  image?: string;
  slug?: string;
}

export interface ShippingMethod {
  id: string;
  name: string;
  cost: number; // Coût en euros (pour l'affichage)
  costCents: number; // Coût en centimes (pour les calculs)
}

export interface Cart {
  items: CartItem[];
  subtotal: number; // Sous-total en euros (pour l'affichage)
  subtotalCents: number; // Sous-total en centimes (pour les calculs)
  shipping?: ShippingMethod;
  total: number; // Total en euros (pour l'affichage)
  totalCents: number; // Total en centimes (pour les calculs)
}
