import React from 'react';

interface Props {
  quantity: number;
  isInStock: boolean;
  isAddingToCart: boolean;
  isAddedToCart: boolean;
  onQuantityChange: (qty: number) => void;
  onAddToCart: () => void;
}

export default function AddToCartSection({
  quantity,
  isInStock,
  isAddingToCart,
  isAddedToCart,
  onQuantityChange,
  onAddToCart,
}: Props) {
  return (
    <div className="mb-6">
      {/* Out of Stock Banner - SEO FIX: Clear messaging, page still exists */}
      {!isInStock && (
        <div className="mb-4 p-4 rounded-lg bg-amber-900/30 border border-amber-600/50">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🕐</span>
            <span className="font-semibold text-amber-400">Rupture temporaire</span>
          </div>
          <p className="text-sm text-amber-200/80">
            Ce produit sera bientôt de retour en stock. Découvrez nos autres produits similaires ci-dessous.
          </p>
        </div>
      )}

      <div className="flex items-center">
        <div className="flex items-center border border-[#3A4A4F] rounded-md mr-4">
          <button
            onClick={() => onQuantityChange(quantity - 1)}
            disabled={quantity <= 1 || !isInStock}
            aria-label="Diminuer la quantité"
            className="px-3 py-2 text-[#F4F8F5] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#EFC368]"
          >
            -
          </button>
          <span className="px-3 py-2 text-[#F4F8F5]">{quantity}</span>
          <button
            onClick={() => onQuantityChange(quantity + 1)}
            disabled={!isInStock}
            aria-label="Augmenter la quantité"
            className="px-3 py-2 text-[#F4F8F5] disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#EFC368]"
          >
            +
          </button>
        </div>

        <button
          disabled={!isInStock || isAddingToCart}
          onPointerDown={onAddToCart}
          className={`flex-1 px-6 py-3 rounded-md font-medium transition-colors ${
            isInStock && !isAddingToCart
              ? 'bg-[#EFC368] hover:bg-[#D3A74F] text-[#001E27]'
              : 'bg-[#3A4A4F] text-[#F4F8F5] cursor-not-allowed'
          }`}
        >
          {isAddedToCart
            ? 'Produit ajouté ✓'
            : isAddingToCart
              ? 'Ajout en cours...'
              : isInStock
                ? 'Ajouter au panier'
                : 'Indisponible'}
        </button>
      </div>
    </div>
  );
}

