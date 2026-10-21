# Le Bouton Rouge — consignes pour Codex

Jeu narratif court et psychologique (PC / Steam, jouable aussi sur téléphone). Le joueur est enfermé dans la Chambre 17 avec un bouton rouge ; derrière une vitre, la Chambre 18. Tout le jeu est en français.

Le créateur, Amine, ne code pas. Le code est écrit par Claude (voir `CLAUDE.md`). **Ton rôle est limité à deux tâches, et uniquement quand Amine te le demande.**

## 1. Images et illustrations

- Dépose les images dans `assets/img/` (ou `assets/img/fins/` pour les planches de fin), **en WebP**, avec le nom exact demandé.
- Style : suis `docs/BRIEF_ARTISTE.md` (clinique, sombre, grain, lumière froide, un seul rouge vif : le bouton). Inspire-toi des images déjà présentes dans `assets/img/` pour rester cohérent avec le pack de l'artiste.
- Pas de texte incrusté dans les images (le jeu écrit lui-même les textes).
- Planches de fin : format 4:3 (≈ 660 × 490), noms et sujets dans `docs/ILLUSTRATIONS_FINS.md`.
- Poids raisonnable : viser moins de 150 Ko par image (le jeu tourne aussi sur téléphone).
- Ne remplace pas une image existante sans qu'Amine l'ait demandé explicitement.

## 2. Revue de code (seulement sur demande)

- Quand Amine écrit « @codex review », relis le code et réponds **en commentaires, sans rien modifier**.
- Priorités : bugs, erreurs dans la console, problèmes sur téléphone en paysage (≈ 844 × 390) et ordinateur (1280 × 800).
- Règles du projet à respecter dans tes remarques : les règles de jeu restent dans `src/engine.js` / `src/story.js`, jamais dans `src/game.js` ; pas de chrono visible ; pas de halo sur les objets ; pas de numéro de cycle affiché. Ne propose pas de changer l'équilibrage ou les durées sans le signaler comme une question à Amine.
- Écris en français, court et direct.

## Ce que tu ne fais jamais

- Ne pas modifier `src/`, `index.html`, `tools/`, `docs/`, `CLAUDE.md` ni ce fichier.
- Ne jamais pousser sur `main`. Travaille sur une branche `codex/<sujet>` et ouvre une pull request. Claude vérifie les images (format, poids, rendu) et les intègre au jeu.
- Ne pas changer le numéro de version du jeu.

## Test

Pour vérifier que rien n'est cassé : `node tools/test-engine.js`. Le jeu s'ouvre avec `index.html`, sans installation ni build.
