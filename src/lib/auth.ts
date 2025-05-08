import { useEffect, useState } from 'react';

type User = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        // Vérifier si le cookie auth-status est présent pour éviter une requête inutile
        const authCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('auth-status='));
          
        if (!authCookie || !authCookie.includes('logged-in')) {
          setUser(null);
          setLoading(false);
          return;
        }

        // Récupérer les informations de l'utilisateur à partir de l'API
        const response = await fetch('/api/auth/me');
        
        if (!response.ok) {
          if (response.status === 401) {
            setUser(null);
            return;
          }
          throw new Error('Erreur lors de la récupération des informations utilisateur');
        }
        
        const data = await response.json();
        setUser(data.user);
      } catch (err) {
        console.error('Erreur d\'authentification:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user
  };
}
