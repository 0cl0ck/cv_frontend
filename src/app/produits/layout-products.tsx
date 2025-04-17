'use client';

import React, { useEffect, useState } from 'react';
import { ProductCard } from '@/components/ProductCard/ProductCard';
import { Category, Product } from '@/types/product';
import CategoryFilter from '@/components/CategoryFilter/CategoryFilter';
import Pagination from '@/components/Pagination/Pagination';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface ProductsLayoutProps {
  products: Product[];
  categories: Category[];
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  title: string;
  description?: string;
  activeCategory?: string;
  priceRange?: string;
  pricePerGramSort?: string;
}

// Types pour les plages de prix
type PriceRangeType = 'all' | 'under-20' | '20-to-50' | 'above-50';

// Types pour le tri par prix par gramme
type PricePerGramSortType = 'none' | 'asc' | 'desc';



export default function ProductsLayout({
  products,
  categories,
  currentPage,
  totalPages,
  totalProducts,
  title,
  description,
  activeCategory,
  priceRange: initialPriceRange,
  pricePerGramSort: initialPricePerGramSort,
}: ProductsLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // États locaux pour les filtres
  const [priceRange, setPriceRange] = useState<PriceRangeType>(initialPriceRange as PriceRangeType || 'all');
  const [pricePerGramSort, setPricePerGramSort] = useState<PricePerGramSortType>(initialPricePerGramSort as PricePerGramSortType || 'none');
  
  // Fonction pour mettre à jour les paramètres d'URL et naviguer
  const updateSearchParams = (name: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === null) {
      params.delete(name);
    } else {
      params.set(name, value);
    }
    
    // Réinitialiser la page à 1 quand on change les filtres
    params.set('page', '1');
    
    router.push(`${pathname}?${params.toString()}`);
  };
  
  // Gestionnaire d'événement pour le changement de filtre de prix
  const handlePriceChange = (value: PriceRangeType) => {
    setPriceRange(value);
    updateSearchParams('price', value === 'all' ? null : value);
  };

  // Gestionnaire d'événement pour le changement de tri par prix par gramme
  const handlePricePerGramSortChange = (value: PricePerGramSortType) => {
    setPricePerGramSort(value);
    updateSearchParams('pricePerGramSort', value === 'none' ? null : value);
  };
  
  // Mettre à jour l'état local si initialPriceRange change
  useEffect(() => {
    if (initialPriceRange) {
      setPriceRange(initialPriceRange as PriceRangeType);
    }
  }, [initialPriceRange]);

  // Mettre à jour l'état local si initialPricePerGramSort change
  useEffect(() => {
    if (initialPricePerGramSort) {
      setPricePerGramSort(initialPricePerGramSort as PricePerGramSortType);
    }
  }, [initialPricePerGramSort]);
  return (
    <div className="bg-neutral-50 dark:bg-neutral-950 min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Bannière/Header */}
        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-md p-8 mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 dark:text-white mb-4">{title}</h1>
          {description && (
            <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">{description}</p>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar avec filtres */}
          <aside className="md:w-1/4">
            <CategoryFilter categories={categories} activeCategory={activeCategory} />
            
            {/* Espace pour d'autres filtres */}
            {/* Filtres de prix pour produits uniques */}
            <div className="mt-6 bg-white dark:bg-neutral-900 p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg mb-2 text-neutral-900 dark:text-white">Prix</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4 italic">Produits uniques</p>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="price-all"
                    type="radio"
                    name="price"
                    checked={priceRange === 'all'}
                    onChange={() => handlePriceChange('all')}
                    className="h-4 w-4 text-primary"
                  />
                  <label htmlFor="price-all" className="ml-2 text-sm text-neutral-700 dark:text-neutral-300">
                    Tous les prix
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="price-under-20"
                    type="radio"
                    name="price"
                    checked={priceRange === 'under-20'}
                    onChange={() => handlePriceChange('under-20')}
                    className="h-4 w-4 text-primary"
                  />
                  <label
                    htmlFor="price-under-20"
                    className="ml-2 text-sm text-neutral-700 dark:text-neutral-300"
                  >
                    Moins de 20€
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="price-20-to-50"
                    type="radio"
                    name="price"
                    checked={priceRange === '20-to-50'}
                    onChange={() => handlePriceChange('20-to-50')}
                    className="h-4 w-4 text-primary"
                  />
                  <label
                    htmlFor="price-20-to-50"
                    className="ml-2 text-sm text-neutral-700 dark:text-neutral-300"
                  >
                    20€ à 50€
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="price-above-50"
                    type="radio"
                    name="price"
                    checked={priceRange === 'above-50'}
                    onChange={() => handlePriceChange('above-50')}
                    className="h-4 w-4 text-primary"
                  />
                  <label
                    htmlFor="price-above-50"
                    className="ml-2 text-sm text-neutral-700 dark:text-neutral-300"
                  >
                    Plus de 50€
                  </label>
                </div>
              </div>
            </div>
            
            {/* Tri pour produits variables par prix au gramme */}
            <div className="mt-4 bg-white dark:bg-neutral-900 p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg mb-2 text-neutral-900 dark:text-white">Trier par</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4 italic">Prix par gramme</p>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="price-per-gram-none"
                    type="radio"
                    name="price-per-gram-sort"
                    checked={pricePerGramSort === 'none'}
                    onChange={() => handlePricePerGramSortChange('none')}
                    className="h-4 w-4 text-primary"
                  />
                  <label htmlFor="price-per-gram-none" className="ml-2 text-sm text-neutral-700 dark:text-neutral-300">
                    Aucun tri
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="price-per-gram-asc"
                    type="radio"
                    name="price-per-gram-sort"
                    checked={pricePerGramSort === 'asc'}
                    onChange={() => handlePricePerGramSortChange('asc')}
                    className="h-4 w-4 text-primary"
                  />
                  <label
                    htmlFor="price-per-gram-asc"
                    className="ml-2 text-sm text-neutral-700 dark:text-neutral-300"
                  >
                    Prix croissant
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="price-per-gram-desc"
                    type="radio"
                    name="price-per-gram-sort"
                    checked={pricePerGramSort === 'desc'}
                    onChange={() => handlePricePerGramSortChange('desc')}
                    className="h-4 w-4 text-primary"
                  />
                  <label
                    htmlFor="price-per-gram-desc"
                    className="ml-2 text-sm text-neutral-700 dark:text-neutral-300"
                  >
                    Prix décroissant
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Produits et pagination */}
          <main className="md:w-3/4">
            {/* Affichage des produits */}
            {products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product, index) => (
                    <ProductCard key={product.id} product={product} index={index} />
                  ))}
                </div>
                
                {/* Affichage de la pagination */}
                <Pagination currentPage={currentPage} totalPages={totalPages} />
                
                {/* Affichage du nombre total de produits */}
                <div className="mt-4 text-sm text-center text-neutral-600 dark:text-neutral-400">
                  {totalProducts} produit{totalProducts !== 1 ? 's' : ''} trouvé{totalProducts !== 1 ? 's' : ''}
                </div>
              </>
            ) : (
              <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-md p-8 text-center">
                <p className="text-neutral-600 dark:text-neutral-400">
                  Aucun produit ne correspond à vos critères. Essayez de modifier vos filtres.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
