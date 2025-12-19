'use client';

import React, { useState, useEffect } from 'react';

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

export default function WalletWidget({ compact = false, onWalletApply, cartTotal }: WalletWidgetProps) {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [amountToUse, setAmountToUse] = useState<number>(0);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/wallet', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Connectez-vous pour voir votre cagnotte');
        } else {
          setError('Impossible de charger votre cagnotte');
        }
        return;
      }
      
      const data = await response.json();
      if (data.success) {
        setWallet(data.wallet);
        // Initialiser le montant à utiliser avec le minimum entre le solde et le panier
        if (cartTotal && data.wallet.usableBalance > 0) {
          setAmountToUse(Math.min(data.wallet.usableBalance, cartTotal));
        }
      }
    } catch (err) {
      setError('Erreur de connexion');
      console.error('Erreur wallet:', err);
    } finally {
      setLoading(false);
    }
  };

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

  if (error) {
    return null; // Ne pas afficher si erreur (non connecté, etc.)
  }

  if (!wallet || wallet.totalBalance === 0) {
    return null; // Ne pas afficher si pas de cagnotte
  }

  // Mode compact pour le panier
  if (compact) {
    return (
      <div className="bg-gradient-to-r from-[#1a472a]/30 to-[#002935] rounded-lg border border-green-500/30 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💰</span>
            <div>
              <p className="text-white font-semibold">Ma Cagnotte</p>
              <p className="text-green-400 font-bold text-lg">{wallet.totalBalance.toFixed(2)}€</p>
            </div>
          </div>
          {wallet.canUseWallet && wallet.usableBalance > 0 && (
            <span className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-full">
              Utilisable
            </span>
          )}
        </div>

        {wallet.canUseWallet && wallet.usableBalance > 0 && cartTotal && onWalletApply ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max={Math.min(wallet.usableBalance, cartTotal)}
                step="0.01"
                value={amountToUse}
                onChange={(e) => setAmountToUse(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-[#3A4A4F] rounded-lg appearance-none cursor-pointer accent-green-500"
              />
              <span className="text-white font-bold min-w-[60px] text-right">
                {amountToUse.toFixed(2)}€
              </span>
            </div>
            <button
              onClick={handleApplyWallet}
              disabled={amountToUse <= 0}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-colors"
            >
              Utiliser {amountToUse.toFixed(2)}€ de ma cagnotte
            </button>
          </div>
        ) : !wallet.canUseWallet ? (
          <p className="text-white/70 text-sm">
            {wallet.usagePeriod}
          </p>
        ) : null}
      </div>
    );
  }

  // Mode complet pour la page compte
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
              <p className="text-green-400 text-3xl font-bold">{wallet.totalBalance.toFixed(2)}€</p>
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
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    entry.type === 'credit' 
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
                  <span className={`font-bold ${
                    entry.type === 'credit' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {entry.type === 'credit' ? '+' : '-'}{entry.amount.toFixed(2)}€
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



