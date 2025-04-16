import { NextRequest, NextResponse } from 'next/server';

// Mot de passe à changer (vous voudrez le mettre dans une variable d'environnement)
const PASSWORD = 'cannabidiol';

// Durée de validité du cookie (24 heures)
const COOKIE_EXPIRATION = 24 * 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    // Vérifier le mot de passe
    if (password === PASSWORD) {
      // Créer la réponse
      const response = NextResponse.json({ success: true });
      
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
    } else {
      return NextResponse.json(
        { success: false, message: 'Mot de passe incorrect' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { success: false, message: 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
