import { NextRequest, NextResponse } from 'next/server';
import { withApiAuth } from '@/lib/api-auth';

/**
 * API de mise à jour des informations utilisateur
 * POST /api/user/update
 */
export const POST = withApiAuth(
  async (request: NextRequest, user) => {
    try {
      // Récupérer les données à mettre à jour
      const body = await request.json();
      const { ...updateData } = body;
      
      // Sécurité: vérifier que l'utilisateur ne peut modifier que son propre profil
      // userId est maintenant directement disponible depuis le token JWT vérifié
      const userId = user.id;
      
      // Récupérer le token depuis les cookies pour l'authentification au backend
      const token = request.cookies.get('payload-token')?.value;
      if (!token) {
        return NextResponse.json(
          { message: 'Token d\'authentification manquant' },
          { status: 401 }
        );
      }

      // Appeler l'API backend
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const response = await fetch(`${backendUrl}/api/customers/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      // Vérifier la réponse du backend
      const responseData = await response.json();
      
      if (!response.ok) {
        return NextResponse.json(
          { message: responseData.message || 'Erreur lors de la mise à jour' },
          { status: response.status }
        );
      }

      // Retourner les données mises à jour
      return NextResponse.json(responseData);
    } catch (error) {
      console.error('Erreur lors de la mise à jour des informations utilisateur:', error);
      return NextResponse.json(
        { message: 'Une erreur est survenue lors de la mise à jour' },
        { status: 500 }
      );
    }
  },
  // Options: Limiter l'accès aux clients uniquement
  { roles: ['customers'] }
);
