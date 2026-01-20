'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard/ProductCard';

// Product type definition to fix TypeScript errors
interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  slug: string;
  // Add other product properties as needed
  [key: string]: unknown; // For any other properties not explicitly defined
}

// No constants needed here

/**
 * A client component wrapper that handles lazy-loading of featured products
 * and prevents multiple API calls with proper state management
 */
export default function ClientFeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  // Fetch featured products only once when component is visible
  useEffect(() => {
    let isMounted = true;
    
    const fetchProducts = async () => {
      try {
        // Only make one request with all the parameters in the query string
        const response = await fetch('/api/products?limit=3&where[isFeatured][equals]=true&where[availabilityStatus][not_equals]=discontinued&sort=-createdAt');
        
        if (!response.ok) throw new Error('Failed to fetch products');
        
        const data = await response.json();
        
        if (isMounted) {
          setFeaturedProducts(data.docs || []);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error fetching featured products:', error);
        if (isMounted) {
          setHasError(true);
          setIsLoading(false);
        }
      }
    };
    
    fetchProducts();
    
    return () => { isMounted = false; };
  }, []); // Empty dependency array ensures this runs only once

  if (isLoading) return <FeaturedProductsPlaceholder />;
  
  if (hasError) return <div className="p-8 text-center text-red-500">Failed to load featured products</div>;

  return (
    <section className="w-full bg-[#00333e] py-16 text-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-[#004942] opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#004942] opacity-10 rounded-full translate-x-1/3 translate-y-1/3"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header with title and "See all" button */}
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

/**
 * Lightweight placeholder shown while FeaturedProducts loads
 * Only contains the structure and animation, not actual content
 */
function FeaturedProductsPlaceholder() {
  return (
    <section className="w-full bg-[#00333e] py-16 text-white relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header placeholder */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center">
            <div className="w-1.5 h-8 bg-[#004942] rounded-full mr-3"></div>
            <div className="h-8 w-56 bg-gray-700 rounded-md animate-pulse"></div>
          </div>
          <div className="h-6 w-24 bg-gray-700 rounded-md animate-pulse"></div>
        </div>
        
        {/* Products grid placeholder */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-12">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-gray-800 rounded-lg overflow-hidden h-[420px] animate-pulse">
              <div className="h-64 bg-gray-700 w-full"></div>
              <div className="p-4">
                <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2 mb-6"></div>
                <div className="h-10 bg-gray-700 rounded w-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
