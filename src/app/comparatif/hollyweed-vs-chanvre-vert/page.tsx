import { Metadata } from 'next'
import Link from 'next/link'
import Script from 'next/script'
import { Check, X, ArrowRight, Shield, Truck, HeadphonesIcon, FlaskConical } from 'lucide-react'

import { LegalDisclaimer } from '@/components/solutions/LegalDisclaimer'

// ============================================================
// METADATA (SEO-Optimized for comparative keywords)
// ============================================================

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://chanvre-vert.fr'
const PAGE_PATH = '/comparatif/hollyweed-vs-chanvre-vert'

export const metadata: Metadata = {
  title: 'Hollyweed vs Chanvre Vert : Comparatif CBD France 2026 | Chanvre Vert',
  description:
    'Comparatif objectif entre Hollyweed et Chanvre Vert : livraison, qualité, analyses labo, service client. Découvrez pourquoi les Français nous choisissent.',
  keywords: [
    'hollyweed avis',
    'hollyweed vs chanvre vert',
    'cbd pas cher',
    'meilleur site cbd france',
    'cbd livraison rapide',
  ],
  openGraph: {
    title: 'Hollyweed vs Chanvre Vert : Comparatif CBD 2026',
    description:
      'Analyse comparative factuelle entre deux acteurs majeurs du CBD en France.',
    type: 'article',
    locale: 'fr_FR',
    siteName: 'Chanvre Vert',
  },
  alternates: {
    canonical: `${SITE_URL}${PAGE_PATH}`,
  },
  robots: {
    index: true,
    follow: true,
  },
}

// ============================================================
// COMPARISON DATA (Factual, verifiable claims only)
// ============================================================

interface ComparisonCriteria {
  id: string
  label: string
  icon: React.ReactNode
  chanvreVert: {
    value: string
    available: boolean
    note?: string
  }
  competitor: {
    value: string
    available: boolean | 'partial'
    note?: string
  }
}

const COMPARISON_DATA: ComparisonCriteria[] = [
  {
    id: 'origin',
    label: 'Origine du CBD',
    icon: <FlaskConical className="h-5 w-5" />,
    chanvreVert: {
      value: 'France / Europe',
      available: true,
      note: 'Chanvre cultivé en France et Europe',
    },
    competitor: {
      value: 'International',
      available: true,
      note: 'Sources multiples',
    },
  },
  {
    id: 'lab-tests',
    label: 'Analyses laboratoire',
    icon: <FlaskConical className="h-5 w-5" />,
    chanvreVert: {
      value: 'Certificats disponibles',
      available: true,
      note: 'Analyses COA sur chaque lot',
    },
    competitor: {
      value: 'Analyses affichées',
      available: true,
    },
  },
  {
    id: 'shipping-france',
    label: 'Livraison France',
    icon: <Truck className="h-5 w-5" />,
    chanvreVert: {
      value: '24-48h',
      available: true,
      note: 'Expédition depuis la France',
    },
    competitor: {
      value: 'Variable',
      available: 'partial',
      note: 'Délais selon stock',
    },
  },
  {
    id: 'support',
    label: 'Support client français',
    icon: <HeadphonesIcon className="h-5 w-5" />,
    chanvreVert: {
      value: 'Équipe FR dédiée',
      available: true,
      note: 'Réponse sous 24h',
    },
    competitor: {
      value: 'Support multilingue',
      available: 'partial',
    },
  },
  {
    id: 'compliance',
    label: 'Conformité ANSM/DGCCRF',
    icon: <Shield className="h-5 w-5" />,
    chanvreVert: {
      value: 'THC < 0.3%',
      available: true,
      note: 'Conforme réglementation FR',
    },
    competitor: {
      value: 'THC < 0.3%',
      available: true,
    },
  },
]

// ============================================================
// STRUCTURED DATA
// ============================================================

const comparisonJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Hollyweed vs Chanvre Vert : Comparatif CBD France 2026',
  description:
    'Comparaison factuelle et objective entre Hollyweed et Chanvre Vert pour aider les consommateurs français à faire un choix éclairé.',
  author: {
    '@type': 'Organization',
    name: 'Chanvre Vert',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Chanvre Vert',
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/logo.png`,
    },
  },
  mainEntityOfPage: {
    '@type': 'WebPage',
    '@id': `${SITE_URL}${PAGE_PATH}`,
  },
  datePublished: '2026-01-12',
  dateModified: new Date().toISOString().split('T')[0],
}

// ============================================================
// PAGE COMPONENT
// ============================================================

export default function ComparativePageHollyweed() {
  return (
    <>
      {/* JSON-LD */}
      <Script
        id="comparison-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(comparisonJsonLd) }}
      />

      {/* Legal Disclaimer */}
      <LegalDisclaimer variant="compact" className="mx-auto max-w-4xl mt-8 px-4" />

      <article className="min-h-screen bg-white">
        {/* Hero */}
        <header className="bg-gradient-to-b from-[#001E27] to-[#003830] text-white py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="mb-6 text-sm text-white/60" aria-label="Breadcrumb">
              <ol className="flex items-center gap-2">
                <li>
                  <Link href="/" className="hover:text-white">
                    Accueil
                  </Link>
                </li>
                <li>/</li>
                <li className="text-white/80">Comparatif CBD</li>
              </ol>
            </nav>

            <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
              Hollyweed vs Chanvre Vert
            </h1>
            <p className="mt-4 text-lg text-white/80 max-w-2xl">
              Comparatif factuel entre deux acteurs du marché CBD français. 
              Notre objectif : vous aider à faire un choix éclairé.
            </p>

            {/* Transparency notice */}
            <div className="mt-6 p-4 bg-white/10 rounded-lg border border-white/20">
              <p className="text-sm text-white/70">
                <strong className="text-white">Note de transparence :</strong>{' '}
                Ce comparatif est rédigé par Chanvre Vert. Nous nous engageons à 
                présenter des informations factuelles et vérifiables. Les données 
                concernant le concurrent sont issues de leur site public.
              </p>
            </div>
          </div>
        </header>

        {/* Comparison Table */}
        <section className="py-12">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Tableau comparatif
            </h2>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-hidden rounded-xl border border-gray-200">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Critère
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-green-700 bg-green-50">
                      Chanvre Vert
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">
                      Hollyweed
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {COMPARISON_DATA.map((row) => (
                    <tr key={row.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-gray-400">{row.icon}</span>
                          <span className="font-medium text-gray-900">
                            {row.label}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center bg-green-50/50">
                        <div className="flex flex-col items-center gap-1">
                          {row.chanvreVert.available && (
                            <Check className="h-5 w-5 text-green-600" />
                          )}
                          <span className="text-sm font-medium text-gray-900">
                            {row.chanvreVert.value}
                          </span>
                          {row.chanvreVert.note && (
                            <span className="text-xs text-gray-500">
                              {row.chanvreVert.note}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          {row.competitor.available === true && (
                            <Check className="h-5 w-5 text-green-600" />
                          )}
                          {row.competitor.available === 'partial' && (
                            <span className="text-amber-500 text-xs font-medium">
                              Partiel
                            </span>
                          )}
                          {row.competitor.available === false && (
                            <X className="h-5 w-5 text-red-500" />
                          )}
                          <span className="text-sm text-gray-700">
                            {row.competitor.value}
                          </span>
                          {row.competitor.note && (
                            <span className="text-xs text-gray-500">
                              {row.competitor.note}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {COMPARISON_DATA.map((row) => (
                <div
                  key={row.id}
                  className="rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-gray-400">{row.icon}</span>
                    <h3 className="font-medium text-gray-900">{row.label}</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="text-xs text-green-800 font-medium mb-1">
                        Chanvre Vert
                      </div>
                      <div className="flex items-center gap-1">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{row.chanvreVert.value}</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-600 font-medium mb-1">
                        Hollyweed
                      </div>
                      <span className="text-sm">{row.competitor.value}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-12 bg-gray-50">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Pourquoi choisir Chanvre Vert ?
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <FlaskConical className="h-6 w-6 text-green-700" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Qualité vérifiable
                </h3>
                <p className="text-sm text-gray-600">
                  Chaque lot est analysé en laboratoire. Certificats COA 
                  disponibles sur demande.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Truck className="h-6 w-6 text-green-700" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Expédition française
                </h3>
                <p className="text-sm text-gray-600">
                  Stock basé en France. Livraison rapide et traçable 
                  sous 24-48h.
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <HeadphonesIcon className="h-6 w-6 text-green-700" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Support réactif
                </h3>
                <p className="text-sm text-gray-600">
                  Notre équipe française répond à vos questions 
                  sous 24h maximum.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-[#003830]">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Prêt à essayer Chanvre Vert ?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/80">
              Découvrez notre gamme de CBD premium, testé en laboratoire 
              et conforme à la réglementation française.
            </p>
            <Link
              href="/produits"
              className="mt-8 inline-flex items-center gap-2 rounded-lg px-6 py-3 font-semibold text-black transition-colors hover:opacity-90"
              style={{ backgroundColor: '#EFC368' }}
            >
              Découvrir nos produits
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </article>
    </>
  )
}
