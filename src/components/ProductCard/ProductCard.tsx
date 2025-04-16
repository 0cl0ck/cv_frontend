'use client';

import { formatPrice } from '@/lib/utils';
import { Media, Product } from '@/types/product';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

type Props = {
  product: Product;
  index: number;
  showFeaturedBadge?: boolean; // Prop optionnel pour contrôler l'affichage du badge
};

export const ProductCard: React.FC<Props> = ({ product, index, showFeaturedBadge = true }) => {
  // Utiliser mainImage comme image principale
  const mainImage = product.mainImage;
  // Utiliser la première image de la galerie comme image au survol (si disponible)
  const hoverImage = product.galleryImages?.[0];

  const getImageUrl = (image: Media | undefined): string => {
    if (!image) return '';
    return image.url || '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-md transition-all hover:shadow-lg dark:bg-neutral-900"
    >
      <Link href={`/produits/${product.slug}`} className="relative aspect-square overflow-hidden">
        {mainImage && (
          <>
            <Image
              src={getImageUrl(mainImage)}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              priority={index < 4}
            />
            {hoverImage && (
              <Image
                src={getImageUrl(hoverImage)}
                alt={`${product.name} - Image secondaire`}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
                className="absolute inset-0 object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              />
            )}
          </>
        )}
        {product.isFeatured && showFeaturedBadge && (
          <span className="absolute left-2 top-2 rounded-full bg-primary px-3 py-1 text-xs font-medium text-white">
            Produit vedette
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link href={`/produits/${product.slug}`} className="mb-2 flex-1">
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{product.name}</h3>
          {product.category && (
            <div className="mt-1 flex flex-wrap gap-1">
              <span
                className="text-sm text-neutral-600 dark:text-neutral-400"
              >
                {typeof product.category === 'string' 
                  ? product.category 
                  : product.category.name}
              </span>
            </div>
          )}
        </Link>

        <div className="mt-2">
          {product.productType === 'simple' ? (
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-primary">
                {product.price ? formatPrice(product.price) : 'Prix sur demande'}
              </span>
              {typeof product.stock === 'number' && product.stock <= 0 && (
                <span className="text-sm text-red-500">Rupture de stock</span>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-primary">
                {product.variants && product.variants.length > 0
                  ? `À partir de ${formatPrice(
                      Math.min(...product.variants.map((v) => v.price)),
                    )}`
                  : 'Prix sur demande'}
              </span>
              {product.variants &&
                product.variants.every((v) => typeof v.stock === 'number' && v.stock <= 0) && (
                  <span className="text-sm text-red-500">Rupture de stock</span>
                )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
