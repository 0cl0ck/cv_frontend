import { NextRequest, NextResponse } from 'next/server';

/**
 * Fonction GET pour renvoyer des informations sur l'endpoint
 */
export async function GET() {
  return NextResponse.json({ message: 'Endpoint de réinitialisation de mot de passe' });
}

/**
 * Fonction POST pour demander une réinitialisation de mot de passe
 * Fait suivre la requête au backend qui se chargera d'envoyer l'email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }
    
    // Appel au backend pour initier la réinitialisation de mot de passe
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        collection: 'customers'
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Erreur lors de la demande de réinitialisation' },
        { status: response.status }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: data.message || `Une demande de réinitialisation a été envoyée à ${email}`,
    });
  } catch (err) {
    console.error('Erreur lors de la demande de réinitialisation:', err);
    
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la demande de réinitialisation.' },
      { status: 500 }
    );
  }
}
