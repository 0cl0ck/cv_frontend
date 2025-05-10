import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Schéma de validation Zod pour les requêtes de login
const loginSchema = z.object({
  email: z.string().email('Format d\'email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  collection: z.enum(['customers', 'admins'], {
    errorMap: () => ({ message: 'Collection doit être "customers" ou "admins"' })
  })
});

// Fonction pour gérer la connexion
export async function POST(request: NextRequest) {
  try {
    // 1. Récupérer les informations de connexion depuis le corps de la requête
    const body = await request.json().catch(() => ({}));
    
    // 2. Valider les entrées utilisateur avec Zod
    const result = loginSchema.safeParse(body);
    
    if (!result.success) {
      // Formater les erreurs de validation
      const errorMessage = result.error.errors.map(e => 
        `${e.path.join('.')}: ${e.message}`
      ).join(', ');
      
      // Log simple pour le débogage
      console.error('Validation login échouée:', result.error.errors);
      
      return NextResponse.json(
        { error: 'Données de connexion invalides', details: errorMessage },
        { status: 400 }
      );
    }
    
    // Extraction des données validées
    const { email, password, collection } = result.data;

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
        httpOnly: true, // Important: empecher l'accès depuis JavaScript
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24, // Réduit à 24h pour limiter le risque
        sameSite: 'strict', // Protection CSRF plus stricte
      });
      
      // Nous n'utilisons plus le cookie auth-status - SWR vérifie directement /api/auth/me
      
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

