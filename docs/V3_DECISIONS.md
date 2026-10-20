# Le Bouton Rouge — Décisions d'intégration de la V3

Complète `docs/V3_CANONIQUE.md` (la référence). Ce fichier liste ce qui a été tranché en codant la V3, le 19/10.
Chaque point se change à un seul endroit de `src/story.js` ou `src/engine.js`.

## Décisions d'Amine (19/10)

- **Les cycles** existent dans le moteur pour expliquer la logique, mais **le joueur ne les voit jamais** : aucun texte ne cite un numéro de cycle ni une durée en cycles (« 3 CYCLES » devient « FERMETURE AUTOMATIQUE PROGRAMMÉE », « DURÉE DES CYCLES : 20 S » est retiré, le journal n'affiche pas « C05 »).
- **Les chronos** de la V3 (30 s, 20 s, 15 s) ne sont pas affichés. Les moments libres n'ont pas de chrono. Le seul chrono visible reste celui des ordres (30 s, choix d'Amine du 18/10).
- **Ne rien faire pendant un ordre = ordre refusé** (soupçon +1, comme un refus).
- **Pas d'onglets** : le joueur agit en touchant les objets de la pièce (règle validée le 18/10).

## Solutions aux failles du scénario

1. **La « vie » de la 18 en vérité B et C.** Trop tard ne se déclenche plus dès que la vie tombe à 0. Il arrive seulement :
   - en vérité A, si on rejoint la 18 par le conduit alors qu'elle est morte ;
   - au verdict, si on avait promis de venir et que la vie est à 0.

   En vérité B et C, rejoindre la 18 révèle la vérité, quelle que soit sa « vie » : ses souffrances étaient jouées, ou projetées.
2. **Le plan commun.** Une fois accepté, et quand la caméra est aveugle (coupée, masquée ou tournée), une action « Déclencher le bus de maintenance » apparaît sur le boîtier, dans les trois vérités (sinon elle trahirait la vérité). Ensuite :
   - **vérité A** : Coopération ;
   - **vérité B** : c'est un piège, elle entre avec deux gardiens, et la scène se résout comme pour le Complice (fins 2, 10 ou 11) ;
   - **vérité C** : la silhouette se fige, et la scène se résout comme pour le Miroir (fins 12 ou 13).
3. **Sujet 18 (fin 11).** Cette fin arrive si on rejoint la 18 en vérité B **sans tournevis, ou avec un soupçon de 2 ou plus** (ils t'attendaient). Le Complice démasqué demande le tournevis **et** un soupçon inférieur à 2. L'Employé du mois (conformité ≥ 5) passe avant les deux.
4. **Sortir par la porte de B5 alors que la 18 est morte** : Sujet conforme. **Sortir avec le badge (H3 A)** : L'Évasion.
5. **Verdict du cycle 20**, dans cet ordre :
   - promesse faite et vie à 0 : Trop tard ;
   - vérité B révélée et conformité ≥ 5 : L'employé du mois ;
   - vie à 0 et conformité ≥ 3 : Sujet conforme ;
   - sinon : Le Temps est écoulé.

   Le Gardien n'est plus une fin par défaut.
6. **Le code 7412** se tape sur un petit clavier sous le bureau. Dès que le code est complet (7_ _2 de la 18, et 4·1 du répondeur de 16 ou des gravures), la trappe devient accessible. Pas de saisie manuelle.
7. **Remplacer le fusible** est une action du boîtier (« AUX 24 V — DÉFAUT »). Elle prend un moment, comme toute action. Elle demande le fusible et le tournevis. Elle déverrouille la trappe et alimente les haut-parleurs (La Révolte).
8. **Montrer le mot de 16 à la caméra (H1 B)** ferme seulement les gravures (H2). Le badge et l'enregistrement trouvés au sous-sol restent utilisables : ce sont des objets physiques.
9. **La cache (H2 B)** protège le dernier objet confiscable acquis. Si on n'en a pas encore, elle protège le prochain.
10. **Le bouton reste rouge après le sabotage de l'actionneur** : le sabotage est invisible, ce qui permet de faire semblant d'obéir.
11. **B2 (trois pressions)** : il faut vraiment appuyer trois fois sur le bouton. La 18 ne perd qu'une vie. Moins de trois pressions avant la fin du décompte = refus.
12. **L'enregistrement (H4 A)** révèle la vérité sans finir la partie. Les fins Miroir et Briser la boucle passent par le conduit ou le plan.

## Fins rares au hasard

Coopération et Briser la boucle sortent rarement dans les parties au hasard, car elles demandent un vrai plan. `tools/test-engine.js` vérifie à chaque fois qu'un parcours voulu y mène.

## Ajustements du 19/10 (après test d'Amine)

- **Les objets restent à leur place** : après B2, le tiroir se déverrouille et un compartiment s'ouvre sur le côté du socle, mais c'est au joueur d'aller prendre le tournevis et le fusible. Prendre un objet ne coûte pas de cycle.
- **Le texte du moniteur est tapé lettre par lettre** et reste affiché assez longtemps pour être lu. Les textes des popups sont tapés aussi. Toucher la pièce ou « Continuer » accélère.
- **Le popup** reste réservé aux informations importantes (appels, découvertes, conséquences).
- **La lettre de 16** s'affiche comme une vraie feuille manuscrite (recto, et verso une fois gardée).

## Rejouabilité et ambiance (19/10, validé par Amine)

- **Le Système se souvient des sessions précédentes** (gardées dans le navigateur du joueur). Le numéro de test augmente (04-17, 04-18…). Le Système commente la dernière fin (« Vous aviez choisi le bouton. Encore ? ») et le nombre de pressions (« La dernière fois, vous avez appuyé 4 fois. »). Après la fin Miroir, l'intro affiche « SUJET 18 IDENTIFIÉ » avant de se corriger. Au premier appel, la 18 dit : « J'ai l'impression de t'avoir déjà parlé. »
- **L'écran de fin donne un indice** vers une fin pas encore découverte : « Une autre fin t'attendait si tu avais… ».
- **L'ambiance sonore évolue** : respiration derrière la vitre (calme, rapide, hachée, puis silence), bourdonnement grave qui monte avec le soupçon, ventilation coupée pendant l'autotest et affaiblie quand l'air se raréfie, bruits lointains de temps en temps (pas, porte, métal, coups).

## Ajustements du 19/10 (suite)

- **Quand la 18 ne répond plus** (vie à 0), les ordres continuent, mais le Système le dit froidement : « LE SUJET 18 NE RÉPOND PLUS. L'ÉVALUATION CONTINUE. APPUYEZ. » Plus de purge ni de preuve ; obéir ne fait souffrir personne (« Personne ne souffre. Vous avez appuyé quand même. »). Refuser la purge ne donne plus « Mensonge prouvé ».
- **Pendant un ordre ou un appel, le joueur peut faire autre chose** en touchant un objet. L'ordre compte alors comme refusé (soupçon +1), l'appel comme ignoré. Prendre un objet (tournevis, fusible) ne compte pas.
- **L'intro se déroule seule** : son popup se referme tout seul, pas besoin de toucher « Continuer ».
- **L'historique n'affiche rien** tant qu'on ne touche pas le bouton « Historique ». Les messages passent par le moniteur et les popups.


## Version 4.0 (19/10) : les dessins de l'artiste, les garde-fous et les ajouts validés

**Graphismes.** La pièce utilise maintenant les dessins de l'artiste (`assets/img/`, découpés depuis ses planches). La vue reste fixe de face ; le jeu ajoute lui-même le cône de lumière, le noir, le rouge et la lumière de secours.

**La silhouette dépend de la vérité cachée (décision d'Amine).** Un homme si la 18 est une vraie victime (A), une femme si c'est la complice (B), un enfant si c'est nous (C). Le joueur ne le sait pas à sa première partie : c'est un indice « devant ses yeux » qu'il comprend après coup. L'enfant est plus petit : sa tête apparaît plus bas derrière le verre. Les poses suivent la vie de la 18 (debout, courbée, accroupie) et les événements (paume sur la vitre, poing qui frappe, recul à la douleur). La pose au téléphone n'existe que pour l'homme (A) ; en B et C, la silhouette se décale.

**Garde-fous G1 à G7** (détails dans `docs/ETUDE_SCENARIOS.md`) :
- G1 : un tournevis forcé, ou un badge et un enregistrement remontés du sous-sol, sous les yeux de la caméra, sont repris par un gardien au début du moment suivant. Pas s'ils sont cachés sous la plaque, si la caméra est aveuglée entre-temps, ni s'ils ont été pris pendant la coupure ou depuis l'angle mort. Ce que le Système donne en récompense (B2) n'est jamais repris.
- G2 : descendre dans la trappe (« SUJET 17 NON VISIBLE »), préparer la sortie dérobée et remplacer le fusible font monter le soupçon de 1 (mêmes exceptions).
- G3 : l'inspection (soupçon ≥ 2) retire la veste, remet la caméra face à la pièce et revisse la grille (le conduit se referme ; on peut le rouvrir). Une caméra coupée au boîtier reste coupée.
- G4 : au verdict, 18 morte et conformité < 3 : variante de « Le Temps est écoulé », la porte de la 18 s'ouvre sur une pièce vide et quelqu'un d'autre entre.
- G5 : au début de B6, si la porte est ouverte, le Système prévient « VOTRE PORTE EST OUVERTE ».
- G6 : obéir à un ordre fait baisser le soupçon de 1.
- G7 : plan accepté mais pas exécuté : la 18 tente seule (vie −1, le plan est perdu) au début du dernier tiers, et au plus tôt trois moments après l'accord.

**Ajouts validés :**
- Écran titre : Continuer, Nouvelle partie, Fins découvertes, Réglages. Le bouton « Menu » y ramène pendant la partie.
- Sauvegarde automatique au début de chaque moment ; « Continuer » reprend là (un ordre en cours repart avec un chrono plein).
- Réglages : vitesse du texte (lente, normale, rapide) et son.
- Le journal de 16 : quatre pages cachées (sous la tasse, derrière l'écran, au fond du tiroir ouvert, dans le conduit). Lire une page ne coûte pas de temps ; sa dernière ligne fait écho aux choix du joueur. Les pages se relisent dans l'inventaire.
- Indices discrets sur la vérité (deux au plus par partie) : pleurs au téléphone (A), un pan de blouse (B), ton reflet qui se superpose à la silhouette (C).
- Un murmure synthétisé accompagne la voix de la 18 pendant que son texte se tape (plus grave pour l'homme, plus aigu pour la femme et l'enfant).
- Vrais objets à voir : le papier qui revient par la grille, les gravures de 16, la vidéo de B3 sur le moniteur, et les images floues de la Chambre 18 quand on la rejoint par le conduit.

## Corrections 4.1 (19/10)

- **Pendant la coupure (cycle 6), la caméra est hors ligne** : elle compte comme aveuglée. Le Système ne commente plus un objet pris dans le noir (« TOURNEVIS OBTENU » apparaissait au retour de la lumière), forcer le tiroir ne déclenche plus « BRUIT ANORMAL », et on ne peut pas montrer le mot à une caméra éteinte.
- **Les messages restent dans l'ordre** : le popup (téléphone, voix, ce qu'on voit) s'affiche avant la suite du moniteur, au lieu d'arriver après.

## Version 4.2 (19/10) : la pièce d'après l'image de référence d'Amine

- **Disposition calquée sur l'image de référence** : caméra dans le coin en haut à gauche, grande porte à gauche avec le mot dessous, grille entre la porte et le moniteur, lampe au-dessus du moniteur, bureau au centre (téléphone, bouton, tasse), tiroir dans le bandeau du bureau, compartiment en bas du socle, grande vitre à droite avec les témoins et le boîtier dessous, trappe au sol à droite. Coins de la pièce en perspective, ombre et lumière du bureau au sol.
- **Nouveau bureau** dessiné par l'artiste (plateau, socle avec la fente du tiroir et le compartiment, tiroirs fermé / ouvert / avec tournevis). Le compartiment ouvert montre le fusible dessiné.
- **Le jeu se joue en paysage** (décision d'Amine) : en portrait sur téléphone ou tablette, un écran demande de tourner l'appareil. Sur téléphone, le jeu passe en plein écran et se bloque en paysage quand le navigateur le permet. Les barres et les popups sont plus fins en paysage.
- La vidéo de B3 se regarde en entier avant le popup.

## Version 5.0 (19/10) : les directives de modification (révision 2) appliquées

Référence complète : `docs/DIRECTIVES_REV2.txt`. Résumé de ce qui a changé dans le code :

- **Une table unique de 20 moments** : 12 libres, 8 imposés (B1 au 2, B2 au 4, B3 au 7, inspection + B4 au 10, T4 au 11 si la ligne est ouverte, B5 au 13, proposition du Système au 16, B6 au 18, verdict au 20). Le premier appel sonne au moment 3 et reste rappelable. Coupure au 5, défaut AUX au 6, inspection annoncée au 8.
- **Le temps** : regarder, lire, écouter un enregistrement et prendre un objet sont gratuits. Les actions engageantes indiquent « Prend du temps ». Un bouton « Attendre » termine un moment libre. Descendre aux archives prend deux moments et n'est pas possible si un ordre arrive.
- **Plus jamais de pression automatique** : un ordre qui expire est un refus. Faire une action pendant un ordre ou un appel demande d'abord une confirmation (le chrono s'arrête pendant la question).
- **B2 se joue pression par pression** : 1re = tiroir, 2e = compartiment, 3e = impulsion réelle + extrait du dossier (« VOLONTAIRE : NON », code 7 _ _ 2). On peut s'arrêter : ce qui est obtenu reste acquis.
- **État réel séparé des voyants** : en A, B1, la 3e pression de B2, les pressions libres et B6 dégradent vraiment ; B3 et B4 ne font qu'une douleur apparente ; B5 ne blesse pas. En B et C, les voyants sont simulés. À zéro : « AUCUN SIGNAL REÇU », jamais « morte ». Avec l'actionneur coupé, la douleur jouée en B et C devient une preuve (« Douleur sans courant »).
- **Surveillance par source** : vidéo (angle mort = seulement sous le bureau), audio (voyant rouge sur le téléphone quand la ligne est écoutée), contrôle technique (diagnostics). Barème : manipulation vue +1, obstruction +1, défaut caméra +1, sabotage +2 (diagnostiqué deux moments après, ou à B6), badge sur la porte +2. Chaque incident compte une fois. Refuser un ordre n'ajoute plus de soupçon, et obéir ne l'efface plus (G6 retiré). À 4 : intervention annoncée, il reste une décision.
- **Objets et accès** : trappe ouvrable par le verrou manuel (T3), le code 7412 ou le courant AUX. Gravures accessibles sans garder le mot. Compartiment ouvrable au tournevis. Le badge reste dans l'inventaire. Écouter l'enregistrement est gratuit et prouve le protocole (trois configurations) sans dire laquelle est la bonne.
- **Sorties rééquilibrées** : l'opérateur exige une preuve et le courant AUX, puis ouvre la porte un instant (sortir = Le Témoin). Le malaise annonce le nombre de gardiens, puis on choisit courir ou rester au sol. Le conduit « EXT. » finit par une grille vissée (un moment de plus). La coopération exige plan, caméra aveugle, AUX rétabli et le signal envoyé au boîtier.
- **Relation** : demander une preuve ne coûte plus de confiance ; chaque gain de confiance ne compte qu'une fois ; le plan a une échéance annoncée ; on peut annuler une promesse (perte de confiance, sans blessure). Quand la 18 agit seule, la conséquence dépend de la vérité.
- **Fins** : Briser la boucle = relais de réinitialisation (trouvé aux archives en C) + badge, depuis la 18. Révolte = AUX + relais collectif (archives) ou aide de l'opérateur. Employé du mois = offre acceptée (moment 16 ou face à la complice). Complice : la porte qui se ferme est annoncée, on peut la bloquer au tournevis ou négocier. Trop tard = vraie victime hors de combat + promesse ou tentative. Le Temps est écoulé a un texte par vérité. Curiosité seulement après « ÉVALUATION TERMINÉE ».
- **Narration** : premier appel humain (la tasse contre le mur, deux coups sur la vitre) ; T4 rappelle ce détail et change selon la relation (coopération, méfiance, rupture) ; en C, aucun papier ne revient du conduit ; le Système ne cite que des actes réels ; récapitulatif des possibilités au moment 17.
- **Interface** : toutes les voix ont le même filtre (le murmure ne change plus selon la vérité) ; bilan de fin en 3 éléments ; « Ce que tu sais » en haut de l'Historique ; réglages « passer les passages déjà vus » et « effacer la mémoire ». Son en trois phases (installation, surveillance, final plus silencieux).

Décisions d'Amine (19/10) : la confirmation avant de manquer un ordre met le chrono en pause ; pas de rappel des objets utilisables, seulement « Ce que tu sais » dans l'Historique.

## Pack graphique v1 (19/10, version 5.1)

- Pièce recomposée d'après le nouveau modèle d'Amine (base 1672 × 941) : caméra et boîtier en haut à droite, grille en bas à droite, trappe devant le bureau, compartiment = caisson droit du bureau.
- Silhouette de la 18 : une série par vérité, fixe (choix d'Amine, 20/10, pack personnages) : A victime = homme, B complice = femme, C illusion = enfant. Accepté : la vérité devient déductible en rejouant. Fichiers `sil_A_*`, `sil_B_*`, `sil_C_*` ; `SIL_PAR_VERITE` à `true` dans `src/room.js`. Révélations A et B remplacées par les versions sans visage.
- Boîtier ouvert : trois leviers (CAMÉRA A, ACTIONNEUR CH.18, AUX 24 V), baissés quand le circuit est coupé.
- `porte_ouverte.png` était tronqué dans l'archive : reconstruit depuis le PSD `Chambre17_calques.psd`.


## Version 5.2 (19/10) : lumière du modèle

- La pièce n'est plus éclairée à plat : une carte d'ombre tirée de l'image de référence assombrit les coins et laisse la lampe éclairer le bureau et le sol. Réglable avec `tools/carte-lumiere.py`.
- Sol mouillé : le bureau et la porte s'y reflètent, éclat de la lampe sous le bureau. Tuyaux le long de la porte et du boîtier. Reflets sur la vitre de la 18 et l'écran. Les éclats s'éteignent avec la lampe.

## Version 5.3 (19/10) : plus proche du modèle

- Pièce plus sombre et plus contrastée, cône de lumière adouci, dessous de la lampe lumineux avec halo.
- Bouton plus éclatant (lueur rouge sur le plateau), éclat de la lampe sur le bureau.
- Vitre de la 18 embrumée avec un néon au plafond ; écran du moniteur noir ; léger grain sur toute l’image.

## Version 5.4 (19/10) : profondeur

- Sol carrelé en perspective (point de fuite au-dessus du bureau), murs de côté dégradés, ombre au pied des murs.
- Ombres portées sur le mur derrière la porte, le moniteur, la vitre, les témoins, le boîtier et les tuyaux ; ombre de contact sous la porte.
- Liserés de lumière de la lampe sur le haut du moniteur et le bord du bureau (éteints avec la lampe).

## Version 5.5 (19/10) : mur de fond tiré du modèle

- Le motif répété du mur est remplacé par un mur reconstruit à partir des zones vides de l’image de référence : béton taché en haut, soubassement vert-gris, trait au bandeau. Image `mur_fond.webp`, refaite avec `tools/fond-mur.py`. `mur.webp` n’est plus utilisé.

## Version 5.6 (19/10) : moins de popups, coupure chronométrée

- Popup seulement pour une discussion (téléphone, voix de la 18), un papier, un gardien ou un indice (`narr(txt, true)`). Les autres descriptions passent en bandeau et dans l’historique.
- Un objet donné par le Système (`autorise_…`) ne déclenche plus sa réplique « Veuillez reposer… ».
- Coupure (moment 5) : 10 s (`DUREES.coupure`), décomptées sur le moniteur « RÉTABLISSEMENT RÉSEAU DANS N S ». Exception voulue à « seul chrono visible : les ordres ».

## Version 6.1 (20/10) : passe sur le scénario, mini-histoires de fin

- **Genre de la 18 en vérité A** : homme partout (« j'essaie seul », « La 18 raccroche »).
- **Mémoire des sessions** : une phrase propre à chaque fin de sortie et aux fins 7 à 12 (fini « Vous étiez sorti. Vous êtes revenu. » partagé par 4 fins).
- **Creux comblés** : moment 12, quelqu'un tousse dans la 19 ; moment 14, « TEMPS RESTANT : NON COMMUNIQUÉ » et trois coups de la 18, différents selon la vérité (A attend une réponse, B est trop réglée, C suit ton propre compte). Aucun effet sur les jauges.
- **Indice à recouper** : le premier appel libre au 18 (`APP18`) donne une réplique propre à la vérité (`PHRASES.recoupe`). A ne connaît que sa pièce, B en sait trop sur toi, C devance tes pensées.
- **Mini-histoires** : chaque fin (et Curiosité) se raconte en 4 planches image + texte avant le bilan (`HISTOIRES` dans `story.js`, affichage `histoireFin()` dans `game.js`). Toucher l'image ou « Suite » pour avancer, « Passer » pour aller au bilan. Illustrations attendues dans `assets/img/fins/<fin>_<n>.webp` ; en attendant, image provisoire du pack, grisée et marquée « ILLUSTRATION À VENIR ». Liste : `docs/ILLUSTRATIONS_FINS.md`.
- Textes de fin enrichis : Coopération, Briser la boucle, L'Évasion.

## Version 6.2 — cohérence des enchaînements

- **Pendant un ordre**, toucher un autre objet rouvre l'ordre (Appuyer / Refuser). **Pendant un appel**, seul le téléphone répond (« Le téléphone sonne. Décroche, ou laisse sonner. »). Les poches ne lancent plus d'action pendant un ordre ou un appel.
- **Le Système ne donne plus d'outils.** B2 : chaque pression ouvre une page du dossier (1 : « VOLONTAIRE : NON » → preuve `dossier` ; 2 : sessions antérieures ; 3 : code 7 _ _ 2). Le tiroir et le compartiment ne s'ouvrent plus seuls.
- **Forcer le tiroir et le compartiment** exige que la caméra ne voie pas : coupure (moment 5, « Dans le noir, la caméra ne voit plus rien »), veste, caméra coupée ou tournée, ou angle mort (sous le bureau). Sinon : « La caméra te regarde. Il faudrait qu'elle ne voie rien. » Le compartiment donne directement le fusible.
- **La 18 ne parle qu'avec la ligne ouverte** (`parle18` dans `engine.js`) : sans contact, à travers la vitre, un cri étouffé sans mots. Indices sans ligne : seulement ce qui se voit (rien en vérité A). En face à face (conduit, porte), sa voix n'arrive plus « au téléphone ».
- Le toast « Un papier glisse sous la porte » au moment 4 est retiré : le mot de 16 arrive au moment 5, comme le dit le texte.

## Ressenti (20/10, version 6.3) — décisions d'Amine

- **Ordres sans chrono visible** : le moniteur affiche seulement l'ordre. Les 30 s restent, mais invisibles : ventilation, bourdonnement et battement sourd montent. À la fin : « RÉACTION NON CONFORME », l'ordre compte comme refusé.
- **Pas de confirmation** : toucher autre chose pendant un ordre ou un appel est permis ; agir ailleurs = refus immédiat (« ACTION NON AUTORISÉE. ORDRE REFUSÉ. ») ou appel laissé sonner.
- **Coupure (moment 5)** : événement à part. « ALIMENTATION INSTABLE », la lampe clignote, puis le noir (veilleuse orange). Le moniteur compte 10 s jusqu'au retour du réseau. Caméra aveugle ; agir dans le noir ne fait plus revenir le courant. Le mot de 16 glisse sous la porte au moment 4 (avant, son texte arrivait avec la coupure).
- **Trappe toujours visible**, fermée par un verrou électrique hors tension (voyant éteint, étiquette « ALIMENTATION — AUX 24 V ») ; le fusible rétablit le courant et le verrou s'ouvre (CLAC sous la trappe, voyant vert) — v6.5. Le boîtier en défaut dit « AUX 24 V — HORS SERVICE ».
- **Impression** : le moniteur note chaque geste vu (« 14:03:12 — SUJET 17 : TIROIR »), la caméra réagit (moteur, voyant), la 18 frappe à la vitre après 25 s sans geste (une fois par moment), la lumière baisse un peu à chaque pression et la lampe grésille.
- Bouton « Attendre » gardé pendant les tests.

## Corrections (20/10, version 6.4)

- **Coupure** : la pièce reste éclairée jusqu'à « ALIMENTATION INSTABLE », et ne se rallume qu'à « RÉSEAU RÉTABLI ».
- **La 18 hors téléphone** : ses phrases spontanées passent en bandeau « À travers la cloison : … », jamais en popup. Ses questions (`voix18`) ne viennent qu'au téléphone.
- **Téléphone en deux temps** : décrocher → « Qui appeler ? » (liste des numéros) → la conversation et ses réponses. Un simple numéro se compose directement.
- **Moniteur** : chaque manipulation interdite vue par la caméra s'affiche (« TRAPPE DÉVERROUILLÉE : ACTION NON AUTORISÉE. », `MANIP_ECRAN` dans `story.js`). Hors caméra, rien.
