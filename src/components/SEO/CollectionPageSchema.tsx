import React from 'react';

interface CollectionPageSchemaProps {
  name: string;
  description: string;
  url: string;
  numberOfItems: number;
  image?: string;
}

/**
 * Génère le schema JSON-LD CollectionPage pour les pages catégories
 * @see https://schema.org/CollectionPage
 */
export default function CollectionPageSchema({
  name,
  description,
  url,
  numberOfItems,
  image,
}: CollectionPageSchemaProps) {
  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: name,
    description: description,
    url: url,
    numberOfItems: numberOfItems,
    ...(image && {
      image: {
        '@type': 'ImageObject',
        url: image,
      },
    }),
    isPartOf: {
      '@type': 'WebSite',
      name: 'Chanvre Vert',
      url: url.split('/produits')[0], // Base URL
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
    />
  );
}
