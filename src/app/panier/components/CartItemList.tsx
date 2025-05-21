import React from 'react';
import { useCartContext } from '@/context/CartContext';
import CartItem from './CartItem';

export interface CartItemListProps {
  // On pourrait accept un override de items, mais ici on les prend du contexte
}

export default function CartItemList() {
  const { cart, updateQuantity, removeItem } = useCartContext();

  return (
    <div className="space-y-6 mb-8">
      {cart.items.map((item, idx) => (
        <CartItem
          key={`${item.productId}-${item.variantId}-${idx}`}
          item={item}
          index={idx}
          onQuantityChange={updateQuantity}
          onRemove={removeItem}
        />
      ))}
    </div>
  );
}
