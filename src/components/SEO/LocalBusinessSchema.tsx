import React from 'react';

interface StoreData {
    name: string;
    streetAddress: string;
    addressLocality: string;
    postalCode: string;
    latitude: number;
    longitude: number;
    telephone?: string;
    rating: number;
    reviewCount: number;
    googleMapsUrl: string;
}

const STORES: StoreData[] = [
    {
        name: 'Chanvre Vert Bergues',
        streetAddress: '5 rue d\'Ypres',
        addressLocality: 'Bergues',
        postalCode: '59380',
        latitude: 50.9683,
        longitude: 2.4344,
        rating: 4.9,
        reviewCount: 126,
        googleMapsUrl: 'https://maps.google.com/?cid=chanvre-vert-bergues',
    },
    {
        name: 'Chanvre Vert Wormhout',
        streetAddress: 'Wormhout',
        addressLocality: 'Wormhout',
        postalCode: '59470',
        latitude: 50.8778,
        longitude: 2.4683,
        rating: 4.9,
        reviewCount: 56,
        googleMapsUrl: 'https://maps.google.com/?cid=chanvre-vert-wormhout',
    },
];

/**
 * Schéma JSON-LD LocalBusiness pour les boutiques physiques
 * @see https://schema.org/LocalBusiness
 */
export default function LocalBusinessSchema() {
    const schemas = STORES.map((store) => ({
        '@context': 'https://schema.org',
        '@type': 'Store',
        name: store.name,
        image: 'https://www.chanvre-vert.fr/logo.png',
        url: 'https://www.chanvre-vert.fr',
        telephone: store.telephone,
        address: {
            '@type': 'PostalAddress',
            streetAddress: store.streetAddress,
            addressLocality: store.addressLocality,
            postalCode: store.postalCode,
            addressCountry: 'FR',
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: store.latitude,
            longitude: store.longitude,
        },
        aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: store.rating.toString(),
            reviewCount: store.reviewCount.toString(),
            bestRating: '5',
        },
        priceRange: '€€',
    }));

    return (
        <>
            {schemas.map((schema, index) => (
                <script
                    key={index}
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
                />
            ))}
        </>
    );
}
