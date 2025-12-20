import { Metadata } from 'next';
import Link from 'next/link';
import { getPosts } from '@/services/api';
import { PostCard } from '@/components/Blog';
import { Pagination } from '@/components/Pagination/Pagination';

export const metadata: Metadata = {
  title: 'Blog CBD | Chanvre Vert - Guides et Conseils',
  description: 'Découvrez nos articles sur le CBD : guides d\'achat, conseils d\'utilisation, bienfaits et actualités du chanvre. Tout savoir sur le cannabidiol.',
  openGraph: {
    title: 'Blog CBD | Chanvre Vert - Guides et Conseils',
    description: 'Découvrez nos articles sur le CBD : guides d\'achat, conseils d\'utilisation, bienfaits et actualités du chanvre.',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Chanvre Vert',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog CBD | Chanvre Vert',
    description: 'Guides, conseils et actualités sur le CBD et le chanvre.',
  },
  alternates: {
    canonical: 'https://chanvre-vert.fr/blog',
  },
};

// ISR: revalider toutes les heures
export const revalidate = 3600;

type BlogPageProps = {
  searchParams: Promise<{ page?: string; pillar?: string }>;
};

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || '1', 10);
  const showPillarOnly = params.pillar === 'true';
  const postsPerPage = 9;

  // Récupérer les articles
  const postsData = await getPosts({
    page: currentPage,
    limit: postsPerPage,
    isPillar: showPillarOnly ? true : undefined,
  });

  // Récupérer les articles piliers pour la sidebar
  const pillarPosts = await getPosts({
    limit: 5,
    isPillar: true,
  });

  const { docs: posts, totalPages, totalDocs } = postsData;

  return (
    <div className="min-h-screen bg-[#001E27]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#003830] to-[#001E27] py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Blog <span style={{ color: '#EFC368' }}>CBD</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/80">
              Guides, conseils et actualités sur le cannabidiol. Tout ce que vous devez savoir pour profiter au mieux des bienfaits du CBD.
            </p>
          </div>
        </div>
        
        {/* Décoration */}
        <div className="absolute -bottom-1 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" className="w-full">
            <path d="M0 100V0C240 66.6667 480 100 720 100C960 100 1200 66.6667 1440 0V100H0Z" fill="#001E27" />
          </svg>
        </div>
      </section>

      {/* Contenu principal */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-4 lg:gap-8">
            {/* Sidebar - Articles piliers */}
            {pillarPosts.docs.length > 0 && (
              <aside className="hidden lg:block">
                <div className="sticky top-8 rounded-lg border border-white/10 bg-[#003830] p-5">
                  <h2 className="mb-4 text-lg font-semibold text-white">
                    Articles piliers
                  </h2>
                  <p className="mb-4 text-sm text-white/60">
                    Nos guides complets pour bien débuter
                  </p>
                  <ul className="space-y-3">
                    {pillarPosts.docs.map((post) => (
                      <li key={post.id}>
                        <a
                          href={`/blog/${post.slug}`}
                          className="block text-sm text-white/80 transition-colors hover:text-[#EFC368]"
                        >
                          {post.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </aside>
            )}

            {/* Liste des articles */}
            <div className={pillarPosts.docs.length > 0 ? 'lg:col-span-3' : 'lg:col-span-4'}>
              {/* Compteur d'articles */}
              <div className="mb-8 flex items-center justify-between">
                <p className="text-white/60">
                  {totalDocs} article{totalDocs > 1 ? 's' : ''}
                </p>
                
                {/* Filtre articles piliers (mobile) */}
                <div className="lg:hidden">
                  <a
                    href={showPillarOnly ? '/blog' : '/blog?pillar=true'}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      showPillarOnly
                        ? 'bg-[#EFC368] text-black'
                        : 'border border-white/20 text-white hover:border-[#EFC368] hover:text-[#EFC368]'
                    }`}
                  >
                    {showPillarOnly ? 'Tous les articles' : 'Articles piliers'}
                  </a>
                </div>
              </div>

              {/* Grille d'articles */}
              {posts.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {posts.map((post, index) => (
                    <PostCard key={post.id} post={post} index={index} />
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-white/10 bg-[#003830] p-12 text-center">
                  <p className="text-lg text-white/80">
                    Aucun article pour le moment.
                  </p>
                  <p className="mt-2 text-white/60">
                    Revenez bientôt pour découvrir nos guides et conseils sur le CBD.
                  </p>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination currentPage={currentPage} totalPages={totalPages} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Section CTA */}
      <section className="border-t border-white/10 bg-[#003830] py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Découvrez nos produits CBD
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-white/80">
            Fleurs, huiles, infusions... Explorez notre gamme de produits CBD de qualité premium.
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
    </div>
  );
}

