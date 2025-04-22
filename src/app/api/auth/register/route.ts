import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Permettre les requêtes CORS provenant du frontend
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  try {
    const body = await request.json();
    
    // Journaliser les détails pour le débogage
    console.log('Données d\'inscription:', {
      ...body,
      password: body.password ? '***********' : undefined, // Ne pas afficher le mot de passe
    });
    
    // Appeler le backend directement sans proxy Next.js
    // Le backend fonctionne sur le port 3000
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    console.log(`Tentative d'inscription au backend: ${backendUrl}/api/auth/register`);
    
    // Préparation des données pour PayloadCMS
    // HYPOTHÈSE 2: Assurons-nous que les données sont dans le format attendu par PayloadCMS
    console.log('DIAGNOSTIC: Vérification d\'une source possible d\'erreur - Format des données');
    
    // Pour déboguer, essayons un format plus complet avec des champs supplémentaires potentiellement nécessaires
    const payloadData = {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      password: body.password,
      // Ajout de champs qui pourraient être obligatoires
      isEmailVerified: false, // Forcé à false initialement
      gdprConsent: {
        ...body.gdprConsent,
        termsAccepted: true,
        privacyAccepted: true,
        consentDate: new Date().toISOString(),
        consentIP: request.headers.get('x-forwarded-for') || 'unknown'
      }
    };
    
    console.log('DIAGNOSTIC: Données formatées pour PayloadCMS:', {
      ...payloadData,
      password: '***********' // Masquer le mot de passe dans les logs
    });
    
    let apiResponse;
    
    // Essayer d'abord l'API personalisée, puis directement l'API PayloadCMS si ça échoue
    // HYPOTHÈSE 1: Vérifier si le problème est lié à l'envoi d'email
    console.log('DIAGNOSTIC: Vérification d\'une source possible d\'erreur - Configuration de l\'email');
    
    // Ajouter un paramètre pour ne pas envoyer d'email (pour tester cette hypothèse)
    const testWithoutEmail = true;
    
    try {
      console.log('Tentative via API personalisée');
      const customResponse = await fetch(`${backendUrl}/api/auth/register${testWithoutEmail ? '?skipVerification=true' : ''}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payloadData),
      });
      
      // Si la requête échoue, on continue avec le code existant
      if (!customResponse.ok) {
        console.log(`API personalisée a échoué avec le statut ${customResponse.status}, essai via API PayloadCMS...`);
        throw new Error('Tentative avec API directe de PayloadCMS');
      }
      
      apiResponse = customResponse;
    } catch (directApiError) {
      console.log('Tentative via API PayloadCMS directe');
      console.log('DIAGNOSTIC: Essai PayloadCMS avec des options de débogage');
      
      // Essayer directement l'API PayloadCMS pour customers avec des paramètres de débogage
      apiResponse = await fetch(`${backendUrl}/api/customers${testWithoutEmail ? '?draft=true' : ''}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payloadData),
      });
    }

    // Journaliser la réponse du backend en détail
    console.log('Statut de la réponse du backend:', apiResponse.status);
    console.log('En-têtes de la réponse:', {
      'content-type': apiResponse.headers.get('content-type'),
      'x-powered-by': apiResponse.headers.get('x-powered-by')
    });
    
    const data = await apiResponse.json();
    console.log('DIAGNOSTIC - Réponse complète du backend:', JSON.stringify(data, null, 2));
    
    // Définir l'interface pour les erreurs PayloadCMS
    interface PayloadError {
      message?: string;
      field?: string;
      [key: string]: any;
    }
    
    // Analyse spécifique pour notre débogage
    if (data.errors) {
      console.log('DIAGNOSTIC - Détails des erreurs:', data.errors);
      
      // Vérifier spécifiquement les erreurs liées aux emails ou à la structure
      const emailErrors = data.errors.filter((e: PayloadError) => e.message && (e.message.includes('email') || e.message.includes('mail')));
      if (emailErrors.length > 0) {
        console.log('DIAGNOSTIC - Hypothèse 1 confirmée: Problème lié aux emails:', emailErrors);
      }
      
      const validationErrors = data.errors.filter((e: PayloadError) => e.message && (e.message.includes('required') || e.message.includes('validation')));
      if (validationErrors.length > 0) {
        console.log('DIAGNOSTIC - Hypothèse 2 confirmée: Problème de validation de données:', validationErrors);
      }
    }

    // Si le backend renvoie une erreur, la propager
    if (!apiResponse.ok) {
      return NextResponse.json(
        { error: data.error || 'Erreur lors de l\'inscription' },
        { status: apiResponse.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Erreur lors de l\'inscription:', error);
    
    // Journaliser plus d'informations pour le débogage
    if (error instanceof Error) {
      console.error('Détails de l\'erreur:', error.message);
      console.error('Stack trace:', error.stack);
    }
    
    // Message d'erreur plus descriptif
    let errorMessage = 'Une erreur est survenue lors de l\'inscription.';
    if (error instanceof Error && error.message) {
      errorMessage += ` Erreur: ${error.message}`;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
