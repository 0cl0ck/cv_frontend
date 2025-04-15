import React from 'react';
import { Metadata } from 'next';
import { getProductBySlug, getRelatedProducts, getCategories } from '@/services/api';
import { notFound } from 'next/navigation';
import ProductDetailView from '@/app/produits/[slug]/product-detail-view';

// Génération des métadonnées dynamiques pour le SEO
export async function generateMetadata({ 
  params 
}: { 
  params: { slug: string } 
}): Promise<Metadata> {
  try {
    const product = await getProductBySlug(params.slug);
    
    return {
      title: `${product.name} | Chanvre Vert`,
      description: product.description || `Découvrez notre produit ${product.name} - Chanvre Vert`,
      openGraph: {
        title: `${product.name} | Chanvre Vert`,
        description: product.description || `Découvrez notre produit ${product.name} - Chanvre Vert`,
        images: product.images && product.images.length > 0 ? [
          {
            url: typeof product.images[0] === 'string' 
              ? product.images[0] 
              : product.images[0].url,
            width: 1200,
            height: 630,
            alt: product.name
          }
        ] : []
      }
    };
  } catch (error) {
    return {
      title: 'Produit non trouvé | Chanvre Vert',
      description: 'Le produit que vous recherchez n\'existe pas ou a été déplacé.'
    };
  }
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  try {
    // Récupérer les informations du produit
    const product = await getProductBySlug(params.slug);
    
    // Récupérer les catégories
    const categories = await getCategories();
    
    // Récupérer les produits associés
    const categoryIds = product.category
      ? product.category
          .map(cat => typeof cat === 'string' ? cat : cat.id)
          .filter(id => id !== undefined) as string[]
      : [];
    
    const relatedProducts = await getRelatedProducts(product.id, categoryIds, 4);
    
    return (
      <ProductDetailView 
        product={product} 
        relatedProducts={relatedProducts}
        categories={categories} 
      />
    );
  } catch (error) {
    // Si le produit n'est pas trouvé, renvoyer une page 404
    notFound();
  }
}
