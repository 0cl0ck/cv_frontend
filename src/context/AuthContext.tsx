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
      
      // 🔬 DIAGNOSTIC: Vérifier l'état des cookies avant la requête
      const allCookies = document.cookie;
      const payloadTokenExists = allCookies.includes('payload-token');
      const csrfTokenExists = allCookies.includes('csrf-token');
      
      console.log('🔬 [AuthContext] DIAGNOSTIC fetchUser - État initial:', {
        timestamp: new Date().toISOString(),
        allCookies: allCookies || 'AUCUN COOKIE',
        payloadTokenExists,
        csrfTokenExists,
        userAgent: navigator.userAgent,
        origin: window.location.origin,
        currentUrl: window.location.href
      });

      logger.debug('[AuthContext] Appel /auth/me');
      const { data, status } = await httpClient.get('/auth/me', { withCsrf: true });
      
      // 🔬 DIAGNOSTIC: Logger la réponse détaillée
      console.log('🔬 [AuthContext] DIAGNOSTIC - Réponse /auth/me:', {
        timestamp: new Date().toISOString(),
        status,
        hasData: !!data,
        dataKeys: data ? Object.keys(data) : [],
        userExists: !!data?.user,
        userId: data?.user?.id,
        userEmail: data?.user?.email
      });

      if (status === 401) {
        console.log('🔬 [AuthContext] DIAGNOSTIC - 401 reçu, déconnexion');
        setIsAuthenticated(false);
        setUser(null);
        return;
      }
      logger.debug('[AuthContext] Données utilisateur reçues', { hasUser: !!data?.user });

      if (data?.user) {
        console.log('🔬 [AuthContext] DIAGNOSTIC - Utilisateur authentifié avec succès:', {
          userId: data.user.id,
          email: data.user.email
        });
        setIsAuthenticated(true);
        setUser(data.user);
      } else {
        console.log('🔬 [AuthContext] DIAGNOSTIC - Pas d\'utilisateur dans la réponse');
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (err) {
      // 🔬 DIAGNOSTIC: Logger l'erreur complète
      console.error('🔬 [AuthContext] DIAGNOSTIC - Erreur fetchUser complète:', {
        timestamp: new Date().toISOString(),
        errorMessage: err instanceof Error ? err.message : String(err),
        errorName: err instanceof Error ? err.name : 'Unknown',
        errorStack: err instanceof Error ? err.stack : undefined,
        // @ts-ignore - pour capturer les détails axios
        response: (err as any)?.response ? {
          status: (err as any).response.status,
          statusText: (err as any).response.statusText,
          headers: (err as any).response.headers,
          data: (err as any).response.data
        } : 'Pas de response axios'
      });
      
      console.error('[AuthContext] Erreur fetchUser:', err);
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
      console.error('[AuthContext] Erreur logout:', err);
      setError('Erreur lors de la déconnexion');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 🔬 DIAGNOSTIC: Logger l'initialisation du contexte
    console.log('🔬 [AuthContext] DIAGNOSTIC - Initialisation useEffect:', {
      timestamp: new Date().toISOString(),
      readyState: document.readyState,
      cookiesAtInit: document.cookie || 'AUCUN COOKIE',
      currentPath: window.location.pathname
    });
    
    fetchUser();

    const handleAuthChange = () => {
      // 🔬 DIAGNOSTIC: Logger les changements d'authentification
      console.log('🔬 [AuthContext] DIAGNOSTIC - Changement d\'authentification détecté:', {
        timestamp: new Date().toISOString(),
        cookiesAfterAuthChange: document.cookie || 'AUCUN COOKIE',
        payloadTokenExists: document.cookie.includes('payload-token'),
        currentPath: window.location.pathname
      });
      
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
