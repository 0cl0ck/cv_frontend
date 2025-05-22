'use client';

import { useEffect } from 'react';
import httpClient from '@/lib/httpClient';

/**
 * Composant pour initialiser le token CSRF côté serveur
 * Ce composant fait un appel unique à l'API /api/csrf lors du chargement de la page
 */
export default function CsrfInitializer() {
  useEffect(() => {
    const initCsrf = async () => {
      try {
        // Appel à l'API CSRF pour générer/renouveler les tokens
        await httpClient.get('/api/csrf', { cache: 'no-store' });
        console.log('[CSRF] Tokens CSRF côté serveur initialisés avec succès');
      } catch (error) {
        console.error('[CSRF] Erreur lors de l\'initialisation des tokens CSRF:', error);
      }
    };
    
    // Initialiser les tokens au chargement
    initCsrf();
    
    // Réinitialiser également quand la fenêtre reprend le focus
    const handleFocus = () => {
      console.log('[CSRF] Fenêtre a repris le focus, rafraîchissement des tokens CSRF');
      initCsrf();
    };
    
    window.addEventListener('focus', handleFocus);
    
    // Nettoyage
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);
  
  // Ce composant ne rend rien visuellement
  return null;
}
