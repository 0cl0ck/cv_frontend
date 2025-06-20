'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Import the client-side LazyLoadSection 
const LazyLoadSection = dynamic(
  () => import('@/components/Performance/LazyLoadSection'),
  { ssr: false }
);

// Client components with dynamic imports
const ClientFeaturedProducts = dynamic(
  () => import("@/components/sections/ClientFeaturedProducts"),
  { ssr: false }
);

const CategoryGrid = dynamic(() => import("@/components/sections/CategoryGrid"), { ssr: false });
const FeaturesBanner = dynamic(() => import("@/components/sections/FeaturesBanner"), { ssr: false });
const SocialProofSection = dynamic(() => import("@/components/sections/SocialProofSection"), { ssr: false });
const ContactSection = dynamic(() => import("@/components/sections/ContactSection"), { ssr: false });

export default function ClientPageWrapper() {
  return (
    <>
      {/* Lazy load below-the-fold content with visibility detection */}
      <LazyLoadSection 
        component={ClientFeaturedProducts}
        rootMargin="200px" // Start loading when within 200px of viewport
        className="featured-products-wrapper"
        placeholder={
          <div className="w-full bg-[#00333e] py-16">
            <div className="container mx-auto px-4 animate-pulse">
              <div className="h-8 bg-gray-700 w-64 mb-12 rounded-md"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-96 bg-gray-800 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        }
      />
      
      <LazyLoadSection 
        component={CategoryGrid}
        rootMargin="150px"
        className="category-grid-wrapper"
      />
      
      <LazyLoadSection 
        component={FeaturesBanner}
        rootMargin="100px"
        className="features-banner-wrapper"
      />
      
      <LazyLoadSection 
        component={SocialProofSection}
        rootMargin="100px"
        className="social-proof-wrapper"
      />
      
      <LazyLoadSection 
        component={ContactSection}
        rootMargin="100px"
        className="contact-section-wrapper"
      />
    </>
  );
}
