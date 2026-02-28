import { Suspense } from 'react';
import ImageHero from "@/components/Hero/ImageHero";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import PremiumSelection from "@/components/sections/PremiumSelection";
import { GlobalSearch } from "@/components/GlobalSearch/GlobalSearch";
import { generatePageMetadata } from '@/lib/metadata';
import { getCategories, fallbackCategories } from '@/services/api';
import type { Category } from '@/types/product';
import { WebSiteSchema, LocalBusinessSchema, BreadcrumbSchema } from '@/components/SEO';

import Link from 'next/link';
import Image from 'next/image';

// ISR: Revalidate every hour (3600 seconds)
export const revalidate = 3600;

// SEO metadata with canonical URL
export const metadata = generatePageMetadata({
  title: 'CBD de Qualité - Fleurs, Huiles et Infusions',
  description: 'Chanvre Vert, votre CBD de qualité en France : fleurs, huiles, résines et infusions certifiées. Livraison express 24-48h. Testé en laboratoire, noté 4.9/5 sur Google.',
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
      reviewCount: 126,
      googleLink: "https://www.google.com/search?rlz=1C1GCEA_enFR1194FR1194&sca_esv=903e5a2d5ddaaca0&sxsrf=ANbL-n4Lk9QmJvLwHaV9iLkIwSfkJDrSzQ:1768557870321&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qORt4ZOlKQ85VoGFnBxgdfnJb_VMPY5XULgSnSMJrfMiCHtDogt0QTbK4E6f8Zqgzz2_am1vvV8vzWaxI1BlTvthbJky_cv50TIUtRiiO7nmp0Wj8Zg%3D%3D&q=CHANVRE+VERT+by+CBD+BERGUOIS+Avis",
      reviewText: "Très bons produits, personnel compétent et accueillant. Je recommande vivement !",
      reviewAuthor: "Marie D."
    },
    {
      name: "Chanvre Vert Wormhout",
      location: "Wormhout, Nord",
      rating: 4.9,
      reviewCount: 56,
      googleLink: "https://www.google.com/search?sca_esv=903e5a2d5ddaaca0&rlz=1C1GCEA_enFR1194FR1194&sxsrf=ANbL-n6eREXFdCmDwNiQSX5bILB7C17kSg:1768557836551&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOY0h6GGcX94HOqOD1PS-sEXr8bZqE360JiGcnsL0X8bGsvxQ9h382aV0jmTx6teOWSnD_QkHPNd05vURNGsSXLyUV8mYV9-gv3LcyWsPKQAvGInrTw%3D%3D&q=Chanvre-vert+Wormhout+Avis",
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

// FAQ data for homepage - hardcoded (not CMS-driven)
const HOMEPAGE_FAQ = [
  {
    question: 'Qu\'est-ce que le CBD et est-ce légal en France ?',
    answer: 'Le CBD (cannabidiol) est un composé naturel extrait du chanvre. Contrairement au THC, le CBD n\'a aucun effet psychoactif. En France, la vente et la consommation de CBD sont parfaitement légales, à condition que le taux de THC soit inférieur à 0,3%, conformément à la réglementation européenne en vigueur depuis 2022.',
  },
  {
    question: 'Comment choisir son produit CBD de qualité ?',
    answer: 'Pour choisir un CBD de qualité, vérifiez trois critères essentiels : les analyses de laboratoire indépendant (taux de CBD, absence de contaminants), la méthode de culture (biologique de préférence), et la traçabilité du produit. Chez Chanvre Vert, chaque lot est accompagné de son certificat d\'analyse.',
  },
  {
    question: 'Quels sont les bienfaits reconnus du CBD ?',
    answer: 'Selon un rapport de l\'Organisation Mondiale de la Santé (OMS, 2018), le CBD présente un bon profil de sécurité et est étudié pour ses propriétés relaxantes, anti-inflammatoires et anxiolytiques. Il est utilisé par de nombreux consommateurs pour favoriser le sommeil, réduire le stress et soulager les tensions musculaires.',
  },
  {
    question: 'Combien de temps pour recevoir ma commande ?',
    answer: 'Toutes les commandes passées avant 14h sont expédiées le jour même. La livraison s\'effectue en 24 à 48 heures ouvrées pour la France métropolitaine. La livraison est offerte à partir de 50€ d\'achat. Un suivi par e-mail vous est envoyé dès l\'expédition de votre colis.',
  },
  {
    question: 'Vos produits CBD sont-ils testés en laboratoire ?',
    answer: 'Oui, 100% de nos produits sont testés par des laboratoires indépendants certifiés. Les analyses vérifient le taux exact de CBD, l\'absence de métaux lourds, pesticides et solvants, ainsi que le respect du seuil légal de THC (<0,3%). Les certificats sont disponibles sur chaque fiche produit.',
  },
  {
    question: 'Comment utiliser l\'huile CBD ?',
    answer: 'L\'huile CBD s\'utilise par voie sublinguale : déposez quelques gouttes sous la langue, maintenez 60 à 90 secondes avant d\'avaler. Cette méthode permet une absorption rapide (15-30 minutes). Commencez par une dose faible (2-3 gouttes) et augmentez progressivement selon vos besoins. Consultez un professionnel de santé en cas de doute.',
  },
];

// FAQ Section Component
function HomepageFAQ() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: HOMEPAGE_FAQ.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <section className="py-16 bg-[#012730] relative overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white inline-block relative">
            Questions fréquentes sur le CBD
            <span className="block h-1 bg-[#004942] mt-2 mx-auto w-full" />
          </h2>
          <p className="mt-4 text-white/80 max-w-2xl mx-auto">
            Tout ce que vous devez savoir avant de commander votre CBD de qualité
          </p>
        </div>

        <div className="max-w-3xl mx-auto bg-[#00454f] rounded-lg border border-[#005965]">
          {HOMEPAGE_FAQ.map((item, index) => (
            <details
              key={index}
              className="group border-b border-[#005965] last:border-b-0"
            >
              <summary className="w-full py-4 px-6 flex items-center justify-between text-left hover:bg-[#003a42] transition-colors cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                <span className="text-white font-medium pr-4">{item.question}</span>
                <svg
                  className="text-[#EFC368] flex-shrink-0 w-5 h-5 transition-transform group-open:rotate-180"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-6 pb-4 text-white/80 leading-relaxed">
                {item.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

// CBD Expertise & Statistics Section
function CBDExpertise() {
  const stats = [
    { value: '4.9/5', label: 'Note Google', detail: 'Sur 180+ avis clients vérifiés' },
    { value: '100%', label: 'Testés en labo', detail: 'Analyses indépendantes certifiées' },
    { value: '<0,3%', label: 'THC garanti', detail: 'Conforme à la législation européenne' },
    { value: '24-48h', label: 'Livraison', detail: 'Expédition express France métropolitaine' },
  ];

  return (
    <section className="py-16 bg-[#001e27] relative overflow-hidden">
      <div className="absolute top-0 right-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-[#004942] opacity-5" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white">
            Le CBD de qualité, notre expertise
          </h2>
          <p className="mt-4 text-white/80 max-w-2xl mx-auto">
            Depuis notre création, Chanvre Vert s&apos;engage à proposer des produits CBD parmi les plus qualitatifs du marché français.
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-6 bg-[#023440] rounded-lg border border-[#004942]/30">
              <div className="text-3xl md:text-4xl font-bold text-[#EFC368] mb-2">{stat.value}</div>
              <div className="text-white font-medium mb-1">{stat.label}</div>
              <div className="text-white/60 text-sm">{stat.detail}</div>
            </div>
          ))}
        </div>

        {/* Expert Content */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-[#023440] rounded-lg p-6 border border-[#004942]/30">
              <h3 className="text-xl font-semibold text-white mb-4">🔬 Qualité et traçabilité</h3>
              <p className="text-white/80 leading-relaxed mb-3">
                Le marché européen du CBD connaît une croissance estimée à <strong className="text-[#EFC368]">+30% par an</strong> selon les analyses sectorielles. Face à cette expansion, la traçabilité est devenue un enjeu majeur pour les consommateurs.
              </p>
              <p className="text-white/80 leading-relaxed">
                Chanvre Vert travaille exclusivement avec des producteurs certifiés et soumet chaque lot de production à des analyses en laboratoire indépendant, garantissant l&apos;absence de pesticides, métaux lourds et solvants résiduels.
              </p>
            </div>

            <div className="bg-[#023440] rounded-lg p-6 border border-[#004942]/30">
              <h3 className="text-xl font-semibold text-white mb-4">📋 Réglementation et sécurité</h3>
              <p className="text-white/80 leading-relaxed mb-3">
                L&apos;Organisation Mondiale de la Santé (OMS) a conclu dans son rapport de 2018 que le CBD <strong className="text-[#EFC368]">ne présente pas de potentiel d&apos;abus</strong> et possède un bon profil de sécurité.
              </p>
              <p className="text-white/80 leading-relaxed">
                En France, la réglementation encadre strictement la filière : seules les variétés de chanvre inscrites au catalogue européen sont autorisées, avec un taux de THC plafonné à 0,3% (arrêté du 30 décembre 2021, validé par le Conseil d&apos;État en janvier 2022).
              </p>
            </div>
          </div>

          {/* Sources */}
          <div className="mt-8 p-4 bg-[#012730] rounded-lg border border-[#004942]/20">
            <p className="text-white/50 text-xs">
              Sources : Organisation Mondiale de la Santé, «&nbsp;Cannabidiol (CBD) Critical Review Report&nbsp;», juin 2018 • Arrêté du 30 décembre 2021 relatif au chanvre (JORF) • Conseil d&apos;État, décision n°460055, janvier 2022 • Avis Google My Business vérifiés (février 2026).
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      {/* JSON-LD Structured Data */}
      <WebSiteSchema />
      <LocalBusinessSchema />
      <BreadcrumbSchema items={[{ name: 'Accueil', url: 'https://www.chanvre-vert.fr' }]} />

      {/* Hero section - SSR (already was) */}
      <ImageHero />

      {/* Mobile Search - visible only on mobile */}
      <section className="md:hidden bg-[#00333e] py-6 px-4">
        <GlobalSearch
          variant="hero"
          placeholder="Rechercher un produit..."
        />
      </section>

      {/* Featured Products - SSR with Suspense fallback */}
      <Suspense fallback={<FeaturedProductsSkeleton />}>
        <FeaturedProducts />
      </Suspense>

      {/* Premium Selection - SSR (after featured) */}
      <Suspense fallback={null}>
        <PremiumSelection />
      </Suspense>

      {/* Category Grid - SSR (static data) */}
      <CategoryGrid />

      {/* Features Banner - SSR (static data) */}
      <FeaturesBanner />

      {/* CBD Expertise & Statistics - SSR (static data) */}
      <CBDExpertise />

      {/* Social Proof - SSR (static data) */}
      <SocialProofSection />

      {/* FAQ Section with FAQPage Schema - SSR (static data) */}
      <HomepageFAQ />
    </>
  );
}
