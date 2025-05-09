import { NextResponse } from 'next/server';
import { withApiAuth } from '@/lib/api-auth';

/**
 * API pour la déconnexion sécurisée
 * POST /api/auth/logout
 * 
 * Cette route API:
 * 1. Vérifie que l'utilisateur est bien authentifié
 * 2. Supprime le cookie d'authentification avec les paramètres de sécurité appropriés
 */
export const POST = withApiAuth(
  async () => {
    try {
      // Créer une réponse qui supprime le cookie d'authentification
      const response = NextResponse.json(
        { success: true, message: 'Déconnexion réussie' }
      );
      
      // Supprimer le cookie payload-token avec des paramètres sécurisés
      response.cookies.delete({
        name: 'payload-token',
        path: '/',
        // Paramètres de sécurité essentiels
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        // httpOnly est défini implicitement car nous utilisons l'API Response.cookies
      });
      
      return response;
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      return NextResponse.json(
        { error: 'Une erreur est survenue lors de la déconnexion' },
        { status: 500 }
      );
    }
  },
  // Cette route est accessible pour tous les utilisateurs authentifiés
  { roles: ['customers', 'admins'] }
);
