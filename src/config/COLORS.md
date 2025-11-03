# Guide de la palette de couleurs Chanvre Vert

Ce document décrit la palette de couleurs centralisée du projet. Toutes les couleurs listées ici sont **uniquement** celles réellement utilisées dans le code source.

## 📁 Fichier de constantes

**Localisation:** `frontend/src/config/colors.ts`

Ce fichier exporte toutes les couleurs organisées par catégories sémantiques.

## 🎨 Palette de couleurs

### Jaune/Or - Accents principaux

Couleurs utilisées pour les CTAs, badges, highlights.

| Nom Tailwind | Valeur | Usage |
|--------------|--------|-------|
| `cv-yellow` | `#EFC368` | Jaune/or principal - CTA principal, badges, accents |
| `cv-yellow-hover` | `#d3a74f` | Hover du jaune/or principal |
| `cv-yellow-light` | `#FFDA85` | Jaune clair pour animations neon |
| `cv-yellow-secondary` | `#E6C15A` | Jaune/or secondaire - niveau Or fidélité |
| `cv-yellow-hoverAlt` | `#d9ae5a` | Hover alternatif |

**Exemple d'utilisation:**
```tsx
// Bouton CTA principal
<button className="bg-cv-yellow hover:bg-cv-yellow-hover text-black">
  Découvrir
</button>
```

### Vert - Couleurs de marque

Couleurs utilisées pour la marque, boutons primaires, éléments verts.

| Nom Tailwind | Valeur | Usage |
|--------------|--------|-------|
| `cv-green` | `#126E62` | Vert principal de la marque |
| `cv-green-dark` | `#1A3D34` | Vert sombre - boutons primaires |
| `cv-green-darker` | `#132E27` | Vert très sombre - hover boutons |
| `cv-green-darkBg` | `#004942` | Vert foncé - backgrounds |
| `cv-green-darkHover` | `#005a57` | Vert foncé hover |
| `cv-green-veryDark` | `#003B36` | Vert très foncé |

**Exemple d'utilisation:**
```tsx
// Bouton primaire
<button className="bg-cv-green-dark hover:bg-cv-green-darker text-white">
  Valider
</button>
```

### Vert émeraude - Succès

Couleurs utilisées pour les indicateurs de succès, icônes positives.

| Nom Tailwind | Valeur | Usage |
|--------------|--------|-------|
| `cv-emerald` | `#10B981` | Vert émeraude principal - succès, indicateurs positifs |
| `cv-emerald-light` | `#34D399` | Vert émeraude clair - hover |
| `cv-emerald-hover` | `#059669` | Vert émeraude hover |
| `cv-emerald-dark` | `#007A72` | Vert émeraude sombre |

**Exemple d'utilisation:**
```tsx
// Icône de succès
<Icon className="text-cv-emerald" />
```

### Cyan - Animations

Couleur utilisée pour les animations neon.

| Nom Tailwind | Valeur | Usage |
|--------------|--------|-------|
| `cv-cyan-neon` | `#4fd1c5` | Cyan pour animations neon |

### Bleu foncé - Backgrounds

Couleurs utilisées pour les backgrounds de sections, cartes, formulaires.

| Nom Tailwind | Valeur | Usage |
|--------------|--------|-------|
| `cv-dark-blue` | `#012730` | Bleu foncé principal |
| `cv-dark-blue-veryDark` | `#002935` | Bleu très foncé |
| `cv-dark-blue-nearBlack` | `#001E27` | Bleu presque noir |
| `cv-dark-blue-black` | `#001A1F` | Bleu noir |
| `cv-dark-blue-dark` | `#002B33` | Bleu foncé |
| `cv-dark-blue-darkAlt` | `#002930` | Bleu foncé alternatif |
| `cv-dark-blue-medium` | `#00424A` | Bleu foncé moyen |
| `cv-dark-blue-hover` | `#005866` | Bleu foncé hover |
| `cv-dark-blue-border` | `#003A45` | Bleu foncé bordure |
| `cv-dark-blue-form` | `#00343C` | Bleu foncé formulaire |
| `cv-dark-blue-input` | `#00242A` | Bleu très foncé input |
| `cv-dark-blue-teal` | `#155757` | Bleu-vert foncé |
| `cv-dark-blue-card` | `#023440` | Bleu foncé carte |
| `cv-dark-blue-section` | `#003038` | Bleu foncé section |
| `cv-dark-blue-search` | `#002732` | Bleu foncé recherche |

**Exemple d'utilisation:**
```tsx
// Section avec fond sombre
<section className="bg-cv-dark-blue text-white">
  Contenu
</section>
```

### Gris - Textes et neutres

Couleurs utilisées pour les textes, bordures, éléments secondaires.

| Nom Tailwind | Valeur | Usage |
|--------------|--------|-------|
| `cv-gray-light` | `#D1D5DB` | Gris clair - texte principal sur fond sombre |
| `cv-gray-medium` | `#BEC3CA` | Gris moyen - texte secondaire |
| `cv-gray-silver` | `#9CA3AF` | Gris - niveau Argent fidélité |
| `cv-gray-veryLight` | `#F4F8F5` | Gris très clair/beige - backgrounds clairs |
| `cv-gray-veryLightHover` | `#E5EDE7` | Gris très clair hover |
| `cv-gray-dark` | `#171717` | Gris foncé - texte sur fond clair |
| `cv-gray-lightText` | `#ededed` | Gris clair - texte dark mode |

**Exemple d'utilisation:**
```tsx
// Texte sur fond sombre
<p className="text-cv-gray-light">
  Texte principal
</p>
```

### Métaux - Niveaux de fidélité

| Nom Tailwind | Valeur | Usage |
|--------------|--------|-------|
| `cv-metals-bronze` | `#A06D5E` | Bronze - niveau de fidélité |
| `cv-metals-silver` | `#9CA3AF` | Argent - niveau de fidélité |
| `cv-metals-gold` | `#E6C15A` | Or - niveau de fidélité |

## 🔧 Utilisation dans le code

### Dans les composants React/TSX

#### Option 1: Classes Tailwind (recommandé)
```tsx
<div className="bg-cv-yellow text-black">
  Bouton CTA
</div>
```

#### Option 2: Import des constantes TypeScript
```tsx
import { colors } from '@/config/colors';

// Dans un style inline
<div style={{ backgroundColor: colors.yellow.primary }}>
  Contenu
</div>
```

### Dans le CSS

Les couleurs dans `globals.css` restent en hexadécimal avec des commentaires indiquant le nom Tailwind correspondant pour référence.

### Mapping des anciennes couleurs

| Ancienne valeur | Nouveau nom Tailwind |
|-----------------|----------------------|
| `#EFC368` | `cv-yellow` |
| `#d3a74f` | `cv-yellow-hover` |
| `#012730` | `cv-dark-blue` |
| `#126E62` | `cv-green` |
| `#1A3D34` | `cv-green-dark` |
| `#004942` | `cv-green-darkBg` |
| `#10B981` | `cv-emerald` |
| `#F4F8F5` | `cv-gray-veryLight` |

## 📝 Migration en cours

**Note importante:** La migration des couleurs hardcodées vers les classes Tailwind est un processus continu. 

**Fichiers déjà migrés:**
- ✅ `frontend/src/components/Hero/ImageHero.tsx`
- ✅ `frontend/src/components/ui/button.tsx`
- ✅ `frontend/src/components/sections/FeaturesBanner.tsx`

**Fichiers à migrer progressivement:**
- Tous les autres fichiers contenant des couleurs hexadécimales hardcodées

**Comment migrer:**
1. Identifier les couleurs hexadécimales dans le fichier
2. Trouver la correspondance dans ce document ou dans `colors.ts`
3. Remplacer `bg-[#EFC368]` par `bg-cv-yellow`
4. Remplacer `text-[#126E62]` par `text-cv-green`
5. Etc.

## 🎯 Bonnes pratiques

1. **Toujours utiliser les classes Tailwind** (`cv-*`) au lieu de valeurs hex directes
2. **Consulter ce document** avant d'ajouter une nouvelle couleur
3. **Ne pas ajouter** de nouvelles couleurs sans les documenter ici
4. **Utiliser les couleurs sémantiques** quand approprié (ex: `cv-emerald` pour succès)

## 📚 Références

- Fichier source: `frontend/src/config/colors.ts`
- Configuration Tailwind: `frontend/tailwind.config.ts`
- CSS global: `frontend/src/app/globals.css`





