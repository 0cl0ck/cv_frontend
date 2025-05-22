'use client';

import React, { useMemo } from 'react';
import useSWR from 'swr';
import {
  getProductBySlug,
  getRelatedProducts,
  getCategories,
} from '@/services/api';
import ProductDetailView from './product-detail-view';

type Props = {
  slug: string;
};

export default function ProductPageClient({ slug }: Props) {
  const {
    data: product,
    error: productError,
  } = useSWR(slug, () => getProductBySlug(slug));

  const {
    data: categories,
    error: categoriesError,
  } = useSWR('categories', getCategories);

  const categoryIds = useMemo(() => {
    if (!product || !product.category) return [] as string[];
    if (Array.isArray(product.category)) {
      return product.category.map((cat) =>
        typeof cat === 'string' ? cat : cat.id
      );
    }
    return [typeof product.category === 'string' ? product.category : product.category.id];
  }, [product]);

  const {
    data: relatedProducts,
    error: relatedError,
  } = useSWR(
    product ? ['related', product.id, ...categoryIds] : null,
    () => getRelatedProducts(product!.id, categoryIds, 4)
  );

  if (productError || categoriesError || relatedError) {
    return <div className="py-12 text-center">Erreur lors du chargement.</div>;
  }

  if (!product || !categories || !relatedProducts) {
    return <div className="py-12 text-center">Chargement...</div>;
  }

  return (
    <ProductDetailView
      product={product}
      relatedProducts={relatedProducts}
      categories={categories}
    />
  );
}
