/**
 * Utilitaires d'authentification pour le serveur
 * Ce fichier contient uniquement du code serveur et ne doit pas importer de hooks React
 */

import { jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

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
 * Secret partagé avec PayloadCMS pour la vérification des tokens
 */
const getJWTSecret = () => {
  const secret = process.env.PAYLOAD_SECRET;
  if (!secret) {
    throw new Error('PAYLOAD_SECRET is not defined in environment variables');
  }
  return new TextEncoder().encode(secret);
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
        algorithms: ['HS256'], // Restriction aux algorithmes sécurisés
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
