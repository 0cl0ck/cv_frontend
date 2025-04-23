'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Type pour le contexte
interface PageLoadingContextType {
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

// Création du contexte avec des valeurs par défaut
const PageLoadingContext = createContext<PageLoadingContextType>({
  isLoading: false,
  setIsLoading: () => {},
});

// Hook pour utiliser le contexte
export const usePageLoading = () => useContext(PageLoadingContext);

// Props pour le provider
interface PageLoadingProviderProps {
  children: ReactNode;
}

// Provider component
export const PageLoadingProvider: React.FC<PageLoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <PageLoadingContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 bg-white/80 dark:bg-neutral-900/80 z-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}
    </PageLoadingContext.Provider>
  );
};
