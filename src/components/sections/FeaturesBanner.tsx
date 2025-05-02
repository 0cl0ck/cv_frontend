'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  IconTruck, 
  IconShieldCheck, 
  IconPlant2, 
  IconCertificate,
  IconArrowNarrowRight
} from '@tabler/icons-react';

// Type pour les avantages
type Feature = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

// Animation variants pour les cartes
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.1,
      duration: 0.5,
      ease: [0.43, 0.13, 0.23, 0.96]
    }
  }),
  hover: {
    y: -5,
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  }
};

// Animation variants pour les icônes
const iconVariants = {
  hover: {
    scale: 1.2,
    rotate: 5,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
      type: 'spring',
      stiffness: 300
    }
  }
};

// Animation variants pour les traits d'accent
const accentVariants = {
  hidden: { width: 0 },
  visible: { 
    width: '100%',
    transition: {
      duration: 0.6,
      ease: 'easeOut'
    }
  },
  hover: {
    width: '100%',
    backgroundColor: '#00b894',
    transition: {
      duration: 0.3
    }
  }
};

// Composant de carte d'avantage
const FeatureCard = ({ feature, index }: { feature: Feature; index: number }) => {
  return (
    <motion.div
      className="relative flex flex-col overflow-hidden rounded-lg bg-[#023440] p-6 group"
      variants={cardVariants}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      whileHover="hover"
    >
      {/* Traits d'accent */}
      <motion.div 
        className="absolute top-0 left-0 h-1 bg-[#004942] w-0"
        variants={accentVariants}
      />
      <motion.div 
        className="absolute bottom-0 right-0 h-1 bg-[#004942] w-0"
        variants={accentVariants}
      />

      <div className="flex items-start mb-4">
        {/* Icône avec animation */}
        <motion.div 
          className="mr-4 p-3 rounded-full bg-[#004942]/40 text-white"
          variants={iconVariants}
        >
          {feature.icon}
        </motion.div>
        
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white mb-1">{feature.title}</h3>
          <p className="text-white/80 text-sm">{feature.description}</p>
        </div>
      </div>
      
      {/* Lien fictif pour en savoir plus - s'anime au survol */}
      <motion.div 
        className="mt-auto pt-2 text-white/80 text-sm flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        initial={{ x: -10 }}
        whileHover={{ x: 0 }}
      >
        <span className="mr-1">En savoir plus</span>
        <motion.div
          initial={{ x: 0 }}
          whileHover={{ x: 5 }}
          transition={{ duration: 0.2 }}
        >
          <IconArrowNarrowRight size={16} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default function FeaturesBanner() {
  // Liste des avantages
  const features: Feature[] = [
    {
      id: '1',
      title: 'Produits 100% naturels',
      description: 'Tous nos produits sont issus d\'agriculture biologique, sans pesticides ni additifs.',
      icon: <IconPlant2 size={24} stroke={2.5} />
    },
    {
      id: '2',
      title: 'Qualité certifiée',
      description: 'Nos produits sont régulièrement testés en laboratoire pour garantir leur qualité et conformité.',
      icon: <IconCertificate size={24} stroke={2.5} />
    },
    {
      id: '3',
      title: 'Livraison express',
      description: 'Expédition sous 24-48h pour toutes vos commandes en France métropolitaine.',
      icon: <IconTruck size={24} stroke={2.5} />
    },
    {
      id: '4',
      title: 'Paiement sécurisé',
      description: 'Transactions 100% sécurisées avec système de paiement crypté et remboursement garanti.',
      icon: <IconShieldCheck size={24} stroke={2.5} />
    }
  ];

  return (
    <section className="py-16 bg-[#012730] relative overflow-hidden">
      {/* Éléments décoratifs en arrière-plan */}
      <div className="absolute inset-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
        {/* Motif de cercles décoratifs */}
        <div className="absolute top-20 left-10 w-40 h-40 rounded-full border border-white/20"></div>
        <div className="absolute bottom-10 right-10 w-60 h-60 rounded-full border border-white/20"></div>
        <div className="absolute top-40 right-40 w-20 h-20 rounded-full border border-white/20"></div>
        
        {/* Lignes diagonales */}
        <div className="absolute top-0 left-1/3 h-full w-px bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
        <div className="absolute top-0 left-2/3 h-full w-px bg-gradient-to-b from-transparent via-white/10 to-transparent"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <motion.h2 
            className="text-3xl font-bold text-white inline-block relative"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ 
              duration: 0.6,
              ease: [0.43, 0.13, 0.23, 0.96]
            }}
          >
            Pourquoi choisir Chanvre Vert
            <motion.span 
              className="block h-1 bg-[#004942] mt-2 mx-auto" 
              initial={{ width: 0 }}
              whileInView={{ width: '100%' }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8 }}
            />
          </motion.h2>
          <motion.p 
            className="mt-4 text-white/80 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Nous nous engageons à vous offrir la meilleure expérience à chaque étape de votre commande
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={feature.id} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
