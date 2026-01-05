'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { httpClient } from '@/lib/httpClient';

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

interface WalletWidgetProps {
  compact?: boolean; // Mode compact pour le panier
  onWalletApply?: (amount: number) => void; // Callback pour appliquer le wallet
  cartTotal?: number; // Total du panier pour le mode panier
}

// Vérifie si la période d'utilisation est active (janvier 2026)
// TEMPORAIREMENT: toujours actif pour test
const isWalletUsagePeriodActive = (): boolean => {
  // TODO: Réactiver pour la prod
  // const now = new Date();
  // return now >= new Date('2026-01-01');
  return true; // Temporairement activé pour test
};

export default function WalletWidget({ compact = false, onWalletApply, cartTotal }: WalletWidgetProps) {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [amountToUse, setAmountToUse] = useState<number>(0);

  const fetchWallet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await httpClient.get('/wallet');

      if (response.data?.success) {
        setWallet(response.data.wallet);
        setIsAuthenticated(true);
        // Initialiser le montant à utiliser avec le minimum entre le solde et le panier
        if (cartTotal && response.data.wallet.usableBalance > 0) {
          setAmountToUse(Math.min(response.data.wallet.usableBalance, cartTotal));
        }
      }
    } catch (err: unknown) {
      const axiosError = err as { response?: { status?: number } };
      if (axiosError.response?.status === 401) {
        // Non connecté : pas d'erreur, juste pas de données
        setWallet(null);
        setIsAuthenticated(false);
        setError(null);
      } else {
        // Erreur serveur : afficher un message d'erreur
        setWallet(null);
        setIsAuthenticated(false);
        setError('Impossible de charger votre cagnotte. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  }, [cartTotal]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleApplyWallet = () => {
    if (onWalletApply && amountToUse > 0) {
      onWalletApply(amountToUse);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={`${compact ? 'p-3' : 'p-4'} bg-[#002935] rounded-lg border border-[#3A4A4F]`}>
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-8 h-8 bg-[#3A4A4F] rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-[#3A4A4F] rounded w-24 mb-2"></div>
            <div className="h-3 bg-[#3A4A4F] rounded w-16"></div>
          </div>
        </div>
      </div>
    );
  }

  // ===== MODE COMPACT (PANIER) =====
  if (compact) {
    // Si erreur serveur
    if (error) {
      return (
        <div className="bg-gradient-to-r from-[#1a472a]/30 to-[#002935] rounded-lg border border-red-500/30 p-4">
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      );
    }

    // Si non authentifié : afficher 0€ + message
    if (!isAuthenticated) {
      return (
        <div className="bg-gradient-to-r from-[#1a472a]/30 to-[#002935] rounded-lg border border-[#3A4A4F] p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💰</span>
              <div>
                <p className="text-white font-semibold">Ma Cagnotte</p>
                <p className="text-white/50 font-bold text-lg">0,00 €</p>
              </div>
            </div>
          </div>
          <p className="text-white/60 text-sm">
            Connectez-vous pour voir votre cagnotte
          </p>
        </div>
      );
    }

    // Authentifié - afficher le wallet avec bouton grisé
    const balance = wallet?.totalBalance || 0;
    const cartTotalBeforeWallet = cartTotal || 0;
    // Wallet applicable si : période active + solde > 0 + panier >= 50€
    const canApply = isWalletUsagePeriodActive() && balance > 0 && cartTotalBeforeWallet >= 50;
    const cartTooLow = balance > 0 && cartTotalBeforeWallet < 50;

    return (
      <div className="bg-gradient-to-r from-[#1a472a]/30 to-[#002935] rounded-lg border border-green-500/30 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <div>
              <p className="text-white font-semibold">Ma Cagnotte</p>
              <p className={`font-bold text-lg ${balance > 0 ? 'text-green-400' : 'text-white/50'}`}>
                {balance.toFixed(2)} €
              </p>
            </div>
          </div>
          {balance > 0 && !canApply && !cartTooLow && (
            <span className="bg-[#EFC368]/20 text-[#EFC368] text-xs px-2 py-1 rounded-full">
              Bientôt
            </span>
          )}
        </div>

        {/* Bouton Appliquer - grisé si panier < 50€ ou hors période */}
        <button
          onClick={handleApplyWallet}
          disabled={!canApply}
          className={`w-full font-semibold py-2 px-4 rounded-lg transition-colors ${canApply
            ? 'bg-green-600 hover:bg-green-700 text-white cursor-pointer'
            : 'bg-gray-600/50 text-white/50 cursor-not-allowed'
            }`}
        >
          Appliquer ma cagnotte
        </button>

        {/* Message explicatif - seulement si solde > 0 */}
        {balance > 0 && (
          <p className="text-white/60 text-xs mt-2 text-center">
            {cartTooLow
              ? `Panier minimum de 50€ requis pour utiliser la cagnotte (actuel: ${cartTotalBeforeWallet.toFixed(2)}€)`
              : canApply
                ? 'Réduisez votre commande avec votre cagnotte (minimum 50€ après remise)'
                : 'Votre cagnotte est utilisable dès janvier 2026.'}
          </p>
        )}
      </div>
    );
  }

  // ===== MODE COMPLET (PAGE COMPTE) =====

  // Si erreur serveur
  if (error) {
    return (
      <div className="bg-[#002935] rounded-xl border border-red-500/30 p-6">
        <div className="flex items-center gap-3 text-red-400">
          <span className="text-2xl">⚠️</span>
          <div>
            <p className="font-semibold">Erreur</p>
            <p className="text-sm text-red-400/80">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  // Si non authentifié (ne devrait pas arriver sur /compte mais on gère quand même)
  if (!isAuthenticated) {
    return null;
  }

  // Si pas de wallet ou solde à 0
  if (!wallet || wallet.totalBalance === 0) {
    return (
      <div className="bg-[#002935] rounded-xl border border-[#3A4A4F] overflow-hidden">
        <div className="bg-gradient-to-r from-[#1a472a] to-[#002935] p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
              <span className="text-4xl">💰</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Ma Cagnotte</h2>
              <p className="text-white/50 text-3xl font-bold">0,00 €</p>
            </div>
          </div>
          <p className="mt-4 text-white/70 text-sm bg-black/20 rounded-lg p-3">
            Votre cagnotte est cumulée du 20 au 31 décembre et utilisable à partir du 1er janvier 2026.
          </p>
        </div>
      </div>
    );
  }

  // Affichage normal du mode complet
  return (
    <div className="bg-[#002935] rounded-xl border border-[#3A4A4F] overflow-hidden">
      {/* En-tête */}
      <div className="bg-gradient-to-r from-[#1a472a] to-[#002935] p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
              <span className="text-4xl">💰</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Ma Cagnotte</h2>
              <p className="text-green-400 text-3xl font-bold">{wallet.totalBalance.toFixed(2)} €</p>
            </div>
          </div>
          <div className="text-right">
            {wallet.canUseWallet ? (
              <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                ✓ Utilisable maintenant
              </span>
            ) : (
              <span className="bg-[#EFC368]/20 text-[#EFC368] px-3 py-1 rounded-full text-sm font-medium">
                ⏳ Bientôt disponible
              </span>
            )}
          </div>
        </div>

        {!wallet.canUseWallet && (
          <p className="mt-4 text-white/70 text-sm bg-black/20 rounded-lg p-3">
            {wallet.usagePeriod}
          </p>
        )}
      </div>

      {/* Historique */}
      <div className="p-4">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center justify-between w-full text-white hover:text-[#EFC368] transition-colors"
        >
          <span className="font-medium">Historique des mouvements</span>
          <svg
            className={`w-5 h-5 transition-transform ${showHistory ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showHistory && (
          <div className="mt-4 space-y-3">
            {wallet.history.length === 0 ? (
              <p className="text-white/50 text-center py-4">Aucun mouvement</p>
            ) : (
              wallet.history.map((entry, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg ${entry.type === 'credit'
                    ? 'bg-green-500/10 border border-green-500/20'
                    : 'bg-red-500/10 border border-red-500/20'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">
                      {entry.type === 'credit' ? '➕' : '➖'}
                    </span>
                    <div>
                      <p className="text-white text-sm font-medium">{entry.reason}</p>
                      <p className="text-white/50 text-xs">{formatDate(entry.date)}</p>
                      {entry.validFrom && entry.validUntil && (
                        <p className="text-white/40 text-xs">
                          Valide du {formatDate(entry.validFrom)} au {formatDate(entry.validUntil)}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`font-bold ${entry.type === 'credit' ? 'text-green-400' : 'text-red-400'
                    }`}>
                    {entry.type === 'credit' ? '+' : '-'}{entry.amount.toFixed(2)} €
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
