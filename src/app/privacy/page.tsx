import React from 'react';

export const metadata = {
  title: 'Politique de confidentialité | Chanvre Vert',
  description: 'Politique de confidentialité de Chanvre Vert, spécialiste du CBD en France',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6 text-center">Politique de Confidentialité</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Introduction</h2>
        <p className="mb-4">
          Chez Chanvre Vert, nous accordons une grande importance à la protection de vos données personnelles. 
          Cette politique de confidentialité vous informe de la manière dont nous collectons, utilisons et protégeons vos informations 
          lorsque vous utilisez notre site web et nos services.
        </p>
        <p className="mb-4">
          Cette politique est conforme au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Données collectées</h2>
        <p className="mb-4">Nous collectons les types de données suivants :</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Données d&apos;identification : nom, prénom, adresse email, etc.</li>
          <li>Données de commande : historique d&apos;achats, produits consultés</li>
          <li>Données de navigation : adresse IP, cookies, pages visitées</li>
        </ul>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Vos droits</h2>
        <p className="mb-4">
          Conformément à la réglementation, vous disposez des droits suivants :
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>Droit d&apos;accès à vos données</li>
          <li>Droit de rectification de vos données</li>
          <li>Droit à l&apos;effacement de vos données</li>
          <li>Droit à la portabilité de vos données</li>
          <li>Droit d&apos;opposition au traitement</li>
        </ul>
        <p className="mt-4">
          Pour toute question concernant vos données personnelles, contactez-nous à privacy@chanvre-vert.fr
        </p>
      </div>
    </div>
  );
}
