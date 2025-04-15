import HomeHero from "@/components/Hero/HomeHero";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import CategoriesSection from "@/components/sections/CategoriesSection";
import { StatsWithGridBackground } from "@/components/StatsWithGridBackGround/StatsWithGridBackground";

export default function Home() {
  return (
    <>
      <HomeHero />
      <FeaturedProducts />
      <CategoriesSection />
      <StatsWithGridBackground />
    </>
  );
}
