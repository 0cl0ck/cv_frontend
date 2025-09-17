"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

// CSS classes will be used instead of inline styles for better performance
export default function ImageHero() {
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
        {/* Overlay lÃ©ger pour amÃ©liorer la lisibilitÃ© du texte */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#002830] via-[#002830]/70 to-transparent"></div>
      </div>

      {/* Contenu texte */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 z-10 relative flex flex-col md:flex-row items-start md:justify-between justify-start py-16 md:py-24 pt-28 md:pt-32">
        <div className="max-w-[500px] ml-4 md:ml-8 lg:ml-12 relative">
          {/* Version mobile de la promotion - visible uniquement sur mobile, positionnée en haut */}
          <div className="md:hidden w-full text-center mb-6">
            <div className="neon-container backdrop-blur-sm p-2 rounded-lg">
              <p className="font-bold text-base flex flex-col items-center justify-center neon-text-animation">
                PROMO SP&Eacute;CIALE
                <span className="uppercase tracking-wider text-sm">
                  JUSQU&apos;&Agrave; 25G OFFERTS
                </span>
              </p>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-2">
            Chanvre Vert
          </h1>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-4">
            CBD Premium
          </h2>
          <p className="text-lg mb-8">Naturel, certifiÃ©, efficace.</p>
          <Link
            href="/produits"
            className="btn px-6 py-3 rounded-lg inline-flex items-center justify-center bg-[#EFC368] hover:bg-[#d9ae5a] transition-colors text-black"
          >
            DÃ©couvrir nos produits
          </Link>
        </div>

        {/* Texte promotionnel à droite - visible uniquement sur desktop */}
        <div className="hidden md:block text-center mx-auto px-4 md:px-8 lg:px-12 mt-4">
          <div className="neon-container backdrop-blur-sm p-4 rounded-lg">
            <p className="font-bold text-xl lg:text-2xl flex flex-col items-center justify-center neon-text-animation">
              PROMOTION TEMPORAIRE
              <br />
              <span className="uppercase tracking-wider">
                Jusqu&apos;&agrave; 25G offerts
              </span>
              <br />
              <span className="text-base mt-2 opacity-90">
                D&eacute;tails sur la page produits et la page panier
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


