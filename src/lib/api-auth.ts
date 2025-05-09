import { NextRequest, NextResponse } from 'next/server';
import { JWTPayload, verifyAuth } from './server/auth';

type ApiHandler = (
  req: NextRequest,
  user: JWTPayload
) => Promise<NextResponse> | NextResponse;

type ApiAuthOptions = {
  /** Spécifier les rôles autorisés (collections) */
  roles?: Array<'customers' | 'admins'>;
};

/**
 * Protège une API route avec vérification JWT
 * 
 * @param handler - La fonction handler de l'API route
 * @param options - Options de contrôle d'accès
 * @returns Un nouveau handler avec vérification d'authentification
 * 
 * Exemple d'utilisation:
 * ```typescript
 * export const GET = withApiAuth(
 *   async (req, user) => {
 *     // Code sécurisé, l'utilisateur est authentifié
 *     return NextResponse.json({ user });
 *   },
 *   { roles: ['customers'] } // Uniquement accessible aux clients
 * );
 * ```
 */
export function withApiAuth(handler: ApiHandler, options: ApiAuthOptions = {}) {
  return async (req: NextRequest) => {
    try {
      // Vérification de l'authentification
      const user = await verifyAuth(req);
      
      // Non authentifié
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      
      // Vérification des rôles si spécifiés
      if (options.roles && options.roles.length > 0) {
        if (!options.roles.includes(user.collection)) {
          return NextResponse.json(
            { error: 'Forbidden', message: 'Vous n\'avez pas les droits suffisants' },
            { status: 403 }
          );
        }
      }
      
      // Appel du handler avec l'utilisateur authentifié
      return await handler(req, user);
    } catch (error) {
      console.error('Erreur dans withApiAuth:', error);
      return NextResponse.json(
        { error: 'Internal Server Error' },
        { status: 500 }
      );
    }
  };
}

/**
 * Exemple d'utilisation avec des permissions basées sur les rôles et ressources
 */
export function hasPermission(
  user: JWTPayload, 
  resource: string, 
  action: 'read' | 'create' | 'update' | 'delete'
): boolean {
  // Les admins ont toutes les permissions
  if (user.collection === 'admins') return true;
  
  // Permissions pour les clients
  if (user.collection === 'customers') {
    // Un client peut lire/modifier ses propres ressources
    if (resource === 'customers' && ['read', 'update'].includes(action)) {
      return true;
    }
    
    // Un client peut voir ses propres commandes
    if (resource === 'orders' && action === 'read') {
      return true;
    }
    
    // Autres vérifications de permission spécifiques...
  }
  
  return false;
}
