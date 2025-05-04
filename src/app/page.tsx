import HomeHero from "@/components/Hero/HomeHero";
import ImageHero from "@/components/Hero/ImageHero";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import CategoryGrid from "@/components/sections/CategoryGrid";
import FeaturesBanner from "@/components/sections/FeaturesBanner";
import SocialProofSection from "@/components/sections/SocialProofSection";

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
    </>
  );
}
