'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function ImageHero() {
  return (
    <div className="relative min-h-[100vh] flex items-center text-white bg-[#002830]">
      {/* Image de fond */}
      <div className="absolute inset-0 overflow-hidden">
        <Image 
          src="/Chanvre_vert_Hero_2.png" 
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
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 z-10 relative flex items-start justify-start py-16 md:py-24 pt-28 md:pt-32">
        <div className="max-w-[500px] ml-4 md:ml-8 lg:ml-12">
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
            className="btn px-6 py-3 rounded-lg inline-flex items-center justify-center bg-[#126E62] hover:bg-[#0d5c52] transition-colors text-white"
          >
            Découvrir nos produits
          </Link>
        </div>
      </div>
    </div>
  );
}
