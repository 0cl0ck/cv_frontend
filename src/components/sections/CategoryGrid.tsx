'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { IconArrowRight } from '@tabler/icons-react';

export type CategoryCard = {
  title: string;
  src: string;
  href: string;
};

// Animation variants pour les cartes
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.43, 0.13, 0.23, 0.96]
    }
  }),
  hover: {
    scale: 1.02,
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
    transition: {
      duration: 0.3,
      ease: 'easeOut'
    }
  }
};

// Composant de carte de catégorie
const CategoryCard = ({ category, index }: { category: CategoryCard; index: number }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="h-full"
      custom={index}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      variants={cardVariants}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Link href={category.href} className="block h-full">
        <div className="relative rounded-lg overflow-hidden bg-[#004942] h-full flex flex-col shadow-md">
          {/* Image avec overlay */}
          <div className="relative aspect-[16/10] overflow-hidden">
            <motion.div
              className="h-full w-full relative"
              animate={{ scale: isHovered ? 1.05 : 1 }}
              transition={{ duration: 0.4 }}
            >
              <Image
                src={category.src}
                alt={category.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                priority={index < 4}
                quality={90}
              />
              <motion.div 
                className="absolute inset-0 bg-gradient-to-t from-[#004942] to-transparent"
                initial={{ opacity: 0.3 }}
                animate={{ opacity: isHovered ? 0.6 : 0.3 }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          </div>

          {/* Contenu - Titre et icône */}
          <div className="p-4 flex-grow flex items-center justify-between">
            <motion.h3 
              className="text-lg font-medium text-white"
              animate={{ x: isHovered ? 4 : 0 }}
              transition={{ duration: 0.2 }}
            >
              {category.title}
            </motion.h3>
            <motion.div
              className="bg-white/10 rounded-full p-2 text-white"
              animate={{ 
                x: isHovered ? 4 : 0,
                backgroundColor: isHovered ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)'
              }}
              transition={{ duration: 0.2 }}
            >
              <IconArrowRight size={18} />
            </motion.div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default function CategoryGrid() {
  const [windowWidth, setWindowWidth] = useState(0);
  
  // Détecter la largeur de la fenêtre pour adapter la mise en page sur mobile
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    // Initialiser au chargement
    handleResize();
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Catégories
  const categories: CategoryCard[] = [
    {
      title: 'Huiles CBD',
      src: '/images/categories/categorie_huile_cbd.webp',
      href: '/produits/categorie/huiles-cbd'
    },
    {
      title: 'Fleurs CBD',
      src: '/images/categories/categorie_fleurs_cbd.webp',
      href: '/produits/categorie/fleurs-cbd'
    },
    {
      title: 'Infusions CBD',
      src: '/images/categories/categorie_infusion_cbd.webp',
      href: '/produits/categorie/infusions-cbd'
    },
    {
      title: 'Résine CBD',
      src: '/images/categories/categorie_resine_cbd.webp',
      href: '/produits/categorie/resine-cbd'
    },
    {
      title: 'Gélules CBD',
      src: '/images/categories/categorie_gelules_cbd.webp',
      href: '/produits/categorie/gelules-cbd'
    },
    {
      title: 'Packs CBD',
      src: '/images/categories/categorie_packs_cbd.webp',
      href: '/produits/categorie/packs-cbd'
    }
  ];
  
  // Fonction pour déterminer la disposition en fonction de la largeur d'écran
  const getGridCols = () => {
    if (windowWidth <= 640) return 'grid-cols-1';
    if (windowWidth <= 1024) return 'grid-cols-2';
    return 'grid-cols-3';
  };

  return (
    <section className="py-16 bg-[#00333e] relative overflow-hidden">
      {/* Éléments décoratifs en arrière-plan */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#004942] opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#004942] opacity-5 rounded-full translate-x-1/3 translate-y-1/3"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-12 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-1.5 h-8 bg-[#004942] rounded-full mr-3"></div>
            <h2 className="text-3xl font-bold text-white">Catégories</h2>
          </div>
          <Link 
            href="/produits" 
            className="hidden sm:flex items-center text-white hover:text-green-200 transition-all duration-300 group"
          >
            <span className="mr-2">Tous les produits</span>
            <motion.div 
              className="p-1 rounded-full"
              whileHover={{ x: 5 }}
              transition={{ duration: 0.2 }}
            >
              <IconArrowRight size={18} />
            </motion.div>
          </Link>
        </div>
        
        <div className={`grid ${getGridCols()} gap-6 md:gap-8`}>
          {categories.map((category, index) => (
            <CategoryCard key={category.title} category={category} index={index} />
          ))}
        </div>
        
        <div className="mt-8 text-center sm:hidden">
          <Link 
            href="/produits" 
            className="inline-flex items-center px-5 py-2.5 rounded-lg bg-[#004942] text-white hover:bg-[#00594f] transition-colors"
          >
            <span>Tous les produits</span>
            <IconArrowRight size={18} className="ml-2" />
          </Link>
        </div>
      </div>
    </section>
  );
}
