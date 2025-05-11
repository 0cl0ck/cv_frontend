import { NextRequest, NextResponse } from 'next/server';
import { validateRequest, sanitizeObject } from '@/utils/validation/validator';
import { registerSchema } from '@/utils/validation/schemas';
import { secureLogger as logger } from '@/utils/logger';

export async function POST(request: NextRequest) {
  // Permettre les requêtes CORS provenant du frontend
  const response = NextResponse.next();
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  try {
    // Validation des données d'inscription avec notre utilitaire centralisé
    const validation = await validateRequest(request, registerSchema, { verbose: true });
    
    // Si la validation échoue, retourner immédiatement la réponse d'erreur
    if (!validation.success) {
      return validation.response;
    }
    
    // Données validées et sanitisées
    const sanitizedData = sanitizeObject(validation.data);
    
    // Journaliser les détails pour le débogage (données sécurisées par notre logger)
    logger.debug('Données d\'inscription validées', {
      ...sanitizedData,
      password: '***********' // Masquer le mot de passe par sécurité supplémentaire
    });
    
    // Appeler le backend directement sans proxy Next.js
    // Le backend fonctionne sur le port 3000
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    // Préparation des données pour PayloadCMS
    const payloadData = {
      firstName: sanitizedData.firstName,
      lastName: sanitizedData.lastName,
      email: sanitizedData.email,
      password: sanitizedData.password,
      isEmailVerified: false, // Forcé à false initialement
      gdprConsent: {
        ...sanitizedData.gdprConsent,
        termsAccepted: true,
        privacyAccepted: true,
        consentDate: new Date().toISOString(),
        consentIP: request.headers.get('x-forwarded-for') || 'unknown'
      }
    };
    
    // 1. Créer l'utilisateur via l'API PayloadCMS directe
    const apiResponse = await fetch(`${backendUrl}/api/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payloadData),
    });
    
    // 2. Si l'inscription réussit, envoyer un email de vérification
    if (apiResponse.ok) {
      const data = await apiResponse.json();
      console.log('Inscription réussie, envoi de l\'email de vérification...');
      
      // Récupérer l'ID du customer créé
      const customerId = data.doc?.id;
      
      if (customerId) {
        // L'email de vérification est maintenant envoyé automatiquement par le hook afterOperation
        // dans la collection Customers.ts
        console.log('L\'email de vérification est envoyé automatiquement par le backend.');
      }
      
      return NextResponse.json(data);
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
      // Remplacer any par un type union plus précis pour l'index signature
      [key: string]: string | number | boolean | undefined | null | object;
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
    // Utilisation du logger sécurisé qui masque automatiquement les données sensibles
    logger.error('Erreur lors de l\'inscription', { error });
    
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
