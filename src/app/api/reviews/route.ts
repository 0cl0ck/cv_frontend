import { NextResponse, NextRequest } from 'next/server';
import { withApiAuth } from '@/lib/api-auth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    
    if (!productId) {
      return NextResponse.json(
        { error: 'L\'identifiant du produit est requis' },
        { status: 400 }
      );
    }

    // Utiliser l'URL du backend configurée
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    // Construire les paramètres de requête pour filtrer les avis
    const queryParams = new URLSearchParams();
    queryParams.append('where[product][equals]', productId);
    queryParams.append('where[isApproved][equals]', 'true');
    queryParams.append('sort', '-createdAt');
    queryParams.append('limit', '100');
    queryParams.append('depth', '2'); // Essayer avec une profondeur plus élevée pour les relations
    
    // Récupérer les avis approuvés pour ce produit
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
    
    // Définir un type pour les avis
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

    // Fonction pour récupérer les informations utilisateur d'un avis
    const fetchUserInfo = async (userId: string) => {
      try {
        console.log('Récupération des informations pour l\'utilisateur:', userId);
        
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
          console.error(`Erreur lors de la récupération des détails utilisateur: ${userResponse.status}`);
          return null;
        }
        
        const userInfo = await userResponse.json();
        console.log('Information utilisateur reçue:', JSON.stringify(userInfo, null, 2));
        return userInfo;
      } catch (error) {
        console.error('Erreur lors de la récupération des détails utilisateur:', error);
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
    
    // Récupérer les informations utilisateur pour tous les avis
    const userInfoMap = new Map();
    await Promise.all(
      [...userIds].map(async (userId) => {
        const userInfo = await fetchUserInfo(userId);
        if (userInfo) {
          userInfoMap.set(userId, userInfo);
        }
      })
    );
    
    console.log('Informations utilisateur récupérées pour', userInfoMap.size, 'utilisateurs');
    
    // Conversion des données brutes en objet ReviewData typable
    const processedReviews = data.docs.map((review: Record<string, unknown>) => {
      // Log détaillé pour comprendre la structure des données reçues
      console.log(`Avis ID ${review.id}, userDisplayName=${review.userDisplayName}, user=${typeof review.user === 'string' ? review.user : 'objet'}`);
      
      // Si l'utilisateur est un ID (string), gérer ce cas
      let userInfo = null;
      if (typeof review.user === 'string') {
        // Stocker l'ID pour une référence future
        userInfo = { id: review.user };
      } else if (review.user) {
        // Garder les informations utilisateur disponibles
        userInfo = review.user;
      }
      
      // Éviter d'écraser userDisplayName s'il existe déjà dans la base de données
      // C'est la clef pour préserver le format du nom entre le backend et le frontend
      return {
        ...review,
        user: userInfo || { id: 'anonymous' }
      };
    });

    // Après avoir récupéré les avis approuvés, vérifier si l'utilisateur est connecté
    // et récupérer également ses avis non approuvés
    try {
      const token = req.cookies.get('payload-token')?.value;
      if (token) {
        // Décoder le token JWT pour obtenir l'ID de l'utilisateur sans faire d'appel API
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
        const userId = payload.id;
        
        // 1. Récupérer les infos de l'utilisateur connecté
        let userFirstName = '';
        let userLastName = '';

        try {
          // Récupérer les données complètes de l'utilisateur pour avoir son nom et prénom
          console.log(`Tentative de récupération des infos utilisateur: ${userId}`);
          const userDataResponse = await fetch(`${backendUrl}/api/customers/${userId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `JWT ${token}`,
              'Cache-Control': 'no-cache'
            },
            cache: 'no-store'
          });
          
          console.log(`Statut réponse données utilisateur: ${userDataResponse.status}`);
          
          if (userDataResponse.ok) {
            const userData = await userDataResponse.json();
            userFirstName = userData.firstName || '';
            userLastName = userData.lastName || '';
            console.log(`Infos utilisateur récupérées: ${userFirstName} ${userLastName}`);
          } else {
            console.log('Impossible de récupérer les informations utilisateur');
          }
        } catch (userError) {
          console.error('Erreur lors de la récupération des infos utilisateur:', userError);
        }
        
        if (userId) {
          // 2. Récupérer les avis non approuvés de cet utilisateur pour ce produit
          const userReviewsParams = new URLSearchParams();
          userReviewsParams.append('where[product][equals]', productId);
          userReviewsParams.append('where[user][equals]', userId);
          userReviewsParams.append('where[isApproved][equals]', 'false');
          userReviewsParams.append('depth', '2');
          
          const userReviewsResponse = await fetch(`${backendUrl}/api/reviews?${userReviewsParams.toString()}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `JWT ${token}`,
            },
            cache: 'no-store',
          });
          
          if (userReviewsResponse.ok) {
            const userReviewsData = await userReviewsResponse.json();
            // 3. Fusionner les avis approuvés avec les avis non approuvés de l'utilisateur
            if (userReviewsData && userReviewsData.docs) {
              // 4. Traiter les avis non approuvés de l'utilisateur
              const processedUserReviews = userReviewsData.docs.map((review: ReviewData) => {
                console.log('Traitement de l\'avis non approuvé:', review.id, 'userDisplayName actuel:', review.userDisplayName);
                // Toujours marquer les avis non approuvés de l'utilisateur connecté comme "Vous"
                return {
                  ...review,
                  userDisplayName: 'Vous'
                };
              });
              
              // 5. Ajouter les avis traités aux avis existants
              data.docs = [...data.docs, ...processedUserReviews];
            }
          }

          // 6. IMPORTANT: Vérifier également tous les avis existants et marquer ceux de l'utilisateur connecté comme "Vous"
          if (data.docs && data.docs.length > 0) {
            // Parcourir tous les avis et détecter ceux de l'utilisateur connecté
            data.docs = data.docs.map((review: ReviewData) => {
              // Si l'avis appartient à l'utilisateur connecté
              if (typeof review.user === 'string' && review.user === userId) {
                console.log(`Marquer l'avis ${review.id} comme étant de l'utilisateur connecté`);
                // Le marquer comme "Vous"
                return {
                  ...review,
                  userDisplayName: 'Vous'
                };
              }
              return review;
            });
          }
        }
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des avis utilisateur:', err);
      // On continue avec les avis approuvés seulement
    }
    
    // Récupérer les statistiques d'avis depuis l'API du produit
    let reviewStats = {
      averageRating: 0,
      totalReviews: 0,
      distribution: {
        '1': 0,
        '2': 0,
        '3': 0,
        '4': 0,
        '5': 0
      }
    };
    
    try {
      const productResponse = await fetch(`${backendUrl}/api/products/${productId}?depth=1`);
      
      if (productResponse.ok) {
        const productData = await productResponse.json();
        if (productData.reviewStats) {
          reviewStats = productData.reviewStats;
        }
      }
    } catch (err) {
      console.error('Erreur lors de la récupération des statistiques du produit:', err);
      // Continuer avec les statistiques par défaut
    }
    
    // Retourner les avis traités et les statistiques
    return NextResponse.json({
      reviews: processedReviews,
      stats: reviewStats
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des avis:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des avis' },
      { status: 500 }
    );
  }
}

// POST sécurisé avec authentification JWT
export const POST = withApiAuth(async (req: NextRequest) => {
  try {
    // Récupérer le token d'authentification
    const token = req.cookies.get('payload-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Vous devez être connecté pour soumettre un avis' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { productId, rating, reviewContent } = body;

    if (!productId || rating === undefined) {
      return NextResponse.json(
        { error: 'L\'identifiant du produit et la note sont requis' },
        { status: 400 }
      );
    }

    // Utiliser l'URL du backend configurée
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    // Extraire les informations de l'utilisateur du token
    let userId;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(Buffer.from(base64, 'base64').toString('utf-8'));
      userId = payload.id;
    } catch (error) {
      console.error('Erreur lors du décodage du token:', error);
      return NextResponse.json(
        { error: 'Problème d\'authentification. Veuillez vous reconnecter.' },
        { status: 401 }
      );
    }

    // Vérifier si l'utilisateur a déjà soumis un avis pour ce produit
    try {
      const existingReviewResponse = await fetch(
        `${backendUrl}/api/reviews?where%5Bproduct%5D%5Bequals%5D=${productId}&where%5Buser%5D%5Bequals%5D=${userId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `JWT ${token}`,
          }
        }
      );
      
      if (existingReviewResponse.ok) {
        const existingReviews = await existingReviewResponse.json();
        
        if (existingReviews.docs && existingReviews.docs.length > 0) {
          return NextResponse.json(
            { error: 'Vous avez déjà soumis un avis pour ce produit' },
            { status: 400 }
          );
        }
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des avis existants:', error);
      // Continuer malgré l'erreur - au pire, l'utilisateur pourra soumettre plusieurs avis
    }
    
    // RÉCUPÉRATION DES INFORMATIONS UTILISATEUR - SOLUTION DIRECTE
    try {
      console.log('Début de la récupération des données utilisateur pour le userDisplayName');
      
      // 1. Appeler directement l'API REST du backend pour une requête authentifiée
      // IMPORTANT: PayloadCMS attend "JWT" et non "Bearer" pour le format d'authentification
      const userResponse = await fetch(`${backendUrl}/api/customers/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `JWT ${token}`
        },
        cache: 'no-store'
      });
      
      console.log(`Tentative de récupération utilisateur ${userId}: statut ${userResponse.status}`);

      if (userResponse.ok) {
        // 2. Récupérer les données d'utilisateur de la réponse
        const userData = await userResponse.json();
        console.log('Données utilisateur complètes:', JSON.stringify(userData, null, 2));
        
        // 3. Extraire directement le nom et prénom
        const firstName = userData.firstName || '';
        const lastName = userData.lastName || '';
        
        // 4. Formater le nom d'affichage
        let userDisplayName = 'Vous'; // Valeur par défaut
        
        if (firstName && firstName.trim() !== '') {
          // Formater selon le format demandé: Prénom + Initiale du nom
          userDisplayName = firstName;
          if (lastName && lastName.trim() !== '') {
            userDisplayName += ` ${lastName.charAt(0)}.`;
          }
        }
        
        // 5. Préparer et soumettre l'avis avec le bon nom d'affichage
        const reviewData = {
          product: productId,
          rating: parseInt(rating.toString()),
          reviewTitle: 'Avis', // Titre par défaut pour tous les avis
          reviewContent: reviewContent || " ", // Mettre un espace si vide (le backend exige une valeur)
          user: userId,
          isApproved: false, // Par défaut, les avis doivent être approuvés par un administrateur
          userDisplayName: userDisplayName // Ajouter le nom d'affichage formaté
        };
        
        console.log('Données de l\'avis à soumettre:', reviewData);
        
        // 6. Soumettre l'avis au backend
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
        
        // Ajouter les infos utilisateur pour le log
        const responseWithUserInfo = {
          ...responseData,
          user: {
            id: userId,
            firstName: firstName,
            lastName: lastName
          }
        };
        
        console.log('Review avec infos utilisateur:', responseWithUserInfo);
        
        // Retourner une réponse réussie
        return NextResponse.json(responseData, { status: 201 });
      } else {
        throw new Error(`Échec de la récupération des données utilisateur: ${userResponse.status}`);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération/traitement des données utilisateur:', error);
      
      // FALLBACK: En cas d'échec de récupération des données utilisateur,
      // tenter une autre approche pour récupérer les informations utilisateur
      console.log('Tentative alternative de récupération des données utilisateur...');
      let userName = 'Vous';
      
      try {
        // Essayer avec l'endpoint /api/auth/me qui est souvent plus permissif
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
          console.log('Données récupérées via /api/auth/me:', JSON.stringify(meData, null, 2));
          
          // Extraire les informations utilisateur si disponibles
          if (meData && meData.user) {
            const firstName = meData.user.firstName || '';
            const lastName = meData.user.lastName || '';
            
            if (firstName && firstName.trim() !== '') {
              userName = firstName;
              if (lastName && lastName.trim() !== '') {
                userName += ` ${lastName.charAt(0)}.`;
              }
            }
          }
        }
      } catch (fallbackError) {
        console.error('Erreur lors de la tentative alternative:', fallbackError);
      }
      
      console.log(`Nom d'utilisateur déterminé pour l'avis: ${userName}`);
      
      const reviewData = {
        product: productId,
        rating: parseInt(rating.toString()),
        reviewTitle: 'Avis',
        reviewContent: reviewContent || " ", // Fournir un espace si vide pour satisfaire la validation
        user: userId,
        isApproved: false,
        userDisplayName: userName // Utiliser le nom récupéré ou 'Vous' comme fallback
      };
      
      console.log('Données de l\'avis à soumettre (fallback):', reviewData);
      
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
      return NextResponse.json(responseData, { status: 201 });
    }
  } catch (error) {
    console.error('Erreur lors de la soumission de l\'avis:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la soumission de l\'avis' },
      { status: 500 }
    );
  }
}, { roles: ['customers'] });
