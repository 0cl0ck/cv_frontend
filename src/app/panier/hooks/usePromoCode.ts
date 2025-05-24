'use client';

import { useState } from 'react';
import { PromoResult, RestrictedCategory } from '../types';
import { Cart } from '@/app/panier/types';
import { CustomerInfo } from '../types';
import { fetchWithCsrf } from '@/lib/security/csrf';

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
    type: ''
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
            const data = await fetchWithCsrf(`/products/${item.productId}`, {
              method: 'GET'
            });
            const categoryId = data?.category?.id || data?.category || '';
            return { productId: item.productId, categoryId, price: item.price, quantity: item.quantity };
          } catch {
            return { productId: item.productId, categoryId: '', price: item.price, quantity: item.quantity };
          }
        })
      );

      const result = await fetchWithCsrf('/cart/apply-promo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        } as HeadersInit,
        body: JSON.stringify({
          promoCode: promoCode.trim(),
          cartTotal: cart.subtotal,
          shippingCost,
          items: itemsWithCat
        })
      });

      if (result.success && result.valid) {
        let message = result.message;
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
        setPromoResult({ applied: true, code: result.code, discount: result.discount, message, type: result.type });
      } else {
        setPromoResult({ applied: false, code: '', discount: 0, message: result.message || 'Code promo invalide', type: '' });
      }
    } catch {
      setPromoResult({ applied: false, code: '', discount: 0, message: 'Erreur technique lors de l’application', type: '' });
    } finally {
      setIsApplying(false);
    }
  };

  const cancelPromo = () => {
    setPromoResult({ applied: false, code: '', discount: 0, message: '', type: '' });
    setPromoCode('');
  };

  return { promoCode, setPromoCode, promoResult, isApplying, applyPromo, cancelPromo };
}
