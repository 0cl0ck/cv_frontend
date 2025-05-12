'use client';

import { useCallback } from 'react';
import { useAuthContext } from '@/context/AuthContext';

export type User = {
  id: string;
  collection: string;
  email: string;
  firstName?: string;
  lastName?: string;
};

export type AuthError = {
  status?: number;
  message: string;
  type: 'timeout' | 'network' | 'unauthorized' | 'server' | 'unknown';
};

// Note: Cette fonction de fetcher n'est plus utilisée par le hook useAuth
// mais est conservée ici pour les composants qui pourraient encore l'utiliser
export const authFetcher = async (url: string) => {
  const controller = new AbortController();
  const { signal } = controller;
  
  // Créer un timeout de 10 secondes
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  
  try {
    const response = await fetch(url, { 
      credentials: 'include', // Utiliser 'include' pour transmettre les cookies même en cross-origin
      cache: 'no-store',
      signal 
    });
    
    // Nettoyer le timeout
    clearTimeout(timeoutId);
    
    // Gérer les erreurs HTTP
    if (!response.ok) {
      const error: AuthError = { 
        status: response.status,
        message: response.statusText || `Erreur HTTP ${response.status}`,
        type: response.status === 401 ? 'unauthorized' : 'server'
      };
      throw error;
    }
    
    return response.json();
  } catch (err) {
    // Nettoyer le timeout en cas d'erreur
    clearTimeout(timeoutId);
    
    // Créer un objet d'erreur structuré
    const error: AuthError = { 
      message: '',
      type: 'unknown'
    };
    
    if (err instanceof Error) {
      error.message = err.message;
      
      // Déterminer le type d'erreur
      if (err.name === 'AbortError') {
        error.type = 'timeout';
        error.message = 'La requête a pris trop de temps';
      } else if (err.message.includes('fetch')) {
        error.type = 'network';
        error.message = 'Impossible de se connecter au serveur';
      }
    } else if (typeof err === 'object' && err !== null) {
      // Gérer les erreurs déjà formatées
      return Promise.reject(err);
    }
    
    return Promise.reject(error);
  }
};

/**
 * Hook d'authentification utilisant le contexte global AuthContext
 * - Redirige vers le contexte global pour assurer une cohérence à travers l'application
 * - Conserve la même interface pour une transition en douceur
 * - Ne fait plus d'appels API directs, tout est géré par le contexte
 */
/**
 * Vérifier si un token JWT existe dans les cookies
 */
const hasAuthToken = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return document.cookie
    .split('; ')
    .some(cookie => cookie.startsWith('payload-token='));
};

/**
 * Version mise à jour du hook useAuth qui fait maintenant référence à notre contexte d'authentification global
 * Préserve la même interface pour éviter les ruptures de code existant
 */
export function useAuth() {
  // Utiliser le contexte d'authentification global
  const { 
    user, 
    isAuthenticated, 
    loading, 
    error, 
    refreshAuth, 
    logout 
  } = useAuthContext();
  
  // Vérifier si un token existe pour la compatibilité avec l'ancien code
  const hasToken = hasAuthToken();
  
  /**
   * Fonction de compatibilité qui simule l'ancien comportement de refresh
   */
  const compatRefresh = useCallback(() => {
    // Cette fonction appelle maintenant la fonction refreshAuth du contexte
    return refreshAuth();
  }, [refreshAuth]);
  
  // Retourner un objet avec la même structure que l'ancien hook pour garantir la compatibilité
  return {
    user: user || null,
    loading: loading,
    error: error || null,
    errorType: error ? 'unknown' : undefined,  // Simplifié par rapport à l'ancien hook
    isValidating: loading,  // Compatibilité avec l'ancien hook
    isAuthenticated: isAuthenticated && hasToken,  // Vérifier à la fois le contexte et le token
    refresh: compatRefresh,  // Nom inchangé pour maintenir la compatibilité avec l'API existante
    logout
  };
}
