'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { IconMapPin, IconPhone, IconClock, IconMail, IconBuildingStore, IconBrandFacebook, IconBrandInstagram, IconExternalLink, IconStar } from '@tabler/icons-react';
import ContactForm from '@/components/Contact/ContactForm';
import Link from 'next/link';
import Script from 'next/script';

// Les métadonnées sont définies dans metadata.ts pour compatibilité avec 'use client'

// Animation variants
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.43, 0.13, 0.23, 0.96]
    }
  }
};

// Structure des données d'une boutique
type StoreInfo = {
  id: string;
  name: string;
  address: string;
  postalCode: string;
  city: string;
  phone: string;
  phoneHref: string;
  googleReviewsUrl: string;
  rating: number;
  reviewCount: number;
  schedules: Array<{ days: string; hours: string }>;
  closedDays: string[];
  geo: { lat: number; lng: number };
  openingHoursSpec: Array<{ dayOfWeek: string[]; opens: string; closes: string }>;
};

// Définition des données des boutiques
const stores: StoreInfo[] = [
  {
    id: 'bergues',
    name: 'Chanvre Vert Bergues',
    address: '9 Rue Faidherbe',
    postalCode: '59380',
    city: 'Bergues',
    phone: '06 12 10 05 47',
    phoneHref: 'tel:+33612100547',
    googleReviewsUrl: 'https://www.google.com/search?rlz=1C1GCEA_enFR1194FR1194&sca_esv=903e5a2d5ddaaca0&sxsrf=ANbL-n4Lk9QmJvLwHaV9iLkIwSfkJDrSzQ:1768557870321&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qORt4ZOlKQ85VoGFnBxgdfnJb_VMPY5XULgSnSMJrfMiCHtDogt0QTbK4E6f8Zqgzz2_am1vvV8vzWaxI1BlTvthbJky_cv50TIUtRiiO7nmp0Wj8Zg%3D%3D&q=CHANVRE+VERT+by+CBD+BERGUOIS+Avis',
    rating: 4.9,
    reviewCount: 126,
    schedules: [
      { days: 'Lundi, Mardi, Jeudi, Vendredi', hours: '10h00–12h00, 14h30–19h00' },
      { days: 'Samedi', hours: '10h00–12h00, 14h30–18h30' },
    ],
    closedDays: ['Mercredi', 'Dimanche'],
    geo: { lat: 50.9683, lng: 2.4339 },
    openingHoursSpec: [
      { dayOfWeek: ['Monday', 'Tuesday', 'Thursday', 'Friday'], opens: '10:00', closes: '12:00' },
      { dayOfWeek: ['Monday', 'Tuesday', 'Thursday', 'Friday'], opens: '14:30', closes: '19:00' },
      { dayOfWeek: ['Saturday'], opens: '10:00', closes: '12:00' },
      { dayOfWeek: ['Saturday'], opens: '14:30', closes: '18:30' },
    ],
  },
  {
    id: 'wormhout',
    name: 'Chanvre Vert Wormhout',
    address: '26 Pl. du Général de Gaulle',
    postalCode: '59470',
    city: 'Wormhout',
    phone: '07 61 85 05 29',
    phoneHref: 'tel:+33761850529',
    googleReviewsUrl: 'https://www.google.com/search?sca_esv=903e5a2d5ddaaca0&rlz=1C1GCEA_enFR1194FR1194&sxsrf=ANbL-n6eREXFdCmDwNiQSX5bILB7C17kSg:1768557836551&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOY0h6GGcX94HOqOD1PS-sEXr8bZqE360JiGcnsL0X8bGsvxQ9h382aV0jmTx6teOWSnD_QkHPNd05vURNGsSXLyUV8mYV9-gv3LcyWsPKQAvGInrTw%3D%3D&q=Chanvre-vert+Wormhout+Avis',
    rating: 4.9,
    reviewCount: 56,
    schedules: [
      { days: 'Lundi au Vendredi', hours: '10h30–12h30, 14h00–18h00' },
    ],
    closedDays: ['Samedi', 'Dimanche'],
    geo: { lat: 50.8783, lng: 2.4672 },
    openingHoursSpec: [
      { dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '10:30', closes: '12:30' },
      { dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], opens: '14:00', closes: '18:00' },
    ],
  }
];

// Generate LocalBusiness JSON-LD
function generateLocalBusinessSchema() {
  const businesses = stores.map((store) => ({
    '@type': 'LocalBusiness',
    '@id': `https://www.chanvre-vert.fr/contact#${store.id}`,
    name: store.name,
    description: `Boutique CBD premium à ${store.city}. Fleurs, huiles, résines CBD de qualité. Conseils personnalisés.`,
    url: 'https://www.chanvre-vert.fr/contact',
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
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: store.rating,
      reviewCount: store.reviewCount,
    },
    priceRange: '€€',
    image: 'https://www.chanvre-vert.fr/images/a-propos/ferme-cbd.jpg',
    sameAs: [store.googleReviewsUrl],
  }));

  return {
    '@context': 'https://schema.org',
    '@graph': businesses,
  };
}

// Composant pour afficher une boutique
const StoreCard = ({ store }: { store: StoreInfo }) => {
  return (
    <motion.div 
      variants={fadeIn} 
      className="bg-[#004942] rounded-lg shadow-xl p-6 border border-[#126E62]/30"
    >
      <div className="flex items-center mb-4">
        <div className="bg-[#01333f] p-2 rounded-full mr-3">
          <IconBuildingStore size={24} className="text-[#EFC368]" />
        </div>
        <h3 className="text-xl font-bold text-white">{store.name}</h3>
      </div>
      
      {/* Rating */}
      <div className="flex items-center gap-2 mb-4 bg-[#01333f] rounded-lg px-3 py-2 inline-flex">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <IconStar 
              key={star} 
              size={16} 
              className={star <= Math.floor(store.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'} 
            />
          ))}
        </div>
        <span className="text-white font-medium">{store.rating}</span>
        <span className="text-white/60 text-sm">({store.reviewCount} avis)</span>
      </div>
      
      <div className="space-y-4 text-white/90">
        <div className="flex">
          <IconMapPin className="mt-1 mr-3 text-[#EFC368] flex-shrink-0" size={18} />
          <p>{store.address}, {store.postalCode} {store.city}</p>
        </div>
        
        <div className="flex">
          <IconPhone className="mt-1 mr-3 text-[#EFC368] flex-shrink-0" size={18} />
          <p>
            <a 
              href={store.phoneHref}
              className="hover:text-[#EFC368] transition-colors"
            >
              {store.phone}
            </a>
          </p>
        </div>
        
        <div className="flex">
          <IconClock className="mt-1 mr-3 text-[#EFC368] flex-shrink-0" size={18} />
          <div>
            <p className="font-medium mb-1">Horaires d&apos;ouverture:</p>
            <ul className="space-y-1">
              {store.schedules.map((schedule, index) => (
                <li key={index} className="text-sm">
                  <span className="font-medium">{schedule.days}:</span> {schedule.hours}
                </li>
              ))}
              <li className="text-sm text-white/70 mt-1">
                <span className="font-medium">Fermé:</span> {store.closedDays.join(', ')}
              </li>
            </ul>
          </div>
        </div>
        
        {/* Google Reviews Link */}
        <a
          href={store.googleReviewsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 mt-4 text-[#EFC368] hover:text-yellow-300 transition-colors"
        >
          <IconExternalLink size={16} />
          <span>Voir tous les avis sur Google</span>
        </a>
      </div>
    </motion.div>
  );
};

export default function ContactPage() {
  const localBusinessSchema = generateLocalBusinessSchema();

  return (
    <>
      {/* LocalBusiness JSON-LD Schema */}
      <Script
        id="local-business-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />

      <div className="min-h-screen bg-[#01333f] py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* En-tête */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center mb-2">
              <div className="w-1.5 h-8 bg-[#004942] rounded-full mr-3"></div>
              <h1 className="text-3xl font-bold text-white">Contactez-nous</h1>
            </div>
            <p className="text-white/80 max-w-2xl mx-auto mt-2">
              Une question ? Un commentaire ? Besoin de plus d&apos;informations ? Contactez-nous par formulaire ou visitez l&apos;une de nos boutiques.
            </p>
          </motion.div>
          
          {/* Section cartes de boutiques */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16"
          >
            {stores.map(store => (
              <StoreCard key={store.id} store={store} />
            ))}
          </motion.div>
          
          {/* Section contact général */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="lg:col-span-1 bg-[#004942] rounded-lg shadow-xl p-6 border border-[#126E62]/30"
            >
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <IconMail className="mr-3 text-[#EFC368]" />
                Contact général
              </h2>
              
              <div className="space-y-4 text-white/90">
                <div>
                  <p className="font-medium">Email</p>
                  <a 
                    href="mailto:contact@chanvre-vert.fr" 
                    className="text-[#EFC368] hover:underline"
                  >
                    contact@chanvre-vert.fr
                  </a>
                </div>
                
                <div>
                  <p className="font-medium">Réseaux sociaux</p>
                  <div className="flex space-x-4 mt-2">
                    <Link 
                      href="https://www.facebook.com/CBDBerguois" 
                      target="_blank"
                      className="flex items-center text-white hover:text-[#EFC368] transition-colors"
                    >
                      <IconBrandFacebook size={20} className="mr-2" />
                      Facebook
                    </Link>
                    <Link 
                      href="https://www.instagram.com/chanvre_vert_officiel_/" 
                      target="_blank"
                      className="flex items-center text-white hover:text-[#EFC368] transition-colors"
                    >
                      <IconBrandInstagram size={20} className="mr-2" />
                      Instagram
                    </Link>
                  </div>
                </div>
                
                <div className="pt-4">
                  <p className="text-sm text-white/70">
                    Nous répondons habituellement aux demandes dans un délai de 24 à 48 heures ouvrées.
                  </p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="lg:col-span-2"
            >
              <div className="bg-[#01333f] rounded-lg p-1">
                <ContactForm />
              </div>
            </motion.div>
          </div>
          
          {/* Note de proximité */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="text-center text-white/70 max-w-3xl mx-auto"
          >
            <p>
              Nos boutiques sont facilement accessibles depuis Dunkerque, Hazebrouck et les environs. 
              N&apos;hésitez pas à nous appeler pour toute indication complémentaire.
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}
