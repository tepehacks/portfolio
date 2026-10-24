# Portfolio — Pierre-Alexandre Tepe

Site statique (HTML/CSS/JS, sans build) hébergé sur GitHub Pages.

## Modifier le contenu

Tout est dans [`data/content.js`](data/content.js) : profil, projets, stages (la montagne), formation, compétences.
Chaque texte existe en `fr` et `en`.

- **Ajouter un projet** : copie un bloc dans `projects` et change les champs. Sans `demo`, la carte affiche une couverture colorée avec les initiales.
- **Nouveau stage / alternance trouvée** : ajoute-le à la **fin** de `climb.experiences` → il devient un camp de plus sous le personnage. Change ensuite le texte de `climb.goal`.
- **Aperçus des projets (carrousel)** : [`js/demos.js`](js/demos.js). Gar'Oit et Kédzi utilisent de vraies captures dans `assets/img/projects/` (liste `shots`), les autres sont des mini-démos animées ([`css/demos.css`](css/demos.css)).
- **Montagne 3D et alpiniste** (dans l'accueil, à côté du nom) : [`js/mountain3d.js`](js/mountain3d.js) (Three.js r128 chargé depuis cdnjs). `T_ME` = position de l'alpiniste sur le sentier.
- **Changer les couleurs** : [`css/theme.css`](css/theme.css).
- **Remplacer le CV** : écrase `assets/cv.pdf`.

## Voir en local

Double-clique sur `index.html`.

## Mettre en ligne

1. Pousse le dépôt sur GitHub.
2. Settings → Pages → Source : *Deploy from a branch*, branche `main`, dossier `/ (root)`.
3. Le site est sur `https://tepehacks.github.io/portfolio/`
   (ou `https://tepehacks.github.io/` si le dépôt s'appelle `tepehacks.github.io`).
