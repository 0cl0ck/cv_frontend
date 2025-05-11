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
 * Génère un token CSRF sécurisé qui fonctionne côté client et serveur
 * @returns Le token généré
 */
export function generateCsrfToken(): string {
  // Version compatible navigateur qui ne dépend pas de Buffer spécifique à Node.js
  let randomValues = '';
  
  // Dans le navigateur, utiliser crypto.getRandomValues
  if (typeof window !== 'undefined') {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    randomValues = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  } else {
    // Fallback côté serveur avec Node.js crypto
    randomValues = crypto.randomBytes(32).toString('hex');
  }
  
  // Ajouter le timestamp au début pour permettre la vérification d'expiration
  const timestamp = Date.now().toString(36);
  
  // Combiner timestamp et valeurs aléatoires, puis encoder en base64
  const combined = `${timestamp}.${randomValues}`;
  
  // Encoder en base64 compatible navigateur si nécessaire
  if (typeof window !== 'undefined') {
    return btoa(combined);
  } else {
    return Buffer.from(combined).toString('base64');
  }
}

/**
 * Extrait le timestamp d'un token CSRF
 * @param token Token CSRF à analyser
 * @returns Le timestamp ou 0 si le token est invalide
 */
function extractTimestamp(token: string): number {
  try {
    // Décoder le token base64 en string
    let decoded: string;
    
    if (typeof window !== 'undefined') {
      // Côté client (navigateur)
      try {
        decoded = atob(token);
      } catch (e) {
        console.error('Erreur lors du décodage base64:', e);
        return 0;
      }
    } else {
      // Côté serveur (Node.js)
      decoded = Buffer.from(token, 'base64').toString();
    }
    
    // Le format est timestamp.randomValues
    const parts = decoded.split('.');
    if (parts.length !== 2) return 0;
    
    // Convertir de base36 à décimal
    const timestampStr = parts[0];
    const timestamp = parseInt(timestampStr, 36);
    
    return isNaN(timestamp) ? 0 : timestamp;
  } catch (error) {
    console.error('Erreur lors de l’extraction du timestamp:', error);
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
    console.log('[CSRF Debug] getCsrfHeader appelé côté serveur');
    return {};
  }
  
  // Récupérer le token depuis les cookies
  const cookies = document.cookie.split(';');
  console.log('[CSRF Debug] Tous les cookies disponibles:', cookies.length);
  console.log('[CSRF Debug] Détail des cookies:');
  cookies.forEach((cookie, index) => {
    console.log(`[CSRF Debug] Cookie ${index}:`, cookie.trim());
  });
  
  // Vérifier s'il existe plusieurs cookies avec le même nom
  const allCsrfCookies = cookies.filter(cookie => cookie.trim().startsWith(`${CSRF_COOKIE_NAME}=`));
  if (allCsrfCookies.length > 1) {
    console.warn('[CSRF Debug] ATTENTION: Plusieurs cookies CSRF détectés:', allCsrfCookies);
  }
  
  const csrfCookie = cookies.find(cookie => cookie.trim().startsWith(`${CSRF_COOKIE_NAME}=`));
  
  if (!csrfCookie) {
    console.warn('[CSRF Debug] Aucun token CSRF trouvé dans les cookies. Nom recherché:', CSRF_COOKIE_NAME);
    return {};
  }
  
  const token = csrfCookie.split('=')[1].trim();
  console.log('[CSRF Debug] Token CSRF trouvé (cookie):', token);
  console.log('[CSRF Debug] Longueur du token (cookie):', token.length);
  
  // Désactiver la protection CSRF temporairement (UNIQUEMENT pour le débogage)
  // En envoyant un jeton connu et facilement identifiable
  const debugToken = 'DEBUG_TOKEN_FOR_TESTING_AUTHENTICATION_' + Date.now();
  console.log('[CSRF Debug] Remplacement temporaire du token par:', debugToken);
  
  // Définir un nouveau cookie avec le token de débogage
  // Cette ligne synchronisera le cookie avec l'en-tête pour débogage
  document.cookie = `${CSRF_COOKIE_NAME}=${debugToken}; path=/; samesite=strict`;
  
  return { [CSRF_HEADER_NAME]: debugToken };
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
  console.log('[CSRF Debug] fetchWithCsrf appelé pour URL:', url);
  
  // Si on est sur le client et que le cookie CSRF n'existe pas, on le crée
  if (typeof window !== 'undefined') {
    const cookies = document.cookie.split(';');
    const csrfCookie = cookies.find(cookie => cookie.trim().startsWith(`${CSRF_COOKIE_NAME}=`));
    
    if (!csrfCookie) {
      console.log('[CSRF Debug] Cookie CSRF manquant, génération d\'un nouveau token');
      const token = generateCsrfToken();
      
      // Définir le cookie avec les paramètres appropriés
      const expires = new Date();
      expires.setTime(expires.getTime() + 60 * 60 * 1000); // 1 heure
      
      document.cookie = `${CSRF_COOKIE_NAME}=${token}; expires=${expires.toUTCString()}; path=/; samesite=strict`;
      console.log('[CSRF Debug] Nouveau cookie CSRF généré');
    }
  }
  
  const csrfHeader = getCsrfHeader();
  console.log('[CSRF Debug] En-têtes CSRF pour la requête:', csrfHeader);
  
  // Fusionner les en-têtes existants avec l'en-tête CSRF
  const headers = {
    ...(options.headers || {}),
    ...csrfHeader
  };
  
  console.log('[CSRF Debug] En-têtes finales:', headers);
  
  // Effectuer la requête avec l'en-tête CSRF
  return fetch(url, {
    ...options,
    headers,
    credentials: 'include' // S'assurer que les cookies sont envoyés avec la requête
  });
}
