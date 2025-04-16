import React from 'react';

export const metadata = {
  title: 'Conditions d\'utilisation | Chanvre Vert',
  description: 'Conditions d\'utilisation du site Chanvre Vert, spécialiste du CBD en France',
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6 text-center">Conditions d&apos;Utilisation</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Introduction</h2>
        <p className="mb-4">
          Bienvenue sur le site www.chanvre-vert.fr, édité par Chanvre Vert SAS.
        </p>
        <p className="mb-4">
          Les présentes conditions d&apos;utilisation régissent l&apos;utilisation de notre site web. 
          En accédant à ce site ou en l&apos;utilisant, vous acceptez d&apos;être lié par ces conditions.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Accès au site</h2>
        <p className="mb-4">
          Nous nous efforçons de maintenir le site accessible 24 heures sur 24 et 7 jours sur 7. 
          Toutefois, l&apos;accès au site peut être suspendu, limité ou interrompu à tout moment, 
          notamment pour des raisons de maintenance.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Législation française sur le CBD</h2>
        <p className="mb-4">
          En France, la vente de produits contenant du CBD est légale à condition que :
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Les produits contiennent du CBD extrait uniquement des fibres et des graines de chanvre</li>
          <li>La teneur en THC soit inférieure à 0,3% conformément à la réglementation européenne</li>
          <li>Les produits ne fassent pas l&apos;objet d&apos;allégations thérapeutiques non autorisées</li>
        </ul>
        <p className="mt-4">
          Tous les produits commercialisés par Chanvre Vert respectent strictement cette réglementation.
        </p>
      </div>
    </div>
  );
}
