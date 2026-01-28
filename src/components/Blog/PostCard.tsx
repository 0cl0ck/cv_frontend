import Link from 'next/link';
import Image from 'next/image';
import type { Post } from '@/types/blog';

type PostCardProps = {
  post: Post;
  index?: number;
};

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

/**
 * Récupère l'URL de l'image depuis l'objet Media
 */
function getImageUrl(image: Post['featuredImage']): string {
  if (!image) return '/images/placeholder-blog.webp';
  
  // Essayer différentes tailles dans l'ordre de préférence
  if (image.sizes?.card?.url) return image.sizes.card.url;
  if (image.sizes?.tablet?.url) return image.sizes.tablet.url;
  if (image.url) return image.url;
  
  return '/images/placeholder-blog.webp';
}

export default function PostCard({ post, index = 0 }: PostCardProps) {
  const imageUrl = getImageUrl(post.featuredImage);

  return (
    <article 
      className="group flex flex-col overflow-hidden rounded-lg bg-[#004942] shadow-md transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
      style={{
        animationDelay: `${index * 100}ms`,
      }}
    >
      {/* Image */}
      <Link href={`/blog/${post.slug}`} className="relative aspect-[16/9] overflow-hidden">
        <Image
          src={imageUrl}
          alt={post.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        {/* Badge guide */}
        {post.isPillar && (
          <div className="absolute left-0 top-4 z-10 px-3 py-1.5 text-sm font-semibold text-black" style={{ backgroundColor: '#EFC368' }}>
            GUIDE
          </div>
        )}
      </Link>

      {/* Contenu */}
      <div className="flex flex-1 flex-col p-5 transition-colors duration-300 group-hover:bg-[#005a57]">
        {/* Date et auteur */}
        <div className="mb-3 flex items-center gap-3 text-sm text-white/60">
          {post.publishedAt && (
            <time dateTime={post.publishedAt}>
              {formatDate(post.publishedAt)}
            </time>
          )}
          {post.author && (
            <>
              <span>•</span>
              <span>{post.author}</span>
            </>
          )}
        </div>

        {/* Titre */}
        <Link href={`/blog/${post.slug}`}>
          <h2 className="mb-3 text-xl font-semibold text-white transition-colors duration-200 group-hover:text-emerald-400 line-clamp-2">
            {post.title}
          </h2>
        </Link>

        {/* Extrait */}
        <p className="mb-4 flex-1 text-white/80 line-clamp-3">
          {post.excerpt}
        </p>

        {/* Catégories liées */}
        {post.relatedCategories && Array.isArray(post.relatedCategories) && post.relatedCategories.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {post.relatedCategories.slice(0, 3).map((category) => {
              const categoryName = typeof category === 'string' ? category : category.name;
              const categorySlug = typeof category === 'string' ? category : category.slug;
              
              return (
                <Link
                  key={categorySlug}
                  href={`/produits/categorie/${categorySlug}`}
                  className="rounded-full border px-3 py-1 text-xs font-medium transition-colors hover:bg-[#EFC368] hover:text-black hover:border-[#EFC368]"
                  style={{ borderColor: '#EFC368', color: '#EFC368' }}
                >
                  {categoryName}
                </Link>
              );
            })}
          </div>
        )}

        {/* Lien Lire la suite */}
        <Link
          href={`/blog/${post.slug}`}
          className="mt-auto inline-flex items-center font-medium transition-colors"
          style={{ color: '#EFC368' }}
        >
          Lire la suite
          <svg
            className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </article>
  );
}







