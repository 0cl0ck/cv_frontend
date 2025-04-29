'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Type pour les informations de l'utilisateur
type UserInfo = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
};

// Page de tableau de bord client
export default function DashboardPage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [orders, setOrders] = useState([]);
  const router = useRouter();

  // Vérifier si l'utilisateur est connecté et récupérer les informations de l'utilisateur
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
      <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">Chargement de votre espace client...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100 dark:bg-neutral-900 px-4">
        <div className="w-full max-w-md bg-white dark:bg-neutral-800 rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Accès non autorisé</h1>
          <p className="mb-4">Vous devez être connecté pour accéder à cette page.</p>
          <Link href="/connexion" className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors">
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-100 dark:bg-neutral-900 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Bienvenue, {user.firstName} !</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="col-span-1">
              <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-3">Informations personnelles</h2>
                <div className="space-y-2">
                  <p><span className="font-medium">Nom :</span> {user.lastName}</p>
                  <p><span className="font-medium">Prénom :</span> {user.firstName}</p>
                  <p><span className="font-medium">Email :</span> {user.email}</p>
                  <p><span className="font-medium">Membre depuis :</span> {new Date(user.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="mt-4">
                  <Link href="/compte/modifier" className="text-sm text-green-600 hover:text-green-500">
                    Modifier mes informations
                  </Link>
                </div>
              </div>
            </div>
            
            <div className="col-span-2">
              <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-4 h-full">
                <h2 className="text-lg font-semibold mb-3">Actions rapides</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link href="/compte/commandes" className="bg-white dark:bg-neutral-600 p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                    <h3 className="font-medium mb-1">Mes commandes</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-300">Consultez l&apos;historique de vos commandes</p>
                  </Link>
                  
                  <Link href="/compte/adresses" className="bg-white dark:bg-neutral-600 p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                    <h3 className="font-medium mb-1">Mes adresses</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-300">Gérez vos adresses de livraison</p>
                  </Link>
                  
                  <Link href="/panier" className="bg-white dark:bg-neutral-600 p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                    <h3 className="font-medium mb-1">Mon panier</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-300">Accédez à votre panier</p>
                  </Link>
                  
                  <Link href="/contact" className="bg-white dark:bg-neutral-600 p-4 rounded-lg shadow hover:shadow-md transition-shadow">
                    <h3 className="font-medium mb-1">Besoin d&apos;aide ?</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-300">Contactez notre service client</p>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold mb-4">Mes dernières commandes</h2>
          
          {orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Commande</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Statut</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-neutral-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {/* Les commandes seront affichées ici lorsque l'API sera implémentée */}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">Vous n&apos;avez pas encore passé de commande.</p>
              <Link href="/produits" className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline transition-colors">
                Découvrir nos produits
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
