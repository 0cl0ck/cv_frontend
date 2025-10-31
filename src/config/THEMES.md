# Système de Thèmes

Ce projet supporte maintenant plusieurs thèmes via des variables CSS personnalisées.

## Thème par défaut

Le thème par défaut utilise la palette Chanvre Vert :
- **Jaune/Or** : Accents principaux (#EFC368)
- **Vert** : Couleurs de marque (#126E62)
- **Bleu foncé** : Backgrounds (#012730)

## Thème Halloween

Palette Halloween : Orange / Marron / Noir

### Activation

#### Méthode 1 : Via JavaScript (recommandé)
```typescript
import { toggleHalloweenTheme, initHalloweenTheme } from '@/utils/utils';

// Activer le thème
toggleHalloweenTheme();

// Initialiser au chargement (déjà fait dans ThemeManager)
initHalloweenTheme();

// Vérifier si actif
import { isHalloweenThemeActive } from '@/utils/utils';
const isHalloween = isHalloweenThemeActive();
```

#### Méthode 2 : Via HTML
Ajouter la classe `theme-halloween` sur l'élément `<html>` :
```html
<html class="theme-halloween">
```

### Palette Halloween

| Couleur originale | Remplacement Halloween | Usage |
|-------------------|------------------------|-------|
| `cv-yellow` | `#FF6B35` (Orange) | Accents principaux, CTA |
| `cv-green` | `#8B4513` (Marron) | Couleurs de marque |
| `cv-dark-blue` | `#1A1A1A` / `#000000` (Noir) | Backgrounds |
| `cv-emerald` | `#FF8C42` (Orange émeraude) | Succès, indicateurs |
| `cv-gray-veryLight` | `#FFF5E6` (Crème chaud) | Textes sur fond sombre |

### Exemple d'utilisation

Le thème Halloween remplace automatiquement toutes les classes `cv-*` :

```tsx
// Ces classes s'adaptent automatiquement au thème actif
<div className="bg-cv-yellow text-cv-dark-blue-nearBlack">
  {/* 
    Thème par défaut : Fond jaune (#EFC368), texte bleu foncé (#001E27)
    Thème Halloween : Fond orange (#FF6B35), texte noir (#000000)
  */}
</div>
```

## Créer un nouveau thème

Pour créer un nouveau thème (ex: Noël, Pâques), ajoutez une section dans `globals.css` :

```css
.theme-noel {
  --color-cv-yellow: #FF0000;  /* Rouge Noël */
  --color-cv-green: #228B22;   /* Vert sapin */
  --color-cv-dark-blue: #1C1C1C; /* Noir doux */
  /* ... toutes les autres variables */
}
```

Ensuite, ajoutez des fonctions utilitaires dans `utils.ts` similaires à `toggleHalloweenTheme()`.

## Persistance

Le thème Halloween est sauvegardé dans `localStorage` avec la clé `halloween-theme` :
- `'true'` : Thème actif
- `'false'` : Thème désactivé

## Notes techniques

- Le système utilise des **CSS custom properties** (variables CSS)
- Les classes Tailwind `cv-*` référencent ces variables
- Le changement de thème est **instantané** (pas de rechargement)
- Compatible avec le **dark mode** existant
- Fonctionne avec tous les composants utilisant les classes `cv-*`


