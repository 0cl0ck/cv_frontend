import Link from 'next/link';
import Image from 'next/image';
import type { PostRef } from '@/types/blog';

type RelatedPostsProps = {
  posts: PostRef[];
  title?: string;
};

/**
 * Récupère l'URL de l'image depuis un PostRef
 */
function getImageUrl(image: PostRef['featuredImage']): string {
  if (!image) return '/images/placeholder-blog.webp';

  if (image.sizes?.card?.url) return image.sizes.card.url;
  if (image.sizes?.tablet?.url) return image.sizes.tablet.url;
  if (image.url) return image.url;

  return '/images/placeholder-blog.webp';
}

/**
 * Section "Articles liés" affichée en bas des articles de blog.
 * Utilise les PostRef (type léger) depuis le champ relatedPosts de PayloadCMS.
 */
export default function RelatedPosts({ posts, title = 'Articles liés' }: RelatedPostsProps) {
  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 rounded-lg border border-white/10 bg-[#003830] p-6">
      <h2 className="mb-6 text-xl font-semibold text-white">
        {title}
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.slice(0, 6).map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="group flex flex-col overflow-hidden rounded-lg bg-[#004942] transition-all hover:bg-[#005a57]"
          >
            {/* Image */}
            <div className="relative aspect-[16/9] overflow-hidden">
              <Image
                src={getImageUrl(post.featuredImage)}
                alt={post.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>

            {/* Contenu */}
            <div className="flex flex-1 flex-col p-4">
              <h3 className="mb-2 font-medium text-white transition-colors group-hover:text-emerald-400 line-clamp-2">
                {post.title}
              </h3>
              <p className="text-sm text-white/70 line-clamp-2">
                {post.excerpt}
              </p>

              {/* Lien visuel */}
              <span
                className="mt-3 inline-flex items-center text-sm font-medium transition-colors"
                style={{ color: '#EFC368' }}
              >
                Lire l&apos;article
                <svg
                  className="ml-1.5 h-4 w-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Lien vers le blog si plus de 6 articles liés */}
      {posts.length > 6 && (
        <div className="mt-4 text-center">
          <Link
            href="/blog"
            className="inline-flex items-center font-medium transition-colors hover:underline"
            style={{ color: '#EFC368' }}
          >
            Voir tous nos articles
            <svg
              className="ml-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </section>
  );
}
