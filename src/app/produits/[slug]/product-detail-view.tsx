'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Category, Media, Product, ProductVariation } from '@/types/product';
import { formatPrice } from '@/lib/utils';
import { ProductCard } from '@/components/ProductCard/ProductCard';
import Link from 'next/link';
import { useCartContext } from '@/context/CartContext';
import { RichTextRenderer } from '@/components/RichTextRenderer/RichTextRenderer';
import { ProductReviews } from '@/components/Reviews';

type Props = {
  product: Product;
  relatedProducts: Product[];
  categories: Category[];
};

// Les fonctions extractDescription et extractTextFromRichTextNodes ont été remplacées par le composant RichTextRenderer

export default function ProductDetailView({ product, relatedProducts, categories }: Props) {

  const { addItem, updateQuantity, cart } = useCartContext();
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | null>(
    product.variants && product.variants.length > 0 ? product.variants[0] : null
  );
  const [mainImage, setMainImage] = useState<Media | string | undefined>(product.mainImage || (product.galleryImages && product.galleryImages.length > 0 ? product.galleryImages[0] : undefined));
  const [quantity, setQuantity] = useState(1);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

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
  
  // Gérer l'ajout au panier - VERSION ULTRASIMPLE pour résoudre définitivement le problème
  const handleAddToCart = () => {
    // Sécurité de base : n'exécuter que si le bouton n'est pas déjà désactivé
    if (!isInStock() || isAddingToCart) {
      return;
    }
    
    // Désactiver le bouton immédiatement pour éviter tout problème
    setIsAddingToCart(true);
    
    try {
      // Approche directe : trouver le produit existant ou ajouter un nouveau
      const existingItemIndex = cart.items.findIndex(item => 
        item.productId === product.id && 
        (!selectedVariation || item.variantId === selectedVariation.id)
      );
      
      // Utiliser directement updateQuantity ou addItem pour simplicité maximale
      if (existingItemIndex !== -1) {
        // Produit existant : mettre à jour la quantité
        const currentQty = cart.items[existingItemIndex].quantity;
        updateQuantity(existingItemIndex, currentQty + quantity);
      } else {
        // Nouveau produit : ajouter au panier avec quantité exacte
        addItem(product, quantity, selectedVariation || undefined);
      }
      
      // Confirmer visuellement l'action réussie
      setIsAddedToCart(true);
    } catch (error) {
      console.error("Erreur lors de l'ajout au panier:", error);
    } finally {
      // Toujours réactiver le bouton et masquer la confirmation après délai
      setTimeout(() => setIsAddingToCart(false), 500);
      setTimeout(() => setIsAddedToCart(false), 2000);
    }
  };

  // Vérifier si le produit ou la variation sélectionnée est en stock
  const isInStock = (): boolean => {
    if (product.productType === 'variable' && selectedVariation) {
      return selectedVariation.stock === undefined || selectedVariation.stock > 0;
    }
    return product.stock === undefined || product.stock > 0;
  };

  // Calculer le prix actuel - fonction définie mais non utilisée actuellement
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const currentPrice = (): number | null => {
    if (product.productType === 'variable' && selectedVariation) {
      return selectedVariation.price;
    }
    return product.price ?? null;
  };

  return (
    <div className="bg-[#001E27] py-12">
      <div className="container mx-auto px-4">
        {/* Chemin de navigation */}
        <nav className="mb-8 text-sm">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/" className="text-[#F4F8F5] hover:text-[#EFC368]">
                Accueil
              </Link>
            </li>
            <li className="text-[#3A4A4F]">/</li>
            <li>
              <Link href="/produits" className="text-[#F4F8F5] hover:text-[#EFC368]">
                Produits
              </Link>
            </li>
            {categoryDisplay.length > 0 && (
              <>
                <li className="text-[#3A4A4F]">/</li>
                <li>
                  <Link
                    href={`/produits/categorie/${(categoryDisplay[0] as Category).slug}`}
                    className="text-[#F4F8F5] hover:text-[#EFC368]"
                  >
                    {(categoryDisplay[0] as Category).name}
                  </Link>
                </li>
              </>
            )}
            <li className="text-[#3A4A4F]">/</li>
            <li className="text-[#03745C] font-medium">{product.name}</li>
          </ol>
        </nav>

        <div className="bg-[#002935] rounded-xl shadow-md overflow-hidden border border-[#3A4A4F]">
          <div className="md:flex md:items-center ">
            {/* Galerie d'images */}
            <div className="md:w-1/2 p-6">
              <div className="relative aspect-square mb-4 rounded-lg overflow-hidden border border-[#3A4A4F]">
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
                          ? 'border-[#03745C]'
                          : 'border-[#3A4A4F]'
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
            <div className="md:w-1/2 p-6 md:border-l border-[#3A4A4F]">
              <h1 className="text-3xl font-bold text-[#F4F8F5] mb-4">{product.name}</h1>

              {/* Catégories */}
              {categoryDisplay.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {categoryDisplay.map((cat, index) => (
                    <Link
                      key={index}
                      href={`/produits/categorie/${(cat as Category).slug}`}
                      className="inline-block px-3 py-1 text-sm bg-[#3A4A4F] rounded-full text-[#F4F8F5] hover:bg-[#014842] transition-colors"
                    >
                      {(cat as Category).name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Prix */}
              <div className="mb-6">
                {product.productType === 'variable' ? (
                  <div className="text-2xl font-bold text-[#EFC368]">
                    {selectedVariation ? formatPrice(selectedVariation.price) : 'Sélectionnez une option'}
                  </div>
                ) : (
                  <div className="text-2xl font-bold text-[#EFC368]">
                    {product.price ? formatPrice(product.price) : 'Prix sur demande'}
                  </div>
                )}
              </div>

              {/* Description courte */}
              {product.description && (
                <div className='mb-6'>
                  <div className="prose prose-invert !text-white prose-p:text-white prose-headings:text-white prose-li:text-white prose-strong:text-white">
                    <RichTextRenderer content={product.description} />
                  </div>
                </div>
              )}

              {/* Sélection de variation */}
              {product.productType === 'variable' && product.variants && product.variants.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-[#F4F8F5] mb-2">
                    Options
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variation: ProductVariation) => (
                      <button
                        key={variation.id}
                        onClick={() => handleVariationChange(variation)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          selectedVariation?.id === variation.id
                            ? 'bg-[#03745C] text-[#F4F8F5]'
                            : 'bg-[#3A4A4F] text-[#F4F8F5] hover:bg-[#014842]'
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
                <div className="flex items-center border border-[#3A4A4F] rounded-md mr-4">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="px-3 py-2 text-[#F4F8F5] disabled:opacity-50"
                  >
                    -
                  </button>
                  <span className="px-3 py-2 text-[#F4F8F5]">{quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    className="px-3 py-2 text-[#F4F8F5]"
                  >
                    +
                  </button>
                </div>

                <button
                  disabled={!isInStock() || isAddingToCart}
                  onPointerDown={handleAddToCart} 
                  className={`flex-1 px-6 py-3 rounded-md font-medium transition-colors ${
                    isInStock() && !isAddingToCart
                      ? 'bg-[#EFC368] hover:bg-[#D3A74F] text-[#001E27]'
                      : 'bg-[#3A4A4F] text-[#F4F8F5] cursor-not-allowed'
                  }`}
                >
                  {isAddedToCart 
                    ? 'Produit ajouté ✓' 
                    : isAddingToCart 
                      ? 'Ajout en cours...' 
                      : isInStock() 
                        ? 'Ajouter au panier' 
                        : 'Produit épuisé'}
                </button>
              </div>

              {/* Informations supplémentaires */}
              <div className="border-t border-[#3A4A4F] pt-6 mt-6">
                <h2 className="text-lg font-semibold text-[#F4F8F5] mb-4">
                  Informations produit
                </h2>
                {product.productType === 'simple' && typeof product.stock === 'number' && (
                  <div className="mb-2 flex items-center">
                    <span className="text-sm text-[#F4F8F5] mr-2">Disponibilité:</span>
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
                  {/* <span className="text-sm text-neutral-700 dark:text-neutral-300 mr-2">Références:</span> */}
                  {/* <span className="text-sm text-neutral-900 dark:text-white">
                    ID: {product.id}
                  </span> */}
                </div>
                {product.category && Array.isArray(product.category) && product.category.length > 0 && (
                  <div className="mb-2 flex items-center">
                    <span className="text-sm text-[#F4F8F5] mr-2">Catégorie:</span>
                    <span className="text-sm text-[#F4F8F5]">
                      {categoryDisplay
                        .map((cat: Category) => cat.name)
                        .join(', ')}
                    </span>
                  </div>
                )}
                
                {/* Détails du produit (Taux CBD, THC, etc.) */}
                {product.productDetails && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    {/* Taux de CBD */}
                    {product.productDetails && typeof product.productDetails.cbdContent === 'number' && (
                      <div className="flex items-center">
                        <span className="text-sm text-[#F4F8F5] mr-2">Taux de CBD:</span>
                        <span className="text-sm font-medium text-[#F4F8F5]">
                          {product.productDetails.cbdContent}%
                        </span>
                      </div>
                    )}
                    
                    {/* Taux de THC */}
                    {product.productDetails && typeof product.productDetails.thcContent === 'number' && (
                      <div className="flex items-center">
                        <span className="text-sm text-[#F4F8F5] mr-2">Taux de THC:</span>
                        <span className="text-sm font-medium text-[#F4F8F5]">
                          {product.productDetails.thcContent}%
                        </span>
                      </div>
                    )}
                    
                    {/* Type de souche */}
                    {product.productDetails && typeof product.productDetails.strain === 'string' && product.productDetails.strain !== 'na' && (
                      <div className="flex items-center">
                        <span className="text-sm text-[#F4F8F5] mr-2">Type de souche:</span>
                        <span className="text-sm font-medium text-[#F4F8F5]">
                          {({
                            'sativa': 'Sativa',
                            'indica': 'Indica',
                            'hybrid': 'Hybride'
                          } as Record<string, string>)[product.productDetails.strain] || product.productDetails.strain}
                        </span>
                      </div>
                    )}
                    
                    {/* Origine */}
                    {product.productDetails && typeof product.productDetails.origin === 'string' && (
                      <div className="flex items-center">
                        <span className="text-sm text-[#F4F8F5] mr-2">Origine:</span>
                        <span className="text-sm font-medium text-[#F4F8F5]">
                          {product.productDetails.origin}
                        </span>
                      </div>
                    )}
                    
                    {/* Mode de culture */}
                    {product.productDetails && typeof product.productDetails.cultivation === 'string' && (
                      <div className="flex items-center">
                        <span className="text-sm text-[#F4F8F5] mr-2">Mode de culture:</span>
                        <span className="text-sm font-medium text-[#F4F8F5]">
                          {({
                            'indoor': 'Indoor',
                            'outdoor': 'Outdoor',
                            'greenhouse': 'Greenhouse'
                          } as Record<string, string>)[product.productDetails.cultivation] || product.productDetails.cultivation}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* La description détaillée a été retirée pour éviter la redondance */}
        </div>

        {/* Section des avis clients */}
        <div className="mt-16 pt-12 border-t border-[#3A4A4F]">
          <ProductReviews 
            productId={product.id} 
            initialStats={product.reviewStats} 
          />
        </div>
        
        {/* Produits similaires */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-[#3A4A4F]">
            <h2 className="text-2xl font-bold text-[#F4F8F5] mb-8">Produits similaires</h2>
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
