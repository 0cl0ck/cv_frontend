import React from 'react';
import Image from 'next/image';
import { generatePageMetadata } from '@/lib/metadata';

export const metadata = generatePageMetadata({
  title: 'À propos',
  description: 'À propos de Chanvre Vert, spécialiste du CBD en France basée dans les Hauts de France',
  path: '/a-propos',
});

const VideoCard = ({ src }: { src: string }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="aspect-video relative">
        <video
          className="w-full h-full object-cover"
          controls
          preload="none"
          poster="/images/a-propos/ferme-cbd.jpg"
        >
          <source src={src} type="video/mp4" />
          Votre navigateur ne supporte pas la lecture de vidéos.
        </video>
      </div>
    </div>
  );
};

const ImageCard = ({ src, alt }: { src: string; alt: string }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <div className="aspect-video relative">
        <Image
          src={src}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
        />
      </div>
    </div>
  );
};

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 text-gray-50">
      <h1 className="text-3xl font-bold mb-8 text-center">À propos de Chanvre Vert</h1>
      
      {/* Section principale avec le texte de présentation */}
      <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Notre entreprise</h2>
        <p className="mb-4">
          Chanvre Vert est une entreprise française basée dans les Hauts de France, spécialisée dans la distribution de produits CBD de haute qualité.
        </p>
        <p className="mb-4">
          Nous sélectionnons rigoureusement nos fournisseurs pour vous proposer les meilleurs produits provenant principalement de France, de Suisse et d&apos;Italie.
        </p>
        <p className="mb-4">
          Notre engagement pour la qualité se traduit par une sélection méticuleuse de nos partenaires et une transparence totale sur l&apos;origine de nos produits.
        </p>
        <p>
          Tous nos produits respectent la réglementation européenne avec un taux de THC inférieur à 0,3%, et notre équipe se tient à votre disposition pour répondre à toutes vos questions.
        </p>
      </div>
      
      {/* Section des images */}
      <h2 className="text-2xl font-semibold mb-4">Découvrez nos fournisseurs partenaires</h2>
      <p className="text-gray-300 mb-6">Nous collaborons avec des cultivateurs certifiés en France, en Suisse et en Italie : voici un aperçu de leurs champs et de leur savoir-faire.</p>
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <ImageCard 
          src="/images/a-propos/ferme-cbd.jpg" 
          alt="Culture de chanvre CBD chez l'un de nos fournisseurs français"
        />
        <ImageCard 
          src="/images/a-propos/ferme-cbd-2.jpg" 
          alt="Récolte de chanvre CBD chez un fournisseur partenaire"
        />
      </div>
      
      {/* Section des vidéos */}
      <div className="grid md:grid-cols-2 gap-6">
        <VideoCard 
          src="/videos/a-propos/ferme-cbd-v.mp4"
        />
        <VideoCard 
          src="/videos/a-propos/ferme-cbd-v2.mp4"
        />
      </div>
    </div>
  );
}
