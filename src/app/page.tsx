import ImageHero from "@/components/Hero/ImageHero";
import ClientPageWrapper from "@/components/ClientPageWrapper";

export default function Home() {
  return (
    <>
      {/* Hero section remains eagerly loaded for better LCP */}
      <ImageHero />
      
      {/* All lazy-loaded content is now in the client wrapper */}
      <ClientPageWrapper />
    </>
  );
}
