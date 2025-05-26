/**
 * API endpoint pour les métriques Prometheus
 * 
 * Cette route redirige vers le backend qui est maintenant responsable
 * de la gestion et de l'exposition des métriques du système.
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware de sécurité pour protéger l'accès aux métriques
 */
function isAuthorized(req: NextRequest): boolean {
  // En développement, autoriser sans authentification
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }
  
  // En production, vérifier le token d'API
  const apiKey = process.env.METRICS_API_KEY;
  if (!apiKey) {
    console.warn('METRICS_API_KEY non définie, accès aux métriques refusé');
    return false;
  }
  
  const authHeader = req.headers.get('Authorization');
  return authHeader === `Bearer ${apiKey}`;
}

/**
 * GET /api/metrics
 * Rediriger vers le backend pour les métriques Prometheus
 */
export async function GET(req: NextRequest) {
  // Vérifier l'autorisation
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { error: 'Non autorisé' },
      { status: 401 }
    );
  }
  
  try {
    // Construction de l'URL du backend
    const backendUrl = process.env.BACKEND_INTERNAL_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const metricsUrl = `${backendUrl}/api/metrics`;
    
    // Log simple en mode développement
    if (process.env.NODE_ENV !== 'production') {
      console.debug('Redirection vers les métriques du backend', { backendUrl: metricsUrl });
    }
    
    // Transférer l'en-tête d'autorisation s'il existe
    const headers: HeadersInit = {};
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    
    // Appel au backend
    const response = await fetch(metricsUrl, { headers });
    
    if (!response.ok) {
      throw new Error(`Erreur du backend: ${response.status} ${response.statusText}`);
    }
    
    // Renvoyer la réponse du backend avec les en-têtes appropriés
    const metrics = await response.text();
    const contentType = response.headers.get('Content-Type') || 'text/plain';
    
    return new Response(metrics, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
  } catch (error) {
    // Journaliser l'erreur
    console.error('Erreur lors de la récupération des métriques depuis le backend', {
      error: error instanceof Error ? error.message : String(error)
    });
    
    // Réponse d'erreur
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des métriques depuis le backend' },
      { status: 500 }
    );
  }
}
