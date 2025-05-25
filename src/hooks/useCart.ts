import { useState, useEffect } from 'react';
import { Cart, CartItem, ShippingMethod } from '../types/cart';
import { Product, ProductVariation } from '../types/product';

// Panier initial vide
const initialCart: Cart = {
  items: [],
  subtotal: 0,
  subtotalCents: 0,
  total: 0,
  totalCents: 0
};

// Fonction pour calculer le sous-total en centimes
const calculateSubtotalCents = (items: CartItem[]): number => {
  return items.reduce((acc, item) => acc + ((item.priceCents ?? eurosToCents(item.price)) * item.quantity), 0);
};

// Convertir centimes en euros (pour l'affichage)
const centsToEuros = (cents: number): number => {
  return Math.round(cents) / 100;
};

// Convertir euros en centimes (pour les calculs)
const eurosToCents = (euros: number): number => {
  return Math.round(euros * 100);
};

// Fonction pour calculer le total en centimes (sous-total + frais de livraison)
const calculateTotalCents = (subtotalCents: number, shipping?: ShippingMethod): number => {
  const shippingCostCents = shipping?.costCents || 0;
  
  // Si le sous-total est >= 49€ (4900 centimes), la livraison est gratuite
  if (subtotalCents >= 4900 && shippingCostCents > 0) {
    return subtotalCents;
  }
  
  return subtotalCents + shippingCostCents;
};

export const useCart = () => {
  const [cart, setCart] = useState<Cart>(initialCart);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Charger le panier depuis le localStorage au montage du composant
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem('chanvre_vert_cart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart) as Cart;
          setCart(parsedCart);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du panier:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, []);

  // Sauvegarder le panier dans le localStorage à chaque modification
  useEffect(() => {
    // Ne pas sauvegarder le panier initial lors du chargement initial
    if (isLoading) return;
    
    try {
      localStorage.setItem('chanvre_vert_cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du panier:', error);
    }
  }, [cart, isLoading]);

  // Ajouter un produit au panier - Version simplifiée et robuste qui remplace toujours la quantité
  const addItem = (product: Product, quantity: number = 1, variant?: ProductVariation) => {
    // Créer l'objet item pour le produit à ajouter
    const price = variant?.price || product.price || 0;
    const priceCents = eurosToCents(price);
    
    const newItem: CartItem = {
      productId: product.id,
      name: product.name,
      price: price,
      priceCents: priceCents,
      quantity, // Utiliser directement la quantité spécifiée sans condition
      weight: variant?.weight,
      image: product.mainImage?.url,
      slug: product.slug
    };
    
    if (variant) {
      newItem.variantId = variant.id;
    }
    
    setCart((prevCart: Cart) => {
      // Vérifier si le produit est déjà dans le panier
      const existingItemIndex = prevCart.items.findIndex((item: CartItem) => 
        item.productId === product.id && 
        (!variant || item.variantId === variant.id)
      );

      // Créer un nouveau tableau d'items
      let newItems;
      
      if (existingItemIndex !== -1) {
        // Si le produit existe déjà, créer une copie et remplacer l'item
        newItems = [...prevCart.items];
        newItems[existingItemIndex] = newItem;
      } else {
        // Si c'est un nouveau produit, l'ajouter au tableau
        newItems = [...prevCart.items, newItem];
      }
      
      // Calculer les totaux
      const subtotalCents = calculateSubtotalCents(newItems);
      const subtotal = centsToEuros(subtotalCents);
      const totalCents = calculateTotalCents(subtotalCents, prevCart.shipping);
      const total = centsToEuros(totalCents);
      
      // Retourner le panier mis à jour
      return {
        ...prevCart,
        items: newItems,
        subtotal,
        subtotalCents,
        total,
        totalCents
      };
    });
  };

  // Mettre à jour la quantité d'un produit
  const updateQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return;
    
    setCart((prevCart: Cart) => {
      if (index < 0 || index >= prevCart.items.length) return prevCart;
      
      // Créer une copie du tableau d'items
      const newItems = [...prevCart.items];
      
      // Mettre à jour la quantité
      newItems[index] = {
        ...newItems[index],
        quantity: quantity
      };
      
      // Calculer les totaux
      const subtotalCents = calculateSubtotalCents(newItems);
      const subtotal = centsToEuros(subtotalCents);
      const totalCents = calculateTotalCents(subtotalCents, prevCart.shipping);
      const total = centsToEuros(totalCents);
      
      // Retourner le panier mis à jour
      return {
        ...prevCart,
        items: newItems,
        subtotal,
        subtotalCents,
        total,
        totalCents
      };
    });
  };

  // Supprimer un produit du panier
  const removeItem = (index: number) => {
    setCart((prevCart: Cart) => {
      const newItems = [...prevCart.items];
      newItems.splice(index, 1);

      const subtotalCents = calculateSubtotalCents(newItems);
      const subtotal = centsToEuros(subtotalCents);
      const totalCents = calculateTotalCents(subtotalCents, prevCart.shipping);
      const total = centsToEuros(totalCents);

      return {
        ...prevCart,
        items: newItems,
        subtotal,
        subtotalCents,
        total,
        totalCents
      };
    });
  };

  // Vider le panier
  const clearCart = () => {
    setCart(initialCart);
  };

  // Définir la méthode de livraison
  const setShippingMethod = (methodId: string, cost: number, methodName: string = 'Standard') => {
    setCart((prevCart: Cart) => {
      const costCents = eurosToCents(cost);
      
      const shipping: ShippingMethod = {
        id: methodId,
        name: methodName,
        cost,
        costCents
      };

      const totalCents = calculateTotalCents(prevCart.subtotalCents, shipping);
      const total = centsToEuros(totalCents);

      return {
        ...prevCart,
        shipping,
        total,
        totalCents
      };
    });
  };

  // Forcer une mise à jour du panier (utile après des modifications externes)
  const forceUpdateCart = () => {
    setCart((prevCart: Cart) => {
      const subtotalCents = calculateSubtotalCents(prevCart.items);
      const subtotal = centsToEuros(subtotalCents);
      const totalCents = calculateTotalCents(subtotalCents, prevCart.shipping);
      const total = centsToEuros(totalCents);

      return {
        ...prevCart,
        subtotal,
        subtotalCents,
        total,
        totalCents
      };
    });
  };

  return {
    cart,
    isLoading,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    setShippingMethod,
    forceUpdateCart
  };
};
