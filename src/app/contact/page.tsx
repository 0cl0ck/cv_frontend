import React from 'react';

export const metadata = {
  title: 'Contact | Chanvre Vert',
  description: 'Contactez Chanvre Vert, spécialiste du CBD en France',
};

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6 text-center">Contactez-nous</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Nos coordonnées</h2>
        
        <div className="space-y-4">
          <div>
            <p className="font-medium">Adresse</p>
            <p>123 Avenue du Chanvre<br />75000 Paris, France</p>
          </div>
          
          <div>
            <p className="font-medium">Email</p>
            <p>contact@chanvre-vert.fr</p>
          </div>
          
          <div>
            <p className="font-medium">Téléphone</p>
            <p>+33 1 23 45 67 89</p>
          </div>
          
          <div>
            <p className="font-medium">Horaires</p>
            <p>Du lundi au vendredi : 9h - 18h<br />Samedi : 10h - 16h</p>
          </div>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Formulaire de contact</h2>
        <p className="mb-4">Formulaire à implémenter selon vos besoins spécifiques.</p>
      </div>
    </div>
  );
}
