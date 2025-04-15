'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
// Ces imports sont préparés pour une fonctionnalité future de thème dark/light
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { cn } from '@/lib/utils';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { IconSun, IconMoon } from '@tabler/icons-react';

export default function Footer() {
  // État pour le thème (simplifié par rapport au ThemeSelector)
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Fonction simplifiée pour basculer le thème (préparée pour une fonctionnalité future)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    // Mettre à jour les classes sur l'élément HTML
    document.documentElement.classList.toggle('dark', newMode);
    document.documentElement.classList.toggle('light', !newMode);
    
    // Stocker la préférence
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };
  
  // Navigation items statiques
  const navItems = [
    { label: 'À propos', url: '/about' },
    { label: 'Contact', url: '/contact' },
    { label: 'Mentions légales', url: '/legal' },
  ];

  return (
    <footer className="mt-auto bg-gradient-to-r from-[#126D62] to-[#002D4C] text-white w-full">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8 gap-8 flex flex-col md:flex-row md:justify-between">
        <Link className="flex items-center" href="/">
          <div className="flex items-center">
            <Image 
              src="/logo.png" 
              alt="Chanvre Vert Logo" 
              width={70} 
              height={70}
              className="transition-transform duration-300 hover:scale-105"
            />
            <span className="ml-3 font-medium tracking-wide text-xl transition-transform duration-300 hover:scale-105 text-white">
              Chanvre Vert
            </span>
          </div>
        </Link>

        <div className="flex flex-col-reverse items-start md:flex-row gap-4 md:items-center">
          {/* Sélecteur de thème simplifié */}
          {/* <button 
            onClick={toggleTheme}
            className={cn(
              "p-2 rounded-full transition-colors",
              isDarkMode 
                ? "bg-gray-700 hover:bg-gray-600" 
                : "bg-gray-200 hover:bg-gray-300 text-gray-900"
            )}
            aria-label={isDarkMode ? "Passer au mode clair" : "Passer au mode sombre"}
          >
            {isDarkMode ? <IconSun size={20} /> : <IconMoon size={20} />}
          </button> */}
          
          {/* Navigation */}
          <nav className="flex justify-center items-center flex-col md:flex-row gap-4">
            {navItems.map((item, i) => (
              <Link 
                key={i} 
                href={item.url}
                className="text-white hover:text-green-200 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
      
      {/* Section des informations légales supplémentaires */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-4 border-t border-white/20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-white/70">
            &copy; {new Date().getFullYear()} Chanvre Vert - Tous droits réservés
          </p>
          
          <div className="flex gap-4">
            <Link href="/privacy" className="text-sm text-white/70 hover:text-white">
              Politique de confidentialité
            </Link>
            <Link href="/terms" className="text-sm text-white/70 hover:text-white">
              Conditions d&apos;utilisation
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
