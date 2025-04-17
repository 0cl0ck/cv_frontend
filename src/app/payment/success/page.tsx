'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
// import { useRouter } from 'next/navigation'; // Pas nécessaire pour le moment

export default function PaymentSuccessPage() {
  // const router = useRouter(); // Pas nécessaire pour le moment
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer l'orderCode/transactionId depuis les paramètres d'URL ou sessionStorage
    const fetchOrderDetails = async () => {
      try {
        // Récupérer l'orderCode depuis les paramètres d'URL (dépend du retour de VivaWallet)
        const params = new URLSearchParams(window.location.search);
        const t = params.get('t'); // VivaWallet retourne 't' comme paramètre de transaction ID

        // Si pas de paramètre, vérifier dans sessionStorage
        const storedOrderNumber = sessionStorage.getItem('lastOrderNumber');
        
        if (t || storedOrderNumber) {
          // Utiliser l'ID de transaction pour vérifier le statut
          if (t) {
            // Appeler l'API pour vérifier la transaction
            const response = await fetch(`/api/payment/verify/${t}`);
            const data = await response.json();
            
            if (data.success && data.data) {
              setOrderNumber(data.data.orderCode || storedOrderNumber);
            } else {
              throw new Error('Impossible de vérifier le paiement');
            }
          } else {
            setOrderNumber(storedOrderNumber);
          }
        } else {
          throw new Error('Informations de commande non trouvées');
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des détails de commande:', err);
        setError('Nous n&apos;avons pas pu récupérer les détails de votre commande. Veuillez contacter notre service client.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-6 text-neutral-900 dark:text-white">
          Confirmation de votre commande...
        </h1>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-6 text-neutral-900 dark:text-white">
          Une erreur est survenue
        </h1>
        <p className="text-lg mb-8">{error}</p>
        <Link 
          href="/"
          className="inline-block bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-md font-medium transition-colors"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <div className="mb-6 text-green-500">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      
      <h1 className="text-3xl font-bold mb-6 text-neutral-900 dark:text-white">
        Votre commande a été validée !
      </h1>
      
      {orderNumber && (
        <p className="text-lg mb-4">
          Commande n° <span className="font-bold">{orderNumber}</span>
        </p>
      )}
      
      <p className="text-lg mb-8">
        Nous vous remercions pour votre achat. Vous recevrez prochainement un email de confirmation.
      </p>
      
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link 
          href="/"
          className="inline-block bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-md font-medium transition-colors"
        >
          Retour à l&apos;accueil
        </Link>
        
        <Link 
          href="/mon-compte/commandes"
          className="inline-block bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-900 px-6 py-3 rounded-md font-medium transition-colors"
        >
          Voir mes commandes
        </Link>
      </div>
    </div>
  );
}
