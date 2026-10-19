# Le Bouton Rouge

Jeu narratif court et psychologique, destiné à Steam (PC). Le joueur est enfermé dans la Chambre 17 avec un énorme bouton rouge. Chaque pression change la pièce, et blesse peut-être la personne de la Chambre 18. Le but : comprendre le système et décider d'obéir, de désobéir ou de s'échapper.

- `docs/CONCEPT.md` : le concept d'origine écrit par Amine.
- `docs/V3_CANONIQUE.md` : **la référence de conception actuelle (V3)**, écrite par Amine. Lis-la avant toute modification de règles.
- `docs/V3_DECISIONS.md` : ce qui a été tranché en codant la V3 (cycles et chronos jamais visibles, ordre ignoré = refus, solutions aux failles).
- `docs/ARBORESCENCE_V2.md` : l'ancienne conception v2, gardée pour l'historique.
- `docs/SCRIPT_NARRATIF.md` : **la référence des textes** (dialogues, phrases du Système et de la 18, fins), écrite par Amine. Les textes du jeu (`src/story.js`) en viennent.

## Contexte du créateur

- Amine développe seul, sans expérience de programmation de jeu : c'est toi qui écris le code.
- Il communique en français et veut des réponses courtes et directes.
- Il teste souvent sur son téléphone : le jeu doit rester jouable en portrait à environ 390 px de large, et bien tenir sur un écran d'ordinateur (1280 × 800).
- Challenge ses idées quand elles nuisent au jeu, et propose des options réalisables.
- Il a déjà fait un jeu avec Claude Code : Dernier Abri (dépôt `champion-game/dernier-abri`), dont on reprend les bonnes pratiques.

## Stack technique

- HTML, CSS et JavaScript sans framework ni étape de build. Ouvrir `index.html` suffit pour jouer.
- La pièce est dessinée en SVG, vue fixe de face. Les sons sont synthétisés avec Web Audio.
- Polices : Big Shoulders Stencil Text (titres), VT323 (texte du moniteur), Archivo (interface), Reenie Beanie (lettres écrites à la main), via Google Fonts.
- Interface entièrement en français.

## État actuel

- `index.html` est la **V3** jouable (version 3.0) : 20 cycles cachés, 5 fils, 23 situations + 7 actions (appels sortants, fusible, plan), 18 fins + Curiosité. Code dans `src/`.
- `prototype-v1.html` garde le prototype v1 (histoire linéaire, 4 fins) pour comparaison.
- Tests : `node tools/test-engine.js` (30 000 parties au hasard par défaut).
- Les décisions d'intégration de la V3 sont dans `docs/V3_DECISIONS.md`.

## Structure visée pour la v2

- `src/engine.js` : les règles pures (cycles, jauges, objets, situations, conditions des fins). Aucun accès au DOM, il doit tourner dans Node comme dans le navigateur.
- `src/story.js` : les 23 situations sous forme de données (fil, condition, texte, choix A et B, effets). Les textes qui changent selon la vérité cachée y sont aussi.
- `src/room.js` : le dessin SVG de la pièce et ses animations.
- `src/audio.js` : les sons.
- `src/game.js` : la boucle de jeu, le chrono, l'interface des choix, les écrans de fin.
- `tools/test-engine.js` : tests Node. Joue des milliers de parties au hasard et vérifie : aucune erreur, chaque partie finit avant ou au cycle 20, chacune des 18 fins est atteignable, aucune situation n'est inatteignable, et les parcours voulus vers les fins rares fonctionnent.

## Règles de travail

- **Propose avant de coder** : pour toute demande de changement, présente d'abord 2 ou 3 options courtes (avec ta recommandation) et attends l'accord d'Amine. Seules exceptions : corriger un bug évident, ou s'il dit explicitement « vas-y ».
- Garde la séparation moteur / rendu : une règle de jeu va dans `engine.js` ou `story.js`, jamais dans `game.js`.
- Mets à jour `docs/V3_DECISIONS.md` quand une décision de conception change.
- Après chaque changement visible, teste le jeu en largeur téléphone et sur écran d'ordinateur, et vérifie qu'il n'y a aucune erreur dans la console.
- Fais des commits petits, avec un message clair en français.
- **Version** : à chaque push qui change le jeu, augmente le numéro dans `index.html` (texte « Version X.Y » de l'écran d'accueil et `?v=X.Y` des scripts), pour qu'Amine voie qu'il a la bonne version et que les scripts se rechargent.
- Lien pour jouer : https://champion-game.github.io/bouton-rouge/ (GitHub Pages, mis à jour tout seul après chaque push sur `main`). Ne publie plus d'artefact Claude.
- Travaille et pousse directement sur `main` (demande d'Amine) : pas de branche ni de PR, sauf s'il en demande une.
- Le joueur agit en touchant les objets de la pièce, pas via des menus. Ne jamais afficher ni citer le numéro de cycle. Pas de halo sur les objets utiles : la découverte doit rester discrète. Le seul chrono visible est celui des ordres.
- Amine teste lui-même le ressenti : ne modifie pas les durées du chrono ni l'équilibrage des jauges sans son accord.

## Prochaines étapes (par ordre de priorité)

1. ~~Coder la v2 avec un chrono réel et les 18 fins.~~ Fait, décisions validées, fins animées. Reste : polir les textes.
2. Faire tester à 5 personnes qui ne connaissent pas le jeu. Question clé : relancent-elles une partie d'elles-mêmes après leur première fin ?
3. Direction artistique et son au niveau Steam (une seule pièce : chaque détail compte).
4. Page Steam tôt, pour récolter des wishlists.
5. Traduction anglaise, une fois les textes stabilisés.
