import { NextRequest, NextResponse } from 'next/server';

/**
 * API qui vérifie directement l'email (sans passer par l'ancien endpoint PayloadCMS)
 * Cette API est appelée par la page /compte/verifier-email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      console.error('Erreur: token manquant dans la requête');
      return NextResponse.json(
        { error: 'Token de vérification manquant' },
        { status: 400 }
      );
    }

    console.info('Vérification d\'email en cours', {
      token: token.substring(0, 15) + '...'
    });

    try {
      // Obtenir l'URL du backend à partir des variables d'environnement
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      
      // Récupérer le cookie d'authentification
      // Note: pas besoin de cookie d'authentification pour la vérification d'email
      
      // Vérifier le token et mettre à jour l'utilisateur
      const response = await fetch(`${backendUrl}/api/auth/verify-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erreur lors de la vérification de l\'email', {
          status: response.status,
          error: errorData.error || 'Erreur inconnue'
        });
        
        return NextResponse.json(
          { error: errorData.error || 'Erreur lors de la vérification de l\'email' },
          { status: response.status }
        );
      }

      // Récupérer la réponse du backend
      const data = await response.json();
      console.info('Email vérifié avec succès', {
        userId: data.customer?.id,
        isEmailVerified: data.customer?.isEmailVerified
      });

      // Retourner la réponse de succès au client
      return NextResponse.json({ success: true, customer: data.customer });
    } catch (fetchError) {
      console.error('Erreur lors de la communication avec le backend', {
        error: fetchError instanceof Error ? fetchError.message : String(fetchError)
      });
      
      return NextResponse.json(
        { error: 'Impossible de communiquer avec le serveur d\'authentification' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Exception lors de la vérification d\'email', {
      error: error instanceof Error ? error.message : String(error)
    });
    
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la vérification' },
      { status: 500 }
    );
  }
}
