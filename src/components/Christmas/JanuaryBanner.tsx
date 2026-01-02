'use client';

import React, { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'january-modal-closed-2026';

export default function JanuaryBanner() {
    const [isVisible, setIsVisible] = useState(false);

    // Fonction pour ouvrir la modale (appelée par l'événement custom)
    const openModal = useCallback(() => {
        setIsVisible(true);
    }, []);

    useEffect(() => {
        // Vérifier si déjà fermé (seulement pour l'affichage auto au chargement)
        const isClosed = localStorage.getItem(STORAGE_KEY) === 'true';
        if (!isClosed) {
            // Petit délai pour l'effet d'entrée
            setTimeout(() => setIsVisible(true), 500);
        }

        // Écouter l'événement custom pour ouvrir la modale manuellement
        const handleOpenEvent = () => openModal();
        window.addEventListener('open-january-modal', handleOpenEvent);
        // Aussi écouter l'ancien événement pour compatibilité
        window.addEventListener('open-christmas-modal', handleOpenEvent);

        return () => {
            window.removeEventListener('open-january-modal', handleOpenEvent);
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
            <div className="relative w-full max-w-lg animate-scaleIn">
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
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1a472a] via-[#0d3320] to-[#2d5a3d] shadow-2xl border border-green-500/30">
                    {/* Confettis/étoiles animés */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
                        {[...Array(12)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute text-yellow-400 text-xl animate-pulse"
                                style={{
                                    left: `${Math.random() * 100}%`,
                                    top: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 2}s`,
                                }}
                            >
                                ✨
                            </div>
                        ))}
                    </div>

                    {/* Header */}
                    <div className="relative text-center pt-8 pb-4 px-6">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <span className="text-4xl animate-bounce">🎉</span>
                            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-400 via-emerald-300 to-green-400 bg-clip-text text-transparent">
                                Bonne Année 2026 !
                            </h2>
                            <span className="text-4xl animate-bounce" style={{ animationDelay: '0.5s' }}>🥳</span>
                        </div>
                        <p className="text-white/70 text-sm">Votre cadeau de Noël vous attend !</p>
                    </div>

                    {/* Corps */}
                    <div className="relative px-6 pb-8">
                        {/* Cashback disponible */}
                        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-5 border border-green-500/30">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-4xl animate-pulse">💰</span>
                                <h3 className="text-xl font-bold text-green-400">
                                    Votre Cashback est Disponible !
                                </h3>
                            </div>
                            <p className="text-white/90 text-sm mb-4">
                                Votre cagnotte de Noël est maintenant <span className="font-bold text-green-400">utilisable sur vos commandes</span> tout au long du mois de janvier !
                            </p>
                            <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                                <p className="text-white/80 text-sm text-center">
                                    <span className="text-2xl">🛒</span><br />
                                    La réduction sera <span className="font-semibold text-green-400">automatiquement appliquée</span> à votre panier.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="relative text-center pb-6 px-6">
                        <button
                            onClick={handleClose}
                            className="inline-flex items-center justify-center px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-all hover:scale-105 shadow-lg"
                        >
                            🎁 Voir mes produits
                        </button>
                        <p className="text-white/50 text-xs mt-4">
                            * Cashback valable jusqu&apos;au 31 janvier 2026.
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
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        .animate-scaleIn {
          animation: scaleIn 0.4s ease-out forwards;
        }
      `}</style>
        </div>
    );
}
