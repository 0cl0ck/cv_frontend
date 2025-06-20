'use client';

import React, { useRef, useEffect } from 'react';
import Link from 'next/link';
import { IconUserCircle, IconUser, IconPackage, IconLogout } from '@tabler/icons-react';
import { useAuthContext } from '@/context/AuthContext';

type UserAccountMenuProps = {
  accountMenuOpen: boolean;
  setAccountMenuOpen: (state: boolean) => void;
};

export default function UserAccountMenu({ accountMenuOpen, setAccountMenuOpen }: UserAccountMenuProps) {
  const { logout } = useAuthContext();
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Close the menu when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setAccountMenuOpen]);

  return (
    <div className="relative">
      <button
        onClick={() => setAccountMenuOpen(!accountMenuOpen)}
        className="px-4 py-2 text-sm font-medium text-black bg-[#EFC368] hover:bg-[#D3A74F] rounded-lg shadow-md transition-colors flex items-center"
        aria-label="Mon compte"
      >
        <IconUserCircle className="md:mr-2 w-5 h-5" />
        <span className="hidden md:inline">Mon compte</span>
      </button>

      {/* Dropdown du menu compte */}
      {accountMenuOpen && (
        <div 
          ref={menuRef}
          className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#002830] rounded-lg shadow-lg overflow-hidden border border-[#004a59]/20 z-50"
        >
          <Link href="/compte" className="px-4 py-2 text-sm text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-[#004a59]/40 flex items-center">
            <IconUser className="mr-2 w-4 h-4" />
            Mon profil
          </Link>
          <Link href="/compte/commandes" className="px-4 py-2 text-sm text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-[#004a59]/40 flex items-center">
            <IconPackage className="mr-2 w-4 h-4" />
            Mes commandes
          </Link>
          <button 
            onClick={async () => {
              try {
                await logout();
                setAccountMenuOpen(false);
                window.location.href = '/';
              } catch (error) {
                console.error('Erreur lors de la déconnexion:', error);
              }
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-200 dark:hover:bg-[#004a59]/40 flex items-center"
          >
            <IconLogout className="mr-2 w-4 h-4" />
            Déconnexion
          </button>
        </div>
      )}
    </div>
  );
}
