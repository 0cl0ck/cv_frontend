'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { Address } from '../types';
import { fetchWithCsrf } from '@/lib/security/csrf';

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
        // Utiliser l'endpoint /me au lieu de l'ID direct pour éviter les problèmes de permissions
        const data = await fetchWithCsrf('/customers/me', {
          method: 'GET'
        });
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
