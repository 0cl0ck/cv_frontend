import React from 'react'
import { Metadata } from 'next'
import Script from 'next/script'
import {
  getProductBySlug,
  getRelatedProducts,
  getCategories
} from '@/services/api'
import ProductPageClient from '@/app/produits/[slug]/product-page-client'
import { config } from '@/config/site'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { RichTextContent } from '@/types/product'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const product    = await getProductBySlug(slug)
  const descriptionText = typeof product.description === 'string'
    ? product.description
    : `Découvrez notre produit ${product.name}`
  const imageUrl = product.mainImage?.url
    || product.galleryImages?.[0]?.url
    || ''

  return {
    title: `${product.name} | Chanvre Vert`,
    description: descriptionText,
    openGraph: {
      title:     `${product.name} | Chanvre Vert`,
      description,
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: product.name }] : []
    },
    twitter: {
      card:        'summary_large_image',
      site:        `@${config.social.twitter}`,
      title:       `${product.name} | Chanvre Vert`,
      description: descriptionText,
      images:      imageUrl ? [imageUrl] : []
    }
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  // --- fetch server side pour le fallback SWR
  const product         = await getProductBySlug(slug)
  const categories      = await getCategories()
  const relatedProducts = await getRelatedProducts(product.id, /* ids */ [], 4)

  const jsonLd = {
    "@context": "https://schema.org/",
    "@type":    "Product",
    name:       product.name,
    image:      product.mainImage?.url || '',
    offers: {
      "@type":        "Offer",
      priceCurrency: config.payment.currency,
      price:         product.price ?? 0,
      availability:  product.stock > 0 ? "http://schema.org/InStock" : "http://schema.org/OutOfStock"
    },
    aggregateRating: {
      "@type":       "AggregateRating",
      ratingValue:   product.reviewStats?.averageRating   ?? 0,
      reviewCount:   product.reviewStats?.totalReviews    ?? 0
    }
  }

  return (
    <>
      <Script id="product-jsonld" type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductPageClient
        slug={slug}
        fallback={{ product, categories, relatedProducts }}
      />
    </>
  )
}

