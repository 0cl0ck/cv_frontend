'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { secureLogger as logger } from '@/utils/logger';
import { httpClient } from '@/lib/httpClient';

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
        // Récupérer les paramètres des paramètres d'URL
        const transactionId = searchParams.get('t');
        const orderCode = searchParams.get('s');
        
        if (!transactionId && !orderCode) {
          setError('Références de transaction manquantes');
          setIsLoading(false);
          return;
        }

        // Déterminer le segment de chemin à utiliser (préférer orderCode, sinon utiliser transactionId)
        const pathSegment = orderCode || transactionId || 'default';
        
        // Paramètres pour la requête
        const params: Record<string, string> = {};
        if (transactionId) params.t = transactionId;
        if (orderCode) params.s = orderCode;
        
        logger.debug(`[TEST-PAIEMENT] Vérification de paiement pour: ${pathSegment}`);
        
        const response = await httpClient.get(`/payment/verify/${pathSegment}`, {
          params
        });

        // Avec axios/httpClient, les données sont déjà dans response.data
        const data = response.data;
        logger.debug('[TEST-PAIEMENT] Statut reçu', { status: data.status });
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
          <div className="w-16 h-16 border-t-4 border-[#10B981] border-solid rounded-full animate-spin mb-4"></div>
          <p className="text-lg text-[#BEC3CA]">Vérification de votre paiement...</p>
        </div>
      ) : error ? (
        <div className="bg-red-900 bg-opacity-25 border border-red-800 text-red-300 px-6 py-4 rounded-lg mb-6">
          <p className="font-medium">{error}</p>
          <p className="mt-2">Vous pouvez contacter notre service client pour plus d&apos;informations.</p>
        </div>
      ) : paymentInfo && paymentInfo.status === 'paid' ? (
        <>
          <div className="bg-green-900 bg-opacity-25 border border-[#059669] text-[#10B981] px-6 py-4 rounded-lg mb-6">
            <p className="font-medium">Votre paiement a été confirmé !</p>
            {paymentInfo.orderNumber && (
              <p className="mt-2">Numéro de commande: <span className="font-bold">{paymentInfo.orderNumber}</span></p>
            )}
          </div>
          
          <p className="text-[#BEC3CA] mb-8 text-center">
            Merci d&apos;avoir commandé chez Chanvre Vert! <br /> 
            Vous recevrez votre commande dans les plus brefs délais. <br /><br />
            Un email de confirmation contenant tous les détails de votre commande a été envoyé à votre adresse email.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link href="/"
              className="bg-[#007A72] hover:bg-[#059669] text-white px-6 py-3 rounded-md font-medium transition-colors">
              Retour à l&apos;accueil
            </Link>
            {paymentInfo.orderId && (
              <Link href={`/compte/commandes/${paymentInfo.orderId}`}
                className="bg-[#00424A] hover:bg-[#155757] text-[#10B981] border border-[#155757] px-6 py-3 rounded-md font-medium transition-colors">
                Voir ma commande
              </Link>
            )}
          </div>
        </>
      ) : (
        <div className="bg-yellow-900 bg-opacity-25 border border-yellow-800 text-yellow-300 px-6 py-4 rounded-lg mb-6">
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
    <div className="min-h-screen flex items-center justify-center bg-[#001A1F] px-4 py-12">
      <div className="w-full max-w-2xl bg-[#002930] rounded-lg shadow-md p-8 border border-[#155757]">
        <h1 className="text-3xl font-bold text-[#10B981] text-center mb-8">Paiement réussi</h1>
        
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 border-t-4 border-[#10B981] border-solid rounded-full animate-spin mb-4"></div>
            <p className="text-lg text-[#BEC3CA]">Chargement...</p>
          </div>
        }>
          <PaymentContent />
        </Suspense>
      </div>
    </div>
  );
}
