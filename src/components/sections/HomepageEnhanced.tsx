"use client";

import { HoverEffect } from "@/components/ui/hover-effect";
import { WobbleCard } from "@/components/ui/wobble-card";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import Link from "next/link";
import Image from "next/image";

/* ────────────────────────────────────────
 * 1. CategoryGridEnhanced — HoverEffect
 * ──────────────────────────────────────── */

interface CategoryItem {
  id: string;
  slug: string;
  name: string;
  imageUrl: string;
}

export function CategoryGridEnhanced({
  categories,
}: {
  categories: CategoryItem[];
}) {
  const items = categories.map((category) => ({
    id: category.id,
    content: (
      <Link href={`/produits/categorie/${category.slug}`} className="block group">
        <div className="relative flex flex-col overflow-hidden rounded-lg bg-[#004942] shadow-md transition-transform duration-300 hover:scale-[1.02]">
          <div className="relative aspect-[16/10] overflow-hidden">
            <Image
              src={category.imageUrl}
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
    ),
  }));

  return (
    <HoverEffect
      items={items}
      className="grid grid-cols-1 gap-6 md:gap-8 sm:grid-cols-2 lg:grid-cols-3"
      highlightColor="rgba(0, 73, 66, 0.3)"
    />
  );
}

/* ────────────────────────────────────────
 * 2. FeaturesBannerEnhanced — WobbleCard
 * ──────────────────────────────────────── */

interface FeatureItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export function FeaturesBannerEnhanced({
  features,
}: {
  features: FeatureItem[];
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {features.map((feature) => (
        <WobbleCard
          key={feature.id}
          className="relative flex flex-col overflow-hidden rounded-lg bg-[#023440] p-6 shadow-md border border-[#004942]/20 h-full cursor-default"
          maxRotation={3}
        >
          <div className="absolute top-0 left-0 h-1 bg-[#004942] w-full" />
          <div className="mx-auto mb-4 p-4 rounded-full bg-[#004942]/40 text-white text-2xl">
            {feature.icon}
          </div>
          <div className="text-center">
            <h3 className="text-xl font-semibold text-white mb-3">
              {feature.title}
            </h3>
            <p className="text-white/80 text-sm">{feature.description}</p>
          </div>
        </WobbleCard>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────
 * 3. StatsGridEnhanced — AnimatedCounter
 * ──────────────────────────────────────── */

interface StatItem {
  value: string;
  numericValue: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  label: string;
  detail: string;
}

export function StatsGridEnhanced({ stats }: { stats: StatItem[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="text-center p-6 bg-[#023440] rounded-lg border border-[#004942]/30"
        >
          <div className="text-3xl md:text-4xl font-bold text-[#EFC368] mb-2">
            <AnimatedCounter
              value={stat.numericValue}
              prefix={stat.prefix}
              suffix={stat.suffix}
              decimals={stat.decimals ?? 0}
              duration={1.8}
            />
          </div>
          <div className="text-white font-medium mb-1">{stat.label}</div>
          <div className="text-white/60 text-sm">{stat.detail}</div>
        </div>
      ))}
    </div>
  );
}

/* ────────────────────────────────────────
 * 4. SocialProofEnhanced — CardSpotlight
 * ──────────────────────────────────────── */

interface StoreReview {
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  googleLink: string;
  reviewText: string;
  reviewAuthor: string;
}

export function SocialProofEnhanced({ stores }: { stores: StoreReview[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {stores.map((store) => (
        <CardSpotlight
          key={store.name}
          className="bg-[#00454f] rounded-lg overflow-hidden shadow-lg flex flex-col h-full"
          spotlightColor="rgba(239, 195, 104, 0.08)"
          spotlightSize={300}
        >
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
                    {star <= store.rating ? "★" : "☆"}
                  </span>
                ))}
                <span className="ml-2 text-white font-medium">
                  {store.rating.toFixed(1)}
                </span>
              </div>
              <p className="text-white/70 text-sm mt-1">
                Basé sur {store.reviewCount} avis
              </p>
            </div>

            <div className="mt-4 bg-[#003945] p-4 rounded-lg">
              <p className="text-white/90 italic text-sm">
                &quot;{store.reviewText}&quot;
              </p>
              <p className="text-white/70 text-sm mt-2">
                - {store.reviewAuthor}
              </p>
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
        </CardSpotlight>
      ))}
    </div>
  );
}
