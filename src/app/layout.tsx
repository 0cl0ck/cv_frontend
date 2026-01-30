import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleTagManager, GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import CsrfInitializer from "@/components/CsrfInitializer";
// ResourcePreload supprimé - causait des warnings "preloaded but not used"
// Les fonts sont gérées via next/font avec display:swap
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import FontLoader from "@/components/Performance/FontLoader";
import AgeVerificationModal from '@/components/AgeVerificationModal/AgeVerificationModal';
import MobileBonusWidget from '@/components/Loyalty/MobileBonusWidget';
import { JanuaryBanner } from '@/components/Christmas';
// OAuthExchange removed - handled by dedicated /compte/oauth page

import { getCategories, fallbackCategories } from "@/services/api";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  title: "Chanvre Vert | Produits CBD de Qualité",
  description: "Découvrez notre sélection de produits CBD de haute qualité : fleurs, huiles, infusions et résines.",
  applicationName: "Chanvre Vert",
  keywords: ["CBD", "chanvre", "bio", "fleurs CBD", "huiles CBD", "bien-être"],
  authors: [{ name: "Chanvre Vert" }],
  creator: "Chanvre Vert",
  publisher: "Chanvre Vert",
  formatDetection: {
    telephone: true,
    date: true,
    address: true,
    email: true,
    url: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialCategories = await getCategories().catch(() => fallbackCategories);

  // criticalResources et ResourcePreload supprimés - voir commentaire ligne 10

  return (
    <html lang="fr" className="optimize-fonts">
      <GoogleTagManager gtmId="GTM-M3HTFJZD" />
      <GoogleAnalytics gaId="G-9HWW8S63HD" />
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#126E62" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />

        {/* Optimize font loading with minimal FOUT */}
        <style dangerouslySetInnerHTML={{
          __html: `
          /* Prevent Flash of Unstyled Text with font-display strategy */
          @font-face {
            font-family: 'Geist';
            font-display: swap;
          }
          @font-face {
            font-family: 'Geist Mono';
            font-display: swap;
          }
          
          /* Hide content briefly until fonts load or timeout */
          .optimize-fonts:not(.fonts-loaded) .fonts-sensitive {
            /* Only apply to text that's visually critical */
            opacity: 0.99;
          }
          
          /* Apply once fonts are loaded */
          .fonts-loaded .fonts-sensitive {
            opacity: 1;
          }
        ` }} />
        
        {/* Organization JSON-LD for rich snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Chanvre Vert",
              "url": "https://chanvre-vert.fr",
              "logo": "https://chanvre-vert.fr/logo.png",
              "description": "Spécialiste du CBD en France - Fleurs, huiles, infusions et résines de haute qualité",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "5 rue d'Ypres",
                "addressLocality": "Bergues",
                "postalCode": "59380",
                "addressCountry": "FR"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "email": "contact@chanvre-vert.fr",
                "contactType": "customer service",
                "availableLanguage": "French"
              },
              "sameAs": [
                "https://www.facebook.com/CBDBerguois",
                "https://www.instagram.com/chanvre_vert_officiel_/"
              ]
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-gray-950 text-gray-50`}
      >
        {/* Preload supprimé */}
        <AgeVerificationModal />
        <AuthProvider>
          <CartProvider>
            <FontLoader />
            <CsrfInitializer />

            <Header initialCategories={initialCategories} />
            <JanuaryBanner />
            <MobileBonusWidget />
            <main className="flex-grow bg-[#001E27]">
              {children}
            </main>
            <Footer />
            <ClientLayoutWrapper />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}