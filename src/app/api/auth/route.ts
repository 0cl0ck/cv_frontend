import { NextRequest, NextResponse } from 'next/server';

// Site maintenant ouvert à tous - pas de protection par mot de passe
// Durée de validité du cookie (24 heures)
const COOKIE_EXPIRATION = 24 * 60 * 60 * 1000;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(request: NextRequest) {
  try {
    // Site maintenant ouvert à tous - autorisation automatique
    // Créer la réponse
    const response = NextResponse.json({ 
      success: true,
      message: 'Site ouvert à tous les visiteurs' 
    });
    
    // Définir le cookie dans la réponse
    response.cookies.set({
      name: 'auth_token',
      value: 'authenticated', // Simple valeur, on pourrait utiliser un JWT pour plus de sécurité
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: COOKIE_EXPIRATION,
      sameSite: 'strict',
    });

    return response;
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { success: false, message: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
