/**
 * Utilitaire de protection CSRF pour Chanvre Vert
 * 
 * Fournit des fonctions pour générer, valider et utiliser des tokens CSRF (Cross-Site Request Forgery)
 * dans les requêtes POST, PUT et DELETE.
 */

import crypto from 'crypto';
import { NextRequest } from 'next/server';
import { secureLogger as logger } from '@/utils/logger';

// Durée de validité des tokens CSRF (en secondes)
const CSRF_TOKEN_EXPIRY = 3600; // 1 heure

// Nom du cookie qui stockera le token
const CSRF_COOKIE_NAME = 'csrf-token';

// Nom de l'en-tête qui contiendra le token
const CSRF_HEADER_NAME = 'X-CSRF-Token';

/**
 * Génère un token CSRF sécurisé basé sur crypto
 * @returns Le token généré
 */
export function generateCsrfToken(): string {
  // Générer 32 octets aléatoires et les encoder en base64
  const randomBytes = crypto.randomBytes(32);
  const timestamp = Date.now();
  
  // Combiner le timestamp et les bytes aléatoires
  const buffer = Buffer.alloc(8 + randomBytes.length);
  buffer.writeBigInt64BE(BigInt(timestamp), 0);
  randomBytes.copy(buffer, 8);
  
  return buffer.toString('base64');
}

/**
 * Extrait le timestamp d'un token CSRF
 * @param token Token CSRF à analyser
 * @returns Le timestamp ou 0 si le token est invalide
 */
function extractTimestamp(token: string): number {
  try {
    const buffer = Buffer.from(token, 'base64');
    if (buffer.length < 8) return 0;
    
    const timestamp = Number(buffer.readBigInt64BE(0));
    return timestamp;
  } catch {
    return 0;
  }
}

/**
 * Vérifie si un token CSRF est expiré
 * @param token Token CSRF à vérifier
 * @returns true si le token est expiré
 */
function isTokenExpired(token: string): boolean {
  const timestamp = extractTimestamp(token);
  if (timestamp === 0) return true;
  
  const now = Date.now();
  const expiry = timestamp + CSRF_TOKEN_EXPIRY * 1000;
  
  return now > expiry;
}

/**
 * Valide un token CSRF provenant d'une requête
 * @param request Requête Next.js contenant le token
 * @returns true si le token est valide, sinon false
 */
export function validateCsrfToken(request: NextRequest): boolean {
  // Récupérer le token du cookie
  const cookieToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  if (!cookieToken) {
    logger.warn('Validation CSRF échouée: token manquant dans le cookie', {
      path: request.nextUrl.pathname,
      method: request.method
    });
    return false;
  }
  
  // Récupérer le token de l'en-tête
  const headerToken = request.headers.get(CSRF_HEADER_NAME);
  if (!headerToken) {
    logger.warn('Validation CSRF échouée: token manquant dans l\'en-tête', {
      path: request.nextUrl.pathname,
      method: request.method
    });
    return false;
  }
  
  // Vérifier que les tokens correspondent
  if (cookieToken !== headerToken) {
    logger.warn('Validation CSRF échouée: les tokens ne correspondent pas', {
      path: request.nextUrl.pathname,
      method: request.method
    });
    return false;
  }
  
  // Vérifier que le token n'est pas expiré
  if (isTokenExpired(cookieToken)) {
    logger.warn('Validation CSRF échouée: token expiré', {
      path: request.nextUrl.pathname,
      method: request.method,
      tokenTimestamp: extractTimestamp(cookieToken)
    });
    return false;
  }
  
  return true;
}

/**
 * Fonction à utiliser côté client pour obtenir l'en-tête CSRF
 * @returns En-tête à inclure dans les requêtes fetch
 */
export function getCsrfHeader(): { [key: string]: string } {
  // Fonction à appeler côté client uniquement
  if (typeof document === 'undefined') {
    return {};
  }
  
  // Récupérer le token depuis les cookies
  const cookies = document.cookie.split(';');
  const csrfCookie = cookies.find(cookie => cookie.trim().startsWith(`${CSRF_COOKIE_NAME}=`));
  
  if (!csrfCookie) {
    console.warn('Aucun token CSRF trouvé dans les cookies');
    return {};
  }
  
  const token = csrfCookie.split('=')[1].trim();
  return { [CSRF_HEADER_NAME]: token };
}

/**
 * Ajoute automatiquement l'en-tête CSRF à une requête fetch
 * 
 * Exemple d'utilisation:
 * const response = await fetchWithCsrf('/api/user', {
 *   method: 'POST',
 *   body: JSON.stringify(data)
 * });
 */
export async function fetchWithCsrf(url: string, options: RequestInit = {}): Promise<Response> {
  const csrfHeader = getCsrfHeader();
  
  // Fusionner les en-têtes existants avec l'en-tête CSRF
  const headers = {
    ...(options.headers || {}),
    ...csrfHeader
  };
  
  // Effectuer la requête avec l'en-tête CSRF
  return fetch(url, {
    ...options,
    headers
  });
}
