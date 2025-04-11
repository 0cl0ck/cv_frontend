'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard/ProductCard';
import { Product } from '@/types/product';

// Note: Nous utilisons maintenant le type Product importé depuis @/types/product

// Produits en dur pour le MVP avec les vraies images
const featuredProducts: Product[] = [
  {
    id: '1',
    name: 'Banana Berry',
    slug: 'banana-berry',
    price: 15.90,
    images: ['/images/products/banana-berry.webp'],
    description: 'Fleurs CBD saveur Banana Berry',
    productType: 'simple',
    featured: true,
    category: [{ id: '1', name: 'Fleurs', slug: 'fleurs' }]
  },
  {
    id: '2',
    name: 'Blue Berry',
    slug: 'blue-berry',
    price: 16.90,
    images: ['/images/products/blue-berry.webp'],
    description: 'Fleurs CBD saveur Blue Berry',
    productType: 'simple',
    category: [{ id: '1', name: 'Fleurs', slug: 'fleurs' }]
  },
  {
    id: '3',
    name: 'Corelato',
    slug: 'corelato',
    price: 18.50,
    images: ['/images/products/corelato.webp'],
    description: 'Fleurs CBD premium Corelato',
    productType: 'simple',
    category: [{ id: '1', name: 'Fleurs', slug: 'fleurs' }]
  }
];

// Nous utilisons maintenant le composant ProductCard importé depuis @/components/ProductCard/ProductCard

export default function FeaturedProducts() {
  return (
    <section className="container mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold mb-8 text-center">Nos produits vedettes</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {featuredProducts.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
      <div className="text-center mt-10">
        <Link 
          href="/produits" 
          className="inline-block px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 transition-colors text-white font-medium"
        >
          Voir tous nos produits
        </Link>
      </div>
    </section>
  );
}
