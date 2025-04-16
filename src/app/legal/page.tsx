import React from 'react';

export const metadata = {
  title: 'Mentions légales | Chanvre Vert',
  description: 'Mentions légales de Chanvre Vert, spécialiste du CBD en France',
};

export default function LegalPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6 text-center">Mentions Légales</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Éditeur du site</h2>
        <p className="mb-2"><span className="font-medium">Raison sociale :</span> Chanvre Vert SAS</p>
        <p className="mb-2"><span className="font-medium">Siège social :</span> 123 Avenue du Chanvre, 75000 Paris</p>
        <p className="mb-2"><span className="font-medium">Capital social :</span> 10 000 €</p>
        <p className="mb-2"><span className="font-medium">SIRET :</span> 123 456 789 00012</p>
        <p className="mb-2"><span className="font-medium">Directeur de la publication :</span> Jean Dupont</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Hébergement</h2>
        <p className="mb-2"><span className="font-medium">Raison sociale :</span> OVH SAS</p>
        <p className="mb-2"><span className="font-medium">Siège social :</span> 2 rue Kellermann, 59100 Roubaix</p>
        <p className="mb-2"><span className="font-medium">Téléphone :</span> +33 9 72 10 10 10</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Informations légales sur les produits CBD</h2>
        <p className="mb-4">
          Conformément à la législation française, tous les produits commercialisés sur le site Chanvre Vert sont issus de variétés de chanvre autorisées, avec un taux de THC inférieur à 0,3% conformément à la réglementation européenne.
        </p>
      </div>
    </div>
  );
}
