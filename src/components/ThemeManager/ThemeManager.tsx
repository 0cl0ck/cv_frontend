'use client';

import { useEffect } from 'react';
import { initDarkMode, initHalloweenTheme } from '@/utils/utils';

/**
 * Composant pour initialiser les thèmes au chargement de la page
 * Gère le dark mode et le thème Halloween
 */
export default function ThemeManager() {
  useEffect(() => {
    // Initialiser le dark mode
    initDarkMode();
    
    // Initialiser le thème Halloween (si activé)
    initHalloweenTheme();
  }, []);

  return null; // Ce composant ne rend rien
}


