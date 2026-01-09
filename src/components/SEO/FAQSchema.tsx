import React from 'react';
import { FAQItem } from '@/types/product';

interface FAQSchemaProps {
  items: FAQItem[] | null | undefined;
}

/**
 * Génère le schema JSON-LD FAQPage pour les moteurs de recherche
 * @see https://schema.org/FAQPage
 */
export default function FAQSchema({ items }: FAQSchemaProps) {
  // Ne rien générer si pas de FAQ
  if (!items || items.length === 0) {
    return null;
  }

  // Fonction helper pour extraire le texte brut du RichText
  const extractTextFromRichText = (content: FAQItem['answer']): string => {
    if (!content || !content.root || !content.root.children) {
      return '';
    }

    const extractText = (nodes: Array<Record<string, unknown>>): string => {
      return nodes.map(node => {
        if (typeof node.text === 'string') {
          return node.text;
        }
        if (Array.isArray(node.children)) {
          return extractText(node.children as Array<Record<string, unknown>>);
        }
        return '';
      }).join('');
    };

    return extractText(content.root.children);
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: extractTextFromRichText(item.answer),
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
    />
  );
}
