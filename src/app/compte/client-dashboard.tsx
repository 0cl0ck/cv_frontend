'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, ShoppingCart, Edit2, X, Save, Loader2, Award, LogOut, ChevronRight, Gift, Truck } from 'lucide-react';
import { LoyaltyReward } from '@/types/loyalty';
import { User } from '@/lib/auth/auth';
import { useAuthContext } from '@/context/AuthContext';
import { httpClient } from '@/lib/httpClient';
import { WalletWidget } from '@/components/Wallet';

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

// Composant client du tableau de bord
export default function ClientDashboard({ initialUser }: { initialUser: User }) {
  // Utiliser le contexte d'authentification global
  const { logout } = useAuthContext();
  const [userInfo, setUserInfo] = useState<UserInfo>({
    id: initialUser.id,
    email: initialUser.email,
    firstName: initialUser.firstName || '',
    lastName: initialUser.lastName || '',
    createdAt: new Date().toISOString(),
    // Les données loyalty seront ajoutées plus tard
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<{firstName: string; lastName: string; email: string}>({
    firstName: initialUser.firstName || '',
    lastName: initialUser.lastName || '',
    email: initialUser.email
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updatedFields, setUpdatedFields] = useState<string[]>([]);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  // Utilisé dans la fonction fetchUserData - prévu pour futures fonctionnalités
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [orders, setOrders] = useState([]);
  const [loyaltyLoading, setLoyaltyLoading] = useState(true);
  // Utilisé dans la gestion d'erreur de fetchUserData
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loyaltyError, setLoyaltyError] = useState<string | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const router = useRouter();

  // Charger les données supplémentaires au montage
  useEffect(() => {
    fetchUserData();
  }, []);

  // Ouvrir la modal d'édition
  const openEditModal = () => {
    setFormData({
      firstName: userInfo.firstName,
      lastName: userInfo.lastName,
      email: userInfo.email
    });
    setUpdateError(null);
    setUpdateSuccess(false);
    setIsModalOpen(true);
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
      // Sauvegarder les anciennes valeurs pour la comparaison
      const oldValues = {
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        email: userInfo.email
      };
      
      // Préparer les nouvelles données
      const newUserData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email
      };
      
      // Mettre à jour immédiatement les données dans l'UI
      setUserInfo(prev => ({
        ...prev,
        ...newUserData
      }));
      
      // Identifier les champs qui ont été modifiés
      const changedFields: string[] = [];
      if (formData.firstName !== oldValues.firstName) changedFields.push('firstName');
      if (formData.lastName !== oldValues.lastName) changedFields.push('lastName');
      if (formData.email !== oldValues.email) changedFields.push('email');
      
      // Marquer les champs mis à jour pour l'animation
      setUpdatedFields(changedFields);
      
      // Appeler l'API pour mettre à jour les informations utilisateur
      const response = await fetch('/api/customer/update', {
        method: 'PUT',
        credentials: 'include', // Utilise le cookie payload-token automatiquement
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUserData),
        withCsrf: true
      });
      
      const responseData = await response.json();
      
      if (response.ok) {
        setUpdateSuccess(true);
        
        // Masquer le message de succès après quelques secondes
        setTimeout(() => {
          setUpdateSuccess(false);
          closeModal();
          
          // Réinitialiser les champs mis à jour après l'animation
          setTimeout(() => {
            setUpdatedFields([]);
          }, 500);
        }, 1500);
      } else {
        // En cas d'erreur, revenir aux valeurs précédentes
        setUserInfo(prev => ({
          ...prev,
          ...oldValues
        }));
        setUpdateError(responseData.error || 'Une erreur est survenue lors de la mise à jour');
      }
    } catch (error) {
      setUpdateError('Une erreur de réseau est survenue. Veuillez réessayer.');
      console.error('Erreur lors de la mise à jour des informations utilisateur:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const togglePasswordForm = () => {
    setShowPasswordForm((prev) => !prev);
    setPasswordError(null);
    setPasswordSuccess(false);
  };

  const handlePasswordFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    setPasswordSubmitting(true);
    setPasswordError(null);
    setPasswordSuccess(false);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        let message = data?.error || data?.message || 'Impossible de mettre à jour le mot de passe';
        const fields = data?.details?.fields;
        if (fields && typeof fields === 'object') {
          const firstKey = Object.keys(fields)[0];
          const firstVal = fields[firstKey];
          const firstMsg = Array.isArray(firstVal) ? firstVal[0] : (typeof firstVal === 'string' ? firstVal : undefined);
          if (firstMsg) {
            message = firstMsg;
          }
        }
        setPasswordError(message);
        return;
      }

      setPasswordSuccess(true);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPasswordSuccess(false), 2500);
    } catch (err) {
      setPasswordError('Une erreur réseau est survenue. Veuillez réessayer.');
      console.error('Erreur lors du changement de mot de passe:', err);
    } finally {
      setPasswordSubmitting(false);
    }
  };

  const fetchUserData = async () => {
    try {
      setLoyaltyLoading(true);
      
      // Récupérer l'état de fidélité via httpClient (gère automatiquement l'authentification)
      const { data: statusData } = await httpClient.get('/loyalty/status');
      
      if (statusData?.success) {
        const ordersCount: number = typeof statusData?.ordersCount === 'number' ? statusData.ordersCount : 0;
        const currentReward: LoyaltyReward = (statusData?.currentReward || { type: 'none', claimed: false, description: 'Aucune récompense disponible' }) as LoyaltyReward;
        const referralEnabled: boolean = Boolean(statusData?.referralEnabled);

        const loyaltyInfo = {
          ordersCount,
          currentReward,
          referralEnabled,
        };

        setUserInfo(prev => ({ ...prev, loyalty: loyaltyInfo }));
      } else {
        console.error('Erreur lors de la récupération du statut de fidélité');
        setLoyaltyError('Impossible de charger votre programme de fidélité');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des données supplémentaires:', error);
      setLoyaltyError('Impossible de charger votre programme de fidélité');
    } finally {
      setLoyaltyLoading(false);
    }
  };

  // Fonction de déconnexion utilisant le contexte d'authentification global
  const handleLogout = async () => {
    setIsLoggingOut(true);
    
    try {
      // Utiliser la fonction de déconnexion du contexte d'authentification
      await logout();
      
      // Rediriger vers la page d'accueil
      router.push('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      
      // Rediriger quand même en cas d'erreur
      router.push('/');
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (loyaltyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#00424A]">
        <div className="text-center">
          <Loader2 size={50} className="animate-spin mx-auto text-[#10B981]" />
          <p className="text-[#D1D5DB] mt-4">Chargement de votre tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#001A1F]">
      <div className="pt-28 pb-16">
      <div className="container mx-auto px-4 space-y-8 max-w-7xl">
        {/* Header - Bienvenue */}
        <div className="bg-[#002B33] rounded-lg p-6 shadow-md">
          <h1 className="text-3xl font-bold mb-2 text-white">Bienvenue, {userInfo?.firstName || 'utilisateur'} !</h1>
          <p className="text-white/80">Votre espace personnel pour gérer vos commandes et vos informations</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Informations personnelles */}
          <div className="bg-[#002B33] rounded-lg shadow-md overflow-hidden content-start self-start">
            <div className="flex justify-between items-center p-6 border-b border-[#003A45]">
              <h2 className="text-xl font-bold text-white">Informations personnelles</h2>
              <button
                onClick={openEditModal}
                className="text-[#10B981] hover:text-[#34D399] transition-colors"
              >
                <Edit2 size={18} />
              </button>
            </div>
            <div className="p-6">
              <ul className="space-y-4 text-[#D1D5DB]">
                <li className="flex justify-between">
                  <span className="text-[#BEC3CA]">Nom</span>
                  <span className={updatedFields.includes('lastName') ? 'text-[#10B981] font-medium animate-pulse' : ''}>{userInfo?.lastName || ''}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-[#BEC3CA]">Prénom</span>
                  <span className={updatedFields.includes('firstName') ? 'text-[#10B981] font-medium animate-pulse' : ''}>{userInfo?.firstName || ''}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-[#BEC3CA]">E-mail</span>
                  <span className={`text-sm truncate max-w-[200px] ${updatedFields.includes('email') ? 'text-[#10B981] font-medium animate-pulse' : ''}`}>{userInfo?.email || ''}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-[#BEC3CA]">Membre depuis</span>
                  <span>{userInfo?.createdAt ? formatDate(userInfo.createdAt) : ''}</span>
                </li>
              </ul>
              
              <div className="mt-8">
                <h3 className="text-lg font-medium text-white mb-3">Actions rapides</h3>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    <Link 
                      href="/compte/commandes"
                      className="bg-[#00424c] hover:bg-[#005866] rounded-md p-3 flex items-start transition-colors group"
                    >
                      <div className="mr-3 p-2 bg-[#002B33] rounded-md">
                        <ShoppingCart size={20} className="text-[#10B981]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-[#D1D5DB]">Commandes</h3>
                        <p className="text-xs text-[#BEC3CA] mt-1">Historique de vos achats</p>
                      </div>
                      <ChevronRight size={16} className="text-[#10B981] opacity-0 group-hover:opacity-100 transition-opacity self-center ml-2" />
                    </Link>
                    
                    <Link 
                      href="/compte/adresses"
                      className="bg-[#00424c] hover:bg-[#005866] rounded-md p-3 flex items-start transition-colors group"
                    >
                      <div className="mr-3 p-2 bg-[#002B33] rounded-md">
                        <MapPin size={20} className="text-[#10B981]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-[#D1D5DB]">Adresses</h3>
                        <p className="text-xs text-[#BEC3CA] mt-1">Gérer vos adresses</p>
                      </div>
                      <ChevronRight size={16} className="text-[#10B981] opacity-0 group-hover:opacity-100 transition-opacity self-center ml-2" />
                    </Link>

                    {/* Accès au parrainage */}
                    <Link
                      href="/compte/parrainage"
                      className="bg-[#00424c] hover:bg-[#005866] rounded-md p-3 flex items-start transition-colors group"
                    >
                      <div className="mr-3 p-2 bg-[#002B33] rounded-md">
                        <Gift size={20} className="text-[#10B981]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-[#D1D5DB]">Parrainage</h3>
                        <p className="text-xs text-[#BEC3CA] mt-1">
                          {userInfo.loyalty?.referralEnabled
                            ? 'Invitez vos proches et gagnez -30%'
                            : 'Disponible après 1 commande validée'}
                        </p>
                      </div>
                      <ChevronRight size={16} className="text-[#10B981] opacity-0 group-hover:opacity-100 transition-opacity self-center ml-2" />
                    </Link>
                  </div>
                  
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={togglePasswordForm}
                      className="w-full border border-[#155757] hover:border-[#10B981] text-[#D1D5DB] hover:text-white rounded-md px-3 py-2 transition-colors"
                    >
                      {showPasswordForm ? 'Fermer le formulaire' : 'Modifier mon mot de passe'}
                    </button>

                    {showPasswordForm && (
                      <form onSubmit={handlePasswordSubmit} className="mt-3 space-y-3 bg-[#00343C] border border-[#155757] rounded-md p-4">
                        <div className="space-y-1">
                          <label htmlFor="currentPassword" className="block text-xs font-medium text-[#BEC3CA] uppercase tracking-wide">
                            Mot de passe actuel
                          </label>
                          <input
                            type="password"
                            id="currentPassword"
                            name="currentPassword"
                            value={passwordForm.currentPassword}
                            onChange={handlePasswordFieldChange}
                            className="w-full px-3 py-2 bg-[#00242A] border border-[#155757] rounded-md text-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                            autoComplete="current-password"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label htmlFor="newPassword" className="block text-xs font-medium text-[#BEC3CA] uppercase tracking-wide">
                            Nouveau mot de passe
                          </label>
                          <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            value={passwordForm.newPassword}
                            onChange={handlePasswordFieldChange}
                            className="w-full px-3 py-2 bg-[#00242A] border border-[#155757] rounded-md text-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                            autoComplete="new-password"
                            required
                          />
                        </div>

                        <div className="space-y-1">
                          <label htmlFor="confirmPassword" className="block text-xs font-medium text-[#BEC3CA] uppercase tracking-wide">
                            Confirmation
                          </label>
                          <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={passwordForm.confirmPassword}
                            onChange={handlePasswordFieldChange}
                            className="w-full px-3 py-2 bg-[#00242A] border border-[#155757] rounded-md text-[#D1D5DB] focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                            autoComplete="new-password"
                            required
                          />
                        </div>

                        {passwordError && (
                          <div className="bg-red-900/40 border border-red-700/40 text-red-200 text-sm px-3 py-2 rounded-md">
                            {passwordError}
                          </div>
                        )}

                        {passwordSuccess && (
                          <div className="bg-emerald-900/30 border border-emerald-600/40 text-emerald-200 text-sm px-3 py-2 rounded-md">
                            Votre mot de passe a été mis à jour.
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={passwordSubmitting}
                          className="w-full flex items-center justify-center bg-[#007A72] hover:bg-[#059669] text-white font-medium py-2 px-4 rounded-md disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                        >
                          {passwordSubmitting ? (
                            <>
                              <Loader2 size={16} className="animate-spin mr-2" />
                              Mise à jour...
                            </>
                          ) : (
                            'Enregistrer'
                          )}
                        </button>
                      </form>
                    )}
                  </div>
                  
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center justify-center space-x-2 bg-red-800 hover:bg-red-700 p-3 rounded-md transition-colors text-white disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoggingOut ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Déconnexion...</span>
                      </>
                    ) : (
                      <>
                        <LogOut size={16} />
                        <span>Déconnexion</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
{/* Programme de fidélité */}
<div className="bg-[#002B33] rounded-lg p-6 shadow-md col-span-1 md:col-span-2 h-full">
  <div className="flex justify-between items-center mb-6">
    <h2 className="text-xl font-semibold flex items-center text-[#D1D5DB]">
      <Award className="text-[#10B981] mr-2" size={24} />
      Programme Fidélité
    </h2>
    {userInfo.loyalty && userInfo.loyalty.ordersCount >= 3 && (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
        userInfo.loyalty.ordersCount >= 10 
          ? 'bg-[#E6C15A]/20 text-[#E6C15A] border border-[#E6C15A]/40' 
          : userInfo.loyalty.ordersCount >= 5 
            ? 'bg-[#9CA3AF]/20 text-[#9CA3AF] border border-[#9CA3AF]/40' 
            : 'bg-[#A06D5E]/20 text-[#A06D5E] border border-[#A06D5E]/40'
      }`}>
        {userInfo.loyalty.ordersCount >= 10 
          ? 'Niveau Or' 
          : userInfo.loyalty.ordersCount >= 5 
            ? 'Niveau Argent' 
            : 'Niveau Bronze'}
      </span>
    )}
  </div>

  {/* Si pas encore de fidélité */}
  {!userInfo.loyalty ? (
    <div className="text-center py-8 bg-[#003038] rounded-lg">
      <p className="text-[#BEC3CA] mb-4">
        Faites votre première commande pour rejoindre notre programme de fidélité !
      </p>
      <Link
        href="/produits"
        className="inline-block bg-[#007A72] hover:bg-[#059669] text-[#D1D5DB] font-medium py-2 px-6 rounded-md"
      >
        Découvrir nos produits
      </Link>
    </div>
  ) : (
    <div className="space-y-6">
      {/* Résumé des commandes validées */}
      <div className="flex items-center justify-between bg-[#003038] p-4 rounded-lg">
        <div>
          <p className="text-[#BEC3CA] text-sm">Commandes validées</p>
          <p className="text-2xl font-bold text-[#10B981]">
            {userInfo.loyalty.ordersCount}
          </p>
        </div>
      </div>

      {/* Récompense disponible */}
      {userInfo.loyalty.currentReward.type !== 'none' &&
       !userInfo.loyalty.currentReward.claimed && (
        <div className="bg-[#155757] rounded-lg p-4">
          <div className="flex items-start">
            <div className="p-2 bg-[#002B33] rounded-md mr-3">
              {userInfo.loyalty.currentReward.type === 'sample' && (
                <Gift size={24} className="text-[#10B981]" />
              )}
              {userInfo.loyalty.currentReward.type === 'freeShipping' && (
                <Truck size={24} className="text-[#10B981]" />
              )}
              {userInfo.loyalty.currentReward.type === 'freeProduct' && (
                <Gift size={24} className="text-[#10B981]" />
              )}
              {userInfo.loyalty.currentReward.type === 'discount' && (
                <Award size={24} className="text-[#10B981]" />
              )}
            </div>
            <div>
              <h3 className="font-medium text-[#D1D5DB] mb-1">
                Récompense disponible !
              </h3>
              <p className="text-sm text-[#BEC3CA] mb-3">
                {userInfo.loyalty.currentReward.description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progression vers le prochain palier */}
      <div className="mt-4">
        <h3 className="text-sm font-medium text-[#D1D5DB] mb-3">Progression</h3>
        {(() => {
          const count = userInfo.loyalty.ordersCount;
          const next =
            count < 3 ? { t: 3, d: 'Bronze (5%)' } : count < 5 ? { t: 5, d: 'Argent (10%)' } : count < 10 ? { t: 10, d: 'Or' } : null;
          if (!next) {
            return (
              <div className="bg-[#003038] p-4 rounded-lg text-center">
                <Award size={28} className="text-[#E6C15A] mx-auto mb-2" />
                <p className="text-[#D1D5DB] font-medium">
                  Félicitations ! Niveau max atteint.
                </p>
              </div>
            );
          }
          const pct = (count / next.t) * 100;
          return (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-[#BEC3CA] mb-1">
                <span>
                  {count} / {next.t} commandes
                </span>
                <span className="font-medium text-[#10B981]">{next.d}</span>
              </div>
              <div className="w-full bg-[#003038] rounded-full h-2.5">
                <div
                  className="bg-[#10B981] h-2.5 rounded-full"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })()}
      </div>

      {/* Section responsive pour récompenses et niveaux côte à côte sur desktop */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 content-start">
        {/* Les récompenses périodiques */}
        

        {/* Les niveaux de fidélité */}
        <div className="p-4 bg-[#003038] rounded-lg self-start h-auto">
          <h3 className="text-sm font-medium text-[#D1D5DB] mb-3">
            Niveaux de fidélité
          </h3>
          
          <div className="space-y-3">
            {/* Niveau Bronze */}
            <div className="p-3 bg-[#002B33] rounded-md border border-[#A06D5E] relative overflow-hidden">
              <div className="flex items-center mb-1">
                <span className="w-6 h-6 rounded-full bg-[#A06D5E] text-[#001A1F] flex items-center justify-center mr-2 text-xs font-bold">
                  3
                </span>
                <h4 className="text-sm font-medium text-[#A06D5E] mr-1">Bronze</h4>
                {userInfo.loyalty && userInfo.loyalty.ordersCount >= 3 && (
                  <span className="px-1.5 py-0.5 bg-[#A06D5E] text-[#001A1F] text-xxs rounded-sm ml-auto">Actif</span>
                )}
              </div>
              <p className="text-xs text-[#BEC3CA] pl-8">5% de remise permanente sur toutes vos commandes</p>
            </div>
            
            {/* Niveau Argent */}
            <div className="p-3 bg-[#002B33] rounded-md border border-[#9CA3AF] relative overflow-hidden">
              <div className="flex items-center mb-1">
                <span className="w-6 h-6 rounded-full bg-[#9CA3AF] text-[#001A1F] flex items-center justify-center mr-2 text-xs font-bold">
                  5
                </span>
                <h4 className="text-sm font-medium text-[#9CA3AF] mr-1">Argent</h4>
                {userInfo.loyalty && userInfo.loyalty.ordersCount >= 5 && (
                  <span className="px-1.5 py-0.5 bg-[#9CA3AF] text-[#001A1F] text-xxs rounded-sm ml-auto">Actif</span>
                )}
              </div>
              <p className="text-xs text-[#BEC3CA] pl-8">10% de remise permanente sur toutes vos commandes</p>
            </div>
            
            {/* Niveau Or */}
            <div className="p-3 bg-[#002B33] rounded-md border border-[#E6C15A] relative overflow-hidden">
              <div className="flex items-center mb-1">
                <span className="w-6 h-6 rounded-full bg-[#E6C15A] text-[#001A1F] flex items-center justify-center mr-2 text-xs font-bold">
                  10
                </span>
                <h4 className="text-sm font-medium text-[#E6C15A] mr-1">Or</h4>
                {userInfo.loyalty && userInfo.loyalty.ordersCount >= 10 && (
                  <span className="px-1.5 py-0.5 bg-[#E6C15A] text-[#001A1F] text-xxs rounded-sm ml-auto">Actif</span>
                )}
              </div>
              <p className="text-xs text-[#BEC3CA] pl-8">Accès en avant-première aux promotions et événements</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )}
</div>
        </div>
        
        {/* Cagnotte Noël */}
        <div className="bg-[#002B33] rounded-lg p-6 shadow-md">
          <WalletWidget />
        </div>
      </div>
      </div>
      
      {/* Modal de modification des informations */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#002930] rounded-lg shadow-xl w-full max-w-md relative overflow-hidden">
            {/* En-tête de la modal */}
            <div className="px-6 py-4 border-b border-[#155757] flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Modifier vos informations</h2>
              <button 
                type="button" 
                onClick={closeModal}
                className="text-[#BEC3CA] hover:text-white transition-colors"
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
                  className="px-4 py-2 bg-[#00424A] text-[#D1D5DB] rounded-md hover:bg-[#1D5754] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#007A72]"
                >
                  Annuler
                </button>
                
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 bg-[#007A72] text-[#D1D5DB] rounded-md hover:bg-[#059669] transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#007A72]"
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




