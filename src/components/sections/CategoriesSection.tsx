'use client';

import React from 'react';
import Link from 'next/link';

// Type pour nos catégories statiques
type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
};

// Catégories en dur pour le MVP
const popularCategories: Category[] = [
  {
    id: '1',
    name: 'Huiles CBD',
    slug: 'huiles-cbd',
    description: 'Huiles sublinguales de qualité premium',
    imageUrl: '/images/categories/huiles-cbd.jpg'
  },
  {
    id: '2',
    name: 'Fleurs CBD',
    slug: 'fleurs-cbd',
    description: 'Fleurs cultivées naturellement en Europe',
    imageUrl: '/images/categories/fleurs-cbd.jpg'
  },
  {
    id: '3',
    name: 'Infusions & Thés',
    slug: 'infusions-thes',
    description: 'Boissons relaxantes aux plantes et CBD',
    imageUrl: '/images/categories/infusions-cbd.jpg'
  },
  {
    id: '4',
    name: 'E-liquides',
    slug: 'e-liquides',
    description: 'E-liquides au CBD pour vapoteurs',
    imageUrl: '/images/categories/e-liquides-cbd.jpg'
  }
];

export default function CategoriesSection() {
  return (
    <section className="bg-neutral-50 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Explorez nos catégories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {popularCategories.map((category) => (
            <Link 
              href={`/produits?categorie=${category.slug}`}
              key={category.id}
              className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="relative h-48 w-full overflow-hidden bg-gray-200 flex items-center justify-center">
                {/* Remplacer par vos propres images une fois qu'elles seront disponibles */}
                <div className="text-gray-400">Image catégorie</div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold">{category.name}</h3>
                <p className="text-gray-600 mt-1">{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
