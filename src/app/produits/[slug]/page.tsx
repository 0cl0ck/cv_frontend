import React from 'react';
import { Metadata } from 'next';
import Script from 'next/script';
import { getProductBySlug, getRelatedProducts, getCategories } from '@/services/api';
import { notFound } from 'next/navigation';
import ProductDetailView from '@/app/produits/[slug]/product-detail-view';
import { config } from '@/config/site';
// Importation nécessaire pour les types mais elle n'est pas utilisée directement
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { RichTextContent } from '@/types/product';

// Génération des métadonnées dynamiques pour le SEO
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  try {
    // Attendre les paramètres avant d'utiliser leurs propriétés (Next.js 15)
    const paramsResolved = await params;
    const slug = paramsResolved.slug;
    
    const product = await getProductBySlug(slug);
    
    // Convertir la description en texte si c'est un objet RichTextContent
    const descriptionText = product.description 
      ? (typeof product.description === 'string' 
          ? product.description 
          : 'Découvrez notre produit de qualité')
      : `Découvrez notre produit ${product.name} - Chanvre Vert`;

    // Construire l'URL de l'image à partir de mainImage ou galleryImages
    const imageUrl = product.mainImage?.url || 
      (product.galleryImages && product.galleryImages.length > 0 ? product.galleryImages[0].url : '');
      
    return {
      title: `${product.name} | Chanvre Vert`,
      description: descriptionText,
      openGraph: {
        title: `${product.name} | Chanvre Vert`,
        description: descriptionText,
        images: imageUrl ? [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: product.name
          }
        ] : []
      },
      twitter: {
        card: 'summary_large_image',
        site: `@${config.social.twitter}`,
        title: `${product.name} | Chanvre Vert`,
        description: descriptionText,
        images: imageUrl ? [imageUrl] : []
      }
    };
  } catch  {
    return {
      title: 'Produit non trouvé | Chanvre Vert',
      description: 'Le produit que vous recherchez n\'existe pas ou a été déplacé.'
    };
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  try {
    // Attendre les paramètres avant d'utiliser leurs propriétés (Next.js 15)
    const paramsResolved = await params;
    const slug = paramsResolved.slug;
    
    // Récupérer les informations du produit
    const product = await getProductBySlug(slug);
    
    // Récupérer les catégories
    const categories = await getCategories();
    
    // Récupérer les produits associés
    // Gérer correctement la catégorie qui peut être un objet ou une chaîne
    let categoryIds: string[] = [];
    if (product.category) {
      if (Array.isArray(product.category)) {
        // Si c'est un tableau de catégories
        categoryIds = product.category.map(cat => 
          typeof cat === 'string' ? cat : cat.id
        );
      } else {
        // Si c'est une seule catégorie (objet ou chaîne)
        categoryIds = [typeof product.category === 'string' ? product.category : product.category.id];
      }
    }
    
    const relatedProducts = await getRelatedProducts(product.id, categoryIds, 4);

    const imageUrl = product.mainImage?.url ||
      (product.galleryImages && product.galleryImages.length > 0 ? product.galleryImages[0].url : '');

    const jsonLd = {
      "@context": "https://schema.org/",
      "@type": "Product",
      name: product.name,
      image: imageUrl,
      offers: {
        "@type": "Offer",
        priceCurrency: config.payment.currency,
        price: product.price ?? 0,
        availability: product.stock && product.stock > 0 ? "http://schema.org/InStock" : "http://schema.org/OutOfStock"
      },
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.reviewStats?.averageRating ?? 0,
        reviewCount: product.reviewStats?.totalReviews ?? 0
      }
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
  } catch  {
    // Si le produit n'est pas trouvé, renvoyer une page 404
    notFound();
  }
}
