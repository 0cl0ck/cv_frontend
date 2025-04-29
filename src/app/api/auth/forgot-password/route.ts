import { NextRequest, NextResponse } from 'next/server';

// Fonction GET pour tester si l'erreur de build persiste
export async function GET() {
  return NextResponse.json({ message: 'Endpoint de réinitialisation de mot de passe' });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;
    
    // Version simplifiée sans appel fetch externe
    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }
    
    // Simuler un succès (nous ne faisons pas d'appel externe pour tester le build)
    return NextResponse.json({
      success: true,
      message: `Une demande de réinitialisation a été envoyée à ${email}`,
    });
  } catch {
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la demande de réinitialisation.' },
      { status: 500 }
    );
  }
}
