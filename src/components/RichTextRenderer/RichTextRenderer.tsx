'use client';

import React, { ElementType, ReactNode } from 'react';
import { RichTextContent } from '@/types/product';

interface RichTextRendererProps {
  content: string | RichTextContent | undefined | null;
  /** Classe CSS pour le container */
  className?: string;
}

// ============================================================================
// Types Lexical (Internal)
// ============================================================================

interface LexicalTextNode {
  type?: 'text';
  text?: string;
  format?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  [key: string]: unknown;
}

interface LexicalElementNode {
  type?: string;
  tag?: string;
  listType?: string;
  format?: string;
  textAlign?: string;
  url?: string;
  linkType?: string;
  doc?: unknown;
  children?: LexicalNode[];
  [key: string]: unknown;
}

type LexicalNode = LexicalTextNode | LexicalElementNode;

// ============================================================================
// Format Bits (Lexical uses bitmask for text formatting)
// ============================================================================

const FORMAT_BOLD = 1;       // 0001
const FORMAT_ITALIC = 2;     // 0010
const FORMAT_STRIKETHROUGH = 4; // 0100
const FORMAT_UNDERLINE = 8;  // 1000
const FORMAT_CODE = 16;      // 10000
const FORMAT_SUBSCRIPT = 32;
const FORMAT_SUPERSCRIPT = 64;

// ============================================================================
// Text Node Renderer (handles combined formatting)
// ============================================================================

/**
 * Rend un nœud texte avec formatage combiné (gras + italique, etc.)
 * Utilise des balises sémantiques imbriquées : <strong><em>texte</em></strong>
 */
function renderTextNode(node: LexicalTextNode, key: number): ReactNode {
  const text = node.text;
  
  // Ignorer les nœuds vides
  if (text === undefined || text === null || text === '') {
    return null;
  }

  // Déterminer le format (bitmask ou booleans legacy)
  const format = node.format ?? 0;
  const isBold = (format & FORMAT_BOLD) !== 0 || node.bold === true;
  const isItalic = (format & FORMAT_ITALIC) !== 0 || node.italic === true;
  const isUnderline = (format & FORMAT_UNDERLINE) !== 0 || node.underline === true;
  const isStrikethrough = (format & FORMAT_STRIKETHROUGH) !== 0 || node.strikethrough === true;
  const isCode = (format & FORMAT_CODE) !== 0 || node.code === true;
  const isSubscript = (format & FORMAT_SUBSCRIPT) !== 0;
  const isSuperscript = (format & FORMAT_SUPERSCRIPT) !== 0;

  // Si aucun formatage, retourner le texte brut (pas de span inutile)
  if (!isBold && !isItalic && !isUnderline && !isStrikethrough && !isCode && !isSubscript && !isSuperscript) {
    return <React.Fragment key={key}>{text}</React.Fragment>;
  }

  // Construire les balises imbriquées de l'intérieur vers l'extérieur
  let content: ReactNode = text;

  // Ordre d'imbrication : code > sub/sup > underline > strikethrough > italic > bold
  if (isCode) {
    content = <code>{content}</code>;
  }
  if (isSubscript) {
    content = <sub>{content}</sub>;
  }
  if (isSuperscript) {
    content = <sup>{content}</sup>;
  }
  if (isUnderline) {
    content = <u>{content}</u>;
  }
  if (isStrikethrough) {
    content = <s>{content}</s>;
  }
  if (isItalic) {
    content = <em>{content}</em>;
  }
  if (isBold) {
    content = <strong>{content}</strong>;
  }

  return <React.Fragment key={key}>{content}</React.Fragment>;
}

// ============================================================================
// Element Node Renderer
// ============================================================================

/**
 * Map des types de nœuds Lexical vers les éléments HTML sémantiques
 */
function getElementForNode(node: LexicalElementNode): ElementType {
  const type = node.type;

  switch (type) {
    // Headings - Lexical utilise 'heading' avec tag property
    case 'heading':
      return (node.tag as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6') || 'h2';
    
    // Fallback legacy headings
    case 'h1': return 'h1';
    case 'h2': return 'h2';
    case 'h3': return 'h3';
    case 'h4': return 'h4';
    case 'h5': return 'h5';
    case 'h6': return 'h6';

    // Paragraph
    case 'paragraph':
    case 'p':
      return 'p';

    // Lists
    case 'list':
      return node.listType === 'number' ? 'ol' : 'ul';
    case 'ul': return 'ul';
    case 'ol': return 'ol';
    case 'listitem':
    case 'li':
      return 'li';

    // Quote
    case 'quote':
    case 'blockquote':
      return 'blockquote';

    // Link
    case 'link':
      return 'a';

    // Horizontal rule
    case 'horizontalrule':
      return 'hr';

    // Default: div (block element for unknown types)
    default:
      return 'div';
  }
}

/**
 * Extrait les props spécifiques pour certains éléments (liens, etc.)
 */
function getPropsForNode(node: LexicalElementNode): Record<string, unknown> {
  const props: Record<string, unknown> = {};

  if (node.type === 'link') {
    if (node.linkType === 'internal' && node.doc) {
      // Lien interne PayloadCMS
      props.href = `/produits/${node.doc}`;
    } else if (node.url) {
      // Lien externe
      props.href = node.url;
      props.target = '_blank';
      props.rel = 'noopener noreferrer';
    }
  }

  // Text alignment
  if (node.textAlign && ['center', 'right', 'justify'].includes(node.textAlign)) {
    props.style = { textAlign: node.textAlign };
  }

  return props;
}

/**
 * Vérifie si un nœud élément est "vide" (pas de contenu textuel visible)
 */
function isEmptyElement(node: LexicalElementNode): boolean {
  if (!node.children || node.children.length === 0) {
    return true;
  }

  // Vérifier si tous les enfants sont des textes vides ou whitespace
  const hasContent = node.children.some(child => {
    if ('text' in child && typeof child.text === 'string') {
      return child.text.trim().length > 0;
    }
    // Si l'enfant a lui-même des enfants, le considérer comme non-vide
    if ('children' in child && Array.isArray(child.children)) {
      return !isEmptyElement(child as LexicalElementNode);
    }
    return false;
  });

  return !hasContent;
}

// ============================================================================
// Recursive Node Renderer
// ============================================================================

interface LexicalNodeRendererProps {
  nodes: LexicalNode[];
}

/**
 * Rend récursivement les nœuds Lexical en HTML sémantique
 */
const LexicalNodeRenderer: React.FC<LexicalNodeRendererProps> = ({ nodes }) => {
  if (!nodes || !Array.isArray(nodes) || nodes.length === 0) {
    return null;
  }

  return (
    <>
      {nodes.map((node, index) => {
        // Nœud texte
        if ('text' in node && node.text !== undefined) {
          return renderTextNode(node as LexicalTextNode, index);
        }

        // Nœud élément avec enfants
        if ('children' in node && Array.isArray(node.children)) {
          const elementNode = node as LexicalElementNode;

          // Ignorer les paragraphes vides (fix background bug)
          if (
            (elementNode.type === 'paragraph' || elementNode.type === 'p') &&
            isEmptyElement(elementNode)
          ) {
            return null;
          }

          const Element = getElementForNode(elementNode);
          const props = getPropsForNode(elementNode);

          // Cas spécial : hr n'a pas d'enfants
          if (Element === 'hr') {
            return <hr key={index} />;
          }

          return (
            <Element key={index} {...props}>
              <LexicalNodeRenderer nodes={elementNode.children as LexicalNode[]} />
            </Element>
          );
        }

        return null;
      })}
    </>
  );
};

// ============================================================================
// String Fallback Renderer (for legacy string content)
// ============================================================================

/**
 * Convertit une string brute en HTML sémantique (paragraphes)
 * Utilisé comme fallback pour les données non migrées
 */
function renderStringContent(text: string): ReactNode {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return null;
  }

  // Séparer par doubles sauts de ligne → paragraphes
  const paragraphs = trimmed
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  if (paragraphs.length === 0) {
    return null;
  }

  return (
    <>
      {paragraphs.map((paragraph, index) => (
        <p key={index}>
          {paragraph.split('\n').map((line, lineIndex, arr) => (
            <React.Fragment key={lineIndex}>
              {line}
              {lineIndex < arr.length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>
      ))}
    </>
  );
}

// ============================================================================
// Main Component Export
// ============================================================================

/**
 * Composant pour rendre correctement le contenu RichText Lexical de PayloadCMS
 * 
 * Supporte:
 * - Contenu Lexical JSON (structure complète)
 * - Fallback string (legacy, convertit en paragraphes)
 * - Contenu null/undefined (render nothing)
 * 
 * @example
 * <RichTextRenderer content={category.description} />
 */
export const RichTextRenderer: React.FC<RichTextRendererProps> = ({ content, className }) => {
  // Contenu null ou undefined
  if (!content) {
    return null;
  }

  // Contenu string (fallback legacy)
  if (typeof content === 'string') {
    const rendered = renderStringContent(content);
    if (!rendered) return null;
    return <div className={className}>{rendered}</div>;
  }

  // Contenu Lexical JSON
  if (content.root && content.root.children && Array.isArray(content.root.children)) {
    return (
      <div className={className}>
        <LexicalNodeRenderer nodes={content.root.children as LexicalNode[]} />
      </div>
    );
  }

  // Fallback: contenu invalide
  return null;
};

// Default export for backwards compatibility
export default RichTextRenderer;
