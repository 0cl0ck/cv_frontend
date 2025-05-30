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
  // Ces variables sont préparées pour un usage futur dans les filtres de catégories
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Construire une nouvelle URL avec les paramètres mis à jour
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(name, value);
    return params.toString();
  };

  if (isLoading) {
    return (
      <div className="bg-[#00454f] p-6 rounded-lg shadow-lg border border-[#005965]">
        <h3 className="font-semibold text-lg mb-4 text-neutral-900 dark:text-white/90">Catégories</h3>
        <div className="animate-pulse">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="h-10 bg-neutral-200 dark:bg-[#005965] rounded-md mb-2" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#00454f] p-1 ">
      <ul className="space-y-2">
        <li>
          <Link
            href="/produits"
            className={`block w-full p-2 rounded-md transition-colors ${
              !activeCategory
                ? 'bg-[#00878a] text-white font-medium'
                : 'hover:bg-neutral-100 dark:hover:bg-[#005965] text-white dark:text-white/80'
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
                  ? 'bg-[#00878a] text-white font-medium'
                  : 'hover:bg-neutral-100 dark:hover:bg-[#005965] text-white dark:text-white/80'
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
