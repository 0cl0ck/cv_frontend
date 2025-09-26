'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CartNotificationProps {
  productName: string;
  show: boolean;
  onClose: () => void;
}

export default function CartNotification({ productName, show, onClose }: CartNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Auto-dismiss after 5 seconds
  useEffect(() => {
    setIsVisible(show);

    if (show) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  // Handle manual close
  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.25 }}
          className="fixed top-4 md:top-auto md:bottom-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm bg-[#002935] border border-[#3A4A4F] shadow-md rounded-lg px-4 py-3 md:px-5 md:py-4"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#013845] text-[#EFC368]">
              <ShoppingBag size={18} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-[#F4F8F5]">
                Produit ajoute au panier
              </p>
              <p className="mt-0.5 text-xs text-[#A5B4B9]">
                {productName}
              </p>
              <Link
                href="/panier"
                className="mt-2 inline-flex items-center text-xs font-semibold uppercase tracking-wide text-[#EFC368] hover:text-[#F4F8F5] transition-colors"
              >
                Voir mon panier
              </Link>
            </div>
            <button
              onClick={handleClose}
              className="mt-1 inline-flex text-[#A5B4B9] hover:text-[#F4F8F5] focus:outline-none focus:text-[#F4F8F5] transition-colors"
              aria-label="Fermer la notification"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
