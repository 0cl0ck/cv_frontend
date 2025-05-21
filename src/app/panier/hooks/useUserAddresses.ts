'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { Address } from '../types';

export default function useUserAddresses(
  checkoutMode: boolean
): { userAddresses: Address[]; loading: boolean } {
  const { isAuthenticated, user } = useAuthContext();
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!checkoutMode || !isAuthenticated || !user) return;

    const fetchAddresses = async () => {
      setLoading(true);
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const resp = await fetch(`${backendUrl}/api/customers/${user.id}`, {
          credentials: 'include'
        });
        if (!resp.ok) throw new Error();
        const data = await resp.json();
        const shipping = (data.addresses as Address[] || []).filter(
          addr => addr.type === 'shipping' || addr.type === 'both'
        );
        setUserAddresses(shipping);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [checkoutMode, isAuthenticated, user]);

  return { userAddresses, loading };
}
