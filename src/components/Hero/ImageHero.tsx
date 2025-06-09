'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// CSS for neon effect - enhanced with better glow and dual colors
const neonGlowStyle1 = {
  color: '#FFDA85',
  textShadow: '0 0 5px #EFC368, 0 0 10px #EFC368, 0 0 15px #EFC368, 0 0 25px #EFC368, 0 0 40px #EFC368'
};

// Style alternatif avec blanc-bleuté pour un contraste élégant
const neonGlowStyle2 = {
  color: '#ffffff',
  textShadow: '0 0 7px #ffffff, 0 0 15px #ffffff, 0 0 25px #4fd1c5, 0 0 40px #4fd1c5'
};

// Style alternatif avec vert teal - disabled pour l'instant
/* const neonGlowStyle3 = {
  color: '#4fd1c5',
  textShadow: '0 0 7px #4fd1c5, 0 0 15px #4fd1c5, 0 0 25px #4fd1c5, 0 0 40px #4fd1c5'
}; */

export default function ImageHero() {
  const [glowState, setGlowState] = useState(0);
  
  // Effect to cycle through glow states for animation with smoother transition
  useEffect(() => {
    const interval = setInterval(() => {
      setGlowState(prev => (prev + 1) % 2); // Cycle between 0 and 1
    }, 2000); // Slower transition for more dramatic effect
    
    return () => clearInterval(interval);
  }, []);
  
  // Fonction pour obtenir le style actuel selon l'état
  const getCurrentStyle = () => {
    switch(glowState) {
      case 0: return neonGlowStyle1;
      case 1: return neonGlowStyle2;
      default: return neonGlowStyle1;
    }
  };
  return (
    <div className="relative min-h-[100vh] flex items-center text-white bg-[#002830]">
      {/* Image de fond */}
      <div className="absolute inset-0 overflow-hidden">
        <Image 
          src="/Chanvre_Vert_Hero_3.png" 
          alt="Chanvre Vert CBD" 
          fill
          sizes="100vw"
          priority
          quality={100}
          className="object-cover w-full h-full"
        />
        {/* Overlay léger pour améliorer la lisibilité du texte */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#002830] via-[#002830]/70 to-transparent"></div>
      </div>
      
      {/* Contenu texte */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 z-10 relative flex flex-col md:flex-row items-start md:justify-between justify-start py-16 md:py-24 pt-28 md:pt-32">
        <div className="max-w-[500px] ml-4 md:ml-8 lg:ml-12 relative">
          {/* Version mobile de la promotion - visible uniquement sur mobile, positionnée en haut */}
          <div className="md:hidden w-full text-center mb-6">
            <div className="neon-container backdrop-blur-sm p-2 rounded-lg transition-all duration-1000 ease-in-out">
              <p 
                className="font-bold text-base flex flex-col items-center justify-center transition-all duration-1000 ease-in-out" 
                style={getCurrentStyle()}
              >
                🎁 PROMO SPÉCIALE 🎁
                <span className="uppercase tracking-wider text-sm">JUSQU&apos;A 25G OFFERTS + LIVRAISON GRATUITE</span>
              </p>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2">
            Chanvre Vert
          </h1>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-4">
            CBD Premium
          </h2>
          <p className="text-lg mb-8">
            Naturel, certifié, efficace.
          </p>
          <Link 
            href="/produits" 
            className="btn px-6 py-3 rounded-lg inline-flex items-center justify-center bg-[#EFC368] hover:bg-[#d9ae5a] transition-colors text-black"
          >
            Découvrir nos produits
          </Link>
        </div>
        
        {/* Texte promotionnel à droite - visible uniquement sur desktop */}
        <div className="hidden md:block text-center mx-auto px-4 md:px-8 lg:px-12 mt-4">
          <div className="neon-container backdrop-blur-sm p-4 rounded-lg transition-all duration-1000 ease-in-out">
            <p 
              className="font-bold text-xl lg:text-2xl flex flex-col items-center justify-center transition-all duration-1000 ease-in-out" 
              style={getCurrentStyle()}
            >
              🎁 PROMOTION TEMPORAIRE 🎁
              <br />
              <span className="uppercase tracking-wider">Jusqu&apos;à 25G offerts</span>
              <br />
              <span className="uppercase tracking-wider">+ Livraison Gratuite</span>
              <br />
              <span className="text-base mt-2 opacity-90">Détails sur la page produits et la page panier</span>
            </p>
          </div>
        </div>
        

      </div>
    </div>
  );
}
