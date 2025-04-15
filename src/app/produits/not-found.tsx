import React from 'react';
import Link from 'next/link';

export default function ProductNotFound() {
  return (
    <div className="bg-neutral-50 dark:bg-neutral-950 min-h-screen py-12">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold text-neutral-900 dark:text-white mb-6">Produit non trouvé</h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8">
          Le produit que vous recherchez n&apos;existe pas ou a été déplacé.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/produits"
            className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg transition-colors"
          >
            Voir tous les produits
          </Link>
          <Link
            href="/"
            className="px-6 py-3 bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700 text-neutral-900 dark:text-white font-medium rounded-lg transition-colors"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
