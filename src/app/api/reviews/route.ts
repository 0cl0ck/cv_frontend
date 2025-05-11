import { NextResponse, NextRequest } from 'next/server';
import { validateRequest, sanitizeObject } from '@/utils/validation/validator';
import { reviewSchema } from '@/utils/validation/schemas';
import { sanitizeHtml, logInjectionAttempt } from '@/utils/security/sanitizer';
import { secureLogger as logger } from '@/utils/logger';

// DÃ©finir un type pour les avis
type ReviewData = {
  id: string;
  rating: number;
  reviewTitle: string;
  reviewContent: string;
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  user: string | {
    id: string;
    firstName?: string;
    lastName?: string;
    prenom?: string;
    nom?: string;
    email?: string;
    [key: string]: string | number | boolean | undefined;
  };
  createdAt: string;
  userDisplayName?: string;
};

/**
 * GET - RÃ©cupÃ©rer les avis pour un produit
 */
export async function GET(req: NextRequest) {
  try {
    // Validation des paramÃ¨tres avec notre schÃ©ma
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    
    if (!productId) {
      return NextResponse.json(
        { error: 'L\'identifiant du produit est requis' },
        { status: 400 }
      );
    }

    // Utiliser l'URL du backend configurÃ©e
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    // Construire les paramÃ¨tres de requÃªte pour filtrer les avis
    const queryParams = new URLSearchParams();
    queryParams.append('where[product][equals]', productId);
    queryParams.append('where[isApproved][equals]', 'true');
    queryParams.append('sort', '-createdAt');
    queryParams.append('limit', '100');
    queryParams.append('depth', '2'); 
    
    // RÃ©cupÃ©rer les avis approuvÃ©s pour ce produit
    const response = await fetch(`${backendUrl}/api/reviews?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    
    // Fonction pour rÃ©cupÃ©rer les informations utilisateur d'un avis
    const fetchUserInfo = async (userId: string) => {
      try {
        logger.debug('RÃ©cupÃ©ration des informations pour l\'utilisateur', { userId });
        
        // Essayer avec le token d'authentification admin si disponible
        const adminToken = process.env.PAYLOAD_ADMIN_TOKEN;
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };
        
        if (adminToken) {
          headers['Authorization'] = `JWT ${adminToken}`;
        }
        
        const userResponse = await fetch(`${backendUrl}/api/customers/${userId}`, {
          method: 'GET',
          headers,
          cache: 'no-store',
        });
        
        if (!userResponse.ok) {
          logger.error('Erreur lors de la rÃ©cupÃ©ration des dÃ©tails utilisateur', { 
            userId,
            status: userResponse.status 
          });
          return null;
        }
        
        const userInfo = await userResponse.json();
        return userInfo;
      } catch (error) {
        logger.error('Erreur lors de la rÃ©cupÃ©ration des dÃ©tails utilisateur', { 
          userId,
          error
        });
        return null;
      }
    };
    
    // Collecter tous les ID utilisateurs uniques
    const userIds = new Set<string>();
    data.docs.forEach((review: ReviewData) => {
      if (typeof review.user === 'string') {
        userIds.add(review.user);
      }
    });
    
    // RÃ©cupÃ©rer les informations utilisateur pour tous les avis
    const userInfoMap = new Map();
    await Promise.all(
      [...userIds].map(async (userId) => {
        const userInfo = await fetchUserInfo(userId);
        if (userInfo) {
          userInfoMap.set(userId, userInfo);
        }
      })
    );
    
    logger.info('Informations utilisateur rÃ©cupÃ©rÃ©es', { 
      count: userInfoMap.size,
      productId
    });
    
    // Conversion des donnÃ©es brutes en objet ReviewData typable
    const processedReviews = data.docs.map((review: Record<string, unknown>) => {
      const reviewData = review as ReviewData;
      
      // Sanitiser le contenu des avis pour Ã©viter XSS en sortie
      if (typeof reviewData.reviewContent === 'string') {
        reviewData.reviewContent = sanitizeHtml(reviewData.reviewContent);
      }
      
      if (typeof reviewData.reviewTitle === 'string') {
        reviewData.reviewTitle = sanitizeString(reviewData.reviewTitle);
      }
      
      // RÃ©cupÃ©rer les donnÃ©es utilisateur si disponibles
      if (typeof reviewData.user === 'string') {
        const userInfo = userInfoMap.get(reviewData.user);
        if (userInfo) {
          // Ajouter les donnÃ©es utilisateur complÃ¨tes Ã  l'objet review
          const firstName = userInfo.firstName || '';
          const lastName = userInfo.lastName || '';
          
          let userDisplayName = 'Utilisateur';
          if (firstName) {
            userDisplayName = firstName;
            if (lastName) {
              userDisplayName += ` ${lastName.charAt(0)}.`;
            }
          }
          
          reviewData.userDisplayName = userDisplayName;
        }
      }
      
      return reviewData;
    });
    
    // Retourner les reviews formatÃ©es
    return NextResponse.json({
      reviews: processedReviews,
      pagination: {
        totalDocs: data.totalDocs,
        page: data.page,
        totalPages: data.totalPages
      }
    });
    
  } catch (error) {
    logger.error('Erreur lors de la rÃ©cupÃ©ration des avis', { error });
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la rÃ©cupÃ©ration des avis' },
      { status: 500 }
    );
  }
}

/**
 * POST - Soumettre un nouvel avis
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Valider les entrÃ©es utilisateur avec notre utilitaire centralisÃ©
    const validation = await validateRequest(req, reviewSchema, { verbose: true });
    
    // Si la validation Ã©choue, retourner immÃ©diatement la rÃ©ponse d'erreur
    if (!validation.success) {
      return validation.response;
    }
    
    // 2. Extraire et sanitiser les donnÃ©es validÃ©es pour prÃ©venir XSS
    const sanitizedData = sanitizeObject(validation.data);
    const { productId, rating, reviewContent } = sanitizedData;
    
    // 3. Sanitisation spÃ©cifique pour le contenu de l'avis
    // Permet un formatage minimal mais sÃ©curisÃ© (b, i, p, etc.)
    let sanitizedReviewContent = '';
    if (reviewContent) {
      // VÃ©rifier les tentatives d'injection malveillantes
      logInjectionAttempt(reviewContent, req);
      sanitizedReviewContent = sanitizeHtml(reviewContent);
    }
    
    // 4. RÃ©cupÃ©rer le token d'authentification
    const token = req.cookies.get('payload-token')?.value;
    
    if (!token) {
      logger.warn('Tentative de soumission d\'avis sans authentification', {
        productId,
        ip: req.headers.get('x-forwarded-for') || 'unknown'
      });
      
      return NextResponse.json(
        { error: 'Vous devez Ãªtre connectÃ© pour laisser un avis' },
        { status: 401 }
      );
    }
    
    // 5. URL du backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    try {
      // 6. RÃ©cupÃ©rer les informations de l'utilisateur
      const userResponse = await fetch(`${backendUrl}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `JWT ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (userResponse.ok) {
        const userData = await userResponse.json();
        const userId = userData.user?.id;
        
        if (!userId) {
          throw new Error('ID utilisateur non trouvÃ© dans la rÃ©ponse');
        }
        
        const firstName = userData.user?.firstName || '';
        const lastName = userData.user?.lastName || '';
        
        // 7. Formater le nom d'affichage
        let userDisplayName = 'Utilisateur';
        if (firstName) {
          userDisplayName = firstName;
          if (lastName) {
            userDisplayName += ` ${lastName.charAt(0)}.`;
          }
        }
        
        // 8. CrÃ©er l'objet pour l'avis
        const reviewData = {
          product: productId,
          rating: parseInt(rating.toString()),
          reviewTitle: sanitizedData.reviewTitle || 'Avis',
          reviewContent: sanitizedReviewContent || " ", // Version sanitisÃ©e du contenu
          user: userId,
          isApproved: false, // Les avis nÃ©cessitent une modÃ©ration
          userDisplayName 
        };
        
        // 9. Soumettre l'avis au backend
        const reviewResponse = await fetch(`${backendUrl}/api/reviews`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `JWT ${token}`,
          },
          body: JSON.stringify(reviewData)
        });
        
        if (!reviewResponse.ok) {
          const errorData = await reviewResponse.json();
          throw new Error(`Erreur lors de la soumission de l'avis: ${reviewResponse.status} - ${JSON.stringify(errorData)}`);
        }
        
        const responseData = await reviewResponse.json();
        
        // 10. Journaliser le succÃ¨s
        logger.info('Avis utilisateur soumis avec succÃ¨s', {
          productId,
          userId,
          rating
        });
        
        // 11. Retourner une rÃ©ponse rÃ©ussie
        return NextResponse.json(responseData, { status: 201 });
      } else {
        throw new Error(`Ã‰chec de la rÃ©cupÃ©ration des donnÃ©es utilisateur: ${userResponse.status}`);
      }
    } catch (error) {
      logger.error('Erreur lors de la rÃ©cupÃ©ration/traitement des donnÃ©es utilisateur', { error });
      
      // FALLBACK: En cas d'Ã©chec, essayer une approche alternative
      try {
        // Extraire directement l'ID utilisateur Ã  partir du token
        const userInfo = await getBasicUserInfoFromToken(token, backendUrl);
        const userId = userInfo.id;
        const userName = userInfo.name || 'Utilisateur';
        
        // CrÃ©er l'objet pour l'avis
        const reviewData = {
          product: productId,
          rating: parseInt(rating.toString()),
          reviewTitle: sanitizedData.reviewTitle || 'Avis',
          reviewContent: sanitizedReviewContent || " ",
          user: userId,
          isApproved: false,
          userDisplayName: userName
        };
        
        // Soumettre l'avis
        const reviewResponse = await fetch(`${backendUrl}/api/reviews`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `JWT ${token}`,
          },
          body: JSON.stringify(reviewData)
        });
        
        if (!reviewResponse.ok) {
          const errorData = await reviewResponse.json();
          throw new Error(`Erreur lors de la soumission de l'avis: ${reviewResponse.status} - ${JSON.stringify(errorData)}`);
        }
        
        const responseData = await reviewResponse.json();
        
        logger.info('Avis utilisateur soumis avec succÃ¨s (fallback)', {
          productId,
          userId,
          rating
        });
        
        return NextResponse.json(responseData, { status: 201 });
      } catch (fallbackError) {
        logger.error('Ã‰chec de la mÃ©thode fallback', { error: fallbackError });
        throw error; // Remonter l'erreur originale
      }
    }
  } catch (error) {
    logger.error('Erreur lors de la soumission de l\'avis', { error });
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la soumission de l\'avis' },
      { status: 500 }
    );
  }
}

/**
 * Fonction utilitaire pour extraire des informations utilisateur basiques Ã  partir d'un token
 */
async function getBasicUserInfoFromToken(token: string, backendUrl: string): Promise<{ id: string, name?: string }> {
  // Essayer avec l'endpoint /api/auth/me
  const meResponse = await fetch(`${backendUrl}/api/auth/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `JWT ${token}`,
      'Cache-Control': 'no-cache'
    },
    cache: 'no-store'
  });
  
  if (meResponse.ok) {
    const meData = await meResponse.json();
    
    if (!meData?.user?.id) {
      throw new Error('ID utilisateur non trouvÃ©');
    }
    
    const firstName = meData.user.firstName || '';
    const lastName = meData.user.lastName || '';
    
    let userName = 'Utilisateur';
    if (firstName) {
      userName = firstName;
      if (lastName) {
        userName += ` ${lastName.charAt(0)}.`;
      }
    }
    
    return {
      id: meData.user.id,
      name: userName
    };
  }
  
  throw new Error('Impossible de rÃ©cupÃ©rer les informations utilisateur');
}

/**
 * Sanitiser une chaÃ®ne simple
 */
function sanitizeString(input: string): string {
  if (!input) return input;
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

