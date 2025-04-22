import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, collection = 'customers' } = body;

    // Appeler le backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    console.log(`Demande de réinitialisation de mot de passe pour ${email} sur ${backendUrl}/api/customers/forgot-password`);
    
    const response = await fetch(`${backendUrl}/api/${collection}/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    // Si le backend renvoie une erreur, la propager
    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Erreur lors de la demande de réinitialisation' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur lors de la demande de réinitialisation:', error);
    
    // Journaliser plus d'informations pour le débogage
    if (error instanceof Error) {
      console.error('Détails de l\'erreur:', error.message);
      console.error('Stack trace:', error.stack);
    }
    
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la demande de réinitialisation. Vérifiez que le backend est en cours d\'exécution.' },
      { status: 500 }
    );
  }
}
