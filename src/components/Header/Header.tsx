'use client';

import { IconLogin, IconMenu2, IconUser, IconX } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import Image from "next/image";

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showAccountPopup, setShowAccountPopup] = useState(false);
  
  // Vérifier si nous sommes sur la page d'accueil
  const isHomePage = pathname === '/';
  
  // Navigation items
  const navItems = [
    { label: 'Produits', url: '/produits' },
    { label: 'Panier', url: '/panier' }
  ];

  // Effet de défilement
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Empêcher le défilement du body quand le menu est ouvert
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [menuOpen]);

  return (
    <>
      <header
        className={`w-full z-50 transition-all duration-300 ${
          isHomePage
            ? `fixed top-0 left-0 ${isScrolled ? 'bg-background/70 backdrop-blur-lg shadow-md' : 'bg-transparent'}`
            : 'relative bg-[#00343f] text-white shadow-md'
        }`}
      >
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          {/* Desktop layout */}
          <div className="py-4 hidden md:flex justify-between items-center">
            <Link href="/">
              <div className="flex items-center">
                <Image 
                  src="/logo.png" 
                  alt="Chanvre Vert Logo" 
                  width={70} 
                  height={70}
                  className="transition-transform duration-300 hover:scale-105"
                  priority
                />
                <span className="ml-3 font-medium tracking-wide text-xl transition-transform duration-300 hover:scale-105 text-white">
                  Chanvre Vert
                </span>
              </div>
            </Link>
            <div className="flex items-center gap-6">
              {/* Navigation */}
              <nav className="flex gap-3 items-center">
                {navItems.map((item, i) => (
                  <Link 
                    key={i} 
                    href={item.url}
                    className="text-white hover:text-green-400 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
                {/* <Link href="/search" className="flex items-center">
                  <span className="sr-only">Search</span>
                  <SearchIcon className="w-5 text-white" />
                </Link> */}
              </nav>
              {/* Login button */}
              <button
                onClick={() => setShowAccountPopup(true)}
                className="px-4 py-2 text-sm font-medium text-black bg-[#EFC368] hover:bg-[#D3A74F] rounded-lg shadow-md transition-colors flex items-center"
                aria-label="Connexion"
              >
                <IconLogin className="md:mr-2 w-5 h-5" />
                <span className="hidden md:inline">Connexion</span>
              </button>
            </div>
          </div>

          {/* Mobile layout */}
          <div className="py-4 px-4 flex md:hidden justify-between items-center relative">
            {/* Menu hamburger à gauche */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 ml-1 focus:outline-none text-white"
              aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <IconX className="w-6 h-6 text-white" />
              ) : (
                <IconMenu2 className="w-6 h-6 text-white" />
              )}
            </button>

            {/* Logo au centre */}
            <Link href="/" className="absolute left-1/2 transform -translate-x-1/2">
              <Image 
                src="/logo.png" 
                alt="Chanvre Vert Logo" 
                width={60} 
                height={60} 
                className=""
              />
            </Link>

            {/* Connexion à droite */}
            <div className="flex items-center justify-end">
              <button
                onClick={() => setShowAccountPopup(true)}
                className="p-2 mr-1 text-sm font-medium text-black bg-[#EFC368] hover:bg-green-700 rounded-lg shadow-md transition-colors flex items-center"
                aria-label="Connexion"
              >
                <IconLogin className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Menu mobile sidebar */}
      <div
        className={`md:hidden fixed inset-0 bg-black/50 z-[999] transition-opacity duration-500 ease-in-out ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMenuOpen(false)}
      />

      <div
        className={`md:hidden fixed top-0 left-0 z-[1000] w-64 h-screen bg-[#00343f] shadow-lg transform transition-all duration-500 ease-in-out ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex justify-between items-center p-4 border-b border-[#004a59]">
          <Image 
            src="/logo.png" 
            alt="Chanvre Vert Logo" 
            width={40} 
            height={40} 
            className=""
          />
          <p className="text-white text-sm">Menu</p>
          <button
            onClick={() => setMenuOpen(false)}
            className="p-2 text-white focus:outline-none"
            aria-label="Fermer le menu"
          >
            <IconX className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex flex-col py-4 px-4 space-y-4 h-[calc(100vh-70px)] overflow-y-auto">
          <Link
            href="/search"
            className="flex items-center text-base font-medium hover:text-primary text-white py-2 transition-all duration-200 hover:translate-x-1"
            onClick={() => setMenuOpen(false)}
          >
            {/* <SearchIcon className="w-5 h-5 mr-3" />
            Rechercher */}
          </Link>

          {navItems.map((item, i) => (
            <Link
              key={i}
              href={item.url}
              className="flex text-white items-center text-base font-medium py-2 transition-all duration-200 hover:translate-x-1"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* Popup d'information sur les comptes clients à venir */}
      {showAccountPopup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1000] p-4">
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <button 
              onClick={() => setShowAccountPopup(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Fermer"
            >
              <IconX className="w-5 h-5" />
            </button>
            
            <div className="text-center mb-6">
              <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3 inline-flex items-center justify-center mb-4">
                <IconUser className="w-8 h-8 text-green-600 dark:text-green-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Comptes clients bientôt disponibles</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Nous travaillons actuellement sur la mise en place des comptes clients.
                Nous gardons vos emails lors du paiement et toutes vos commandes feront partie de vos informations de compte.
                Cette fonctionnalité sera disponible très prochainement !
              </p>
            </div>
            
            <div className="mt-6 flex flex-col space-y-3">
              <button
                onClick={() => setShowAccountPopup(false)}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                J&apos;ai compris
              </button>
              <button
                onClick={() => setShowAccountPopup(false)}
                className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium py-2 transition-colors"
              >
                Continuer mes achats
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Pas besoin de spacer ici car nous utilisons position relative pour les pages autres que Home */}
    </>
  );
}
