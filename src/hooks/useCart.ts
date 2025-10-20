import { useState, useEffect } from "react";
import { Cart, CartItem, ShippingMethod } from "../types/cart";
import { Product, ProductVariation } from "../types/product";
import {
  determineGiftsForSubtotal,
  calculateSubtotalWithoutGifts,
  calculateSubtotalCentsWithoutGifts,
} from "../utils/gift-utils";

// Panier initial vide
const initialCart: Cart = {
  items: [],
  subtotal: 0,
  subtotalCents: 0,
  total: 0,
  totalCents: 0,
};

// Note: cette fonction est maintenant déplacée vers gift-utils.ts et utilisée via l'import 'calculateSubtotalCentsWithoutGifts'.

// Convertir centimes en euros (pour l'affichage)
const centsToEuros = (cents: number): number => {
  return Math.round(cents) / 100;
};

// Convertir euros en centimes (pour les calculs)
const eurosToCents = (euros: number): number => {
  return Math.round(euros * 100);
};

// Fonction pour calculer le total en centimes (sous-total + frais de livraison)
const calculateTotalCents = (
  subtotalCents: number,
  shipping?: ShippingMethod
): number => {
  const shippingCostCents = shipping?.costCents || 0;
  // Le cout de livraison est deja calcule en amont selon la politique en vigueur
  return subtotalCents + shippingCostCents;
};

export const useCart = () => {
  const [cart, setCart] = useState<Cart>(initialCart);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fonction pour mettre à jour les articles cadeaux en fonction du sous-total
  const updateGiftItems = (currentCart: Cart): Cart => {
    // Calculer le sous-total sans compter les articles cadeaux
    const regularItems = currentCart.items.filter((item) => !item.isGift);

    // S'il n'y a pas d'articles normaux, pas besoin d'ajouter des cadeaux
    if (regularItems.length === 0) {
      return {
        ...currentCart,
        items: [],
        subtotal: 0,
        subtotalCents: 0,
        total: 0,
        totalCents: 0,
      };
    }

    // Calculer le sous-total des articles non-cadeaux
    const subtotal = calculateSubtotalWithoutGifts(regularItems);
    const subtotalCents = calculateSubtotalCentsWithoutGifts(regularItems);

    // Déterminer quels cadeaux devraient être dans le panier
    const giftItems = determineGiftsForSubtotal(subtotal);

    // Combiner les articles réguliers et les cadeaux
    const newItems = [...regularItems, ...giftItems];

    // Calculer le total avec les frais de livraison
    const totalCents = calculateTotalCents(subtotalCents, currentCart.shipping);
    const total = centsToEuros(totalCents);

    return {
      ...currentCart,
      items: newItems,
      subtotal,
      subtotalCents,
      total,
      totalCents,
    };
  };

  // Charger le panier depuis le localStorage au montage du composant
  useEffect(() => {
    // Fonction de restauration définie dans le useEffect pour éviter les problèmes de dépendances
    const restoreCart = () => {
      try {
        const savedCart = localStorage.getItem("chanvre_vert_cart");
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);

          // Filtrer les articles réguliers uniquement (non-cadeaux)
          const regularItems = parsedCart.items.filter(
            (item: CartItem) => !item.isGift
          );

          const parseLocaleDecimal = (value: unknown): number => {
            if (typeof value === "number") return Number.isFinite(value) ? value : 0;
            const raw = String(value ?? "").trim();
            if (raw.length === 0) return 0;
            const cleaned = raw.replace(/[^0-9,.-]/g, "");
            const hasComma = cleaned.includes(",");
            const hasDot = cleaned.includes(".");
            let normalized = cleaned;
            if (hasComma && hasDot) {
              const lastComma = cleaned.lastIndexOf(",");
              const lastDot = cleaned.lastIndexOf(".");
              const decimalSep = lastComma > lastDot ? "," : ".";
              normalized = decimalSep === "," ? cleaned.replace(/\./g, "") : cleaned.replace(/,/g, "");
              normalized = normalized.replace(",", ".");
            } else if (hasComma && !hasDot) {
              normalized = cleaned.replace(",", ".");
            }
            const n = Number(normalized);
            return Number.isFinite(n) ? n : 0;
          };

          const normalizedItems: CartItem[] = regularItems.map((it: CartItem) => {
            const price = parseLocaleDecimal((it as unknown as { price?: unknown }).price);
            const quantity = Number.isFinite(it.quantity) ? Math.max(1, Math.floor(it.quantity)) : 1;
            return {
              ...it,
              categoryId: it.categoryId, // Préserver categoryId depuis localStorage
              price,
              priceCents: Math.round(price * 100),
              quantity,
            } as CartItem;
          });

          // Restaurer un panier avec uniquement les articles réguliers
          const tempCart = {
            ...parsedCart,
            items: normalizedItems,
          };

          // Mettre à jour les cadeaux automatiquement en fonction du sous-total actuel
          setCart(updateGiftItems(tempCart));
        } else {
          setCart(initialCart);
        }
      } catch (error) {
        console.error("Erreur lors de la restauration du panier:", error);
        setCart(initialCart);
      } finally {
        setIsLoading(false);
      }
    };

    restoreCart();
  }, []);

  // Persister le panier dans le localStorage à chaque modification
  // Vérifier et mettre à jour les cadeaux avant la persistance
  useEffect(() => {
    // Ne pas sauvegarder le panier initial lors du chargement initial
    if (isLoading) return;

    try {
      // Recalculer les cadeaux à chaque sauvegarde pour éviter les incohérences
      const updatedCart = updateGiftItems(cart);
      localStorage.setItem("chanvre_vert_cart", JSON.stringify(updatedCart));

      // Si la mise à jour des cadeaux a changé le panier, mettre à jour l'état
      if (JSON.stringify(updatedCart) !== JSON.stringify(cart)) {
        setCart(updatedCart);
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du panier:", error);
    }
  }, [cart, isLoading]);

  // Ajouter un produit au panier - Version qui gère les cadeaux automatiquement
  const addItem = (
    product: Product,
    quantity: number = 1,
    variant?: ProductVariation
  ) => {
    // Pour les produits speciaux (comme les cadeaux) qui pourraient etre ajoutes manuellement
    // On verifie une propriete personnalisee qui n'est pas dans le type standard Product
    // @ts-expect-error - La propriete isGift pourrait exister sur des objets Product etendus
    if (product.isGift === true) {
      console.warn("Tentative d'ajout manuel d'un article cadeau ignoree");
      return;
    }

    const parseLocaleDecimal = (value: unknown): number => {
      if (typeof value === "number") return Number.isFinite(value) ? value : 0;
      const raw = String(value ?? "").trim();
      if (raw.length === 0) return 0;
      const cleaned = raw.replace(/[^0-9,.-]/g, "");
      const hasComma = cleaned.includes(",");
      const hasDot = cleaned.includes(".");
      let normalized = cleaned;
      if (hasComma && hasDot) {
        const lastComma = cleaned.lastIndexOf(",");
        const lastDot = cleaned.lastIndexOf(".");
        const decimalSep = lastComma > lastDot ? "," : ".";
        normalized = decimalSep === "," ? cleaned.replace(/\./g, "") : cleaned.replace(/,/g, "");
        normalized = normalized.replace(",", ".");
      } else if (hasComma && !hasDot) {
        normalized = cleaned.replace(",", ".");
      }
      const n = Number(normalized);
      return Number.isFinite(n) ? n : 0;
    };
    const price = parseLocaleDecimal(variant?.price ?? product.price ?? 0);
    const priceCents = eurosToCents(price);
    const desiredQuantity = 
      Number.isFinite(quantity) ? Math.max(1, Math.floor(quantity)) : 1;

    const baseItem: CartItem = {
      productId: product.id,
      categoryId: typeof product.category === 'string' 
        ? product.category 
        : (product.category as { id?: string })?.id,
      name: product.name,
      price: price,
      priceCents: priceCents,
      quantity: desiredQuantity,
      weight: variant?.weight,
      image: product.mainImage?.url,
      slug: product.slug,
    };

    if (variant) {
      baseItem.variantId = variant.id;
      // Ajouter le nom de la variante si disponible, sinon utiliser le poids comme identifiant
      baseItem.variantName = variant.weight ? `${variant.weight}g` : "";
      // Ajouter aussi le SKU s'il est disponible
      if (variant.sku) {
        baseItem.sku = variant.sku;
      }
    }

    setCart((prevCart: Cart) => {
      // Filtrer les articles cadeaux du panier actuel
      const regularItems = prevCart.items.filter((item) => !item.isGift);

      // Verifier si le produit est deja dans le panier (parmi les articles reguliers)
      const existingItemIndex = regularItems.findIndex(
        (item: CartItem) =>
          item.productId === product.id &&
          (!variant || item.variantId === variant?.id)
      );

      const existingItem =
        existingItemIndex !== -1 ? regularItems[existingItemIndex] : undefined;

      const mergedQuantity = existingItem
        ? Math.max(1, (existingItem.quantity || 0) + desiredQuantity)
        : desiredQuantity;

      const updatedItem = existingItem
        ? { ...existingItem, ...baseItem, quantity: mergedQuantity }
        : { ...baseItem, quantity: mergedQuantity };

      let updatedRegularItems;

      if (existingItemIndex !== -1) {
        // Si le produit existe deja, cumuler les quantites
        updatedRegularItems = [...regularItems];
        updatedRegularItems[existingItemIndex] = updatedItem;
      } else {
        // Nouveau produit, l'ajouter a la liste
        updatedRegularItems = [...regularItems, updatedItem];
      }

      const tempCart = {
        ...prevCart,
        items: updatedRegularItems,
      };

      return updateGiftItems(tempCart);
    });
  };

  // Mettre à jour la quantité d'un produit (ignore les articles cadeaux)
  const updateQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return;

    setCart((prevCart: Cart) => {
      if (index < 0 || index >= prevCart.items.length) return prevCart;

      // Vérifier si l'article est un cadeau (ne pas permettre la mise à jour manuelle)
      if (prevCart.items[index].isGift) {
        console.warn("Tentative de mise à jour d'un article cadeau ignorée");
        return prevCart;
      }

      // Créer une copie du tableau d'items (sans les cadeaux)
      const regularItems = prevCart.items.filter((item) => !item.isGift);

      // Trouver l'index réel dans le tableau d'articles réguliers
      const regularIndex = regularItems.findIndex(
        (item) =>
          item.productId === prevCart.items[index].productId &&
          item.variantId === prevCart.items[index].variantId
      );

      if (regularIndex === -1) return prevCart;

      // Mettre à jour la quantité de l'article régulier
      const updatedRegularItems = [...regularItems];
      updatedRegularItems[regularIndex] = {
        ...updatedRegularItems[regularIndex],
        quantity: quantity,
      };

      // Créer un panier temporaire avec uniquement les articles réguliers mis à jour
      const tempCart = {
        ...prevCart,
        items: updatedRegularItems,
      };

      // Mettre à jour ce panier temporaire avec les cadeaux appropriés
      return updateGiftItems(tempCart);
    });
  };

  // Supprimer un produit du panier (ignore les articles cadeaux)
  const removeItem = (index: number) => {
    setCart((prevCart: Cart) => {
      // Vérifier si l'index est valide
      if (index < 0 || index >= prevCart.items.length) return prevCart;

      // Ne pas permettre la suppression manuelle des cadeaux
      if (prevCart.items[index].isGift) {
        console.warn("Tentative de suppression d'un article cadeau ignorée");
        return prevCart;
      }

      // Filtrer tous les articles réguliers
      const regularItems = prevCart.items.filter((item) => !item.isGift);

      // Trouver l'index de l'article régulier à supprimer
      const itemToRemove = prevCart.items[index];
      const regularIndex = regularItems.findIndex(
        (item) =>
          item.productId === itemToRemove.productId &&
          item.variantId === itemToRemove.variantId
      );

      if (regularIndex === -1) return prevCart;

      // Supprimer l'article régulier
      const updatedRegularItems = [...regularItems];
      updatedRegularItems.splice(regularIndex, 1);

      // Si le panier est maintenant vide, retourner un panier vide
      if (updatedRegularItems.length === 0) {
        return initialCart;
      }

      // Créer un panier temporaire avec les articles réguliers restants
      const tempCart = {
        ...prevCart,
        items: updatedRegularItems,
      };

      // Mettre à jour les cadeaux en fonction du nouveau sous-total
      return updateGiftItems(tempCart);
    });
  };

  // Vider le panier
  const clearCart = () => {
    setCart(initialCart);
  };

  // Définir la méthode de livraison
  const setShippingMethod = (
    methodId: string,
    cost: number,
    methodName: string = "Standard"
  ) => {
    setCart((prevCart: Cart) => {
      const costCents = eurosToCents(cost);

      const shipping: ShippingMethod = {
        id: methodId,
        name: methodName,
        cost,
        costCents,
      };

      // Créer un nouveau panier avec la nouvelle méthode de livraison
      const tempCart = {
        ...prevCart,
        shipping,
      };

      // Mettre à jour les cadeaux et recalculer le total avec les frais de livraison
      return updateGiftItems(tempCart);
    });
  };

  // Forcer une mise à jour du panier (utile après des modifications externes)
  const forceUpdateCart = () => {
    setCart((prevCart: Cart) => {
      // Mettre à jour tous les totaux et les articles cadeaux
      return updateGiftItems(prevCart);
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
    forceUpdateCart,
  };
};
