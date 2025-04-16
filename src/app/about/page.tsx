import React from 'react';

export const metadata = {
  title: 'À propos de Chanvre Vert | Produits CBD de Qualité',
  description: 'Découvrez l\'histoire, la mission et les valeurs de Chanvre Vert, votre spécialiste français de produits CBD de haute qualité.',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-emerald-800">À propos de Chanvre Vert</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-emerald-700">Notre Histoire</h2>
        <p className="mb-4">
          Fondée en 2022, Chanvre Vert est née d'une passion pour les bienfaits naturels du CBD et d'une volonté de proposer des produits de qualité supérieure aux consommateurs français.
        </p>
        <p className="mb-4">
          Notre équipe de passionnés a parcouru la France à la recherche des meilleurs producteurs de chanvre, sélectionnés pour leur engagement envers des méthodes de culture durables et respectueuses de l'environnement.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-emerald-700">Notre Mission</h2>
        <p className="mb-4">
          Chez Chanvre Vert, notre mission est de démocratiser l'accès à des produits CBD de haute qualité, tout en éduquant le public sur leurs bienfaits potentiels et leur utilisation responsable.
        </p>
        <p className="mb-4">
          Nous nous engageons à offrir uniquement des produits conformes à la législation française, avec un taux de THC inférieur à 0,3%, comme l'exige la réglementation européenne.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold mb-4 text-emerald-700">Nos Valeurs</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li><span className="font-medium text-emerald-600">Qualité</span> : Nous sélectionnons rigoureusement chaque produit pour garantir une expérience optimale.</li>
          <li><span className="font-medium text-emerald-600">Transparence</span> : Tous nos produits sont accompagnés d'analyses détaillées et de certifications.</li>
          <li><span className="font-medium text-emerald-600">Durabilité</span> : Nous privilégions les producteurs engagés dans une agriculture responsable.</li>
          <li><span className="font-medium text-emerald-600">Éducation</span> : Nous partageons régulièrement des informations fiables sur le CBD et ses usages.</li>
          <li><span className="font-medium text-emerald-600">Service client</span> : Notre équipe est à votre disposition pour vous conseiller et répondre à vos questions.</li>
        </ul>
      </div>
    </div>
  );
}
