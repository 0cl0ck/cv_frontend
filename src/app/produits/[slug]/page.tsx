import React from "react";
import { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts, getCategories } from "@/services/api";
import ProductDetailView from "./product-detail-view";
import { config } from "@/config/site";

// ISR: Revalidate pages every hour
export const revalidate = 3600;

// Allow dynamic params not generated at build time
export const dynamicParams = true;

// Pre-generate top products at build time (graceful fallback if API unavailable)
export async function generateStaticParams() {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.chanvre-vert.fr';
    const res = await fetch(
      `${API_URL}/api/products?limit=50&where[isActive][equals]=true`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.docs || []).map((p: { slug: string }) => ({ slug: p.slug }));
  } catch {
    // API unavailable at build time - pages will be generated on-demand
    console.warn('[Build] Could not fetch products for static generation, pages will be generated on-demand');
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  
  let product;
  try {
    product = await getProductBySlug(slug);
  } catch {
    // Fallback metadata if product fetch fails during build
    return {
      title: `Produit | Chanvre Vert`,
      description: 'Découvrez nos produits CBD de qualité premium.',
    };
  }
  const descriptionText =
    typeof product.description === "string"
      ? product.description
      : `Découvrez notre produit ${product.name}`;
  const imageUrl =
    product.mainImage?.url || product.galleryImages?.[0]?.url || "";

  return {
    title: `${product.name} | Chanvre Vert`,
    description: descriptionText,
    openGraph: {
      title: `${product.name} | Chanvre Vert`,
      description: descriptionText,
      images: imageUrl
        ? [{ url: imageUrl, width: 1200, height: 630, alt: product.name }]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      site: `@${config.social.twitter}`,
      title: `${product.name} | Chanvre Vert`,
      description: descriptionText,
      images: imageUrl ? [imageUrl] : [],
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Fetch produit d'abord (nécessaire pour les category IDs)
  let product;
  try {
    product = await getProductBySlug(slug);
  } catch {
    // API unavailable - show 404 instead of crashing the build
    notFound();
  }
  
  if (!product) {
    notFound();
  }

  // Extraire les IDs de catégorie pour les produits associés
  const categoryIds = Array.isArray(product.category)
    ? product.category.map((cat) => (typeof cat === "string" ? cat : cat.id))
    : product.category
      ? [typeof product.category === "string" ? product.category : product.category.id]
      : [];

  // Fetch parallèle des données secondaires
  const [categories, relatedProducts] = await Promise.all([
    getCategories(),
    getRelatedProducts(product.id, categoryIds, 4),
  ]);

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    image: product.mainImage?.url || "",
    offers: {
      "@type": "Offer",
      priceCurrency: config.payment.currency,
      price: product.price ?? 0,
      availability:
        (product.stock ?? 0) > 0
          ? "http://schema.org/InStock"
          : "http://schema.org/OutOfStock",
    },
    // Seulement inclure aggregateRating s'il y a des avis
    ...((product.reviewStats?.totalReviews ?? 0) > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.reviewStats?.averageRating,
        reviewCount: product.reviewStats?.totalReviews,
      },
    }),
  };

  return (
    <>
      <Script
        id="product-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailView
        product={product}
        relatedProducts={relatedProducts}
        categories={categories}
      />
    </>
  );
}

