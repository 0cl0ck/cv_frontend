'use client';

import { useCallback } from 'react';
import useSWR, { SWRConfiguration, Revalidator } from 'swr';
import { fetchWithCsrf } from '@/utils/security/csrf';

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

// Configuration centrale pour le fetcher
const fetcher = async (url: string) => {
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
 * Hook d'authentification utilisant SWR pour la gestion du cache et de la revalidation
 * - Déduplication des requêtes
 * - Revalidation au focus
 * - Retry automatique en cas d'erreur
 * - Gestion fine des erreurs
 */
export function useAuth() {
  const { data, error, isValidating, mutate } = useSWR<{user: User}, AuthError>(
    '/api/auth/me', 
    fetcher, 
    {
      dedupingInterval: 60000,         // 1 minute de déduplication
      revalidateOnFocus: true,          // Revalidation quand l'onglet redevient actif
      focusThrottleInterval: 5000,      // Limiter à une revalidation toutes les 5 secondes
      errorRetryCount: 3,               // Nombre de tentatives en cas d'erreur
      errorRetryInterval: 5000,         // Intervalle entre les tentatives
      onErrorRetry: (error: AuthError, _key: string, _config: SWRConfiguration, revalidate: Revalidator, { retryCount }: { retryCount: number }) => {
        // Ne pas réessayer pour certains types d'erreurs
        if (error.type === 'unauthorized' || error.status === 404) return;
        
        // Exponential backoff
        const delay = Math.min(1000 * 2 ** retryCount, 30000);
        setTimeout(() => revalidate({ retryCount }), delay);
      },
    }
  );

  /**
   * Fonction pour rafraîchir manuellement les données utilisateur
   */
  const refresh = useCallback(() => {
    return mutate();
  }, [mutate]);
  
  /**
   * Fonction pour gérer le logout
   */
  const logout = useCallback(async () => {
    try {
      // Utiliser fetchWithCsrf pour ajouter l'en-tête CSRF automatiquement
      const response = await fetchWithCsrf('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin'
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la déconnexion');
      }
      
      // Invalider les données en cache
      await mutate(undefined, { revalidate: false });
      
      // Redirection (optionnelle - peut être gérée ailleurs)
      window.location.href = '/';
    } catch (err) {
      console.error('Erreur lors du logout:', err);
      throw err;
    }
  }, [mutate]);

  return {
    user: data?.user || null,
    loading: !data && !error && isValidating,
    error: error ? error.message : null,
    errorType: error?.type,
    isValidating,
    isAuthenticated: !!data?.user,
    refresh,
    logout
  };
}
