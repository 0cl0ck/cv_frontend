import { Media } from '@/payload-types';
import configPromise from '@/payload.config';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { getPayload } from 'payload';
import { ProductDetails } from './components/ProductDetails';
import { ProductGallery } from './components/ProductGallery';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

// Définition des types pour les paramètres de la page
type Props = {
  params: Promise<{ slug: string }>;
};

// Types pour le Rich Text de Payload
interface RichTextNode {
  type: string;
  children?: { text?: string; type: string }[];
}

interface RichText {
  root: {
    children: RichTextNode[];
  };
}

// Fonction utilitaire pour extraire le texte brut du Rich Text
function extractPlainText(richText: RichText | string | null | undefined): string {
  if (!richText) return '';
  if (typeof richText === 'string') return richText;

  try {
    return richText.root.children
      .map((node) => {
        if (node.children) {
          return node.children.map((child) => child.text || '').join(' ');
        }
        return '';
      })
      .join('\n')
      .trim();
  } catch (error) {
    console.error("Erreur lors de l'extraction du rich text:", error);
    return '';
  }
}

// Fonction pour récupérer un produit par son slug
async function getProduct(productSlug: string) {
  const payload = await getPayload({ config: configPromise });
  try {
    const where = {
      slug: {
        equals: productSlug,
      },
      ...(process.env.PAYLOAD_ENABLE_DRAFTS === 'true' && {
        _status: {
          equals: 'published',
        },
      }),
    };

    const product = await payload.find({
      collection: 'products',
      where,
      depth: 2,
    });

    return product.docs[0] || null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Génération des métadonnées de la page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  // Récupérer le slug depuis les paramètres de route
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: 'Produit non trouvé | Chanvre Vert',
      description: "Le produit que vous recherchez n'existe pas.",
    };
  }

  const description = extractPlainText(product.description);

  return {
    title: `${product.name} | Chanvre Vert`,
    description: description || 'Découvrez notre produit CBD de qualité',
    openGraph: {
      title: product.name,
      description: description || 'Découvrez notre produit CBD de qualité',
      images: product.images?.map((image) => ({
        url: typeof image === 'string' ? image : image.url || '',
        width: typeof image === 'string' ? 800 : image.width || 800,
        height: typeof image === 'string' ? 600 : image.height || 600,
        alt: product.name,
      })),
    },
  };
}

// Composant principal de la page produit
export default async function ProductPage({ params }: Props) {
  // Force dynamic rendering
  headers();

  // Récupérer le slug depuis les paramètres de route
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  // Convertir les images en Media[]
  const images = product.images
    .map((image): Media | null => {
      if (typeof image === 'string') {
        return {
          id: image,
          url: image,
          filename: '',
          mimeType: '',
          filesize: 0,
          width: 800,
          height: 600,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      return image;
    })
    .filter((image): image is Media => image !== null);

  return (
    <div className="container mx-0 px-4 py-12">
      <div className="grid gap-8 md:grid-cols-2">
        <ProductGallery images={images} title={product.name} />
        <ProductDetails product={product} />
      </div>
    </div>
  );
}
