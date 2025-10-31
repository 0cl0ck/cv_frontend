import type { Config } from 'tailwindcss';
import colors from './src/config/colors';

const config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'xs': '320px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        // Couleurs personnalisées Chanvre Vert - structure aplatie pour accès direct
        // Jaune/Or - accents principaux
        'cv-yellow': colors.yellow.primary,
        'cv-yellow-hover': colors.yellow.hover,
        'cv-yellow-light': colors.yellow.light,
        'cv-yellow-secondary': colors.yellow.secondary,
        'cv-yellow-hoverAlt': colors.yellow.hoverAlt,
        
        // Vert - couleurs de marque
        'cv-green': colors.green.primary,
        'cv-green-dark': colors.green.dark,
        'cv-green-darker': colors.green.darker,
        'cv-green-darkBg': colors.green.darkBg,
        'cv-green-darkHover': colors.green.darkHover,
        'cv-green-veryDark': colors.green.veryDark,
        'cv-green-active': colors.green.active,
        'cv-green-hoverAlt': colors.green.hoverAlt,
        
        // Vert émeraude - succès
        'cv-emerald': colors.emerald.primary,
        'cv-emerald-light': colors.emerald.light,
        'cv-emerald-hover': colors.emerald.hover,
        'cv-emerald-dark': colors.emerald.dark,
        
        // Cyan
        'cv-cyan-neon': colors.cyan.neon,
        'cv-cyan-active': colors.cyan.active,
        
        // Bleu foncé - backgrounds
        'cv-dark-blue': colors.darkBlue.primary,
        'cv-dark-blue-veryDark': colors.darkBlue.veryDark,
        'cv-dark-blue-nearBlack': colors.darkBlue.nearBlack,
        'cv-dark-blue-black': colors.darkBlue.black,
        'cv-dark-blue-dark': colors.darkBlue.dark,
        'cv-dark-blue-darkAlt': colors.darkBlue.darkAlt,
        'cv-dark-blue-medium': colors.darkBlue.medium,
        'cv-dark-blue-hover': colors.darkBlue.hover,
        'cv-dark-blue-border': colors.darkBlue.border,
        'cv-dark-blue-form': colors.darkBlue.form,
        'cv-dark-blue-input': colors.darkBlue.input,
        'cv-dark-blue-teal': colors.darkBlue.teal,
        'cv-dark-blue-card': colors.darkBlue.card,
        'cv-dark-blue-section': colors.darkBlue.section,
        'cv-dark-blue-search': colors.darkBlue.search,
        'cv-dark-blue-featured': colors.darkBlue.featured,
        'cv-dark-blue-bg': colors.darkBlue.bg,
        'cv-dark-blue-borderAlt': colors.darkBlue.borderAlt,
        'cv-dark-blue-filter': colors.darkBlue.filter,
        'cv-dark-blue-info': colors.darkBlue.info,
        
        // Gris
        'cv-gray-light': colors.gray.light,
        'cv-gray-medium': colors.gray.medium,
        'cv-gray-silver': colors.gray.silver,
        'cv-gray-veryLight': colors.gray.veryLight,
        'cv-gray-veryLightHover': colors.gray.veryLightHover,
        'cv-gray-dark': colors.gray.dark,
        'cv-gray-lightText': colors.gray.lightText,
        'cv-gray-border': colors.gray.border,
        'cv-gray-secondary': colors.gray.secondary,
        'cv-gray-tertiary': colors.gray.tertiary,
        
        // Métaux
        'cv-metals-bronze': colors.metals.bronze,
        'cv-metals-silver': colors.metals.silver,
        'cv-metals-gold': colors.metals.gold,
        
        // Alias pour compatibilité (anciennes valeurs dans tailwind.config.js)
        'cv-blue': colors.darkBlue.primary,
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography'), require('daisyui')],
  daisyui: {
    themes: [
      {
        light: {
          "primary": colors.green.primary,      // #126E62 - cv-green
          "secondary": colors.darkBlue.primary, // #012730 - cv-blue (basé sur usage réel)
          "accent": colors.cyan.neon,            // #4fd1c5 - cyan utilisé dans animations
          "neutral": "#3D4451",
          "base-100": "#FFFFFF",
          "info": "#3ABFF8",
          "success": colors.emerald.primary,    // #10B981 - utilisé pour succès
          "warning": "#FBBD23",
          "error": "#F87272"
        },
      },
      "light",
      "dark"
    ],
  },
} as Config & {
  daisyui?: {
    themes?: any[];
  };
};

export default config;

