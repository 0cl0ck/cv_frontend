import Image from "next/image";
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
  imageUrl?: string;
  imageAlt?: string;
}

export default function ImageHero({
  title = "avec du CBD premium certifi\u00E9",
  subtitle = "Boostez votre bien-\u00EAtre",
  description = "D\u00E9couvrez huiles, fleurs et infusions tri\u00E9es pour votre \u00E9quilibre, tra\u00E7abilit\u00E9 claire, livraison express.",
  primaryCTA = {
    text: "D\u00E9couvrir nos produits",
    href: "/produits",
  },
  secondaryCTA = {
    text: "En savoir plus",
    href: "/a-propos",
  },
  imageUrl = "/images/hero/Hero.webp",
  imageAlt = "CBD Premium - Chanvre Vert",
}: HeroProps = {}) {
  return (
    <section className="relative min-h-[600px] overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          sizes="100vw"
          className="object-cover"
          priority
          quality={100}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
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

      <div className="relative z-20 mx-auto flex min-h-[600px] max-w-7xl items-center px-4 md:px-6 lg:px-8">
        <div className="max-w-2xl text-white">
          <h1 className="mb-6 text-[36px] md:text-[48px] lg:text-[60px] font-bold leading-[1] tracking-[-0.01em] text-white">
            <span className="block">{subtitle}</span>
            <span className="block text-[#EFC368]">{title}</span>
          </h1>
          <p className="mb-8 text-lg leading-relaxed text-gray-200 md:text-xl">
            {description}
          </p>
          <div className="flex flex-wrap gap-4">
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
