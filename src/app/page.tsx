import { Suspense } from 'react';
import ImageHero from "@/components/Hero/ImageHero";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import { generatePageMetadata } from '@/lib/metadata';
import { getCategories, fallbackCategories } from '@/services/api';
import type { Category } from '@/types/product';

import Link from 'next/link';
import Image from 'next/image';

// ISR: Revalidate every hour (3600 seconds)
export const revalidate = 3600;

// SEO metadata with canonical URL
export const metadata = generatePageMetadata({
  title: 'CBD de Qualité - Fleurs, Huiles et Infusions',
  description: 'Découvrez notre sélection de produits CBD de haute qualité : fleurs, huiles, infusions et résines. Livraison rapide en France.',
  path: '/',
});

// Helper to extract image URL from category
function getCategoryImageUrl(category: Category): string {
  const rawImage = category.image;
  if (typeof rawImage === 'string') return rawImage;
  if (rawImage && typeof rawImage === 'object') {
    return rawImage.sizes?.card?.url ?? rawImage.sizes?.thumbnail?.url ?? rawImage.url ?? '/images/categories/placeholder.webp';
  }
  return '/images/categories/placeholder.webp';
}

// SSR Category Grid with dynamic data
async function CategoryGrid() {
  // Fetch categories server-side (with fallback on error)
  let categories: Category[];
  try {
    categories = await getCategories();
    // Filter only active categories
    categories = categories.filter((cat) => cat.isActive !== false);
  } catch {
    categories = fallbackCategories;
  }

  // Fallback if no categories returned
  if (!categories || categories.length === 0) {
    categories = fallbackCategories;
  }

  return (
    <section className="relative overflow-hidden bg-[#00333e] py-16">
      <div className="absolute top-0 left-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#004942] opacity-5" />
      <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/3 translate-y-1/3 rounded-full bg-[#004942] opacity-5" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex items-center justify-between">
          <div className="flex items-center">
            <div className="mr-3 h-8 w-1.5 rounded-full bg-[#004942]" />
            <h2 className="text-3xl font-bold text-white">Catégories</h2>
          </div>
          <Link
            href="/produits"
            className="hidden items-center text-white transition-all duration-300 hover:text-green-200 sm:flex"
          >
            <span className="mr-2">Tous les produits</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link key={category.id} href={`/produits/categorie/${category.slug}`} className="block group">
              <div className="relative flex flex-col overflow-hidden rounded-lg bg-[#004942] shadow-md transition-transform duration-300 hover:scale-[1.02]">
                <div className="relative aspect-[16/10] overflow-hidden">
                  <Image
                    src={getCategoryImageUrl(category)}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#004942] to-transparent opacity-30 group-hover:opacity-50 transition-opacity" />
                </div>
                <div className="flex flex-grow items-center justify-between p-4">
                  <h3 className="text-lg font-medium text-white">{category.name}</h3>
                  <div className="rounded-full bg-white/10 p-2 text-white group-hover:bg-white/20 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/produits"
            className="inline-flex items-center rounded-lg bg-[#004942] px-5 py-2.5 text-white transition-colors hover:bg-[#00594f]"
          >
            <span>Tous les produits</span>
            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

// SSR Features Banner
function FeaturesBanner() {
  const features = [
    { id: '1', title: 'Produits 100% naturels', description: "Tous nos produits sont issus d'agriculture biologique, sans pesticides ni additifs.", icon: '🌿' },
    { id: '2', title: 'Qualité certifiée', description: 'Nos produits sont régulièrement testés en laboratoire pour garantir leur qualité et conformité.', icon: '✓' },
    { id: '3', title: 'Livraison express', description: 'Expédition sous 24-48h pour toutes vos commandes en France métropolitaine.', icon: '🚚' },
    { id: '4', title: 'Paiement sécurisé', description: 'Transactions 100% sécurisées avec système de paiement crypté et remboursement garanti.', icon: '🔒' },
  ];

  return (
    <section className="py-16 bg-[#012730] relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white inline-block relative">
            Pourquoi choisir Chanvre Vert
            <span className="block h-1 bg-[#004942] mt-2 mx-auto w-full" />
          </h2>
          <p className="mt-4 text-white/80 max-w-2xl mx-auto">
            Nous nous engageons à vous offrir la meilleure expérience à chaque étape de votre commande
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div key={feature.id} className="relative flex flex-col overflow-hidden rounded-lg bg-[#023440] p-6 shadow-md border border-[#004942]/20 h-full">
              <div className="absolute top-0 left-0 h-1 bg-[#004942] w-full" />
              <div className="mx-auto mb-4 p-4 rounded-full bg-[#004942]/40 text-white text-2xl">
                {feature.icon}
              </div>
              <div className="text-center">
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-white/80 text-sm">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// SSR Social Proof Section
function SocialProofSection() {
  const stores = [
    {
      name: "Chanvre Vert Bergues",
      location: "Bergues, Nord",
      rating: 4.9,
      reviewCount: 127,
      googleLink: "https://g.page/r/CQbZdFkj-OQSEB0/review",
      reviewText: "Très bons produits, personnel compétent et accueillant. Je recommande vivement !",
      reviewAuthor: "Marie D."
    },
    {
      name: "Chanvre Vert Wormhout",
      location: "Wormhout, Nord",
      rating: 4.8,
      reviewCount: 98,
      googleLink: "https://g.page/r/CQbZdFkj-OQSEB0/review",
      reviewText: "Superbe boutique avec un large choix. Les conseils sont précieux et adaptés à mes besoins.",
      reviewAuthor: "Thomas L."
    }
  ];

  return (
    <section className="py-16 bg-[#00343f] relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Nos clients parlent de nous</h2>
          <p className="text-white/80 max-w-2xl mx-auto">
            Découvrez les avis de nos clients sur nos boutiques physiques et rejoignez notre communauté satisfaite.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {stores.map(store => (
            <div key={store.name} className="bg-[#00454f] rounded-lg overflow-hidden shadow-lg flex flex-col h-full">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{store.name}</h3>
                    <div className="flex items-center text-white/80 mt-1">
                      <span className="text-sm">📍 {store.location}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="text-yellow-400">
                        {star <= store.rating ? '★' : '☆'}
                      </span>
                    ))}
                    <span className="ml-2 text-white font-medium">{store.rating.toFixed(1)}</span>
                  </div>
                  <p className="text-white/70 text-sm mt-1">
                    Basé sur {store.reviewCount} avis
                  </p>
                </div>
                
                <div className="mt-4 bg-[#003945] p-4 rounded-lg">
                  <p className="text-white/90 italic text-sm">&quot;{store.reviewText}&quot;</p>
                  <p className="text-white/70 text-sm mt-2">- {store.reviewAuthor}</p>
                </div>
              </div>
              
              <div className="mt-auto p-4 border-t border-[#005965]">
                <a 
                  href={store.googleLink} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between text-white hover:text-green-300 transition-colors"
                >
                  <span>Voir tous les avis sur Google</span>
                  <span>↗</span>
                </a>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-white/70 text-sm max-w-2xl mx-auto">
            Nous sommes fiers de la confiance que nos clients nous accordent. 
            Consultez nos avis Google pour voir pourquoi ils nous choisissent.
          </p>
        </div>
      </div>
    </section>
  );
}

// Loading fallback for FeaturedProducts
function FeaturedProductsSkeleton() {
  return (
    <section className="w-full bg-[#00333e] py-16 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center">
            <div className="w-1.5 h-8 bg-[#004942] rounded-full mr-3" />
            <div className="h-8 w-56 bg-gray-700 rounded-md animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-800 rounded-lg overflow-hidden h-[420px] animate-pulse">
              <div className="h-64 bg-gray-700 w-full" />
              <div className="p-4">
                <div className="h-6 bg-gray-700 rounded w-3/4 mb-4" />
                <div className="h-4 bg-gray-700 rounded w-1/2 mb-6" />
                <div className="h-10 bg-gray-700 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      {/* Hero section - SSR (already was) */}
      <ImageHero />
      
      {/* Featured Products - SSR with Suspense fallback */}
      <Suspense fallback={<FeaturedProductsSkeleton />}>
        <FeaturedProducts />
      </Suspense>
      
      {/* Category Grid - SSR (static data) */}
      <CategoryGrid />
      
      {/* Features Banner - SSR (static data) */}
      <FeaturesBanner />
      
      {/* Social Proof - SSR (static data) */}
      <SocialProofSection />
    </>
  );
}
