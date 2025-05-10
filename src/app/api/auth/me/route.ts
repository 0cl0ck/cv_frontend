import { NextRequest, NextResponse } from 'next/server';

/**
 * API pour récupérer les informations de l'utilisateur connecté
 * GET /api/auth/me
 * 
 * Simplifiée pour simplement transmettre la requête au backend
 * et renvoyer les données utilisateur au frontend
 */

export async function GET(req: NextRequest) {
  try {
    // Récupérer le token depuis le cookie
    const token = req.cookies.get('payload-token')?.value;
    
    // Log pour diagnostic
    console.log('[/api/auth/me] Tentative d\'extraction du token JWT');
    
    // Si aucun token n'est présent, renvoyer une erreur d'authentification
    if (!token) {
      console.warn('[/api/auth/me] Aucun token JWT trouvé dans les cookies');
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }
    
    // Log pour diagnostic
    console.log(`[/api/auth/me] Token JWT trouvé, longueur: ${token.length}`);
    
    // Configuration de l'URL du backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    console.log(`[/api/auth/me] URL du backend configurée: ${backendUrl}`);
    
    // Préparer les en-têtes avec le token d'authentification
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store', // Éviter tout cache pour les données sensibles
      'Authorization': `Bearer ${token}` // Ajouter explicitement le token dans l'en-tête
    };
    
    // Ajouter tous les cookies de la requête originale
    const cookieHeader = req.headers.get('cookie');
    if (cookieHeader) {
      headers['Cookie'] = cookieHeader;
    }
    
    console.log('[/api/auth/me] Envoi de la requête au backend avec token dans Authorization header');
    
    // Appel au backend pour obtenir les données utilisateur
    const response = await fetch(`${backendUrl}/api/auth/me`, {
      method: 'GET',
      headers,
      credentials: 'include', // Conserver pour la compatibilité
      cache: 'no-store', // Éviter le cache côté fetch
    });
    
    // Si le backend renvoie une erreur, la propager
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error || 'Erreur lors de la récupération des informations utilisateur' },
        { status: response.status }
      );
    }
    
    // Récupérer les données utilisateur depuis la réponse du backend
    const userData = await response.json();
    
    // Ajouter le token à la réponse pour les clients qui en ont besoin
    // (tout en conservant les données utilisateur originales)
    const responseWithToken = {
      ...userData,
      token  // Inclure le token JWT pour les besoins d'authentification côté client
    };
    
    // Créer la réponse avec des headers anti-cache appropriés
    const apiResponse = NextResponse.json(responseWithToken);
    apiResponse.headers.set('Cache-Control', 'private, no-store, max-age=0');
    return apiResponse;
  } catch (error) {
    console.error('Erreur lors de la récupération des informations utilisateur:', error);
    
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des informations utilisateur' },
      { status: 500 }
    );
  }
}

