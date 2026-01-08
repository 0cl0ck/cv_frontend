"use client";

import React from "react";

/**
 * Bannière simple et élégante pour les cadeaux automatiques
 * Cards horizontales, sans progress bar, lisible sur tous devices
 */
export default function GiftProgressBanner() {
  return (
    <div className="bg-gradient-to-r from-[#002935] to-[#00454f] text-white p-4 rounded-lg shadow-lg border border-[#EFC368]/30 mb-6">
      {/* Header */}
      <h3 className="text-base font-bold flex items-center gap-2 mb-3">
        <span className="text-lg">🎁</span>
        <span className="text-[#EFC368]">Cadeaux automatiques</span>
      </h3>

      {/* Tiers en ligne horizontale - scrollable sur mobile */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {/* Tier 50€ */}
        <div className="flex-shrink-0 flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 border border-white/20 min-w-fit">
          <span className="text-[#EFC368] font-bold text-sm">50€</span>
          <span className="text-white/60 text-xs">→</span>
          <span className="text-white/90 text-xs">🚚 Livraison* + 🌿 2g</span>
        </div>

        {/* Tier 90€ */}
        <div className="flex-shrink-0 flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 border border-white/20 min-w-fit">
          <span className="text-[#EFC368] font-bold text-sm">90€</span>
          <span className="text-white/60 text-xs">→</span>
          <span className="text-white/90 text-xs">🚚 Livraison* + 🌿 10g + 🎁 1 pre-roll</span>
        </div>

        {/* Tier 160€ */}
        <div className="flex-shrink-0 flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2 border border-white/20 min-w-fit">
          <span className="text-[#EFC368] font-bold text-sm">160€</span>
          <span className="text-white/60 text-xs">→</span>
          <span className="text-white/90 text-xs">🚚 Livraison* + 🌿 20g + 🎁 2 pre-rolls</span>
        </div>
      </div>

      {/* Footer */}
      <p className="text-white/40 text-[10px] mt-2">
        Après remises et fidélité • *50€ France, 200€ autres pays
      </p>
    </div>
  );
}
