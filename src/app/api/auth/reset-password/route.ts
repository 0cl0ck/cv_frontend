import { NextRequest, NextResponse } from 'next/server';

/**
 * API de vérification de token pour la réinitialisation de mot de passe
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { valid: false, error: 'Token requis' },
      { status: 400 }
    );
  }

  try {
    // Appel au backend pour vérifier le token
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/reset-password?token=${token}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    return NextResponse.json(data);
  } catch (err) {
    console.error('Erreur lors de la vérification du token:', err);
    
    return NextResponse.json(
      { valid: false, error: 'Une erreur est survenue lors de la vérification du token' },
      { status: 500 }
    );
  }
}

/**
 * API de réinitialisation de mot de passe
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: 'Token et nouveau mot de passe requis' },
        { status: 400 }
      );
    }

    // Validation basique du mot de passe côté frontend
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      );
    }

    // Appel au backend pour effectuer la réinitialisation
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        newPassword,
        collection: 'customers'
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: data.error || 'Erreur lors de la réinitialisation du mot de passe',
          code: data.code 
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: data.message || 'Mot de passe réinitialisé avec succès'
    });
  } catch (err) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', err);
    
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la réinitialisation du mot de passe' },
      { status: 500 }
    );
  }
}
