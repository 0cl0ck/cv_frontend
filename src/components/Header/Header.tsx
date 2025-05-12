'use client';

import { IconChevronDown, IconLogin, IconLogout, IconMenu2, IconPackage, IconUser, IconUserCircle, IconX } from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useAuthContext } from "@/context/AuthContext";

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  
  // Utiliser le contexte d'authentification global
  const { isAuthenticated, logout } = useAuthContext();
  
  // Vérifier si nous sommes sur la page d'accueil
  const isHomePage = pathname === '/';
  
  // Nous n'avons plus besoin de vérifier manuellement l'authentification
  // car le contexte d'authentification global s'en charge déjà
  
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
              {/* Bouton Connexion ou Menu Compte */}
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                    className="px-4 py-2 text-sm font-medium text-black bg-[#EFC368] hover:bg-[#D3A74F] rounded-lg shadow-md transition-colors flex items-center"
                    aria-label="Mon compte"
                  >
                    <IconUserCircle className="md:mr-2 w-5 h-5" />
                    <span className="hidden md:inline">Mon compte</span>
                    <IconChevronDown className="ml-1 w-4 h-4" />
                  </button>
                  
                  {/* Menu déroulant pour utilisateur connecté */}
                  {accountMenuOpen && (
                    <div 
                      className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50"
                      onMouseEnter={() => setAccountMenuOpen(true)}
                      onMouseLeave={() => setAccountMenuOpen(false)}
                    >
                      <Link 
                        href="/compte" 
                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <IconUser className="mr-2 w-4 h-4" />
                        Mon profil
                      </Link>
                      <Link 
                        href="/compte/commandes" 
                        className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                        onClick={() => setAccountMenuOpen(false)}
                      >
                        <IconPackage className="mr-2 w-4 h-4" />
                        Mes commandes
                      </Link>
                      <button 
                        className="flex items-center px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50/30 hover:text-red-600 rounded-lg w-full"
                        onClick={async () => {
                          try {
                            await logout();
                            setAccountMenuOpen(false);
                          } catch (error) {
                            console.error('Erreur lors de la déconnexion:', error);
                            setAccountMenuOpen(false);
                            // En cas d'erreur, forcer la redirection
                            window.location.href = '/';
                          }
                        }}
                      >
                        <IconLogout className="mr-2 w-4 h-4" />
                        Déconnexion
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/connexion"
                  className="px-4 py-2 text-sm font-medium text-black bg-[#EFC368] hover:bg-[#D3A74F] rounded-lg shadow-md transition-colors flex items-center"
                  aria-label="Connexion"
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

            {/* Connexion ou Compte à droite */}
            <div className="flex items-center justify-end">
              {isAuthenticated ? (
                <Link
                  href="/compte"
                  className="p-2 mr-1 text-sm font-medium text-black bg-[#EFC368] hover:bg-[#D3A74F] rounded-lg shadow-md transition-colors flex items-center"
                  aria-label="Mon compte"
                >
                  <IconUserCircle className="w-5 h-5" />
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
          
          {/* Menu compte utilisateur sur mobile */}
          {isAuthenticated ? (
            <>
              <div className="mt-6 border-t border-[#004a59] pt-4">
                <p className="text-white/70 text-sm mb-2">Mon compte</p>
                <Link
                  href="/compte"
                  className="flex text-white items-center text-base font-medium py-2 transition-all duration-200 hover:translate-x-1"
                  onClick={() => setMenuOpen(false)}
                >
                  <IconUser className="mr-3 w-5 h-5" />
                  Mon profil
                </Link>
                <Link
                  href="/compte/commandes"
                  className="flex text-white items-center text-base font-medium py-2 transition-all duration-200 hover:translate-x-1"
                  onClick={() => setMenuOpen(false)}
                >
                  <IconPackage className="mr-3 w-5 h-5" />
                  Mes commandes
                </Link>
                <button 
                  className="flex text-red-400 items-center text-base font-medium py-2 transition-all duration-200 hover:translate-x-1 w-full text-left"
                  onClick={async () => {
                    try {
                      // Utiliser la fonction de déconnexion du contexte d'authentification
                      await logout();
                      setMenuOpen(false);
                    } catch (error) {
                      console.error('Erreur lors de la déconnexion:', error);
                    }
                  }}
                >
                  <IconLogout className="mr-3 w-5 h-5" />
                  Déconnexion
                </button>
              </div>
            </>
          ) : (
            <Link
              href="/connexion"
              className="flex text-white items-center text-base font-medium py-2 transition-all duration-200 hover:translate-x-1 mt-4"
              onClick={() => setMenuOpen(false)}
            >
              <IconLogin className="mr-3 w-5 h-5" />
              Connexion
            </Link>
          )}
        </nav>
      </div>

      {/* Popup d'information sur les comptes clients à venir */}
      {/* Popup supprimée - redirection directe vers /connexion */}
      
      {/* Pas besoin de spacer ici car nous utilisons position relative pour les pages autres que Home */}
    </>
  );
}
