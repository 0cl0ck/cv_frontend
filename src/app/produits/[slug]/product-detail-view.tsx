'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Category, Media, Product, ProductVariation } from '@/types/product';
import { useCartContext } from '@/context/CartContext';
import { ProductReviews } from '@/components/Reviews';
import {
  ProductGallery,
  ProductInfo,
  RelatedProducts,
} from './components';

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
  const [mainImage, setMainImage] = useState<Media | undefined>(product.mainImage);
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
            <ProductGallery
              product={product}
              mainImage={mainImage}
              setMainImage={setMainImage}
            />
            <ProductInfo
              product={product}
              categoryDisplay={categoryDisplay}
              selectedVariation={selectedVariation}
              onVariationChange={handleVariationChange}
              quantity={quantity}
              onQuantityChange={handleQuantityChange}
              onAddToCart={handleAddToCart}
              isInStock={isInStock()}
              isAddingToCart={isAddingToCart}
              isAddedToCart={isAddedToCart}
            />
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

        <RelatedProducts relatedProducts={relatedProducts} />
      </div>
    </div>
  );
}
