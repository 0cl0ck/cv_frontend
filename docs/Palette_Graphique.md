# 🎨 Palette Graphique – Chanvre Vert (Version Simplifiée)

Ce document décrit la palette de couleurs minimaliste actuellement utilisée dans le projet **Chanvre Vert**, optimisée pour Tailwind CSS.

## 🧱 Base de la charte

La charte repose uniquement sur deux couleurs fondamentales, utilisées en mode clair comme en mode sombre. Le texte s’adapte au fond (blanc sur fond foncé, noir sur fond clair).

---

## 🌞 Mode Clair

| Élément           | Couleur HEX | Description                                 |
|-------------------|-------------|---------------------------------------------|
| `primary`         | `#002D4C`   | Bleu profond, pour les titres, CTA, boutons |
| `secondary`       | `#126E62`   | Vert dense, utilisé pour les accents        |
| `text`            | `#000000`   | Texte principal sur fond clair              |
| `background`      | `#FFFFFF`   | Fond principal                              |
| `gradient-header` | `linear-gradient(90deg, #002D4C, #126E62)` | Dégradé header |
| `gradient-footer` | `linear-gradient(90deg, #126E62, #002D4C)` | Dégradé footer |

---

## 🌚 Mode Sombre

| Élément           | Couleur HEX | Description                                 |
|-------------------|-------------|---------------------------------------------|
| `primary`         | `#002D4C`   | Idem mode clair                             |
| `secondary`       | `#126E62`   | Idem mode clair                             |
| `text`            | `#FFFFFF`   | Texte principal sur fond sombre             |
| `background`      | `#000000`   | Fond principal sombre                       |
| `gradient-header` | `linear-gradient(90deg, #002D4C, #126E62)` | Dégradé header |
| `gradient-footer` | `linear-gradient(90deg, #126E62, #002D4C)` | Dégradé footer |

---

## 🛠️ Configuration Tailwind CSS

Dans `tailwind.config.ts` :

```ts
export const theme = {
  extend: {
    colors: {
      brand: {
        primary: '#002D4C',
        secondary: '#126E62',
        lightText: '#000000',
        darkText: '#FFFFFF',
        lightBg: '#FFFFFF',
        darkBg: '#000000',
      },
    },
  },
}
```

Et pour activer le mode sombre :

```ts
darkMode: 'class',
```

---

## 🧪 Exemples d’utilisation

```html
<!-- Texte adaptatif -->
<div class="bg-brand-lightBg text-brand-lightText dark:bg-brand-darkBg dark:text-brand-darkText">
  Contenu visible selon le thème
</div>

<!-- Header dégradé -->
<header class="bg-gradient-to-r from-brand-primary to-brand-secondary text-white p-4">
  Header
</header>

<!-- Footer dégradé -->
<footer class="bg-gradient-to-r from-brand-secondary to-brand-primary text-white p-4">
  Footer
</footer>
```

---

## 🧭 Lignes directrices

- 🎯 **Objectif** : minimalisme, clarté, inspiration naturelle
- 🟢 **Accent** : le vert donne la vitalité et l’harmonie
- 🔵 **Structure** : le bleu profond ancre et crédibilise
- 🌓 **Lisibilité** : toujours du texte contrasté en fonction du fond
