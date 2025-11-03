'use client';

import { useState, useEffect } from 'react';
import { toggleHalloweenTheme, isHalloweenThemeActive } from '@/utils/utils';

/**
 * Composant simple pour activer/désactiver le thème Halloween
 * Peut être ajouté dans le Header ou ailleurs dans l'interface
 */
export default function HalloweenToggle() {
  const [isHalloween, setIsHalloween] = useState(false);

  useEffect(() => {
    // Vérifier l'état initial
    setIsHalloween(isHalloweenThemeActive());
  }, []);

  const handleToggle = () => {
    toggleHalloweenTheme();
    setIsHalloween(isHalloweenThemeActive());
  };

  return (
    <button
      onClick={handleToggle}
      className={`px-4 py-2 rounded-md transition-colors ${
        isHalloween
          ? 'bg-cv-yellow text-cv-dark-blue-nearBlack'
          : 'bg-cv-gray-border text-cv-gray-veryLight hover:bg-cv-gray-secondary'
      }`}
      aria-label={isHalloween ? 'Désactiver le thème Halloween' : 'Activer le thème Halloween'}
      title={isHalloween ? 'Thème Halloween actif' : 'Activer le thème Halloween'}
    >
      {isHalloween ? '🎃 Halloween' : '🎃 Activer Halloween'}
    </button>
  );
}




