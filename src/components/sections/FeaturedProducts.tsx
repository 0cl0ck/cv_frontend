'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

// Type pour nos produits statiques
type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
  description: string;
};

// Produits en dur pour le MVP
const featuredProducts: Product[] = [
  {
    id: '1',
    name: 'Huile CBD Premium',
    slug: 'huile-cbd-premium',
    price: 39.99,
    imageUrl: '/images/products/huile-cbd.jpg',
    description: 'Huile CBD 10% de qualité supérieure'
  },
  {
    id: '2',
    name: 'Fleurs CBD Indoor',
    slug: 'fleurs-cbd-indoor',
    price: 12.90,
    imageUrl: '/images/products/fleurs-cbd.jpg',
    description: 'Fleurs CBD cultivées en intérieur'
  },
  {
    id: '3',
    name: 'E-liquide CBD',
    slug: 'e-liquide-cbd',
    price: 24.50,
    imageUrl: '/images/products/e-liquide-cbd.jpg',
    description: 'E-liquide CBD saveur fruits rouges'
  },
  {
    id: '4',
    name: 'Tisane CBD Relax',
    slug: 'tisane-cbd-relax',
    price: 14.90,
    imageUrl: '/images/products/tisane-cbd.jpg',
    description: 'Tisane relaxante au CBD et à la camomille'
  }
];

// Composant de carte produit
function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/produits/${product.slug}`} className="group">
      <div className="relative overflow-hidden rounded-lg bg-gray-100 mb-4 aspect-square">
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          {/* Remplacer par vos propres images une fois qu'elles seront disponibles */}
          <div className="text-gray-400">Image produit</div>
        </div>
      </div>
      <h3 className="font-semibold text-lg">{product.name}</h3>
      <p className="text-green-600 font-medium">{product.price.toFixed(2)} €</p>
      <p className="text-gray-600 text-sm mt-1">{product.description}</p>
    </Link>
  );
}

export default function FeaturedProducts() {
  return (
    <section className="container mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold mb-8 text-center">Nos produits vedettes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {featuredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
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
