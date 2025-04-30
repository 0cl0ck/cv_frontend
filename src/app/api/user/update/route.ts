import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Récupérer le token d'authentification depuis la requête
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { message: 'Token d\'authentification manquant' },
        { status: 401 }
      );
    }

    // Récupérer les données à mettre à jour
    const body = await request.json();
    const { userId, ...updateData } = body;

    if (!userId) {
      return NextResponse.json(
        { message: 'ID utilisateur manquant' },
        { status: 400 }
      );
    }

    // Appeler l'API backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${backendUrl}/api/customers/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
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
