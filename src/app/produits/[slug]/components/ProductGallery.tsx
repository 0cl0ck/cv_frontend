import Image from 'next/image';
import React, { useMemo } from 'react';
import { Product, Media, GalleryImage } from '@/types/product';

interface Props {
  product: Product;
  mainImage: Media | string | undefined;
  setMainImage: (img: Media | undefined) => void;
}

// Extraire l'URL d'un Media ou string
const getImageUrl = (image: Media | string | undefined): string => {
  if (!image) return '';
  if (typeof image === 'string') return image;
  return image.url || '';
};

// Extraire le Media depuis un GalleryImage wrapper
const unwrapGalleryImage = (item: GalleryImage): Media | undefined => {
  if (!item.image) return undefined;
  if (typeof item.image === 'string') {
    return { url: item.image };
  }
  return item.image;
};

// Comparer deux Media pour déterminer si c'est le même
const isSameMedia = (a: Media | string | undefined, b: Media | undefined): boolean => {
  if (!a || !b) return false;
  const urlA = typeof a === 'string' ? a : a.url;
  const urlB = b.url;
  return urlA === urlB;
};

export default function ProductGallery({ product, mainImage, setMainImage }: Props) {
  // Construire la liste complète des images (mainImage + galleryImages)
  const allImages = useMemo(() => {
    const images: Media[] = [];
    
    // Ajouter l'image principale en premier
    if (product.mainImage) {
      images.push(product.mainImage);
    }
    
    // Ajouter les images de la galerie
    if (product.galleryImages && product.galleryImages.length > 0) {
      product.galleryImages.forEach((item) => {
        const media = unwrapGalleryImage(item);
        if (media && !isSameMedia(media, product.mainImage)) {
          images.push(media);
        }
      });
    }
    
    return images;
  }, [product.mainImage, product.galleryImages]);

  // Convertir mainImage en Media pour comparaison
  const currentMainImage = useMemo((): Media | undefined => {
    if (!mainImage) return undefined;
    if (typeof mainImage === 'string') return { url: mainImage };
    return mainImage;
  }, [mainImage]);

  return (
    <div className="md:w-1/2 p-6">
      <div className="relative aspect-square mb-4 rounded-lg overflow-hidden border border-[#3A4A4F]">
        {currentMainImage && (
          <Image
            src={getImageUrl(currentMainImage)}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
            priority
          />
        )}
      </div>
      {allImages.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
          {allImages.map((image, index) => (
            <button
              key={image.id || index}
              onClick={() => setMainImage(image)}
              className={`relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 transition-colors ${
                isSameMedia(currentMainImage, image) ? 'border-[#03745C]' : 'border-[#3A4A4F] hover:border-[#EFC368]'
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

