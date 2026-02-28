import React from 'react';

/**
 * Schéma JSON-LD WebSite avec SearchAction (Sitelinks Search Box)
 * @see https://schema.org/WebSite
 */
export default function WebSiteSchema() {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Chanvre Vert',
        url: 'https://www.chanvre-vert.fr',
        description: 'Boutique en ligne de CBD de qualité en France : fleurs, huiles, résines et infusions certifiées.',
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: 'https://www.chanvre-vert.fr/produits?q={search_term_string}',
            },
            'query-input': 'required name=search_term_string',
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
