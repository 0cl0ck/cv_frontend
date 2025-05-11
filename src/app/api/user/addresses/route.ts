import { NextRequest, NextResponse } from 'next/server';
import { validateRequest, sanitizeObject } from '@/utils/validation/validator';
import { addressSchema, userAddressesSchema } from '@/utils/validation/address-schemas';
import { secureLogger as logger } from '@/utils/logger';

// Interface pour les adresses
interface Address {
  id: string;
  type: 'shipping' | 'billing' | 'both';
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

/**
 * GET - Récupérer toutes les adresses de l'utilisateur actuel
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Authentifier l'utilisateur
    const authResponse = await fetch('/api/auth/me', {
      headers: {
        'Cookie': request.headers.get('cookie') || ''
      }
    });

    if (!authResponse.ok) {
      logger.error('Authentification échouée lors de l\'accès aux adresses', {
        statusCode: authResponse.status,
        url: request.url
      });
      
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // 2. Extraire les données utilisateur et le token
    const userData = await authResponse.json();
    const userId = userData.user?.id;
    const token = userData.token;
    
    if (!userId || !token) {
      logger.error('Données utilisateur ou token manquants', { 
        hasUserId: Boolean(userId),
        hasToken: Boolean(token) 
      });
      
      return NextResponse.json(
        { error: 'Session invalide' },
        { status: 401 }
      );
    }

    // 3. Récupérer les adresses depuis le backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const apiResponse = await fetch(`${backendUrl}/api/customers/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    if (!apiResponse.ok) {
      const errorData = await apiResponse.json().catch(() => ({}));
      logger.error('Échec de récupération des adresses depuis le backend', { 
        status: apiResponse.status,
        error: errorData
      });
      
      return NextResponse.json(
        { error: 'Impossible de récupérer les adresses' },
        { status: apiResponse.status }
      );
    }

    // 4. Extraire et retourner uniquement les adresses 
    const customerData = await apiResponse.json();
    
    return NextResponse.json({
      addresses: customerData.addresses || []
    });
  } catch (error) {
    logger.error('Erreur lors de la récupération des adresses', { error });
    
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des adresses' },
      { status: 500 }
    );
  }
}

/**
 * POST - Ajouter une nouvelle adresse
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Valider l'entrée utilisateur
    const validation = await validateRequest(request, addressSchema, { verbose: true });
    
    if (!validation.success) {
      return validation.response;
    }
    
    // 2. Sanitiser les données validées
    const addressData = sanitizeObject(validation.data);
    
    // 3. Authentifier l'utilisateur et récupérer le token
    const authResponse = await fetch('/api/auth/me', {
      headers: {
        'Cookie': request.headers.get('cookie') || ''
      }
    });

    if (!authResponse.ok) {
      logger.error('Authentification échouée lors de l\'ajout d\'adresse', {
        statusCode: authResponse.status,
        url: request.url
      });
      
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // 4. Extraire les données utilisateur et le token
    const userData = await authResponse.json();
    const userId = userData.user?.id;
    const token = userData.token;
    
    if (!userId || !token) {
      logger.error('Données utilisateur ou token manquants', { 
        hasUserId: Boolean(userId),
        hasToken: Boolean(token) 
      });
      
      return NextResponse.json(
        { error: 'Session invalide' },
        { status: 401 }
      );
    }

    // 5. Récupérer les adresses existantes
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const userResponse = await fetch(`${backendUrl}/api/customers/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    if (!userResponse.ok) {
      const errorData = await userResponse.json().catch(() => ({}));
      logger.error('Échec de récupération des données utilisateur', { 
        status: userResponse.status,
        error: errorData
      });
      
      return NextResponse.json(
        { error: 'Impossible de récupérer les données utilisateur' },
        { status: userResponse.status }
      );
    }

    const customerData = await userResponse.json();
    const existingAddresses = customerData.addresses || [];
    
    // 6. Préparer la mise à jour des adresses
    let updatedAddresses = [...existingAddresses];
    
    // Si la nouvelle adresse est définie comme par défaut, mettre à jour les autres adresses
    if (addressData.isDefault) {
      updatedAddresses = updatedAddresses.map(addr => ({
        ...addr,
        isDefault: false
      }));
    }
    
    // Générer un ID unique pour l'adresse
    const newId = `addr_${Date.now()}`;
    updatedAddresses.push({ ...addressData, id: newId });
    
    // 7. Valider l'ensemble des adresses
    const addressesValidation = userAddressesSchema.safeParse({ addresses: updatedAddresses });
    if (!addressesValidation.success) {
      logger.error('Validation des adresses échouée', { 
        errors: addressesValidation.error.errors 
      });
      
      return NextResponse.json(
        { error: 'Format d\'adresse invalide', details: addressesValidation.error.errors },
        { status: 400 }
      );
    }
    
    // 8. Mettre à jour l'utilisateur avec la nouvelle liste d'adresses
    const updateResponse = await fetch(`${backendUrl}/api/customers/${userId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        addresses: updatedAddresses
      })
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json().catch(() => ({}));
      logger.error('Échec de mise à jour des adresses', { 
        status: updateResponse.status,
        error: errorData
      });
      
      return NextResponse.json(
        { error: 'Impossible de mettre à jour les adresses' },
        { status: updateResponse.status }
      );
    }

    // 9. Retourner la nouvelle adresse avec succès
    return NextResponse.json({
      success: true,
      address: { ...addressData, id: newId }
    }, { status: 201 });
  } catch (error) {
    logger.error('Erreur lors de l\'ajout d\'adresse', { error });
    
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de l\'ajout de l\'adresse' },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Mettre à jour une adresse existante
 */
export async function PATCH(request: NextRequest) {
  try {
    // 1. Valider l'entrée utilisateur
    const validation = await validateRequest(request, addressSchema, { verbose: true });
    
    if (!validation.success) {
      return validation.response;
    }
    
    // 2. Sanitiser les données validées
    const addressData = sanitizeObject(validation.data);
    
    // Vérifier que l'ID de l'adresse est fourni
    if (!addressData.id) {
      return NextResponse.json(
        { error: 'ID de l\'adresse manquant' },
        { status: 400 }
      );
    }
    
    // 3. Authentifier l'utilisateur et récupérer le token
    const authResponse = await fetch('/api/auth/me', {
      headers: {
        'Cookie': request.headers.get('cookie') || ''
      }
    });

    if (!authResponse.ok) {
      logger.error('Authentification échouée lors de la mise à jour d\'adresse', {
        statusCode: authResponse.status,
        url: request.url
      });
      
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // 4. Extraire les données utilisateur et le token
    const userData = await authResponse.json();
    const userId = userData.user?.id;
    const token = userData.token;
    
    if (!userId || !token) {
      logger.error('Données utilisateur ou token manquants', { 
        hasUserId: Boolean(userId),
        hasToken: Boolean(token) 
      });
      
      return NextResponse.json(
        { error: 'Session invalide' },
        { status: 401 }
      );
    }

    // 5. Récupérer les adresses existantes
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const userResponse = await fetch(`${backendUrl}/api/customers/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    if (!userResponse.ok) {
      const errorData = await userResponse.json().catch(() => ({}));
      logger.error('Échec de récupération des données utilisateur', { 
        status: userResponse.status,
        error: errorData
      });
      
      return NextResponse.json(
        { error: 'Impossible de récupérer les données utilisateur' },
        { status: userResponse.status }
      );
    }

    const customerData = await userResponse.json();
    const existingAddresses = customerData.addresses || [];
    
    // 6. Vérifier que l'adresse existe
    const addressIndex = existingAddresses.findIndex((addr: Address) => addr.id === addressData.id);
    if (addressIndex === -1) {
      logger.error('Adresse non trouvée', { addressId: addressData.id });
      
      return NextResponse.json(
        { error: 'Adresse non trouvée' },
        { status: 404 }
      );
    }
    
    // 7. Préparer la mise à jour des adresses
    let updatedAddresses = [...existingAddresses];
    
    // Si l'adresse mise à jour est définie comme par défaut, mettre à jour les autres adresses
    if (addressData.isDefault) {
      updatedAddresses = updatedAddresses.map((addr: Address) => ({
        ...addr,
        isDefault: addr.id === addressData.id ? true : false
      }));
    } else {
      // Mettre à jour uniquement l'adresse spécifiée
      updatedAddresses[addressIndex] = {
        ...updatedAddresses[addressIndex],
        ...addressData
      };
    }
    
    // 8. Valider l'ensemble des adresses
    const addressesValidation = userAddressesSchema.safeParse({ addresses: updatedAddresses });
    if (!addressesValidation.success) {
      logger.error('Validation des adresses échouée', { 
        errors: addressesValidation.error.errors 
      });
      
      return NextResponse.json(
        { error: 'Format d\'adresse invalide', details: addressesValidation.error.errors },
        { status: 400 }
      );
    }
    
    // 9. Mettre à jour l'utilisateur avec la nouvelle liste d'adresses
    const updateResponse = await fetch(`${backendUrl}/api/customers/${userId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        addresses: updatedAddresses
      })
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json().catch(() => ({}));
      logger.error('Échec de mise à jour des adresses', { 
        status: updateResponse.status,
        error: errorData
      });
      
      return NextResponse.json(
        { error: 'Impossible de mettre à jour les adresses' },
        { status: updateResponse.status }
      );
    }

    // 10. Retourner l'adresse mise à jour avec succès
    return NextResponse.json({
      success: true,
      address: updatedAddresses[addressIndex]
    });
  } catch (error) {
    logger.error('Erreur lors de la mise à jour d\'adresse', { error });
    
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour de l\'adresse' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Supprimer une adresse existante
 */
export async function DELETE(request: NextRequest) {
  try {
    // 1. Récupérer l'ID de l'adresse à supprimer
    const url = new URL(request.url);
    const addressId = url.searchParams.get('id');
    
    if (!addressId) {
      return NextResponse.json(
        { error: 'ID de l\'adresse manquant' },
        { status: 400 }
      );
    }
    
    // 2. Authentifier l'utilisateur et récupérer le token
    const authResponse = await fetch('/api/auth/me', {
      headers: {
        'Cookie': request.headers.get('cookie') || ''
      }
    });

    if (!authResponse.ok) {
      logger.error('Authentification échouée lors de la suppression d\'adresse', {
        statusCode: authResponse.status,
        url: request.url
      });
      
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // 3. Extraire les données utilisateur et le token
    const userData = await authResponse.json();
    const userId = userData.user?.id;
    const token = userData.token;
    
    if (!userId || !token) {
      logger.error('Données utilisateur ou token manquants', { 
        hasUserId: Boolean(userId),
        hasToken: Boolean(token) 
      });
      
      return NextResponse.json(
        { error: 'Session invalide' },
        { status: 401 }
      );
    }

    // 4. Récupérer les adresses existantes
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const userResponse = await fetch(`${backendUrl}/api/customers/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    if (!userResponse.ok) {
      const errorData = await userResponse.json().catch(() => ({}));
      logger.error('Échec de récupération des données utilisateur', { 
        status: userResponse.status,
        error: errorData
      });
      
      return NextResponse.json(
        { error: 'Impossible de récupérer les données utilisateur' },
        { status: userResponse.status }
      );
    }

    const customerData = await userResponse.json();
    const existingAddresses = customerData.addresses || [];
    
    // 5. Vérifier que l'adresse existe
    const addressIndex = existingAddresses.findIndex((addr: Address) => addr.id === addressId);
    if (addressIndex === -1) {
      logger.error('Adresse non trouvée', { addressId });
      
      return NextResponse.json(
        { error: 'Adresse non trouvée' },
        { status: 404 }
      );
    }
    
    // 6. Supprimer l'adresse
    const addressToDelete = existingAddresses[addressIndex];
    const updatedAddresses = existingAddresses.filter((addr: Address) => addr.id !== addressId);
    
    // 7. Si l'adresse supprimée était l'adresse par défaut, définir une nouvelle adresse par défaut
    if (addressToDelete.isDefault && updatedAddresses.length > 0) {
      updatedAddresses[0].isDefault = true;
    }
    
    // 8. Mettre à jour l'utilisateur avec la nouvelle liste d'adresses
    const updateResponse = await fetch(`${backendUrl}/api/customers/${userId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        addresses: updatedAddresses
      })
    });

    if (!updateResponse.ok) {
      const errorData = await updateResponse.json().catch(() => ({}));
      logger.error('Échec de mise à jour des adresses', { 
        status: updateResponse.status,
        error: errorData
      });
      
      return NextResponse.json(
        { error: 'Impossible de supprimer l\'adresse' },
        { status: updateResponse.status }
      );
    }

    // 9. Retourner succès
    return NextResponse.json({
      success: true,
      message: 'Adresse supprimée avec succès'
    });
  } catch (error) {
    logger.error('Erreur lors de la suppression d\'adresse', { error });
    
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la suppression de l\'adresse' },
      { status: 500 }
    );
  }
}
