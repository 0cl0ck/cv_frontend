'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { LoyaltyBenefits, NextLevel, RewardType } from '../types';
import { Cart } from '@/app/panier/types';
import { getLoyaltyBenefits } from '@/lib/loyalty-api';

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
        const data = await getLoyaltyBenefits(cart.subtotal, country, cart.items);

        const orderCount: number = data.orderCount || 1;
        let nextLevel: NextLevel | undefined;
        if (orderCount < 3) nextLevel = { name: 'Bronze', ordersRequired: 3, remainingOrders: 3 - orderCount };
        else if (orderCount < 5) nextLevel = { name: 'Argent', ordersRequired: 5, remainingOrders: 5 - orderCount };
        else if (orderCount < 10) nextLevel = { name: 'Or', ordersRequired: 10, remainingOrders: 10 - orderCount };

        const hasDiscount = typeof data.discount === 'number' && data.discount > 0;
        if (hasDiscount) {
          setLoyaltyBenefits({
            active: true,
            message: data.message || 'Remise fidélité appliquée',
            discountAmount: data.discount || 0,
            rewardType: 'none',
            orderCount,
            nextLevel
          });
        } else {
          setLoyaltyBenefits(prev => ({ ...prev, active: false, discountAmount: 0, orderCount, nextLevel }));
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };

    fetchLoyalty();
  }, [cart.subtotal, cart.items, country, isAuthenticated, user, authLoading]);

  return { loyaltyBenefits, loading };
}

