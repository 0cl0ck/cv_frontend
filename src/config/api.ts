/**
 * Configuration des points d'entrée API selon l'environnement
 */

interface ApiConfig {
  baseUrl: string;
  endpoints: {
    orders: string;
    payment: string;
    paymentVerify: string;
  };
}

// URL de base via le proxy Next.js - toujours relative
export const API_BASE = '/api';

const apiConfig: ApiConfig = {
  baseUrl: API_BASE,
  endpoints: {
    // Endpoints pour gérer les commandes et paiements via proxy Next.js
    orders: `${API_BASE}/orders`,
    payment: `${API_BASE}/payment/create`,
    paymentVerify: `${API_BASE}/payment/verify`,
  }
};

export default apiConfig;
