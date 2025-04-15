import { useState, useEffect } from 'react';
import { Cart, CartItem } from '../types/cart';
import { Product, ProductVariation } from '../types/product';

// Clé utilisée pour stocker le panier dans localStorage
const CART_STORAGE_KEY = 'chanvre_vert_cart';

// État initial du panier
const initialCart: Cart = {
  items: [],
  subtotal: 0,
  total: 0
};

export function useCart() {
  const [cart, setCart] = useState<Cart>(initialCart);
  const [isLoading, setIsLoading] = useState(true);

  // Récupérer le panier depuis localStorage au chargement
  useEffect(() => {
    const storedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        setCart(parsedCart);
      } catch (error) {
        console.error('Erreur lors du chargement du panier:', error);
      }
    }
    setIsLoading(false);
  }, []);

  // Sauvegarder le panier dans localStorage à chaque changement
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart, isLoading]);

  // Recalculer les totaux
  const recalculateCart = (items: CartItem[]): Cart => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCost = cart.shipping?.cost || 0;
    
    return {
      items,
      subtotal,
      shipping: cart.shipping,
      total: subtotal + shippingCost
    };
  };

  // Ajouter un produit au panier
  const addItem = (product: Product, quantity: number = 1, variant?: ProductVariation) => {
    const variantId = variant?.id;
    const existingItemIndex = cart.items.findIndex(item => 
      item.productId === product.id && 
      (variantId ? item.variantId === variantId : !item.variantId)
    );

    let newItems = [...cart.items];
    
    // Si le produit est variable, récupérer les infos de la variante
    let price = product.price || 0;
    let weight = undefined;
    let variantName = '';
    
    if (variant && product.productType === 'variable') {
      price = variant.price || price;
      weight = variant.weight;
      variantName = weight ? ` - ${weight}g` : '';
    }

    // Si l'article existe déjà, incrémenter la quantité
    if (existingItemIndex !== -1) {
      newItems[existingItemIndex].quantity += quantity;
    } else {
      // Sinon, ajouter un nouvel article
      const imageUrl = typeof product.mainImage === 'string' 
        ? product.mainImage 
        : product.mainImage?.url || '';

      newItems.push({
        productId: product.id,
        variantId: variantId,
        name: product.name + (variantName || ''),
        price,
        weight,
        quantity,
        image: imageUrl,
        slug: product.slug
      });
    }

    setCart(recalculateCart(newItems));
  };

  // Mettre à jour la quantité d'un article
  const updateQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return;
    
    const newItems = [...cart.items];
    newItems[index].quantity = quantity;
    setCart(recalculateCart(newItems));
  };

  // Supprimer un article
  const removeItem = (index: number) => {
    const newItems = cart.items.filter((_, i) => i !== index);
    setCart(recalculateCart(newItems));
  };

  // Vider le panier
  const clearCart = () => {
    setCart(initialCart);
  };

  // Définir la méthode de livraison
  const setShippingMethod = (methodId: string, cost: number) => {
    setCart({
      ...cart,
      shipping: {
        methodId,
        cost
      },
      total: cart.subtotal + cost
    });
  };

  return {
    cart,
    isLoading,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    setShippingMethod
  };
}
