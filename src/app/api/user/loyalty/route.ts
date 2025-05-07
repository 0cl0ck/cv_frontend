import { NextRequest, NextResponse } from 'next/server';
import { determineReward } from '@/lib/loyalty';

// La fonction determineReward est maintenant importée depuis @/lib/loyalty

export async function GET(request: NextRequest) {
  try {
    // Récupérer le token d'authentification depuis la requête
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { message: 'Token d\'authentification manquant' },
        { status: 401 }
      );
    }

    // Appeler l'API backend pour obtenir les commandes de l'utilisateur
    
    console.info('Récupération des commandes pour le programme de fidélité');
    // Utiliser une URL absolue pour éviter les problèmes de parsing
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://www.chanvre-vert.fr';
    const ordersResponse = await fetch(`${apiBaseUrl}/api/orders/me`, {
      headers: {
        'Authorization': authHeader
      }
    });

    if (!ordersResponse.ok) {
      console.error(`Erreur lors de la récupération des commandes: ${ordersResponse.status}`);
      return NextResponse.json(
        { message: 'Erreur lors de la récupération des commandes' },
        { status: ordersResponse.status }
      );
    }

    const ordersData = await ordersResponse.json();
    
    // Compter les commandes complétées (livrées ou expédiées)
    const ordersCount = Array.isArray(ordersData.orders) 
      ? ordersData.orders.filter((order: { status: string }) => 
          order.status === 'delivered' || order.status === 'shipped'
        ).length 
      : 0;
    
    console.info(`Nombre de commandes validées: ${ordersCount}`);

    // Récupérer l'utilisateur pour voir si une récompense est déjà réclamée
    // Utiliser api/customers/me plutôt que api/users/me qui n'existe pas
    console.info('Récupération des informations utilisateur pour le programme de fidélité');
    
    let userResponse;
    try {
      userResponse = await fetch(`${apiBaseUrl}/api/customers/me`, {
        headers: {
          'Authorization': authHeader
        }
      });

      if (!userResponse.ok) {
        console.error(`Erreur lors de la récupération des informations utilisateur: ${userResponse.status}`);
        // Tenter de récupérer les détails de l'erreur
        const errorDetails = await userResponse.text();
        console.error('Détails de l\'erreur:', errorDetails);
        
        return NextResponse.json(
          { message: 'Erreur lors de la récupération des informations utilisateur' },
          { status: userResponse.status }
        );
      }
    } catch (fetchError) {
      console.error('Exception lors de la récupération des informations utilisateur:', fetchError);
      return NextResponse.json(
        { message: 'Erreur de connexion lors de la récupération des informations utilisateur' },
        { status: 500 }
      );
    }

    let userData;
    try {
      userData = await userResponse.json();
      console.info('Données utilisateur récupérées avec succès');
    } catch (jsonError) {
      console.error('Erreur de parsing JSON des données utilisateur:', jsonError);
      return NextResponse.json(
        { message: 'Format de données utilisateur invalide' },
        { status: 500 }
      );
    }
    
    if (!userData || typeof userData !== 'object') {
      console.error('Les données utilisateur ne sont pas dans un format valide:', userData);
      return NextResponse.json(
        { message: 'Format de données utilisateur invalide' },
        { status: 500 }
      );
    }
    
    const currentLoyalty = userData.loyalty || {};
    console.info('Programme de fidélité actuel:', currentLoyalty);
    
    // Déterminer la récompense actuelle
    const calculatedReward = determineReward(ordersCount);
    console.info('Récompense calculée:', calculatedReward);
    
    // Si l'utilisateur a déjà une récompense réclamée, conserver cette information
    if (currentLoyalty.currentReward && 
        typeof currentLoyalty.currentReward === 'object' && 
        calculatedReward.type === currentLoyalty.currentReward.type) {
      calculatedReward.claimed = Boolean(currentLoyalty.currentReward.claimed);
    }

    // Construire l'objet de fidélité
    const loyaltyInfo = {
      ordersCount,
      currentReward: calculatedReward,
      referralEnabled: ordersCount >= 2
    };
    console.info('Nouvel objet de fidélité construit:', loyaltyInfo);

    // Vérifier que l'ID utilisateur existe
    if (!userData.id) {
      console.error('ID utilisateur manquant dans les données utilisateur');
      return NextResponse.json(
        { 
          success: true,
          loyalty: loyaltyInfo,
          warning: 'Mise à jour du profil impossible: ID utilisateur manquant'
        }
      );
    }

    // Sauvegarder les infos de fidélité dans le profil utilisateur si elles ont changé
    try {
      if (JSON.stringify(currentLoyalty) !== JSON.stringify(loyaltyInfo)) {
        console.info(`Mise à jour des informations de fidélité pour l'utilisateur ${userData.id}`);
        const updateResponse = await fetch(`${apiBaseUrl}/api/customers/${userData.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authHeader
          },
          body: JSON.stringify({
            loyalty: loyaltyInfo
          })
        });
        
        if (!updateResponse.ok) {
          console.warn(`Erreur lors de la mise à jour du profil utilisateur: ${updateResponse.status}`);
          const errorDetails = await updateResponse.text();
          console.warn('Détails de l\'erreur de mise à jour:', errorDetails);
        } else {
          console.info('Mise à jour des informations de fidélité réussie');
        }
      } else {
        console.info('Aucune mise à jour nécessaire, les infos de fidélité sont identiques');
      }
    } catch (updateError) {
      console.error('Exception lors de la mise à jour du profil:', updateError);
      // On continue malgré l'erreur de mise à jour pour renvoyer les infos de fidélité
    }

    return NextResponse.json({
      success: true,
      loyalty: loyaltyInfo
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des informations de fidélité:', error);
    return NextResponse.json(
      { message: 'Une erreur est survenue lors de la récupération des informations de fidélité' },
      { status: 500 }
    );
  }
}
