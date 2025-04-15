'use client';

import { CartContext } from '@/providers/Cart/CartContext';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/payload-types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useContext, useState } from 'react';

interface ProductDetailsProps {
  product: Product;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ product }) => {
  const cartContext = useContext(CartContext);
  const [selectedVariation, setSelectedVariation] = useState<number | null>(
    product.productType === 'variable' && product.variations ? 0 : null,
  );

  if (!cartContext) {
    console.error('CartContext is not provided');
    return null;
  }

  const { addToCart } = cartContext;

  const handleAddToCart = () => {
    if (product.productType === 'variable' && product.variations) {
      if (selectedVariation === null) {
        alert('Veuillez sélectionner une variation');
        return;
      }
      addToCart(product, product.variations[selectedVariation], 1);
    } else {
      addToCart(product, null, 1);
    }
  };

  const renderRichText = (content: unknown) => {
    if (
      !content || 
      typeof content !== 'object' || 
      !('root' in content) || 
      !content.root || 
      typeof content.root !== 'object' || 
      !('children' in content.root) || 
      !Array.isArray(content.root.children)
    ) return '';

    return content.root.children
      .map((child: Record<string, unknown>) => {
        if (child.type === 'paragraph') {
          return `<p>${(child.children as Array<Record<string, unknown>>)
            .map((c) => (c.type === 'text' ? c.text : ''))
            .join('')}</p>`;
        }
        return '';
      })
      .join('');
  };

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-4 flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
          <Link href="/produits" className="hover:text-primary">
            Produits
          </Link>
          <span>/</span>
          {product.category?.map((category, index) => (
            <div
              key={typeof category === 'string' ? category : category.id}
              className="flex items-center gap-2"
            >
              <Link
                href={`/produits?category=${typeof category === 'string' ? category : category.value}`}
                className="hover:text-primary"
              >
                {typeof category === 'string' ? category : category.name}
              </Link>
              {index < (product.category?.length || 0) - 1 && <span>/</span>}
            </div>
          ))}
        </div>
        <h1 className="mb-2 text-3xl font-bold text-neutral-900 dark:text-white">{product.name}</h1>

        {/* Prix et Stock */}
        {product.productType === 'simple' ? (
          <div className="mt-4 flex items-center gap-4">
            <span className="text-2xl font-bold text-primary">
              {product.price ? formatPrice(product.price) : 'Prix sur demande'}
            </span>
            {typeof product.stock === 'number' && (
              <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                {product.stock > 0 ? `${product.stock} en stock` : 'Rupture de stock'}
              </span>
            )}
          </div>
        ) : (
          product.variations && (
            <div className="mt-4">
              <div className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Sélectionnez une variante :
              </div>
              <div className="flex flex-wrap gap-2">
                {product.variations.map((variation, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedVariation(index)}
                    className={`rounded-lg border px-4 py-2 transition-colors ${
                      selectedVariation === index
                        ? 'border-[#002d4c] bg-[#002d4c] text-white'
                        : 'border-neutral-200 bg-white hover:border-[#002d4c] dark:border-neutral-700 dark:bg-neutral-800'
                    }`}
                  >
                    <div className="font-medium">{variation.name}</div>
                    <div className="text-sm">{formatPrice(variation.price)}</div>
                    {typeof variation.stock === 'number' && (
                      <div
                        className={`text-xs ${
                          variation.stock > 0
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-500'
                        }`}
                      >
                        {variation.stock > 0 ? `${variation.stock} en stock` : 'Rupture de stock'}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )
        )}

        {/* Description */}
        {product.description && (
          <div className="prose prose-neutral mt-8 max-w-none dark:prose-invert">
            <h2>Description</h2>
            <div
              dangerouslySetInnerHTML={{
                __html: renderRichText(product.description),
              }}
            />
          </div>
        )}

        {/* Taux de THC */}
        {product.thcContent !== undefined && (
          <div className="mt-6">
            <h2 className="mb-2 text-lg font-semibold">Taux de THC</h2>
            <div className="flex items-center gap-2">
              <div className="text-xl font-bold text-primary">{product.thcContent}%</div>
              {product.thcContent <= 0.3 && (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                  Légal en France
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bouton Ajouter au panier */}
      <Button
        onClick={handleAddToCart}
        variant="custom"
        className="mt-6 w-full"
        disabled={
          product.productType === 'variable'
            ? selectedVariation === null
            : product.stock !== undefined ||
              null ||
              (typeof product.stock === 'number' && product.stock <= 0)
        }
      >
        Ajouter au panier
      </Button>
    </div>
  );
};
