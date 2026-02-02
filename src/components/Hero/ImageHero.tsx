'use client';
import Image from 'next/image';
import Link from "next/link";

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
  videoUrl?: string;
  imageUrl?: string;
}

// Vérifie si on est dans la période de la Saint-Valentin (7-14 février 2026)
// TEMPORAIREMENT: toujours afficher pour test
function isValentinePeriod(): boolean {
  // TODO: Remettre la vraie condition avant mise en prod
  // return year === 2026 && month === 1 && day >= 7 && day <= 14;
  return true;
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
        * Livraison offerte à partir de 50 EUR pour la France, 200 EUR pour les autres pays.
      </p>
    </div>
  );
}

export default function ImageHero({
  title = "avec du CBD premium certifié",
  subtitle = "Boostez votre bien-être",
  description = "Découvrez huiles, fleurs et infusions triées pour votre équilibre, traçabilité claire, livraison express.",
  primaryCTA = {
    text: "Découvrir nos produits",
    href: "/produits",
  },
  secondaryCTA = {
    text: "En savoir plus",
    href: "/a-propos",
  },
  // videoUrl supprimé - vidéo désactivée pour janvier
  imageUrl = "/images/hero/HeroHiver.webp",
}: HeroProps = {}) {
  // Affichage card spéciale basé sur la période
  const showValentine = isValentinePeriod();

  // Vidéo désactivée pour janvier
  const showVideo = false;
  const videoLoaded = false;

  return (
    <section className="relative min-h-[70vh] md:min-h-[600px] overflow-hidden">
      <div className="absolute inset-0 z-0">
        {/* Image de fond - toujours présente comme fallback */}
        <Image
          src={imageUrl}
          alt="CBD Premium - Chanvre Vert"
          fill
          sizes="100vw"
          className={`object-cover object-center md:object-right transition-opacity duration-500 ${showVideo && videoLoaded ? 'opacity-0' : 'opacity-100'
            }`}
          priority
          quality={85}
        />

        {/* Vidéo désactivée pour janvier */}

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

      <div className="relative z-20 mx-auto flex min-h-[70vh] md:min-h-[600px] max-w-7xl items-center px-4 py-8 md:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row w-full gap-6 md:gap-8 items-center md:items-center">
          {/* Card dynamique - Valentine ou standard - CACHÉE sur mobile (la modale suffit) */}
          <div className="hidden md:block w-full md:w-auto md:ml-auto order-first md:order-last">
            {showValentine ? <ValentineHeroCard /> : <DefaultHeroCard />}
          </div>

          {/* Bouton Valentine mobile - ouvre la modale */}
          {showValentine && (
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-valentine-modal'))}
              className="md:hidden absolute top-4 right-4 flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-pink-500 to-red-500 rounded-full border border-pink-300/50 shadow-lg animate-pulse hover:animate-none hover:scale-105 transition-transform"
              aria-label="Voir les offres Saint-Valentin"
            >
              <span className="text-xl">💝</span>
              <span className="text-xs font-bold text-white">-20%</span>
              <span className="text-xl">🌹</span>
            </button>
          )}

          {/* Contenu texte principal */}
          <div className="max-w-2xl text-white order-last md:order-first text-center md:text-left">
            <h1 className="mb-4 md:mb-6 text-[32px] sm:text-[40px] md:text-[48px] lg:text-[60px] font-bold leading-[1.1] tracking-[-0.01em] text-white">
              <span className="block whitespace-nowrap">{subtitle}</span>
              <span className="block text-[#EFC368]">{title}</span>
            </h1>
            <p className="mb-6 md:mb-8 text-base md:text-xl leading-relaxed text-gray-200 px-2 md:px-0">
              {description}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center md:justify-start">
              <Link
                href={primaryCTA.href}
                className="inline-flex items-center justify-center rounded-lg bg-[#EFC368] px-6 py-3 text-base font-semibold text-black shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#d3a74f] hover:shadow-xl"
              >
                {primaryCTA.text}
              </Link>
              <Link
                href={secondaryCTA.href}
                className="inline-flex items-center justify-center rounded-lg border border-white px-6 py-3 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 hover:shadow-xl"
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
