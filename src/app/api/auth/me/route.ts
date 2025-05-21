import { NextRequest, NextResponse } from 'next/server';
import { secureLogger as logger } from '@/utils/logger';

/**
 * Route d'API qui sert d'intermédiaire entre le frontend et le backend
 * pour les requêtes d'authentification.
 * 
 * Elle récupère le token JWT du cookie 'payload-token' et le transmet
 * dans l'en-tête Authorization au backend.
 */
export async function GET(request: NextRequest) {
  try {
    // Récupérer le token depuis les cookies
    const token = request.cookies.get('payload-token')?.value;
    
    logger.debug('[api/auth/me] Vérification présence token', { hasToken: !!token });
    
    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié', authenticated: false }, 
        { status: 401 }
      );
    }
    
    // Configuration de l'URL du backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    // Transférer la requête au backend en ajoutant le token dans l'en-tête Authorization
    const response = await fetch(`${backendUrl}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    // Si la réponse n'est pas OK, renvoyer l'erreur
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Erreur de serveur' }));
      return NextResponse.json(
        { error: errorData.error || 'Erreur d\'authentification', authenticated: false }, 
        { status: response.status }
      );
    }
    
    // Récupérer les données utilisateur
    const userData = await response.json();
    
    // Important: inclure le token dans la réponse pour que le client puisse l'utiliser
    return NextResponse.json({
      ...userData,
      token, // Inclure le token dans la réponse
      authenticated: true
    }, { status: 200 });
    
  } catch (error) {
    console.error('[api/auth/me] Erreur:', error);
    
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Une erreur inconnue est survenue',
      authenticated: false
    }, { status: 500 });
  }
}
