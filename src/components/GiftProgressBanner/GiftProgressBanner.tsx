"use client";

import React from "react";

/**
 * Bannière simple et élégante pour les cadeaux automatiques
 * Desktop: 3 cards égales (1/3) avec détails | Mobile: cards en colonne
 */
export default function GiftProgressBanner() {
  return (
    <div className="bg-gradient-to-r from-[#002935] to-[#00454f] text-white p-4 rounded-lg shadow-lg border border-[#EFC368]/30 mb-6">
      {/* Header */}
      <h3 className="text-base font-bold flex items-center gap-2 mb-3">
        <span className="text-lg">🎁</span>
        <span className="text-[#EFC368]">Cadeaux automatiques</span>
      </h3>

      {/* Tiers: colonne sur mobile, grille 3 colonnes égales sur desktop */}
      <div className="flex flex-col md:grid md:grid-cols-3 gap-3">
        {/* Tier 50€ */}
        <div className="bg-white/10 rounded-lg p-3 border border-white/20 text-center">
          <div className="text-[#EFC368] font-bold text-lg mb-2">50€</div>
          <div className="space-y-1 text-sm text-white/90">
            <p>🚚 Livraison offerte*</p>
            <p>🌿 2g offerts</p>
          </div>
        </div>

        {/* Tier 90€ */}
        <div className="bg-white/10 rounded-lg p-3 border border-white/20 text-center">
          <div className="text-[#EFC368] font-bold text-lg mb-2">90€</div>
          <div className="space-y-1 text-sm text-white/90">
            <p>🚚 Livraison offerte*</p>
            <p>🌿 10g offerts</p>
            <p>🎁 1 pre-roll</p>
          </div>
        </div>

        {/* Tier 160€ */}
        <div className="bg-white/10 rounded-lg p-3 border border-white/20 text-center">
          <div className="text-[#EFC368] font-bold text-lg mb-2">160€</div>
          <div className="space-y-1 text-sm text-white/90">
            <p>🚚 Livraison offerte*</p>
            <p>🌿 20g offerts</p>
            <p>🎁 2 pre-rolls</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="text-white/40 text-[10px] mt-3 text-center">
        Montant calculé après remises et fidélité • *Livraison offerte : 50€ France, 200€ autres pays
      </p>
    </div>
  );
}
