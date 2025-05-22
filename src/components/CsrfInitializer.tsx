'use client';

import { useEffect } from 'react';
import { secureLogger as logger } from '@/utils/logger';
import { httpClient } from '@/lib/httpClient';

/**
 * Composant pour initialiser le token CSRF côté serveur
 * Ce composant fait un appel unique à l'API /api/csrf lors du chargement de la page
 */
export default function CsrfInitializer() {
  useEffect(() => {
    const initCsrf = async () => {
      try {
        const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3001';
        const response = await fetch(`${frontendUrl}/api/csrf`, {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        logger.info('[CSRF] Tokens CSRF côté serveur initialisés avec succès');
      } catch (error) {
        console.error('[CSRF] Erreur lors de l\'initialisation des tokens CSRF:', error);
      }
    };
    
    // Initialiser les tokens au chargement
    initCsrf();
    
    // Réinitialiser également quand la fenêtre reprend le focus
    const handleFocus = () => {
      logger.debug('[CSRF] Fenêtre a repris le focus, rafraîchissement des tokens CSRF');
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
