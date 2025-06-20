'use client';

import React from 'react';
import dynamic from 'next/dynamic';

/**
 * A client component wrapper for the FeaturedProducts server component
 * This allows us to use FeaturedProducts with LazyLoadSection
 */
export default function ClientFeaturedProducts() {
  // Use dynamic import to lazy-load the actual FeaturedProducts component
  const DynamicFeaturedProducts = dynamic(() => import('./FeaturedProducts'), {
    ssr: false, 
    loading: () => <FeaturedProductsPlaceholder />
  });

  return <DynamicFeaturedProducts />;
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
