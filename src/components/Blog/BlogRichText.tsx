'use client';

import React, { ElementType } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import Link from 'next/link';
import Image from 'next/image';
import type { RichTextContent } from '@/types/product';

interface BlogRichTextProps {
  content: string | RichTextContent | undefined;
}

/**
 * Génère un ID slug à partir d'un texte pour les ancres
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
}

/**
 * Extrait le texte brut d'un nœud et de ses enfants
 */
function extractText(nodes: Array<Record<string, unknown>>): string {
  let text = '';
  for (const node of nodes) {
    if (node.text) {
      text += node.text;
    }
    if (node.children && Array.isArray(node.children)) {
      text += extractText(node.children as Array<Record<string, unknown>>);
    }
  }
  return text;
}

/**
 * Convertit la valeur format de Lexical en classe Tailwind d'alignement
 */
function getAlignmentClass(format: unknown): string {
  switch (format) {
    case 'center':
      return 'text-center';
    case 'right':
      return 'text-right';
    case 'justify':
      return 'text-justify';
    default:
      return ''; // left ou undefined = pas de classe spéciale
  }
}

/**
 * Composant pour rendre le contenu riche des articles de blog
 * Avec support des ancres sur les headings pour la table des matières
 */
export default function BlogRichText({ content }: BlogRichTextProps) {
  if (!content) {
    return <p className="text-white/60">Contenu non disponible</p>;
  }

  // Si le contenu est une chaîne simple
  if (typeof content === 'string') {
    const sanitized = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'span', 'div'],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style', 'id']
    });
    
    return (
      <div 
        className="prose prose-invert prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: sanitized }} 
      />
    );
  }

  // Si le contenu est un objet RichTextContent
  try {
    if (content.root && content.root.children) {
      return (
        <div className="prose prose-invert prose-lg max-w-none prose-headings:text-white prose-p:text-white/90 prose-a:text-[#EFC368] prose-strong:text-white prose-blockquote:border-[#EFC368] prose-blockquote:text-white/80">
          <RichTextNode nodes={content.root.children} />
        </div>
      );
    }
  } catch (error) {
    console.error('Erreur lors du rendu du texte riche:', error);
  }

  return <p className="text-white/60">Contenu non disponible</p>;
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
        if (node.text !== undefined) {
          const textContent = node.text as string;
          
          // Si le texte est vide, retourner null
          if (!textContent) {
            return null;
          }

          // Construire les classes CSS en fonction du formatage
          let className = '';
          const style: React.CSSProperties = {};

          if (node.bold) className += 'font-bold ';
          if (node.italic) className += 'italic ';
          if (node.underline) style.textDecoration = 'underline';
          if (node.strikethrough) style.textDecoration = 'line-through';
          if (node.code) {
            return (
              <code key={index} className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm">
                {textContent}
              </code>
            );
          }

          if (!className && Object.keys(style).length === 0) {
            return textContent;
          }

          return (
            <span key={index} className={className.trim()} style={style}>
              {textContent}
            </span>
          );
        }

        // Images uploadées (bloc upload de Lexical) - traité AVANT les noeuds avec children
        // car les uploads n'ont pas de children, ils utilisent node.value directement
        const nodeType = node.type as string;
        if (nodeType === 'upload') {
          const value = node.value as { url?: string; alt?: string; caption?: string; width?: number; height?: number; sizes?: { card?: { url?: string; width?: number; height?: number }; tablet?: { url?: string } } } | undefined;
          // Préférer la taille "card" (640px) pour les articles, sinon tablet, sinon original
          const imageUrl = value?.sizes?.card?.url || value?.sizes?.tablet?.url || value?.url;
          const imageWidth = value?.sizes?.card?.width || 640;
          const imageHeight = value?.sizes?.card?.height || 480;
          if (imageUrl) {
            return (
              <figure key={index} className="my-8 flex flex-col items-center">
                <div className="relative overflow-hidden rounded-lg" style={{ maxWidth: '640px', width: '100%' }}>
                  <Image
                    src={imageUrl}
                    alt={value?.alt || 'Image de l\'article'}
                    width={imageWidth}
                    height={imageHeight}
                    className="w-full h-auto object-cover rounded-lg"
                    sizes="(max-width: 640px) 100vw, 640px"
                  />
                </div>
                {value?.caption && (
                  <figcaption className="mt-3 text-center text-sm text-white/60 italic max-w-lg">
                    {value.caption}
                  </figcaption>
                )}
              </figure>
            );
          }
          return null;
        }

        // Nœuds avec des enfants
        if (node.children && Array.isArray(node.children)) {
          const tag = node.tag as string | undefined;
          
          // Headings avec ancres pour la table des matières
          if (nodeType === 'heading' && tag) {
            const headingText = extractText(node.children as Array<Record<string, unknown>>);
            const id = slugify(headingText);
            const HeadingTag = tag as ElementType;
            const alignClass = getAlignmentClass(node.format);
            
            const headingClasses: Record<string, string> = {
              h1: 'text-3xl font-bold mt-8 mb-4 scroll-mt-24',
              h2: 'text-2xl font-bold mt-8 mb-4 scroll-mt-24',
              h3: 'text-xl font-semibold mt-6 mb-3 scroll-mt-24',
              h4: 'text-lg font-semibold mt-4 mb-2 scroll-mt-24',
              h5: 'text-base font-semibold mt-4 mb-2 scroll-mt-24',
              h6: 'text-sm font-semibold mt-4 mb-2 scroll-mt-24',
            };

            return (
              <HeadingTag key={index} id={id} className={`${headingClasses[tag] || ''} ${alignClass}`.trim()}>
                <RichTextNode nodes={node.children as Array<Record<string, unknown>>} />
              </HeadingTag>
            );
          }

          // Paragraphes
          if (nodeType === 'paragraph') {
            // Ignorer les paragraphes vides (créés par des retours à la ligne dans l'éditeur)
            const paragraphText = extractText(node.children as Array<Record<string, unknown>>);
            if (!paragraphText.trim()) {
              return null;
            }
            const alignClass = getAlignmentClass(node.format);
            return (
              <p key={index} className={`mb-4 leading-relaxed ${alignClass}`.trim()}>
                <RichTextNode nodes={node.children as Array<Record<string, unknown>>} />
              </p>
            );
          }

          // Listes
          if (nodeType === 'list') {
            const listType = node.listType as string;
            if (listType === 'number') {
              return (
                <ol key={index} className="mb-4 list-decimal pl-6 space-y-2">
                  <RichTextNode nodes={node.children as Array<Record<string, unknown>>} />
                </ol>
              );
            }
            return (
              <ul key={index} className="mb-4 list-disc pl-6 space-y-2">
                <RichTextNode nodes={node.children as Array<Record<string, unknown>>} />
              </ul>
            );
          }

          // Items de liste
          if (nodeType === 'listitem') {
            return (
              <li key={index}>
                <RichTextNode nodes={node.children as Array<Record<string, unknown>>} />
              </li>
            );
          }

          // Citation
          if (nodeType === 'quote') {
            const alignClass = getAlignmentClass(node.format);
            return (
              <blockquote key={index} className={`border-l-4 border-[#EFC368] pl-4 my-6 italic text-white/80 ${alignClass}`.trim()}>
                <RichTextNode nodes={node.children as Array<Record<string, unknown>>} />
              </blockquote>
            );
          }

          // Liens
          if (nodeType === 'link') {
            const url = node.url as string;
            const isInternal = url?.startsWith('/') || url?.includes('chanvre-vert.fr');
            
            if (isInternal) {
              return (
                <Link 
                  key={index} 
                  href={url || '#'}
                  className="text-[#EFC368] underline hover:text-[#d3a74f] transition-colors"
                >
                  <RichTextNode nodes={node.children as Array<Record<string, unknown>>} />
                </Link>
              );
            }
            
            return (
              <a 
                key={index} 
                href={url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#EFC368] underline hover:text-[#d3a74f] transition-colors"
              >
                <RichTextNode nodes={node.children as Array<Record<string, unknown>>} />
              </a>
            );
          }

          // Fallback pour les autres types de nœuds
          return (
            <div key={index}>
              <RichTextNode nodes={node.children as Array<Record<string, unknown>>} />
            </div>
          );
        }

        return null;
      })}
    </>
  );
};







