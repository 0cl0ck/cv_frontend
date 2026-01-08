import Link from 'next/link';
import { generatePageMetadata } from '@/lib/metadata';

// Metadata for 404 page (noindex to prevent crawling)
export const metadata = generatePageMetadata({
  title: 'Page non trouvée',
  description: 'La page que vous recherchez n\'existe pas ou a été déplacée.',
  path: '/404',
  noIndex: true,
});

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#001E27] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* 404 icon */}
        <div className="mb-6">
          <span className="text-8xl font-bold text-[#EFC368]">404</span>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4">
          Page non trouvée
        </h1>
        
        <p className="text-white/70 mb-8">
          Oups ! La page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/produits"
            className="px-6 py-3 bg-[#EFC368] hover:bg-[#d4a84a] text-black font-semibold rounded-lg transition-colors"
          >
            Voir nos produits
          </Link>
          
          <Link
            href="/"
            className="px-6 py-3 bg-[#003830] hover:bg-[#004942] text-white font-semibold rounded-lg transition-colors"
          >
            Retour à l&apos;accueil
          </Link>
        </div>
        
        {/* SEO-friendly helpful links */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <p className="text-white/50 text-sm mb-4">Liens utiles :</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/produits/categorie/fleurs-cbd" className="text-[#EFC368] hover:underline">
              Fleurs CBD
            </Link>
            <Link href="/produits/categorie/huiles-cbd" className="text-[#EFC368] hover:underline">
              Huiles CBD
            </Link>
            <Link href="/blog" className="text-[#EFC368] hover:underline">
              Blog
            </Link>
            <Link href="/contact" className="text-[#EFC368] hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
