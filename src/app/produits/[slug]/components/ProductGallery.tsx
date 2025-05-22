import Image from 'next/image';
import React from 'react';
import { Product, Media } from '@/types/product';

interface Props {
  product: Product;
  mainImage: Media | string | undefined;
  setMainImage: (img: Media | string | undefined) => void;
}

const getImageUrl = (image: Media | string | undefined): string => {
  if (!image) return '';
  if (typeof image === 'string') return image;
  return image.url || '';
};

export default function ProductGallery({ product, mainImage, setMainImage }: Props) {
  return (
    <div className="md:w-1/2 p-6">
      <div className="relative aspect-square mb-4 rounded-lg overflow-hidden border border-[#3A4A4F]">
        {mainImage && (
          <Image
            src={getImageUrl(mainImage)}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
            priority
          />
        )}
      </div>
      {product.galleryImages && product.galleryImages.length > 1 && (
        <div className="flex gap-2 mt-4">
          {product.galleryImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setMainImage(image)}
              className={`relative w-20 h-20 rounded-md overflow-hidden border-2 ${
                mainImage === image ? 'border-[#03745C]' : 'border-[#3A4A4F]'
              }`}
            >
              <Image
                src={getImageUrl(image)}
                alt={`${product.name} - Image ${index + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
