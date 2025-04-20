'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface PaymentStatus {
  status: string;
  orderId?: string;
  orderNumber?: string;
  amount?: number;
}

// Component that uses useSearchParams hook wrapped in its own client component
function PaymentContent() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState<PaymentStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verifyPayment() {
      try {
        // Récupérer le transactionId des paramètres d'URL (paramètre 't')
        const transactionId = searchParams.get('t');
        
        if (!transactionId) {
          setError('Référence de transaction manquante');
          setIsLoading(false);
          return;
        }

        // URL de l'API de vérification du paiement - corriger le port et le chemin
        // Attention : le chemin correct est /api/payment/verify
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        console.log(`Vérification du paiement avec l'URL: ${API_URL}/api/payment/verify/${transactionId}`);
        const response = await fetch(`${API_URL}/api/payment/verify/${transactionId}`, {
          cache: 'no-store',
          mode: 'cors' // Explicitement demander le mode CORS
        });

        if (!response.ok) {
          throw new Error(`Erreur de vérification: ${response.status}`);
        }

        const data = await response.json();
        setPaymentInfo(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Erreur lors de la vérification du paiement:', error);
        setError('Une erreur est survenue lors de la vérification du paiement');
        setIsLoading(false);
      }
    }

    verifyPayment();
  }, [searchParams]);
  
  return (
    <>
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <div className="w-16 h-16 border-t-4 border-green-500 border-solid rounded-full animate-spin mb-4"></div>
          <p className="text-lg text-gray-600">Vérification de votre paiement...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
          <p className="font-medium">{error}</p>
          <p className="mt-2">Vous pouvez contacter notre service client pour plus d&apos;informations.</p>
        </div>
      ) : paymentInfo && paymentInfo.status === 'paid' ? (
        <>
          <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-lg mb-6">
            <p className="font-medium">Votre paiement a été confirmé !</p>
            {paymentInfo.orderNumber && (
              <p className="mt-2">Numéro de commande: <span className="font-bold">{paymentInfo.orderNumber}</span></p>
            )}
            {paymentInfo.amount && (
              <p className="mt-1">Montant payé: <span className="font-bold">{paymentInfo.amount.toFixed(2)} €</span></p>
            )}
          </div>
          
          <p className="text-gray-600 mb-8 text-center">
            Nous avons envoyé un email de confirmation à l&apos;adresse fournie lors de votre commande.
            Vous pouvez suivre l&apos;état de votre commande depuis votre compte client.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link href="/"
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md font-medium transition-colors">
              Retour à l&apos;accueil
            </Link>
            {paymentInfo.orderId && (
              <Link href={`/mon-compte/commandes/${paymentInfo.orderId}`}
                className="bg-white hover:bg-gray-100 text-green-700 border border-green-600 px-6 py-3 rounded-md font-medium transition-colors">
                Voir ma commande
              </Link>
            )}
          </div>
        </>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-6 py-4 rounded-lg mb-6">
          <p className="font-medium">État du paiement: {paymentInfo?.status || 'inconnu'}</p>
          <p className="mt-2">
            Si vous avez été débité mais que votre commande n&apos;apparaît pas comme payée,
            veuillez nous contacter en précisant le code suivant: {searchParams.get('orderCode') || searchParams.get('t')}
          </p>
        </div>
      )}
    </>
  );
}

export default function PaymentSuccessPage() {

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-green-700 text-center mb-8">Paiement réussi</h1>
        
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 border-t-4 border-green-500 border-solid rounded-full animate-spin mb-4"></div>
            <p className="text-lg text-gray-600">Chargement...</p>
          </div>
        }>
          <PaymentContent />
        </Suspense>
      </div>
    </div>
  );
}
