'use client';

import React from 'react';
import { FocusCards, Card } from '@/components/FocusCard/FocusCard';

// Catégories en dur pour le MVP
const productCategories: Card[] = [
  {
    title: 'Huiles CBD',
    src: '/images/categories/categorie_huile_cbd.webp',
    href: '/produits?categorie=huiles-cbd'
  },
  {
    title: 'Fleurs CBD',
    src: '/images/categories/categorie_fleurs_cbd.webp',
    href: '/produits?categorie=fleurs-cbd'
  },
  {
    title: 'Infusions CBD',
    src: '/images/categories/categorie_infusion_cbd.webp',
    href: '/produits?categorie=infusions-cbd'
  },
  {
    title: 'Résine CBD',
    src: '/images/categories/categorie_resine_cbd.webp',
    href: '/produits?categorie=resine-cbd'
  },
  {
    title: 'Gélules CBD',
    src: '/images/categories/categorie_gelules_cbd.webp',
    href: '/produits?categorie=gelules-cbd'
  },
  {
    title: 'Packs CBD',
    src: '/images/categories/categorie_packs_cbd.webp',
    href: '/produits?categorie=packs-cbd'
  }
];

export default function CategoriesSection() {
  return (
    <section className="py-16 bg-neutral-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-12 text-center" style={{ color: 'black' }}>Nos catégories de produits</h2>
        <FocusCards cards={productCategories} />
      </div>
    </section>
  );
}
