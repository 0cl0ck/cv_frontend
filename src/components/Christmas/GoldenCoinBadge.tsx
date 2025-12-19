'use client';

import React from 'react';

interface GoldenCoinBadgeProps {
  weight: number; // Poids en grammes
  categorySlug?: string; // Pour vérifier si c'est une fleur ou résine
}

// Catégories éligibles à la Chasse à la Pièce d'Or
const ELIGIBLE_CATEGORY_SLUGS = ['fleurs', 'fleurs-cbd', 'resines', 'resines-cbd', 'hash', 'hashish'];

// Période d'affichage: 19-31 décembre 2024 (TEST: changé de 20 à 19)
function isChristmasPeriod(): boolean {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  const day = now.getDate();
  return year === 2024 && month === 11 && day >= 19 && day <= 31;
}

export default function GoldenCoinBadge({ weight, categorySlug }: GoldenCoinBadgeProps) {
  // Ne pas afficher hors période de Noël
  if (!isChristmasPeriod()) return null;

  // Vérifier si la catégorie est éligible
  const isEligible = categorySlug && ELIGIBLE_CATEGORY_SLUGS.some(
    slug => categorySlug.toLowerCase().includes(slug)
  );

  if (!isEligible) return null;

  // Calculer le nombre de participations (1 participation par 10g)
  const participations = Math.floor(weight / 10);

  if (participations < 1) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#8B4513]/20 via-[#EFC368]/20 to-[#8B4513]/20 border border-[#EFC368]/50 rounded-lg p-3 my-3">
      {/* Effet de brillance animé */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shine" />
      
      <div className="relative flex items-center gap-3">
        {/* Icône pièce d'or animée */}
        <div className="relative flex-shrink-0">
          <span className="text-3xl animate-bounce" style={{ animationDuration: '2s' }}>🪙</span>
          {participations > 1 && (
            <span className="absolute -top-1 -right-1 bg-[#EFC368] text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              x{participations}
            </span>
          )}
        </div>
        
        {/* Texte */}
        <div className="flex-1 min-w-0">
          <p className="text-[#EFC368] font-bold text-sm md:text-base leading-tight">
            🎄 Chasse à la Pièce d&apos;Or
          </p>
          <p className="text-white/80 text-xs md:text-sm">
            {participations === 1 ? (
              <>Ce produit vous donne <span className="text-[#FFD700] font-bold">1 participation</span></>
            ) : (
              <>Ce produit vous donne <span className="text-[#FFD700] font-bold">{participations} participations</span></>
            )}
          </p>
        </div>
        
        {/* Badge prix */}
        <div className="flex-shrink-0 text-right">
          <div className="bg-[#EFC368]/20 rounded-full px-3 py-1 border border-[#EFC368]/40">
            <span className="text-[#FFD700] text-xs font-semibold">
              1 an de CBD à gagner !
            </span>
          </div>
        </div>
      </div>

      {/* Styles d'animation */}
      <style jsx>{`
        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shine {
          animation: shine 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}




