'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Gift, Loader2, CheckCircle } from 'lucide-react';

interface CustomerInfo {
  email: string;
  firstName: string;
  lastName: string;
}

interface GuestLoyaltyBannerProps {
  customerInfo?: CustomerInfo;
  onAccountCreated?: (customerId: string) => void;
}

// Vérifie si on est dans la période de cashback Noël (20-31 décembre 2025)
function isChristmasCashbackPeriod(): boolean {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed, décembre = 11
  const day = now.getDate();
  return year === 2025 && month === 11 && day >= 20 && day <= 31;
}

export default function GuestLoyaltyBanner({ 
  customerInfo, 
  onAccountCreated 
}: GuestLoyaltyBannerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isChristmas = isChristmasCashbackPeriod();
  const canCreateAccount = customerInfo?.email && customerInfo?.firstName && customerInfo?.lastName;

  const handleCreateAccount = async () => {
    if (!canCreateAccount || !customerInfo) return;
    
    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/create-guest-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: customerInfo.email,
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.code === 'EMAIL_EXISTS') {
          setError('Ce compte existe déjà. Connectez-vous !');
        } else {
          setError(data.error || 'Une erreur est survenue');
        }
        return;
      }

      setAccountCreated(true);
      if (onAccountCreated && data.customerId) {
        onAccountCreated(data.customerId);
      }
    } catch (err) {
      setError('Erreur de connexion. Réessayez.');
      console.error('Erreur création compte guest:', err);
    } finally {
      setIsCreating(false);
    }
  };

  // État : compte créé avec succès
  if (accountCreated) {
    return (
      <div className="mt-3 bg-[#002935] border border-green-500/50 rounded-md p-3">
        <div className="flex items-center text-green-400 mb-1">
          <CheckCircle size={16} className="mr-2" />
          <span className="font-medium">Compte créé !</span>
        </div>
        <p className="text-xs text-[#F4F8F5]">
          Un email vous a été envoyé pour définir votre mot de passe.
          {isChristmas && ' Votre cashback sera crédité après le paiement ! 🎁'}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-3 bg-[#002935] border border-[#3A4A4F] rounded-md p-3">
      {/* Message spécial Noël */}
      {isChristmas && (
        <div className="mb-3 p-2 bg-gradient-to-r from-[#1a472a]/30 to-[#8B0000]/20 rounded border border-[#EFC368]/30">
          <div className="flex items-center text-[#EFC368] mb-1">
            <Gift size={16} className="mr-2" />
            <span className="font-medium text-sm">Cashback Noël 🎄</span>
          </div>
          <p className="text-xs text-[#F4F8F5]">
            Créez un compte pour recevoir du <span className="text-green-400 font-semibold">cashback</span> sur cette commande !
          </p>
          <div className="flex gap-2 mt-1 text-[10px] text-white/70">
            <span>25€ → 5€</span>
            <span>•</span>
            <span>50€ → 10€</span>
            <span>•</span>
            <span>100€ → 20€</span>
          </div>
        </div>
      )}

      {/* Message fidélité standard */}
      <div className="flex items-center text-[#F4F8F5] mb-1">
        <AlertCircle size={16} className="mr-2 text-[#EFC368]" />
        <span className="font-medium">Programme de fidélité</span>
      </div>
      <p className="text-xs text-[#F4F8F5] mb-2">
        {isChristmas 
          ? 'Créez un compte rapidement pour bénéficier du cashback et des avantages fidélité !'
          : 'Connectez-vous pour bénéficier d\'avantages exclusifs selon votre historique de commandes.'
        }
      </p>

      {/* Erreur */}
      {error && (
        <p className="text-xs text-red-400 mb-2">{error}</p>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Bouton création rapide (si infos disponibles) */}
        {canCreateAccount && onAccountCreated && (
          <button
            onClick={handleCreateAccount}
            disabled={isCreating}
            className="flex items-center justify-center gap-1 px-3 py-1.5 bg-[#EFC368] hover:bg-[#d4a84a] text-black text-xs font-semibold rounded transition-colors disabled:opacity-50"
          >
            {isCreating ? (
              <>
                <Loader2 size={12} className="animate-spin" />
                Création...
              </>
            ) : (
              <>
                {isChristmas ? '🎁 ' : ''}Créer mon compte
              </>
            )}
          </button>
        )}
        
        {/* Lien connexion */}
        <Link 
          href="/connexion?redirect=/panier" 
          className="text-[#EFC368] text-xs hover:underline flex items-center"
        >
          {canCreateAccount ? 'Déjà un compte ? Se connecter' : 'Se connecter pour en profiter'}
        </Link>
      </div>

      {/* Info compte rapide */}
      {canCreateAccount && onAccountCreated && (
        <p className="text-[10px] text-white/50 mt-2">
          Un email sera envoyé à {customerInfo.email} pour définir votre mot de passe.
        </p>
      )}
    </div>
  );
}
