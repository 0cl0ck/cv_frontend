import React from 'react';
import { Certificate, Document, CannabinoidResult } from '@/types/product';

interface Props {
  certificates: Certificate[];
}

// Extraire l'URL d'un Document
const getDocumentUrl = (file: Document | string | undefined): string | null => {
  if (!file) return null;
  if (typeof file === 'string') return file;
  return file.url || null;
};

// Formater une date ISO en format lisible
const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '';
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

// Trier les cannabinoïdes par ordre d'importance
const sortCannabinoids = (results: CannabinoidResult[]): CannabinoidResult[] => {
  const priority: Record<string, number> = {
    'CBD': 1,
    'CBDA': 2,
    'd9-THC': 3,
    'THCA': 4,
    'CBG': 5,
    'CBGA': 6,
    'CBN': 7,
    'CBC': 8,
    'CBDV': 9,
    'CBDVA': 10,
    'THCV': 11,
    'THCVA': 12,
    'd8-THC': 13,
    'CBCA': 14,
    'CBL': 15,
  };
  
  return [...results].sort((a, b) => {
    const priorityA = priority[a.compound] || 99;
    const priorityB = priority[b.compound] || 99;
    return priorityA - priorityB;
  });
};

// Formater le nom du cannabinoïde pour affichage
const formatCompoundName = (compound: string): string => {
  const names: Record<string, string> = {
    'd9-THC': 'THC (Δ9)',
    'd8-THC': 'THC (Δ8)',
    'THCA': 'THCA',
    'CBDA': 'CBDA',
    'CBD': 'CBD',
    'CBG': 'CBG',
    'CBGA': 'CBGA',
    'CBN': 'CBN',
    'CBC': 'CBC',
    'CBDV': 'CBDV',
    'CBDVA': 'CBDVA',
    'THCV': 'THCV',
    'THCVA': 'THCVA',
    'CBCA': 'CBCA',
    'CBL': 'CBL',
  };
  return names[compound] || compound;
};

export default function ProductCertificates({ certificates }: Props) {
  if (!certificates || certificates.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 pt-6 border-t border-[#3A4A4F]">
      <h3 className="text-lg font-semibold text-[#F4F8F5] mb-4 flex items-center gap-2">
        <svg
          className="w-5 h-5 text-[#03745C]"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        Certificats d&apos;analyse
      </h3>
      
      <div className="space-y-6">
        {certificates.map((cert, certIndex) => {
          const pdfUrl = getDocumentUrl(cert.file);
          const hasResults = cert.cannabinoidResults && cert.cannabinoidResults.length > 0;
          const sortedResults = hasResults ? sortCannabinoids(cert.cannabinoidResults!) : [];
          
          return (
            <div
              key={cert.id || certIndex}
              className="bg-[#001E27] rounded-lg border border-[#3A4A4F] overflow-hidden"
            >
              {/* En-tête du certificat */}
              <div className="p-4 border-b border-[#3A4A4F]">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="font-medium text-[#F4F8F5]">{cert.name}</h4>
                  {pdfUrl && (
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-[#3A4A4F] hover:bg-[#03745C] rounded-md transition-colors text-[#F4F8F5]"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm-1 2l5 5h-5V4z"/>
                      </svg>
                      Voir le PDF
                    </a>
                  )}
                </div>
                
                {/* Infos labo */}
                {(cert.labName || cert.testDate || cert.validatedBy) && (
                  <div className="mt-3 flex flex-wrap gap-4 text-sm text-[#8A9A9F]">
                    {cert.labName && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        {cert.labName}
                      </span>
                    )}
                    {cert.testDate && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDate(cert.testDate)}
                      </span>
                    )}
                    {cert.validatedBy && (
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {cert.validatedBy}
                      </span>
                    )}
                  </div>
                )}
              </div>
              
              {/* Tableau des résultats */}
              {hasResults && (
                <div className="p-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[#8A9A9F] border-b border-[#3A4A4F]">
                        <th className="text-left py-2 font-medium">Cannabinoïde</th>
                        <th className="text-right py-2 font-medium">Taux</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedResults.map((result, idx) => {
                        const isMainCannabinoid = ['CBD', 'CBDA', 'd9-THC', 'THCA'].includes(result.compound);
                        const isTHC = result.compound.includes('THC');
                        
                        return (
                          <tr
                            key={result.id || idx}
                            className={`border-b border-[#3A4A4F]/50 ${isMainCannabinoid ? 'font-medium' : ''}`}
                          >
                            <td className={`py-2 ${isTHC ? 'text-orange-400' : 'text-[#F4F8F5]'}`}>
                              {formatCompoundName(result.compound)}
                            </td>
                            <td className={`py-2 text-right ${
                              result.belowLOQ 
                                ? 'text-[#8A9A9F] italic' 
                                : isTHC 
                                  ? 'text-orange-400' 
                                  : 'text-[#03745C]'
                            }`}>
                              {result.belowLOQ ? '<LOQ' : `${result.value?.toFixed(2)}%`}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  
                  {/* Note explicative */}
                  <p className="mt-3 text-xs text-[#8A9A9F]">
                    <span className="font-medium">LOQ</span> = Limite de quantification. Les valeurs inférieures ne sont pas quantifiables.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
