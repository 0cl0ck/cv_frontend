import React from 'react';
import { useCartContext } from '@/context/CartContext';
import CartItem from './CartItem';

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

