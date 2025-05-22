import React from 'react';
import { Metadata } from 'next';
import { getProductBySlug } from '@/services/api';
import ProductPageClient from '@/app/produits/[slug]/product-page-client';
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
  const paramsResolved = await params;
  const slug = paramsResolved.slug;
  return <ProductPageClient slug={slug} />;
}
