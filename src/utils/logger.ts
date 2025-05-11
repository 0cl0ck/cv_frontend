/**
 * Configuration du système de logging centralisé avec Pino
 */

import pino from 'pino';

// Configuration de base pour Pino
const loggerConfig = {
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  transport: process.env.NODE_ENV !== 'production' 
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
        },
      } 
    : undefined,
  // Données incluses avec chaque log
  base: {
    app: 'chanvre-vert-frontend',
    env: process.env.NODE_ENV || 'development',
  },
};

// Création de l'instance de logger
export const logger = pino(loggerConfig);

// Interface pour définir des objets génériques
export interface GenericObject {
  [key: string]: unknown;
}

// Empty object du bon type
const emptyObject: GenericObject = {};

// Fonction pour masquer les données sensibles
export function maskSensitiveData(data: GenericObject | null | undefined): GenericObject | null | undefined {
  if (!data) return data;
  
  // Clone profond pour éviter de modifier l'objet original
  const masked = JSON.parse(JSON.stringify(data));
  
  // Liste des clés sensibles à masquer
  const sensitiveKeys = ['password', 'token', 'secret', 'apiKey', 'creditCard', 'cardNumber'];
  
  // Fonction récursive pour parcourir l'objet
  function maskRecursively(obj: GenericObject | null | undefined): void {
    if (typeof obj !== 'object' || obj === null) return;
    
    Object.keys(obj).forEach(key => {
      // Si la clé est sensible, masquer la valeur
      if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk.toLowerCase()))) {
        if (typeof obj[key] === 'string') {
          obj[key] = '********';
        }
      } 
      // Sinon, continuer récursivement
      else if (typeof obj[key] === 'object' && obj[key] !== null) {
        // Vérifier que l'objet est bien un objet avec des clés indexables par string
        const nestedObj = obj[key] as Record<string, unknown>;
        if (nestedObj && typeof nestedObj === 'object') {
          maskRecursively(nestedObj as GenericObject);
        }
      }
    });
  }
  
  maskRecursively(masked);
  return masked;
}

// Extensions pour le logger avec masquage automatique des données sensibles
export const secureLogger = {
  debug: (msg: string, data?: GenericObject) => logger.debug(data ? { ...maskSensitiveData(data) } : emptyObject, msg),
  info: (msg: string, data?: GenericObject) => logger.info(data ? { ...maskSensitiveData(data) } : emptyObject, msg),
  warn: (msg: string, data?: GenericObject) => logger.warn(data ? { ...maskSensitiveData(data) } : emptyObject, msg),
  error: (msg: string, data?: GenericObject) => logger.error(data ? { ...maskSensitiveData(data) } : emptyObject, msg),
  fatal: (msg: string, data?: GenericObject) => logger.fatal(data ? { ...maskSensitiveData(data) } : emptyObject, msg),
};

// Export par défaut pour faciliter l'utilisation
export default secureLogger;
