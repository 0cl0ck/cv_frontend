// Server Component pour la page compte
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ClientDashboard from '@/app/compte/client-dashboard'
import { User } from '@/lib/auth';

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
    console.log('[page-server] Aucun token trouvé dans les cookies');
    return redirect('/connexion');
  }
  
  console.log('[page-server] Token trouvé, longueur:', token.length);
  
  // Décoder le JWT sans vérification pour voir son contenu
  const decodedToken = decodeJwt(token);
  console.log('[page-server] Contenu du token:', JSON.stringify(decodedToken).substring(0, 100) + '...');
  
  // Configuration de l'URL du backend
  // Utiliser 127.0.0.1 au lieu de localhost pour éviter les problèmes de résolution DNS en environnement Node.js
  const rawBackendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const backendUrl = rawBackendUrl.replace('localhost', '127.0.0.1');
  console.log('[page-server] URL du backend original:', rawBackendUrl);
  console.log('[page-server] URL du backend utilisée:', backendUrl);
  
  try {
    // Consigner tous les headers pour le débogage
    const requestHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
    console.log('[page-server] Headers de la requête:', JSON.stringify(requestHeaders));
    
    // Envoyer la requête avec les headers de débogage et un timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 secondes de timeout
    
    let response;
    try {
      response = await fetch(`${backendUrl}/api/auth/me`, {
        method: 'GET',
        headers: requestHeaders,
        cache: 'no-store',
        signal: controller.signal,
        // Augmenter les options de stabilité réseau
        keepalive: true
      });
      
      // Nettoyer le timeout
      clearTimeout(timeoutId);
    } catch (fetchError) {
      // Gérer spécifiquement les erreurs de connexion
      console.error('[page-server] Erreur lors de la connexion au backend:', fetchError);
      console.log('[page-server] Tentative avec localhost au lieu de 127.0.0.1');
      
      // Tentative de secours avec l'URL originale si la première tentative échoue
      try {
        response = await fetch(`${rawBackendUrl}/api/auth/me`, {
          method: 'GET',
          headers: requestHeaders,
          cache: 'no-store'
        });
      } catch (retryError) {
        console.error('[page-server] Échec de la seconde tentative:', retryError);
        return redirect('/connexion');
      }
    }
    
    // Si la réponse n'est pas OK, rediriger vers la page de connexion
    if (!response.ok) {
      return redirect('/connexion');
    }
    
    // Récupérer les informations de l'utilisateur
    const data = await response.json();
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
