'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { LoyaltyBenefits, NextLevel } from '../types';
import { Cart } from '@/app/panier/types';

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
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const token =
          localStorage.getItem('authToken') ||
          (user as { token?: string } | null)?.token ||
          null;

        const resp = await fetch(`${backendUrl}/api/cart/apply-loyalty`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          },
          credentials: 'include',
          body: JSON.stringify({
            cartTotal: cart.subtotal,
            shippingCost: country === 'Belgique' ? 10 : cart.subtotal >= 49 ? 0 : 4.95,
            items: cart.items
          })
        });
        if (!resp.ok) throw new Error();
        const data = await resp.json();

        const orderCount: number = data.orderCount || 1;
        let nextLevel: NextLevel | undefined;
        if (orderCount < 2) nextLevel = { name: 'Échantillon offert', ordersRequired: 2, remainingOrders: 2 - orderCount };
        else if (orderCount < 3) nextLevel = { name: 'Bronze', ordersRequired: 3, remainingOrders: 3 - orderCount };
        else if (orderCount < 5) nextLevel = { name: 'Argent', ordersRequired: 5, remainingOrders: 5 - orderCount };
        else if (orderCount < 10) nextLevel = { name: 'Or', ordersRequired: 10, remainingOrders: 10 - orderCount };

        if (data.reward && data.reward.type !== 'none') {
          setLoyaltyBenefits({
            active: true,
            message: data.reward.message,
            discountAmount: data.discount || 0,
            rewardType: data.reward.type,
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
