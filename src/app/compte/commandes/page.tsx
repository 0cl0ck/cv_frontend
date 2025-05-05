'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Calendar, ChevronLeft, Package } from 'lucide-react';

// Type pour les informations de commande
type Order = {
  id: string;
  orderNumber: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus?: string;
  subtotal: number;
  shipping?: {
    method: string;
    cost: number;
    freeShippingThreshold?: number;
  };
  total: number;
  items: {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    imageUrl?: string;
  }[];
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

// Fonction pour formater le prix
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price);
};

// Fonction pour obtenir la couleur et le libellé du statut
const getStatusInfo = (status: Order['status']) => {
  switch (status) {
    case 'pending':
      return { color: 'bg-yellow-500', text: 'En attente' };
    case 'processing':
      return { color: 'bg-blue-500', text: 'En préparation' };
    case 'shipped':
      return { color: 'bg-indigo-500', text: 'Expédiée' };
    case 'delivered':
      return { color: 'bg-green-500', text: 'Livrée' };
    case 'cancelled':
      return { color: 'bg-red-500', text: 'Annulée' };
    default:
      return { color: 'bg-gray-500', text: 'Statut inconnu' };
  }
};

// Page de commandes client
export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const router = useRouter();

  // Chargement des commandes de l'utilisateur
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Récupérer le token d'authentification
        const cookies = document.cookie.split(';');
        const authCookie = cookies.find(cookie => cookie.trim().startsWith('payload-token='));
        
        if (!authCookie) {
          setError('Session expirée. Veuillez vous reconnecter.');
          setLoading(false);
          return;
        }
        
        const token = authCookie.split('=')[1]?.trim();
        
        // Appel à l'API avec le token dans l'en-tête Authorization
        const response = await fetch('/api/orders/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'  // Pour s'assurer que les cookies sont aussi envoyés
        });
        
        if (response.status === 401) {
          setError('Session expirée. Veuillez vous reconnecter.');
          setLoading(false);
          return;
        }
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des commandes');
        }
        
        const data = await response.json();
        
        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
        } else {
          // Si pas de commandes trouvées, on initialise avec un tableau vide
          setOrders([]);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Erreur lors de la récupération des commandes:', err);
        setError('Une erreur est survenue lors de la récupération de vos commandes. Veuillez réessayer plus tard.');
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  // Fonction pour basculer l'affichage des détails d'une commande
  const toggleOrderDetails = (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };
  
  // La fonction downloadInvoice a été supprimée pour simplifier l'interface

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#00424A]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00AB55] mx-auto"></div>
          <p className="mt-4 text-[#D1D5DB]">Chargement de vos commandes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#00424A] min-h-screen py-10">
      <div className="container mx-auto px-4 space-y-8 max-w-7xl">
        {/* Header - Navigation et titre */}
        <div className="bg-[#002B33] rounded-lg p-6 shadow-md">
          <div className="flex items-center mb-4">
            <Link href="/compte" className="text-[#10B981] hover:text-[#059669] flex items-center">
              <ChevronLeft size={20} />
              <span className="ml-1">Retour au tableau de bord</span>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-[#D1D5DB]">Mes commandes</h1>
          <p className="text-[#BEC3CA]">Historique et suivi de toutes vos commandes</p>
        </div>
        
        {/* Contenu principal */}
        <div className="bg-[#002B33] rounded-lg p-6 shadow-md">
          {error ? (
            <div className="bg-red-900 bg-opacity-25 text-red-300 px-6 py-4 rounded-md mb-6">
              <p>{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-2 text-sm underline hover:text-red-200"
              >
                Réessayer
              </button>
            </div>
          ) : null}
          
          {orders.length > 0 ? (
            <div className="space-y-6">
              {orders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                const isExpanded = expandedOrder === order.id;
                
                return (
                  <div key={order.id} className="bg-[#00424c] rounded-lg overflow-hidden shadow-sm">
                    {/* En-tête de la commande */}
                    <div 
                      className="p-4 cursor-pointer hover:bg-[#005866] transition-colors"
                      onClick={() => toggleOrderDetails(order.id)}
                    >
                      {/* Mobile layout */}
                      <div className="sm:hidden">
                        <div className="flex items-start">
                          <div className="p-2 mr-3 bg-[#002B33] rounded-md self-start">
                            <Package size={20} className="text-[#10B981]" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium text-[#D1D5DB]">Commande {order.orderNumber}</h3>
                            <p className="text-sm text-[#BEC3CA] mb-2">{formatDate(order.date)}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium text-white ${statusInfo.color}`}>
                                {statusInfo.text}
                              </span>
                              <span className="font-medium text-[#D1D5DB]">{formatPrice(order.total)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Desktop layout */}
                      <div className="hidden sm:flex sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex sm:flex-row sm:items-center gap-4">
                          <div className="inline-flex p-2 bg-[#002B33] rounded-md">
                            <Package size={20} className="text-[#10B981]" />
                          </div>
                          <div>
                            <h3 className="font-medium text-[#D1D5DB]">Commande {order.orderNumber}</h3>
                            <p className="text-sm text-[#BEC3CA]">{formatDate(order.date)}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium text-white ${statusInfo.color}`}>
                              {statusInfo.text}
                            </span>
                          </div>
                          <div className="font-medium text-[#D1D5DB]">
                            {formatPrice(order.total)}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Détails de la commande (visible uniquement si développé) */}
                    {isExpanded && (
                      <div className="p-4 border-t border-[#1D5754] bg-[#002B33]">
                        <h4 className="text-sm font-medium text-[#BEC3CA] mb-3">Détails de la commande</h4>
                        
                        {/* Vue mobile */}
                        <div className="sm:hidden space-y-6">
                          {/* Articles de la commande en vue mobile */}
                          {order.items.map((item, index) => (
                            <div key={`${order.id}-item-mobile-${index}`} className="bg-[#1D5754] p-3 rounded-md">
                              <div className="flex justify-between items-start mb-2">
                                <div className="font-medium text-[#D1D5DB] pr-2">{item.name}</div>
                                <div className="text-[#D1D5DB] font-medium">
                                  {formatPrice(item.price * item.quantity)}
                                </div>
                              </div>
                              <div className="flex justify-between text-sm text-[#BEC3CA]">
                                <div>Quantité: {item.quantity}</div>
                                <div>Prix unitaire: {formatPrice(item.price)}</div>
                              </div>
                            </div>
                          ))}
                          
                          {/* Résumé financier en vue mobile */}
                          <div className="bg-[#00424A] p-4 rounded-md mt-4 space-y-2">
                            <div className="flex justify-between items-center py-1">
                              <span className="text-sm text-[#BEC3CA]">Sous-total</span>
                              <span className="text-sm text-[#D1D5DB]">{formatPrice(order.subtotal)}</span>
                            </div>
                            
                            <div className="flex justify-between items-center py-1">
                              <span className="text-sm text-[#BEC3CA]">
                                Frais de livraison
                                {order.shipping?.cost === 0 && <span className="ml-1 text-[#10B981]">(Offerts)</span>}
                              </span>
                              <span className="text-sm text-[#D1D5DB]">{formatPrice(order.shipping?.cost || 0)}</span>
                            </div>
                            
                            <div className="flex justify-between items-center pt-3 border-t border-[#1D5754]">
                              <span className="text-base font-bold text-[#BEC3CA]">Total</span>
                              <span className="text-base font-bold text-[#D1D5DB]">{formatPrice(order.total)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Vue desktop avec tableau */}
                        <div className="hidden sm:block">
                          <div className="rounded-md overflow-hidden">
                            <table className="min-w-full divide-y divide-[#0A3A3A]">
                              <thead className="bg-[#00424A]">
                                <tr>
                                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-[#BEC3CA] uppercase tracking-wider">Produit</th>
                                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-[#BEC3CA] uppercase tracking-wider">Quantité</th>
                                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-[#BEC3CA] uppercase tracking-wider">Prix unitaire</th>
                                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-[#BEC3CA] uppercase tracking-wider">Total</th>
                                </tr>
                              </thead>
                              <tbody className="bg-[#1D5754] divide-y divide-[#0A3A3A]">
                                {order.items.map((item, index) => (
                                  <tr key={`${order.id}-item-${index}`}>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                      <div className="flex items-center">
                                        {item.imageUrl && (
                                          <div className="flex-shrink-0 h-10 w-10 rounded bg-[#00424A] mr-3">
                                            {/* Si vous avez les images, décommentez cette ligne et supprimez le div ci-dessus */}
                                            {/* <img className="h-10 w-10 rounded object-cover" src={item.imageUrl} alt={item.name} /> */}
                                          </div>
                                        )}
                                        <div className="text-sm font-medium text-[#D1D5DB]">{item.name}</div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[#D1D5DB]">
                                      {item.quantity}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[#D1D5DB]">
                                      {formatPrice(item.price)}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-[#D1D5DB]">
                                      {formatPrice(item.price * item.quantity)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot className="bg-[#00424A]">
                                <tr>
                                  <td colSpan={3} className="px-4 py-2 text-right text-sm font-medium text-[#BEC3CA]">Sous-total</td>
                                  <td className="px-4 py-2 text-sm font-medium text-[#D1D5DB]">{formatPrice(order.subtotal)}</td>
                                </tr>
                                <tr>
                                  <td colSpan={3} className="px-4 py-2 text-right text-sm font-medium text-[#BEC3CA]">
                                    Frais de livraison
                                    {order.shipping?.cost === 0 && <span className="ml-1 text-[#10B981]">(Offerts)</span>}
                                  </td>
                                  <td className="px-4 py-2 text-sm font-medium text-[#D1D5DB]">{formatPrice(order.shipping?.cost || 0)}</td>
                                </tr>
                                <tr>
                                  <td colSpan={3} className="px-4 py-2 text-right text-sm font-bold text-[#BEC3CA]">Total</td>
                                  <td className="px-4 py-2 text-sm font-bold text-[#D1D5DB]">{formatPrice(order.total)}</td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <Calendar size={48} className="text-[#10B981] mx-auto mb-4" />
              <p className="text-[#BEC3CA] mb-6">Vous n&apos;avez pas encore passé de commande.</p>
              <Link href="/produits" 
                className="inline-block bg-[#007A72] hover:bg-[#059669] text-[#D1D5DB] font-medium py-2 px-6 rounded-md transition-colors">
                Découvrir nos produits
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
