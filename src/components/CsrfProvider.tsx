'use client';

import { useEffect } from 'react';
import { generateCsrfToken } from '@/lib/security/csrf';
import { secureLogger as logger } from '@/utils/logger';

/**
 * Composant pour initialiser et gérer le token CSRF
 * Ce composant doit être monté au niveau racine de l'application
 */
export default function CsrfProvider({ children }: { children: React.ReactNode }) {
  // Définir le cookie CSRF lors du chargement de la page
  useEffect(() => {
    // Fonction pour définir le cookie CSRF
    const setCsrfCookie = () => {
      try {
        // Vérifier si le cookie existe déjà
        const cookies = document.cookie.split(';');
        const csrfCookie = cookies.find(cookie => cookie.trim().startsWith('csrf-token='));
        
        // Si le cookie n'existe pas ou est proche de l'expiration, en générer un nouveau
        if (!csrfCookie) {
          // Générer un nouveau token
          const token = generateCsrfToken();
          
          // Calculer la date d'expiration (1 heure)
          const expires = new Date();
          expires.setTime(expires.getTime() + 60 * 60 * 1000);
          
          // Définir le cookie avec les paramètres appropriés
          document.cookie = `csrf-token=${token}; expires=${expires.toUTCString()}; path=/; samesite=strict`;
          
          logger.debug('[CSRF] Nouveau token CSRF généré et défini dans un cookie');
        } else {
          logger.debug('[CSRF] Token CSRF existant trouvé dans les cookies');
        }
      } catch (error) {
        console.error('[CSRF] Erreur lors de la définition du cookie CSRF:', error);
      }
    };
    
    // Définir le cookie au chargement initial
    setCsrfCookie();
    
    // Ajouter des écouteurs d'événements pour régénérer le token après certaines actions
    window.addEventListener('login-status-change', setCsrfCookie);
    window.addEventListener('focus', setCsrfCookie); // Réessayer quand l'onglet reprend le focus
    
    return () => {
      window.removeEventListener('login-status-change', setCsrfCookie);
      window.removeEventListener('focus', setCsrfCookie);
    };
  }, []);
  
  return <>{children}</>;
}
