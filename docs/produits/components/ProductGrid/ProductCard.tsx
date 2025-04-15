'use client';

import { formatPrice } from '@/lib/utils';
import { Media, Product } from '@/payload-types';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

type Props = {
  product: Product;
  index: number;
};

export const ProductCard: React.FC<Props> = ({ product, index }) => {
  const mainImage = product.images?.[0];
  const hoverImage = product.images?.[1];

  const getImageUrl = (image: Media | string | undefined): string => {
    if (!image) return '';
    if (typeof image === 'string') return image;
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
        {product.featured && (
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
              {product.category.map((cat) => (
                <span
                  key={typeof cat === 'string' ? cat : cat.id}
                  className="text-sm text-neutral-600 dark:text-neutral-400"
                >
                  {typeof cat === 'string' ? cat : cat.name}
                </span>
              ))}
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
                {product.variations && product.variations.length > 0
                  ? `À partir de ${formatPrice(
                      Math.min(...product.variations.map((v) => v.price)),
                    )}`
                  : 'Prix sur demande'}
              </span>
              {product.variations &&
                product.variations.every((v) => typeof v.stock === 'number' && v.stock <= 0) && (
                  <span className="text-sm text-red-500">Rupture de stock</span>
                )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
