import { NextRequest, NextResponse } from 'next/server';

/**
 * API de mise à jour des informations utilisateur
 * POST /api/user/update
 */
export async function POST
(request: NextRequest) {
    try {
      // Récupérer les données à mettre à jour
      const body = await request.json();
      const { ...updateData } = body;
      
      // Récupérer l'identifiant utilisateur depuis le backend
      // Utiliser credentials: 'include' pour transmettre les cookies automatiquement
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      const userResponse = await fetch(`${backendUrl}/api/auth/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!userResponse.ok) {
        return NextResponse.json(
          { message: 'Erreur d\'authentification' },
          { status: 401 }
        );
      }
      
      const userData = await userResponse.json();
      const userId = userData.user?.id;
      
      if (!userId) {
        return NextResponse.json(
          { message: 'Impossible de récupérer l\'identifiant utilisateur' },
          { status: 400 }
        );
      }
      
      // Appeler l'API backend avec credentials: 'include'
      const response = await fetch(`${backendUrl}/api/customers/${userId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
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
}
