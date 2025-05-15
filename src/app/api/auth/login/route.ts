import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    // Configuration de l'URL du backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    // Récupérer le corps de la requête
    const body = await request.json();
    
    // Transmettre la requête au backend
    const response = await fetch(`${backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    // Récupérer les données de la réponse
    const data = await response.json();
    
    // Si la réponse n'est pas OK, renvoyer l'erreur
    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Erreur d\'authentification' }, 
        { status: response.status }
      );
    }
    
    // Vérifier si un token est présent dans la réponse
    const token = data.token || '';
    
    if (!token) {
      console.error('[/api/auth/login] Aucun token reçu du backend.');
      return NextResponse.json(
        { error: 'Token manquant dans la réponse du serveur' }, 
        { status: 500 }
      );
    }
    
    console.log('[/api/auth/login] Token reçu du backend, longueur:', token.length);
    
    // Créer une réponse avec les données
    const jsonResponse = NextResponse.json(
      { 
        ...data,
        authenticated: true,
        message: 'Connexion réussie'
      }, 
      { status: 200 }
    );
    
    // Définir le cookie contenant le token dans la réponse
    jsonResponse.cookies.set('payload-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: '/',
    });
    
    return jsonResponse;
    
  } catch (error) {
    console.error('[/api/auth/login] Erreur:', error);
    
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Une erreur inconnue est survenue'
    }, { status: 500 });
  }
}
