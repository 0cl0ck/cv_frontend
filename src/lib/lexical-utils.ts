import type { LexicalRoot, LexicalNode, Heading } from '@/types/blog';

/**
 * Génère un ID slug à partir d'un texte
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
    .replace(/[^a-z0-9]+/g, '-') // Remplace les caractères non-alphanumériques par des tirets
    .replace(/^-+|-+$/g, '') // Supprime les tirets en début/fin
    .substring(0, 80);
}

/**
 * Extrait le texte brut d'un nœud Lexical et de ses enfants
 */
function extractText(node: LexicalNode): string {
  if (node.text) {
    return node.text;
  }

  if (node.children && Array.isArray(node.children)) {
    return node.children.map(extractText).join('');
  }

  return '';
}

/**
 * Parcourt récursivement les nœuds Lexical pour trouver les headings
 */
function findHeadings(nodes: LexicalNode[], headings: Heading[]): void {
  for (const node of nodes) {
    // Vérifier si c'est un heading
    if (node.type === 'heading' && node.tag) {
      const match = node.tag.match(/^h(\d)$/);
      if (match) {
        const level = parseInt(match[1], 10) as 1 | 2 | 3 | 4 | 5 | 6;
        const text = extractText(node).trim();
        
        if (text) {
          headings.push({
            id: slugify(text),
            text,
            level,
          });
        }
      }
    }

    // Parcourir les enfants récursivement
    if (node.children && Array.isArray(node.children)) {
      findHeadings(node.children, headings);
    }
  }
}

/**
 * Extrait les headings d'un contenu Lexical pour générer une table des matières
 * 
 * @param lexicalContent - Le contenu Lexical (structure JSON)
 * @returns Un tableau de headings avec id, text et level
 */
export function extractHeadings(lexicalContent: LexicalRoot | null | undefined): Heading[] {
  if (!lexicalContent?.root?.children) {
    return [];
  }

  const headings: Heading[] = [];
  findHeadings(lexicalContent.root.children, headings);

  return headings;
}

/**
 * Vérifie si le contenu a suffisamment de headings pour afficher une table des matières
 * 
 * @param lexicalContent - Le contenu Lexical
 * @param minHeadings - Nombre minimum de headings requis (défaut: 3)
 * @returns true si le contenu a assez de headings
 */
export function shouldShowTableOfContents(
  lexicalContent: LexicalRoot | null | undefined,
  minHeadings: number = 3
): boolean {
  const headings = extractHeadings(lexicalContent);
  return headings.length >= minHeadings;
}







