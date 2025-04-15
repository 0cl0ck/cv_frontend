'use client';

import { Media } from '@/components/Media';
import { Button } from '@/components/ui/button';
import { Product } from '@/payload-types';
import { CartContext, Variation } from '@/providers/Cart/CartContext';
import { useTheme } from '@payloadcms/ui';
import React from 'react';
type Props = {
  product: Product;
};

export const ProductPage: React.FC<Props> = ({ product }) => {
  const cartContext = React.useContext(CartContext);
  const { theme } = useTheme();
  const [selectedVariation, setSelectedVariation] = React.useState<Variation | null>(null);

  if (!cartContext) {
    console.error('CartContext is not provided');
    return null;
  }

  const { addToCart } = cartContext;

  const handleAddToCart = () => {
    if (product.productType === 'variable' && !selectedVariation) {
      alert('Veuillez sélectionner une variation');
      return;
    }
    addToCart(product, selectedVariation, 1);
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
      <div className="flex">
        <div className="relative w-1/3">
          {product.images && product.images.length > 0 ? (
            <Media resource={product.images[0]} sizes="33vw" />
          ) : (
            <div className="flex items-center justify-center h-48 bg-gray-100 text-gray-500">
              No image
            </div>
          )}
        </div>

        <div className="w-1/2 pl-4">
          {product.meta?.description && (
            <p>
              {typeof product.meta.description === 'string'
                ? product.meta.description
                : 'No description'}
            </p>
          )}
          {product.variations && product.variations.length > 0 ? (
            <div className="mt-4">
              <h3 className="text-lg font-bold mb-2">Variations disponibles :</h3>
              <select
                className="w-full p-2 border rounded bg-[#002d4c] text-white hover:bg-[#003e6a] focus:bg-[#003e6a] transition-colors"
                onChange={(e) => {
                  const selected = product.variations?.find(
                    (variation) => variation.name === e.target.value,
                  );
                  setSelectedVariation(selected || null);
                }}
                defaultValue=""
              >
                <option value="" disabled>
                  Choisissez une variation
                </option>
                {product.variations.map((variation, index) => (
                  <option key={index} value={variation.name}>
                    {variation.name} - {variation.price} €
                  </option>
                ))}
              </select>
              {selectedVariation && (
                <p className="text-lg font-bold mt-4">{selectedVariation.price} €</p>
              )}
            </div>
          ) : (
            <p className="text-lg font-bold mb-4">{product.price} €</p>
          )}

          <Button variant="custom" className="rounded my-4" onClick={handleAddToCart}>
            Ajouter au panier
          </Button>
        </div>
      </div>
    </div>
  );
};
