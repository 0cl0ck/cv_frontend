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
  // Log de débogage pour vérifier les propriétés du produit
  console.log(`ProductCard - Produit: ${product.name}`, {
    id: product.id,
    type: product.productType,
    category: product.category,
    weight: product.weight,
    price: product.price,
    pricePerGram: product.pricePerGram
  });
  
  // Utiliser mainImage comme image principale
  const mainImage = product.mainImage;
  // Utiliser la première image de la galerie comme image au survol (si disponible)
  const hoverImage = product.galleryImages?.[0];

  const getImageUrl = (image: Media | undefined): string => {
    if (!image) return '';
    return image.url || '';
  };

  // Fonction pour vérifier si le produit appartient à une catégorie qui utilise le prix par gramme
  const isWeightBasedCategory = () => {
    if (!product.category) return false;
    
    // Récupérer le nom de la catégorie sous forme de texte
    let categoryName = '';
    let categorySlug = '';
    
    if (typeof product.category === 'string') {
      categoryName = product.category;
      categorySlug = product.category;
    } else {
      categoryName = product.category.name || '';
      categorySlug = product.category.slug || '';
    }
    
    // Normaliser pour la comparaison (enlever les accents, mettre en minuscule)
    const normalizedCategoryName = categoryName.toLowerCase();
    const normalizedCategorySlug = categorySlug.toLowerCase();
    
    // Mots-clés de base pour la détection
    const fleurKeywords = ['fleur', 'flower'];
    const resineKeywords = ['resine', 'résine', 'resin'];
    const packKeywords = ['pack', 'lot'];
    
    // Vérifier si l'une des catégories qui nous intéressent est présente
    const isFleurCategory = fleurKeywords.some(keyword => 
      normalizedCategoryName.includes(keyword) || normalizedCategorySlug.includes(keyword)
    );
    
    const isResineCategory = resineKeywords.some(keyword => 
      normalizedCategoryName.includes(keyword) || normalizedCategorySlug.includes(keyword)
    );
    
    const isPackCategory = packKeywords.some(keyword => 
      normalizedCategoryName.includes(keyword) || normalizedCategorySlug.includes(keyword)
    );
    
    const isWeightBased = isFleurCategory || isResineCategory || isPackCategory;
    
    // Log du slug de catégorie pour débogage
    console.log(`IsWeightBasedCategory - Produit: ${product.name}`, {
      categoryRaw: product.category,
      categoryName,
      categorySlug,
      isFleurCategory,
      isResineCategory,
      isPackCategory,
      isWeightBased
    });
    
    return isWeightBased;
  };
  
  // Vérifie si un produit simple a un prix par gramme (déjà calculé ou manuellement défini)
  const hasSimplePricePerGram = () => {
    // Si le produit a un prix par gramme déjà défini
    if (product.pricePerGram && product.pricePerGram > 0) {
      const result = true;
      console.log(`hasSimplePricePerGram (pricePerGram) - ${product.name}:`, { 
        pricePerGram: product.pricePerGram, 
        result 
      });
      return result;
    }
    // Sinon, si on peut calculer le prix par gramme
    if (product.weight && product.weight > 0 && product.price) {
      const result = true;
      console.log(`hasSimplePricePerGram (weight+price) - ${product.name}:`, { 
        weight: product.weight, 
        price: product.price, 
        calculatedPrice: product.price / product.weight,
        result 
      });
      return result;
    }
    // Sinon, on ne peut pas avoir de prix par gramme
    console.log(`hasSimplePricePerGram (false) - ${product.name}:`, { 
      pricePerGram: product.pricePerGram, 
      weight: product.weight,
      price: product.price
    });
    return false;
  };
  
  // Obtient le prix par gramme pour un produit simple
  const getSimplePricePerGram = () => {
    // Utiliser directement la propriété pricePerGram si disponible
    if (product.pricePerGram && product.pricePerGram > 0) {
      console.log(`getSimplePricePerGram (from prop) - ${product.name}:`, product.pricePerGram);
      return product.pricePerGram;
    }
    // Sinon, le calculer si possible
    if (product.weight && product.weight > 0 && product.price) {
      const calculated = product.price / product.weight;
      console.log(`getSimplePricePerGram (calculated) - ${product.name}:`, { 
        weight: product.weight, 
        price: product.price, 
        calculated 
      });
      return calculated;
    }
    console.log(`getSimplePricePerGram (null) - ${product.name}`);
    return null;
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
                {(() => {
                  const isWBC = isWeightBasedCategory();
                  const hasPPG = hasSimplePricePerGram();
                  const simplePrice = product.price ? formatPrice(product.price) : 'Prix sur demande';
                  
                  console.log(`Pricing decision - ${product.name}:`, {
                    isWeightBasedCategory: isWBC,
                    hasSimplePricePerGram: hasPPG,
                    productType: product.productType
                  });
                  
                  if (isWBC && hasPPG) {
                    const ppg = getSimplePricePerGram();
                    console.log(`Final: Price per gram - ${product.name}:`, ppg);
                    return `À partir de ${formatPrice(ppg!)} le gramme`;
                  } else {
                    console.log(`Final: Simple price - ${product.name}:`, product.price);
                    return simplePrice;
                  }
                })()
              }
              </span>
              {typeof product.stock === 'number' && product.stock <= 0 && (
                <span className="text-sm text-red-500">Rupture de stock</span>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-primary">
                {product.variants && product.variants.length > 0 ? (
                  isWeightBasedCategory() || product.variants.some(v => v.pricePerGram !== undefined || v.weight) ? (
                    /* Si pricePerGram est déjà défini dans les variants */
                    product.variants.some(v => v.pricePerGram !== undefined) ? (
                      `À partir de ${formatPrice(
                        Math.min(...product.variants
                          .filter(v => v.pricePerGram !== undefined && v.pricePerGram > 0)
                          .map(v => v.pricePerGram!))
                      )} le gramme`
                    ) : (
                      /* Si pricePerGram n'est pas défini mais weight l'est, on le calcule */
                      product.variants.some(v => v.weight !== undefined) ? (
                        `À partir de ${formatPrice(
                          Math.min(...product.variants
                            .filter(v => v.weight && v.weight > 0)
                            .map(v => v.price / v.weight!))
                        )} le gramme`
                      ) : (
                        /* Fallback vers l'ancien affichage si pas de poids disponible */
                        `À partir de ${formatPrice(
                          Math.min(...product.variants.map((v) => v.price))
                        )}`
                      )
                    )
                  ) : (
                    /* Pour les catégories qui n'utilisent pas le prix par gramme */
                    `À partir de ${formatPrice(
                      Math.min(...product.variants.map((v) => v.price))
                    )}`
                  )
                ) : 'Prix sur demande'}
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
