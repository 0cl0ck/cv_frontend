/**
 * Utilitaire de validation pour les routes API
 * 
 * Ce fichier fournit des fonctions pour valider facilement les entrées
 * utilisateur dans les routes API de Next.js
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { secureLogger as logger } from '@/utils/logger';

/**
 * Options pour la validation des requêtes
 */
export interface ValidationOptions {
  /** 
   * Si true, journalise les erreurs de validation en détail (dev uniquement)
   */
  verbose?: boolean;
}

/**
 * Valide le corps d'une requête avec un schéma Zod
 * @param request Requête Next.js
 * @param schema Schéma Zod pour la validation
 * @param options Options supplémentaires
 * @returns En cas de succès, retourne les données validées; sinon retourne une NextResponse avec l'erreur
 */
export async function validateRequest<T extends z.ZodType>(
  request: NextRequest,
  schema: T,
  options: ValidationOptions = {}
): Promise<{ success: true; data: z.infer<T> } | { success: false; response: NextResponse }> {
  try {
    // Récupérer le corps de la requête
    const body = await request.json().catch(() => ({}));
    
    // Valider avec le schéma Zod
    const result = schema.safeParse(body);
    
    if (!result.success) {
      // Formater les erreurs de validation
      const formattedErrors = formatZodError(result.error);
      
      // Log des erreurs si mode verbose activé
      if (options.verbose) {
        const errorSummary = Object.entries(formattedErrors)
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
        
        logger.debug('Validation échouée', { 
          path: request.nextUrl.pathname,
          errors: formattedErrors,
          errorSummary
        });
      }
      
      return { 
        success: false, 
        response: NextResponse.json(
          { 
            error: 'Validation échouée', 
            details: formattedErrors 
          },
          { status: 400 }
        )
      };
    }
    
    return { success: true, data: result.data };
  } catch (error) {
    logger.error('Erreur lors de la validation de la requête', { 
      path: request.nextUrl.pathname,
      error
    });
    
    return { 
      success: false, 
      response: NextResponse.json(
        { error: 'Erreur de traitement de la requête' },
        { status: 500 }
      )
    };
  }
}

/**
 * Valide les paramètres de requête avec un schéma Zod
 * @param request Requête Next.js
 * @param schema Schéma Zod pour la validation
 * @param options Options supplémentaires
 * @returns En cas de succès, retourne les données validées; sinon retourne une NextResponse avec l'erreur
 */
export function validateQueryParams<T extends z.ZodType>(
  request: NextRequest,
  schema: T,
  options: ValidationOptions = {}
): { success: true; data: z.infer<T> } | { success: false; response: NextResponse } {
  try {
    // Extraire les paramètres de requête
    const { searchParams } = new URL(request.url);
    
    // Convertir searchParams en objet
    const params: Record<string, string | string[]> = {};
    searchParams.forEach((value, key) => {
      if (params[key]) {
        if (Array.isArray(params[key])) {
          (params[key] as string[]).push(value);
        } else {
          params[key] = [params[key] as string, value];
        }
      } else {
        params[key] = value;
      }
    });
    
    // Valider avec le schéma Zod
    const result = schema.safeParse(params);
    
    if (!result.success) {
      // Formater les erreurs de validation
      const formattedErrors = formatZodError(result.error);
      
      if (options.verbose) {
        logger.debug('Validation des paramètres échouée', { 
          path: request.nextUrl.pathname,
          errors: formattedErrors
        });
      }
      
      return { 
        success: false, 
        response: NextResponse.json(
          { 
            error: 'Paramètres invalides', 
            details: formattedErrors 
          },
          { status: 400 }
        )
      };
    }
    
    return { success: true, data: result.data };
  } catch (error) {
    logger.error('Erreur lors de la validation des paramètres', { 
      path: request.nextUrl.pathname,
      error
    });
    
    return { 
      success: false, 
      response: NextResponse.json(
        { error: 'Erreur de traitement des paramètres' },
        { status: 500 }
      )
    };
  }
}

/**
 * Convertit une erreur Zod en objet d'erreurs formatées
 */
function formatZodError(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    errors[path || 'global'] = err.message;
  });
  
  return errors;
}

/**
 * Sanitise une chaîne pour éviter les attaques XSS
 * @param input Chaîne à sanitiser
 * @returns Chaîne sanitisée
 */
export function sanitizeString(input: string): string {
  if (!input) return input;
  
  // Remplacer les caractères HTML spéciaux
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitise un objet en profondeur
 * @param obj Objet à sanitiser
 * @returns Objet sanitisé
 */
/**
 * Sanitise un objet en profondeur
 * @param obj Objet à sanitiser
 * @returns Objet sanitisé de même type que l'entrée
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj };
  
  for (const key in result) {
    if (Object.prototype.hasOwnProperty.call(result, key)) {
      const value = result[key];
      
      if (typeof value === 'string') {
        // Type assertion necessary to satisfy TypeScript
        result[key] = sanitizeString(value) as T[Extract<keyof T, string>];
      } else if (value && typeof value === 'object') {
        if (Array.isArray(value)) {
          // Handle arrays separately by mapping each item
          result[key] = value.map(item => {
            if (typeof item === 'string') {
              return sanitizeString(item);
            } else if (item && typeof item === 'object') {
              return sanitizeObject(item as Record<string, unknown>);
            }
            return item;
          }) as T[Extract<keyof T, string>];
        } else {
          // Sanitize nested objects
          result[key] = sanitizeObject(value as Record<string, unknown>) as T[Extract<keyof T, string>];
        }
      }
    }
  }
  
  return result;
}
