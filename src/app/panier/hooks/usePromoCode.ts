'use client';

import { useEffect, useState } from 'react';
import { PromoResult, RestrictedCategory, PromoType, CategoryRestrictionType } from '../types';
import { Cart } from '@/app/panier/types';
import { CustomerInfo } from '../types';
import { httpClient } from '@/lib/httpClient';

interface UsePromoCodeReturn {
  promoCode: string;
  setPromoCode: (code: string) => void;
  promoResult: PromoResult;
  isApplying: boolean;
  applyPromo: (e: React.FormEvent) => Promise<void>;
  cancelPromo: () => void;
}

export default function usePromoCode(
  cart: Cart,
  customerInfo: CustomerInfo
): UsePromoCodeReturn {
  const [promoCode, setPromoCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [promoResult, setPromoResult] = useState<PromoResult>({
    applied: false,
    code: '',
    discount: 0,
    message: '',
    type: '' as PromoType
  });

  const applyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    setIsApplying(true);
    try {
      const shippingCost =
        customerInfo.country === 'Belgique'
          ? (cart.subtotal >= 70 ? 0 : 10)
          : (cart.subtotal >= 50 ? 0 : 5);

      // Récupération des catégories
      const itemsWithCat = await Promise.all(
        cart.items.map(async (item) => {
          try {
            const { data } = await httpClient.get<{
              category?: {
                id?: string;
              } | string;
            }>(`/products/${item.productId}`);
            let categoryId = '';
            if (typeof data?.category === 'string') {
              categoryId = data.category;
            } else if (data?.category && typeof data.category === 'object') {
              categoryId = data.category.id || '';
            }
            return { productId: item.productId, categoryId, price: item.price, quantity: item.quantity };
          } catch {
            return { productId: item.productId, categoryId: '', price: item.price, quantity: item.quantity };
          }
        })
      );

      interface PromoCodeResponse {
        success: boolean;
        valid: boolean;
        message?: string;
        code?: string;
        discount?: number;
        type?: PromoType;
        categoryRestrictionType?: CategoryRestrictionType;
        restrictedCategories?: RestrictedCategory[];
      }

      const { data: result } = await httpClient.post<PromoCodeResponse>('/cart/apply-promo', {
        promoCode: promoCode.trim(),
        cartTotal: cart.subtotal,
        shippingCost,
        items: itemsWithCat
      }, { withCsrf: true });

      if (result.success && result.valid) {
        let message: string = result.message || '';
        if (result.categoryRestrictionType === 'exclude' && result.restrictedCategories?.length) {
          const names = (result.restrictedCategories as RestrictedCategory[])
            .map(c => c.name)
            .join(', ');
          message = `Code "${result.code}" appliqué (hors ${names})`;
        } else if (result.categoryRestrictionType === 'include' && result.restrictedCategories?.length) {
          const names = (result.restrictedCategories as RestrictedCategory[])
            .map(c => c.name)
            .join(', ');
          message = `Code "${result.code}" appliqué (uniquement sur ${names})`;
        }
        setPromoResult({ 
          applied: true, 
          code: result.code || '', 
          discount: result.discount || 0, 
          message, 
          type: result.type as PromoType 
        });
      } else {
        setPromoResult({ applied: false, code: '', discount: 0, message: result.message || 'Code promo invalide', type: '' as PromoType });
      }
    } catch {
      setPromoResult({ applied: false, code: '', discount: 0, message: 'Erreur technique lors de l’application', type: '' as PromoType });
    } finally {
      setIsApplying(false);
    }
  };

  const cancelPromo = () => {
    setPromoResult({ applied: false, code: '', discount: 0, message: '', type: '' as PromoType });
    setPromoCode('');
  };

  // Auto-révalidation du code promo quand le panier change (total/produits)
  useEffect(() => {
    let cancelled = false;
    async function revalidateIfNeeded() {
      if (!promoResult.applied || !promoResult.code) return;
      try {
        const shippingCost =
          customerInfo.country === 'Belgique' ? (cart.subtotal >= 70 ? 0 : 10) : (cart.subtotal >= 50 ? 0 : 5);

        // Récupérer les catégories pour respecter d'éventuelles restrictions
        const itemsWithCat = await Promise.all(
          cart.items.map(async (item) => {
            try {
              const { data } = await httpClient.get<{ category?: { id?: string } | string }>(`/products/${item.productId}`);
              let categoryId = '';
              if (typeof data?.category === 'string') categoryId = data.category;
              else if (data?.category && typeof data.category === 'object') categoryId = data.category.id || '';
              return { productId: item.productId, categoryId, price: item.price, quantity: item.quantity };
            } catch {
              return { productId: item.productId, categoryId: '', price: item.price, quantity: item.quantity };
            }
          })
        );

        const { data: result } = await httpClient.post<{
          success: boolean;
          valid: boolean;
          message?: string;
          code?: string;
          discount?: number;
          type?: PromoType;
        }>(
          '/cart/apply-promo',
          { promoCode: promoResult.code, cartTotal: cart.subtotal, shippingCost, items: itemsWithCat },
          { withCsrf: true }
        );

        if (cancelled) return;
        if (result.success && result.valid) {
          // Mettre à jour la remise avec le nouveau total
          setPromoResult((prev) => ({
            ...prev,
            applied: true,
            discount: result.discount || 0,
            message: result.message || prev.message,
            type: (result.type || prev.type) as PromoType,
          }));
        } else {
          // Invalider le code si le panier n'est plus éligible
          setPromoResult({
            applied: false,
            code: '',
            discount: 0,
            message: result.message || "Le code promo n'est plus applicable (panier insuffisant)",
            type: '' as PromoType,
          });
        }
      } catch {
        // En cas d'erreur réseau, ne pas bloquer, mais retirer la remise pour éviter un affichage trompeur
        setPromoResult((prev) => ({ ...prev, applied: false, discount: 0 }));
      }
    }

    revalidateIfNeeded();
    return () => {
      cancelled = true;
    };
  }, [cart.subtotal, cart.items, customerInfo.country, promoResult.applied, promoResult.code]);

  return { promoCode, setPromoCode, promoResult, isApplying, applyPromo, cancelPromo };
}
