import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Récupérer le token depuis le cookie
    const token = request.cookies.get('payload-token')?.value;
    
    // Informations pour le débogage
    const debugInfo = {
      tokenExists: !!token,
      tokenLength: token ? token.length : 0,
      headers: Object.fromEntries(request.headers.entries()),
      cookies: request.cookies.getAll().map(c => ({ 
        name: c.name, 
        valueExists: !!c.value,
        valueLength: c.value ? c.value.length : 0
      }))
    };
    
    if (!token) {
      return NextResponse.json({
        status: 'unauthenticated',
        message: 'No authentication token found',
        debug: debugInfo
      }, { status: 200 });
    }
    
    // Configuration de l'URL du backend
    const backendUrl = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    // Tenter de valider le token avec le backend
    const response = await fetch(`${backendUrl}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    // Formater la réponse pour le débogage
    const authResult = {
      status: response.ok ? 'authenticated' : 'invalid',
      statusCode: response.status,
      debug: debugInfo
    };
    
    // Ajouter les données utilisateur si disponibles
    if (response.ok) {
      const userData = await response.json();
      return NextResponse.json({
        ...authResult,
        user: userData.user
      }, { status: 200 });
    }
    
    return NextResponse.json(authResult, { status: 200 });
  } catch (error) {
    console.error('Erreur lors du débogage d\'authentification:', error);
    
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Une erreur inconnue est survenue'
    }, { status: 500 });
  }
}
