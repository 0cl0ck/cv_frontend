'use client';

import React from 'react';
import { ProductCard } from '@/components/ProductCard/ProductCard';
import { Category, Product } from '@/types/product';
import CategoryFilter from '@/components/CategoryFilter/CategoryFilter';
import Pagination from '@/components/Pagination/Pagination';

interface ProductsLayoutProps {
  products: Product[];
  categories: Category[];
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  title: string;
  description?: string;
  activeCategory?: string;
}

export default function ProductsLayout({
  products,
  categories,
  currentPage,
  totalPages,
  totalProducts,
  title,
  description,
  activeCategory,
}: ProductsLayoutProps) {
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
            <div className="mt-6 bg-white dark:bg-neutral-900 p-6 rounded-lg shadow-md">
              <h3 className="font-semibold text-lg mb-4 text-neutral-900 dark:text-white">Prix</h3>
              {/* Placeholder pour les filtres de prix */}
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="price-all"
                    type="radio"
                    name="price"
                    defaultChecked
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
