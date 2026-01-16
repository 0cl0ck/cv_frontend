import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { generatePageMetadata } from '@/lib/metadata';
import { MapPin, Phone, Clock, ExternalLink, Newspaper } from 'lucide-react';

export const metadata = generatePageMetadata({
  title: 'À propos de Chanvre Vert | CBD Bergues & Wormhout',
  description: 'Découvrez Chanvre Vert, votre magasin CBD de confiance dans le Nord. Fondé par Clément, 2 boutiques à Bergues et Wormhout. Produits premium, conseils experts.',
  path: '/a-propos',
});

// Store data for LocalBusiness schema and display
const stores = {
  bergues: {
    name: 'Chanvre Vert Bergues',
    address: '9 Rue Faidherbe',
    postalCode: '59380',
    city: 'Bergues',
    phone: '06 12 10 05 47',
    phoneHref: 'tel:+33612100547',
    googleReviewsUrl: 'https://www.google.com/search?rlz=1C1GCEA_enFR1194FR1194&sca_esv=903e5a2d5ddaaca0&sxsrf=ANbL-n4Lk9QmJvLwHaV9iLkIwSfkJDrSzQ:1768557870321&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qORt4ZOlKQ85VoGFnBxgdfnJb_VMPY5XULgSnSMJrfMiCHtDogt0QTbK4E6f8Zqgzz2_am1vvV8vzWaxI1BlTvthbJky_cv50TIUtRiiO7nmp0Wj8Zg%3D%3D&q=CHANVRE+VERT+by+CBD+BERGUOIS+Avis',
    hours: [
      { day: 'Lundi', hours: '10:00–12:00, 14:30–19:00' },
      { day: 'Mardi', hours: '10:00–12:00, 14:30–19:00' },
      { day: 'Mercredi', hours: 'Fermé' },
      { day: 'Jeudi', hours: '10:00–12:00, 14:30–19:00' },
      { day: 'Vendredi', hours: '10:00–12:00, 14:30–19:00' },
      { day: 'Samedi', hours: '10:00–12:00, 14:30–18:30' },
      { day: 'Dimanche', hours: 'Fermé' },
    ],
    openingHoursSpec: [
      { dayOfWeek: ['Monday', 'Tuesday', 'Thursday', 'Friday'], opens: '10:00', closes: '12:00' },
      { dayOfWeek: ['Monday', 'Tuesday', 'Thursday', 'Friday'], opens: '14:30', closes: '19:00' },
      { dayOfWeek: ['Saturday'], opens: '10:00', closes: '12:00' },
      { dayOfWeek: ['Saturday'], opens: '14:30', closes: '18:30' },
    ],
    geo: { lat: 50.9683, lng: 2.4339 },
  },
  wormhout: {
    name: 'Chanvre Vert Wormhout',
    address: '26 Pl. du Général de Gaulle',
    postalCode: '59470',
    city: 'Wormhout',
    phone: '07 61 85 05 29',
    phoneHref: 'tel:+33761850529',
    googleReviewsUrl: 'https://www.google.com/search?sca_esv=903e5a2d5ddaaca0&rlz=1C1GCEA_enFR1194FR1194&sxsrf=ANbL-n6eREXFdCmDwNiQSX5bILB7C17kSg:1768557836551&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOY0h6GGcX94HOqOD1PS-sEXr8bZqE360JiGcnsL0X8bGsvxQ9h382aV0jmTx6teOWSnD_QkHPNd05vURNGsSXLyUV8mYV9-gv3LcyWsPKQAvGInrTw%3D%3D&q=Chanvre-vert+Wormhout+Avis',
    hours: [
      { day: 'Lundi', hours: '10:30–12:30, 14:00–18:00' },
      { day: 'Mardi', hours: '10:30–12:30, 14:00–18:00' },
      { day: 'Mercredi', hours: '10:30–12:30, 14:00–18:00' },
      { day: 'Jeudi', hours: '10:30–12:30, 14:00–18:00' },
      { day: 'Vendredi', hours: '10:30–12:30, 14:00–18:00' },
      { day: 'Samedi', hours: 'Fermé' },
      { day: 'Dimanche', hours: 'Fermé' },
    ],
    openingHoursSpec: [
      { dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '10:30', closes: '12:30' },
      { dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '14:00', closes: '18:00' },
    ],
    geo: { lat: 50.8783, lng: 2.4672 },
  },
};

// Generate LocalBusiness JSON-LD
function generateLocalBusinessSchema() {
  const businesses = Object.values(stores).map((store) => ({
    '@type': 'LocalBusiness',
    '@id': `https://www.chanvre-vert.fr/#${store.city.toLowerCase()}`,
    name: store.name,
    description: `Boutique CBD premium à ${store.city}. Fleurs, huiles, résines CBD de qualité. Conseils personnalisés.`,
    url: 'https://www.chanvre-vert.fr',
    telephone: store.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: store.address,
      addressLocality: store.city,
      postalCode: store.postalCode,
      addressCountry: 'FR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: store.geo.lat,
      longitude: store.geo.lng,
    },
    openingHoursSpecification: store.openingHoursSpec.map((spec) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: spec.dayOfWeek,
      opens: spec.opens,
      closes: spec.closes,
    })),
    priceRange: '€€',
    image: 'https://www.chanvre-vert.fr/images/a-propos/ferme-cbd.jpg',
    sameAs: [store.googleReviewsUrl],
  }));

  return {
    '@context': 'https://schema.org',
    '@graph': businesses,
  };
}

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

const StoreCard = ({ store }: { store: (typeof stores)['bergues'] }) => {
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-xl font-semibold mb-4 text-emerald-400">{store.name}</h3>
      
      {/* Address */}
      <div className="flex items-start gap-3 mb-4">
        <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-gray-200">{store.address}</p>
          <p className="text-gray-200">{store.postalCode} {store.city}</p>
        </div>
      </div>
      
      {/* Phone */}
      <div className="flex items-center gap-3 mb-4">
        <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
        <a href={store.phoneHref} className="text-emerald-400 hover:text-emerald-300 transition-colors">
          {store.phone}
        </a>
      </div>
      
      {/* Hours */}
      <div className="flex items-start gap-3 mb-4">
        <Clock className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          {store.hours.map((h) => (
            <div key={h.day} className="flex justify-between gap-4">
              <span className="text-gray-400 w-24">{h.day}</span>
              <span className={h.hours === 'Fermé' ? 'text-red-400' : 'text-gray-200'}>
                {h.hours}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Google Reviews Link */}
      <a
        href={store.googleReviewsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-emerald-400 transition-colors"
      >
        <ExternalLink className="w-4 h-4" />
        Voir les avis Google
      </a>
    </div>
  );
};

export default function AboutPage() {
  const localBusinessSchema = generateLocalBusinessSchema();

  return (
    <>
      {/* LocalBusiness JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      <div className="max-w-5xl mx-auto px-4 py-12 text-gray-50">
        <h1 className="text-3xl font-bold mb-8 text-center">À propos de Chanvre Vert</h1>
        
        {/* Section Fondateur (E-E-A-T) */}
        <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-8 border border-gray-700">
          <h2 className="text-2xl font-semibold mb-4 text-emerald-400">Notre Histoire</h2>
          <p className="mb-4">
            <strong>Chanvre Vert</strong> a été fondé par <strong>Clément</strong>, passionné par le chanvre et ses bienfaits.
            Ce qui a commencé sous le nom de <em>CBD Berguois</em> à Bergues s&apos;est transformé en une 
            enseigne reconnue dans le Nord de la France.
          </p>
          <p className="mb-4">
            En février 2023, fort du succès de la première boutique, Clément a ouvert un second 
            magasin à Wormhout, permettant de servir encore plus de clients dans la région dunkerquoise.
          </p>
          <p className="mb-4">
            Notre philosophie reste inchangée : proposer des <strong>produits CBD premium</strong>, 
            rigoureusement sélectionnés auprès de cultivateurs français, suisses et italiens, 
            tout en offrant un accompagnement personnalisé à chaque client.
          </p>
          
          {/* Press mention (E-E-A-T signal) */}
          <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-600">
            <div className="flex items-start gap-3">
              <Newspaper className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-300 mb-2">
                  <strong>Vu dans la presse :</strong>
                </p>
                <a
                  href="https://www.nordlittoral.fr/165714/article/2023-02-12/clement-commercant-bergues-ouvre-un-nouveau-cbd-shop-wormhout"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 transition-colors text-sm inline-flex items-center gap-2"
                >
                  <span>Nord Littoral : « Clément, commerçant à Bergues, ouvre un nouveau CBD shop à Wormhout »</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Section Boutiques */}
        <h2 className="text-2xl font-semibold mb-4">Nos Boutiques</h2>
        <p className="text-gray-300 mb-6">
          Retrouvez-nous dans nos deux boutiques du Nord, situées à seulement 15-20 minutes de Dunkerque.
        </p>
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <StoreCard store={stores.bergues} />
          <StoreCard store={stores.wormhout} />
        </div>

        {/* Section Engagement Qualité */}
        <div className="bg-gray-800 rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Notre Engagement Qualité</h2>
          <p className="mb-4">
            Nous sélectionnons rigoureusement nos fournisseurs pour vous proposer les meilleurs produits 
            provenant principalement de France, de Suisse et d&apos;Italie.
          </p>
          <p className="mb-4">
            Notre engagement pour la qualité se traduit par une sélection méticuleuse de nos partenaires 
            et une transparence totale sur l&apos;origine de nos produits.
          </p>
          <p>
            Tous nos produits respectent la réglementation européenne avec un taux de THC inférieur à 0,3%, 
            et notre équipe se tient à votre disposition pour répondre à toutes vos questions.
          </p>
        </div>
        
        {/* Section des images */}
        <h2 className="text-2xl font-semibold mb-4">Découvrez nos fournisseurs partenaires</h2>
        <p className="text-gray-300 mb-6">
          Nous collaborons avec des cultivateurs certifiés en France, en Suisse et en Italie : 
          voici un aperçu de leurs champs et de leur savoir-faire.
        </p>
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
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <VideoCard 
            src="/videos/a-propos/ferme-cbd-v.mp4"
          />
          <VideoCard 
            src="/videos/a-propos/ferme-cbd-v2.mp4"
          />
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Nous contacter
          </Link>
        </div>
      </div>
    </>
  );
}
