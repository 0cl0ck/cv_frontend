'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { IconX, IconUser, IconPackage, IconLogout, IconLogin } from '@tabler/icons-react';
import { useAuthContext } from '@/context/AuthContext';

type MobileMenuProps = {
  menuOpen: boolean;
  setMenuOpen: (state: boolean) => void;
  navItems: Array<{ label: string; url: string }>;
};

export default function MobileMenu({ menuOpen, setMenuOpen, navItems }: MobileMenuProps) {
  // Utiliser le contexte d'authentification global
  const { isAuthenticated, logout } = useAuthContext();

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#00343f] transform transition-transform duration-300 ease-in-out ${
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
                    await logout();
                    setMenuOpen(false);
                    window.location.href = '/';
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
  );
}
