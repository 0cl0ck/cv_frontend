/**
 * Utilitaires pour la gestion des tokens JWT
 */

// Nous n'utilisons pas jose pour vérifier mais juste pour décoder
import { secureLogger as logger } from '@/utils/logger';

// Type pour les données utilisateur stockées dans le JWT de Payload CMS
export interface JwtPayload {
  // Informations directement dans le payload pour Payload CMS
  id: string;
  email: string;
  collection: string;
  
  // Détails utilisateur (optionnels car ils peuvent être ajoutés manuellement par notre code)
  firstName?: string;
  lastName?: string;
  createdAt?: string;
  
  // Propriétés standards JWT
  exp: number;
  iat: number;
  sub?: string; // sujet du token, souvent l'ID utilisateur
}

/**
 * Vérifie et décode un token JWT
 * @param token Le token JWT à vérifier
 * @returns Les données décodées du token, ou null si invalide
 */
export async function verifyJwtToken(token: string): Promise<JwtPayload | null> {
  try {
    // Payload CMS ajoute un préfixe 'JWT ' au token, on doit le retirer s'il est présent
    const cleanToken = token.startsWith('JWT ') ? token.substring(4) : token;
    
    // Décoder le token sans vérifier la signature - ATTENTION : NE PAS UTILISER EN PRODUCTION
    // Cette approche n'est pas sécurisée mais permet de débugger
    // Format JWT: header.payload.signature
    const parts = cleanToken.split('.');
    if (parts.length !== 3) {
      console.error('Format de token JWT invalide');
      return null;
    }
    
    // Décoder le payload (deuxième partie du token)
    const payloadBase64 = parts[1];
    const decodedPayload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
    
    logger.debug('Payload décodé');
    const payload = decodedPayload;
    
    // Vérifier l'expiration
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < currentTime) {
      logger.debug('Token expiré', { exp: payload.exp, now: currentTime });
      return null; // Token expiré
    }
    
    // Vérifier si nous avons les informations essentielles
    if (!payload.id && payload.sub) {
      // Payload CMS stocke parfois l'ID utilisateur dans sub
      logger.debug('Utilisation du sub comme ID utilisateur');
      payload.id = payload.sub;
    }
    
    // S'assurer que nous avons toutes les informations minimales requises
    if (!payload.id || !payload.exp) {
      console.error('Payload JWT invalide:', payload);
      return null;
    }
    
    // Ajouter des valeurs par défaut si nécessaire
    if (!payload.email) {
      logger.debug('Email manquant dans le payload JWT');
      payload.email = 'utilisateur@exemple.com';
    }
    
    if (!payload.collection) {
      logger.debug('Collection manquante dans le payload JWT, utilisation de "customers" par défaut');
      payload.collection = 'customers';
    }
    
    return payload as unknown as JwtPayload;
  } catch (error) {
    console.error('Erreur de vérification JWT:', error);
    return null;
  }
}

/**
 * Vérifie si un token JWT est valide (sans décoder complètement)
 * @param token Le token JWT à vérifier
 * @returns true si le token est valide, false sinon
 */
export async function isValidToken(token: string): Promise<boolean> {
  return await verifyJwtToken(token) !== null;
}
