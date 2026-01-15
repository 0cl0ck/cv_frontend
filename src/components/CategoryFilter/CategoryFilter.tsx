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
            className={`block w-full p-2 rounded-md transition-colors flex items-center gap-2 ${
              !activeCategory && !searchParams.get('tier')
                ? 'bg-[#00878a] text-white font-medium'
                : 'hover:bg-neutral-100 dark:hover:bg-[#005965] text-white dark:text-white/80'
            }`}
          >
            <span>🛒</span>
            <span>Tous les produits</span>
          </Link>
        </li>
        {/* Premium filter with gold styling */}
        <li>
          <Link
            href="/produits?tier=premium"
            className={`block w-full p-2 rounded-md transition-colors flex items-center gap-2 ${
              searchParams.get('tier') === 'premium'
                ? 'font-medium'
                : 'hover:opacity-90'
            }`}
            style={{
              background: searchParams.get('tier') === 'premium' 
                ? 'linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%)'
                : 'transparent',
              color: searchParams.get('tier') === 'premium' ? '#1A1A1A' : '#D4AF37',
            }}
          >
            <span>⭐</span>
            <span>PREMIUM</span>
          </Link>
        </li>
        {categories.map((category) => {
          // Map category slugs to emojis
          const categoryEmojis: Record<string, string> = {
            'packs-cbd': '📦',
            'gelules-cbd': '💊',
            'infusions-cbd': '🍵',
            'huiles-cbd': '💧',
            'resines-cbd': '🧱',
            'fleurs-cbd': '🌸',
          };
          const emoji = categoryEmojis[category.slug] || '🌿';
          
          return (
            <li key={category.id}>
              <Link
                href={`/produits/categorie/${category.slug}`}
                className={`block w-full p-2 rounded-md transition-colors flex items-center gap-2 ${
                  activeCategory === category.slug
                    ? 'bg-[#00878a] text-white font-medium'
                    : 'hover:bg-neutral-100 dark:hover:bg-[#005965] text-white dark:text-white/80'
                }`}
              >
                <span>{emoji}</span>
                <span>{category.name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default CategoryFilter;
