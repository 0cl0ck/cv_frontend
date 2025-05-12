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

      const response = await fetch('/api/auth/me', {
        credentials: 'include',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store',
          'X-Auth-Timestamp': Date.now().toString(),
        },
      });

      if (!response.ok) {
        console.log('[AuthContext] Réponse API non-OK:', response.status);
        if (response.status === 401) {
          setIsAuthenticated(false);
          setUser(null);
        } else {
          throw new Error(`Erreur lors de la récupération des données: ${response.status}`);
        }
        return;
      }

      const data = await response.json();
      console.log('[AuthContext] Données utilisateur reçues:', data);

      if (data?.user) {
        setIsAuthenticated(true);
        setUser(data.user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
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
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
      });
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
