'use client';

import React, { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'christmas-modal-closed-2025';

// Période d'affichage: 20-31 décembre 2025 (désactivé pour 2026)
function isChristmasPeriod(): boolean {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed, décembre = 11
  const day = now.getDate();
  return year === 2025 && month === 11 && day >= 20 && day <= 31;
}

export default function ChristmasBanner() {
  const [isVisible, setIsVisible] = useState(false);

  // Fonction pour ouvrir la modale (appelée par l'événement custom)
  const openModal = useCallback(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    // Ne pas afficher hors période de Noël
    if (!isChristmasPeriod()) return;

    // Vérifier si déjà fermé (seulement pour l'affichage auto au chargement)
    const isClosed = localStorage.getItem(STORAGE_KEY) === 'true';
    if (!isClosed) {
      // Petit délai pour l'effet d'entrée
      setTimeout(() => setIsVisible(true), 500);
    }

    // Écouter l'événement custom pour ouvrir la modale manuellement
    const handleOpenEvent = () => openModal();
    window.addEventListener('open-christmas-modal', handleOpenEvent);
    
    return () => {
      window.removeEventListener('open-christmas-modal', handleOpenEvent);
    };
  }, [openModal]);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay sombre */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn"
        onClick={handleClose}
      />
      
      {/* Modale */}
      <div className="relative w-full max-w-2xl animate-scaleIn">
        {/* Bouton fermer */}
        <button
          onClick={handleClose}
          className="absolute -top-3 -right-3 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
          aria-label="Fermer"
        >
          <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Contenu de la modale */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a472a] via-[#0d3320] to-[#8B0000] shadow-2xl border border-[#EFC368]/30">
          {/* Décoration flocons */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute text-white text-2xl animate-snowfall"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${4 + Math.random() * 4}s`,
                }}
              >
                ❄
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="relative text-center pt-8 pb-4 px-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-4xl animate-bounce">🎄</span>
              <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#EFC368] via-[#FFD700] to-[#EFC368] bg-clip-text text-transparent">
                Opérations de Noël
              </h2>
              <span className="text-4xl animate-bounce" style={{ animationDelay: '0.5s' }}>🎅</span>
            </div>
            <p className="text-white/70 text-sm">Du 20 au 31 décembre 2025</p>
          </div>

          {/* Corps */}
          <div className="relative px-6 pb-8 grid md:grid-cols-2 gap-4">
            {/* Chasse à la Pièce d'Or */}
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5 border border-[#EFC368]/30 hover:border-[#EFC368]/60 transition-all hover:scale-[1.02]">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl animate-pulse">🪙</span>
                <h3 className="text-xl font-bold text-[#EFC368]">
                  La Chasse à la Pièce d&apos;Or
                </h3>
              </div>
              <p className="text-white/90 text-sm mb-3">
                <span className="font-bold text-[#FFD700]">3 pièces d&apos;or à trouver</span> = 
                <span className="text-white font-semibold"> 1 an de CBD offert !</span>
              </p>
              <div className="bg-[#EFC368]/10 rounded-lg p-3 border border-[#EFC368]/20">
                <p className="text-white/80 text-sm">
                  <span className="font-bold text-[#EFC368]">Comment participer ?</span><br />
                  Chaque <span className="font-semibold text-white">10g de fleurs ou résines</span> achetés 
                  = <span className="text-[#FFD700] font-bold">1 participation</span>
                </p>
              </div>
            </div>

            {/* Cashback */}
            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5 border border-green-500/30 hover:border-green-500/60 transition-all hover:scale-[1.02]">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl animate-pulse" style={{ animationDelay: '0.3s' }}>💰</span>
                <h3 className="text-xl font-bold text-green-400">
                  Cashback de Noël
                </h3>
              </div>
              <p className="text-white/90 text-sm mb-3">
                Recevez un <span className="font-bold text-green-400">bonus en cagnotte</span> utilisable en janvier !
              </p>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20 flex flex-col justify-center items-center min-h-[70px]">
                  <p className="text-white font-bold">25€</p>
                  <p className="text-green-400 font-bold text-xl whitespace-nowrap">→ 5€</p>
                </div>
                <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20 flex flex-col justify-center items-center min-h-[70px]">
                  <p className="text-white font-bold">50€</p>
                  <p className="text-green-400 font-bold text-xl whitespace-nowrap">→ 10€</p>
                </div>
                <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/20 flex flex-col justify-center items-center min-h-[70px]">
                  <p className="text-white font-bold">100€</p>
                  <p className="text-green-400 font-bold text-xl whitespace-nowrap">→ 20€</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="relative text-center pb-6 px-6">
            <button
              onClick={handleClose}
              className="inline-flex items-center justify-center px-8 py-3 bg-[#EFC368] hover:bg-[#d4a84a] text-black font-bold rounded-lg transition-all hover:scale-105 shadow-lg"
            >
              🎁 J&apos;en profite !
            </button>
            <p className="text-white/50 text-xs mt-4">
              * Cashback utilisable en janvier 2026 uniquement.
            </p>
          </div>
        </div>
      </div>

      {/* Styles d'animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes snowfall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 0;
          }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% {
            transform: translateY(500px) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out forwards;
        }
        .animate-snowfall {
          animation: snowfall linear infinite;
        }
      `}</style>
    </div>
  );
}
