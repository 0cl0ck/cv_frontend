'use client';

import React from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Log error for monitoring
  React.useEffect(() => {
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#001E27] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Error icon */}
        <div className="mb-6">
          <span className="text-6xl">⚠️</span>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4">
          Une erreur est survenue
        </h1>
        
        <p className="text-white/70 mb-8">
          Nous sommes désolés, quelque chose s&apos;est mal passé. 
          Notre équipe a été notifiée et travaille à résoudre le problème.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-[#EFC368] hover:bg-[#d4a84a] text-black font-semibold rounded-lg transition-colors"
          >
            Réessayer
          </button>
          
          <Link
            href="/"
            className="px-6 py-3 bg-[#003830] hover:bg-[#004942] text-white font-semibold rounded-lg transition-colors"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
        
        {/* Error digest for debugging (production) */}
        {error.digest && (
          <p className="mt-8 text-xs text-white/40">
            Code erreur: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
