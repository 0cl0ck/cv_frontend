'use client';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';

export const Card = React.memo(
  ({
    card,
    index,
    hovered,
    setHovered,
    isMobile,
  }: {
    card: Card;
    index: number;
    hovered: number | null;
    setHovered: React.Dispatch<React.SetStateAction<number | null>>;
    isMobile: boolean;
  }) => {
    const CardContent = () => (
      <div
        className={cn(
          'rounded-lg relative overflow-hidden w-full',
          // Style desktop
          'md:h-96',
          // Transitions douces
          'transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]',
          hovered !== null && !isMobile && hovered !== index && 'blur-[2px] scale-[0.98] opacity-85',
          // Style mobile
          'h-40 mb-4 md:mb-0',
        )}
      >
        {card.src && (
          <Image
            src={card.src}
            alt={card.title}
            sizes="(max-width: 768px) 100vw, 33vw"
            fill
            className={cn(
              'object-cover absolute inset-0',
              !isMobile && 'transition-transform duration-1000 ease-[cubic-bezier(0.25,0.1,0.25,1)] hover:scale-105',
              !isMobile && hovered === index && 'scale-105',
            )}
          />
        )}
        <div
          className={cn(
            'absolute inset-0 flex items-end py-4 px-4',
            'bg-black/30',
            // Style desktop
            'md:bg-black/50 md:py-8',
            // Gestion de l'opacité sur desktop uniquement
            'transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]',
            !isMobile && 'md:opacity-0',
            !isMobile && hovered === index && 'md:opacity-100',
          )}
        >
          <div className="text-lg md:text-2xl font-medium text-white">{card.title}</div>
        </div>
      </div>
    );

    return (
      <div
        className="w-full transition-all duration-700 ease-[cubic-bezier(0.25,0.1,0.25,1)]"
        onMouseEnter={() => !isMobile && setHovered(index)}
        onMouseLeave={() => !isMobile && setHovered(null)}
      >
        {card.href ? (
          <Link href={card.href}>
            <CardContent />
          </Link>
        ) : (
          <CardContent />
        )}
      </div>
    );
  },
);

Card.displayName = 'Card';

export type Card = {
  title: string;
  src: string | null | undefined;
  href?: string;
};

export function FocusCards({ cards }: { cards: Card[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Détection du mobile
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div
      className={cn(
        'w-full mx-auto px-4',
        // Layout desktop
        'md:grid md:grid-cols-3 md:gap-10 md:max-w-5xl md:px-8',
        // Layout mobile
        'flex flex-col',
      )}
    >
      {cards.map((card, index) => (
        <Card
          key={card.title}
          card={card}
          index={index}
          hovered={hovered}
          setHovered={setHovered}
          isMobile={isMobile}
        />
      ))}
    </div>
  );
}

