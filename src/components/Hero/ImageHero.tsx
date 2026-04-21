import Image from 'next/image';
import Link from "next/link";
import { HeroTextAnimated } from './HeroTextAnimated';
import { FourTwentyCountdown } from './FourTwentyCountdown';

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

// Vérifie si on est dans la période 4/20 (18-22 avril 2026, prolongée)
function is420Period(): boolean {
  const now = new Date();
  const from = new Date('2026-04-18T00:00:00+02:00');
  const until = new Date('2026-04-22T23:59:59+02:00');
  return now >= from && now <= until;
}

// Vérifie si on est dans la période teaser pré-4/20 (15-17 avril 2026)
function is420TeaserPeriod(): boolean {
  const now = new Date();
  const from = new Date('2026-04-15T00:00:00+02:00');
  const until = new Date('2026-04-17T23:59:59+02:00');
  return now >= from && now <= until;
}

// Card spéciale 4/20 BONUS X2
function FourTwentyHeroCard() {
  return (
    <div className="neon-container backdrop-blur-sm p-4 md:p-5 rounded-lg text-white border border-emerald-400/40 bg-gradient-to-br from-emerald-700/80 to-green-800/60">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl animate-bounce">🔥</span>
        <p className="font-bold text-base md:text-xl lg:text-2xl tracking-wide text-white text-center md:text-left">
          4/20 = BONUS X2
        </p>
        <span className="text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>🎁</span>
      </div>

      {/* Promo tiers */}
      <div className="mb-3 pb-3 border-b border-white/20 space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm">🌿</span>
          <p className="text-sm md:text-base font-semibold text-emerald-200">
            60€ → <span className="text-white">4g offerts</span> <span className="text-white/50 text-xs line-through">2g</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">🌿</span>
          <p className="text-sm md:text-base font-semibold text-emerald-200">
            100€ → <span className="text-white">20g offerts</span> <span className="text-white/50 text-xs line-through">10g</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm">🌿</span>
          <p className="text-sm md:text-base font-semibold text-emerald-200">
            180€ → <span className="text-white">40g offerts</span> <span className="text-white/50 text-xs line-through">20g</span>
          </p>
        </div>
      </div>

      {/* Info */}
      <div>
        <p className="text-xs md:text-sm text-white/80">
          ✨ Cadeaux doublés automatiquement dans votre panier
        </p>
      </div>

      <p className="mt-3 text-[10px] md:text-xs text-white/60 italic text-center md:text-left">
        Du 18 au 20 avril 2026
      </p>
    </div>
  );
}

// Card teaser pré-4/20 avec countdown — palette chaude assortie au Hero
function FourTwentyTeaserCard() {
  return (
    <div className="relative backdrop-blur-md p-5 md:p-6 rounded-xl text-white border border-[#EFC368]/20 bg-black/50 shadow-2xl shadow-black/30">
      {/* Bordure lumineuse dorée subtile */}
      <div className="absolute -inset-px rounded-xl bg-gradient-to-br from-[#EFC368]/15 via-transparent to-white/5 pointer-events-none" aria-hidden />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="text-lg" aria-hidden>🔥</span>
          <p className="font-bold text-base md:text-xl lg:text-2xl tracking-wide text-[#EFC368] text-center">
            LE 4/20 ARRIVE
          </p>
          <span className="text-lg" aria-hidden>🔥</span>
        </div>

        {/* Countdown */}
        <div className="mb-4 pb-4 border-b border-white/10">
          <FourTwentyCountdown />
        </div>

        {/* Aperçu des paliers doublés */}
        <div className="mb-4 space-y-2">
          <p className="text-[10px] md:text-xs uppercase tracking-widest text-[#EFC368]/70 mb-2.5 text-center font-medium">
            Cadeaux × 2 — du 18 au 20 avril
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 rounded-lg bg-white/[0.05] px-3 py-1.5">
              <span className="text-sm" aria-hidden>🌿</span>
              <p className="text-sm md:text-base font-semibold text-white/90">
                60€ → <span className="text-[#EFC368] font-bold">4g offerts</span> <span className="text-white/35 text-xs line-through">2g</span>
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-white/[0.05] px-3 py-1.5">
              <span className="text-sm" aria-hidden>🌿</span>
              <p className="text-sm md:text-base font-semibold text-white/90">
                100€ → <span className="text-[#EFC368] font-bold">20g offerts</span> <span className="text-white/35 text-xs line-through">10g</span>
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-white/[0.05] px-3 py-1.5">
              <span className="text-sm" aria-hidden>🌿</span>
              <p className="text-sm md:text-base font-semibold text-white/90">
                180€ → <span className="text-[#EFC368] font-bold">40g offerts</span> <span className="text-white/35 text-xs line-through">20g</span>
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs md:text-sm text-white/60 text-center">
          ✨ Préparez votre panier !
        </p>
      </div>
    </div>
  );
}

// Card standard (hors période promo)
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
  imageUrl = "/images/hero/HeroPrintemps.webp",
}: HeroProps = {}) {
  // Affichage card spéciale basé sur la période
  const show420 = is420Period();
  const show420Teaser = !show420 && is420TeaserPeriod();

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

      <div className="relative z-30 mx-auto flex min-h-[70vh] lg:min-h-[600px] max-w-7xl items-center px-4 py-8 md:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row w-full gap-6 lg:gap-8 items-center lg:items-center">
          {/* Card dynamique - 4/20 ou standard */}
          <div className="w-full lg:w-auto lg:ml-auto order-first lg:order-last">
            {show420 ? <FourTwentyHeroCard /> : show420Teaser ? <FourTwentyTeaserCard /> : <DefaultHeroCard />}
          </div>

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

