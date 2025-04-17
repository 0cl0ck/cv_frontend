'use client';

import React from 'react';
import Link from 'next/link';

export default function PaymentCancelPage() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="mb-6 text-amber-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      
      <h1 className="text-3xl font-bold mb-6 text-neutral-900 dark:text-white">
        Paiement annulé
      </h1>
      
      <p className="text-lg mb-8">
        Votre paiement a été annulé. Aucun montant n'a été débité de votre compte.
      </p>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link 
          href="/panier"
          className="inline-block bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-md font-medium transition-colors"
        >
          Retour au panier
        </Link>
        
        <Link 
          href="/"
          className="inline-block bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-900 px-6 py-3 rounded-md font-medium transition-colors"
        >
          Continuer mes achats
        </Link>
      </div>
    </div>
  );
}
