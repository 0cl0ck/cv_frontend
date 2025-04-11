import HomeHero from "@/components/Hero/HomeHero";
import FeaturedProducts from "@/components/sections/FeaturedProducts";
import CategoriesSection from "@/components/sections/CategoriesSection";
import WhyChooseUs from "@/components/sections/WhyChooseUs";

export default function Home() {
  return (
    <>
      <HomeHero />
      <FeaturedProducts />
      <CategoriesSection />
      <WhyChooseUs />
    </>
  );
}
