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

const isDevelopment = process.env.NODE_ENV === 'development';
const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost';

// URL de base en fonction de l'environnement
// En développement local, on doit pointer explicitement vers le backend (port 3000)
const baseUrl = isDevelopment || isLocalhost
  ? 'http://localhost:3000' // URL explicite vers le backend en développement local
  : process.env.NEXT_PUBLIC_API_URL || 'https://api.chanvre-vert.fr'; // URL déployée en production

// Chemin de base pour les API endpoints - le préfixe /api/ est toujours nécessaire
const apiBasePath = '/api'; // En production, les routes avec le préfixe /api/ sont attendues

// Log pour débogage
// if (typeof window !== 'undefined') {
//   console.log('Configuration API initialisée:', {
//     isDevelopment,
//     isLocalhost,
//     baseUrl
//   });
// }

const apiConfig: ApiConfig = {
  baseUrl,
  endpoints: {
    // Endpoints pour gérer les commandes et paiements
    orders: `${baseUrl}${apiBasePath}/orders`,
    payment: `${baseUrl}${apiBasePath}/payment/create`,
    paymentVerify: `${baseUrl}${apiBasePath}/payment/verify`,
  }
};

// Log de débogage pour le endpoint de paiement
if (typeof window !== 'undefined') {
  console.log('Payment endpoint:', apiConfig.endpoints.payment);
}

export default apiConfig;
