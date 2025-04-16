import React from 'react';

export const metadata = {
  title: 'Mentions légales | Chanvre Vert',
  description: 'Mentions légales et informations juridiques concernant le site Chanvre Vert.',
};

export default function LegalPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-emerald-800">Mentions Légales</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-emerald-700">Éditeur du site</h2>
        <p className="mb-2"><strong>Raison sociale :</strong> Chanvre Vert SAS</p>
        <p className="mb-2"><strong>Siège social :</strong> 123 Avenue du Chanvre, 75000 Paris, France</p>
        <p className="mb-2"><strong>Capital social :</strong> 10 000 €</p>
        <p className="mb-2"><strong>SIRET :</strong> 123 456 789 00012</p>
        <p className="mb-2"><strong>RCS :</strong> Paris B 123 456 789</p>
        <p className="mb-2"><strong>N° TVA Intracommunautaire :</strong> FR 12 123456789</p>
        <p className="mb-2"><strong>Directeur de la publication :</strong> Jean Dupont</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-emerald-700">Hébergement</h2>
        <p className="mb-2"><strong>Raison sociale :</strong> OVH SAS</p>
        <p className="mb-2"><strong>Siège social :</strong> 2 rue Kellermann, 59100 Roubaix, France</p>
        <p className="mb-2"><strong>Téléphone :</strong> +33 9 72 10 10 10</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-emerald-700">Informations légales sur les produits CBD</h2>
        <p className="mb-4">
          Conformément à la législation française, tous les produits commercialisés sur le site Chanvre Vert sont issus de variétés de chanvre autorisées, avec un taux de THC inférieur à 0,3% conformément à la réglementation européenne.
        </p>
        <p className="mb-4">
          Les produits CBD sont destinés à être utilisés légalement selon les recommandations fournies et ne doivent pas être détournés de leur usage.
        </p>
        <p className="mb-4">
          En conformité avec l'arrêté du 30 décembre 2021 portant application de l'article R. 5132-86 du code de la santé publique, la vente et l'achat de fleurs et de feuilles brutes de chanvre sous toutes leurs formes, seules ou en mélange avec d'autres ingrédients, sont autorisés uniquement pour la culture, l'importation, l'exportation et l'utilisation industrielle et commerciale.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-emerald-700">Propriété intellectuelle</h2>
        <p className="mb-4">
          L'ensemble des éléments constituant le site Chanvre Vert (textes, graphismes, logiciels, photographies, images, vidéos, sons, plans, logos, marques, etc.) est la propriété exclusive de Chanvre Vert SAS ou de ses partenaires. Ces éléments sont protégés par les lois relatives à la propriété intellectuelle.
        </p>
        <p className="mb-4">
          Toute reproduction, représentation, modification, publication, adaptation totale ou partielle des éléments du site, quel que soit le moyen ou le procédé utilisé, est interdite sans autorisation écrite préalable de Chanvre Vert SAS.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4 text-emerald-700">Contact juridique</h2>
        <p className="mb-2">
          Pour toute question relative aux mentions légales, vous pouvez nous contacter à l'adresse email suivante : juridique@chanvre-vert.fr
        </p>
      </div>
    </div>
  );
}
