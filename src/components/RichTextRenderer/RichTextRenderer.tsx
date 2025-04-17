'use client';

import React from 'react';
import { RichTextContent } from '@/types/product';

interface RichTextRendererProps {
  content: string | RichTextContent | undefined;
}

/**
 * Composant pour rendre correctement le contenu riche (RichTextContent)
 */
export const RichTextRenderer: React.FC<RichTextRendererProps> = ({ content }) => {
  // Si le contenu est vide ou undefined
  if (!content) {
    return <p>Description non disponible</p>;
  }

  // Si le contenu est une chaîne simple
  if (typeof content === 'string') {
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  }

  // Si le contenu est un objet RichTextContent
  try {
    if (content.root && content.root.children) {
      return <RichTextNode nodes={content.root.children} />;
    }
  } catch (error) {
    console.error('Erreur lors du rendu du texte riche:', error);
  }

  return <p>Découvrez ce produit de qualité</p>;
};

/**
 * Composant pour rendre récursivement les nœuds du contenu riche
 */
const RichTextNode: React.FC<{ nodes: Array<Record<string, unknown>> }> = ({ nodes }) => {
  if (!nodes || !Array.isArray(nodes)) {
    return null;
  }

  return (
    <>
      {nodes.map((node, index) => {
        // Nœud texte simple
        if (node.text) {
          let textContent = node.text as string;
          let style: React.CSSProperties = {};

          // Appliquer les styles en fonction des attributs du nœud
          if (node.bold) style.fontWeight = 'bold';
          if (node.italic) style.fontStyle = 'italic';
          if (node.underline) style.textDecoration = 'underline';
          if (node.strikethrough) style.textDecoration = 'line-through';
          if (node.code) style.fontFamily = 'monospace';
          if (node.color) style.color = node.color as string;

          return (
            <span key={index} style={style}>
              {textContent}
            </span>
          );
        }

        // Nœuds avec des enfants
        if (node.children && Array.isArray(node.children)) {
          let Element: any = 'div';
          
          // Déterminer le type d'élément en fonction du type de nœud
          switch (node.type) {
            case 'paragraph':
              Element = 'p';
              break;
            case 'heading':
              Element = `h${node.tag || 1}`; // h1, h2, etc.
              break;
            case 'list':
              Element = node.listType === 'ordered' ? 'ol' : 'ul';
              break;
            case 'listitem':
              Element = 'li';
              break;
            case 'quote':
              Element = 'blockquote';
              break;
            case 'link':
              Element = 'a';
              break;
            default:
              Element = 'div';
          }

          // Attributs spécifiques pour certains éléments
          const props: Record<string, unknown> = {};
          if (node.type === 'link' && node.url) {
            props.href = node.url;
            props.target = '_blank';
            props.rel = 'noopener noreferrer';
          }

          // Style en fonction du format du nœud
          const style: React.CSSProperties = {};
          if (node.format === 'center') style.textAlign = 'center';
          if (node.format === 'right') style.textAlign = 'right';
          if (node.format === 'justify') style.textAlign = 'justify';
          
          // Marge pour l'indentation
          if (node.indent && typeof node.indent === 'number') {
            style.marginLeft = `${node.indent * 20}px`;
          }

          return (
            <Element key={index} style={style} {...props}>
              <RichTextNode nodes={node.children as Array<Record<string, unknown>>} />
            </Element>
          );
        }

        return null;
      })}
    </>
  );
};
