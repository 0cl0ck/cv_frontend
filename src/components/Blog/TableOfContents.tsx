'use client';

import { useState } from 'react';
import type { Heading } from '@/types/blog';

type TableOfContentsProps = {
  headings: Heading[];
};

/**
 * Composant Table des matières pour les articles de blog
 * Affiche les headings extraits du contenu Lexical
 */
export default function TableOfContents({ headings }: TableOfContentsProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (headings.length === 0) {
    return null;
  }

  // Filtrer pour ne garder que les H2 et H3
  const filteredHeadings = headings.filter(h => h.level === 2 || h.level === 3);

  if (filteredHeadings.length < 3) {
    return null;
  }

  return (
    <nav 
      className="mb-8 rounded-lg border border-white/10 bg-[#003830] p-5"
      aria-label="Table des matières"
    >
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left"
      >
        <h2 className="text-lg font-semibold text-white">
          Sommaire
        </h2>
        <svg
          className={`h-5 w-5 text-white/60 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Liste des headings */}
      {isOpen && (
        <ul className="mt-4 space-y-2">
          {filteredHeadings.map((heading, index) => (
            <li
              key={`${heading.id}-${index}`}
              className={heading.level === 3 ? 'ml-4' : ''}
            >
              <a
                href={`#${heading.id}`}
                className="block py-1 text-white/80 transition-colors hover:text-[#EFC368]"
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById(heading.id);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    // Mettre à jour l'URL sans recharger la page
                    window.history.pushState(null, '', `#${heading.id}`);
                  }
                }}
              >
                {heading.level === 3 && (
                  <span className="mr-2 text-white/40">—</span>
                )}
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      )}
    </nav>
  );
}

