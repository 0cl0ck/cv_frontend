import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, collection } = body;

    // Appeler le backend
    // Le backend fonctionne sur le port 3000 tandis que le frontend est sur 3001
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    console.log(`Tentative de connexion au backend: ${backendUrl}/api/auth/login`);
    
    const response = await fetch(`${backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, collection }),
    });

    const data = await response.json();

    // Si le backend renvoie une erreur, la propager
    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Erreur de connexion' },
        { status: response.status }
      );
    }

    // Créer la réponse avec les cookies
    const frontendResponse = NextResponse.json(data);

    // Ajouter le cookie d'authentification (remplacer par la vraie logique de votre application)
    if (data.token) {
      frontendResponse.cookies.set({
        name: 'payload-token',
        value: data.token,
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 jours
        sameSite: 'strict',
      });
    }

    return frontendResponse;
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    
    // Journaliser plus d'informations pour le débogage
    if (error instanceof Error) {
      console.error('Détails de l\'erreur:', error.message);
      console.error('Stack trace:', error.stack);
    }
    
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la connexion. Vérifiez que le backend est en cours d\'exécution.' },
      { status: 500 }
    );
  }
}
