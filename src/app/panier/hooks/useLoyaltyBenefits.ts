'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { LoyaltyBenefits, NextLevel, RewardType } from '../types';
import { Cart } from '@/app/panier/types';
import { httpClient } from '@/lib/httpClient';

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
        const token =
          localStorage.getItem('authToken') ||
          (user as { token?: string } | null)?.token ||
          null;

        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        interface LoyaltyResponseData {
          orderCount?: number;
          reward?: { 
            type: RewardType;
            message: string;
          };
          discount?: number;
        }
        
        const { data } = await httpClient.post<LoyaltyResponseData>('/cart/apply-loyalty', {
          cartTotal: cart.subtotal,
          shippingCost: country === 'Belgique' ? 10 : cart.subtotal >= 49 ? 0 : 4.95,
          items: cart.items
        }, {
          withCsrf: true,
          headers
        });

        const orderCount: number = data?.orderCount || 1;
        let nextLevel: NextLevel | undefined;
        if (orderCount < 2) nextLevel = { name: 'Échantillon offert', ordersRequired: 2, remainingOrders: 2 - orderCount };
        else if (orderCount < 3) nextLevel = { name: 'Bronze', ordersRequired: 3, remainingOrders: 3 - orderCount };
        else if (orderCount < 5) nextLevel = { name: 'Argent', ordersRequired: 5, remainingOrders: 5 - orderCount };
        else if (orderCount < 10) nextLevel = { name: 'Or', ordersRequired: 10, remainingOrders: 10 - orderCount };

        if (data?.reward && data.reward.type !== 'none') {
          setLoyaltyBenefits({
            active: true,
            message: data.reward?.message || '',
            discountAmount: data.discount || 0,
            rewardType: data.reward?.type || 'none',
            orderCount,
            nextLevel
          });
        } else {
          setLoyaltyBenefits(prev => ({ ...prev, orderCount, nextLevel }));
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
