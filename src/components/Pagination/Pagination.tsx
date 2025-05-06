'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React from 'react';

type Props = {
  currentPage: number;
  totalPages: number;
  onPageChange?: (page: number) => void;
};



export const Pagination: React.FC<Props> = ({ currentPage, totalPages, onPageChange }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (page: number) => {
    // Si une fonction onPageChange est fournie, l'utiliser (pagination côté client)
    if (onPageChange) {
      onPageChange(page);
      return;
    }
    
    // Sinon, utiliser la navigation standard (pagination côté serveur)
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    
    // Construire la nouvelle URL
    const newUrl = `${pathname}?${params.toString()}`;
    
    // Pour les pages de catégorie et la page principale de produits, forcer un rechargement complet
    // avec window.location afin que les paramètres d'URL soient correctement transmis au serveur
    if (pathname.includes('/produits/categorie/') || pathname === '/produits') {
      window.location.href = newUrl;
    } else {
      router.push(newUrl);
    }
  };
  


  // Ne pas afficher la pagination s'il n'y a qu'une seule page
  if (totalPages <= 1) return null;

  // Créer un tableau de pages à afficher
  const getPageNumbers = () => {
    const delta = 2; // Nombre de pages avant et après la page courante
    const pages = [];
    
    // Toujours inclure la première page
    pages.push(1);
    
    // Calculer la plage de pages autour de la page courante
    const start = Math.max(2, currentPage - delta);
    const end = Math.min(totalPages - 1, currentPage + delta);
    
    // Ajouter un ellipsis si nécessaire
    if (start > 2) pages.push(-1); // -1 représente un ellipsis
    
    // Ajouter les pages dans la plage
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    // Ajouter un ellipsis si nécessaire
    if (end < totalPages - 1) pages.push(-2); // -2 représente un second ellipsis
    
    // Toujours inclure la dernière page si elle existe
    if (totalPages > 1) pages.push(totalPages);
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav className="mt-8 flex justify-center">
      <ul className="flex items-center space-x-1">
        {/* Bouton Précédent */}
        <li>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-2 rounded-md ${
              currentPage === 1
                ? 'text-neutral-400 cursor-not-allowed'
                : 'text-white hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
            }`}
            aria-label="Page précédente"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </li>

        {/* Pages numérotées */}
        {pageNumbers.map((pageNumber, index) => {
          // Si c'est un ellipsis
          if (pageNumber === -1 || pageNumber === -2) {
            return (
              <li key={`ellipsis-${index}`}>
                <span className="px-3 py-2 text-neutral-400">...</span>
              </li>
            );
          }

          // Page numérotée normale
          return (
            <li key={pageNumber}>
              <button
                onClick={() => handlePageChange(pageNumber)}
                className={`px-3 py-2 rounded-md ${
                  currentPage === pageNumber
                    ? 'bg-[#00878a] text-white font-medium'
                    : 'text-white hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                }`}
                aria-label={`Page ${pageNumber}`}
                aria-current={currentPage === pageNumber ? 'page' : undefined}
              >
                {pageNumber}
              </button>
            </li>
          );
        })}

        {/* Bouton Suivant */}
        <li>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-2 rounded-md ${
              currentPage === totalPages
                ? 'text-neutral-400 cursor-not-allowed'
                : 'text-white hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
            }`}
            aria-label="Page suivante"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Pagination;
