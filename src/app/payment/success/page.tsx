'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
// import { useRouter } from 'next/navigation'; // Pas nécessaire pour le moment

export default function PaymentSuccessPage() {
  // const router = useRouter(); // Pas nécessaire pour le moment
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer l'orderCode/transactionId depuis les paramètres d'URL ou sessionStorage
    const fetchOrderDetails = async () => {
      try {
        // Récupérer l'orderCode depuis les paramètres d'URL (plusieurs possibilités)
        const params = new URLSearchParams(window.location.search);
        const o = params.get('o'); // Notre paramètre personnalisé ajouté dans l'URL de redirection - PRIORITAIRE
        const t = params.get('t'); // VivaWallet retourne 't' comme paramètre de transaction ID (fallback)
        
        console.log('Paramètres URL:', { o, t });
        
        if (o || t) {
          // Priorité 1: Utiliser directement le paramètre 'o' s'il existe
          if (o) {
            setOrderNumber(o);
          // Priorité 2: Utiliser l'ID de transaction 't' pour vérifier le statut
          } else if (t) {
            try {
              // Appeler l'API pour vérifier la transaction
              const response = await fetch(`/api/payment/verify/${t}`);
              
              if (!response.ok) {
                throw new Error(`Erreur API: ${response.status}`);
              }
              
              const data = await response.json();
              console.log('Réponse API payment/verify:', data); // Pour débogage
              
              // Extraire l'orderCode en fonction de la structure réelle renvoyée par l'API
              let orderCode = null;
              if (data.success) {
                if (data.data?.orderCode) {
                  orderCode = data.data.orderCode;
                } else if (data.data?.orderNumber) {
                  orderCode = data.data.orderNumber;
                } else if (data.orderCode) {
                  orderCode = data.orderCode;
                }
              }
              
              // Pas besoin de vérifier o ici car on l'a déjà vérifié en premier
              
              if (orderCode) {
                setOrderNumber(orderCode);
              } else {
                throw new Error('Référence de commande non trouvée dans la réponse');
              }
            } catch (error) {
              console.error('Erreur lors de la vérification du paiement:', error);
              throw new Error('Impossible de vérifier le paiement');
            }
          }
        } else {
          throw new Error('Informations de commande non trouvées');
        }
      } catch (err) {
        console.error('Erreur lors de la récupération des détails de commande:', err);
        // Nous ne mettons plus d'erreur, juste un numéro de commande null
        // cela permettra d'afficher le message rassurant au lieu d'une page d'erreur
        setOrderNumber(null);
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
      
      {orderNumber ? (
        <p className="text-lg mb-4">
          Commande n° <span className="font-bold">{orderNumber}</span>
        </p>
      ) : (
        <div className="mb-4">
          <p className="text-lg">
            Votre commande a bien été enregistrée et sera traitée très prochainement.
          </p>
          <p className="text-base mt-2">
            Pour des raisons techniques, le numéro de commande n&apos;est pas visible immédiatement.
            Vous le recevrez par email dans la confirmation qui vous sera envoyée.
          </p>
        </div>
      )}
      
      <p className="text-lg mb-8">
        Nous vous remercions pour votre achat. Vous recevrez prochainement un email de confirmation avec tous les détails de votre commande.
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
