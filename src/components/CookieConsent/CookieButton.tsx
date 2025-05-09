'use client';

import React from 'react';

export const CookieButton: React.FC = () => {
  const handleOpenCookieManager = () => {
    if (typeof window !== 'undefined') {
      const customWindow = window as Window & { openCookieManager?: () => void };
      if (customWindow.openCookieManager) {
        customWindow.openCookieManager();
      }
    }
  };

  return (
    <button 
      className="mt-3 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-colors"
      onClick={handleOpenCookieManager}
    >
      Gérer mes cookies
    </button>
  );
};

export default CookieButton;
