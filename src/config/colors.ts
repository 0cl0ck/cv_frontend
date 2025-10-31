/**
 * Palette de couleurs centralisée pour Chanvre Vert
 * 
 * Ce fichier contient UNIQUEMENT les couleurs réellement utilisées dans le code.
 * Toutes les valeurs proviennent d'une analyse directe du code source.
 * 
 * Usage:
 * - Dans Tailwind: utiliser les classes `bg-cv-*`, `text-cv-*`, etc.
 * - Dans TypeScript: importer depuis ce fichier
 * - Dans CSS inline: utiliser les constantes exportées
 */

/**
 * Couleurs principales - Jaune/Or (accents principaux)
 * Utilisées pour les CTAs, highlights, badges
 */
export const yellow = {
  /** Jaune/or principal - CTA principal, badges, accents */
  primary: '#EFC368',
  /** Hover du jaune/or principal */
  hover: '#d3a74f',
  /** Jaune clair pour animations neon */
  light: '#FFDA85',
  /** Jaune/or secondaire - niveau Or fidélité */
  secondary: '#E6C15A',
  /** Hover alternatif */
  hoverAlt: '#d9ae5a',
} as const;

/**
 * Couleurs principales - Vert (couleurs de marque)
 * Utilisées pour la marque, boutons primaires, éléments verts
 */
export const green = {
  /** Vert principal de la marque */
  primary: '#126E62',
  /** Vert sombre - boutons primaires */
  dark: '#1A3D34',
  /** Vert très sombre - hover boutons */
  darker: '#132E27',
  /** Vert foncé - backgrounds */
  darkBg: '#004942',
  /** Vert foncé hover */
  darkHover: '#005a57',
  /** Vert très foncé */
  veryDark: '#003B36',
  /** Vert actif - variations sélectionnées */
  active: '#03745C',
  /** Vert hover alternatif */
  hoverAlt: '#014842',
} as const;

/**
 * Vert émeraude (succès, état positif)
 * Utilisé pour les indicateurs de succès, icônes positives
 */
export const emerald = {
  /** Vert émeraude principal - succès, indicateurs positifs */
  primary: '#10B981',
  /** Vert émeraude clair - hover */
  light: '#34D399',
  /** Vert émeraude hover */
  hover: '#059669',
  /** Vert émeraude sombre */
  dark: '#007A72',
} as const;

/**
 * Cyan (animations, accents)
 */
export const cyan = {
  /** Cyan pour animations neon */
  neon: '#4fd1c5',
  /** Cyan actif - éléments actifs */
  active: '#00878a',
} as const;

/**
 * Bleu foncé (backgrounds, sections)
 * Utilisées pour les backgrounds de sections, cartes, formulaires
 */
export const darkBlue = {
  /** Bleu foncé principal */
  primary: '#012730',
  /** Bleu très foncé */
  veryDark: '#002935',
  /** Bleu presque noir */
  nearBlack: '#001E27',
  /** Bleu noir */
  black: '#001A1F',
  /** Bleu foncé */
  dark: '#002B33',
  /** Bleu foncé alternatif */
  darkAlt: '#002930',
  /** Bleu foncé moyen */
  medium: '#00424A',
  /** Variante (même valeur, casse différente) */
  mediumAlt: '#00424c',
  /** Bleu foncé hover */
  hover: '#005866',
  /** Bleu foncé bordure */
  border: '#003A45',
  /** Bleu foncé formulaire */
  form: '#00343C',
  /** Bleu très foncé input */
  input: '#00242A',
  /** Bleu-vert foncé */
  teal: '#155757',
  /** Bleu foncé carte */
  card: '#023440',
  /** Bleu foncé section */
  section: '#003038',
  /** Bleu foncé recherche */
  search: '#002732',
  /** Bleu foncé filtre */
  filter: '#00454f',
  /** Bleu foncé bg alternatif */
  bg: '#003945',
  /** Bleu foncé bordure alternative */
  borderAlt: '#005965',
  /** Bleu foncé featured */
  featured: '#00333e',
  /** Bleu foncé info (message boxes) */
  info: '#003545',
} as const;

/**
 * Gris (textes et éléments neutres)
 * Utilisées pour les textes, bordures, éléments secondaires
 */
export const gray = {
  /** Gris clair - texte principal sur fond sombre */
  light: '#D1D5DB',
  /** Gris moyen - texte secondaire */
  medium: '#BEC3CA',
  /** Gris - niveau Argent fidélité */
  silver: '#9CA3AF',
  /** Gris très clair/beige - backgrounds clairs */
  veryLight: '#F4F8F5',
  /** Gris très clair hover */
  veryLightHover: '#E5EDE7',
  /** Gris foncé - texte sur fond clair */
  dark: '#171717',
  /** Gris clair - texte dark mode */
  lightText: '#ededed',
  /** Gris bordure - bordures */
  border: '#3A4A4F',
  /** Gris secondaire - textes secondaires */
  secondary: '#8A9A9D',
  /** Gris tertiaire - textes tertiaires */
  tertiary: '#8A9EA5',
} as const;

/**
 * Noir et Blanc
 */
export const neutral = {
  /** Noir pur */
  black: '#000000',
  /** Blanc */
  white: '#ffffff',
  /** Noir dark mode */
  darkMode: '#0a0a0a',
} as const;

/**
 * Métaux (niveaux de fidélité)
 */
export const metals = {
  /** Bronze - niveau de fidélité */
  bronze: '#A06D5E',
  /** Argent - niveau de fidélité (partagé avec gray.silver) */
  silver: '#9CA3AF',
  /** Or - niveau de fidélité (partagé avec yellow.secondary) */
  gold: '#E6C15A',
} as const;

/**
 * Export unifié de toutes les couleurs
 * Organisées par usage sémantique
 */
export const colors = {
  yellow,
  green,
  emerald,
  cyan,
  darkBlue,
  gray,
  neutral,
  metals,
} as const;

/**
 * Couleurs avec noms sémantiques pour usage facile
 * Permet d'accéder rapidement aux couleurs les plus utilisées
 */
export const semantic = {
  /** Couleur primaire de la marque (vert) */
  primary: green.primary,
  /** Couleur secondaire (vert sombre) */
  secondary: green.dark,
  /** Couleur d'accent (jaune/or) */
  accent: yellow.primary,
  /** Couleur de succès */
  success: emerald.primary,
  /** Couleur de background sombre */
  backgroundDark: darkBlue.primary,
  /** Couleur de texte sur fond sombre */
  textLight: gray.light,
  /** Couleur de texte secondaire */
  textSecondary: gray.medium,
} as const;

/**
 * Export par défaut
 */
export default colors;

