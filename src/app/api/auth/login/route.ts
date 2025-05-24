import { NextRequest, NextResponse } from 'next/server';
import { secureLogger as logger } from '@/utils/logger';
import { httpClient } from '@/lib/httpClient';
import type { AxiosError, AxiosResponse } from 'axios';

export async function POST(request: NextRequest) {
  try {
    // Configuration de l'URL du backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    // Récupérer le corps de la requête
    const body = await request.json();
    
    // Transmettre la requête au backend via httpClient
    const sendRequest = async () =>
      httpClient.post(`${backendUrl}/api/auth/login`, body, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

    let response: AxiosResponse | undefined;
    try {
      response = await sendRequest();
    } catch (err: unknown) {
      const axiosErr = err as AxiosError;
      response = axiosErr.response;
    }

    const data = response?.data;
    
    // Si la réponse n'est pas OK, renvoyer l'erreur
    if (!response || response.status < 200 || response.status >= 300) {
      // S'assurer que data.error est une chaîne formatée correctement
      let errorMessage = 'Erreur d\'authentification';
      
      // Gérer les différents formats d'erreur possibles
      if (typeof data.error === 'string') {
        errorMessage = data.error;
      } else if (data.error && typeof data.error === 'object') {
        // Si l'erreur est un objet, essayer d'extraire un message
        if (data.error.message) {
          errorMessage = data.error.message;
        } else if (data.message) {
          errorMessage = data.message;
        } else {
          // Dernière tentative : convertir l'objet en chaîne plus lisible
          try {
            errorMessage = JSON.stringify(data.error);
          } catch {
            // Garder le message par défaut
          }
        }
      } else if (data.message) {
        errorMessage = data.message;
      }
      
      // Pour les erreurs d'identifiants incorrects (401)
      if (response.status === 401) {
        errorMessage = 'Email ou mot de passe incorrect';
      }
      
      logger.error('[/api/auth/login] Erreur retournée au client', { errorMessage });
      
      return NextResponse.json(
        { error: errorMessage }, 
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
    
    logger.debug('[/api/auth/login] Token reçu du backend', { length: token.length });
    
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
