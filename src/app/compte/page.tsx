'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Package, MapPin, ShoppingCart, MessageCircle, Edit2, ChevronRight, X, Save, Loader2, Award, Gift, Truck, LogOut } from 'lucide-react';
import { LoyaltyReward } from '@/types/loyalty';

// Type pour les informations de l'utilisateur
type UserInfo = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  loyalty?: {
    ordersCount: number;
    currentReward: LoyaltyReward;
    referralEnabled: boolean;
  };
};

// Fonction pour formater la date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date);
};

// Page de tableau de bord client
export default function DashboardPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<{firstName: string; lastName: string; email: string}>({firstName: '', lastName: '', email: ''});
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updatedFields, setUpdatedFields] = useState<string[]>([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [orders, setOrders] = useState([]);
  const [loyaltyLoading, setLoyaltyLoading] = useState(true);
  const [loyaltyError, setLoyaltyError] = useState<string | null>(null);
  const router = useRouter();

  // Vérifier si l'utilisateur est connecté et récupérer les informations de l'utilisateur
  const openEditModal = () => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      });
      setUpdateError(null);
      setUpdateSuccess(false);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const updateUserInfo = async (e: FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(false);
    
    try {
      // Récupérer le token d'authentification
      const cookies = document.cookie.split(';');
      const authCookie = cookies.find(cookie => cookie.trim().startsWith('payload-token='));
      
      if (!authCookie || !user) {
        setUpdateError('Session expirée. Veuillez vous reconnecter.');
        setIsUpdating(false);
        return;
      }
      
      const token = authCookie.split('=')[1]?.trim();
      
      // Sauvegarder les anciennes valeurs pour la comparaison
      const oldValues = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      };
      
      // Préparer les nouvelles données
      const newUserData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email
      };
      
      // Mettre à jour immédiatement les données dans l'UI
      // Cela garantit que nous voyons les changements avant la confirmation du serveur
      setUser(prev => prev ? {
        ...prev,
        ...newUserData
      } : null);
      
      // Identifier les champs qui ont été modifiés
      const changedFields: string[] = [];
      if (formData.firstName !== oldValues.firstName) changedFields.push('firstName');
      if (formData.lastName !== oldValues.lastName) changedFields.push('lastName');
      if (formData.email !== oldValues.email) changedFields.push('email');
      
      // Marquer les champs mis à jour pour l'animation
      setUpdatedFields(changedFields);
      
      // Utiliser l'API route du frontend pour éviter les problèmes CORS
      const response = await fetch('/api/user/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user.id,
          ...newUserData
        })
      });
      
      const responseData = await response.json();
      
      if (response.ok) {
        // Tout va bien, nous avons déjà mis à jour l'UI
        console.log('Données utilisateur mises à jour avec succès:', responseData);
        
        setUpdateSuccess(true);
        // Fermer la modale après un court délai
        setTimeout(() => {
          setIsModalOpen(false);
          // Réinitialiser les champs mis en évidence après un délai
          setTimeout(() => {
            setUpdatedFields([]);
          }, 3000);
        }, 1500);
      } else {
        // En cas d'erreur, revenir aux valeurs précédentes
        setUser(prev => prev ? {
          ...prev,
          ...oldValues
        } : null);
        
        setUpdatedFields([]);
        const errorMessage = responseData.message || 'Une erreur est survenue lors de la mise à jour';
        setUpdateError(errorMessage);
        console.error('Erreur API:', errorMessage);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      setUpdateError('Une erreur est survenue lors de la mise à jour de vos informations');
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    async function fetchUserData() {
      try {
        setLoyaltyLoading(true);
        // 1. D'abord vérifier si le cookie d'authentification existe
        const cookies = document.cookie.split(';');
        const authCookie = cookies.find(cookie => cookie.trim().startsWith('payload-token='));
        
        if (!authCookie) {
          console.log('Aucun cookie d\'authentification trouvé');
          router.push('/connexion');
          return;
        }
        
        // 2. Extraire le token JWT du cookie
        const token = authCookie.split('=')[1]?.trim();
        
        // 3. Décoder le payload JWT (sans vérification de signature)
        // Cette étape est utilisée pour récupérer l'ID et l'email en cas d'échec de l'API
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
          console.error('Format de token JWT invalide');
          router.push('/connexion');
          return;
        }
        
        // Décoder le payload (deuxième partie du token)
        const payloadBase64 = tokenParts[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        
        // 4. Tenter de récupérer les vraies données utilisateur depuis le backend
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const backendResponse = await fetch(`${backendUrl}/api/customers/${decodedPayload.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        
        let userData = null;
        
        if (backendResponse.ok) {
          // Si l'appel au backend réussit, utiliser les données complètes
          const backendData = await backendResponse.json();
          userData = {
            id: backendData.id,
            email: backendData.email,
            firstName: backendData.firstName,
            lastName: backendData.lastName,
            createdAt: backendData.createdAt,
            // Récupérer les données de fidélité déjà présentes (le cas échéant)
            loyalty: backendData.loyalty || undefined
          };
          setUser(userData);
        } else {
          // Fallback: utiliser les données minimales du token
          console.warn('Impossible de récupérer les données complètes du backend, utilisation des données décodées du token');
          userData = {
            id: decodedPayload.id,
            email: decodedPayload.email,
            firstName: 'Utilisateur',
            lastName: 'Connecté',
            createdAt: new Date().toISOString()
          };
          setUser(userData);
        }
        
        // 5. Comme l'API dédiée au programme de fidélité rencontre des problèmes, utiliser directement les données des commandes
        try {
          // Récupérer les données de commandes directement
          const ordersResponse = await fetch(`/api/orders/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (ordersResponse.ok) {
            const ordersData = await ordersResponse.json();
            
            // Compter les commandes complétées (livrées ou expédiées)
            const completedOrders = Array.isArray(ordersData.orders) 
              ? ordersData.orders.filter((order: { status: string }) => 
                  order.status === 'delivered' || order.status === 'shipped'
                )
              : [];
            
            // Stocker les commandes pour l'historique si nécessaire
            setOrders(ordersData.orders || []);
            
            // Calculer le nombre de commandes validées
            const ordersCount = completedOrders.length;
            console.log(`Nombre de commandes validées: ${ordersCount}`);
            
            // Importer la fonction qui détermine la récompense
            const { determineReward } = await import('@/lib/loyalty');
            
            // Générer les données de fidélité
            const loyaltyInfo = {
              ordersCount,
              currentReward: determineReward(ordersCount),
              referralEnabled: ordersCount >= 2
            };
            
            // Mettre à jour l'utilisateur avec les données de fidélité
            const updatedUserData = { ...userData, loyalty: loyaltyInfo };
            setUser(updatedUserData);
          } else {
            console.error('Erreur lors de la récupération des commandes:', ordersResponse.status);
            setLoyaltyError('Impossible de charger vos commandes');
          }
          setLoyaltyLoading(false);
        } catch (loyaltyErr) {
          console.error('Erreur lors de la récupération des informations de fidélité:', loyaltyErr);
          setLoyaltyError('Impossible de charger votre programme de fidélité');
          setLoyaltyLoading(false);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setLoading(false);
        router.push('/connexion');
        return;
      } finally {
        setLoading(false);
        setLoyaltyLoading(false);
      }
    }

    fetchUserData();
  }, [router]);

  // Fonction de déconnexion sécurisée utilisant l'API dédiée
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      // Utiliser l'API sécurisée de déconnexion
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        // Inclure les cookies dans la requête pour l'authentification
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
      
      // Rediriger vers la page d'accueil
      router.push('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      setIsLoggingOut(false);
      
      // Fallback en cas d'échec de l'API: supprimer manuellement le cookie
      document.cookie = 'payload-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      router.push('/');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#00424A]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00AB55] mx-auto"></div>
          <p className="mt-4 text-[#D1D5DB]">Chargement de votre tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#00424A]">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-400 mb-4">Erreur d&apos;authentification</div>
          <p className="text-white mb-6">Vous devez être connecté pour accéder à cette page.</p>
          <Link href="/connexion" className="px-4 py-2 bg-[#10B981] text-[#D1D5DB] rounded hover:bg-[#059669] transition-colors">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#00424A] min-h-screen py-10">
      <div className="container mx-auto px-4 space-y-8 max-w-7xl">
        {/* Header - Bienvenue */}
        <div className="bg-[#002B33] rounded-lg p-6 shadow-md">
          <h1 className="text-3xl font-bold mb-2 text-white">Bienvenue, {user.firstName} !</h1>
          <p className="text-white/80">Votre espace personnel pour gérer vos commandes et vos informations</p>
        </div>
        
        {/* Sections principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Informations personnelles */}
          <div className="md:col-span-1">
            <div className="bg-[#002B33] rounded-lg p-6 h-full shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-[#D1D5DB]">Informations personnelles</h2>
                <button onClick={openEditModal} className="text-[#10B981] hover:text-[#059669]">
                  <Edit2 size={18} />
                </button>
              </div>
              
              <ul className="space-y-4 text-[#D1D5DB]">
                <li className="flex justify-between">
                  <span className="text-[#BEC3CA]">Nom</span>
                  <span className={updatedFields.includes('lastName') ? 'text-[#10B981] font-medium animate-pulse' : ''}>{user.lastName}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-[#BEC3CA]">Prénom</span>
                  <span className={updatedFields.includes('firstName') ? 'text-[#10B981] font-medium animate-pulse' : ''}>{user.firstName}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-[#BEC3CA]">E-mail</span>
                  <span className={`text-sm truncate max-w-[200px] ${updatedFields.includes('email') ? 'text-[#10B981] font-medium animate-pulse' : ''}`}>{user.email}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-[#BEC3CA]">Membre depuis</span>
                  <span>{formatDate(user.createdAt)}</span>
                </li>
              </ul>
              
              <div className="mt-6">
                <button onClick={openEditModal} 
                  className="text-sm font-medium text-[#D1D5DB] bg-[#007A72] hover:bg-[#059669] rounded-md px-4 py-2 inline-flex items-center justify-center w-full transition-colors">
                  Modifier mes informations
                </button>
              </div>
            </div>
          </div>
          
          {/* Actions rapides */}
          <div className="md:col-span-2">
            <div className="bg-[#002B33] rounded-lg p-6 shadow-md">
              <h2 className="text-xl font-semibold mb-6 text-[#D1D5DB]">Actions rapides</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/compte/commandes" 
                  className="bg-[#00424c] hover:bg-[#005866] rounded-lg p-4 shadow-sm flex items-start transition-colors group">
                  <div className="mr-4 p-2 bg-[#002B33] rounded-md">
                    <Package size={24} className="text-[#10B981]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-[#D1D5DB]">Mes commandes</h3>
                      <ChevronRight size={16} className="text-[#10B981] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-sm text-[#BEC3CA] mt-1">Consultez l&apos;historique de vos commandes</p>
                  </div>
                </Link>
                
                <Link href="/compte/adresses" 
                  className="bg-[#00424c] hover:bg-[#005866] rounded-lg p-4 shadow-sm flex items-start transition-colors group">
                  <div className="mr-4 p-2 bg-[#002B33] rounded-md">
                    <MapPin size={24} className="text-[#10B981]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-[#D1D5DB]">Mes adresses</h3>
                      <ChevronRight size={16} className="text-[#10B981] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-sm text-[#BEC3CA] mt-1">Gérez vos adresses de livraison</p>
                  </div>
                </Link>
                
                <Link href="/panier" 
                  className="bg-[#00424c] hover:bg-[#005866] rounded-lg p-4 shadow-sm flex items-start transition-colors group">
                  <div className="mr-4 p-2 bg-[#002B33] rounded-md">
                    <ShoppingCart size={24} className="text-[#10B981]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-[#D1D5DB]">Mon panier</h3>
                      <ChevronRight size={16} className="text-[#10B981] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-sm text-[#BEC3CA] mt-1">Accédez à votre panier</p>
                  </div>
                </Link>
                
                <Link href="/contact" 
                  className="bg-[#00424c] hover:bg-[#005866] rounded-lg p-4 shadow-sm flex items-start transition-colors group">
                  <div className="mr-4 p-2 bg-[#002B33] rounded-md">
                    <MessageCircle size={24} className="text-[#10B981]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-[#D1D5DB]">Besoin d&apos;aide ?</h3>
                      <ChevronRight size={16} className="text-[#10B981] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-sm text-[#BEC3CA] mt-1">Contactez notre service client</p>
                  </div>
                </Link>

              </div>
            </div>
          </div>
        </div>
        
        {/* Section Programme de fidélité */}
        <div className="bg-[#002B33] rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-6 flex items-center text-[#D1D5DB]">
            <Award className="text-[#10B981] mr-2" size={24} />
            Programme Fidélité
          </h2>
          
          {loyaltyLoading ? (
            <div className="text-center py-8">
              <Loader2 className="animate-spin h-8 w-8 text-[#10B981] mx-auto" />
              <p className="text-[#BEC3CA] mt-2">Chargement de votre programme de fidélité...</p>
            </div>
          ) : loyaltyError ? (
            <div className="text-center py-8 bg-[#003038] rounded-lg">
              <p className="text-[#BEC3CA] mb-2">{loyaltyError}</p>
              <button 
                onClick={() => {
                  setLoyaltyLoading(true);
                  setLoyaltyError(null);
                  // Recharger les données utilisateur
                  const cookies = document.cookie.split(';');
                  const authCookie = cookies.find(cookie => cookie.trim().startsWith('payload-token='));
                  if (authCookie) {
                    fetch('/api/user/loyalty', {
                      headers: {
                        'Authorization': `Bearer ${authCookie.split('=')[1]?.trim()}`
                      }
                    })
                    .then(response => response.json())
                    .then(data => {
                      if (data.success && data.loyalty) {
                        setUser(prev => prev ? { ...prev, loyalty: data.loyalty } : null);
                      }
                      setLoyaltyLoading(false);
                    })
                    .catch(() => {
                      setLoyaltyError('Impossible de charger votre programme de fidélité');
                      setLoyaltyLoading(false);
                    });
                  }
                }}
                className="text-[#10B981] hover:text-[#059669] underline"
              >
                Réessayer
              </button>
            </div>
          ) : !user?.loyalty ? (
            <div className="text-center py-8 bg-[#003038] rounded-lg">
              <p className="text-[#BEC3CA] mb-4">Faites votre première commande pour rejoindre notre programme de fidélité !</p>
              <Link href="/produits" 
                className="inline-block bg-[#007A72] hover:bg-[#059669] text-[#D1D5DB] font-medium py-2 px-6 rounded-md transition-colors">
                Découvrir nos produits
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Résumé du programme */}
              <div className="flex items-center justify-between bg-[#003038] p-4 rounded-lg">
                <div>
                  <p className="text-[#BEC3CA] text-sm">Commandes validées</p>
                  <p className="text-2xl font-bold text-[#10B981]">{user.loyalty.ordersCount}</p>
                </div>
                
                {/* {user.loyalty.referralEnabled && (
                  <div className="flex items-center bg-[#00434a] px-3 py-1 rounded-md">
                    <Zap size={16} className="text-[#10B981] mr-1" />
                    <span className="text-xs text-[#D1D5DB]">Parrainage actif</span>
                  </div>
                )} */}
              </div>
              
              {/* Récompense actuelle */}
              {user.loyalty.currentReward && user.loyalty.currentReward.type !== 'none' && !user.loyalty.currentReward.claimed && (
                <div className="bg-[#155757] rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="p-2 rounded-md bg-[#002B33] mr-3">
                      {user.loyalty.currentReward.type === 'sample' && <Gift size={24} className="text-[#10B981]" />}
                      {user.loyalty.currentReward.type === 'freeShipping' && <Truck size={24} className="text-[#10B981]" />}
                      {user.loyalty.currentReward.type === 'freeProduct' && <Gift size={24} className="text-[#10B981]" />}
                      {user.loyalty.currentReward.type === 'discount' && <Award size={24} className="text-[#10B981]" />}
                    </div>
                    <div>
                      <h3 className="font-medium text-[#D1D5DB] mb-1">Récompense disponible !</h3>
                      <p className="text-sm text-[#BEC3CA] mb-3">{user.loyalty.currentReward.description}</p>
                      <p className="text-xs text-[#10B981]">Sera automatiquement appliquée lors de votre prochaine commande</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Prochaines étapes */}
              <div>
                <h3 className="text-sm font-medium text-[#D1D5DB] mb-3">Progression</h3>
                
                {/* Déterminer la prochaine récompense */}
                {(() => {
                  const nextMilestone = (() => {
                    const count = user.loyalty.ordersCount;
                    if (count < 2) return { threshold: 2, description: "Échantillon offert" };
                    if (count < 3) return { threshold: 3, description: "Livraison offerte" };
                    if (count < 5) return { threshold: 5, description: "Produit offert (10€)" };
                    if (count < 10) return { threshold: 10, description: "Réduction 20€" };
                    return null; // Niveau max atteint
                  })();
                  
                  if (!nextMilestone) {
                    return (
                      <div className="bg-[#003038] p-4 rounded-lg text-center">
                        <Award size={28} className="text-[#E6C15A] mx-auto mb-2" />
                        <p className="text-[#D1D5DB] font-medium">Félicitations !</p>
                        <p className="text-sm text-[#BEC3CA] mt-1">Vous avez atteint le niveau maximum de notre programme.</p>
                      </div>
                    );
                  }
                  
                  const progress = (user.loyalty.ordersCount / nextMilestone.threshold) * 100;
                  
                  return (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-[#BEC3CA] mb-1">
                        <span>{user.loyalty.ordersCount} / {nextMilestone.threshold} commandes</span>
                      </div>
                      <div className="w-full bg-[#003038] rounded-full h-2.5">
                        <div 
                          className="bg-[#10B981] h-2.5 rounded-full transition-all duration-500" 
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-[#BEC3CA] mt-1">
                        Prochaine récompense : <span className="text-[#10B981] font-medium">{nextMilestone.description}</span>
                      </p>
                    </div>
                  );
                })()}
              </div>
              
              {/* Description du programme */}
              <div className="mt-6 p-4 bg-[#003038] rounded-lg">
                <h3 className="text-sm font-medium text-[#D1D5DB] mb-2">Notre programme de fidélité</h3>
                <ul className="text-xs space-y-2 text-[#BEC3CA]">
                  <li className="flex items-start">
                    <span className="w-5 h-5 rounded-full bg-[#155757] text-[#10B981] flex items-center justify-center mr-2 text-xs font-bold">2</span>
                    <span>Échantillon offert</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-5 h-5 rounded-full bg-[#155757] text-[#10B981] flex items-center justify-center mr-2 text-xs font-bold">3</span>
                    <span>Livraison offerte (5€ de remise)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-5 h-5 rounded-full bg-[#155757] text-[#10B981] flex items-center justify-center mr-2 text-xs font-bold">5</span>
                    <span>Produit offert (valeur 10€)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-5 h-5 rounded-full bg-[#155757] text-[#10B981] flex items-center justify-center mr-2 text-xs font-bold">10</span>
                    <span>Réduction 20€ ou Produit Offert</span>
                  </li>
                </ul>
              </div>
              
              {/* Niveaux du programme de fidélité */}
              <div className="mt-4 p-4 bg-[#003038] rounded-lg">
                <h3 className="text-sm font-medium text-[#D1D5DB] mb-3">Niveaux de fidélité et avantages</h3>
                <ul className="text-xs space-y-4 text-[#BEC3CA]">
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#CD7F32] flex items-center justify-center mr-3 text-xs font-bold text-white">
                      <Award size={14} />
                    </span>
                    <div>
                      <span className="font-medium text-[#CD7F32]">BRONZE (3 commandes)</span>
                      <p className="mt-1">5% de réduction sur chaque commande</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#C0C0C0] flex items-center justify-center mr-3 text-xs font-bold text-white">
                      <Award size={14} />
                    </span>
                    <div>
                      <span className="font-medium text-[#C0C0C0]">ARGENT (5 commandes)</span>
                      <p className="mt-1">10% de réduction sur chaque commande</p>
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[#E6C15A] flex items-center justify-center mr-3 text-xs font-bold text-white">
                      <Award size={14} />
                    </span>
                    <div>
                      <span className="font-medium text-[#E6C15A]">OR (10 commandes)</span>
                      <p className="mt-1">Offres spéciales en avant-première</p>
                    </div>
                  </li>
                </ul>
              </div>
              

            </div>
          )}
        </div>
      </div>
      
      {/* Bouton de déconnexion */}
      <div className="mt-8 mb-12 container mx-auto px-4 max-w-3xl">
        <div className="flex justify-center">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-red-700 text-white hover:bg-red-700 transition-colors shadow-sm cursor-pointer"
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Déconnexion en cours...
              </>
            ) : (
              <>
                <LogOut className="h-5 w-5" />
                Se déconnecter
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Modale de modification des informations */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#002B33] rounded-lg shadow-lg max-w-md w-full relative">
            {/* En-tête de la modale */}
            <div className="flex justify-between items-center border-b border-[#001A20] p-4">
              <h3 className="text-lg font-medium text-[#D1D5DB]">Modifier mes informations</h3>
              <button 
                onClick={closeModal}
                className="text-[#BEC3CA] hover:text-[#D1D5DB] transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Corps du formulaire */}
            <form onSubmit={updateUserInfo} className="p-6 space-y-4">
              <div className="space-y-1">
                <label htmlFor="firstName" className="block text-sm font-medium text-[#BEC3CA]">Prénom</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#00424A] border border-[#155757] rounded-md text-[#D1D5DB] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                  placeholder="Votre prénom"
                  required
                />
              </div>
              
              <div className="space-y-1">
                <label htmlFor="lastName" className="block text-sm font-medium text-[#BEC3CA]">Nom</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#00424A] border border-[#155757] rounded-md text-[#D1D5DB] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                  placeholder="Votre nom"
                  required
                />
              </div>
              
              <div className="space-y-1">
                <label htmlFor="email" className="block text-sm font-medium text-[#BEC3CA]">E-mail</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-[#00424A] border border-[#155757] rounded-md text-[#D1D5DB] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent"
                  placeholder="Votre adresse e-mail"
                  required
                />
              </div>
              
              {/* Messages d'erreur ou de succès */}
              {updateError && (
                <div className="bg-red-900 bg-opacity-25 text-red-300 px-4 py-2 rounded-md text-sm">
                  {updateError}
                </div>
              )}
              
              {updateSuccess && (
                <div className="bg-green-900 bg-opacity-25 text-[#10B981] px-4 py-2 rounded-md text-sm">
                  Vos informations ont été mises à jour avec succès !
                </div>
              )}
              
              {/* Boutons d'action */}
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-[#00424A] text-[#D1D5DB] rounded-md hover:bg-[#1D5754] transition-colors"
                >
                  Annuler
                </button>
                
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 bg-[#007A72] text-[#D1D5DB] rounded-md hover:bg-[#059669] transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 size={16} className="animate-spin mr-2" />
                      Mise à jour...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      Enregistrer
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
          
        </div>
      )}
    </div>
  );
}
