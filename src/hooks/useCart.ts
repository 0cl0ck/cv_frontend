import { useState, useEffect, useRef } from "react";
import { Cart, CartItem, ShippingMethod } from "../types/cart";
import { Product, ProductVariation } from "../types/product";
import {
  createGiftItem,
  calculateSubtotalWithoutGifts,
  calculateSubtotalCentsWithoutGifts,
} from "../utils/gift-utils";
import { calculateCartTotals } from "@/lib/pricingClient";
import type { PricingTotals } from "@/lib/pricingClient";
import { secureLogger as logger } from "@/utils/logger";

const STORAGE_KEY = "chanvre_vert_cart";
const PROMO_STORAGE_KEY = "chanvre_vert_promo";
const COUNTRY_STORAGE_KEY = "chanvre_vert_country";

const initialCart: Cart = {
  items: [],
  subtotal: 0,
  subtotalCents: 0,
  total: 0,
  totalCents: 0,
};

const centsToEuros = (cents: number): number => Math.round(cents) / 100;
const eurosToCents = (euros: number): number => Math.round(euros * 100);

const calculateTotalCents = (subtotalCents: number, shipping?: ShippingMethod): number => {
  const shippingCostCents = shipping?.costCents || 0;
  return subtotalCents + shippingCostCents;
};

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

const buildCartFromItems = (
  regularItems: CartItem[],
  giftItems: CartItem[],
  shipping?: ShippingMethod,
): Cart => {
  const subtotal = calculateSubtotalWithoutGifts(regularItems);
  const subtotalCents = calculateSubtotalCentsWithoutGifts(regularItems);
  const totalCents = calculateTotalCents(subtotalCents, shipping);

  return {
    items: [...regularItems, ...giftItems],
    subtotal,
    subtotalCents,
    shipping,
    total: centsToEuros(totalCents),
    totalCents,
  };
};

const buildPricingCart = (regularItems: CartItem[], shipping?: ShippingMethod): Cart => ({
  items: [...regularItems],
  subtotal: calculateSubtotalWithoutGifts(regularItems),
  subtotalCents: calculateSubtotalCentsWithoutGifts(regularItems),
  shipping,
  total: 0,
  totalCents: 0,
});

const mapAutomaticGifts = (
  backendGifts: Array<{ id: string; name: string; quantity: number }>,
): CartItem[] => {
  if (!Array.isArray(backendGifts)) return [];
  return backendGifts.map((gift) =>
    createGiftItem(
      gift.id,
      gift.name,
      Math.max(1, Number.isFinite(gift.quantity) ? gift.quantity : 1),
    ),
  );
};

const persistValue = (key: string, value: string | null) => {
  if (typeof window === "undefined") return;
  if (value && value.length > 0) {
    localStorage.setItem(key, value);
  } else {
    localStorage.removeItem(key);
  }
};

const persistCart = (cart: Cart) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    logger.warn("[useCart] Échec de la persistance du panier", { error: String(error) });
  }
};

export const useCart = () => {
  const [cart, setCart] = useState<Cart>(initialCart);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pricingTotals, setPricingTotals] = useState<PricingTotals | null>(null);
  const [appliedPromoCode, setAppliedPromoCodeState] = useState<string | null>(null);
  const [pricingCountry, setPricingCountryState] = useState<string>("FR");
  const [automaticGiftItems, setAutomaticGiftItems] = useState<CartItem[]>([]);

  const regularItemsRef = useRef<CartItem[]>([]);
  const shippingRef = useRef<ShippingMethod | undefined>(undefined);
  const refreshRequestRef = useRef(0);

  const refreshAutomaticGifts = async (
    regularItems: CartItem[],
    shipping?: ShippingMethod,
    persist: boolean = true,
  ) => {
    const requestId = ++refreshRequestRef.current;

    if (regularItems.length === 0) {
      setAutomaticGiftItems([]);
      setPricingTotals(null);
      const emptyCart = buildCartFromItems([], [], shipping);
      setCart(emptyCart);
      if (persist) persistCart(emptyCart);
      return;
    }

    try {
      const pricingCart = buildPricingCart(regularItems, shipping);
      const totals = await calculateCartTotals({
        cart: pricingCart,
        country: pricingCountry,
        promoCode: appliedPromoCode ?? undefined,
      });

      if (refreshRequestRef.current !== requestId) return;

      const gifts = mapAutomaticGifts(totals.automaticGifts);
      setAutomaticGiftItems(gifts);
      setPricingTotals(totals);
      const updatedCart = buildCartFromItems(regularItems, gifts, shipping);
      setCart(updatedCart);
      if (persist) persistCart(updatedCart);
    } catch (error) {
      logger.warn("[useCart] Impossible de récupérer les cadeaux automatiques", { error: String(error) });
      if (refreshRequestRef.current !== requestId) return;
      setAutomaticGiftItems([]);
      setPricingTotals(null);
      const updatedCart = buildCartFromItems(regularItems, [], shipping);
      setCart(updatedCart);
      if (persist) persistCart(updatedCart);
    }
  };

  useEffect(() => {
    const restoreCart = async () => {
      try {
        if (typeof window !== "undefined") {
          const storedPromo = localStorage.getItem(PROMO_STORAGE_KEY);
          if (storedPromo) setAppliedPromoCodeState(storedPromo.trim());

          const storedCountry = localStorage.getItem(COUNTRY_STORAGE_KEY);
          if (storedCountry) setPricingCountryState(storedCountry.trim());

          const savedCart = localStorage.getItem(STORAGE_KEY);
          if (savedCart) {
            const parsedCart: Cart = JSON.parse(savedCart);
            const regularItems = Array.isArray(parsedCart.items)
              ? parsedCart.items.filter((item) => !item.isGift)
              : [];

            regularItemsRef.current = regularItems;
            shippingRef.current = parsedCart.shipping;

            const draftCart = buildCartFromItems(regularItems, [], parsedCart.shipping);
            setCart(draftCart);
            await refreshAutomaticGifts(regularItems, parsedCart.shipping);
            return;
          }
        }
      } catch (error) {
        logger.warn("[useCart] Erreur lors de la restauration du panier", { error: String(error) });
      } finally {
        setIsLoading(false);
      }

      regularItemsRef.current = [];
      shippingRef.current = undefined;
      setCart(initialCart);
      setPricingTotals(null);
      setIsLoading(false);
    };

    restoreCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateCartOptimistically = (regularItems: CartItem[]) => {
    regularItemsRef.current = regularItems;
    const optimisticCart = buildCartFromItems(regularItems, automaticGiftItems, shippingRef.current);
    setCart(optimisticCart);
    persistCart(optimisticCart);
  };

  const addItem = (
    product: Product,
    quantity: number = 1,
    variant?: ProductVariation,
  ) => {
    // @ts-expect-error - certains produits étendus peuvent porter ce flag
    if (product.isGift === true) {
      logger.debug("[useCart] Tentative d'ajout manuel d'un article cadeau ignorée");
      return;
    }

    const price = parseLocaleDecimal(variant?.price ?? product.price ?? 0);
    const priceCents = eurosToCents(price);
    const desiredQuantity = Number.isFinite(quantity) ? Math.max(1, Math.floor(quantity)) : 1;

    const baseItem: CartItem = {
      productId: product.id,
      categoryId:
        typeof product.category === "string"
          ? product.category
          : (product.category as { id?: string })?.id,
      name: product.name,
      price,
      priceCents,
      quantity: desiredQuantity,
      weight: variant?.weight,
      image: product.mainImage?.url,
      slug: product.slug,
    };

    if (variant) {
      baseItem.variantId = variant.id;
      baseItem.variantName = variant.weight ? `${variant.weight}g` : "";
      if (variant.sku) baseItem.sku = variant.sku;
    }

    const regularItems = [...regularItemsRef.current];
    const existingIndex = regularItems.findIndex(
      (item) =>
        item.productId === product.id &&
        (variant ? item.variantId === variant.id : !item.variantId),
    );

    const mergedQuantity =
      existingIndex !== -1
        ? Math.max(1, (regularItems[existingIndex].quantity || 0) + desiredQuantity)
        : desiredQuantity;

    if (existingIndex !== -1) {
      regularItems[existingIndex] = {
        ...regularItems[existingIndex],
        ...baseItem,
        quantity: mergedQuantity,
      };
    } else {
      regularItems.push({ ...baseItem, quantity: mergedQuantity });
    }

    updateCartOptimistically(regularItems);
    refreshAutomaticGifts(regularItems, shippingRef.current);
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return;

    const target = cart.items[index];
    if (!target || target.isGift) return;

    const regularItems = [...regularItemsRef.current];
    const regularIndex = regularItems.findIndex(
      (item) => item.productId === target.productId && item.variantId === target.variantId,
    );
    if (regularIndex === -1) return;

    regularItems[regularIndex] = {
      ...regularItems[regularIndex],
      quantity,
    };

    updateCartOptimistically(regularItems);
    refreshAutomaticGifts(regularItems, shippingRef.current);
  };

  const removeItem = (index: number) => {
    const target = cart.items[index];
    if (!target || target.isGift) return;

    const regularItems = [...regularItemsRef.current];
    const regularIndex = regularItems.findIndex(
      (item) => item.productId === target.productId && item.variantId === target.variantId,
    );
    if (regularIndex === -1) return;

    regularItems.splice(regularIndex, 1);

    if (regularItems.length === 0) {
      regularItemsRef.current = [];
      setAutomaticGiftItems([]);
      shippingRef.current = undefined;
      setCart(initialCart);
      persistCart(initialCart);
      refreshAutomaticGifts([], undefined);
      return;
    }

    updateCartOptimistically(regularItems);
    refreshAutomaticGifts(regularItems, shippingRef.current);
  };

  const clearCart = () => {
    regularItemsRef.current = [];
    setAutomaticGiftItems([]);
    shippingRef.current = undefined;
    setCart(initialCart);
    setPricingTotals(null);
    persistCart(initialCart);
    if (typeof window !== "undefined") {
      localStorage.removeItem(PROMO_STORAGE_KEY);
    }
  };

  const setShippingMethod = (
    methodId: string,
    cost: number,
    methodName: string = "Standard",
  ) => {
    const costCents = eurosToCents(cost);
    const shipping: ShippingMethod = {
      id: methodId,
      name: methodName,
      cost,
      costCents,
    };

    shippingRef.current = shipping;
    updateCartOptimistically(regularItemsRef.current);
    refreshAutomaticGifts(regularItemsRef.current, shipping);
  };

  const forceUpdateCart = () => {
    refreshAutomaticGifts(regularItemsRef.current, shippingRef.current);
  };

  const setAppliedPromoCode = (code: string | null) => {
    const trimmed = code && code.trim() ? code.trim() : null;
    setAppliedPromoCodeState(trimmed);
    persistValue(PROMO_STORAGE_KEY, trimmed);
    refreshAutomaticGifts(regularItemsRef.current, shippingRef.current);
  };

  const setPricingCountry = (country: string | null) => {
    const trimmed = country && country.trim().length > 0 ? country.trim() : "FR";
    setPricingCountryState(trimmed);
    persistValue(COUNTRY_STORAGE_KEY, trimmed);
    refreshAutomaticGifts(regularItemsRef.current, shippingRef.current);
  };

  return {
    cart,
    isLoading,
    pricingTotals,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    setShippingMethod,
    forceUpdateCart,
    setAppliedPromoCode,
    setPricingCountry,
  };
};
