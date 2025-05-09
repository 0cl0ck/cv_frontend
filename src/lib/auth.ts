import { useEffect, useState } from 'react';
import { jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

// Secret partagé avec PayloadCMS pour la vérification des tokens
// En production, utilisez process.env.PAYLOAD_SECRET
const getJWTSecret = () => {
  const secret = process.env.PAYLOAD_SECRET;
  if (!secret) {
    throw new Error('PAYLOAD_SECRET is not defined in environment variables');
  }
  return new TextEncoder().encode(secret);
};

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

/**
 * Types pour la vérification JWT
 */
export type JWTPayload = {
  id: string;
  email: string;
  collection: 'customers' | 'admins';
  exp: number;
};

/**
 * Extraction du token JWT à partir des cookies d'une requête
 */
export function getTokenFromCookies(req: NextRequest): string | null {
  // Payload CMS stocke le JWT dans un cookie nommé 'payload-token'
  const token = req.cookies.get('payload-token')?.value;
  return token || null;
}

/**
 * Vérification sécurisée d'un token JWT
 * 
 * @param token - Le token JWT à vérifier
 * @returns Le payload du token décodé et vérifié ou null si le token est invalide
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(
      token,
      getJWTSecret(),
      {
        algorithms: ['HS256'], // Restrictrion aux algorithmes sécurisés
      }
    );
    
    return payload as JWTPayload;
  } catch (error) {
    console.error('Erreur de vérification JWT:', error);
    return null;
  }
}

/**
 * Vérifie l'authentification d'une requête à partir du cookie JWT
 * 
 * @param req - La requête Next.js
 * @returns Le payload vérifié ou null si non authentifié
 */
export async function verifyAuth(req: NextRequest): Promise<JWTPayload | null> {
  const token = getTokenFromCookies(req);
  if (!token) return null;
  
  return await verifyToken(token);
}
