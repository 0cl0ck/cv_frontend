import React from 'react';
import { Product } from '@/types/product';
import { ProductCard } from '@/components/ProductCard/ProductCard';

interface Props {
  relatedProducts: Product[];
}

export default function RelatedProducts({ relatedProducts }: Props) {
  if (relatedProducts.length === 0) return null;

  return (
    <div className="mt-16 pt-12 border-t border-[#3A4A4F]">
      <h2 className="text-2xl font-bold text-[#F4F8F5] mb-8">Produits similaires</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {relatedProducts.map((relatedProduct, index) => (
          <ProductCard key={relatedProduct.id} product={relatedProduct} index={index} />
        ))}
      </div>
    </div>
  );
}
