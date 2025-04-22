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

    // Ajouter le cookie d'authentification
    if (data.token) {
      // Log pour débogage
      console.log('Token reçu du backend, longueur:', data.token.length);
      
      // Configurer le cookie pour qu'il soit accessible au JavaScript sur le client
      // Cela permet de déboguer mais n'est pas recommandé en production
      frontendResponse.cookies.set({
        name: 'payload-token',
        value: data.token,
        path: '/',
        httpOnly: false, // Permettre l'accès via JavaScript pour le débogage
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 jours
        sameSite: 'lax', // Permettre l'envoi lors de la navigation depuis d'autres domaines
      });
      
      // Ajouter aussi un cookie non-httpOnly pour pouvoir vérifier sa présence côté client
      frontendResponse.cookies.set({
        name: 'auth-status',
        value: 'logged-in',
        path: '/',
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 7 jours
        sameSite: 'lax',
      });
      
      console.log('Cookies configurés dans la réponse');
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
