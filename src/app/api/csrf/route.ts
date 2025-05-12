import { NextResponse } from 'next/server';
import { randomBytes, createHmac } from 'crypto';
import { secureLogger as logger } from '@/utils/logger';

// Durée de validité des tokens CSRF (en secondes)
const CSRF_TOKEN_EXPIRY = 3600; // 1 heure

export async function GET() {
  try {
    // 1. Génération du token aléatoire
    const token = randomBytes(32).toString('hex');
    
    // 2. Signature avec le secret CSRF
    const secret = process.env.CSRF_SECRET!;
    if (!secret) {
      logger.error('CSRF_SECRET manquant dans les variables d\'environnement');
      return NextResponse.json({ error: 'Configuration du serveur incorrecte' }, { status: 500 });
    }
    
    const signature = createHmac('sha256', secret).update(token).digest('hex');
    
    // 3. Envoyer les cookies
    const expires = new Date();
    expires.setTime(expires.getTime() + CSRF_TOKEN_EXPIRY * 1000);
    
    const response = NextResponse.json({ ok: true });
    
    // Définir les cookies
    response.cookies.set('csrf-token', token, {
      path: '/',
      sameSite: 'strict',
      maxAge: CSRF_TOKEN_EXPIRY,
      secure: process.env.NODE_ENV === 'production',
      httpOnly: false // Accessible via JS pour pouvoir l'inclure dans l'en-tête
    });
    
    response.cookies.set('csrf-sign', signature, {
      path: '/',
      sameSite: 'strict',
      maxAge: CSRF_TOKEN_EXPIRY,
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true // Non accessible via JS pour éviter les fuites
    });
    
    logger.info('Nouveau token CSRF généré');
    return response;
  } catch (error) {
    logger.error('Erreur lors de la génération du token CSRF', { error });
    return NextResponse.json({ error: 'Erreur lors de la génération du token CSRF' }, { status: 500 });
  }
}
