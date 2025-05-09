'use client';

import React from 'react';
import { useCookieConsent } from '@/contexts/CookieConsentContext';

export const CookieBanner: React.FC = () => {
  const { acceptAll, rejectAll, setShowCookieManager, hasResponded } = useCookieConsent();

  if (hasResponded) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 p-5 max-w-md">
      <div>
        <div className="flex flex-col gap-4">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <p className="mb-2 font-medium">Nous utilisons des cookies 🍪</p>
            <p>
              Ce site utilise des cookies pour améliorer votre expérience de navigation, analyser le trafic et personnaliser le contenu. 
              Vous pouvez accepter tous les cookies, les refuser ou personnaliser vos choix.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <button 
              onClick={() => setShowCookieManager(true)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
              aria-label="Personnaliser mes choix de cookies"
            >
              Personnaliser
            </button>
            <div className="flex gap-2">
              <button 
                onClick={rejectAll}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                aria-label="Refuser tous les cookies"
              >
                Tout refuser
              </button>
              <button 
                onClick={acceptAll}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
                aria-label="Accepter tous les cookies"
              >
                Tout accepter
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
