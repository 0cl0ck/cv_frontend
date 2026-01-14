'use client';

import { formatPrice } from '@/utils/formatPrice';
import { Product, ProductVariation, GalleryImage, Media } from '@/types/product';
import Link from 'next/link';
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCartContext } from '@/context/CartContext';
import { ChevronDown, ShoppingCart } from 'lucide-react';
import ProductImage from './ProductImage';

// Mapping des pays vers leur code ISO 2 lettres et nom réel
// Le nom affiché sur desktop est calculé dynamiquement (<8 chars = nom complet, sinon code ISO)
const COUNTRY_DATA: Record<string, { isoCode: string; realName: string }> = {
  'france': { isoCode: 'fr', realName: 'France' },
  'italie': { isoCode: 'it', realName: 'Italie' },
  'italy': { isoCode: 'it', realName: 'Italie' },
  'suisse': { isoCode: 'ch', realName: 'Suisse' },
  'switzerland': { isoCode: 'ch', realName: 'Suisse' },
  'espagne': { isoCode: 'es', realName: 'Espagne' },
  'spain': { isoCode: 'es', realName: 'Espagne' },
  'allemagne': { isoCode: 'de', realName: 'Allemagne' },
  'germany': { isoCode: 'de', realName: 'Allemagne' },
  'pays-bas': { isoCode: 'nl', realName: 'Pays-Bas' },
  'netherlands': { isoCode: 'nl', realName: 'Pays-Bas' },
  'hollande': { isoCode: 'nl', realName: 'Pays-Bas' },
  'états-unis': { isoCode: 'us', realName: 'États-Unis' },
  'etats-unis': { isoCode: 'us', realName: 'États-Unis' },
  'usa': { isoCode: 'us', realName: 'USA' },
  'portugal': { isoCode: 'pt', realName: 'Portugal' },
  'autriche': { isoCode: 'at', realName: 'Autriche' },
  'austria': { isoCode: 'at', realName: 'Autriche' },
  'belgique': { isoCode: 'be', realName: 'Belgique' },
  'belgium': { isoCode: 'be', realName: 'Belgique' },
  'royaume-uni': { isoCode: 'gb', realName: 'Royaume-Uni' },
  'uk': { isoCode: 'gb', realName: 'UK' },
  'pologne': { isoCode: 'pl', realName: 'Pologne' },
  'poland': { isoCode: 'pl', realName: 'Pologne' },
  'tchéquie': { isoCode: 'cz', realName: 'Tchéquie' },
  'republique tcheque': { isoCode: 'cz', realName: 'Tchéquie' },
  'czech republic': { isoCode: 'cz', realName: 'Tchéquie' },
  'maroc': { isoCode: 'ma', realName: 'Maroc' },
  'morocco': { isoCode: 'ma', realName: 'Maroc' },
  'canada': { isoCode: 'ca', realName: 'Canada' },
};

/**
 * Récupère les données du pays pour l'affichage du badge
 * @param origin - Le pays d'origine du produit
 * @returns Objet avec isoCode, desktopName (nom si <8 chars, sinon code) et mobileName (toujours code)
 */
const getCountryData = (origin: string): { isoCode: string; desktopName: string; mobileName: string } | null => {
  if (!origin) return null;
  
  const normalizedOrigin = origin.toLowerCase().trim();
  const countryInfo = COUNTRY_DATA[normalizedOrigin];
  
  if (countryInfo) {
    const code = countryInfo.isoCode.toUpperCase();
    // Desktop: nom complet si <8 caractères, sinon code ISO
    const desktopName = countryInfo.realName.length < 8 ? countryInfo.realName : code;
    return { isoCode: countryInfo.isoCode, desktopName, mobileName: code };
  }
  
  // Fallback: retourner le texte brut avec abréviation tronquée
  const code = origin.length <= 3 ? origin.toUpperCase() : origin.substring(0, 2).toUpperCase();
  const desktopName = origin.length < 8 ? origin : code;
  return { isoCode: '', desktopName, mobileName: code };
};

/**
 * Composant pour afficher le badge pays avec drapeau PNG
 * Responsive: mobile (<768px) = abréviation, tablet/desktop (≥768px) = nom si <8 chars
 */
const CountryBadge: React.FC<{ origin: string }> = ({ origin }) => {
  const countryData = getCountryData(origin);
  if (!countryData) return null;
  
  return (
    <div className="flex items-center gap-1 px-2 py-1 text-xs md:gap-1.5 md:px-3 md:py-1.5 md:text-sm font-semibold text-black" style={{ backgroundColor: '#EFC368' }}>
      {countryData.isoCode && (
        <img 
          src={`https://flagcdn.com/w20/${countryData.isoCode}.png`}
          srcSet={`https://flagcdn.com/w40/${countryData.isoCode}.png 2x`}
          width="16" 
          height="12" 
          alt={countryData.desktopName}
          className="inline-block md:w-5 md:h-[15px]"
          style={{ objectFit: 'cover' }}
        />
      )}
      {/* Mobile = abréviation, Tablet/Desktop = nom si <8 chars */}
      <span className="hidden md:inline">{countryData.desktopName}</span>
      <span className="inline md:hidden">{countryData.mobileName}</span>
    </div>
  );
};

type Props = {
  product: Product;
  index: number;
  showFeaturedBadge?: boolean; // Prop optionnel pour contrôler l'affichage du badge (n'est pas utilisé dans ce composant actuellement)
};

// Helper pour extraire Media depuis GalleryImage
const unwrapGalleryImage = (item: GalleryImage | undefined): Media | undefined => {
  if (!item || !item.image) return undefined;
  if (typeof item.image === 'string') {
    return { url: item.image };
  }
  return item.image;
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
  // Référence pour le bouton trigger du dropdown (pour positionnement Portal)
  const buttonRef = useRef<HTMLButtonElement>(null);
  // État pour stocker la position du dropdown (Portal)
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number; width: number } | null>(null);
  // Contexte du panier
  const { addItem } = useCartContext();
  
  // Utiliser mainImage comme image principale et la première image de la galerie comme image au survol
  const mainImage = product.mainImage;
  const hoverImage = unwrapGalleryImage(product.galleryImages?.[0]);
  
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
      // Vérifier si le clic est en dehors du dropdown ET du bouton trigger
      const isOutsideDropdown = dropdownRef.current && !dropdownRef.current.contains(event.target as Node);
      const isOutsideButton = buttonRef.current && !buttonRef.current.contains(event.target as Node);
      if (isOutsideDropdown && isOutsideButton) {
        setIsDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Mettre à jour la position du dropdown quand il s'ouvre ou lors du scroll/resize
  useEffect(() => {
    if (!isDropdownOpen || !buttonRef.current) {
      setDropdownPosition(null);
      return;
    }

    const updatePosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY + 4, // 4px de marge
          left: rect.left + window.scrollX,
          width: rect.width,
        });
      }
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isDropdownOpen]);

  // getImageUrl est maintenant géré par le composant ProductImage

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
        {/* Badge pays d'origine (remplace le mode de culture pour éviter la redondance avec le titre SEO) */}
        {isWeightBasedCategory() && product.productDetails && typeof product.productDetails === 'object' && 'origin' in product.productDetails && product.productDetails.origin && (
          <CountryBadge origin={String(product.productDetails.origin)} />
        )}
      </div>
      
      {/* Badge CBD */}
      {typeof product.productDetails === 'object' && product.productDetails && 'cbdContent' in product.productDetails && (
        <div className="absolute right-0 top-2 z-10 px-3 py-1.5 text-sm font-semibold text-black" style={{ backgroundColor: '#EFC368' }}>
          {String(product.productDetails.cbdContent)}% CBD
        </div>
      )}
      
      {/* Product Image Component */}
      <Link href={`/produits/${product.slug}`} className="block overflow-hidden">
        <ProductImage 
          mainImage={mainImage}
          hoverImage={hoverImage}
          productName={product.name}
          isHovered={isHovered}
          showFeaturedBadge={showFeaturedBadge}
          index={index}
        />
      </Link>

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
            <div className="relative mb-2">
              {/* Bouton pour ouvrir le dropdown */}
              <button
                ref={buttonRef}
                className="flex w-full items-center justify-between rounded-md border border-white/20 bg-[#00352f] p-2 text-white text-sm md:text-base"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span>{selectedVariant ? formatVariantLabel(selectedVariant) : 'Choisir une option'}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* Dropdown des variantes - rendu via Portal pour échapper aux stacking contexts */}
              {isDropdownOpen && dropdownPosition && typeof document !== 'undefined' && createPortal(
                <div 
                  ref={dropdownRef}
                  className="max-h-60 overflow-y-auto rounded-md border border-white/20 bg-[#00352f] shadow-lg"
                  style={{ 
                    position: 'fixed',
                    top: dropdownPosition.top - window.scrollY,
                    left: dropdownPosition.left,
                    width: dropdownPosition.width,
                    zIndex: 9999,
                  }}
                >
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
                </div>,
                document.body
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
