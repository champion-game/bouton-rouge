# Le Bouton Rouge

Jeu narratif court et psychologique pour Steam (PC). Le joueur est enfermé dans la Chambre 17 avec un bouton rouge ; chaque pression change la pièce et blesse peut-être la personne de la Chambre 18. But : comprendre le système, obéir, désobéir ou s'échapper.

## Amine (le créateur)

- Développe seul, sans expérience de code : c'est toi qui codes. Français, réponses courtes et directes.
- Teste sur téléphone **en paysage** (≈ 844 × 390) et sur ordinateur (1280 × 800).
- Challenge ses idées quand elles nuisent au jeu ; propose des options réalisables.

## Stack

HTML/CSS/JS sans framework ni build (`index.html` suffit). Pièce en SVG vue de face (base 1672 × 941), sons Web Audio. Polices : Big Shoulders Stencil Text, VT323, Archivo, Reenie Beanie. Tout en français.

## Carte du code (lire seulement la section utile)

- `src/engine.js` (règles pures, tourne dans Node) : état dérivé l.51, contexte des effets l.75, actions l.234.
- `src/story.js` (données et textes) : banques de phrases l.35, table des moments l.597, fins l.690, mini-histoires de fin l.723, textes au toucher des objets l.867.
- `src/room.js` (pièce SVG) : positions et constantes en tête (écran `SC`, vitre `GL`, silhouettes `SIL`, boîtier `BX`), puis le SVG, `layout()` (adaptation à l'écran), `render()` (état → dessin), écran du moniteur, fins animées `FIN_FX`, animations `ANIMS`, icônes d'inventaire.
- `src/game.js` (interface) : historique l.36, popups l.93, événements du moteur l.159, moments l.210, inventaire l.256, toucher un objet l.278, chrono l.323, fin et mini-histoire l.353, partie l.420, écran titre l.466.
- `src/audio.js` : sons ; ambiance l.59.
- `assets/img/` : dessins de l'artiste en WebP (pack graphique v1).
- Test : `node tools/test-engine.js` (2 000 parties au hasard + un parcours par fin).

## Docs (à ouvrir seulement si la tâche l'exige)

- `docs/V3_CANONIQUE.md` : référence de conception. Avant toute modification de règles.
- `docs/V3_DECISIONS.md` : décisions prises en codant (à mettre à jour quand une décision change).
- `docs/SCRIPT_NARRATIF.md` : référence des textes (source de `story.js`).
- `docs/RESUME_JEU.txt` : résumé du jeu et des scénarios.
- Historique : `docs/CONCEPT.md`, `docs/ARBORESCENCE_V2.md`, `docs/DIRECTIVES_REV2.txt`, `prototype-v1.html`.

## État actuel

- Version **9.7** (contenu de base décrit en 6.3) : 20 moments (12 libres, 8 imposés), 6 ordres, appels, archives, 18 fins + 2 bonus (Curiosité, Les mains propres). Pack graphique v1 placé d'après le modèle d'Amine.
- Silhouette de la 18 selon la vérité : victime = homme, complice = femme, illusion = enfant (`SIL_PAR_VERITE` dans `room.js`). Bureau modulaire (pack 20/10) : `bureau3_*`, `tiroir3_*`, `compart3_*`, canevas 2000 × 1000 réduit d’un bloc (×0,4725) ; tiroir et compartiment ouverts changent aussi de taille (`taille()` dans `render()`).
- Rendu 5.5 : mur de fond `mur_fond.webp` reconstruit d'après le modèle (`tools/fond-mur.py`), profondeur (sol en perspective `sol()`, murs latéraux, ombres portées `ombre()`, liserés de lampe `lisere()`), carte d'ombre `ombre.webp` tirée de `keyart.webp` (`tools/carte-lumiere.py 0.2 38 0.56`), lampe lumineuse, vitre embrumée, grain `grain.webp`, sol mouillé (reflet du bureau et de la porte), tuyaux, reflets vitre et écran (classe `lit`, éteints avec la lampe). 7.6 : néon froid au-dessus de la vitre (`gNeon`, grésille plus souvent avec le soupçon, `neon()`), ombres de contact et reflets des objets sur le plateau (masque `mPlat`), lueur de l’écran, lueur du bouton au sol pendant un ordre.
- Fins 6.1 : chaque fin = mini-histoire de 4 planches (`HISTOIRES` dans `story.js`), illustrations attendues dans `assets/img/fins/` (liste `docs/ILLUSTRATIONS_FINS.md`), image provisoire tant qu'elles manquent.
- 8.0 : rendu d'après les consignes d'Amine (lumière locale, ombres de contact tirées des dessins, sol mat, reflet du néon dans le verre, signes vitaux centrés), traces dans la pièce, souvenirs de la partie précédente, piste au bilan, carnet sur le bureau (`carnet`), réactions de la 18 à la vitre, fin bonus « Les mains propres » (`immobile`).
- 9.0 : plus de choix (B1 sans dégât, privilèges d'obéissance, inspection ciblée annoncée au moment 8, tasse, ration et lame de fortune, veste pour cacher, baisse du soupçon, raccrocher le téléphone). Détail dans `docs/V3_DECISIONS.md`, chiffres dans `docs/EQUILIBRAGE.md`. 9.1 : la 19 (allié ou conforme), diversion qui aveugle la caméra un moment, avouer ou mentir à la 18. 9.2 : confronter la 18 avec une preuve (démasquer la complice), paragraphe de fin selon tes choix.
- Ensuite : tests avec 5 joueurs, direction artistique et son niveau Steam, page Steam, traduction anglaise.

## Règles de travail

- **Propose avant de coder** : 2 ou 3 options courtes avec recommandation, puis attends l'accord. Exceptions : bug évident, ou « vas-y ».
- Séparation moteur / rendu : une règle de jeu va dans `engine.js` ou `story.js`, jamais dans `game.js`.
- Le joueur agit en touchant les objets, pas via des menus. Jamais de numéro de cycle affiché. Pas de halo sur les objets utiles. Aucun chrono visible (ordres : 30 s invisibles, pression sonore ; seule la coupure affiche ses 10 s).
- Ne change ni les durées du chrono ni l'équilibrage des jauges sans accord.
- **Économiser les tokens** : Edit ciblé, lecture partielle (grep, plages de lignes), pas de capture ni d'image sauf demande ou problème visuel, une seule vérification rapide par changement, réponses courtes, conseiller une nouvelle conversation quand un sujet est fini.
- Après un changement visible : un test rapide (téléphone paysage + ordinateur, console sans erreur). Amine teste lui-même les versions consolidées.
- Commits petits, message clair en français. Pousse directement sur `main` (pas de branche ni de PR sauf demande).
- **Version** : à chaque push qui change le jeu, augmente « Version X.Y » dans `index.html` et les `?v=X.Y` des scripts.
- Lien pour jouer : https://champion-game.github.io/bouton-rouge/ (GitHub Pages, mis à jour après chaque push sur `main`). Pas d'artefact Claude. **Après chaque modification poussée : vérifier que le déploiement GitHub Pages est terminé (workflow « pages build and deployment » en succès sur le dernier commit), puis donner le lien avec la version : `https://champion-game.github.io/bouton-rouge/?v=X.Y`.** Toujours travailler sur `main`, même si la session propose une autre branche.
- Bonnes pratiques reprises de Dernier Abri (`champion-game/dernier-abri`).
- Codex (voir `AGENTS.md`) : images et revue sur demande, via branches `codex/*` + PR. Vérifier ses images (WebP, poids, rendu téléphone + ordinateur) avant de les intégrer sur `main` ; ses remarques de revue sont des avis à trier, pas des ordres. Refuser toute image contenant du texte ou le titre (le titre peut changer).
