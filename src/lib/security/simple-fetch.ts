import { httpClient } from '@/lib/httpClient';
import type { AxiosRequestConfig } from 'axios';

/**
 * Version simplifiée de fetchWithCsrf qui n'utilise pas de protection CSRF
 * Cette fonction garde la même signature pour éviter de casser le code existant
 */
export async function fetchWithoutCsrf<T = unknown>(url: string, options: RequestInit = {}): Promise<T> {
  // Effectuer la requête sans l'en-tête CSRF
  const config: AxiosRequestConfig = {
    url,
    method: options.method as AxiosRequestConfig['method'],
    headers: options.headers as Record<string, string>,
    data: options.body
  };

  const response = await httpClient.request<T>(config);
  return response.data;
}

// Fonction dummy pour la compatibilité avec l'API existante
export function getCsrfHeader(): { [key: string]: string } {
  return {};
}
