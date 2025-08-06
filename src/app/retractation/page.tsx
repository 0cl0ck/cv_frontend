import React from 'react';

export const metadata = {
  title: 'Formulaire de Rétractation | Chanvre Vert',
  description: 'Exercez votre droit de rétractation pour une commande Chanvre Vert.',
};

export default function RetractationPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-gray-50">
      <h1 className="text-3xl font-bold mb-6 text-center">Formulaire de Rétractation</h1>

      <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <p className="mb-4">
          Conformément à l&apos;article L. 221-18 du Code de la consommation, vous disposez d&apos;un délai de 14 jours à compter de la réception de votre commande pour exercer votre droit de rétractation sans avoir à justifier de motifs ni à payer de pénalités.
        </p>
        <p>
          Veuillez compléter et renvoyer ce formulaire uniquement si vous souhaitez vous rétracter de votre commande. Nous vous conseillons de nous l&apos;envoyer par e-mail à <a href="mailto:contact@chanvre-vert.fr" className="text-green-600 hover:underline">contact@chanvre-vert.fr</a>.
        </p>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-md p-8">
        <h2 className="text-xl font-semibold mb-4">À l&apos;attention de :</h2>
        <p className="mb-1"><strong>Chanvre Vert (Hugo Dewas EI)</strong></p>
        <p className="mb-1">5 rue d&apos;Ypres</p>
        <p className="mb-6">59380 Bergues, France</p>

        <h2 className="text-xl font-semibold mb-4">Détails de la rétractation</h2>
        <p className="mb-4">Je/nous (*) vous notifie/notifions (*) par la présente ma/notre (*) rétractation du contrat portant sur la vente du bien (*)/pour la prestation de services (*) ci-dessous :</p>

        <div className="space-y-4">
          <div>
            <label htmlFor="order-number" className="block text-sm font-medium mb-1">Numéro de commande :</label>
            <input type="text" id="order-number" className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-gray-50" placeholder="Ex: CV-2024-0123" />
          </div>
          <div>
            <label htmlFor="order-date" className="block text-sm font-medium mb-1">Commandé le (*)/reçu le (*) :</label>
            <input type="date" id="order-date" className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-gray-50" />
          </div>
          <div>
            <label htmlFor="customer-name" className="block text-sm font-medium mb-1">Nom du/des consommateur(s) :</label>
            <input type="text" id="customer-name" className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-gray-50" />
          </div>
          <div>
            <label htmlFor="customer-address" className="block text-sm font-medium mb-1">Adresse du/des consommateur(s) :</label>
            <textarea id="customer-address" rows={3} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-gray-50"></textarea>
          </div>
        </div>

        <div className="mt-6">
          <p className="mb-2"><strong>Date :</strong></p>
          <p className="mb-4">[Date du jour]</p>
          <p className="text-xs text-gray-400">(*) Rayer la mention inutile.</p>
        </div>

        <div className="mt-8 text-center">
            <p className="text-sm text-gray-300">Ce formulaire est un modèle. Vous pouvez également nous notifier votre décision par toute autre déclaration dénuée d&apos;ambiguïté.</p>
        </div>
      </div>
    </div>
  );
}
