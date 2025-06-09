'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface BankTransferData {
  bankAccountName: string;
  bankIban: string;
  bankBic: string;
  orderReference: string;
  orderAmount: number;
}

// Composant LoadingSpinner séparé
function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-[#001E27] text-[#F4F8F5] flex items-center justify-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#EFC368]"></div>
    </div>
  );
}

// Composant principal qui utilise useSearchParams
function BankTransferContent() {
  const searchParams = useSearchParams();
  const [bankData, setBankData] = useState<BankTransferData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer toutes les données nécessaires des paramètres d'URL
    const orderReference = searchParams.get('ref');
    const bankAccountName = searchParams.get('name');
    const bankIban = searchParams.get('iban');
    const bankBic = searchParams.get('bic');
    const amountStr = searchParams.get('amount');

    if (!orderReference || !bankAccountName || !bankIban || !bankBic || !amountStr) {
      setError('Informations bancaires incomplètes. Veuillez contacter notre service client.');
      setLoading(false);
      return;
    }

    // Convertir le montant en nombre
    const orderAmount = parseFloat(amountStr);
    if (isNaN(orderAmount)) {
      setError('Le montant de la commande est invalide. Veuillez contacter notre service client.');
      setLoading(false);
      return;
    }

    // Tout est OK, mettre à jour l'état
    setBankData({
      bankAccountName,
      bankIban,
      bankBic,
      orderReference,
      orderAmount
    });
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#001E27] text-[#F4F8F5] flex flex-col items-center justify-center p-4">
        <div className="bg-red-600/20 border border-red-600 rounded-lg p-6 max-w-2xl w-full">
          <h1 className="text-2xl font-bold mb-4">Erreur</h1>
          <p className="mb-6">{error}</p>
          <div className="flex flex-col space-y-4">
            <Link 
              href="/" 
              className="bg-[#EFC368] text-[#001E27] py-2 px-4 rounded-md font-medium text-center hover:bg-[#e6b958] transition-colors"
            >
              Retour à l&apos;accueil
            </Link>
            <Link 
              href="/contact" 
              className="bg-transparent border border-[#EFC368] text-[#EFC368] py-2 px-4 rounded-md font-medium text-center hover:bg-[#EFC368]/10 transition-colors"
            >
              Contacter le support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!bankData) {
    return null; // Ceci ne devrait jamais se produire grâce à notre logique ci-dessus
  }

  return (
    <div className="min-h-screen bg-[#001E27] text-[#F4F8F5] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-8">
          <div className="bg-[#03745C]/20 inline-flex items-center justify-center p-3 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#03745C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">Commande confirmée</h1>
          <p className="text-[#F4F8F5]/70">Votre commande a été enregistrée avec succès. Pour finaliser votre achat, veuillez effectuer un virement bancaire.</p>
        </div>

        {/* Instructions de paiement */}
        <div className="bg-[#002935] p-6 rounded-lg border border-[#3A4A4F] mb-6">
          <h2 className="text-xl font-bold mb-4">Instructions de paiement</h2>
          <p className="mb-6">Veuillez effectuer votre virement bancaire avec les informations suivantes :</p>
          
          <div className="space-y-6">
            {/* Référence de commande */}
            <div>
              <h3 className="text-sm uppercase text-[#EFC368] font-medium mb-1">Référence de commande</h3>
              <div className="bg-[#001E27] p-3 rounded-lg border border-[#3A4A4F] flex items-center justify-between">
                <span className="font-mono text-lg font-medium">{bankData.orderReference}</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(bankData.orderReference);
                    alert("Référence copiée !");
                  }}
                  className="text-[#EFC368] hover:text-[#e6b958] transition-colors text-sm px-3 py-1"
                >
                  Copier
                </button>
              </div>
              <p className="text-sm text-[#F4F8F5]/70 mt-1">Veuillez inclure cette référence dans le libellé de votre virement</p>
            </div>

            {/* Montant */}
            <div>
              <h3 className="text-sm uppercase text-[#EFC368] font-medium mb-1">Montant à payer</h3>
              <div className="bg-[#001E27] p-3 rounded-lg border border-[#3A4A4F]">
                <span className="font-mono text-lg font-medium">{bankData.orderAmount.toFixed(2)} €</span>
              </div>
            </div>

            {/* Informations bancaires */}
            <div>
              <h3 className="text-sm uppercase text-[#EFC368] font-medium mb-1">Coordonnées bancaires</h3>
              <div className="bg-[#001E27] p-4 rounded-lg border border-[#3A4A4F] space-y-3">
                <div>
                  <p className="text-sm text-[#F4F8F5]/70">Nom du compte</p>
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{bankData.bankAccountName}</p>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(bankData.bankAccountName);
                        alert("Nom du compte copié !");
                      }}
                      className="text-[#EFC368] hover:text-[#e6b958] transition-colors text-sm px-3 py-1"
                    >
                      Copier
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-[#F4F8F5]/70">IBAN</p>
                  <div className="flex items-center justify-between">
                    <p className="font-mono">{bankData.bankIban}</p>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(bankData.bankIban);
                        alert("IBAN copié !");
                      }}
                      className="text-[#EFC368] hover:text-[#e6b958] transition-colors text-sm px-3 py-1"
                    >
                      Copier
                    </button>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-[#F4F8F5]/70">Code BIC/SWIFT</p>
                  <div className="flex items-center justify-between">
                    <p className="font-mono">{bankData.bankBic}</p>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(bankData.bankBic);
                        alert("BIC copié !");
                      }}
                      className="text-[#EFC368] hover:text-[#e6b958] transition-colors text-sm px-3 py-1"
                    >
                      Copier
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notes importantes */}
        <div className="bg-[#002935] p-6 rounded-lg border border-[#3A4A4F] mb-6">
          <h2 className="text-xl font-bold mb-4">Informations importantes</h2>
          <ul className="list-disc list-inside space-y-2 text-[#F4F8F5]/85">
            <li>Votre commande sera traitée dès réception de votre paiement.</li>
            <li>N&apos;oubliez pas d&apos;inclure la référence de commande (<span className="font-medium">{bankData.orderReference}</span>) dans le libellé de votre virement.</li>
            <li>Les délais de transfert bancaire peuvent varier de 1 à 3 jours ouvrés.</li>
            <li>Un e-mail de confirmation vous sera envoyé dès que votre paiement sera validé.</li>
            <li>Pour toute question, n&apos;hésitez pas à contacter notre service client.</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
          <Link 
            href="/" 
            className="bg-[#EFC368] text-[#001E27] py-3 px-6 rounded-md font-medium text-center hover:bg-[#e6b958] transition-colors"
          >
            Retour à l&apos;accueil
          </Link>
          <Link 
            href="/contact" 
            className="bg-transparent border border-[#EFC368] text-[#EFC368] py-3 px-6 rounded-md font-medium text-center hover:bg-[#EFC368]/10 transition-colors"
          >
            Contacter le support
          </Link>
        </div>
      </div>
    </div>
  );
}

// Composant principal exporté avec Suspense boundary
export default function BankTransferConfirmationPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <BankTransferContent />
    </Suspense>
  );
}
