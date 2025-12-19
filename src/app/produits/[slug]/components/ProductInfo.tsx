import React from 'react';
import Link from 'next/link';
import { Category, Product, ProductVariation } from '@/types/product';
import { formatPrice } from '@/utils/formatPrice';
import { RichTextRenderer } from '@/components/RichTextRenderer/RichTextRenderer';
import AddToCartSection from './AddToCartSection';
import { GoldenCoinBadge } from '@/components/Christmas';

interface Props {
  product: Product;
  categoryDisplay: Category[];
  selectedVariation: ProductVariation | null;
  onVariationChange: (variation: ProductVariation) => void;
  quantity: number;
  onQuantityChange: (qty: number) => void;
  onAddToCart: () => void;
  isInStock: boolean;
  isAddingToCart: boolean;
  isAddedToCart: boolean;
}

export default function ProductInfo({
  product,
  categoryDisplay,
  selectedVariation,
  onVariationChange,
  quantity,
  onQuantityChange,
  onAddToCart,
  isInStock,
  isAddingToCart,
  isAddedToCart,
}: Props) {
  return (
    <div className="md:w-1/2 p-6 md:border-l border-[#3A4A4F]">
      <h1 className="text-3xl font-bold text-[#F4F8F5] mb-4">{product.name}</h1>

      {categoryDisplay.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {categoryDisplay.map((cat, index) => (
            <Link
              key={index}
              href={`/produits/categorie/${(cat as Category).slug}`}
              className="inline-block px-3 py-1 text-sm bg-[#3A4A4F] rounded-full text-[#F4F8F5] hover:bg-[#014842] transition-colors"
            >
              {(cat as Category).name}
            </Link>
          ))}
        </div>
      )}

      <div className="mb-6">
        {product.productType === 'variable' ? (
          <div className="text-2xl font-bold text-[#EFC368]">
            {selectedVariation ? formatPrice(selectedVariation.price) : 'Sélectionnez une option'}
          </div>
        ) : (
          <div className="text-2xl font-bold text-[#EFC368]">
            {product.price ? formatPrice(product.price) : 'Prix sur demande'}
          </div>
        )}
      </div>

      {product.description && (
        <div className='mb-6'>
          <div className="prose prose-invert !text-white prose-p:text-white prose-headings:text-white prose-li:text-white prose-strong:text-white">
            <RichTextRenderer content={product.description} />
          </div>
        </div>
      )}

      {product.productType === 'variable' && product.variants && product.variants.length > 0 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#F4F8F5] mb-2">
            Options
          </label>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variation: ProductVariation) => (
              <button
                key={variation.id}
                onClick={() => onVariationChange(variation)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedVariation?.id === variation.id
                    ? 'bg-[#03745C] text-[#F4F8F5]'
                    : 'bg-[#3A4A4F] text-[#F4F8F5] hover:bg-[#014842]'
                } ${
                  variation.stock !== undefined && variation.stock <= 0
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
                disabled={variation.stock !== undefined && variation.stock <= 0}
              >
                {variation.weight ? `${variation.weight}g` : `Option ${variation.id}`}
                {variation.stock !== undefined && variation.stock <= 0 && ' (Épuisé)'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Badge Noël - Chasse à la Pièce d'Or */}
      {selectedVariation?.weight && categoryDisplay.length > 0 && (
        <GoldenCoinBadge
          weight={selectedVariation.weight * quantity}
          categorySlug={categoryDisplay[0]?.slug}
        />
      )}

      <AddToCartSection
        quantity={quantity}
        onQuantityChange={onQuantityChange}
        onAddToCart={onAddToCart}
        isInStock={isInStock}
        isAddingToCart={isAddingToCart}
        isAddedToCart={isAddedToCart}
      />

      <div className="border-t border-[#3A4A4F] pt-6 mt-6">
        <h2 className="text-lg font-semibold text-[#F4F8F5] mb-4">Informations produit</h2>
        {product.productType === 'simple' && typeof product.stock === 'number' && (
          <div className="mb-2 flex items-center">
            <span className="text-sm text-[#F4F8F5] mr-2">Disponibilité:</span>
            <span
              className={`text-sm font-medium ${
                product.stock > 0 ? 'text-green-600' : 'text-red-500'
              }`}
            >
              {product.stock > 0 ? 'En stock' : 'Rupture de stock'}
            </span>
          </div>
        )}
        {product.category && Array.isArray(product.category) && product.category.length > 0 && (
          <div className="mb-2 flex items-center">
            <span className="text-sm text-[#F4F8F5] mr-2">Catégorie:</span>
            <span className="text-sm text-[#F4F8F5]">
              {categoryDisplay.map((cat: Category) => cat.name).join(', ')}
            </span>
          </div>
        )}
        {product.productDetails && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            {product.productDetails && typeof product.productDetails.cbdContent === 'number' && (
              <div className="flex items-center">
                <span className="text-sm text-[#F4F8F5] mr-2">Taux de CBD:</span>
                <span className="text-sm font-medium text-[#F4F8F5]">
                  {product.productDetails.cbdContent}%
                </span>
              </div>
            )}
            {product.productDetails && typeof product.productDetails.thcContent === 'number' && (
              <div className="flex items-center">
                <span className="text-sm text-[#F4F8F5] mr-2">Taux de THC:</span>
                <span className="text-sm font-medium text-[#F4F8F5]">
                  {product.productDetails.thcContent}%
                </span>
              </div>
            )}
            {product.productDetails && typeof product.productDetails.strain === 'string' && product.productDetails.strain !== 'na' && (
              <div className="flex items-center">
                <span className="text-sm text-[#F4F8F5] mr-2">Type de souche:</span>
                <span className="text-sm font-medium text-[#F4F8F5]">
                  {(
                    {
                      sativa: 'Sativa',
                      indica: 'Indica',
                      hybrid: 'Hybride',
                    } as Record<string, string>
                  )[product.productDetails.strain] || product.productDetails.strain}
                </span>
              </div>
            )}
            {product.productDetails && typeof product.productDetails.origin === 'string' && (
              <div className="flex items-center">
                <span className="text-sm text-[#F4F8F5] mr-2">Origine:</span>
                <span className="text-sm font-medium text-[#F4F8F5]">
                  {product.productDetails.origin}
                </span>
              </div>
            )}
            {product.productDetails && typeof product.productDetails.cultivation === 'string' && (
              <div className="flex items-center">
                <span className="text-sm text-[#F4F8F5] mr-2">Mode de culture:</span>
                <span className="text-sm font-medium text-[#F4F8F5]">
                  {(
                    {
                      indoor: 'Indoor',
                      outdoor: 'Outdoor',
                      greenhouse: 'Greenhouse',
                    } as Record<string, string>
                  )[product.productDetails.cultivation] || product.productDetails.cultivation}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
