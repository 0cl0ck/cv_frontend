'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MapPin, ChevronLeft, Plus, Edit2, Trash2, CheckCircle, X, Save, Loader2 } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';
import { secureLogger as logger } from '@/utils/logger';
import { httpClient } from '@/lib/httpClient';
import axios from 'axios';   // ➜ nouveau

  const ALLOWED_COUNTRIES = ['France', 'Belgique'] as const;
  type AllowedCountry = typeof ALLOWED_COUNTRIES[number];
  const sanitizeCountry = (c: string): AllowedCountry =>
    (ALLOWED_COUNTRIES as readonly string[]).includes(c) ? (c as AllowedCountry) : 'France';

// Types pour les adresses
type AddressType = 'shipping' | 'billing' | 'both';

interface Address {
  id?: string;
  type: AddressType;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

// Type pour les informations de l'utilisateur
interface UserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  addresses: Address[];
}

// Fonction pour traduire le type d'adresse
function getAddressTypeLabel(type: AddressType): string {
  switch (type) {
    case 'shipping':
      return 'Livraison';
    case 'billing':
      return 'Facturation';
    case 'both':
      return 'Livraison et facturation';
    default:
      return type;
  }
}

// -------- utilitaires --------
const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Une erreur inconnue est survenue';
};

// Composant principal de gestion des adresses
export default function AddressesPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const router = useRouter();
  
  // Utiliser le contexte d'authentification global
  const { isAuthenticated, user: authUser, loading: authLoading } = useAuthContext();

  // État pour le formulaire d'adresse
  const [formAddress, setFormAddress] = useState<Address>({
    type: 'shipping',
    name: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'France',
    phone: '',
    isDefault: false
  });
  
  // Récupérer les données de l'utilisateur au chargement de la page
  useEffect(() => {
    // Attendre que la vérification d'authentification soit terminée
    if (authLoading) {
      return;
    }
    
    // Rediriger si non authentifié
    if (!isAuthenticated) {
      router.push('/connexion');
      return;
    }
    
    async function fetchUserData() {
      try {
        // Utiliser les données utilisateur du contexte d'authentification global
        if (authUser && authUser.id) {
          // Récupérer les adresses de l'utilisateur via le profil complet
          try {
            const customerResponse = await httpClient.get('/customers/me');
            logger.debug('Réponse customer status', { status: customerResponse.status });
            
            // Extraire les adresses depuis le customer
            const fetchedAddresses = customerResponse.data?.addresses || [];
            logger.debug('Adresses récupérées', { count: fetchedAddresses.length });
            
            // Mettre à jour les états avec les données récupérées
            const sanitizedAddresses = (fetchedAddresses || []).map((a: Address) => ({
              ...a,
              country: sanitizeCountry(a.country),
            }));

            setUser({
              id: authUser.id,
              email: authUser.email,
              firstName: authUser.firstName || '',
              lastName: authUser.lastName || '',
              createdAt: new Date().toISOString(), // Date actuelle si non disponible
              addresses: sanitizedAddresses
            });
            
            setAddresses(sanitizedAddresses);
            setLoading(false);
          } catch (apiError) {
            console.error('Erreur lors de la récupération des adresses:', apiError);
            throw new Error(`Erreur lors de la récupération des adresses: ${apiError}`);
          }
        } else {
          // Fallback: rediriger vers la page de connexion si aucun utilisateur n'est authentifié
          console.warn('Aucun utilisateur authentifié trouvé');
          router.push('/connexion');
          return;
        }
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        setError('Une erreur est survenue lors du chargement de vos adresses');
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [router, isAuthenticated, authLoading, authUser]);
  
  // Gérer l'affichage pendant le chargement
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#00424A]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00AB55] mx-auto"></div>
          <p className="mt-4 text-[#D1D5DB]">Chargement de vos adresses...</p>
        </div>
      </div>
    );
  }
  
  // Gérer l'affichage si l'utilisateur n'est pas connecté
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#00424A]">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-400 mb-4">Erreur d&apos;authentification</div>
          <p className="text-[#D1D5DB] mb-6">Vous devez être connecté pour accéder à cette page.</p>
          <Link href="/connexion" className="px-4 py-2 bg-[#10B981] text-[#D1D5DB] rounded hover:bg-[#059669] transition-colors">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }
  
  // Initialiser le formulaire d'adresse pour l'ajout ou l'édition
  const initializeAddressForm = (address: Address | null = null) => {
    if (address) {
      // Mode édition: initialiser avec les valeurs existantes
      setFormAddress({
        ...address,
        country: sanitizeCountry(address.country),
      });
      setEditingAddress(address);
      setIsAddingAddress(false);
    } else {
      // Mode ajout: initialiser avec des valeurs par défaut
      setFormAddress({
        type: 'shipping',
        name: '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'France',
        isDefault: false
      });
      setIsAddingAddress(true);
      setEditingAddress(null);
    }
    setError(null);
    setSuccess(null);
  };
  
  // Gérer les changements dans le formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormAddress(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormAddress(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Annuler l'ajout ou l'édition
  const cancelAddressForm = () => {
    setIsAddingAddress(false);
    setEditingAddress(null);
    setError(null);
    setSuccess(null);
  };
  
  // Sauvegarder une adresse (ajout ou modification)
  const saveAddress = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Valider les champs obligatoires
      if (!formAddress.name || !formAddress.line1 || !formAddress.city || !formAddress.postalCode || !formAddress.phone) {
        setError('Veuillez remplir tous les champs obligatoires, y compris le numéro de téléphone');
        setIsSaving(false);
        return;
      }
      
      // S'assurer que le téléphone est dans un format valide selon le pays
      const FR_PHONE = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
      const BE_PHONE = /^(?:(?:\+|00)32|0)(?:\s*[1-69](?:\s*\d{2}){4}|\s*7[0-9](?:\s*\d{2}){3}|\s*[23](?:\s*\d{2}){3})$/;
      const phoneVal = (formAddress.phone || '').trim();
      const phoneOk = formAddress.country === 'Belgique' ? BE_PHONE.test(phoneVal) : FR_PHONE.test(phoneVal);
      if (formAddress.phone && !phoneOk) {
        setError(
          formAddress.country === 'Belgique'
            ? 'Le numéro de téléphone doit être au format belge (ex: 0470 12 34 56 ou +32...)'
            : 'Le numéro de téléphone doit être au format français (ex: 06 12 34 56 78)'
        );
        setIsSaving(false);
        return;
      }
      
      // Vérifier que l'utilisateur est connecté
      if (!user) {
        setError('Session expirée. Veuillez vous reconnecter.');
        setIsSaving(false);
        return;
      }
      
      // Gérer les adresses existantes
      let updatedAddresses = [...addresses];
      
      // Si l'adresse est définie comme par défaut, mettre à jour les autres adresses
      if (formAddress.isDefault) {
        updatedAddresses = updatedAddresses.map(addr => ({
          ...addr,
          isDefault: false
        }));
      }
      
      if (editingAddress) {
        // Modification d'une adresse existante
        const index = updatedAddresses.findIndex(addr => addr.id === editingAddress.id);
        if (index !== -1) {
          updatedAddresses[index] = { ...formAddress, id: editingAddress.id };
        }
      } else {
        // Ajout d'une nouvelle adresse
        const newId = `addr_${Date.now()}`; // Créer un ID temporaire
        updatedAddresses.push({ ...formAddress, id: newId });
      }
      
      // Approche PayloadCMS native : PATCH du customer avec le tableau addresses mis à jour
      try {
        await httpClient.patch('/customers/me', {
          addresses: updatedAddresses
        });
        
        // Mettre à jour les données locales si la requête a réussi
        setAddresses(updatedAddresses);
        setSuccess(
          editingAddress 
            ? 'Adresse modifiée avec succès' 
            : 'Nouvelle adresse ajoutée avec succès'
        );
        setIsAddingAddress(false);
        setEditingAddress(null);
      } catch (apiError) {
        console.error('Erreur lors de la sauvegarde de l\'adresse:', apiError);
        setError(getErrorMessage(apiError));
      }
    } catch (err) {
      console.error('Erreur lors de la sauvegarde de l\'adresse:', err);
      setError('Une erreur est survenue lors de la sauvegarde de l\'adresse');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Supprimer une adresse
  const deleteAddress = async (addressId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette adresse ?')) {
      return;
    }
    
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Vérifier que l'utilisateur est connecté
      if (!user) {
        setError('Session expirée. Veuillez vous reconnecter.');
        setIsSaving(false);
        return;
      }
      
      // Filtrer les adresses pour retirer celle à supprimer
      const updatedAddresses = addresses.filter(addr => addr.id !== addressId);
      
      // Approche PayloadCMS native : PATCH du customer avec le tableau addresses mis à jour
      try {
        await httpClient.patch('/customers/me', {
          addresses: updatedAddresses
        });
        
        // Mettre à jour les données locales
        setAddresses(updatedAddresses);
        setSuccess('Adresse supprimée avec succès');
      } catch (apiError) {
        console.error('Erreur API lors de la suppression:', apiError);
        const errorMsg = getErrorMessage(apiError);
        setError(errorMsg === 'Request failed with status code 500' 
          ? 'Impossible de supprimer l\'adresse. Veuillez réessayer.'
          : errorMsg
        );
      }
    } catch (err) {
      console.error('Erreur lors de la suppression de l\'adresse:', err);
      setError('Une erreur est survenue lors de la suppression de l\'adresse');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Définir une adresse comme adresse par défaut
  const setDefaultAddress = async (addressId: string) => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (!user) {
        setError('Session expirée. Veuillez vous reconnecter.');
        return;
      }
      
      // Mettre à jour les adresses pour changer celle qui est par défaut
      const updatedAddresses = addresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      }));
      
      // Approche PayloadCMS native : PATCH du customer avec le tableau addresses mis à jour
      await httpClient.patch('/customers/me', {
        addresses: updatedAddresses
      });
      
      setAddresses(updatedAddresses);
      setSuccess('Adresse par défaut mise à jour avec succès');
    } catch (apiError) {
      console.error('Erreur API lors de la mise à jour de l\'adresse par défaut:', apiError);
      const errorMsg = getErrorMessage(apiError);
      setError(errorMsg === 'Request failed with status code 500' 
        ? 'Impossible de définir l\'adresse par défaut. Veuillez réessayer.'
        : errorMsg
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Afficher l'interface principale
  return (
    <div className="bg-[#00424A] min-h-screen py-10">
      <div className="container mx-auto px-4 space-y-8 max-w-7xl">
        {/* En-tête */}
        <div className="flex items-center justify-between gap-4">
          <Link 
            href="/compte" 
            className="flex items-center text-[#BEC3CA] hover:text-[#D1D5DB] transition-colors"
          >
            <ChevronLeft size={20} className="mr-1" />
            Retour au compte
          </Link>
          
          <h1 className="text-2xl font-bold text-[#D1D5DB]">Mes adresses</h1>
          
          <div className="w-24"></div> {/* Spacer pour centrer le titre */}
        </div>
        
        {/* Messages de succès/erreur */}
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-100 px-4 py-3 rounded relative">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-500 bg-opacity-20 border border-green-500 text-green-100 px-4 py-3 rounded relative">
            {success}
          </div>
        )}
        
        {/* Liste des adresses */}
        {!isAddingAddress && !editingAddress && (
          <div className="bg-[#002B33] rounded-lg p-6 shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-[#D1D5DB]">Vos adresses enregistrées</h2>
              <button 
                onClick={() => initializeAddressForm()}
                className="flex items-center px-3 py-2 bg-[#007A72] text-[#D1D5DB] rounded hover:bg-[#059669] transition-colors"
                disabled={isSaving}
              >
                <Plus size={16} className="mr-2" />
                Ajouter une adresse
              </button>
            </div>
            
            {addresses.length === 0 ? (
              <div className="text-center py-8 text-[#BEC3CA]">
                <MapPin size={48} className="mx-auto mb-4 text-[#007A72]" />
                <p>Vous n&apos;avez pas encore d&apos;adresse enregistrée.</p>
                <button 
                  onClick={() => initializeAddressForm()}
                  className="mt-4 px-4 py-2 bg-[#007A72] text-[#D1D5DB] rounded hover:bg-[#059669] transition-colors"
                >
                  Ajouter ma première adresse
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {addresses.map((address) => (
                  <div key={address.id} className="bg-[#00424c] rounded-lg p-4 shadow relative">
                    {address.isDefault && (
                      <div className="absolute top-2 right-2 flex items-center text-[#10B981] text-sm">
                        <CheckCircle size={16} className="mr-1" />
                        Par défaut
                      </div>
                    )}
                    
                    <div className="mb-2 text-[#10B981] text-sm font-medium">
                      {getAddressTypeLabel(address.type)}
                    </div>
                    
                    <div className="text-[#D1D5DB] font-medium">{address.name}</div>
                    <div className="text-[#BEC3CA] text-sm mt-1">
                      {address.line1}
                      {address.line2 && <span><br />{address.line2}</span>}
                      <br />
                      {address.postalCode} {address.city}
                      {address.state && <span><br />{address.state}</span>}
                      <br />
                      {address.country}
                    </div>
                    
                    <div className="flex mt-4 space-x-2 justify-end">
                      {!address.isDefault && (
                        <button 
                          onClick={() => setDefaultAddress(address.id!)}
                          className="p-2 text-[#BEC3CA] hover:text-[#10B981] transition-colors"
                          title="Définir comme adresse par défaut"
                          disabled={isSaving}
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                      
                      <button 
                        onClick={() => initializeAddressForm(address)}
                        className="p-2 text-[#BEC3CA] hover:text-[#10B981] transition-colors"
                        title="Modifier l'adresse"
                        disabled={isSaving}
                      >
                        <Edit2 size={16} />
                      </button>
                      
                      <button 
                        onClick={() => deleteAddress(address.id!)}
                        className="p-2 text-[#BEC3CA] hover:text-red-500 transition-colors"
                        title="Supprimer l'adresse"
                        disabled={isSaving}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Formulaire d'ajout/édition d'adresse */}
        {(isAddingAddress || editingAddress) && (
          <div className="bg-[#002B33] rounded-lg p-6 shadow-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-[#D1D5DB]">
                {isAddingAddress ? 'Ajouter une adresse' : 'Modifier l\'adresse'}
              </h2>
              <button 
                onClick={cancelAddressForm}
                className="text-[#BEC3CA] hover:text-[#D1D5DB]"
                disabled={isSaving}
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={saveAddress} className="space-y-4">
              {/* Type d'adresse */}
              <div>
                <label htmlFor="type" className="block text-[#BEC3CA] mb-1">Type d&apos;adresse</label>
                <select
                  id="type"
                  name="type"
                  value={formAddress.type}
                  onChange={handleInputChange}
                  className="w-full bg-[#00424c] text-[#D1D5DB] border border-[#0A3A3A] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#007A72]"
                  disabled={isSaving}
                >
                  <option value="shipping">Livraison</option>
                  <option value="billing">Facturation</option>
                  <option value="both">Livraison et facturation</option>
                </select>
              </div>
              
              {/* Nom complet */}
              <div>
                <label htmlFor="name" className="block text-[#BEC3CA] mb-1">Nom complet <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formAddress.name}
                  onChange={handleInputChange}
                  className="w-full bg-[#00424c] text-[#D1D5DB] border border-[#0A3A3A] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#007A72]"
                  placeholder="Prénom et nom"
                  required
                  disabled={isSaving}
                />
              </div>
              
              {/* Adresse ligne 1 */}
              <div>
                <label htmlFor="line1" className="block text-[#BEC3CA] mb-1">Adresse <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="line1"
                  name="line1"
                  value={formAddress.line1}
                  onChange={handleInputChange}
                  className="w-full bg-[#00424c] text-[#D1D5DB] border border-[#0A3A3A] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#007A72]"
                  placeholder="Numéro et rue"
                  required
                  disabled={isSaving}
                />
              </div>
              
              {/* Adresse ligne 2 */}
              <div>
                <label htmlFor="line2" className="block text-[#BEC3CA] mb-1">Complément d&apos;adresse</label>
                <input
                  type="text"
                  id="line2"
                  name="line2"
                  value={formAddress.line2 || ''}
                  onChange={handleInputChange}
                  className="w-full bg-[#00424c] text-[#D1D5DB] border border-[#0A3A3A] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#007A72]"
                  placeholder="Bâtiment, étage, etc."
                  disabled={isSaving}
                />
              </div>
              
              {/* Ville et code postal (sur la même ligne) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="postalCode" className="block text-[#BEC3CA] mb-1">Code postal <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={formAddress.postalCode}
                    onChange={handleInputChange}
                    className="w-full bg-[#00424c] text-[#D1D5DB] border border-[#0A3A3A] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#007A72]"
                    placeholder="Code postal"
                    required
                    disabled={isSaving}
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-[#BEC3CA] mb-1">Ville <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formAddress.city}
                    onChange={handleInputChange}
                    className="w-full bg-[#00424c] text-[#D1D5DB] border border-[#0A3A3A] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#007A72]"
                    placeholder="Ville"
                    required
                    disabled={isSaving}
                  />
                </div>
              </div>
              
              {/* Région/Département */}
              <div>
                <label htmlFor="state" className="block text-[#BEC3CA] mb-1">Département/Région</label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formAddress.state || ''}
                  onChange={handleInputChange}
                  className="w-full bg-[#00424c] text-[#D1D5DB] border border-[#0A3A3A] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#007A72]"
                  placeholder="Département ou région"
                  disabled={isSaving}
                />
              </div>
              
              {/* Pays */}
              <div>
                <label htmlFor="country" className="block text-[#BEC3CA] mb-1">Pays <span className="text-red-500">*</span></label>
                <select
                  id="country"
                  name="country"
                  value={sanitizeCountry(formAddress.country)}
                  onChange={handleInputChange}
                  className="w-full bg-[#00424c] text-[#D1D5DB] border border-[#0A3A3A] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#007A72]"
                  required
                  disabled={isSaving}
                >
                  <option value="France">France</option>
                  <option value="Belgique">Belgique</option>
                </select>
              </div>
              
              {/* Téléphone */}
              <div>
                <label htmlFor="phone" className="block text-[#BEC3CA] mb-1">Téléphone <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formAddress.phone || ''}
                  onChange={handleInputChange}
                  className="w-full bg-[#00424c] text-[#D1D5DB] border border-[#0A3A3A] rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#007A72]"
                  placeholder="Téléphone"
                  required
                  disabled={isSaving}
                />
              </div>
              
              {/* Adresse par défaut */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isDefault"
                  name="isDefault"
                  checked={formAddress.isDefault}
                  onChange={handleInputChange}
                  className="mr-2 h-4 w-4 text-[#007A72] bg-[#00424c] border-[#0A3A3A] rounded focus:ring-[#007A72]"
                  disabled={isSaving}
                />
                <label htmlFor="isDefault" className="text-[#BEC3CA]">
                  Définir comme adresse par défaut
                </label>
              </div>
              
              {/* Boutons d'action */}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={cancelAddressForm}
                  className="px-4 py-2 border border-[#BEC3CA] text-[#BEC3CA] rounded hover:bg-[#00585d] hover:text-[#D1D5DB] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#007A72]"
                  disabled={isSaving}
                >
                  Annuler
                </button>
                
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 bg-[#007A72] text-[#D1D5DB] rounded hover:bg-[#059669] transition-colors disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#007A72]"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Sauvegarde en cours...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      Sauvegarder
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

