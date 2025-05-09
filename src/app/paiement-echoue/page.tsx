'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Component that uses useSearchParams hook wrapped in its own client component
function PaymentFailureContent() {
  const searchParams = useSearchParams();
  const [errorInfo, setErrorInfo] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer les informations d'erreur des paramètres d'URL
    const errorCode = searchParams.get('errorCode');
    const errorMessage = searchParams.get('errorMessage');
    const orderCode = searchParams.get('orderCode') || searchParams.get('t');
    
    let message = 'Une erreur est survenue lors du traitement de votre paiement.';
    
    if (errorMessage) {
      message += ` Message d'erreur: ${errorMessage}`;
    }
    
    if (errorCode) {
      message += ` Code d'erreur: ${errorCode}`;
    }
    
    if (orderCode) {
      message += ` Référence de transaction: ${orderCode}`;
    }
    
    setErrorInfo(message);
  }, [searchParams]);
  
  return (
    <>
      <div className="bg-red-900 bg-opacity-25 border border-red-800 text-red-300 px-6 py-4 rounded-lg mb-8">
        <p className="font-medium">Le paiement n&apos;a pas pu être effectué</p>
        {errorInfo && <p className="mt-2">{errorInfo}</p>}
      </div>
      
      <div className="bg-[#00424A] border border-[#155757] p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4 text-[#BEC3CA]">Que faire maintenant ?</h2>
        <ul className="list-disc pl-6 space-y-2 text-[#BEC3CA]">
          <li>Vérifiez que les informations de votre carte bancaire sont correctes</li>
          <li>Assurez-vous que votre carte est active et autorisée pour les paiements en ligne</li>
          <li>Vérifiez que vous disposez des fonds suffisants sur votre compte</li>
          <li>Essayez avec une autre carte bancaire si possible</li>
          <li>Si le problème persiste, contactez votre banque ou notre service client</li>
        </ul>
      </div>
      
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
        <Link href="/panier"
          className="bg-[#007A72] hover:bg-[#059669] text-white px-6 py-3 rounded-md font-medium transition-colors">
          Retourner au panier
        </Link>
        <Link href="/contact"
          className="bg-[#00424A] hover:bg-[#155757] text-[#10B981] border border-[#155757] px-6 py-3 rounded-md font-medium transition-colors">
          Contacter le support
        </Link>
      </div>
    </>
  );
}

export default function PaymentFailurePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#001A1F] px-4 py-12">
      <div className="w-full max-w-2xl bg-[#002930] rounded-lg shadow-md p-8 border border-[#155757]">
        <h1 className="text-3xl font-bold text-red-400 text-center mb-8">Paiement échoué</h1>
        
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 border-t-4 border-red-400 border-solid rounded-full animate-spin mb-4"></div>
            <p className="text-lg text-[#BEC3CA]">Chargement...</p>
          </div>
        }>
          <PaymentFailureContent />
        </Suspense>
      </div>
    </div>
  );
}
