'use client';

import React from 'react';
import { useCookieConsent, CookieCategory } from '@/contexts/CookieConsentContext';
import { IconX } from '@tabler/icons-react';

export const CookieManager: React.FC = () => {
  const { 
    consent, 
    updateConsent, 
    acceptAll, 
    rejectAll, 
    savePreferences, 
    showCookieManager, 
    setShowCookieManager 
  } = useCookieConsent();

  if (!showCookieManager) {
    return null;
  }

  // Fonction qui gère la mise à jour d'une catégorie spécifique
  const handleCategoryChange = (category: CookieCategory) => {
    if (category === 'necessary') return; // Les cookies nécessaires ne peuvent pas être désactivés
    
    updateConsent({
      [category]: !consent[category]
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold">Paramètres des cookies</h2>
          <button 
            onClick={() => setShowCookieManager(false)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            aria-label="Fermer"
          >
            <IconX size={24} />
          </button>
        </div>
        
        <div className="p-6">
          <p className="mb-6 text-gray-700 dark:text-gray-300">
            Vous pouvez personnaliser vos préférences en matière de cookies en activant ou désactivant les catégories ci-dessous.
            Les cookies nécessaires au fonctionnement du site ne peuvent pas être désactivés.
          </p>
          
          <div className="space-y-6">
            {/* Cookies nécessaires */}
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Cookies strictement nécessaires</h3>
                <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out bg-green-500 rounded-full">
                  <input 
                    type="checkbox"
                    checked
                    disabled
                    className="absolute w-0 h-0 opacity-0"
                  />
                  <span className="absolute right-1 top-1 w-4 h-4 transition duration-200 ease-in-out bg-white rounded-full"></span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ces cookies sont indispensables au fonctionnement du site et ne peuvent pas être désactivés.
                Ils permettent l&apos;utilisation des principales fonctionnalités du site (accès à votre compte, panier d&apos;achat, etc.).
              </p>
            </div>
            
            {/* Cookies d'analyse */}
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Cookies analytiques</h3>
                <div 
                  className={`relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer ${consent.analytics ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                  onClick={() => handleCategoryChange('analytics')}
                >
                  <input 
                    type="checkbox"
                    checked={consent.analytics}
                    onChange={() => handleCategoryChange('analytics')}
                    className="absolute w-0 h-0 opacity-0"
                  />
                  <span 
                    className={`absolute top-1 w-4 h-4 transition duration-200 ease-in-out bg-white rounded-full ${consent.analytics ? 'right-1' : 'left-1'}`}
                  ></span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ces cookies nous permettent d&apos;analyser l&apos;utilisation de notre site afin d&apos;en mesurer et d&apos;en améliorer la performance.
                Ils nous aident à comprendre comment les visiteurs interagissent avec notre site.
              </p>
            </div>
            
            {/* Cookies de personnalisation */}
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Cookies de personnalisation</h3>
                <div 
                  className={`relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer ${consent.personalization ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                  onClick={() => handleCategoryChange('personalization')}
                >
                  <input 
                    type="checkbox"
                    checked={consent.personalization}
                    onChange={() => handleCategoryChange('personalization')}
                    className="absolute w-0 h-0 opacity-0"
                  />
                  <span 
                    className={`absolute top-1 w-4 h-4 transition duration-200 ease-in-out bg-white rounded-full ${consent.personalization ? 'right-1' : 'left-1'}`}
                  ></span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ces cookies nous permettent de vous offrir une expérience personnalisée sur notre site 
                en mémorisant vos préférences.
              </p>
            </div>
            
            {/* Cookies publicitaires */}
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Cookies publicitaires</h3>
                <div 
                  className={`relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full cursor-pointer ${consent.advertising ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                  onClick={() => handleCategoryChange('advertising')}
                >
                  <input 
                    type="checkbox"
                    checked={consent.advertising}
                    onChange={() => handleCategoryChange('advertising')}
                    className="absolute w-0 h-0 opacity-0"
                  />
                  <span 
                    className={`absolute top-1 w-4 h-4 transition duration-200 ease-in-out bg-white rounded-full ${consent.advertising ? 'right-1' : 'left-1'}`}
                  ></span>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ces cookies permettent d&apos;interagir avec les modules sociaux présents sur le site et peuvent être utilisés 
                pour des fins publicitaires.
              </p>
            </div>
          </div>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-2 sm:justify-end">
            <button 
              onClick={rejectAll}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
              aria-label="Refuser tous les cookies"
            >
              Tout refuser
            </button>
            <button 
              onClick={acceptAll}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
              aria-label="Accepter tous les cookies"
            >
              Tout accepter
            </button>
            <button 
              onClick={savePreferences}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700 transition-colors"
              aria-label="Enregistrer mes préférences"
            >
              Enregistrer mes préférences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
