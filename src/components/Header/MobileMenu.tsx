'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { IconX, IconUser, IconPackage, IconLogout, IconLogin } from '@tabler/icons-react';
import { useAuthContext } from '@/context/AuthContext';

type NavLinkItem = { label: string; url: string };

type MobileMenuProps = {
  menuOpen: boolean;
  setMenuOpen: (state: boolean) => void;
  navItems: NavLinkItem[];
  categoryItems?: NavLinkItem[];
};

export default function MobileMenu({ menuOpen, setMenuOpen, navItems, categoryItems }: MobileMenuProps) {
  const { isAuthenticated, logout } = useAuthContext();

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#00343f] transform transition-transform duration-300 ease-in-out ${
        menuOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between border-b border-[#004a59] p-4">
        <Image src="/logo.png" alt="Chanvre Vert Logo" width={40} height={40} />
        <p className="text-sm text-white">Menu</p>
        <button
          onClick={() => setMenuOpen(false)}
          className="p-2 text-white focus:outline-none"
          aria-label="Fermer le menu"
        >
          <IconX className="h-6 w-6" />
        </button>
      </div>
      <nav className="flex h-[calc(100vh-70px)] flex-col space-y-4 overflow-y-auto px-4 py-4">
        {navItems.map((item) => (
          <Link
            key={item.url}
            href={item.url}
            className="flex items-center py-2 text-base font-medium text-white transition-all duration-200 hover:translate-x-1"
            onClick={() => setMenuOpen(false)}
          >
            {item.label}
          </Link>
        ))}

        {categoryItems && categoryItems.length > 0 ? (
          <div className="mt-6 border-t border-[#004a59] pt-4">
            <p className="mb-2 text-sm text-white/70">Categories</p>
            {categoryItems.map((item) => (
              <Link
                key={item.url}
                href={item.url}
                className="flex items-center py-2 text-base font-medium text-white transition-all duration-200 hover:translate-x-1"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>
        ) : null}

        {isAuthenticated ? (
          <div className="mt-6 border-t border-[#004a59] pt-4">
            <p className="mb-2 text-sm text-white/70">Mon compte</p>
            <Link
              href="/compte"
              className="flex items-center py-2 text-base font-medium text-white transition-all duration-200 hover:translate-x-1"
              onClick={() => setMenuOpen(false)}
            >
              <IconUser className="mr-3 h-5 w-5" />
              Mon profil
            </Link>
            <Link
              href="/compte/commandes"
              className="flex items-center py-2 text-base font-medium text-white transition-all duration-200 hover:translate-x-1"
              onClick={() => setMenuOpen(false)}
            >
              <IconPackage className="mr-3 h-5 w-5" />
              Mes commandes
            </Link>
            <button
              className="flex w-full items-center py-2 text-left text-base font-medium text-red-400 transition-all duration-200 hover:translate-x-1"
              onClick={async () => {
                try {
                  await logout();
                  setMenuOpen(false);
                  window.location.href = '/';
                } catch (error) {
                  console.error('Erreur lors de la deconnexion:', error);
                }
              }}
            >
              <IconLogout className="mr-3 h-5 w-5" />
              Deconnexion
            </button>
          </div>
        ) : (
          <Link
            href="/connexion"
            className="mt-4 flex items-center py-2 text-base font-medium text-white transition-all duration-200 hover:translate-x-1"
            onClick={() => setMenuOpen(false)}
          >
            <IconLogin className="mr-3 h-5 w-5" />
            Connexion
          </Link>
        )}
      </nav>
    </div>
  );
}

