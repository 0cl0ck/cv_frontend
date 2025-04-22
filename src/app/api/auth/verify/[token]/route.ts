import { NextRequest, NextResponse } from 'next/server';

interface TokenParams {
  token: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: TokenParams }
) {
  try {
    const { token } = params;

    if (!token) {
      return NextResponse.redirect(new URL('/connexion?error=token_manquant', request.url));
    }

    // Appeler le backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    console.log(`Vérification du token: ${token} sur ${backendUrl}/api/customers/verify`);
    
    const response = await fetch(`${backendUrl}/api/customers/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Erreur de vérification:', error);
      return NextResponse.redirect(
        new URL(`/connexion?error=verification_failed&message=${encodeURIComponent(error.message || 'Lien de vérification invalide ou expiré')}`, request.url)
      );
    }

    // Redirection vers la page de connexion avec succès
    return NextResponse.redirect(
      new URL('/connexion?verified=true', request.url)
    );
  } catch (error) {
    console.error('Erreur lors de la vérification:', error);
    
    // Journaliser plus d'informations pour le débogage
    if (error instanceof Error) {
      console.error('Détails de l\'erreur:', error.message);
      console.error('Stack trace:', error.stack);
    }
    
    return NextResponse.redirect(
      new URL('/connexion?error=erreur_systeme', request.url)
    );
  }
}
