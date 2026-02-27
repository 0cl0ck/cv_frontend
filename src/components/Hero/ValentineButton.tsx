'use client';

/**
 * Tiny client component for the Valentine mobile button.
 * Extracted from ImageHero so the hero can remain a server component.
 */
export default function ValentineButton() {
  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent('open-valentine-modal'))}
      className="md:hidden absolute top-4 right-4 flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-pink-500 to-red-500 rounded-full border border-pink-300/50 shadow-lg animate-pulse hover:animate-none hover:scale-105 transition-transform"
      aria-label="Voir les offres Saint-Valentin"
    >
      <span className="text-xl">💝</span>
      <span className="text-xs font-bold text-white">-20%</span>
      <span className="text-xl">🌹</span>
    </button>
  );
}
