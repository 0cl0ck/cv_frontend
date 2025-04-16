import React from 'react';

export const metadata = {
  title: 'À propos | Chanvre Vert',
  description: 'À propos de Chanvre Vert, spécialiste du CBD en France',
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6 text-center">À propos de Chanvre Vert</h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <p className="mb-4">
          Chanvre Vert est une entreprise française spécialisée dans la distribution de produits CBD de haute qualité.
        </p>
        <p className="mb-4">
          Nous sélectionnons rigoureusement nos produits pour vous garantir une qualité optimale, conformément à la législation française.
        </p>
        <p>
          Tous nos produits respectent la réglementation européenne avec un taux de THC inférieur à 0,3%.
        </p>
      </div>
    </div>
  );
}
