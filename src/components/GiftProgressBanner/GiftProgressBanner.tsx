"use client";

import React from "react";

interface GiftProgressBannerProps {
  /** Montant actuel du panier en euros (après remises) */
  currentAmount?: number;
  /** Afficher en mode compact (sans sous-titre) */
  compact?: boolean;
}

const TIERS = [
  { threshold: 50, label: "50€", gifts: ["🚚 Livraison offerte*", "🌿 2g offerts"] },
  { threshold: 90, label: "90€", gifts: ["🚚 Livraison offerte*", "🌿 10g offerts", "🎁 1 pre-roll"] },
  { threshold: 160, label: "160€", gifts: ["🚚 Livraison offerte*", "🌿 20g offerts", "🎁 2 pre-rolls"] },
];

export default function GiftProgressBanner({ 
  currentAmount = 0,
  compact = false 
}: GiftProgressBannerProps) {
  // Calcul de la progression (0 à 100%)
  const maxThreshold = TIERS[TIERS.length - 1].threshold;
  const progressPercent = Math.min((currentAmount / maxThreshold) * 100, 100);
  
  // Déterminer le palier atteint
  const currentTierIndex = TIERS.findIndex((t) => currentAmount < t.threshold);
  const reachedTierIndex = currentTierIndex === -1 ? TIERS.length - 1 : currentTierIndex - 1;
  
  // Prochain palier à atteindre
  const nextTier = currentTierIndex >= 0 ? TIERS[currentTierIndex] : null;
  const amountToNext = nextTier ? nextTier.threshold - currentAmount : 0;

  return (
    <div className="bg-gradient-to-r from-[#002935] to-[#00454f] text-white p-4 rounded-lg shadow-lg border border-[#EFC368]/30">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <span className="text-xl">🎁</span>
          <span className="text-[#EFC368]">Cadeaux automatiques</span>
        </h3>
        {currentAmount > 0 && nextTier && (
          <span className="text-sm bg-[#EFC368]/20 text-[#EFC368] px-3 py-1 rounded-full">
            Plus que <strong>{amountToNext.toFixed(0)}€</strong> pour le prochain palier !
          </span>
        )}
      </div>

      {!compact && (
        <p className="text-white/70 text-sm mb-4">
          Livraison offerte + cadeaux selon le montant du panier
        </p>
      )}

      {/* Progress bar */}
      <div className="relative mb-4">
        {/* Barre de fond */}
        <div className="h-3 bg-[#001E27] rounded-full overflow-hidden">
          {/* Barre de progression */}
          <div 
            className="h-full bg-gradient-to-r from-[#EFC368] to-[#f0d68a] transition-all duration-500 ease-out rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        
        {/* Marqueurs des paliers */}
        <div className="absolute top-0 left-0 right-0 h-3 flex items-center">
          {TIERS.map((tier, index) => {
            const position = (tier.threshold / maxThreshold) * 100;
            const isReached = currentAmount >= tier.threshold;
            const isNext = index === currentTierIndex;
            
            return (
              <div
                key={tier.threshold}
                className="absolute flex flex-col items-center"
                style={{ left: `${position}%`, transform: "translateX(-50%)" }}
              >
                {/* Point de marqueur */}
                <div 
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                    isReached 
                      ? "bg-[#EFC368] border-[#EFC368] scale-110" 
                      : isNext 
                        ? "bg-[#002935] border-[#EFC368] animate-pulse" 
                        : "bg-[#002935] border-white/40"
                  }`}
                >
                  {isReached && (
                    <span className="flex items-center justify-center text-[8px]">✓</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Paliers cards */}
      <div className="grid grid-cols-3 gap-2">
        {TIERS.map((tier, index) => {
          const isReached = currentAmount >= tier.threshold;
          const isNext = index === currentTierIndex;
          
          return (
            <div
              key={tier.threshold}
              className={`p-3 rounded-lg text-center transition-all duration-300 ${
                isReached
                  ? "bg-[#EFC368]/20 border border-[#EFC368]/50"
                  : isNext
                    ? "bg-[#EFC368]/10 border border-[#EFC368]/30 ring-1 ring-[#EFC368]/50"
                    : "bg-white/5 border border-white/10"
              }`}
            >
              <div className={`text-lg font-bold mb-1 ${isReached ? "text-[#EFC368]" : "text-white"}`}>
                {tier.label}
              </div>
              <div className="space-y-0.5">
                {tier.gifts.map((gift, giftIndex) => (
                  <div 
                    key={giftIndex} 
                    className={`text-xs ${isReached ? "text-white" : "text-white/60"}`}
                  >
                    {gift}
                  </div>
                ))}
              </div>
              {isReached && (
                <div className="mt-2 text-xs text-[#EFC368] font-medium">
                  ✓ Débloqué
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <p className="text-white/50 text-xs mt-3 text-center">
        Montant calculé après remises et fidélité • *Livraison offerte : 50€ France, 200€ autres pays
      </p>
    </div>
  );
}
