'use client';

import { useState } from 'react';
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
          ? 10
          : cart.subtotal >= 49
          ? 0
          : 4.95;

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

  return { promoCode, setPromoCode, promoResult, isApplying, applyPromo, cancelPromo };
}
