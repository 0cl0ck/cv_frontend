'use client';

import React from 'react';
import Image from 'next/image';
import { Media } from '@/types/product';

type ProductImageProps = {
  mainImage: Media | undefined;
  hoverImage: Media | undefined;
  productName: string;
  isHovered: boolean;
  showFeaturedBadge?: boolean;
  index: number;
};

export default function ProductImage({
  mainImage,
  hoverImage,
  productName,
  isHovered,
  showFeaturedBadge = false,
  index
}: ProductImageProps) {
  const getImageUrl = (image: Media | undefined): string => {
    if (!image) return '';
    return image.url || '';
  };

  // Calculate loading priority - prioritize first few products for LCP optimization
  const shouldPrioritize = index < 3;
  
  return (
    <div className="relative overflow-hidden aspect-square w-full mb-2">
      {/* Image principale */}
      <Image
        src={getImageUrl(mainImage) || '/placeholder-product.png'}
        alt={productName}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className={`object-cover transition-opacity duration-300 ${
          isHovered && hoverImage ? 'opacity-0' : 'opacity-100'
        }`}
        priority={shouldPrioritize}
        loading={shouldPrioritize ? 'eager' : 'lazy'}
      />
      
      {/* Image au survol (si disponible) */}
      {hoverImage && (
        <Image
          src={getImageUrl(hoverImage)}
          alt={`${productName} - image alternative`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={`object-cover transition-opacity duration-300 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
        />
      )}
      
      {/* Badge "En rupture" - Supprimé car redondant avec le bouton */}
      
      {/* Badge "Produit vedette" */}
      {showFeaturedBadge && (
        <div className="absolute top-0 right-0 bg-[#EFC368] text-black text-xs px-2 py-1">
          Produit vedette
        </div>
      )}
    </div>
  );
}
