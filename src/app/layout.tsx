import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GoogleTagManager, GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import CsrfInitializer from "@/components/CsrfInitializer";
import ClientLayoutWrapper from "@/components/ClientLayoutWrapper";
import DynamicWidgets from "@/components/DynamicWidgets";

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
    <html lang="fr">
      <GoogleTagManager gtmId="GTM-M3HTFJZD" />
      <GoogleAnalytics gaId="G-9HWW8S63HD" />
      <head>
        {/* Preload LCP hero image — browser discovers it before JS parsing */}
        <link
          rel="preload"
          as="image"
          href="/images/hero/HeroHiver.webp"
          type="image/webp"
          fetchPriority="high"
        />

        {/* Preconnect to critical origins — eliminates DNS+TLS latency */}
        <link rel="preconnect" href="https://api.chanvre-vert.fr" />
        <link rel="preconnect" href="https://media.chanvre-vert.fr" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />

        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#126E62" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />

        {/* Organization JSON-LD for rich snippets */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Chanvre Vert",
              "url": "https://www.chanvre-vert.fr",
              "logo": "https://www.chanvre-vert.fr/logo.png",
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
        <AuthProvider>
          <CartProvider>
            <CsrfInitializer />
            <DynamicWidgets />

            <Header initialCategories={initialCategories} />
            <main className="flex-grow bg-[#001E27]">
              {children}
            </main>
            <Footer />
            <ClientLayoutWrapper />
            <Analytics />
            <SpeedInsights />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}