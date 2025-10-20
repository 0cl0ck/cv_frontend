'use client';

import { useEffect, useState } from 'react';
import { PromoResult, PromoType, RestrictedCategory, CategoryRestrictionType } from '../types';
import { Cart } from '@/app/panier/types';
import { CustomerInfo } from '../types';
import { calculateCartTotals } from '@/lib/pricingClient';

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
    type: '' as PromoType,
    categoryRestrictionType: '' as CategoryRestrictionType,
    restrictedCategories: [] as RestrictedCategory[]
  });

  const applyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    setIsApplying(true);
    try {
      // Utiliser /api/pricing avec le promoCode
      const totals = await calculateCartTotals({
        cart,
        country: customerInfo.country || 'FR',
        promoCode: promoCode.trim(),
      });

      const appliedPromo = totals.appliedPromo;

      if (appliedPromo && appliedPromo.applied && totals.promoDiscount > 0) {
        // Construire le message avec détails des restrictions
        let message: string = appliedPromo.message || `Code "${appliedPromo.code}" appliqué avec succès!`;
        if (appliedPromo.categoryRestrictionType === 'exclude' && appliedPromo.restrictedCategories?.length) {
          const names = appliedPromo.restrictedCategories.map(c => c.name).join(', ');
          message = `Code "${appliedPromo.code}" appliqué (hors ${names})`;
        } else if (appliedPromo.categoryRestrictionType === 'include' && appliedPromo.restrictedCategories?.length) {
          const names = appliedPromo.restrictedCategories.map(c => c.name).join(', ');
          message = `Code "${appliedPromo.code}" appliqué (uniquement sur ${names})`;
        }

        setPromoResult({ 
          applied: true, 
          code: appliedPromo.code, 
          discount: totals.promoDiscount, 
          message, 
          type: appliedPromo.type as PromoType,
          categoryRestrictionType: appliedPromo.categoryRestrictionType,
          restrictedCategories: appliedPromo.restrictedCategories,
        });
      } else {
        setPromoResult({ 
          applied: false, 
          code: '', 
          discount: 0, 
          message: 'Code promo invalide ou non applicable', 
          type: '' as PromoType,
          categoryRestrictionType: '' as CategoryRestrictionType,
          restrictedCategories: [] as RestrictedCategory[]
        });
      }
    } catch {
      setPromoResult({ 
        applied: false, 
        code: '', 
        discount: 0, 
        message: "Erreur technique lors de l'application", 
        type: '' as PromoType,
        categoryRestrictionType: '' as CategoryRestrictionType,
        restrictedCategories: [] as RestrictedCategory[]
      });
    } finally {
      setIsApplying(false);
    }
  };

  const cancelPromo = () => {
    setPromoResult({ applied: false, code: '', discount: 0, message: '', type: '' as PromoType, categoryRestrictionType: '' as CategoryRestrictionType, restrictedCategories: [] as RestrictedCategory[] });
    setPromoCode('');
  };

  // Auto-révalidation du code promo quand le panier change (total/produits)
  useEffect(() => {
    let cancelled = false;
    async function revalidateIfNeeded() {
      if (!promoResult.applied || !promoResult.code) return;
      
      try {
        // Utiliser /api/pricing pour revalider
        const totals = await calculateCartTotals({
          cart,
          country: customerInfo.country || 'FR',
          promoCode: promoResult.code,
        });

        if (cancelled) return;

        const appliedPromo = totals.appliedPromo;
        
        if (appliedPromo && appliedPromo.applied && totals.promoDiscount > 0) {
          // Mettre à jour la remise avec le nouveau total
          setPromoResult((prev) => ({
            ...prev,
            applied: true,
            discount: totals.promoDiscount,
            message: appliedPromo.message || prev.message,
            type: (appliedPromo.type || prev.type) as PromoType,
          }));
        } else {
          // Invalider le code si le panier n'est plus éligible
          setPromoResult({
            applied: false,
            code: '',
            discount: 0,
            message: "Le code promo n'est plus applicable (panier insuffisant)",
            type: '' as PromoType,
            categoryRestrictionType: '' as CategoryRestrictionType,
            restrictedCategories: [] as RestrictedCategory[],
          });
        }
      } catch {
        // En cas d'erreur réseau, ne pas bloquer, mais retirer la remise pour éviter un affichage trompeur
        setPromoResult((prev) => ({ 
          ...prev, 
          applied: false, 
          discount: 0,
          categoryRestrictionType: '' as CategoryRestrictionType,
          restrictedCategories: [] as RestrictedCategory[],
        }));
      }
    }

    revalidateIfNeeded();
    return () => {
      cancelled = true;
    };
  }, [cart.subtotal, cart.items, customerInfo.country, promoResult.applied, promoResult.code]);

  return { promoCode, setPromoCode, promoResult, isApplying, applyPromo, cancelPromo };
}
