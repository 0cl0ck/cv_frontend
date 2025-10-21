'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { LoyaltyBenefits } from '../types';
import { Cart } from '@/app/panier/types';
import { calculateCartTotals } from '@/lib/pricingClient';

export default function useLoyaltyBenefits(
  cart: Cart,
  country: string
): { loyaltyBenefits: LoyaltyBenefits; loading: boolean } {
  const { isAuthenticated, user, loading: authLoading } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [loyaltyBenefits, setLoyaltyBenefits] = useState<LoyaltyBenefits>({
    active: false,
    message: '',
    discountAmount: 0,
    rewardType: 'none',
    orderCount: 1
  });

  useEffect(() => {
    if (!isAuthenticated || authLoading || cart.items.length === 0) return;

    const fetchLoyalty = async () => {
      setLoading(true);
      try {
        // Utiliser /api/pricing qui retourne déjà appliedLoyalty
        const totals = await calculateCartTotals({
          cart,
          country: country || 'FR',
        });

        const appliedLoyalty = totals.appliedLoyalty;
        
        if (appliedLoyalty && appliedLoyalty.eligible) {
          setLoyaltyBenefits({
            active: totals.loyaltyDiscount > 0,
            message: appliedLoyalty.message || 'Remise fidélité appliquée',
            discountAmount: totals.loyaltyDiscount,
            rewardType: 'none',
            orderCount: appliedLoyalty.ordersCount || 1,
            nextLevel: appliedLoyalty.nextLevel,
          });
        } else {
          setLoyaltyBenefits({
            active: false,
            message: '',
            discountAmount: 0,
            rewardType: 'none',
            orderCount: appliedLoyalty?.ordersCount || 1,
            nextLevel: appliedLoyalty?.nextLevel,
          });
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };

    fetchLoyalty();
  }, [cart, country, isAuthenticated, user, authLoading]);

  return { loyaltyBenefits, loading };
}

