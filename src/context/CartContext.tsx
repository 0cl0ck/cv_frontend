'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useCart } from '@/hooks/useCart';
import { Product, ProductVariation } from '@/types/product';
import { Cart } from '@/types/cart';

interface CartContextType {
  cart: Cart;
  isLoading: boolean;
  addItem: (product: Product, quantity?: number, variant?: ProductVariation) => void;
  updateQuantity: (index: number, quantity: number) => void;
  removeItem: (index: number) => void;
  clearCart: () => void;
  setShippingMethod: (methodId: string, cost: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const cartUtils = useCart();

  return (
    <CartContext.Provider value={cartUtils}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext doit être utilisé à l\'intérieur d\'un CartProvider');
  }
  return context;
}

export { CartContext };
