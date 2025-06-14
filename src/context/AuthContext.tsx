'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';
import { secureLogger as logger } from '@/utils/logger';
import { httpClient } from '@/lib/httpClient';

// Type pour les utilisateurs connectés
type User = {
  id: string;
  email: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  collection?: string; // Ajout de la collection
};

// Type pour le contexte d'authentification
type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
  refreshAuth: () => Promise<void>;
  logout: () => Promise<void>;
};

const defaultAuthContext: AuthContextType = {
  isAuthenticated: false,
  user: null,
  loading: true,
  error: null,
  refreshAuth: async () => {},
  logout: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const useAuthContext = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      logger.debug('[AuthContext] Vérification authentification');
      const { data, status } = await httpClient.get('/auth/me', { withCsrf: true });

      if (status === 401) {
        logger.debug('[AuthContext] Utilisateur non authentifié');
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      if (data?.user) {
        logger.debug('[AuthContext] Utilisateur authentifié', { userId: data.user.id });
        setIsAuthenticated(true);
        setUser(data.user);
      } else {
        logger.debug('[AuthContext] Pas d\'utilisateur dans la réponse');
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (err) {
      logger.error('[AuthContext] Erreur authentification:', { 
        error: err instanceof Error ? err.message : String(err) 
      });
      setError(err instanceof Error ? err.message : String(err));
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await httpClient.post('/auth/logout', undefined, { withCsrf: true });
      setIsAuthenticated(false);
      setUser(null);
      window.dispatchEvent(new CustomEvent('auth-change', { detail: { isLoggedIn: false } }));
    } catch (err) {
      logger.error('[AuthContext] Erreur logout:', { 
        error: err instanceof Error ? err.message : String(err) 
      });
      setError('Erreur lors de la déconnexion');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    logger.debug('[AuthContext] Initialisation du contexte d\'authentification');
    fetchUser();

    const handleAuthChange = () => {
      logger.debug('[AuthContext] Changement d\'authentification détecté');
      fetchUser();
    };

    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('login-status-change', handleAuthChange);

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('login-status-change', handleAuthChange);
    };
  }, [fetchUser]);

  const contextValue = useMemo(
    () => ({ isAuthenticated, user, loading, error, refreshAuth, logout }),
    [isAuthenticated, user, loading, error, refreshAuth, logout]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
