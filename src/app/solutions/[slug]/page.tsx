import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import Script from 'next/script'

import { LegalDisclaimer } from '@/components/solutions/LegalDisclaimer'
import { ExpertAuthorCard } from '@/components/solutions/ExpertAuthorCard'
import { BlogRichText } from '@/components/Blog'
import { ProductCard } from '@/components/ProductCard/ProductCard'
import type { Product } from '@/types/product'

// ============================================================
// CONFIGURATION
// ============================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://chanvre-vert.fr'

// ISR: Revalidate every hour
export const revalidate = 3600

// ============================================================
// TYPES
// ============================================================

interface ExpertAuthor {
  id: string
  name: string
  role: string
  bio: string
  photo: {
    url: string
    alt?: string
    width?: number
    height?: number
  }
  linkedInUrl?: string | null
  websiteUrl?: string | null
  credentials?: Array<{
    title: string
    year?: number | null
  }> | null
  expertise?: Array<'cbd' | 'wellness' | 'nutrition' | 'regulation' | 'quality'> | null
}

interface FAQItem {
  question: string
  answer: unknown // Lexical RichText
}

interface UseCase {
  id: string
  title: string
  slug: string
  excerpt: string
  content: unknown // Lexical RichText
  featuredImage?: {
    url: string
    alt?: string
    width?: number
    height?: number
  }
  status: 'draft' | 'review' | 'published'
  metaRobots: 'index' | 'noindex'
  wordCount?: number
  layoutVariant: 'default' | 'wellness'
  expert: ExpertAuthor | string
  relatedProducts?: (Product | string)[]
  relatedCategories?: Array<{ name: string; slug: string } | string>
  relatedUseCases?: Array<{ title: string; slug: string } | string>
  faqItems?: FAQItem[]
  createdAt: string
  updatedAt: string
}

// ============================================================
// DATA FETCHING
// ============================================================

async function getUseCaseBySlug(slug: string): Promise<UseCase | null> {
  if (!API_URL) {
    console.error('NEXT_PUBLIC_API_URL is not configured')
    return null
  }

  try {
    const res = await fetch(
      `${API_URL}/api/use-cases?where[slug][equals]=${encodeURIComponent(slug)}&depth=2`,
      {
        next: { revalidate: 3600 },
      }
    )

    if (!res.ok) {
      console.error(`Failed to fetch use-case: ${res.status}`)
      return null
    }

    const data = await res.json()

    if (!data.docs || data.docs.length === 0) {
      return null
    }

    return data.docs[0] as UseCase
  } catch (error) {
    console.error('Error fetching use-case:', error)
    return null
  }
}

async function getAllUseCaseSlugs(): Promise<string[]> {
  if (!API_URL) return []

  try {
    const res = await fetch(
      `${API_URL}/api/use-cases?where[status][equals]=published&limit=100&depth=0`,
      { next: { revalidate: 3600 } }
    )

    if (!res.ok) return []

    const data = await res.json()
    return data.docs?.map((doc: { slug: string }) => doc.slug) || []
  } catch {
    return []
  }
}

// ============================================================
// STATIC GENERATION
// ============================================================

export async function generateStaticParams() {
  const slugs = await getAllUseCaseSlugs()
  return slugs.map((slug) => ({ slug }))
}

// ============================================================
// METADATA (with noindex handling)
// ============================================================

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const useCase = await getUseCaseBySlug(slug)

  if (!useCase) {
    return {
      title: 'Page non trouvée | Chanvre Vert',
    }
  }

  const imageUrl = useCase.featuredImage?.url || ''
  const canonicalUrl = `${SITE_URL}/solutions/${slug}`

  // Build robots directive based on PayloadCMS field
  const robotsDirective =
    useCase.metaRobots === 'noindex'
      ? { index: false, follow: true }
      : { index: true, follow: true }

  return {
    title: `${useCase.title} | Chanvre Vert`,
    description: useCase.excerpt,
    robots: robotsDirective,
    openGraph: {
      title: useCase.title,
      description: useCase.excerpt,
      type: 'article',
      publishedTime: useCase.createdAt,
      modifiedTime: useCase.updatedAt,
      images: imageUrl
        ? [{ url: imageUrl, width: 1200, height: 630, alt: useCase.title }]
        : [],
      locale: 'fr_FR',
      siteName: 'Chanvre Vert',
    },
    twitter: {
      card: 'summary_large_image',
      title: useCase.title,
      description: useCase.excerpt,
      images: imageUrl ? [imageUrl] : [],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  }
}

// ============================================================
// UTILITY: Extract text from Lexical for FAQ schema
// ============================================================

function extractTextFromLexical(node: unknown): string {
  if (!node) return ''
  if (typeof node === 'string') return node
  if (typeof node !== 'object') return ''

  const nodeObj = node as Record<string, unknown>

  if (typeof nodeObj.text === 'string') return nodeObj.text
  if (Array.isArray(nodeObj.children)) {
    return nodeObj.children.map(extractTextFromLexical).join(' ')
  }
  if (nodeObj.root && typeof nodeObj.root === 'object') {
    const root = nodeObj.root as Record<string, unknown>
    if (Array.isArray(root.children)) {
      return root.children.map(extractTextFromLexical).join(' ')
    }
  }

  return ''
}

// ============================================================
// PAGE COMPONENT
// ============================================================

export default async function SolutionPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const useCase = await getUseCaseBySlug(slug)

  if (!useCase || useCase.status !== 'published') {
    notFound()
  }

  // Resolve expert author (handle both populated and ID-only)
  const expert =
    typeof useCase.expert === 'object' ? useCase.expert : null

  // Resolve related products
  const relatedProducts = (useCase.relatedProducts || []).filter(
    (p): p is Product => typeof p === 'object' && p !== null && 'name' in p
  )

  // Resolve related use cases
  const relatedUseCases = (useCase.relatedUseCases || []).filter(
    (u): u is { title: string; slug: string } =>
      typeof u === 'object' && u !== null && 'title' in u
  )

  // ========================================
  // JSON-LD Structured Data
  // ========================================

  // Article schema
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: useCase.title,
    description: useCase.excerpt,
    image: useCase.featuredImage?.url || '',
    datePublished: useCase.createdAt,
    dateModified: useCase.updatedAt,
    wordCount: useCase.wordCount || 0,
    author: expert
      ? {
          '@type': 'Person',
          name: expert.name,
          jobTitle: expert.role,
          url: expert.linkedInUrl || undefined,
        }
      : {
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
      '@id': `${SITE_URL}/solutions/${slug}`,
    },
  }

  // FAQ schema (if FAQ items exist)
  const faqJsonLd =
    useCase.faqItems && useCase.faqItems.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: useCase.faqItems.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: extractTextFromLexical(item.answer),
            },
          })),
        }
      : null

  // ========================================
  // Layout variant styling
  // ========================================
  // Layout variant no longer affects colors - using site-wide dark theme
  const _isWellness = useCase.layoutVariant === 'wellness'

  return (
    <>
      {/* JSON-LD Scripts */}
      <Script
        id="article-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {faqJsonLd && (
        <Script
          id="faq-jsonld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      {/* LEGAL DISCLAIMER - MANDATORY */}
      <LegalDisclaimer variant="prominent" />

      <article className="min-h-screen bg-[#001E27]">
        {/* Hero Header */}
        <header className="relative bg-[#001E27] text-white">
          {/* Featured Image */}
          {useCase.featuredImage?.url && (
            <div className="absolute inset-0">
              <Image
                src={useCase.featuredImage.url}
                alt={useCase.featuredImage.alt || useCase.title}
                fill
                priority
                className="object-cover opacity-30"
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#001E27]/60 to-[#001E27]" />
            </div>
          )}

          <div className="relative mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="mb-6 text-sm text-white/60" aria-label="Breadcrumb">
              <ol className="flex items-center gap-2">
                <li>
                  <Link href="/" className="hover:text-white">
                    Accueil
                  </Link>
                </li>
                <li>/</li>
                <li>
                  <Link href="/solutions" className="hover:text-white">
                    Solutions
                  </Link>
                </li>
                <li>/</li>
                <li className="text-white/80">{useCase.title}</li>
              </ol>
            </nav>

            {/* Title */}
            <h1 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
              {useCase.title}
            </h1>

            {/* Excerpt */}
            <p className="mt-4 text-lg text-white/80 max-w-2xl">
              {useCase.excerpt}
            </p>

            {/* Expert Author Card */}
            {expert && (
              <div className="mt-8">
                <ExpertAuthorCard author={expert} variant="header" />
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Word count indicator (admin/dev only in noindex state) */}
          {useCase.metaRobots === 'noindex' && (
            <div className="mb-6 p-3 bg-amber-900/30 border border-amber-500/50 rounded-lg text-sm text-amber-200">
              <strong>⚠️ Page non indexée:</strong> Cette page contient{' '}
              {useCase.wordCount || 0} mots (minimum 800 requis pour l&apos;indexation).
            </div>
          )}

          {/* Article Content */}
          <div className="prose prose-lg prose-invert prose-headings:text-white prose-p:text-white/80 prose-strong:text-white prose-li:text-white/80 max-w-none">
            <BlogRichText content={useCase.content as Parameters<typeof BlogRichText>[0]['content']} />
          </div>

          {/* FAQ Section - placed early for quick answers */}
          {useCase.faqItems && useCase.faqItems.length > 0 && (
            <section className="mt-12 pt-8 border-t border-white/10">
              <h2 className="text-xl font-semibold text-white mb-6">
                Questions fréquentes
              </h2>
              <dl className="space-y-4">
                {useCase.faqItems.map((item, index) => (
                  <div key={index} className="bg-white/5 border border-white/10 rounded-lg p-4">
                    <dt className="font-medium text-white">{item.question}</dt>
                    <dd className="mt-2 text-white/70">
                      <BlogRichText content={item.answer as Parameters<typeof BlogRichText>[0]['content']} />
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          )}

          {/* Expert Full Card (E-E-A-T) */}
          {expert && (
            <section className="mt-12 pt-8 border-t border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">
                À propos de l&apos;auteur
              </h2>
              <ExpertAuthorCard author={expert} variant="full" />
            </section>
          )}

          {/* Related Products (Cross-Sell) */}
          {relatedProducts.length > 0 && (
            <section className="mt-12 pt-8 border-t border-white/10">
              <h2 className="text-xl font-semibold text-white mb-6">
                Produits recommandés
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedProducts.slice(0, 3).map((product, idx) => (
                  <ProductCard key={product.id} product={product} index={idx} />
                ))}
              </div>
              <div className="mt-6 text-center">
                <Link
                  href="/produits"
                  className="inline-flex items-center font-medium transition-colors hover:underline"
                  style={{ color: '#EFC368' }}
                >
                  Voir tous nos produits →
                </Link>
              </div>
            </section>
          )}

          {/* Related Topics (Internal Linking) */}
          {relatedUseCases.length > 0 && (
            <section className="mt-12 pt-8 border-t border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">
                Sujets connexes
              </h2>
              <ul className="flex flex-wrap gap-2">
                {relatedUseCases.map((related) => (
                  <li key={related.slug}>
                    <Link
                      href={`/solutions/${related.slug}`}
                      className="inline-block px-4 py-2 rounded-full border text-sm transition-colors hover:bg-[#EFC368] hover:text-black hover:border-[#EFC368]"
                      style={{ borderColor: '#EFC368', color: '#EFC368' }}
                    >
                      {related.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Navigation */}
          <nav className="mt-12 border-t border-white/10 pt-8">
            <Link
              href="/solutions"
              className="inline-flex items-center font-medium transition-colors hover:underline"
              style={{ color: '#EFC368' }}
            >
              <svg
                className="mr-2 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Retour aux solutions
            </Link>
          </nav>
        </div>

        {/* CTA Section */}
        <section className="bg-[#003830] py-16">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Prêt à découvrir le CBD de qualité ?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/80">
              Tous nos produits sont testés en laboratoire et conformes à la
              réglementation française.
            </p>
            <Link
              href="/produits"
              className="mt-8 inline-flex items-center rounded-lg px-6 py-3 font-semibold text-black transition-colors hover:opacity-90"
              style={{ backgroundColor: '#EFC368' }}
            >
              Voir nos produits
              <svg
                className="ml-2 h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </section>
      </article>
    </>
  )
}
