import React from 'react';
import Link from 'next/link';
import { getProducts } from '@/services/api';
import { ProductCard } from '@/components/ProductCard/ProductCard';
import type { Product } from '@/types/product';

// Nombre maximum de produits Premium à afficher
const MAX_PREMIUM_PRODUCTS = 4;

export default async function PremiumSelection() {
  // Récupérer les produits Premium depuis l'API
  let premiumProducts: Product[] = [];
  
  try {
    const response = await getProducts({
      limit: MAX_PREMIUM_PRODUCTS,
      sort: '-createdAt',
    });
    // Filtrer côté client les produits avec qualityTier premium ou limited-edition
    premiumProducts = (response.docs || []).filter(
      (p) => p.qualityTier === 'premium' || p.qualityTier === 'limited-edition'
    );
  } catch (error) {
    console.error('Error fetching premium products:', error);
  }

  // Ne pas afficher la section s'il n'y a pas de produits Premium
  if (premiumProducts.length === 0) {
    return null;
  }

  return (
    <section className="relative w-full overflow-hidden bg-[#00333e] py-16 text-white">
      {/* Subtle gold accent decorations */}
      <div 
        className="absolute top-0 left-0 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-5"
        style={{ background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)' }}
      />
      <div 
        className="absolute bottom-0 right-0 h-64 w-64 translate-x-1/3 translate-y-1/3 rounded-full opacity-5"
        style={{ background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)' }}
      />
      
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête centré avec style premium */}
        <div className="mb-12 text-center">
          <div className="mb-4 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#D4AF37]" />
            <span className="text-sm font-medium uppercase tracking-widest" style={{ color: '#D4AF37' }}>
              Qualité Exceptionnelle
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#D4AF37]" />
          </div>
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            <span style={{ color: '#D4AF37' }}>Sélection</span> Premium
          </h2>
          <p className="mx-auto max-w-2xl text-white/70">
            Des fleurs d&apos;exception, cultivées en France et en Allemagne. 
            Qualité supérieure, stock limité.
          </p>
        </div>
        
        {/* Grille de produits Premium - centrée quand moins de 4 produits */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-12">
          {premiumProducts.map((product, index) => (
            <div key={product.id} className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(25%-1.5rem)]">
              <ProductCard 
                product={product} 
                index={index} 
                showFeaturedBadge={false} 
              />
            </div>
          ))}
        </div>
        
        {/* CTA mobile */}
        <div className="mt-8 text-center sm:hidden">
          <Link 
            href="/produits?tier=premium" 
            className="inline-flex items-center rounded-lg px-5 py-2.5 text-black transition-colors"
            style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F5D76E 50%, #D4AF37 100%)' }}
          >
            <span>Voir la sélection Premium</span>
            <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
