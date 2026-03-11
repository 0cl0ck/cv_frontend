import Image from 'next/image';
import Link from "next/link";
import ValentineButton from './ValentineButton';
import { HeroTextAnimated } from './HeroTextAnimated';

type Cta = {
  text: string;
  href: string;
};

interface HeroProps {
  title?: string;
  subtitle?: string;
  description?: string;
  primaryCTA?: Cta;
  secondaryCTA?: Cta;
  imageUrl?: string;
}

// Vérifie si on est dans la période de la Saint-Valentin (7-14 février 2026)
function isValentinePeriod(): boolean {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed (février = 1)
  const day = now.getDate();

  // Février 2026, du 7 au 14
  return year === 2026 && month === 1 && day >= 7 && day <= 14;
}

// Card spéciale Saint-Valentin
function ValentineHeroCard() {
  return (
    <div className="neon-container backdrop-blur-sm p-4 md:p-5 rounded-lg text-white border border-pink-400/40 bg-gradient-to-br from-pink-600/80 to-red-600/60">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl animate-bounce">💝</span>
        <p className="font-bold text-base md:text-xl lg:text-2xl tracking-wide text-white text-center md:text-left">
          -20% SAINT-VALENTIN
        </p>
        <span className="text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>🌹</span>
      </div>

      {/* Promo description */}
      <div className="mb-3 pb-3 border-b border-white/20">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎁</span>
          <p className="text-sm md:text-base font-semibold text-pink-200">
            Sur tout le site !
          </p>
        </div>
        <p className="text-xs md:text-sm text-white/80 mt-1">
          Réduction automatique appliquée<br />
          <span className="text-pink-200">dans votre panier !</span>
        </p>
      </div>

      {/* Info */}
      <div>
        <p className="text-xs md:text-sm text-white/80">
          ✨ Offre valable du 7 au 14 février
        </p>
        <p className="text-xs md:text-sm text-white/60 mt-1">
          💡 Hors packs CBD
        </p>
      </div>

      <p className="mt-3 text-[10px] md:text-xs text-white/60 italic text-center md:text-left">
        Du 7 au 14 février 2026
      </p>
    </div>
  );
}

// Card standard (hors période Noël)
function DefaultHeroCard() {
  return (
    <div className="neon-container backdrop-blur-sm p-4 md:p-5 rounded-lg text-white border border-white/20">
      <p className="font-bold text-base md:text-xl lg:text-2xl tracking-wide neon-text-animation text-center md:text-left">
        CADEAUX AUTOMATIQUES
      </p>
      <p className="mt-2 text-sm md:text-base uppercase tracking-wider text-[#EFC368] text-center md:text-left">
        Livraison offerte* + cadeaux
      </p>
      <p className="mt-3 text-xs md:text-sm text-white/90 text-center md:text-left">
        Cadeaux offerts selon le montant du panier après remises
      </p>
      <p className="mt-2 text-[10px] md:text-xs text-white/70 italic text-center md:text-left">
        * Livraison offerte à partir de 60 EUR pour la France, 200 EUR pour les autres pays.
      </p>
    </div>
  );
}

export default function ImageHero({
  title = "CBD de qualité, livré chez vous",
  subtitle = "Votre bien-être au naturel",
  description = "Fleurs, huiles et infusions CBD certifiées, testées en laboratoire. Livraison express 24-48h en France.",
  primaryCTA = {
    text: "Découvrir nos produits",
    href: "/produits",
  },
  secondaryCTA = {
    text: "En savoir plus",
    href: "/a-propos",
  },
  imageUrl = "/images/hero/HeroHiver.webp",
}: HeroProps = {}) {
  // Affichage card spéciale basé sur la période
  const showValentine = isValentinePeriod();

  return (
    <section className="relative min-h-[70vh] md:min-h-[600px] overflow-hidden">
      <div className="absolute inset-0 z-0">
        {/* Image de fond */}
        <Image
          src={imageUrl}
          alt="CBD Premium - Chanvre Vert"
          fill
          sizes="100vw"
          className="object-cover object-center md:object-right"
          priority
          fetchPriority="high"
          quality={75}
        />

        <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-black/80 via-black/60 to-black/30 md:to-transparent" />
      </div>

      <div className="absolute inset-0 z-10 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,0.1) 35px, rgba(255,255,255,0.1) 70px)",
          }}
        />
      </div>

      <div className="relative z-20 mx-auto flex min-h-[70vh] lg:min-h-[600px] max-w-7xl items-center px-4 py-8 md:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row w-full gap-6 lg:gap-8 items-center lg:items-center">
          {/* Card dynamique - Valentine ou standard - CACHÉE sauf desktop */}
          <div className="hidden lg:block w-full lg:w-auto lg:ml-auto order-first lg:order-last">
            {showValentine ? <ValentineHeroCard /> : <DefaultHeroCard />}
          </div>

          {/* Bouton Valentine mobile - ouvre la modale (client component) */}
          {showValentine && <ValentineButton />}

          {/* Contenu texte principal */}
          <div className="max-w-2xl text-white order-last lg:order-first text-center lg:text-left">
            <h1 className="mb-4 md:mb-6 text-[26px] sm:text-[40px] md:text-[48px] lg:text-[60px] font-bold leading-[1.1] tracking-[-0.01em] text-white">
              <HeroTextAnimated subtitle={subtitle} title={title} />
            </h1>
            <p className="mb-6 md:mb-8 text-base md:text-xl leading-relaxed text-gray-200 px-2 lg:px-0">
              {description}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
              <Link
                href={primaryCTA.href}
                className="inline-flex items-center justify-center rounded-lg bg-[#EFC368] px-4 sm:px-6 py-3 text-sm sm:text-base font-semibold text-black shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#d3a74f] hover:shadow-xl w-full sm:w-auto"
              >
                {primaryCTA.text}
              </Link>
              <Link
                href={secondaryCTA.href}
                className="inline-flex items-center justify-center rounded-lg border border-white px-4 sm:px-6 py-3 text-sm sm:text-base font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-xl w-full sm:w-auto"
              >
                {secondaryCTA.text}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-20">
        <svg
          className="h-12 w-full fill-current text-[#012730] md:h-16"
          viewBox="0 0 1440 48"
          preserveAspectRatio="none"
        >
          <path d="M0,48 L60,42 C120,36 240,24 360,18 C480,12 600,12 720,16.5 C840,21 960,30 1080,33 C1200,36 1320,33 1380,31.5 L1440,30 L1440,48 L0,48 Z" />
        </svg>
      </div>
    </section>
  );
}
