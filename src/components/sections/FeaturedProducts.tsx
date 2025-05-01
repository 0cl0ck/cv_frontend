import React from 'react';
import Link from 'next/link';
import { getProducts } from '@/services/api';
import { ProductCard } from '@/components/ProductCard/ProductCard';

// Nombre maximum de produits à afficher dans la section des produits vedettes
const MAX_FEATURED_PRODUCTS = 3;

export default async function FeaturedProducts() {
  // Récupérer les produits mis en avant depuis l'API
  const featuredProductsData = await getProducts({
    featured: true,
    limit: MAX_FEATURED_PRODUCTS,
    sort: '-createdAt', // Trier par date de création (les plus récents d'abord)
  });

  // Extraire les produits de la réponse
  const featuredProducts = featuredProductsData.docs || [];

  return (
    <section className="w-full bg-[#00333e] py-16 text-white relative overflow-hidden">
      {/* Éléments décoratifs en arrière-plan */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-[#004942] opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#004942] opacity-10 rounded-full translate-x-1/3 translate-y-1/3"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* En-tête avec le titre et le bouton "Voir tout" */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center">
            <div className="w-1.5 h-8 bg-[#004942] rounded-full mr-3"></div>
            <h2 className="text-3xl font-bold">Produits vedettes</h2>
          </div>
          <Link 
            href="/produits" 
            className="group flex items-center text-white hover:text-green-200 transition-colors text-sm font-medium"
          >
            <span>Voir tout</span>
            <svg 
              className="ml-1.5 w-4 h-4 transition-transform group-hover:translate-x-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        
        {featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-12">
            {featuredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} showFeaturedBadge={false} />
            ))}
          </div>
        ) : (
          <p className="text-center text-white/80 mb-8">
            Aucun produit vedette n&apos;est actuellement disponible.
          </p>
        )}
      </div>
    </section>
  );
}
