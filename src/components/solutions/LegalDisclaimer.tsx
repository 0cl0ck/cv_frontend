'use client'

/**
 * LegalDisclaimer Component
 * 
 * REQUIRED on all pSEO/UseCase pages for YMYL compliance.
 * Displays a prominent legal notice that CBD products are not medical treatments.
 * 
 * This component is essential for:
 * 1. ANSM/DGCCRF regulatory compliance (France)
 * 2. Google YMYL guidelines compliance
 * 3. User safety and transparent communication
 */

import { AlertTriangle, Info, X } from 'lucide-react'
import { useState } from 'react'

interface LegalDisclaimerProps {
  /**
   * Visual variant:
   * - 'prominent': Large banner at top of page (default for solution pages)
   * - 'compact': Smaller inline notice
   * - 'modal': Dismissible modal overlay (for first visit)
   */
  variant?: 'prominent' | 'compact' | 'modal'
  
  /**
   * Allow user to dismiss the disclaimer
   * Only available for 'compact' variant
   */
  dismissible?: boolean
  
  /**
   * Additional CSS classes
   */
  className?: string
}

// Legal text required by ANSM/DGCCRF regulations
const LEGAL_TEXT = {
  title: 'Information importante',
  mainText: `Les produits CBD proposés sur ce site ne sont pas des médicaments et ne peuvent 
    en aucun cas remplacer un traitement médical. Ces informations sont fournies à titre 
    éducatif et ne constituent pas un conseil médical.`,
  secondaryText: `Si vous avez des questions concernant votre santé, consultez un professionnel 
    de santé qualifié. Nos produits sont conformes à la réglementation française (THC < 0,3%).`,
  ctaText: 'En savoir plus sur la réglementation CBD',
}

export function LegalDisclaimer({
  variant = 'prominent',
  dismissible = false,
  className = '',
}: LegalDisclaimerProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  if (isDismissed) return null

  // Prominent variant - full-width banner
  if (variant === 'prominent') {
    return (
      <div
        className={`w-full bg-amber-50 border-b border-amber-200 ${className}`}
        role="alert"
        aria-live="polite"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-0.5">
              <AlertTriangle className="h-6 w-6 text-amber-600" aria-hidden="true" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-semibold text-amber-800 mb-1">
                {LEGAL_TEXT.title}
              </h2>
              <p className="text-sm text-amber-700 leading-relaxed">
                {LEGAL_TEXT.mainText}
              </p>
              <p className="text-xs text-amber-600 mt-2">
                {LEGAL_TEXT.secondaryText}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Compact variant - inline notice
  if (variant === 'compact') {
    return (
      <div
        className={`relative bg-gray-50 border border-gray-200 rounded-lg p-4 ${className}`}
        role="note"
      >
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-sm text-gray-600">
              {LEGAL_TEXT.mainText}
            </p>
          </div>
          {dismissible && (
            <button
              onClick={() => setIsDismissed(true)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Fermer l'avertissement"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    )
  }

  // Modal variant - overlay
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 ${className}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="disclaimer-title"
    >
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 p-2 bg-amber-100 rounded-full">
            <AlertTriangle className="h-6 w-6 text-amber-600" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <h2 id="disclaimer-title" className="text-lg font-semibold text-gray-900 mb-2">
              {LEGAL_TEXT.title}
            </h2>
            <p className="text-sm text-gray-600 mb-3">
              {LEGAL_TEXT.mainText}
            </p>
            <p className="text-xs text-gray-500 mb-4">
              {LEGAL_TEXT.secondaryText}
            </p>
            <button
              onClick={() => setIsDismissed(true)}
              className="w-full py-2 px-4 bg-green-700 hover:bg-green-800 text-white text-sm font-medium rounded-lg transition-colors"
            >
              J&apos;ai compris
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LegalDisclaimer
