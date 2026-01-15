'use client';

import React, { useEffect, useRef, useState } from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
  autoAnimate?: boolean;
};

/**
 * GlareCard - Effet holographique style carte Pokémon
 * Auto-animation du reflet qui tourne autour de la carte
 */
export const GlareCard: React.FC<Props> = ({ 
  children, 
  className = '',
  autoAnimate = true 
}) => {
  const glareRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Wait for component to mount
  useEffect(() => {
    setIsMounted(true);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Start animation after mount
  useEffect(() => {
    if (!isMounted || !autoAnimate) return;
    
    let angle = 0;
    
    const animate = () => {
      angle = (angle + 0.8) % 360;
      const rad = (angle * Math.PI) / 180;
      
      // Glare position moves around the card
      const glareX = 50 + Math.cos(rad) * 50;
      const glareY = 50 + Math.sin(rad) * 50;
      
      if (glareRef.current) {
        glareRef.current.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255, 255, 255, 0.12) 0%, rgba(212, 175, 55, 0.08) 20%, transparent 50%)`;
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isMounted, autoAnimate]);

  return (
    <div className={`glare-card-wrapper relative ${className}`}>
      {/* Golden border - subtle, optimized (no repaint, just composite layer) */}
      <div 
        className="absolute inset-0 rounded-lg pointer-events-none z-40"
        style={{
          boxShadow: '0 0 15px rgba(212, 175, 55, 0.2)',
          border: '2px solid rgba(212, 175, 55, 0.45)',
          borderRadius: '0.5rem',
        }}
      />
      
      {/* Glare overlay */}
      <div
        ref={glareRef}
        className="pointer-events-none absolute inset-0 z-30 rounded-lg"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.12) 0%, rgba(212, 175, 55, 0.08) 20%, transparent 50%)',
        }}
      />
      
      {/* Content - rendered as-is */}
      {children}
    </div>
  );
};

export default GlareCard;


