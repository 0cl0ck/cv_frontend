'use client';

import React, { ElementType } from 'react';
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
    // Permettre à la fois le HTML et les caractères d'émojis
    // Le HTML sera interprété correctement et les émojis seront affichés comme des caractères normaux
    const formattedContent = processTextWithEmojis(content);
    return <div dangerouslySetInnerHTML={{ __html: formattedContent }} />;
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
 * Fonction pour traiter le texte et s'assurer que les émojis et autres caractères spéciaux
 * sont correctement affichés
 */
function processTextWithEmojis(text: string): string {
  // Détecter si le texte est déjà du HTML
  const isHTML = /<[a-z][\s\S]*>/i.test(text);
  
  // Si c'est déjà du HTML, le retourner tel quel
  if (isHTML) {
    return text;
  }
  
  // Sinon, convertir les sauts de ligne en balises <br />
  const withLineBreaks = text.replace(/\n/g, '<br />');
  
  // Détection de patterns markdown basiques
  // Transformer **texte** en <strong>texte</strong>
  const withBold = withLineBreaks.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  
  // Transformer *texte* en <em>texte</em>
  const withItalic = withBold.replace(/(\s|^)\*([^\*\s].+?[^\*\s])\*(\s|$)/g, '$1<em>$2</em>$3');
  
  // Les émojis sont des caractères Unicode et seront affichés naturellement
  
  return withItalic;
}

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
          const textContent = node.text as string;
          const style: React.CSSProperties = {};

          // Appliquer les styles en fonction des attributs du nœud
          // Payload CMS utilise ces propriétés pour le formatage
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
          let Element: ElementType = 'div';
          
          // Déterminer le type d'élément en fonction du type de nœud
          // Payload CMS utilise ces types de nœuds
          switch (node.type as string) {
            case 'h1':
              Element = 'h1';
              break;
            case 'h2':
              Element = 'h2';
              break;
            case 'h3':
              Element = 'h3';
              break;
            case 'h4':
              Element = 'h4';
              break;
            case 'h5':
              Element = 'h5';
              break;
            case 'h6':
              Element = 'h6';
              break;
            case 'blockquote':
              Element = 'blockquote';
              break;
            case 'ul':
              Element = 'ul';
              break;
            case 'ol':
              Element = 'ol';
              break;
            case 'li':
              Element = 'li';
              break;
            case 'relationship':
              // Traitement spécial pour les relations, à compléter selon vos besoins
              return null;
            case 'upload':
              // Traitement spécial pour les uploads, à compléter selon vos besoins
              return null;
            case 'link':
              Element = 'a';
              break;
            case 'p':
            default:
              Element = 'p';
              break;
          }

          // Attributs spécifiques pour certains éléments
          const props: Record<string, unknown> = {};
          if (node.type === 'link' && node.linkType === 'internal' && node.doc) {
            // Pour les liens internes
            props.href = `/produits/${node.doc}`;
          } else if (node.type === 'link' && node.url) {
            // Pour les liens externes
            props.href = node.url as string;
            props.target = '_blank';
            props.rel = 'noopener noreferrer';
          }

          // Style en fonction des attributs du nœud
          const style: React.CSSProperties = {};
          if (node.textAlign === 'center') style.textAlign = 'center';
          if (node.textAlign === 'right') style.textAlign = 'right';
          if (node.textAlign === 'justify') style.textAlign = 'justify';
          
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
