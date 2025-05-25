// Server Component pour la page compte
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ClientDashboard from '@/app/compte/client-dashboard'
import { User } from '@/lib/auth/auth';
import { secureLogger as logger } from '@/utils/logger';

// Fonction utilitaire pour décoder un JWT sans vérification
const decodeJwt = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = Buffer.from(base64, 'base64').toString('utf8');
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('[page-server] Erreur lors du décodage du JWT:', e);
    return null;
  }
};

export default async function DashboardServerPage() {
  // Récupérer le token depuis les cookies
  const cookieStore = await cookies();
  const token = cookieStore.get('payload-token')?.value;
  
  // Rediriger vers la page de connexion si aucun token n'est présent
  if (!token) {
    logger.debug('[page-server] Aucun token trouvé dans les cookies', {
      allCookies: Array.from(cookieStore.getAll()).map(c => c.name),
      environment: process.env.NODE_ENV,
      apiUrl: process.env.NEXT_PUBLIC_API_URL
    });
    return redirect('/connexion?reason=no-token');
  }

  logger.debug('[page-server] Token trouvé', { length: token.length });
  
  // Décoder le JWT sans vérification (à des fins internes uniquement)
  decodeJwt(token);
  
  // Configuration de l'URL du backend
  // Déterminer si nous sommes en production ou en développement
  const isProduction = process.env.NODE_ENV === 'production';
  const rawBackendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  
  // En production, utiliser une requête API directe au backend
  // En développement, faire une requête locale (éviter les problèmes CORS)
  const backendUrl = isProduction ? rawBackendUrl : rawBackendUrl.replace('localhost', '127.0.0.1');
  logger.debug('[page-server] URL du backend', { raw: rawBackendUrl, used: backendUrl, isProduction });
  
  try {
    // Consigner tous les headers pour le débogage
    const requestHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      // Ajouter les cookies nécessaires pour maintenir l'état d'authentification
      'Cookie': `payload-token=${token}`
    };
    logger.debug('[page-server] Headers de la requête', { headers: Object.keys(requestHeaders) });
    
    // Envoyer la requête avec les headers de débogage et un timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 secondes de timeout
    
    let response;
    try {
      logger.debug('[page-server] Tentative d\'appel à /api/auth/me', { url: `${backendUrl}/api/auth/me` });
      response = await fetch(`${backendUrl}/api/auth/me`, {
        method: 'GET',
        headers: requestHeaders,
        cache: 'no-store',
        credentials: 'include', // Important: inclure les cookies dans la requête
        signal: controller.signal,
        // Augmenter les options de stabilité réseau
        keepalive: true
      });
      
      // Nettoyer le timeout
      clearTimeout(timeoutId);
    } catch (fetchError) {
      // Gérer spécifiquement les erreurs de connexion
      console.error('[page-server] Erreur lors de la connexion au backend:', fetchError);
      logger.debug('[page-server] Tentative avec localhost au lieu de 127.0.0.1');
      
      // Tentative de secours avec l'URL originale si la première tentative échoue
      try {
        response = await fetch(`${rawBackendUrl}/api/auth/me`, {
          method: 'GET',
          headers: requestHeaders,
          cache: 'no-store',
          credentials: 'include' // Important: inclure les cookies dans la requête
        });
      } catch (retryError) {
        console.error('[page-server] Échec de la seconde tentative:', retryError);
        return redirect('/connexion');
      }
    }
    
    // Si la réponse n'est pas OK, rediriger vers la page de connexion
    if (!response.ok) {
      logger.debug('[page-server] Réponse non OK', { 
        status: response.status, 
        statusText: response.statusText,
        apiUrl: backendUrl,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      // Essayer d'extraire plus d'informations de l'erreur
      try {
        const errorData = await response.text();
        logger.debug('[page-server] Détails de l\'erreur', { 
          errorData: errorData.substring(0, 200) // Limiter la taille
        });
      } catch {
        logger.debug('[page-server] Impossible de lire les détails de l\'erreur');
      }
      
      return redirect(`/connexion?reason=auth-failed&status=${response.status}`);
    }
    
    logger.debug('[page-server] Réponse OK de /api/auth/me');
    
    // Récupérer les informations de l'utilisateur
    const data = await response.json();
    logger.debug('[page-server] Données reçues', { hasUser: !!data?.user });
    const user = data.user as User;
    
    // Vérifier si l'utilisateur existe
    if (!user) {
      return redirect('/connexion');
    }
    
    // Rendre le composant client avec les données utilisateur
    return <ClientDashboard initialUser={user} />;
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'authentification:', error);
    return redirect('/connexion');
  }
}
