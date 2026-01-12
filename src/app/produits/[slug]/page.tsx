import React from "react";
import { Metadata } from "next";
import Script from "next/script";
import { notFound } from "next/navigation";
import { getProductBySlug, getRelatedProducts, getCategories } from "@/services/api";
import ProductDetailView from "./product-detail-view";
import { config } from "@/config/site";
import { RichTextContent } from "@/types/product";

// ISR: Revalidate pages every hour
export const revalidate = 3600;

// Types for reviews in JSON-LD
type ReviewForSchema = {
  id: string;
  rating: number;
  reviewTitle: string;
  reviewContent?: string;
  userDisplayName?: string;
  createdAt: string;
};

// Helper to extract plain text from RichText for SEO
function extractTextFromRichText(content: RichTextContent | string | null | undefined): string {
  if (!content) return '';
  if (typeof content === 'string') return content.trim();
  if (!content.root || !content.root.children) return '';

  const extractText = (nodes: Array<Record<string, unknown>>): string => {
    return nodes.map(node => {
      if (typeof node.text === 'string') return node.text;
      if (Array.isArray(node.children)) {
        return extractText(node.children as Array<Record<string, unknown>>);
      }
      return '';
    }).join(' ');
  };

  return extractText(content.root.children).trim();
}

// Fetch approved reviews server-side for JSON-LD
async function getProductReviews(productId: string): Promise<ReviewForSchema[]> {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.chanvre-vert.fr';
  try {
    const res = await fetch(
      `${API_URL}/api/reviews?where[product][equals]=${productId}&where[isApproved][equals]=true&sort=-createdAt&limit=10&depth=1`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.docs || [];
  } catch {
    console.warn('[SEO] Could not fetch reviews for JSON-LD schema');
    return [];
  }
}

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
    product.mainImage?.url || 
    (product.galleryImages?.[0]?.image && typeof product.galleryImages[0].image !== 'string' 
      ? product.galleryImages[0].image.url 
      : typeof product.galleryImages?.[0]?.image === 'string' 
        ? product.galleryImages[0].image 
        : "");

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

  // Fetch parallèle des données secondaires + reviews pour JSON-LD
  const [categories, relatedProducts, reviews] = await Promise.all([
    getCategories(),
    getRelatedProducts(product.id, categoryIds, 4),
    getProductReviews(product.id),
  ]);

  // Extract description text (handles RichText Lexical format)
  const descriptionText = extractTextFromRichText(product.description);
  const seoDescription = descriptionText.length > 0
    ? descriptionText.substring(0, 300) // Limit for SEO
    : `Découvrez ${product.name} - CBD de qualité premium chez Chanvre Vert`;

  // Get SKU (from product or first variant)
  const productSku = product.sku || product.variants?.[0]?.sku || `CV-${product.id.slice(0, 8)}`;

  // Get price (from product or first variant)
  const productPrice = product.price ?? product.variants?.[0]?.price ?? 0;

  // Check stock (from product or any variant)
  const isInStock = product.productType === 'variable'
    ? product.variants?.some(v => (v.stock ?? 0) > 0) ?? false
    : (product.stock ?? 0) > 0;

  // Build JSON-LD with all required fields for Google Rich Results
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    description: seoDescription,
    image: product.mainImage?.url || "",
    sku: productSku,
    brand: {
      "@type": "Brand",
      name: "Chanvre Vert",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: config.payment.currency,
      price: productPrice,
      availability: isInStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: `https://www.chanvre-vert.fr/produits/${product.slug}`,
      seller: {
        "@type": "Organization",
        name: "Chanvre Vert",
      },
    },
    // aggregateRating seulement si avis existent
    ...((product.reviewStats?.totalReviews ?? 0) > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.reviewStats?.averageRating,
        reviewCount: product.reviewStats?.totalReviews,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    // review array seulement si avis existent
    ...(reviews.length > 0 && {
      review: reviews.map((r) => ({
        "@type": "Review",
        author: {
          "@type": "Person",
          name: r.userDisplayName || "Client vérifié",
        },
        datePublished: r.createdAt,
        reviewRating: {
          "@type": "Rating",
          ratingValue: r.rating,
          bestRating: 5,
          worstRating: 1,
        },
        reviewBody: r.reviewContent || r.reviewTitle,
        name: r.reviewTitle,
      })),
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

