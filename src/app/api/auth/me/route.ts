import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyJwtToken } from '@/lib/auth/jwt';

/**
 * API pour récupérer les informations de l'utilisateur connecté
 * GET /api/auth/me
 */
export async function GET() {
  try {
    // Récupérer le token JWT des cookies
    const cookieStore = await cookies();
    
    // Déboguer tous les cookies disponibles
    console.log('Cookies disponibles:', cookieStore.getAll().map(c => c.name));
    
    // Vérifier spécifiquement le cookie payload-token
    const token = cookieStore.get('payload-token')?.value;
    console.log('Token trouvé dans les cookies:', token ? 'Oui (longueur: ' + token.length + ')' : 'Non');

    // Si aucun token n'est trouvé, l'utilisateur n'est pas authentifié
    if (!token) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Vérifier et décoder le token
    console.log('Tentative de vérification du token JWT...');
    const decoded = await verifyJwtToken(token);
    console.log('Résultat de la vérification JWT:', decoded ? 'Succès' : 'Échec');
    
    if (!decoded) {
      // Token invalide
      return NextResponse.json(
        { error: 'Session invalide' },
        { status: 401 }
      );
    }
    
    // Format du token de Payload CMS : { id, email, collection, iat, exp }
    // Au lieu d'avoir un objet user, les données sont directement dans le payload
    const userData = {
      id: decoded.id,
      email: decoded.email,
      collection: decoded.collection,
      // Valeurs par défaut pour les champs manquants
      firstName: 'Utilisateur',
      lastName: 'Connecté',
      createdAt: new Date().toISOString(),
    };

    // Retourner les informations de l'utilisateur (sans données sensibles)
    return NextResponse.json({
      user: userData
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des données utilisateur:', error);
    
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des informations utilisateur' },
      { status: 500 }
    );
  }
}
