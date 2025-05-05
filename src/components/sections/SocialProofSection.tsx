'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { IconMapPin, IconStar, IconStarFilled, IconArrowUpRight, IconMessageCircle2 } from '@tabler/icons-react';

// Type pour les informations de boutique
type StoreInfo = {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  googleLink: string;
  reviewText?: string;
  reviewAuthor?: string;
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: [0.43, 0.13, 0.23, 0.96]
    }
  }
};

// Composant d'étoiles de notation
const RatingStars = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className="text-yellow-400">
          {star <= rating ? (
            <IconStarFilled size={20} />
          ) : (
            <IconStar size={20} />
          )}
        </span>
      ))}
      <span className="ml-2 text-white font-medium">{rating.toFixed(1)}</span>
    </div>
  );
};

// Composant pour une carte de boutique
const StoreCard = ({ store }: { store: StoreInfo }) => {
  return (
    <motion.div 
      className="bg-[#00454f] rounded-lg overflow-hidden shadow-lg flex flex-col h-full"
      variants={itemVariants}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-white">{store.name}</h3>
            <div className="flex items-center text-white/80 mt-1">
              <IconMapPin size={16} className="mr-1" />
              <span className="text-sm">{store.location}</span>
            </div>
          </div>
          <div className="bg-[#004942] p-2 rounded-full">
            <IconMessageCircle2 size={24} className="text-white" />
          </div>
        </div>
        
        <div className="mb-4">
          <RatingStars rating={store.rating} />
          <p className="text-white/70 text-sm mt-1">
            Basé sur {store.reviewCount} avis
          </p>
        </div>
        
        {store.reviewText && (
          <div className="mt-4 bg-[#003945] p-4 rounded-lg">
            <p className="text-white/90 italic text-sm">&quot;{store.reviewText}&quot;</p>
            {store.reviewAuthor && (
              <p className="text-white/70 text-sm mt-2">- {store.reviewAuthor}</p>
            )}
          </div>
        )}
      </div>
      
      <div className="mt-auto p-4 border-t border-[#005965]">
        <Link 
          href={store.googleLink} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-between text-white group"
        >
          <div className="flex items-center">
            <div className="w-5 h-5 mr-2 relative">
              <Image 
                src="/google-g-logo.png" 
                alt="Google"
                fill
                sizes="20px"
                style={{ objectFit: 'contain' }}
              />
            </div>
            <span>Voir tous les avis</span>
          </div>
          <motion.div
            whileHover={{ x: 2, y: -2 }}
            transition={{ duration: 0.2 }}
          >
            <IconArrowUpRight size={20} className="text-white group-hover:text-green-300 transition-colors" />
          </motion.div>
        </Link>
      </div>
    </motion.div>
  );
};

export default function SocialProofSection() {
  // Infos des boutiques
  const stores: StoreInfo[] = [
    {
      id: '1',
      name: 'Chanvre Vert Bergues',
      location: 'Bergues, Nord',
      rating: 4.7,
      reviewCount: 98,
      googleLink: 'https://www.google.com/search?sca_esv=219e40ae4658da95&sxsrf=AHTn8zrlYgsdKDJUa-p5Tio_mO2xfH1XJA:1746144203265&q=chanvre+vert+bergues',
      reviewText: "Personnel très accueillant et très sympa. Produit de qualité. Je recommande les yeux fermés. Livraison très rapide et soignée avec un petit mot toujours agréable.",
      reviewAuthor: "Marie L."
    },
    {
      id: '2',
      name: 'Chanvre Vert Wormhout',
      location: 'Wormhout, Nord',
      rating: 4.9,
      reviewCount: 76,
      googleLink: 'https://www.google.com/search?sca_esv=219e40ae4658da95&sxsrf=AHTn8zqQrMxFthf7Z4EL-QhVhPSgNZ8wYA:1746144242455&q=chanvre+vert+wormhout',
      reviewText: "Boutique très propre et bien agencée, le personnel est à l'écoute et donne des conseils avisés. Les produits sont de qualité et l'accueil est chaleureux.",
      reviewAuthor: "Thomas D."
    }
  ];

  return (
    <section className="py-16 bg-[#00343f] relative overflow-hidden">
      {/* Éléments décoratifs */}
      <div className="absolute inset-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full border border-white/20"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 rounded-full border border-white/20"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold text-white mb-3">Nos clients parlent de nous</h2>
          <p className="text-white/80 max-w-2xl mx-auto">
            Découvrez les avis de nos clients sur nos boutiques physiques et rejoignez notre communauté satisfaite.
          </p>
        </motion.div>
        
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {stores.map(store => (
            <StoreCard key={store.id} store={store} />
          ))}
        </motion.div>
        
        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <p className="text-white/70 text-sm max-w-2xl mx-auto">
            Nous sommes fiers de la confiance que nos clients nous accordent. 
            Consultez nos avis Google pour voir pourquoi ils nous choisissent.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
