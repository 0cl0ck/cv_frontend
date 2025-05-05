'use client';

import React, { createContext, useContext, ReactNode, useState } from 'react';
import { useCart } from '@/hooks/useCart';
import { Product, ProductVariation } from '@/types/product';
import { Cart } from '@/types/cart';
import CartNotification from '@/components/ui/CartNotification';

interface CartContextType {
  cart: Cart;
  isLoading: boolean;
  addItem: (product: Product, quantity?: number, variant?: ProductVariation) => void;
  updateQuantity: (index: number, quantity: number) => void;
  removeItem: (index: number) => void;
  clearCart: () => void;
  setShippingMethod: (methodId: string, cost: number, methodName?: string) => void;
  forceUpdateCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const cartUtils = useCart();
  const [showNotification, setShowNotification] = useState(false);
  const [addedProduct, setAddedProduct] = useState<string>('');
  
  // Extension des fonctions du panier pour ajouter des notifications
  const enhancedCartUtils = {
    ...cartUtils,
    addItem: (product: Product, quantity?: number, variant?: ProductVariation) => {
      cartUtils.addItem(product, quantity, variant);
      
      // Déclencher la notification
      setAddedProduct(product.name);
      setShowNotification(true);
    }
  };

  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  return (
    <CartContext.Provider value={enhancedCartUtils}>
      {children}
      <CartNotification 
        productName={addedProduct} 
        show={showNotification} 
        onClose={handleCloseNotification} 
      />
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
