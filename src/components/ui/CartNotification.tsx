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
  
  // Auto-dismiss après 5 secondes
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

  // Gérer la fermeture manuelle
  const handleClose = () => {
    setIsVisible(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm bg-[#002935] border border-[#3A4A4F] shadow-lg rounded-lg p-4 md:p-5"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0 text-[#EFC368]">
                <ShoppingBag size={20} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-[#F4F8F5]">
                  Produit ajouté au panier
                </p>
                <p className="mt-1 text-xs text-[#A5B4B9]">
                  {productName}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="ml-4 inline-flex text-[#A5B4B9] hover:text-[#F4F8F5] focus:outline-none focus:text-[#F4F8F5] transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <div className="mt-3">
            <Link
              href="/panier"
              className="flex items-center justify-center bg-[#03745C] hover:bg-[#045E4A] text-[#F4F8F5] text-sm font-medium py-2 px-4 w-full rounded-md transition-colors"
            >
              Voir mon panier
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
