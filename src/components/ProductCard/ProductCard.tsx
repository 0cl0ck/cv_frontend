'use client';

import { formatPrice } from '@/utils/utils';
import { Media, Product, ProductVariation } from '@/types/product';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useRef, useEffect } from 'react';
import { useCartContext } from '@/context/CartContext';
import { ChevronDown, ShoppingCart } from 'lucide-react';

type Props = {
  product: Product;
  index: number;
  showFeaturedBadge?: boolean; // Prop optionnel pour contrôler l'affichage du badge (n'est pas utilisé dans ce composant actuellement)
};

export const ProductCard: React.FC<Props> = ({ product, index, showFeaturedBadge }) => {
  // État pour gérer le survol
  const [isHovered, setIsHovered] = useState(false);
  // État pour gérer l'ouverture du menu déroulant
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  // État pour la variante sélectionnée
  const [selectedVariant, setSelectedVariant] = useState<ProductVariation | null>(null);
  // Référence pour le menu déroulant (pour la fermeture au clic extérieur)
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Contexte du panier
  const { addItem } = useCartContext();
  
  // Utiliser mainImage comme image principale
  const mainImage = product.mainImage;
  // Utiliser la première image de la galerie comme image au survol (si disponible)
  const hoverImage = product.galleryImages?.[0];
  
  // Initialiser la variante sélectionnée au chargement
  useEffect(() => {
    if (product.productType === 'variable' && product.variants && product.variants.length > 0) {
      // Sélectionner par défaut la première variante active avec du stock
      const activeVariant = product.variants.find(v => v.isActive !== false && (v.stock === undefined || v.stock > 0));
      setSelectedVariant(activeVariant || product.variants[0]);
    }
  }, [product]);
  
  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
    
    return isWeightBased;
  };
  
  // Le calcul du prix par gramme est directement intégré dans formatVariantLabel

  // Fonction pour formater l'affichage d'une variante
  const formatVariantLabel = (variant: ProductVariation) => {
    if (variant.weight && variant.pricePerGram) {
      return `${variant.weight}G (${formatPrice(variant.pricePerGram)}/g)`;
    } else if (variant.weight) {
      // Calculer le prix par gramme si non défini
      const calculatedPricePerGram = variant.price / variant.weight;
      return `${variant.weight}G (${formatPrice(calculatedPricePerGram)}/g)`;
    }
    return formatPrice(variant.price);
  };
  
  // Fonction pour ajouter au panier
  const handleAddToCart = () => {
    if (product.productType === 'simple') {
      addItem(product, 1);
    } else if (selectedVariant) {
      addItem(product, 1, selectedVariant);
    }
  };
  
  // Déterminer si le produit est en rupture de stock
  const isOutOfStock = () => {
    if (product.productType === 'simple') {
      return typeof product.stock === 'number' && product.stock <= 0;
    }
    
    if (!product.variants || product.variants.length === 0) return false;
    
    if (selectedVariant) {
      return typeof selectedVariant.stock === 'number' && selectedVariant.stock <= 0;
    }
    
    return product.variants.every(v => typeof v.stock === 'number' && v.stock <= 0);
  };

  return (
    <div 
      className="product-card group relative flex h-full flex-col rounded-lg bg-background shadow-sm transition-all hover:shadow-md hover:scale-105"
      style={{ 
        opacity: 1,
        transform: `translateY(0)`,
        animationDelay: `${index * 100}ms`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Badges */}
      <div className="absolute left-0 top-2 z-10 flex flex-col gap-2">
        {showFeaturedBadge && product.isFeatured && (
          <div className="px-3 py-1.5 text-sm font-semibold text-black" style={{ backgroundColor: '#EFC368' }}>
            BEST-SELLER
          </div>
        )}
        {isWeightBasedCategory() && product.productDetails && typeof product.productDetails === 'object' && 'cultivation' in product.productDetails && (
          <div className="px-3 py-1.5 text-sm font-medium text-black" style={{ backgroundColor: '#EFC368' }}>
            {String(product.productDetails.cultivation).charAt(0).toUpperCase() + String(product.productDetails.cultivation).slice(1)}
          </div>
        )}
      </div>
      
      {/* Badge CBD */}
      {typeof product.productDetails === 'object' && product.productDetails && 'cbdContent' in product.productDetails && (
        <div className="absolute right-0 top-2 z-10 px-3 py-1.5 text-sm font-semibold text-black" style={{ backgroundColor: '#EFC368' }}>
          {String(product.productDetails.cbdContent)}% CBD
        </div>
      )}
      
      <div className="relative aspect-square overflow-hidden">
        <Link href={`/produits/${product.slug}`} className="block h-full w-full">
          {/* Image principale */}
          <div
            className="absolute inset-0 h-full w-full transition-opacity duration-300"
            style={{ opacity: isHovered && hoverImage ? 0 : 1 }}
          >
            {mainImage?.url ? (
              <Image
                src={getImageUrl(mainImage)}
                alt={product.name}
                className="h-full w-full object-cover"
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                priority={index < 4}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-neutral-100">
                <span className="text-sm text-gray-500">Image non disponible</span>
              </div>
            )}
          </div>

          {/* Image secondaire (au survol) */}
          {hoverImage?.url && (
            <div
              className="absolute inset-0 h-full w-full transition-opacity duration-300"
              style={{ opacity: isHovered ? 1 : 0 }}
            >
              <Image
                src={getImageUrl(hoverImage)}
                alt={`${product.name} - vue alternative`}
                className="h-full w-full object-cover"
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
          )}
        </Link>
      </div>

      <div 
        className="flex flex-col flex-grow p-4 text-white transition-colors duration-300"
        style={{ backgroundColor: isHovered ? '#005a57' : '#004942' }}
      >
        <Link href={`/produits/${product.slug}`} className="mb-2">
          <h3 
            className="text-lg font-semibold transition-colors duration-200"
            style={{ color: isHovered ? 'rgb(16, 185, 129)' : 'rgb(255, 255, 255)' }}
          >
            {product.name}
          </h3>
        </Link>
        
        {product.category && (
          <div className="mt-1 mb-2 flex flex-wrap gap-1">
            <span className="text-sm text-white/70">
              {typeof product.category === 'string' ? product.category : product.category.name}
            </span>
          </div>
        )}

        {/* Affichage du prix par gramme pour les produits à base de poids */}
        {isWeightBasedCategory() && (
          <div className="mb-2 text-sm font-medium text-center">
            <span className="inline-block rounded-full border bg-transparent px-3 py-1 whitespace-nowrap text-xs md:text-sm md:px-4" style={{ borderColor: '#EFC368', color: '#EFC368' }}>
              À partir de {product.productType === 'simple' && product.pricePerGram 
                ? formatPrice(product.pricePerGram) 
                : product.variants && product.variants.length > 0
                  ? formatPrice(Math.min(...product.variants
                      .filter(v => v.pricePerGram && v.pricePerGram > 0)
                      .map(v => v.pricePerGram!)))
                  : '0,00€'
              }/gr
            </span>
          </div>
        )}
        
        {/* Dropdown des variantes et ajout au panier */}
        <div className="mt-auto">
          {product.productType === 'variable' && product.variants && product.variants.length > 0 ? (
            <div ref={dropdownRef} className="relative mb-2" style={{ position: 'relative', zIndex: 40 }}>
              {/* Bouton pour ouvrir le dropdown */}
              <button
                className="flex w-full items-center justify-between rounded-md border border-white/20 bg-[#00352f] p-2 text-white text-sm md:text-base"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span>{selectedVariant ? formatVariantLabel(selectedVariant) : 'Choisir une option'}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown des variantes */}
              {isDropdownOpen && (
                <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 overflow-y-auto rounded-md border border-white/20 bg-[#00352f] shadow-lg" style={{ position: 'absolute', zIndex: 999 }}>
                  {product.variants.map((variant, idx) => (
                    <button
                      key={idx}
                      className={`flex w-full items-center justify-between p-2 text-left text-sm md:text-base hover:bg-white/10 ${
                        selectedVariant?.id === variant.id ? 'bg-white/20' : ''
                      }`}
                      onClick={() => {
                        setSelectedVariant(variant);
                        setIsDropdownOpen(false);
                      }}
                      disabled={typeof variant.stock === 'number' && variant.stock <= 0}
                    >
                      <span className={typeof variant.stock === 'number' && variant.stock <= 0 ? 'text-gray-500' : ''}>
                        {formatVariantLabel(variant)}
                      </span>
                      <span className="ml-2 text-xs text-white/70">
                        {formatPrice(variant.price)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="mb-2 flex h-10 items-center justify-center text-white/80">
              {product.price ? formatPrice(product.price) : 'Prix sur demande'}
            </div>
          )}
          
          {/* Bouton d'ajout au panier */}
          <button
            className={`flex w-full items-center justify-center rounded-md py-2 font-medium transition-colors ${
              isOutOfStock()
                ? 'cursor-not-allowed bg-gray-500 text-white/60'
                : 'text-black'
            }`}
            style={{ backgroundColor: isOutOfStock() ? undefined : '#EFC368' }}
            onClick={handleAddToCart}
            disabled={isOutOfStock()}
          >
            <ShoppingCart className="mr-2 h-4 w-4" />
            {isOutOfStock() ? 'Rupture de stock' : (
              <span>
                <span className="hidden md:inline">Ajouter au panier</span>
                <span className="inline md:hidden">Ajouter</span>
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
