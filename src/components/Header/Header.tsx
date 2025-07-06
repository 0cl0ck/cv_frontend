'use client';

import { IconMenu2, IconUser, IconLogin } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAuthContext } from "@/context/AuthContext";
import MobileMenu from './MobileMenu';
import UserAccountMenu from './UserAccountMenu';

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  
  // Utiliser le contexte d'authentification global
  const { isAuthenticated } = useAuthContext();
  
  // Vérifier si nous sommes sur la page d'accueil
  const isHomePage = pathname === '/';
  
  // Navigation items - extracted for reuse
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
              {/* Bouton Connexion ou Menu Compte */}
              {isAuthenticated ? (
                <UserAccountMenu 
                  accountMenuOpen={accountMenuOpen}
                  setAccountMenuOpen={setAccountMenuOpen}
                />
              ) : (
                <Link 
                  href="/connexion" 
                  className="px-4 py-2 text-sm font-medium text-black bg-[#EFC368] hover:bg-[#D3A74F] rounded-lg shadow-md transition-colors flex items-center"
                >
                  <IconLogin className="md:mr-2 w-5 h-5" />
                  <span className="hidden md:inline">Connexion</span>
                </Link>
              )}
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
                <IconMenu2 className="w-6 h-6 text-white" />
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

            {/* Connexion ou Compte à droite */}
            <div className="flex items-center justify-end">
              {isAuthenticated ? (
                <Link
                  href="/compte"
                  className="p-2 mr-1 text-sm font-medium text-black bg-[#EFC368] hover:bg-[#D3A74F] rounded-lg shadow-md transition-colors flex items-center"
                  aria-label="Mon compte"
                >
                  <IconUser className="w-5 h-5" />
                </Link>
              ) : (
                <Link
                  href="/connexion"
                  className="p-2 mr-1 text-sm font-medium text-black bg-[#EFC368] hover:bg-[#D3A74F] rounded-lg shadow-md transition-colors flex items-center"
                  aria-label="Connexion"
                >
                  <IconLogin className="w-5 h-5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Menu mobile sidebar overlay */}
      <div
        className={`md:hidden fixed inset-0 bg-black/50 z-40 transition-opacity duration-500 ease-in-out ${
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMenuOpen(false)}
      />

      {/* Mobile Menu - using extracted component */}
      <MobileMenu 
        menuOpen={menuOpen} 
        setMenuOpen={setMenuOpen} 
        navItems={navItems} 
      />

      {/* Popup d'information sur les comptes clients à venir */}
      {/* Popup supprimée - redirection directe vers /connexion */}
      
      {/* Pas besoin de spacer ici car nous utilisons position relative pour les pages autres que Home */}
    </>
  );
}
