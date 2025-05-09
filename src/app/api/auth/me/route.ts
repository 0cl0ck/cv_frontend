import { NextResponse } from 'next/server';
import { withApiAuth } from '@/lib/api-auth';
import { NextRequest } from 'next/server';

/**
 * API pour récupérer les informations de l'utilisateur connecté
 * GET /api/auth/me
 */
export const GET = withApiAuth(
  async (req: NextRequest, user) => {
    try {
      // L'utilisateur est déjà authentifié grâce au wrapper withApiAuth
      // user contient les données décodées et vérifiées du token JWT
      
      // Conférer les données utilisateur de base depuis le token JWT
      const userData = {
        id: user.id,
        email: user.email,
        collection: user.collection,
        // Ajouter des valeurs par défaut si nécessaire
        firstName: 'Utilisateur',
        lastName: 'Connecté',
        createdAt: new Date().toISOString(),
      };
      
      // Facultatif: Récupérer des données utilisateur plus complètes depuis le backend
      try {
        // Configuration de l'URL du backend
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        
        // Récupérer le token depuis le cookie pour le transmettre au backend
        const token = req.cookies.get('payload-token')?.value;
        
        // Appel au backend pour obtenir les données utilisateur complètes
        const response = await fetch(`${backendUrl}/api/auth/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const backendData = await response.json();
          if (backendData.user) {
            // Retourner les données complètes du backend
            return NextResponse.json({ user: backendData.user });
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données complètes:', error);
        // En cas d'échec, continuer avec les données de base du token
      }
      
      // Retourner les données de base si on n'a pas pu obtenir les données complètes
      return NextResponse.json({ user: userData });
    } catch (error) {
      console.error('Erreur dans /api/auth/me:', error);
      return NextResponse.json(
        { error: 'Une erreur est survenue lors de la récupération des informations utilisateur' },
        { status: 500 }
      );
    }
  },
  // Options: Permet aux clients et aux administrateurs d'accéder à leurs données
  { roles: ['customers', 'admins'] }
);
