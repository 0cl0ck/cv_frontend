import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Récupérer tous les cookies
    const cookies = request.cookies.getAll();
    
    // Chercher le cookie d'authentification
    const authCookie = cookies.find(cookie => cookie.name === 'payload-token');
    
    // Préparer la réponse
    const cookieInfo = {
      allCookies: cookies.map(c => ({ 
        name: c.name,
        // Ne pas afficher la valeur complète pour des raisons de sécurité
        valueExists: !!c.value,
        valueLength: c.value ? c.value.length : 0
      })),
      authCookieExists: !!authCookie,
      authCookieValueLength: authCookie ? authCookie.value.length : 0
    };
    
    // Renvoyer les informations sur les cookies
    return NextResponse.json(cookieInfo, { status: 200 });
  } catch (error) {
    console.error('Erreur lors de la vérification des cookies:', error);
    
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la vérification des cookies' },
      { status: 500 }
    );
  }
}
