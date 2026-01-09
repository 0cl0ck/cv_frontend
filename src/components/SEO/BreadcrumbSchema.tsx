import React from 'react';

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

/**
 * Génère le schema JSON-LD BreadcrumbList pour les moteurs de recherche
 * @see https://schema.org/BreadcrumbList
 */
export default function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  if (!items || items.length === 0) {
    return null;
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
    />
  );
}

/**
 * Helper pour générer les items de breadcrumb
 */
export function generateBreadcrumbs(
  baseUrl: string,
  paths: { name: string; path: string }[]
): BreadcrumbItem[] {
  return [
    { name: 'Accueil', url: baseUrl },
    ...paths.map(p => ({
      name: p.name,
      url: `${baseUrl}${p.path}`,
    })),
  ];
}
