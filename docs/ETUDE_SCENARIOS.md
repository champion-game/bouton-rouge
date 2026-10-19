# Étude des scénarios et des fins (19/10)

État : version 3.4. But : vérifier que chaque fin est atteignable de façon logique, repérer les actions sans conséquence et proposer des garde-fous. **Rien de ce qui suit n'est codé** tant qu'Amine ne l'a pas validé.

## 1. Les 18 fins : comment on y arrive aujourd'hui

| Fin | Chemin | Difficulté |
|---|---|---|
| 1 Sujet conforme | Obéir à B6 (actionneur actif) puis sortir ; ou sortir par la porte de B5 avec la 18 morte ; ou verdict avec 18 morte et conformité ≥ 3 | Facile |
| 2 L'employé du mois | Vérité B, conformité ≥ 5, puis rejoindre la 18 (conduit ou plan), ou verdict avec l'enregistrement écouté | Difficile |
| 3 Le marché | Obéir à B5, sortir pendant que la porte est ouverte, 18 vivante | Moyen |
| 4 Seul dehors | Grille dévissée, conduit vers EXT. | Facile |
| 5 La porte dérobée | Trappe trouvée, préparer la sortie, puis l'utiliser | Moyen |
| 6 L'Évasion | Simuler un malaise avec soupçon ≤ 1 ; ou badge de 16 sur la porte puis sortir | Moyen |
| 7 Coopération | Vérité A, promesse (T4), confiance ≥ 3, plan accepté, caméra aveugle, déclencher le bus | Très difficile |
| 8 Le Sauvetage | Vérité A, conduit vers la 18 vivante | Moyen |
| 9 Trop tard | Vérité A, conduit vers la 18 morte ; ou verdict avec promesse et 18 morte | Moyen |
| 10 Le Complice démasqué | Vérité B, rejoindre la 18 avec le tournevis et soupçon < 2 | Moyen |
| 11 Sujet 18 | Vérité B, rejoindre la 18 sans tournevis ou avec soupçon ≥ 2 | Moyen |
| 12 Le Miroir | Vérité C, rejoindre la 18 (conduit ou plan) | Moyen |
| 13 Briser la boucle | Vérité C + actionneur coupé + badge gardé, puis rejoindre la 18 | Très difficile |
| 14 Isolement | Soupçon à 4 | Facile |
| 15 Le Gardien | Simuler un malaise avec soupçon ≥ 2 | Facile |
| 16 Le Témoin | Opérateur repéré puis lui parler (C3), ou appeler le 00 avec une preuve | Moyen |
| 17 La Révolte | Enregistrement trouvé + fusible remplacé, puis diffuser | Difficile |
| 18 Le Temps est écoulé | Rester jusqu'au bout, 18 vivante | Facile |
| bonus Curiosité | Appuyer alors que la porte est ouverte | Facile |

Toutes les fins sont atteignables (vérifié par 30 000 parties au hasard et deux parcours voulus).

## 2. Les failles trouvées

1. **Des actions vues par la caméra n'ont aucune conséquence** : descendre dans la trappe (on disparaît 2 cycles !), préparer la sortie dérobée, remplacer le fusible au boîtier. Forcer le tiroir ne coûte que +1 soupçon : on garde le tournevis.
2. **L'inspection ne répare rien** : une caméra masquée ou tournée vers le mur, une grille ouverte restent ainsi devant le gardien.
3. **Verdict incohérent** : si la 18 est morte et que la conformité est < 3, la fin Le Temps est écoulé montre la 18 qui traverse sa porte.
4. **Piège de B6** : la porte ouverte par B5 l'est encore au moment de B6. Obéir à « Dernière pression » donne alors la fin Curiosité, sans que le joueur l'ait vu venir.
5. **Le soupçon ne redescend presque jamais** (seulement en montrant le mot de 16) : à 3, le joueur est paralysé jusqu'à la fin.
6. **Le plan commun accepté mais jamais exécuté** n'a aucune conséquence.

## 3. Garde-fous proposés

- **G1 — Objet interdit vu = confisqué.** Si la caméra te voit prendre un objet interdit (forcer le tiroir pour le tournevis, remonter du sous-sol avec le badge ou l'enregistrement), un gardien vient le reprendre au début du moment suivant. Il ne le prend pas si tu l'as caché sous la plaque, si tu as aveuglé la caméra entre-temps, ou si tu as agi pendant la coupure du cycle 6 ou depuis l'angle mort. Le tournevis et le fusible donnés en récompense par le Système (B2) ne sont jamais confisqués.
- **G2 — Actions vues = soupçon.** Descendre dans la trappe : +1 (« SUJET 17 NON VISIBLE »). Préparer la sortie dérobée : +1. Remplacer le fusible : +1. Toujours sauf si la caméra est aveugle, pendant la coupure, ou depuis l'angle mort.
- **G3 — L'inspection répare ce qu'elle voit** (si soupçon ≥ 2) : le gardien retire la veste, remet la caméra face à la pièce et revisse la grille (le conduit se referme). Il ne touche pas à l'électricité : une caméra coupée au boîtier reste coupée.
- **G4 — Verdict cohérent** : 18 morte et conformité < 3 : la porte de la 18 s'ouvre sur une pièce vide, et quelqu'un d'autre entre de l'autre côté (variante de Le Temps est écoulé).
- **G5 — B6** : au début de B6, le Système prévient « VOTRE PORTE EST OUVERTE. » (le piège reste, mais il devient un vrai choix).
- **G6 — Le soupçon peut redescendre** : obéir à un ordre fait baisser le soupçon de 1 (touche à l'équilibrage des jauges : décision d'Amine).
- **G7 — Plan abandonné** : si le plan commun est accepté mais pas exécuté, la 18 tente seule au début du dernier tiers (vie −1), comme quand on refuse le plan.
