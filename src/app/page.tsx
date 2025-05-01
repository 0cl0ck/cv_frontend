import HomeHero from "@/components/Hero/HomeHero";
import ImageHero from "@/components/Hero/ImageHero";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import CategoriesSection from "@/components/sections/CategoriesSection";
import { StatsWithGridBackground } from "@/components/StatsWithGridBackGround/StatsWithGridBackground";

export default function Home() {
  return (
    <>
      <ImageHero />
      {/* Ancien Hero préservé */}
      {/* <HomeHero /> */}
      <FeaturedProducts />
      <CategoriesSection />
      <StatsWithGridBackground />
    </>
  );
}
