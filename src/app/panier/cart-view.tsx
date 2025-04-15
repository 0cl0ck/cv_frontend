'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartContext } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

export default function CartView() {
  const { cart, updateQuantity, removeItem, clearCart } = useCartContext();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Gestion de la quantité
  const handleQuantityChange = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(index, newQuantity);
  };

  // Supprimer un article
  const handleRemoveItem = (index: number) => {
    removeItem(index);
  };

  // Procéder au checkout
  const handleCheckout = () => {
    setIsCheckingOut(true);
    // Logique de checkout à implémenter
    // Redirection vers la page de checkout
    window.location.href = '/checkout';
  };

  if (cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-6 text-neutral-900 dark:text-white">Votre panier est vide</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-8">
          Vous n'avez aucun article dans votre panier.
        </p>
        <Link
          href="/produits"
          className="inline-block bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-md font-medium transition-colors"
        >
          Continuer mes achats
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-neutral-900 dark:text-white">Votre panier</h1>

      {/* En-tête du tableau (visible uniquement sur desktop) */}
      <div className="hidden md:grid md:grid-cols-[3fr_1fr_1fr_1fr_auto] gap-4 mb-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
        <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Produit</div>
        <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400 text-center">Prix</div>
        <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400 text-center">Quantité</div>
        <div className="text-sm font-medium text-neutral-600 dark:text-neutral-400 text-center">Total</div>
        <div></div>
      </div>

      {/* Liste des produits */}
      <div className="space-y-6 mb-8">
        {cart.items.map((item, index) => (
          <div key={`${item.productId}-${item.variantId || ''}-${index}`} className="grid grid-cols-1 md:grid-cols-[3fr_1fr_1fr_1fr_auto] gap-4 py-6 border-b border-neutral-200 dark:border-neutral-800">
            {/* Produit */}
            <div className="flex items-center">
              <div className="w-20 h-20 flex-shrink-0 bg-neutral-100 dark:bg-neutral-800 rounded-md overflow-hidden relative">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 80px, 80px"
                    className="object-cover"
                  />
                )}
              </div>
              <div className="ml-4">
                <h3 className="text-neutral-900 dark:text-white font-medium">
                  <Link href={`/produits/${item.slug}`} className="hover:text-primary">
                    {item.name}
                  </Link>
                </h3>
                {item.weight && (
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Poids: {item.weight}g
                  </p>
                )}
              </div>
            </div>

            {/* Prix */}
            <div className="flex md:justify-center items-center">
              <span className="md:hidden text-sm text-neutral-600 dark:text-neutral-400 mr-2">Prix:</span>
              <span className="text-neutral-900 dark:text-white">{formatPrice(item.price)}</span>
            </div>

            {/* Quantité */}
            <div className="flex md:justify-center items-center">
              <span className="md:hidden text-sm text-neutral-600 dark:text-neutral-400 mr-2">Quantité:</span>
              <div className="flex items-center border border-neutral-200 dark:border-neutral-700 rounded-md">
                <button
                  onClick={() => handleQuantityChange(index, item.quantity - 1)}
                  className="w-8 h-8 flex items-center justify-center text-neutral-600 dark:text-neutral-400"
                  aria-label="Diminuer la quantité"
                >
                  -
                </button>
                <span className="w-10 text-center text-neutral-900 dark:text-white">{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(index, item.quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center text-neutral-600 dark:text-neutral-400"
                  aria-label="Augmenter la quantité"
                >
                  +
                </button>
              </div>
            </div>

            {/* Total */}
            <div className="flex md:justify-center items-center">
              <span className="md:hidden text-sm text-neutral-600 dark:text-neutral-400 mr-2">Total:</span>
              <span className="text-neutral-900 dark:text-white font-medium">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>

            {/* Supprimer */}
            <div className="flex md:justify-center items-center">
              <button
                onClick={() => handleRemoveItem(index)}
                className="text-red-500 hover:text-red-600 focus:outline-none"
                aria-label="Supprimer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Récapitulatif et actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="lg:col-start-2">
          <div className="bg-neutral-50 dark:bg-neutral-900 p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4 text-neutral-900 dark:text-white">Récapitulatif</h2>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Sous-total</span>
                <span className="text-neutral-900 dark:text-white">{formatPrice(cart.subtotal)}</span>
              </div>
              
              {cart.shipping && (
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">Livraison</span>
                  <span className="text-neutral-900 dark:text-white">{formatPrice(cart.shipping.cost)}</span>
                </div>
              )}
              
              <div className="border-t border-neutral-200 dark:border-neutral-800 pt-3 flex justify-between">
                <span className="font-bold text-neutral-900 dark:text-white">Total</span>
                <span className="font-bold text-neutral-900 dark:text-white">{formatPrice(cart.total)}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full bg-primary hover:bg-primary-dark text-white py-3 px-4 rounded-md font-medium transition-colors disabled:opacity-70"
              >
                {isCheckingOut ? 'Traitement en cours...' : 'Procéder au paiement'}
              </button>
              
              <Link
                href="/produits"
                className="block text-center w-full text-primary hover:text-primary-dark py-2 transition-colors"
              >
                Continuer mes achats
              </Link>
            </div>
          </div>
        </div>
        
        <div className="lg:col-start-1 lg:row-start-1">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={clearCart}
              className="bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 py-2 px-4 rounded-md transition-colors"
            >
              Vider le panier
            </button>
            
            {!cart.shipping && (
              <Link
                href="/livraison"
                className="bg-neutral-200 hover:bg-neutral-300 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 py-2 px-4 rounded-md transition-colors"
              >
                Calculer les frais de livraison
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
