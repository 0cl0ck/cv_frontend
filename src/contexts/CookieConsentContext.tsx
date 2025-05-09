import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Définir les types de cookies
export type CookieCategory = 'necessary' | 'analytics' | 'personalization' | 'advertising';

export interface CookieConsent {
  necessary: boolean; // Toujours true car ce sont des cookies essentiels
  analytics: boolean;
  personalization: boolean;
  advertising: boolean;
}

interface CookieConsentContextType {
  consent: CookieConsent;
  hasResponded: boolean;
  updateConsent: (newConsent: Partial<CookieConsent>) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: () => void;
  openCookieManager: () => void;
  showCookieManager: boolean;
  setShowCookieManager: React.Dispatch<React.SetStateAction<boolean>>;
}

const defaultConsent: CookieConsent = {
  necessary: true, // Toujours true car ce sont des cookies essentiels
  analytics: false,
  personalization: false,
  advertising: false,
};

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export const useCookieConsent = () => {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
};

interface CookieConsentProviderProps {
  children: ReactNode;
}

export const CookieConsentProvider: React.FC<CookieConsentProviderProps> = ({ children }) => {
  // État pour stocker le consentement aux cookies
  const [consent, setConsent] = useState<CookieConsent>(defaultConsent);
  
  // État pour savoir si l'utilisateur a déjà répondu au bandeau
  const [hasResponded, setHasResponded] = useState<boolean>(false);
  
  // État pour afficher/masquer le gestionnaire de cookies
  const [showCookieManager, setShowCookieManager] = useState<boolean>(false);

  // Charger les préférences de cookies depuis le localStorage au chargement de la page
  useEffect(() => {
    const storedConsent = localStorage.getItem('cookie-consent');
    
    if (storedConsent) {
      try {
        const parsedConsent = JSON.parse(storedConsent);
        setConsent(parsedConsent);
        setHasResponded(true);
      } catch (error) {
        console.error('Erreur lors de la lecture des préférences de cookies:', error);
        // En cas d'erreur, réinitialiser aux valeurs par défaut
        localStorage.removeItem('cookie-consent');
      }
    }
    
    // Ajout de la fonction openCookieManager à l'objet window
    if (typeof window !== 'undefined') {
      const customWindow = window as unknown as Window & { openCookieManager: () => void };
      customWindow.openCookieManager = () => setShowCookieManager(true);
    }
    
    // Nettoyage lors du démontage du composant
    return () => {
      if (typeof window !== 'undefined') {
        const customWindow = window as unknown as Window & { openCookieManager?: () => void };
        delete customWindow.openCookieManager;
      }
    };
  }, []);

  // Mettre à jour le consentement aux cookies
  const updateConsent = (newConsent: Partial<CookieConsent>) => {
    setConsent(prev => ({
      ...prev,
      ...newConsent,
      necessary: true, // Les cookies nécessaires sont toujours acceptés
    }));
  };

  // Accepter tous les cookies
  const acceptAll = () => {
    const allAccepted: CookieConsent = {
      necessary: true,
      analytics: true,
      personalization: true,
      advertising: true,
    };
    
    setConsent(allAccepted);
    localStorage.setItem('cookie-consent', JSON.stringify(allAccepted));
    setHasResponded(true);
    setShowCookieManager(false);
    
    // Appliquer les préférences (ici, vous devriez appeler des fonctions pour activer les cookies)
    applyConsentPreferences(allAccepted);
  };

  // Rejeter tous les cookies (sauf les nécessaires)
  const rejectAll = () => {
    const allRejected: CookieConsent = {
      necessary: true,
      analytics: false,
      personalization: false,
      advertising: false,
    };
    
    setConsent(allRejected);
    localStorage.setItem('cookie-consent', JSON.stringify(allRejected));
    setHasResponded(true);
    setShowCookieManager(false);
    
    // Appliquer les préférences (ici, vous devriez appeler des fonctions pour désactiver les cookies)
    applyConsentPreferences(allRejected);
  };

  // Sauvegarder les préférences personnalisées
  const savePreferences = () => {
    localStorage.setItem('cookie-consent', JSON.stringify(consent));
    setHasResponded(true);
    setShowCookieManager(false);
    
    // Appliquer les préférences
    applyConsentPreferences(consent);
  };

  // Ouvrir le gestionnaire de cookies
  const openCookieManager = () => {
    setShowCookieManager(true);
  };

  // Fonction pour appliquer les préférences de consentement
  const applyConsentPreferences = (preferences: CookieConsent) => {
    // Ici, vous pouvez activer ou désactiver vos services d'analyse, de publicité, etc.
    // Par exemple, pour Google Analytics :
    if (preferences.analytics) {
      // Activer Google Analytics
      // window.gtag('consent', 'update', { analytics_storage: 'granted' });
    } else {
      // Désactiver Google Analytics
      // window.gtag('consent', 'update', { analytics_storage: 'denied' });
    }

    // Pour les cookies publicitaires
    if (preferences.advertising) {
      // Activer les cookies publicitaires
      // window.gtag('consent', 'update', { ad_storage: 'granted' });
    } else {
      // Désactiver les cookies publicitaires
      // window.gtag('consent', 'update', { ad_storage: 'denied' });
    }
  };

  const value = {
    consent,
    hasResponded,
    updateConsent,
    acceptAll,
    rejectAll,
    savePreferences,
    openCookieManager,
    showCookieManager,
    setShowCookieManager,
  };

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
};
