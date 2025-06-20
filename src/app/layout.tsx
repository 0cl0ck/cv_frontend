import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import CsrfInitializer from "@/components/CsrfInitializer";
import ResourcePreload from "@/components/Performance/ResourcePreload";
import ClientCookieManagerWrapper from "@/components/CookieConsent/ClientCookieManagerWrapper";
import FontLoader from "@/components/Performance/FontLoader";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Define critical resources to preload
  const criticalResources = [
    {
      href: "/Chanvre_Vert_Hero_3.png",
      as: "image" as const,
      importance: "high" as const
    },
    {
      href: "/logo.png",
      as: "image" as const,
      importance: "high" as const
    }
  ];

  return (
    <html lang="fr" className="optimize-fonts">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#126E62" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        {/* DNS Prefetch and Preconnect to Google Fonts */}
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Preload critical fonts to improve LCP and reduce CLS */}
        <link 
          rel="preload" 
          href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&display=swap"
          as="style" 
          crossOrigin="anonymous" 
        />
        
        {/* Optimize font loading with minimal FOUT */}
        <style dangerouslySetInnerHTML={{ __html: `
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
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-gray-950 text-gray-50`}
      >
        {/* Preload critical resources */}
        <ResourcePreload resources={criticalResources} />
        
        {/* Optimize context wrapping to reduce nesting */}
        <CartProvider>
          <AuthProvider>
            <>
              {/* Font loading optimization */}
              <FontLoader />
              
              <CsrfInitializer />
              <Header />
              <main className="flex-grow bg-[#001E27]">
                {children}
              </main>
              <Footer />
              <ClientCookieManagerWrapper />
            </>
          </AuthProvider>
        </CartProvider>
      </body>
    </html>
  );
}
