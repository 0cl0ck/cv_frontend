'use client';

import React from 'react';
import { RichTextContent } from '@/types/product';
import { RichTextRenderer } from '@/components/RichTextRenderer/RichTextRenderer';

interface SEOContentSectionProps {
  content: RichTextContent | null | undefined;
  className?: string;
}

/**
 * Section de contenu SEO affichée sous la grille de produits
 * Fournit du texte enrichi pour améliorer le ratio text-HTML
 */
export default function SEOContentSection({ content, className = '' }: SEOContentSectionProps) {
  // Ne rien afficher si pas de contenu
  if (!content || !content.root || !content.root.children || content.root.children.length === 0) {
    return null;
  }

  return (
    <section 
      className={`bg-[#00454f] rounded-lg border border-[#005965] p-6 md:p-8 ${className}`}
      aria-label="Informations complémentaires"
    >
      <div className="prose prose-invert max-w-none text-white/90 
                      prose-headings:text-white prose-headings:font-bold
                      prose-h2:text-xl prose-h2:mt-6 prose-h2:mb-4
                      prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2
                      prose-p:mb-4 prose-p:leading-relaxed
                      prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-4
                      prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-4
                      prose-li:mb-2
                      prose-a:text-[#EFC368] prose-a:no-underline hover:prose-a:underline
                      prose-strong:text-white prose-strong:font-semibold
                      prose-blockquote:border-l-4 prose-blockquote:border-[#EFC368] prose-blockquote:pl-4 prose-blockquote:italic">
        <RichTextRenderer content={content} />
      </div>
    </section>
  );
}
