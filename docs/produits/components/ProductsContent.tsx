'use client';

import { ProductGrid } from '@/components/ProductGrid';
import { SearchParamsProvider, useSafeSearchParams } from '@/hooks/useSearchParamsProvider';
import { ProductCategory, Product } from '@/payload-types';
import { useEffect, useState } from 'react';
import { ProductFilters } from './filters';
import ProductSort from './ProductSort';
import { ResetFiltersButton } from './ResetFiltersButton';

type Props = {
  categories: ProductCategory[];
  products: Product[];
  selectedCategories: string[];
  minPrice: number;
  maxPrice: number;
};

// Fonction pour trier les produits en fonction de l'option de tri
function sortProducts(products: Product[], sortOption: string): Product[] {
  const sortedProducts = [...products]; // Créer une copie pour ne pas modifier l'original
  
  // Fonction pour obtenir le prix le plus bas d'un produit (en tenant compte des variations)
  const getLowestPrice = (product: Product): number => {
    const prices: number[] = [];
    
    // Ajouter le prix principal s'il existe
    if (typeof product.price === 'number' && !isNaN(product.price)) {
      prices.push(product.price);
    }
    
    // Ajouter les prix des variations s'ils existent
    if (product.productType === 'variable' && Array.isArray(product.variations)) {
      product.variations.forEach(variation => {
        if (typeof variation.price === 'number' && !isNaN(variation.price)) {
          prices.push(variation.price);
        }
      });
    }
    
    // Retourner le prix le plus bas ou 0 s'il n'y a pas de prix
    return prices.length > 0 ? Math.min(...prices) : 0;
  };
  
  switch (sortOption) {
    case 'newest':
      return sortedProducts.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // Du plus récent au plus ancien
      });
    case 'oldest':
      return sortedProducts.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateA - dateB; // Du plus ancien au plus récent
      });
    case 'price-asc':
      return sortedProducts.sort((a, b) => {
        const priceA = getLowestPrice(a);
        const priceB = getLowestPrice(b);
        return priceA - priceB; // Prix croissant (du moins cher au plus cher)
      });
    case 'price-desc':
      return sortedProducts.sort((a, b) => {
        const priceA = getLowestPrice(a);
        const priceB = getLowestPrice(b);
        return priceB - priceA; // Prix décroissant (du plus cher au moins cher)
      });
    case 'name-asc':
      return sortedProducts.sort((a, b) => {
        return (a.name || '').localeCompare(b.name || ''); // Nom A-Z
      });
    case 'name-desc':
      return sortedProducts.sort((a, b) => {
        return (b.name || '').localeCompare(a.name || ''); // Nom Z-A
      });
    default:
      return sortedProducts;
  }
}

export function ProductsContent({
  categories,
  products,
  selectedCategories,
  minPrice,
  maxPrice,
}: Props) {
  // Utiliser les paramètres d'URL pour récupérer l'option de tri
  const searchParams = useSafeSearchParams();
  const sortOption = searchParams?.get('sort') || 'newest';
  
  // État local pour stocker les produits triés
  const [sortedProducts, setSortedProducts] = useState<Product[]>(products);
  
  // Mettre à jour les produits triés lorsque les produits ou l'option de tri changent
  useEffect(() => {
    setSortedProducts(sortProducts(products, sortOption));
  }, [products, sortOption]);

  return (
    <SearchParamsProvider>
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-24">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="prose dark:prose-invert">
                <h1 className="mb-0">Produits</h1>
              </div>
              <ProductSort />
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:gap-8">
            {/* Sidebar avec les filtres - position fixe sur desktop */}
            <div className="w-full md:w-64 md:flex-shrink-0 mb-8 md:mb-0">
              <div className="sticky top-24">
                <ProductFilters
                  categories={categories}
                  selectedCategories={selectedCategories}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                />
              </div>
            </div>

            {/* Grille des produits */}
            <div className="flex-1">
              {sortedProducts.length > 0 ? (
                <ProductGrid products={sortedProducts} />
              ) : (
                <div className="rounded-lg border bg-background p-6 text-center">
                  <p className="text-muted-foreground">
                    Aucun produit ne correspond à votre sélection.
                  </p>
                  <ResetFiltersButton />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </SearchParamsProvider>
  );
}
