import React from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard/ProductCard';
import { Product } from '@/types/product';
import { getProducts } from '@/services/api';

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
    <section className="container mx-auto px-4 py-16">
      <h2 className="text-3xl font-bold mb-8 text-center">Nos produits vedettes</h2>
      {featuredProducts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredProducts.map((product, index) => (
            <ProductCard 
              key={product.id} 
              product={product} 
              index={index} 
              showFeaturedBadge={false} // Désactiver le badge sur la page d'accueil
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-neutral-600 dark:text-neutral-400 mb-8">
          Aucun produit vedette n'est actuellement disponible.
        </p>
      )}
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
