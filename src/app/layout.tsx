import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { CartProvider } from "@/context/CartContext";
import { ClientCookieManager } from "@/components/CookieConsent/ClientCookieManager";


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
  return (
    <html lang="fr" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#126E62" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-gray-950 text-gray-50`}
      >
        <CartProvider>
          <Header />
          <main className="flex-grow bg-[#001E27]">
            {children}
          </main>
          <Footer />
          <ClientCookieManager />
        </CartProvider>
      </body>
    </html>
  );
}
