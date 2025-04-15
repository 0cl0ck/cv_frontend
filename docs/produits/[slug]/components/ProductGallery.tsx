'use client';

import { Media } from '@/payload-types';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';

type Props = {
  images: Media[];
  title?: string;
};

export const ProductGallery: React.FC<Props> = ({ images, title = 'Produit' }) => {
  const [selectedImage, setSelectedImage] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square w-full rounded-lg bg-neutral-100 dark:bg-neutral-900">
        <div className="flex h-full items-center justify-center">
          <span className="text-sm text-neutral-500">Aucune image disponible</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-900">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="relative h-full w-full"
          >
            <Image
              src={images[selectedImage].url || ''}
              alt={`${title} - Image ${selectedImage + 1}`}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              priority={selectedImage === 0}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-4">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedImage(index)}
              className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                selectedImage === index
                  ? 'border-primary'
                  : 'border-transparent hover:border-neutral-200 dark:hover:border-neutral-700'
              }`}
            >
              <Image
                src={image.url || ''}
                alt={`${title} - Miniature ${index + 1}`}
                fill
                sizes="(min-width: 1024px) 15vw, 25vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
