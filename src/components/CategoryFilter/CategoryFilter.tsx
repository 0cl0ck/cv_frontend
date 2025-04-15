'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Category } from '@/types/product';

type Props = {
  categories: Category[];
  activeCategory?: string;
  isLoading?: boolean;
};

export const CategoryFilter: React.FC<Props> = ({ categories, activeCategory, isLoading = false }) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Construire une nouvelle URL avec les paramètres mis à jour
  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(name, value);
    return params.toString();
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg shadow-md">
        <h3 className="font-semibold text-lg mb-4 text-neutral-900 dark:text-white">Catégories</h3>
        <div className="animate-pulse">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded-md mb-2" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg shadow-md">
      <h3 className="font-semibold text-lg mb-4 text-neutral-900 dark:text-white">Catégories</h3>
      <ul className="space-y-2">
        <li>
          <Link
            href="/produits"
            className={`block w-full p-2 rounded-md transition-colors ${
              !activeCategory
                ? 'bg-primary text-white font-medium'
                : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
            }`}
          >
            Tous les produits
          </Link>
        </li>
        {categories.map((category) => (
          <li key={category.id}>
            <Link
              href={`/produits/categorie/${category.slug}`}
              className={`block w-full p-2 rounded-md transition-colors ${
                activeCategory === category.slug
                  ? 'bg-primary text-white font-medium'
                  : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              {category.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CategoryFilter;
