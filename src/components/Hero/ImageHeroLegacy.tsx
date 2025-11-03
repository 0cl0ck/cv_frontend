"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

// CSS classes will be used instead of inline styles for better performance
export default function ImageHeroLegacy() {
  // Define exact dimensions for the hero image to reduce CLS
  const imageWidth = 1920;
  const imageHeight = 1080;
  return (
    <div className="relative min-h-[100vh] flex items-center text-white bg-[#002830]">
      {/* Image de fond - optimized loading with fetchpriority for better LCP */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/Chanvre_Vert_Hero_3.png"
          alt="Chanvre Vert CBD"
          width={imageWidth}
          height={imageHeight}
          sizes="100vw"
          priority
          fetchPriority="high"
          loading="eager"
          quality={85} /* Further reduced quality for faster loading */
          className="object-cover w-full h-full"
          style={{
            transform: "translate3d(0,0,0)",
          }} /* Force GPU acceleration */
        />
        {/* Overlay leger pour ameliorer la lisibilite du texte */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#002830] via-[#002830]/70 to-transparent"></div>
      </div>

      {/* Contenu texte */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 z-10 relative flex flex-col md:flex-row items-start md:justify-between justify-start py-16 md:py-24 pt-28 md:pt-32">
        <div className="max-w-[500px] ml-4 md:ml-8 lg:ml-12 relative">
          {/* Version mobile de la promotion - visible uniquement sur mobile, positionnee en haut */}
          <div className="md:hidden w-full text-center mb-6">
            <div className="neon-container backdrop-blur-sm p-3 rounded-lg space-y-2">
              <p className="font-bold text-base flex flex-col items-center justify-center neon-text-animation">
                CADEAUX AUTOMATIQUES
                <span className="uppercase tracking-wider text-sm">
                  Livraison offerte* + cadeaux
                </span>
              </p>
              <p className="text-xs text-white/90">
                50 EUR : Livraison offerte* + 2g offerts / 90 EUR : Livraison offerte* + 10g + 1 pre-roll / 160 EUR : Livraison offerte* + 20g + 2 pre-rolls
              </p>
              <p className="text-[10px] text-white/70 uppercase tracking-wider">
                Montant calcule apres remises et fidelite
              </p>
              <p className="text-[10px] text-white/60 italic mt-1">
                * Livraison offerte à partir de 50 EUR pour la France, 200 EUR pour les autres pays.
              </p>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2">
            Chanvre Vert
          </h1>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-4">
            CBD Premium
          </h2>
          <p className="text-lg mb-8">Naturel, certifie, efficace.</p>
          <Link
            href="/produits"
            className="btn px-6 py-3 rounded-lg inline-flex items-center justify-center bg-[#EFC368] hover:bg-[#d9ae5a] transition-colors text-black"
          >
            Decouvrir nos produits
          </Link>
        </div>

        {/* Texte promotionnel a droite - visible uniquement sur desktop */}
        <div className="hidden md:block text-center mx-auto px-4 md:px-8 lg:px-12 mt-4">
          <div className="neon-container backdrop-blur-sm p-5 rounded-lg text-white">
            <p className="font-bold text-xl lg:text-2xl tracking-wide neon-text-animation">
              CADEAUX AUTOMATIQUES
            </p>
            <p className="mt-2 text-sm uppercase tracking-wider text-emerald-100">
              Livraison offerte* + cadeaux
            </p>
            <ul className="mt-3 space-y-1 text-sm text-white/90">
              <li>50 EUR : Livraison offerte* + 2g offerts</li>
              <li>90 EUR : Livraison offerte* + 10g offerts + 1 pre-roll</li>
              <li>160 EUR : Livraison offerte* + 20g offerts + 2 pre-rolls</li>
            </ul>
            <p className="text-xs mt-3 text-white/70 uppercase tracking-wider">
              Montant calcule apres remises et fidelite
            </p>
            <p className="text-xs mt-2 text-white/60 italic">
              * Livraison offerte à partir de 50 EUR pour la France, 200 EUR pour les autres pays.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

