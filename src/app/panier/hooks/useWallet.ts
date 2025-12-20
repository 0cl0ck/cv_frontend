'use client';

import { useState, useEffect, useCallback } from 'react';

interface WalletHistoryEntry {
  amount: number;
  type: 'credit' | 'debit';
  reason: string;
  orderId?: string;
  date: string;
  validFrom?: string;
  validUntil?: string;
}

interface WalletData {
  totalBalance: number;
  usableBalance: number;
  canUseWallet: boolean;
  usagePeriod: string;
  history: WalletHistoryEntry[];
}

/**
 * Hook pour gérer le wallet du client dans le panier
 * 
 * @param cartTotal - Total du panier
 * @returns État du wallet et fonctions de gestion
 */
export function useWallet(cartTotal: number) {
  const [requestedWalletAmount, setRequestedWalletAmount] = useState(0)
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const fetchWallet = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/wallet', {
        credentials: 'include',
      })
      
      if (!response.ok) {
        if (response.status === 401) {
          // Non connecté, pas d'erreur à afficher
          setWallet(null)
          return
        }
        throw new Error('Impossible de charger votre cagnotte')
      }
      
      const data = await response.json()
      
      if (data.success && data.wallet) {
        setWallet(data.wallet)
        
        // Initialiser avec le maximum utilisable
        if (data.wallet.usableBalance > 0 && cartTotal > 0) {
          const maxUsable = Math.min(data.wallet.usableBalance, cartTotal)
          setRequestedWalletAmount(maxUsable)
        }
      }
    } catch (err) {
      console.error('Erreur wallet:', err)
      setError(err instanceof Error ? err.message : 'Erreur de connexion')
      setWallet(null)
    } finally {
      setLoading(false)
    }
  }, [cartTotal])
  
  useEffect(() => {
    fetchWallet()
  }, [fetchWallet])
  
  return {
    requestedWalletAmount,
    setRequestedWalletAmount,
    wallet,
    loading,
    error,
  }
}

export default useWallet

