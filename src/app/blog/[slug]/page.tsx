import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Script from 'next/script';
import { getPostBySlug, getAllPostSlugs } from '@/services/api';
import { extractHeadings, shouldShowTableOfContents } from '@/lib/lexical-utils';
import { TableOfContents, RelatedProducts, BlogRichText } from '@/components/Blog';
import type { Product } from '@/types/product';
import type { LexicalRoot } from '@/types/blog';

// ISR: revalider toutes les heures
export const revalidate = 3600;

// Générer les chemins statiques
export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Générer les métadonnées dynamiques
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    const post = await getPostBySlug(slug);
    
    const imageUrl = post.featuredImage?.url || '';
    const metaTitle = post.meta?.title || post.title;
    const metaDescription = post.meta?.description || post.excerpt;
    
    return {
      title: `${metaTitle} | Blog Chanvre Vert`,
      description: metaDescription,
      openGraph: {
        title: metaTitle,
        description: metaDescription,
        type: 'article',
        publishedTime: post.publishedAt || undefined,
        modifiedTime: post.updatedAt,
        authors: [post.author],
        images: imageUrl ? [{ url: imageUrl, width: 1200, height: 630, alt: post.title }] : [],
        locale: 'fr_FR',
        siteName: 'Chanvre Vert',
      },
      twitter: {
        card: 'summary_large_image',
        title: metaTitle,
        description: metaDescription,
        images: imageUrl ? [imageUrl] : [],
      },
      alternates: {
        canonical: `https://chanvre-vert.fr/blog/${slug}`,
      },
    };
  } catch {
    return {
      title: 'Article non trouvé | Chanvre Vert',
    };
  }
}

/**
 * Formate une date ISO en format français lisible
 */
function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default async function BlogPostPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  
  let post;
  try {
    post = await getPostBySlug(slug);
  } catch {
    notFound();
  }

  // Extraire les headings pour la table des matières
  const headings = extractHeadings(post.content as LexicalRoot);
  const showTOC = shouldShowTableOfContents(post.content as LexicalRoot, 3);

  // Récupérer les produits liés (filtrés pour n'avoir que les objets résolus)
  const relatedProducts = (post.relatedProducts || []).filter(
    (p): p is Product => typeof p === 'object' && p !== null && 'name' in p
  );

  // Récupérer les catégories liées
  const relatedCategories = (post.relatedCategories || []).filter(
    (c) => typeof c === 'object' && c !== null && 'name' in c
  );

  // JSON-LD Article schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.featuredImage?.url || '',
    datePublished: post.publishedAt || post.createdAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Chanvre Vert',
      logo: {
        '@type': 'ImageObject',
        url: 'https://chanvre-vert.fr/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://chanvre-vert.fr/blog/${slug}`,
    },
  };

  return (
    <>
      {/* JSON-LD */}
      <Script
        id="article-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="min-h-screen bg-[#001E27]">
        {/* Hero avec image */}
        <header className="relative">
          {/* Image de fond */}
          <div className="relative h-[40vh] min-h-[300px] max-h-[500px] w-full">
            {post.featuredImage?.url ? (
              <Image
                src={post.featuredImage.url}
                alt={post.title}
                fill
                priority
                className="object-cover"
                sizes="100vw"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-b from-[#003830] to-[#001E27]" />
            )}
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#001E27] via-[#001E27]/60 to-transparent" />
          </div>

          {/* Contenu du header */}
          <div className="absolute bottom-0 left-0 right-0">
            <div className="mx-auto max-w-4xl px-4 pb-8 sm:px-6 lg:px-8">
              {/* Badge article pilier */}
              {post.isPillar && (
                <div 
                  className="mb-4 inline-block rounded-full px-4 py-1.5 text-sm font-semibold text-black"
                  style={{ backgroundColor: '#EFC368' }}
                >
                  Article pilier
                </div>
              )}

              {/* Titre H1 */}
              <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                {post.title}
              </h1>

              {/* Métadonnées */}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-white/70">
                {post.publishedAt && (
                  <time dateTime={post.publishedAt}>
                    {formatDate(post.publishedAt)}
                  </time>
                )}
                <span>•</span>
                <span>Par {post.author}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Contenu principal */}
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          {/* Catégories liées */}
          {relatedCategories.length > 0 && (
            <div className="mb-8 flex flex-wrap gap-2">
              {relatedCategories.map((category) => (
                <Link
                  key={typeof category === 'string' ? category : category.slug}
                  href={`/produits/categorie/${typeof category === 'string' ? category : category.slug}`}
                  className="rounded-full border px-4 py-1.5 text-sm font-medium transition-colors hover:bg-[#EFC368] hover:text-black hover:border-[#EFC368]"
                  style={{ borderColor: '#EFC368', color: '#EFC368' }}
                >
                  {typeof category === 'string' ? category : category.name}
                </Link>
              ))}
            </div>
          )}

          {/* Extrait */}
          <p className="mb-8 text-xl leading-relaxed text-white/80">
            {post.excerpt}
          </p>

          {/* Table des matières */}
          {showTOC && <TableOfContents headings={headings} />}

          {/* Contenu de l'article */}
          <div className="mt-8">
            <BlogRichText content={post.content} />
          </div>

          {/* Produits liés */}
          {relatedProducts.length > 0 && (
            <RelatedProducts products={relatedProducts} />
          )}

          {/* Navigation */}
          <nav className="mt-12 border-t border-white/10 pt-8">
            <Link
              href="/blog"
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
              Retour au blog
            </Link>
          </nav>
        </div>

        {/* Section CTA */}
        <section className="border-t border-white/10 bg-[#003830] py-16">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Envie de tester nos produits ?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/80">
              Découvrez notre sélection de CBD de qualité premium, cultivé en France.
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>
      </article>
    </>
  );
}






