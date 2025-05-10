/**
 * Définitions de types pour le module de métriques
 */

declare module '@/utils/metrics' {
  import { Counter, Histogram } from 'prom-client';

  // Compteurs pour les événements d'authentification
  export const authSuccessCounter: Counter<string>;
  export const authFailureCounter: Counter<string>;
  export const rateLimitCounter: Counter<string>;
  export const tokenRevokedCounter: Counter<string>;

  // Histogrammes pour les performances
  export const verifyTokenDuration: Histogram<string>;
  export const redisOperationDuration: Histogram<string>;

  // Utilitaires pour mesurer les performances
  export function measureAsync<T>(
    histogram: Histogram<string>,
    labels: Record<string, string>,
    fn: () => Promise<T>
  ): Promise<T>;

  export function measure<T>(
    histogram: Histogram<string>,
    labels: Record<string, string>,
    fn: () => T
  ): T;

  // Fonctions utilitaires
  export function resetMetrics(): void;
  export function getMetrics(): Promise<string>;
  export function getMetricsContentType(): string;
}

// Définition explicite du module pour auth-monitor
declare module '@/lib/server/auth-monitor' {
  import { NextRequest } from 'next/server';
  
  export type AuthEventType = 
    | 'login_success'
    | 'login_failure'
    | 'token_expired'
    | 'token_invalid'
    | 'token_revoked'
    | 'token_missing'
    | 'rate_limited'
    | 'access_denied';
    
  export function logAuthEvent(
    req: NextRequest,
    eventType: AuthEventType,
    error?: Error | null,
    userId?: string,
    metadata?: Record<string, unknown>
  ): Promise<void>;
}
