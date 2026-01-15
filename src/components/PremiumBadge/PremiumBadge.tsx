'use client';

import React from 'react';
import { QualityTier } from '@/types/product';

type Props = {
  tier: QualityTier;
  className?: string;
};

/**
 * Badge Premium avec effet doré scintillant
 * Affiché sur les ProductCards pour les produits Premium ou Édition Limitée
 */
export const PremiumBadge: React.FC<Props> = ({ tier, className = '' }) => {
  if (tier === 'standard') return null;

  const isPremium = tier === 'premium';
  const isLimited = tier === 'limited-edition';

  return (
    <div
      className={`premium-badge relative overflow-hidden px-2 py-1 text-xs font-bold uppercase tracking-wide md:px-3 md:py-1.5 md:text-sm ${className}`}
      style={{
        background: isPremium
          ? 'linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%)'
          : 'linear-gradient(135deg, #9B59B6 0%, #E8DAEF 50%, #9B59B6 100%)',
        color: isPremium ? '#1A1A1A' : '#1A1A1A',
        boxShadow: isPremium
          ? '0 2px 8px rgba(212, 175, 55, 0.4)'
          : '0 2px 8px rgba(155, 89, 182, 0.4)',
      }}
    >
      {/* Shimmer effect overlay */}
      <div
        className="absolute inset-0 -translate-x-full animate-shimmer"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
        }}
      />
      
      {/* Badge content */}
      <span className="relative z-10 flex items-center gap-1">
        {isPremium && <span>⭐</span>}
        {isLimited && <span>💎</span>}
        <span className="hidden md:inline">
          {isPremium ? 'Premium' : 'Édition Limitée'}
        </span>
        <span className="inline md:hidden">
          {isPremium ? 'Premium' : 'Limitée'}
        </span>
      </span>
    </div>
  );
};

export default PremiumBadge;
