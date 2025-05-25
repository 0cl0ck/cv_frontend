/**
 * Utilitaire de protection CSRF pour Chanvre Vert
 * 
 * Fournit des fonctions pour générer, valider et utiliser des tokens CSRF (Cross-Site Request Forgery)
 * dans les requêtes POST, PUT et DELETE.
 */

// Web Crypto API est disponible nativement dans le navigateur et dans Edge Runtime
// Pas besoin d'importer crypto

/**
 * Crée une signature HMAC-SHA256 compatible avec Edge Runtime
 * @param message Le message à signer
 * @param secret La clé secrète
 * @returns La signature en format hexadécimal
 */
async function createHmacSignature(message: string, secret: string): Promise<string> {
  // Encoder les entrées en ArrayBuffer
  const encoder = new TextEncoder();
  const messageBuffer = encoder.encode(message);
  const secretBuffer = encoder.encode(secret);
  
  // Importer la clé secrète
  const key = await crypto.subtle.importKey(
    'raw',
    secretBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  // Signer le message
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    messageBuffer
  );
  
  // Convertir le résultat en hexadécimal
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Compare deux chaînes de caractères de manière sécurisée contre les timing attacks
 * @param a Première chaîne
 * @param b Deuxième chaîne
 * @returns true si les chaînes sont identiques
 */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
}
import { NextRequest } from 'next/server';
import { secureLogger as logger } from '@/utils/logger';
import { httpClient } from '@/lib/httpClient';
import type { AxiosRequestConfig } from 'axios';

// CSRF PROTECTION TEMPORAIREMENT DÉSACTIVÉE
// La protection CSRF a été désactivée car elle causait des problèmes en production
// avec l'authentification cross-domain.

// Ces constantes sont conservées pour référence future
// Durée de validité des tokens CSRF (en secondes)
const CSRF_TOKEN_EXPIRY = 3600; // 1 heure


// Nom de l'en-tête qui contiendra le token
const CSRF_HEADER_NAME = 'X-CSRF-Token';

/**
 * Cette fonction n'est plus utilisée car les tokens sont maintenant générés côté serveur
 * @deprecated Utiliser plutôt le endpoint /api/csrf
 * @returns Le token généré
 */
export function generateCsrfToken(): string {
  console.warn('generateCsrfToken est déprécié. Les tokens sont maintenant générés par /api/csrf');
  
  // Version compatible navigateur qui ne dépend pas de Buffer spécifique à Node.js
  let randomValues = '';
  
  // Dans le navigateur, utiliser crypto.getRandomValues
  if (typeof window !== 'undefined') {
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    randomValues = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  } else {
    // Côté serveur mais compatible avec Edge Runtime
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    randomValues = Array.from(array).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Ajouter le timestamp au début pour permettre la vérification d'expiration
  const timestamp = Date.now().toString(36);
  
  // Combiner timestamp et valeurs aléatoires, puis encoder en base64
  const combined = `${timestamp}.${randomValues}`;
  
  // Encoder en base64 compatible navigateur si nécessaire
  // Edge Runtime supporte btoa/atob
  return btoa(combined);
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
    
    // Utiliser atob qui est supporté par Edge Runtime
    try {
      decoded = atob(token);
    } catch (e) {
      console.error('Erreur lors du décodage base64:', e);
      return 0;
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
 * @param storedToken Token stocké côté serveur
 * @returns true si le token est valide, sinon false
 */
export async function validateCsrfToken(
  request: NextRequest, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _storedToken = ''
): Promise<boolean> {
  // Récupérer le token du cookie
  const token = request.cookies.get('csrf-token')?.value;
  const signature = request.cookies.get('csrf-sign')?.value;
  
  if (!token) {
    logger.warn('Validation CSRF échouée: token manquant dans le cookie', {
      path: request.nextUrl.pathname,
      method: request.method
    });
    return false;
  }
  
  if (!signature) {
    logger.warn('Validation CSRF échouée: signature manquante dans le cookie', {
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
  
  // Vérifier que le token de l'en-tête correspond au token du cookie
  if (token !== headerToken) {
    logger.warn('Validation CSRF échouée: les tokens ne correspondent pas', {
      path: request.nextUrl.pathname,
      method: request.method
    });
    return false;
  }
  
  // Vérifier la signature HMAC
  const secret = process.env.CSRF_SECRET;
  if (!secret) {
    logger.error('CSRF_SECRET manquant dans les variables d\'environnement');
    return false;
  }
  
  // Calculer la signature attendue avec Web Crypto API
  // Cette fonction est compatible avec Edge Runtime
  const expectedSignature = await createHmacSignature(token, secret);
  
  // Vérifier que les signatures correspondent avec une comparaison constante
  const signaturesMatch = constantTimeEqual(signature, expectedSignature);
  
  if (!signaturesMatch) {
    logger.warn('Validation CSRF échouée: signature invalide', {
      path: request.nextUrl.pathname,
      method: request.method
    });
    return false;
  }
  
  return true;
}

/**
 * Fonction simplifiée qui ne vérifie plus le CSRF
 * @returns Un objet vide (protection CSRF désactivée)
 */
export function getCsrfHeader(): { [key: string]: string } {
  // Protection CSRF désactivée, retourne un objet vide
  return {};
}

/**
 * Version simplifiée qui n'ajoute plus de protection CSRF
 * 
 * Exemple d'utilisation (inchangé):
 * const response = await fetchWithCsrf('/api/user', {
 *   method: 'POST',
 *   body: JSON.stringify(data)
 * });
 */

export async function fetchWithCsrf<T = unknown>(url: string, options: RequestInit = {}): Promise<T> {
  // Protection CSRF désactivée - passage direct à httpClient
  logger.debug('[CSRF] Protection CSRF désactivée - utilisation directe de httpClient');
  
  // Effectuer la requête sans CSRF
  const config: AxiosRequestConfig = {
    url,
    method: options.method as AxiosRequestConfig['method'],
    headers: options.headers as Record<string, string>,
    data: options.body
  };

  const response = await httpClient.request<T>(config);
  return response.data;
}
