import { NextRequest, NextResponse } from 'next/server';
import { checkOrigin } from '@/lib/security/origin-check';

/**
 * Route d'API qui gère la déconnexion en supprimant le cookie d'authentification
 * et en informant le backend de la déconnexion.
 */
export async function POST(request: NextRequest) {
  // Vérification Origin/Referer pour protection CSRF supplémentaire
  const originCheck = checkOrigin(request);
  if (originCheck) return originCheck;
  
  try {
    // Configuration de l'URL du backend
    const backendUrl = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    // Récupérer le token depuis les cookies pour l'envoyer au backend
    const token = request.cookies.get('payload-token')?.value;
    
    // Informer le backend de la déconnexion (même si pas obligatoire)
    if (token) {
      try {
        await fetch(`${backendUrl}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `JWT ${token}`,
          },
        });
      } catch (e) {
        // On continue même si l'appel au backend échoue
        console.warn('[/api/auth/logout] Erreur lors de la déconnexion backend:', e);
      }
    }
    
    // Créer une réponse indiquant le succès de la déconnexion
    const response = NextResponse.json({
      success: true,
      message: 'Déconnexion réussie'
    });
    
    // Supprimer le cookie d'authentification
    response.cookies.set('payload-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0), // Date dans le passé pour forcer l'expiration
      path: '/',
    });
    
    return response;
    
  } catch (error) {
    console.error('[/api/auth/logout] Erreur:', error);
    
    // Même en cas d'erreur, on tente de supprimer le cookie
    const response = NextResponse.json({
      error: error instanceof Error ? error.message : 'Une erreur lors de la déconnexion',
      success: false
    }, { status: 500 });
    
    response.cookies.set('payload-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(0),
      path: '/',
    });
    
    return response;
  }
}
