import { NextResponse, NextRequest } from 'next/server';

/**
 * API pour la déconnexion sécurisée
 * POST /api/auth/logout
 * 
 * Cette route API simplement:
 * 1. Envoie une requête de déconnexion au backend (qui se charge de la révocation du token)
 * 2. Supprime le cookie d'authentification avec les paramètres de sécurité appropriés
 */
export async function POST(req: NextRequest) {
  try {
    // Extraire le token pour le transmettre au backend
    const token = req.cookies.get('payload-token')?.value;
    
    // 1. Informer le backend de la déconnexion pour qu'il puisse révoquer le token
    // Nous n'avons plus besoin de vérifier la réponse en détail car c'est géré par le backend
    if (token) {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      try {
        const backendResponse = await fetch(`${backendUrl}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ collection: 'customers' }) // Ajout du body requis par le backend
        });
        
        // Vérifier la réponse du backend et logger plus d'informations
        if (!backendResponse.ok) {
          const errorText = await backendResponse.text().catch(() => 'Impossible de lire le corps de l\'erreur');
          console.error(`Erreur backend (${backendResponse.status}):`, errorText);
        } else {
          console.log('Backend a confirmé la déconnexion avec succès');
        }
        console.log('Notification de déconnexion envoyée au backend');
      } catch (error) {
        console.error('Erreur lors de la notification au backend:', error);
        // Continuer même en cas d'erreur pour supprimer les cookies locaux
      }
    }
    
    // 2. Créer une réponse qui supprime le cookie d'authentification
    const response = NextResponse.json({
      success: true,
      message: 'Déconnexion réussie',
    });
    
    // 4. Suppression complète du cookie avec paramètres de sécurité correspondant à ceux utilisés à la création
    // Cette méthode est plus robuste car elle force le navigateur à supprimer le cookie
    // Les attributs de sécurité doivent être identiques à ceux utilisés lors de la création
    response.cookies.set({
      name: 'payload-token',
      value: '',
      path: '/',
      expires: new Date(0), // Date dans le passé = suppression immédiate
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      domain: process.env.COOKIE_DOMAIN || undefined,
    });
    
    // 5. Supprimer également le cookie d'état d'authentification
    response.cookies.set({
      name: 'auth-status',
      value: '',
      path: '/',
      expires: new Date(0),
      maxAge: 0,
      httpOnly: false, // Ce cookie était accessible par JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      domain: process.env.COOKIE_DOMAIN || undefined,
    });
    
    // 6. Définir les en-têtes de sécurité et anti-cache
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    
    return response;
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
    
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la déconnexion' },
      { status: 500 }
    );
  }
}

