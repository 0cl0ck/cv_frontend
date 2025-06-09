export type PaymentMethod = 'card' | 'bank_transfer';

export type AddressType = 'shipping' | 'billing' | 'both';

export interface Address {
  id?: string;
  type: AddressType;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export interface RestrictedCategory {
  id: string;
  name: string;
}

export type PromoType = 'percentage' | 'fixed' | 'free_shipping' | '';
export type CategoryRestrictionType = 'none' | 'exclude' | 'include';

export interface PromoResult {
  applied: boolean;
  code: string;
  discount: number;
  message: string;
  type: PromoType;
  categoryRestrictionType?: CategoryRestrictionType;
  restrictedCategories?: RestrictedCategory[];
}

export type RewardType = 'none' | 'sample' | 'freeShipping' | 'freeProduct' | 'discount';

export interface NextLevel {
  name: string;
  ordersRequired: number;
  remainingOrders: number;
}

export interface LoyaltyBenefits {
  active: boolean;
  message: string;
  discountAmount: number;
  rewardType: RewardType;
  orderCount: number;
  nextLevel?: NextLevel;
}

export interface CustomerInfo {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface FormErrors {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
}

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
  isGift?: boolean;
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


// Alias pour vos erreurs de formulaire
export type Errors = FormErrors;