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
