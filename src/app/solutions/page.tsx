import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

// ============================================================
// CONFIGURATION
// ============================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://chanvre-vert.fr';

// ISR: Revalidate every hour
export const revalidate = 3600;

// ============================================================
// TYPES
// ============================================================

interface UseCase {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: {
    url: string;
    alt?: string;
  };
  layoutVariant: 'default' | 'wellness';
}

// ============================================================
// DATA FETCHING
// ============================================================

async function getPublishedUseCases(): Promise<UseCase[]> {
  if (!API_URL) {
    console.error('NEXT_PUBLIC_API_URL is not configured');
    return [];
  }

  try {
    const res = await fetch(
      `${API_URL}/api/use-cases?where[status][equals]=published&limit=50&depth=1`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) {
      console.error(`Failed to fetch use-cases: ${res.status}`);
      return [];
    }

    const data = await res.json();
    return data.docs || [];
  } catch (error) {
    console.error('Error fetching use-cases:', error);
    return [];
  }
}

// ============================================================
// METADATA
// ============================================================

export const metadata: Metadata = {
  title: 'Solutions & Usages du CBD | Chanvre Vert',
  description:
    'Découvrez nos guides CBD par besoin : sommeil, stress, récupération, bien-être animal. Conseils pratiques et produits recommandés par nos experts.',
  openGraph: {
    title: 'Solutions & Usages du CBD',
    description:
      'Guides pratiques CBD adaptés à vos besoins : sommeil, détente, récupération...',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Chanvre Vert',
  },
  alternates: {
    canonical: `${SITE_URL}/solutions`,
  },
};

// ============================================================
// PAGE COMPONENT
// ============================================================

export default async function SolutionsPage() {
  const useCases = await getPublishedUseCases();

  return (
    <main className="min-h-screen bg-[#001E27]">
      {/* Hero Section */}
      <section className="relative py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Breadcrumb */}
          <nav className="mb-6 text-sm text-white/60" aria-label="Breadcrumb">
            <ol className="flex items-center gap-2">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Accueil
                </Link>
              </li>
              <li>/</li>
              <li className="text-white/80">Solutions</li>
            </ol>
          </nav>

          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            Solutions & Usages du CBD
          </h1>

          {/* Intro E-E-A-T */}
          <p className="text-lg text-white/80 max-w-3xl">
            Chaque personne réagit différemment au CBD. Découvrez nos guides par
            besoin pour comprendre comment intégrer le cannabidiol dans votre
            quotidien, selon vos objectifs : sommeil, détente, récupération ou
            bien-être animal.
          </p>
        </div>
      </section>

      {/* Grid Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        {useCases.length === 0 ? (
          <div className="text-center py-12 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-white/70 text-lg mb-6">
              Nos guides sont en cours de préparation. Revenez bientôt !
            </p>
            <Link
              href="/produits"
              className="inline-block px-6 py-3 font-semibold text-black rounded-lg transition-colors hover:opacity-90"
              style={{ backgroundColor: '#EFC368' }}
            >
              Découvrir nos produits
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {useCases.map((useCase) => (
              <SolutionCard key={useCase.id} useCase={useCase} />
            ))}
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="border-t border-white/10 bg-[#003830] py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Une question sur le CBD ?
          </h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Notre équipe est disponible pour vous conseiller et vous orienter
            vers les produits adaptés à vos besoins.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-6 py-3 font-semibold text-black rounded-lg transition-colors hover:opacity-90"
            style={{ backgroundColor: '#EFC368' }}
          >
            Nous contacter
          </Link>
        </div>
      </section>
    </main>
  );
}

// ============================================================
// SOLUTION CARD COMPONENT
// ============================================================

function SolutionCard({ useCase }: { useCase: UseCase }) {
  return (
    <Link
      href={`/solutions/${useCase.slug}`}
      className="group relative flex flex-col rounded-2xl border border-white/10 bg-white/5 overflow-hidden transition-all duration-300 hover:border-[#EFC368]/50 hover:bg-white/10 hover:-translate-y-1"
    >
      {/* Image */}
      {useCase.featuredImage?.url ? (
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={useCase.featuredImage.url}
            alt={useCase.featuredImage.alt || useCase.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#001E27] to-transparent" />
        </div>
      ) : (
        <div className="h-48 w-full bg-gradient-to-br from-[#003830] to-[#001E27] flex items-center justify-center">
          <span className="text-4xl">🌿</span>
        </div>
      )}

      {/* Content */}
      <div className="flex flex-col flex-1 p-6">
        <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-[#EFC368] transition-colors">
          {useCase.title}
        </h2>
        <p className="text-white/70 text-sm line-clamp-3 flex-1">
          {useCase.excerpt}
        </p>
        <div className="mt-4 flex items-center font-medium text-sm" style={{ color: '#EFC368' }}>
          <span>Lire le guide</span>
          <svg
            className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1"
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
        </div>
      </div>
    </Link>
  );
}

