# Le Bouton Rouge

Jeu narratif court et psychologique, destiné à Steam (PC). Le joueur est enfermé dans la Chambre 17 avec un énorme bouton rouge. Chaque pression change la pièce, et blesse peut-être la personne de la Chambre 18. Le but : comprendre le système et décider d'obéir, de désobéir ou de s'échapper.

- `docs/CONCEPT.md` : le concept d'origine écrit par Amine.
- `docs/V3_CANONIQUE.md` : **la référence de conception actuelle (V3)**, écrite par Amine. Lis-la avant toute modification de règles.
- `docs/V3_DECISIONS.md` : ce qui a été tranché en codant la V3 (cycles et chronos jamais visibles, ordre ignoré = refus, solutions aux failles).
- `docs/ARBORESCENCE_V2.md` : l'ancienne conception v2, gardée pour l'historique.
- `docs/DIRECTIVES_REV2.txt` : directives de modification d'Amine (révision 2, 19/10), appliquées en version 5.0.
- `docs/SCRIPT_NARRATIF.md` : **la référence des textes** (dialogues, phrases du Système et de la 18, fins), écrite par Amine. Les textes du jeu (`src/story.js`) en viennent.

## Contexte du créateur

- Amine développe seul, sans expérience de programmation de jeu : c'est toi qui écris le code.
- Il communique en français et veut des réponses courtes et directes.
- Il teste souvent sur son téléphone : le jeu se joue **en paysage** (décision du 19/10 ; en portrait, un écran demande de tourner le téléphone). Il doit tenir sur un téléphone en paysage (environ 844 × 390) et sur un écran d'ordinateur (1280 × 800).
- Challenge ses idées quand elles nuisent au jeu, et propose des options réalisables.
- Il a déjà fait un jeu avec Claude Code : Dernier Abri (dépôt `champion-game/dernier-abri`), dont on reprend les bonnes pratiques.

## Stack technique

- HTML, CSS et JavaScript sans framework ni étape de build. Ouvrir `index.html` suffit pour jouer.
- La pièce est dessinée en SVG, vue fixe de face. Les sons sont synthétisés avec Web Audio.
- Polices : Big Shoulders Stencil Text (titres), VT323 (texte du moniteur), Archivo (interface), Reenie Beanie (lettres écrites à la main), via Google Fonts.
- Interface entièrement en français.

## État actuel

- `index.html` est la version jouable **5.1** (directives révision 2 appliquées, pack graphique v1) : 20 moments cachés (12 libres, 8 imposés), 6 ordres, appels, archives, 18 fins + Curiosité. Code dans `src/`, dessins de l'artiste dans `assets/img/`.
- Silhouette de la 18 : une seule série pour toutes les vérités (pack v1) ; les séries homme / femme / enfant sont attendues (voir `docs/V3_DECISIONS.md`).
- La pièce reprend l'image de référence d'Amine (vue de face, base 1672 × 941). `docs/RESUME_JEU.txt` résume le jeu et tous les scénarios.
- `prototype-v1.html` garde le prototype v1 (histoire linéaire, 4 fins) pour comparaison.
- Tests : `node tools/test-engine.js` (2 000 parties au hasard, un parcours par fin, tests d'acceptation des directives).
- Les décisions d'intégration de la V3 sont dans `docs/V3_DECISIONS.md`.

## Structure visée pour la v2

- `src/engine.js` : les règles pures (cycles, jauges, objets, situations, conditions des fins). Aucun accès au DOM, il doit tourner dans Node comme dans le navigateur.
- `src/story.js` : les 23 situations sous forme de données (fil, condition, texte, choix A et B, effets). Les textes qui changent selon la vérité cachée y sont aussi.
- `src/room.js` : la pièce (dessins de `assets/img/` posés dans un SVG) et ses animations.
- `src/audio.js` : les sons.
- `src/game.js` : la boucle de jeu, le chrono, l'interface des choix, les écrans de fin.
- `tools/test-engine.js` : tests Node. Joue des milliers de parties au hasard et vérifie : aucune erreur, chaque partie finit avant ou au cycle 20, chacune des 18 fins est atteignable, aucune situation n'est inatteignable, et les parcours voulus vers les fins rares fonctionnent.

## Règles de travail

- **Propose avant de coder** : pour toute demande de changement, présente d'abord 2 ou 3 options courtes (avec ta recommandation) et attends l'accord d'Amine. Seules exceptions : corriger un bug évident, ou s'il dit explicitement « vas-y ».
- Garde la séparation moteur / rendu : une règle de jeu va dans `engine.js` ou `story.js`, jamais dans `game.js`.
- Mets à jour `docs/V3_DECISIONS.md` quand une décision de conception change.
- Après chaque changement visible, teste le jeu sur téléphone en paysage et sur écran d'ordinateur, et vérifie qu'il n'y a aucune erreur dans la console.
- **Tests rapides seulement** (demande d'Amine, 19/10) : pas de longues séries de tests navigateur pendant le développement. Un passage court du moteur suffit ; Amine teste lui-même quand une version est consolidée.
- **Économiser les tokens** (demande d'Amine, 19/10) :
  - modifier seulement les lignes concernées (Edit ciblé), jamais réécrire un fichier entier sans nécessité ;
  - lire seulement la partie utile d'un fichier (grep, plages de lignes) ;
  - pas de capture d'écran ni de lecture d'image, sauf si Amine le demande ou si un problème visuel l'exige ;
  - une seule vérification rapide par changement, pas de séries de tests ;
  - réponses courtes ;
  - conseiller une nouvelle conversation quand un sujet est terminé (tout le contexte utile est dans ce fichier et `docs/`).
- Fais des commits petits, avec un message clair en français.
- **Version** : à chaque push qui change le jeu, augmente le numéro dans `index.html` (texte « Version X.Y » de l'écran d'accueil et `?v=X.Y` des scripts), pour qu'Amine voie qu'il a la bonne version et que les scripts se rechargent.
- Lien pour jouer : https://champion-game.github.io/bouton-rouge/ (GitHub Pages, mis à jour tout seul après chaque push sur `main`). Ne publie plus d'artefact Claude.
- Travaille et pousse directement sur `main` (demande d'Amine) : pas de branche ni de PR, sauf s'il en demande une.
- Le joueur agit en touchant les objets de la pièce, pas via des menus. Ne jamais afficher ni citer le numéro de cycle. Pas de halo sur les objets utiles : la découverte doit rester discrète. Le seul chrono visible est celui des ordres.
- Amine teste lui-même le ressenti : ne modifie pas les durées du chrono ni l'équilibrage des jauges sans son accord.

## Prochaines étapes (par ordre de priorité)

0. ~~Garde-fous G1 à G7 et ajouts validés le 19/10~~ : faits en version 4.0 (voir `docs/V3_DECISIONS.md`). Restent en attente : les tests avec des joueurs (mode test, rapport de partie).

1. ~~Coder la v2 avec un chrono réel et les 18 fins.~~ Fait, décisions validées, fins animées. Reste : polir les textes.
2. Faire tester à 5 personnes qui ne connaissent pas le jeu. Question clé : relancent-elles une partie d'elles-mêmes après leur première fin ?
3. Direction artistique et son au niveau Steam (une seule pièce : chaque détail compte).
4. Page Steam tôt, pour récolter des wishlists.
5. Traduction anglaise, une fois les textes stabilisés.
