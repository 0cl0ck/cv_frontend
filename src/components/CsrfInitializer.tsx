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
        // Utiliser httpClient qui pointe déjà vers le backend
        const response = await httpClient.get('/csrf', {
          withCredentials: true // S'assurer que les cookies sont inclus
        });
        
        if (response.status !== 200) {
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

    // Regénérer les tokens lorsque l'état de connexion change
    const handleLoginStatusChange = () => {
      logger.debug('[CSRF] Changement de statut de connexion, rafraîchissement des tokens CSRF');
      initCsrf();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('login-status-change', handleLoginStatusChange);

    // Nettoyage
    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('login-status-change', handleLoginStatusChange);
    };
  }, []);
  
  // Ce composant ne rend rien visuellement
  return null;
}
