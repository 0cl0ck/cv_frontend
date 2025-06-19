import ImageHero from "@/components/Hero/ImageHero";
import dynamic from 'next/dynamic';

// Lazy load below-the-fold components to improve initial page load performance
const FeaturedProducts = dynamic(() => import("@/components/sections/FeaturedProducts"), { ssr: true });
const CategoryGrid = dynamic(() => import("@/components/sections/CategoryGrid"), { ssr: true });
const FeaturesBanner = dynamic(() => import("@/components/sections/FeaturesBanner"), { ssr: true });
const SocialProofSection = dynamic(() => import("@/components/sections/SocialProofSection"), { ssr: true });
const ContactSection = dynamic(() => import("@/components/sections/ContactSection"), { ssr: true });

export default function Home() {
  return (
    <>
      <ImageHero />
      {/* Ancien Hero préservé */}
      {/* <HomeHero /> */}
      <FeaturedProducts />
      <CategoryGrid />
      <FeaturesBanner />
      <SocialProofSection />
      <ContactSection />
    </>
  );
}
