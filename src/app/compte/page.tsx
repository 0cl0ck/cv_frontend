'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, Package, MapPin, ShoppingCart, MessageCircle, Edit2, ChevronRight, X, Save, Loader2 } from 'lucide-react';

// Type pour les informations de l'utilisateur
type UserInfo = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [orders, setOrders] = useState([]);
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
        
        if (backendResponse.ok) {
          // Si l'appel au backend réussit, utiliser les données complètes
          const backendData = await backendResponse.json();
          setUser({
            id: backendData.id,
            email: backendData.email,
            firstName: backendData.firstName,
            lastName: backendData.lastName,
            createdAt: backendData.createdAt
          });
        } else {
          // Fallback: utiliser les données minimales du token
          console.warn('Impossible de récupérer les données complètes du backend, utilisation des données décodées du token');
          setUser({
            id: decodedPayload.id,
            email: decodedPayload.email,
            firstName: 'Utilisateur',
            lastName: 'Connecté',
            createdAt: new Date().toISOString()
          });
        }
        
        // Charger les commandes de l'utilisateur (à implémenter plus tard)
        // const ordersResponse = await fetch('/api/orders/me');
        // if (ordersResponse.ok) {
        //   const ordersData = await ordersResponse.json();
        //   setOrders(ordersData.orders);
        // }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setLoading(false);
        router.push('/connexion');
        return;
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [router]);

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
          <div className="text-2xl font-bold text-red-400 mb-4">Erreur d'authentification</div>
          <p className="text-[#D1D5DB] mb-6">Vous devez être connecté pour accéder à cette page.</p>
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
          <h1 className="text-3xl font-bold mb-2 text-[#D1D5DB]">Bienvenue, {user.firstName} !</h1>
          <p className="text-[#BEC3CA]">Votre espace personnel pour gérer vos commandes et vos informations</p>
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
                    <p className="text-sm text-[#BEC3CA] mt-1">Consultez l'historique de vos commandes</p>
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
                      <h3 className="font-medium text-[#D1D5DB]">Besoin d'aide ?</h3>
                      <ChevronRight size={16} className="text-[#10B981] opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <p className="text-sm text-[#BEC3CA] mt-1">Contactez notre service client</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Section Dernières commandes */}
        <div className="bg-[#002B33] rounded-lg p-6 shadow-md">
          <h2 className="text-xl font-semibold mb-6 text-[#D1D5DB]">Mes dernières commandes</h2>
          
          {orders.length > 0 ? (
            <div className="overflow-x-auto rounded-lg">
              <table className="min-w-full">
                <thead className="bg-[#00424A]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BEC3CA] uppercase tracking-wider">Commande</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BEC3CA] uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BEC3CA] uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BEC3CA] uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#BEC3CA] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-[#1D5754] divide-y divide-[#0A3A3A]">
                  {/* Les commandes seront affichées ici lorsque l'API sera implémentée */}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 bg-[#002B33] rounded-lg">
              <Calendar size={48} className="text-[#10B981] mx-auto mb-4" />
              <p className="text-[#BEC3CA] mb-6">Vous n'avez pas encore passé de commande.</p>
              <Link href="/produits" 
                className="inline-block bg-[#007A72] hover:bg-[#059669] text-[#D1D5DB] font-medium py-2 px-6 rounded-md transition-colors">
                Découvrir nos produits
              </Link>
            </div>
          )}
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
