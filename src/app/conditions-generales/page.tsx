import React from 'react';
import { generatePageMetadata } from '@/lib/metadata';

export const metadata = generatePageMetadata({
  title: 'Conditions Générales de Vente',
  description: 'Conditions générales de vente du site Chanvre Vert, spécialiste du CBD en France',
  path: '/conditions-generales',
});

export default function ConditionsGeneralesPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6 text-center">Conditions Générales de Vente</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Article 1 - Objet et champ d&apos;application</h2>
        <p className="mb-4">
          Les présentes conditions générales de vente (CGV) régissent les ventes de produits à base de CBD effectuées par la société Chanvre Vert SAS, 
          au capital de 10 000 €, dont le siège social est situé 123 Avenue du Chanvre, 75000 Paris, France.
        </p>
        <p className="mb-4">
          Ces CGV sont applicables à toute commande passée sur le site internet www.chanvre-vert.fr par toute personne 
          physique majeure agissant en tant que consommateur.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Article 2 - Produits</h2>
        <p className="mb-4">
          Les produits proposés à la vente sont ceux qui figurent sur le Site, avec une description de leurs caractéristiques essentielles, 
          dans la limite des stocks disponibles.
        </p>
        <p className="mb-4">
          Conformément à la législation française, tous les produits commercialisés par Chanvre Vert sont issus de variétés de cannabis autorisées 
          et contiennent un taux de THC inférieur à 0,3% conformément à la réglementation européenne.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Article 3 - Prix</h2>
        <p className="mb-4">
          Les prix des produits sont indiqués en euros toutes taxes comprises (TTC), hors frais de livraison.
        </p>
        <p className="mb-4">
          Les frais de livraison sont indiqués avant la validation de la commande. Ils varient selon le mode de livraison choisi et la destination.
        </p>
      </div>
    </div>
  );
}
