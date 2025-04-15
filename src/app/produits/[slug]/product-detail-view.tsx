'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Category, Media, Product, ProductVariation, RichTextContent } from '@/types/product';
import { formatPrice } from '@/lib/utils';
import { ProductCard } from '@/components/ProductCard/ProductCard';
import Link from 'next/link';

type Props = {
  product: Product;
  relatedProducts: Product[];
  categories: Category[];
};

export default function ProductDetailView({ product, relatedProducts, categories }: Props) {
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  const [mainImage, setMainImage] = useState<Media | string | undefined>(product.mainImage || (product.galleryImages && product.galleryImages.length > 0 ? product.galleryImages[0] : undefined));
  const [quantity, setQuantity] = useState(1);

  // Formater les catégories pour l'affichage
  const categoryDisplay: Category[] = [];
  
  if (product.category) {
    // Si category est un tableau
    if (Array.isArray(product.category)) {
      product.category.forEach((cat) => {
        if (typeof cat === 'string') {
          const foundCat = categories.find((c) => c.id === cat);
          if (foundCat) categoryDisplay.push(foundCat);
        } else {
          categoryDisplay.push(cat);
        }
      });
    }
    // Si category est une seule catégorie (string ou object)
    else {
      if (typeof product.category === 'string') {
        const foundCat = categories.find((c) => c.id === product.category);
        if (foundCat) categoryDisplay.push(foundCat);
      } else {
        categoryDisplay.push(product.category);
      }
    }
  }

  // Récupérer l'URL de l'image
  const getImageUrl = (image: Media | string | undefined): string => {
    if (!image) return '';
    if (typeof image === 'string') return image;
    return image.url || '';
  };

  // Gérer la sélection d'une variation
  const handleVariationChange = (variation: ProductVariation) => {
    setSelectedVariation(variation);
  };

  // Gérer le changement de quantité
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  // Vérifier si le produit ou la variation sélectionnée est en stock
  const isInStock = (): boolean => {
    if (product.productType === 'variable' && selectedVariation) {
      return selectedVariation.stock === undefined || selectedVariation.stock > 0;
    }
    return product.stock === undefined || product.stock > 0;
  };

  // Calculer le prix actuel
  const currentPrice = (): number | null => {
    if (product.productType === 'variable' && selectedVariation) {
      return selectedVariation.price;
    }
    return product.price ?? null;
  };

  return (
    <div className="bg-neutral-50 dark:bg-neutral-950 py-12">
      <div className="container mx-auto px-4">
        {/* Chemin de navigation */}
        <nav className="mb-8 text-sm">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/" className="text-neutral-600 hover:text-primary dark:text-neutral-400">
                Accueil
              </Link>
            </li>
            <li className="text-neutral-400 dark:text-neutral-600">/</li>
            <li>
              <Link href="/produits" className="text-neutral-600 hover:text-primary dark:text-neutral-400">
                Produits
              </Link>
            </li>
            {categoryDisplay.length > 0 && (
              <>
                <li className="text-neutral-400 dark:text-neutral-600">/</li>
                <li>
                  <Link
                    href={`/produits/categorie/${(categoryDisplay[0] as Category).slug}`}
                    className="text-neutral-600 hover:text-primary dark:text-neutral-400"
                  >
                    {(categoryDisplay[0] as Category).name}
                  </Link>
                </li>
              </>
            )}
            <li className="text-neutral-400 dark:text-neutral-600">/</li>
            <li className="text-primary font-medium">{product.name}</li>
          </ol>
        </nav>

        <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-md overflow-hidden">
          <div className="md:flex">
            {/* Galerie d'images */}
            <div className="md:w-1/2 p-6">
              <div className="relative aspect-square mb-4 rounded-lg overflow-hidden">
                {mainImage && (
                  <Image
                    src={getImageUrl(mainImage)}
                    alt={product.name}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                    priority
                  />
                )}
              </div>

              {/* Thumbnails */}
              {product.galleryImages && product.galleryImages.length > 1 && (
                <div className="flex gap-2 mt-4">
                  {product.galleryImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setMainImage(image)}
                      className={`relative w-20 h-20 rounded-md overflow-hidden border-2 ${
                        mainImage === image
                          ? 'border-primary'
                          : 'border-neutral-200 dark:border-neutral-700'
                      }`}
                    >
                      <Image
                        src={getImageUrl(image)}
                        alt={`${product.name} - Image ${index + 1}`}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Informations produit */}
            <div className="md:w-1/2 p-6 md:border-l border-neutral-200 dark:border-neutral-800">
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">{product.name}</h1>

              {/* Catégories */}
              {categoryDisplay.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {categoryDisplay.map((cat, index) => (
                    <Link
                      key={index}
                      href={`/produits/categorie/${(cat as Category).slug}`}
                      className="inline-block px-3 py-1 text-sm bg-neutral-100 dark:bg-neutral-800 rounded-full text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                    >
                      {(cat as Category).name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Prix */}
              <div className="mb-6">
                {product.productType === 'variable' ? (
                  <div className="text-2xl font-bold text-primary">
                    {selectedVariation ? formatPrice(selectedVariation.price) : 'Sélectionnez une option'}
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-primary">
                    {product.price ? formatPrice(product.price) : 'Prix sur demande'}
                  </div>
                )}
              </div>

              {/* Description courte */}
              {product.description && (
                <div className="mb-6 text-neutral-700 dark:text-neutral-300">
                  {typeof product.description === 'string' 
                    ? product.description 
                    : 'Découvrez ce produit de qualité'}
                </div>
              )}

              {/* Sélection de variation */}
              {product.productType === 'variable' && product.variants && product.variants.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Options
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variation: ProductVariation) => (
                      <button
                        key={variation.id}
                        onClick={() => handleVariationChange(variation)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          selectedVariation?.id === variation.id
                            ? 'bg-primary text-white'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                        } ${
                          variation.stock !== undefined && variation.stock <= 0
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                        }`}
                        disabled={variation.stock !== undefined && variation.stock <= 0}
                      >
                        {variation.weight ? `${variation.weight}g` : `Option ${variation.id}`}
                        {variation.stock !== undefined && variation.stock <= 0 && ' (Épuisé)'}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sélection de quantité et ajout au panier */}
              <div className="flex items-center mb-6">
                <div className="flex items-center border border-neutral-300 dark:border-neutral-700 rounded-md mr-4">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="px-3 py-2 text-neutral-700 dark:text-neutral-300 disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="px-3 py-2 text-neutral-900 dark:text-white">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="px-3 py-2 text-neutral-700 dark:text-neutral-300"
                  >
                    +
                  </button>
                </div>

                <button
                  disabled={!isInStock()}
                  className={`flex-1 px-6 py-3 rounded-md font-medium text-white transition-colors ${
                    isInStock()
                      ? 'bg-primary hover:bg-primary-dark'
                      : 'bg-neutral-400 cursor-not-allowed'
                  }`}
                >
                  {isInStock() ? 'Ajouter au panier' : 'Produit épuisé'}
                </button>
              </div>

              {/* Informations supplémentaires */}
              <div className="border-t border-neutral-200 dark:border-neutral-800 pt-6 mt-6">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-white mb-4">
                  Informations produit
                </h2>
                {product.productType === 'simple' && typeof product.stock === 'number' && (
                  <div className="mb-2 flex items-center">
                    <span className="text-sm text-neutral-700 dark:text-neutral-300 mr-2">Disponibilité:</span>
                    <span
                      className={`text-sm font-medium ${
                        product.stock > 0 ? 'text-green-600' : 'text-red-500'
                      }`}
                    >
                      {product.stock > 0 ? 'En stock' : 'Rupture de stock'}
                    </span>
                  </div>
                )}
                <div className="mb-2 flex items-center">
                  <span className="text-sm text-neutral-700 dark:text-neutral-300 mr-2">Références:</span>
                  <span className="text-sm text-neutral-900 dark:text-white">
                    ID: {product.id}
                  </span>
                </div>
                {product.category && Array.isArray(product.category) && product.category.length > 0 && (
                  <div className="mb-2 flex items-center">
                    <span className="text-sm text-neutral-700 dark:text-neutral-300 mr-2">Catégorie:</span>
                    <span className="text-sm text-neutral-900 dark:text-white">
                      {categoryDisplay
                        .map((cat: Category) => cat.name)
                        .join(', ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description détaillée */}
          {product.description && (
            <div className="p-6 border-t border-neutral-200 dark:border-neutral-800">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">Description</h2>
              <div className="prose dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300">
                {typeof product.description === 'string' 
                  ? product.description 
                  : 'Découvrez ce produit de qualité'}
              </div>
            </div>
          )}
        </div>

        {/* Produits similaires */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-8">Produits similaires</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct, index) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} index={index} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
