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
import httpClient from '@/lib/httpClient';

// Type pour les utilisateurs connectés
type User = {
  id: string;
  email: string;
  role?: string;
  firstName?: string;
  lastName?: string;
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
      console.log('[AuthContext] Tentative de récupération des informations utilisateur');
      setLoading(true);
      setError(null);

      const data = await httpClient.get<{ user?: User }>(
        '/api/auth/me',
        {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store',
            'X-Auth-Timestamp': Date.now().toString(),
          },
        }
      );

      if (!data) {
        console.log('[AuthContext] Réponse API non-OK: pas de données');
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      if (!data.user) {
        console.log('[AuthContext] Utilisateur non authentifié');
          setIsAuthenticated(false);
          setUser(null);
      } else {
        console.log('[AuthContext] Données utilisateur reçues:', data);
        setIsAuthenticated(true);
        setUser(data.user);
      }
    } catch (err) {
      console.error('[AuthContext] Erreur fetchUser:', err);
      setError((err as Error).message);
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
      await httpClient.post('/api/auth/logout', {});
      setIsAuthenticated(false);
      setUser(null);
      window.dispatchEvent(new CustomEvent('auth-change', { detail: { isLoggedIn: false } }));
    } catch (err) {
      console.error('[AuthContext] Erreur logout:', err);
      setError('Erreur lors de la déconnexion');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();

    const handleAuthChange = () => {
      console.log('[AuthContext] Changement d\'authentification détecté');
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
