/**
 * Utilitaire de sanitisation des entrées utilisateur
 * 
 * Fournit des fonctions pour nettoyer les entrées utilisateur des potentielles attaques XSS
 * et autres injections malveillantes.
 */

import { NextRequest } from 'next/server';
import DOMPurify from 'isomorphic-dompurify';
import { secureLogger as logger } from '@/utils/logger';

/**
 * Sanitise une chaîne de caractères pour éviter les attaques XSS
 * @param input Chaîne à sanitiser
 * @returns Chaîne sanitisée
 */
export function sanitizeString(input: string): string {
  if (!input) return input;
  
  // Utiliser DOMPurify pour sanitiser le HTML
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // Ne pas autoriser de balises HTML
    ALLOWED_ATTR: [], // Ne pas autoriser d'attributs HTML
    FORBID_TAGS: ['style', 'script'],
    FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick']
  });
}

/**
 * Sanitise un objet récursivement
 * @param obj Objet à sanitiser
 * @returns Objet sanitisé
 */
// Type plus précis pour les objets complexes
type RecursiveObject = {
  [key: string]: string | number | boolean | null | undefined | RecursiveObject | RecursiveObject[];
};

export function sanitizeObject<T extends RecursiveObject>(obj: T): T {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sanitized = { ...obj } as T;
  
  for (const key in sanitized) {
    if (Object.prototype.hasOwnProperty.call(sanitized, key)) {
      const value = sanitized[key];
      
      if (typeof value === 'string') {
        sanitized[key] = sanitizeString(value) as T[Extract<keyof T, string>];
      } else if (value && typeof value === 'object') {
        sanitized[key] = Array.isArray(value)
          ? value.map(item => {
              if (typeof item === 'object' && item !== null) {
                return sanitizeObject(item as RecursiveObject) as typeof item;
              } else if (typeof item === 'string') {
                return sanitizeString(item);
              }
              return item;
            }) as T[Extract<keyof T, string>]
          : sanitizeObject(value as RecursiveObject) as T[Extract<keyof T, string>];
      }
    }
  }
  
  return sanitized;
}

/**
 * Sanitise le corps d'une requête JSON
 * @param request Requête Next.js
 * @returns Promise avec le corps sanitisé
 */
export async function sanitizeRequestBody<T extends RecursiveObject>(request: NextRequest): Promise<T> {
  try {
    // Extraire le corps en tant qu'objet JSON
    const body = await request.json() as T;
    
    // Sanitiser le corps et le retourner
    return sanitizeObject(body);
  } catch (error) {
    logger.error('Erreur lors de la sanitisation du corps de la requête', { error });
    return {} as T;
  }
}

/**
 * Sanitise un texte en HTML limité pour l'affichage (permet certaines balises bénignes)
 * 
 * À utiliser uniquement pour des contenus comme les avis où un léger formatage est acceptable.
 * @param html HTML à sanitiser
 * @returns HTML sanitisé avec uniquement les balises autorisées
 */
export function sanitizeHtml(html: string): string {
  if (!html) return html;
  
  // Utiliser DOMPurify avec une configuration plus permissive mais sécurisée
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'u', 'p', 'br', 'ul', 'ol', 'li', 'strong', 'em'],
    ALLOWED_ATTR: [], // Aucun attribut autorisé
    FORBID_TAGS: ['style', 'script', 'iframe', 'form', 'input', 'button'],
    FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick', 'href'],
    USE_PROFILES: { html: true }
  });
}

/**
 * Vérifie si une chaîne contient potentiellement une tentative d'injection
 * @param input Chaîne à analyser
 * @returns true si la chaîne est suspecte
 */
export function isInjectionAttempt(input: string): boolean {
  if (!input) return false;
  
  // Recherche de motifs d'attaque courants
  const suspiciousPatterns = [
    /<script\b[^>]*>/i,            // Balises script
    /javascript:/i,                // Protocole javascript:
    /on\w+\s*=/i,                  // Gestionnaires d'événements inline (onclick, etc.)
    /(\%3C|\<)(\%2F|\/)script/i,   // </script> encodé ou non
    /union\s+select/i,             // Injection SQL potentielle
    /FROM\s+information_schema/i,  // Injection SQL potentielle
    /exec(\s|\+)+(s|x)p\w+/i,      // Injection SQL potentielle (exec sp_)
    /document\.cookie/i,           // Accès aux cookies
    /document\.location/i,         // Redirection
    /\.\.\/\.\.\//i,               // Attaque par traversée de chemins (directory traversal)
    /\<\%.*\%\>/i                  // Injection de code serveur
  ];
  
  return suspiciousPatterns.some(pattern => pattern.test(input));
}

/**
 * Journaliser les tentatives d'injection détectées
 * @param input Entrée suspecte
 * @param request Requête contenant l'entrée
 */
export function logInjectionAttempt(input: string, request: NextRequest): void {
  if (isInjectionAttempt(input)) {
    logger.warn('Tentative potentielle d\'injection détectée', {
      input: input.substring(0, 100), // Tronquer pour éviter de surcharger les logs
      path: request.nextUrl.pathname,
      method: request.method,
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    });
  }
}
