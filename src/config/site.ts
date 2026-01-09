/**
 * Configuration globale du site
 */

export const config = {
  name: 'Chanvre Vert',
  description: 'Votre boutique de produits au CBD de qualité',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.chanvre-vert.fr',
  
  auth: {
    // Nom du cookie d'authentification
    tokenName: 'auth_token',
    // Durée de validité du token (en secondes)
    tokenExpiration: 60 * 60 * 24 * 7, // 7 jours
  },
  
  // Configuration pour l'API backend
  api: {
    baseUrl: '/api',
  },
  
  // Configuration des réseaux sociaux
  social: {
    twitter: 'chanvre_vert',
    instagram: 'chanvre_vert',
    facebook: 'chanvre.vert',
  },
  
  // Configuration du paiement
  payment: {
    currency: 'EUR',
    currencySymbol: '€',
  },
};
