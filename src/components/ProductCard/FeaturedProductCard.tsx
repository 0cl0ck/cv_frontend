'use client';

import { Product } from '@/types/product';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { IconLeaf } from '@tabler/icons-react';

interface FeaturedProductCardProps {
  product: Product;
}

export default function FeaturedProductCard({ product }: FeaturedProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  // Formatage du prix
  const formattedPrice = product.price 
    ? `${product.price.toFixed(2)} €` 
    : 'Prix sur demande';
  
  return (
    <motion.div 
      className="flex flex-col items-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.03 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="relative w-full pb-6">
        {/* Carte avec bordure et ombre */}
        <div className="relative mx-auto overflow-hidden rounded-xl border-2 border-[#004942] shadow-lg shadow-[#004942]/20 bg-[#004942]/10 max-w-[240px] flex flex-col">
          {/* Container de l'image */}
          <Link href={`/produits/${product.slug}`} className="block w-full">
            <div className="relative overflow-hidden">
              {/* Badge CBD */}
              <div className="absolute top-3 left-3 z-10 bg-[#004942] text-white text-xs px-2 py-1 rounded-full flex items-center">
                <IconLeaf size={14} className="mr-1" />
                <span>CBD</span>
              </div>
              
              {/* Image principale */}
              <div className="aspect-square bg-[#004942] relative">
                <motion.div 
                  className="w-full h-full"
                  animate={{ scale: isHovered ? 1.08 : 1 }}
                  transition={{ duration: 0.4 }}
                >
                  {product.mainImage ? (
                    <Image 
                      src={product.mainImage.url || ''} 
                      alt={product.name} 
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                      priority={true}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-white/80">Image non disponible</span>
                    </div>
                  )}
                </motion.div>
                
                {/* Overlay qui apparaît au survol */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-t from-[#004942] to-transparent flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovered ? 0.7 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div 
                    className="absolute bottom-4 left-0 right-0 text-center"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: isHovered ? 0 : 20, opacity: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                  >
                    <span className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-medium">
                      Voir le produit
                    </span>
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </Link>
          
          {/* Information produit */}
          <div className="p-4 text-center bg-gradient-to-b from-[#004942]/5 to-[#004942]/20">
            {/* Nom du produit */}
            <motion.h3 
              className="text-xl font-semibold mb-1 text-white"
              animate={{ color: isHovered ? '#8CE9CF' : 'white' }}
              transition={{ duration: 0.2 }}
            >
              {product.name}
            </motion.h3>
            
            {/* Prix avec fond vert */}
            <div className="mt-2 inline-block px-4 py-1 rounded-full bg-[#004942] text-white">
              <p className="font-medium">{formattedPrice}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
