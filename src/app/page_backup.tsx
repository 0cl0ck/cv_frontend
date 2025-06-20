import ImageHero from "@/components/Hero/ImageHero";
import ClientHomeContent from "@/components/ClientHomeContent";

export default function Home() {
  return (
    <>
      {/* Hero section remains eagerly loaded for better LCP */}
      <ImageHero />
      
      {/* All lazy-loaded content is now in the client wrapper */}
      <ClientHomeContent />
    </>
  );
}
