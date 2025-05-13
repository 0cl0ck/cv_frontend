import React from 'react';

const TestPaymentInfo: React.FC = () => {
  return (
    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mt-4 mb-4">
      <h3 className="text-lg font-semibold text-emerald-800 mb-2">🧪 Mode Test de Paiement</h3>
      <p className="text-sm text-gray-700 mb-2">
        Ce site utilise l&apos;environnement <strong>sandbox</strong> de VivaWallet pour les paiements.
        Pour tester un paiement, veuillez utiliser les informations de carte suivantes :
      </p>
      <div className="bg-white p-3 rounded border border-emerald-100 font-mono text-sm">
        <p><span className="font-semibold">Numéro :</span> 4111 1111 1111 1111</p>
        <p><span className="font-semibold">Date d&apos;expiration :</span> N&apos;importe quelle date future (ex: 12/30)</p>
        <p><span className="font-semibold">CVV :</span> N&apos;importe quel code à 3 chiffres (ex: 123)</p>
        <p><span className="font-semibold">Nom :</span> N&apos;importe quel nom</p>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Note: Les vraies cartes ne fonctionneront pas en mode test.
      </p>
    </div>
  );
};

export default TestPaymentInfo;
