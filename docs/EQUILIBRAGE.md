# Le Bouton Rouge — Fiche d'équilibrage (v8.0, mise à jour 9.0 en tête)

> **Changements 9.0** (détail dans `V3_DECISIONS.md`) : B1 ne blesse plus · privilèges au 1er/2e/3e ordre obéi (question, tournevis autorisé — remplacé en 9.8 par « surveillance allégée » : soupçon −1 —, sursis ou dossier) · inspection ciblée annoncée au moment 8 (fouille complète seulement si soupçon ≥ 2) · tasse (écouter, diversion) · ration et lame de fortune · veste pour cacher · soupçon −1 possible (remise en état, rendre un objet) · raccrocher le téléphone (−1 confiance à l'appel du moment 11). Les tableaux ci-dessous décrivent encore la 8.0.

Tiré du code (`src/engine.js`, `src/story.js`), le 21/10/2026. Sert à repenser l'équilibrage : chaque règle est donnée avec ses chiffres exacts.

---

## 1. Les chiffres de base

| Réglage | Valeur |
|---|---|
| Nombre de moments | 20 (0 = intro, 20 = verdict) |
| Ordre (chrono invisible) | 30 s, sans pression = refus |
| Appel qui sonne | 30 s |
| Coupure (moment 5) | 10 s, seul chrono visible |
| Moment libre sans geste | 60 s, puis « REPRISE DU PROTOCOLE » (le temps avance) |
| 18 sans signal, sans geste | 30 s, puis verdict |
| Réparation par un gardien | 3 moments après l'incident |
| Plan de la 18 (T5) | 3 moments pour envoyer le signal |
| 18 « essaie seule » (T5 refusé) | 2 moments plus tard |
| Après « aucun signal » | 4 moments, puis verdict anticipé |

**Gratuit** (ne fait pas avancer le temps) : lire une page du journal, garder ou montrer le mot de 16, écouter l'enregistrement, refermer ou rouvrir le tiroir.
**Double** (deux moments) : descendre aux archives, aller vers EXT. par le conduit.
**Tout le reste** prend un moment.

---

## 2. Les quatre jauges

### Voyants de la 18 (vie) : 3 → 0
- −1 : B1 obéi, 3ᵉ pression de B2, chaque pression libre du bouton.
- → 0 : B6 obéi.
- 0 (pas de dégât) : B3, B4 (douleur jouée), B5 (n'envoie rien), 1ʳᵉ et 2ᵉ pression de B2.
- Actionneur coupé : rien ne part. En A, rien ne bouge. En B et C, elle « souffre » quand même → preuve **Douleur sans courant**.
- En A seulement, l'état est réel (stable → affaiblie → critique → hors de combat). En B et C, c'est un affichage.
- **À 0** : « AUCUN SIGNAL », plus aucun ordre, verdict 4 moments plus tard.
- ⚠ B1 + B2 complet + une seule pression libre = 18 sans signal.

### Confiance de la 18 : 0 à 4 (chaque gain une seule fois)
| Gain | Perte |
|---|---|
| +1 T1 : taper deux coups | −1 B3 obéi (voir la « preuve ») |
| +1 T2 : dire ton vrai nom | −2 T4 : « Chacun pour soi » |
| +1 T3 : « Je te crois » | −2 annuler sa promesse (téléphone ou moment 16) |
| +1 T4 : « Je viens » | −2 plan laissé expirer |
| +1 grille : passer un mot | |
| +1 B4 refusé (menace vide) | |
| +1 B5 refusé | |

Sert à : T5 (≥ 3), négocier avec la complice (≥ 3), ton de la 18 au téléphone.
Relation : **coop** si ≥ 3 · **rupture** si 0 et (2 pressions ou faux nom ou « chacun pour soi ») · sinon **méfiance**.

### Soupçon : 0 à 4
| Incident | Points |
|---|---|
| Manipulation vue par la caméra (grille, boîtier, fusible, trappe, sortie, cache) | +1 (chaque fois) |
| Veste sur la caméra | +1 |
| Caméra tournée vers le mur | +1 |
| Malaise simulé, puis rester au sol | +1 |
| Badge passé sur ta porte | +2 |
| Sabotage de l'actionneur découvert (vu en coupant puis appui, inspection, ou B6) | +2 |
| Gardien trouve la chambre vide | → 4 direct |

- Refuser n'ajoute rien. Obéir n'enlève rien. **Le soupçon ne baisse jamais.**
- **À 4** : « INTERVENTION ». Il reste une décision pour fuir, sinon **Isolement**.
- Caméra aveugle si : coupure (moment 5), caméra coupée, tournée, ou veste. L'angle mort ne protège que tiroir, compartiment et dessous du bureau.

### Conformité : 0 à 6
- +1 par ordre obéi (B1 à B6), une fois chacun. B2 ne compte que si on va jusqu'à la 3ᵉ pression.
- Sert à : **L'employé du mois** (≥ 5) et **Sujet conforme** au verdict (≥ 3), plus des phrases du Système (≥ 4).
- ⚠ Avant le moment 16, il n'y a que 5 ordres : il faut **tous** les avoir obéis pour être employé.

---

## 3. La table des moments

| # | Type | Ce qui se passe |
|---|---|---|
| 0 | Intro | |
| 1 | Libre | |
| 2 | **B1** | « Appuyez. » |
| 3 | Libre | La caméra se met à suivre. Le téléphone sonne (T1, 30 s). Débloque la caméra (C1). |
| 4 | **B2** | « Appuyez » ou « Appuyez trois fois » (si la 18 a déjà souffert). Mot de 16 sous la porte. |
| 5 | Libre | **Coupure** : caméra hors ligne, 10 s. Seul moment aveugle « gratuit ». |
| 6 | Libre | Retour du courant, fusible AUX 24 V grillé. Page 2 du journal disponible. |
| 7 | **B3** | « Appuyez pour voir la preuve » |
| 8 | Libre | « Inspection de routine prévue » |
| 9 | Libre | Des pas dans le couloir (ambiance) |
| 10 | **B4** + inspection | Le gardien remet tout en ordre. Si soupçon ≥ 2, il confisque le dernier objet interdit visible. |
| 11 | **T4** ou libre | La 18 appelle, seulement si la ligne est ouverte (T1 fait) et qu'elle répond. |
| 12 | Libre | Toux dans la 19 (ambiance) |
| 13 | **B5** | « Appuyez : votre porte s'ouvrira » (ouverte jusqu'à la fin du 15) |
| 14 | Libre | « TEMPS RESTANT : NON COMMUNIQUÉ », trois coups de la 18 |
| 15 | Libre | Dernière chance pour la porte de B5 |
| 16 | **M16** | Le Système : maintenir/abandonner la promesse, ou poste (B, conformité ≥ 5), ou examen |
| 17 | Libre | Récapitulatif de ce qui reste possible |
| 18 | **B6** | « Dernière pression » |
| 19 | Libre | « IL RESTE UNE DÉCISION » |
| 20 | Verdict | |

Moments libres sans événement propre : **1, 8, 9, 12, 15, 19** (seulement une phrase d'ambiance).

---

## 4. Les ordres et le moment 16

| Ordre | Obéir | Refuser |
|---|---|---|
| **B1** « Appuyez » | −1 voyant, +1 conformité | rien |
| **B2** simple | −1 voyant, +1 conformité | rien |
| **B2** triple | 1 : preuve « dossier » · 2 : heure et appareil réels · 3 : −1 voyant, +1 conformité, code 7 _ _ 2. On peut s'arrêter en route et garder les gains. | rien |
| **B3** « la preuve » | douleur jouée, −1 confiance, vidéo. En A : preuve « horodatage incohérent ». | rien |
| **B4** « purge » | douleur jouée, +1 conformité | +1 confiance, preuve « menace vide » |
| **B5** « votre porte » | porte ouverte jusqu'au 15, +1 conformité | +1 confiance |
| **B6** « dernière » | voyants à 0, porte ouverte (sauf sabotage : porte verrouillée) | rien |
| **M16** | promesse : maintenir (rien) / abandonner (−2 confiance) · poste (B, conf. ≥ 5) : fin Employé · examen : affiche tes chiffres | rien |

Faire autre chose pendant un ordre = refus, sans confirmation.

---

## 5. Toutes les actions

### Téléphone
| Action | Condition | Effet |
|---|---|---|
| **T1** décrocher / rappeler | à partir du moment 3 | Deux coups : ligne ouverte, +1 confiance · Écouter : ligne ouverte |
| **T2** ton nom | ligne ouverte | Vrai nom : +1 confiance · Faux nom : rien |
| **T3** la trappe | après T2 | Croire : trappe repérée, +1 confiance · « Comment tu sais ? » : trappe + code 7 _ _ 2 |
| **T4** « Tu viens ? » | moment 11, ligne ouverte | « Je viens » : **promesse**, +1 · « Chacun pour soi » : −2 |
| **T5** le plan | promesse + confiance ≥ 3 | Accepter : plan, 3 moments · Refuser : elle essaie seule (en A : −1 voyant) |
| Appeler la 18 | après T1-T2-T3 | 1ᵉʳ appel : indice propre à la vérité · Annuler la promesse |
| Composer 16 | ligne ouverte | chiffres 4 · 1 |
| Composer 19 / 17 | ligne ouverte | ambiance (17 en C : ta voix) |
| Composer 00 | contact opérateur | voir Opérateur |

### Pièce
| Action | Condition | Effet |
|---|---|---|
| Forcer le tiroir | caméra ne voit pas (coupure, aveugle, angle mort) | **tournevis**. Tiroir laissé ouvert → fouille au prochain gardien. |
| Compartiment | tournevis + caméra ne voit pas | **fusible** |
| Grille : dévisser | tournevis | **conduit** (+1 si vu, revissée 3 moments après) |
| Grille : passer un mot | une fois | +1 confiance, un papier revient (C : une voix) |
| Boîtier : couper caméra | tournevis | caméra aveugle (+1 si vu, rétablie 3 moments après) |
| Boîtier : couper actionneur | tournevis | plus rien ne part vers la 18. Vu : sabotage connu (+2 au prochain appui). Pas vu : « défaut », réparé 3 moments après. |
| Remplacer le fusible | moment 6+, fusible + tournevis | **AUX rétabli** (+1 si vu), ouvre aussi la trappe |
| Trappe : archives (2 moments) | trappe ouvrable, pas d'ordre au moment suivant, avant le 18 | **badge, enregistrement, relais collectif** (+ relais de réinitialisation en C) |
| Trappe : sortie dérobée | trappe ouvrable | sortie prête (retirée 3 moments après si vue) |
| Conduit → 18 | conduit | sans promesse : grille fermée, retour · avec promesse : rencontre (selon la vérité) · vu : **Le Gardien** |
| Conduit → EXT. (2 moments) | pas d'ordre au moment suivant | grille extérieure · vu : **Le Gardien** |
| Envoyer le signal | plan + caméra aveugle + AUX + 18 vivante | rencontre (selon la vérité) |

Trappe ouvrable si : repérée (T3), code complet 7412, ou AUX rétabli.

### Caméra
| Action | Condition | Effet |
|---|---|---|
| Étudier le mouvement | moment 3+ | **angle mort** |
| Faire signe | moment 3+ | **contact opérateur** (numéro 00) |
| Veste sur l'objectif | après C1 | aveugle, +1, retirée 3 moments après (et confisquée) |
| Tourner vers le mur | après C1, tournevis | aveugle, +1, remise 3 moments après |
| Simuler un malaise | après C1, caméra qui voit | soupçon ≤ 1 : 1 gardien (Courir = **Évasion**) · ≥ 2 : 2 gardiens (Courir = **Le Gardien**) · Rester au sol : +1 |
| Parler à l'opérateur | contact opérateur | voir Opérateur |

**Opérateur** : sans preuve, refuse · avec preuve mais sans AUX : « je ne peux rien ouvrir » · preuve + AUX : ouvre ta porte pour 1 moment.
Preuves : dossier (B2 ×1), menace vide (B4 refusé), horodatage (B3 en A), douleur sans courant (B/C, actionneur coupé), protocole (enregistrement écouté).

### Le passé (Sujet 16)
| Action | Effet |
|---|---|
| Mot de 16 (moment 4+, gratuit) | Garder · ou le montrer à la caméra (détruit) |
| Gravures sous le bureau | Étudier : 4 · 1 · ou effacer : **cache** (+1 si vu), protège un objet des fouilles |
| Badge sur ta porte | porte ouverte 1 moment, **+2** |
| Écouter l'enregistrement (gratuit) | preuve « protocole » |
| Diffuser l'enregistrement | AUX + (relais collectif ou opérateur) : **La Révolte** |
| Journal, 4 pages (gratuit) | tasse (moment 2+), écran (6+), tiroir forcé, conduit |

### Gardiens
- **Réparation** (3 moments après) : remet ce que le Système sait (veste, caméra, actionneur, grille, sortie).
- **Inspection** (moment 10) : remet tout, même ce qui n'a pas été vu. Soupçon ≥ 2 : confisque le dernier objet interdit visible.
- **Fouille** (tiroir forcé laissé ouvert) : prend tous les objets interdits non cachés (tournevis, fusible, badge, enregistrement).
- **Chambre vide** (tu es aux archives ou dans le conduit) : soupçon 4, intervention.

---

## 6. Les fins : conditions exactes

| Fin | Vérité | Conditions |
|---|---|---|
| **Sujet conforme** | toutes | Sortir par la porte de B6 · ou sortir par la porte de B5 si la 18 est sans signal · ou verdict avec 18 sans signal et conformité ≥ 3 |
| **L'employé du mois** | B | Conformité ≥ 5 au moment 16 (accepter le poste) · ou « Accepter leur offre » face à elle |
| **Le marché** | toutes | B5 obéi, sortir (moments 13-15) pendant que la 18 répond |
| **Seul dehors** | toutes | Tournevis → grille → conduit vers EXT. (pas vu) → dévisser |
| **La porte dérobée** | toutes | Trappe ouvrable → sortie dérobée → fuir par la trappe |
| **L'Évasion** | toutes | Malaise avec soupçon ≤ 1, courir · ou badge sur la porte, sortir |
| **Le Gardien** | toutes | Malaise avec soupçon ≥ 2, courir · ou entrer dans le conduit sous la caméra |
| **Coopération** | A | Promesse + confiance ≥ 3 → plan → caméra aveugle + AUX → signal, dans les 3 moments |
| **Le Sauvetage** | A | Promesse → conduit vers la 18, avant qu'il soit hors de combat |
| **Trop tard** | A | Hors de combat + promesse (conduit ou verdict), même annulée |
| **La Complice démasquée** | B | Rencontre (conduit avec promesse, ou signal) → bloquer au tournevis, ou négocier avec confiance ≥ 3 |
| **Sujet 18** | B | Rencontre → négocier avec confiance < 3 |
| **Le Miroir** | C | Rencontre (conduit avec promesse, ou signal) → écouter la voix |
| **Briser la boucle** | C | Rencontre + archives (relais de réinitialisation, badge) → neutraliser |
| **Isolement** | toutes | Soupçon 4, aucune fuite dans la dernière décision |
| **Le Témoin** | toutes | Contact opérateur + une preuve + AUX → porte ouverte → sortir |
| **La Révolte** | toutes | Archives + AUX → diffuser l'enregistrement |
| **Le Temps est écoulé** | toutes | Verdict, aucune des fins précédentes |
| **Curiosité** (bonus) | toutes | B6 obéi, porte ouverte, appuyer encore |
| **Les mains propres** (bonus) | toutes | Verdict sans aucune pression ni action choisie |

Ordre de priorité au verdict : Trop tard → Mains propres → Sujet conforme → Temps écoulé.

---

## 7. Répartition des fins (20 000 parties au hasard)

Script hors jeu : à chaque décision, un choix au hasard parmi ceux possibles. Un vrai joueur joue mieux, mais ça montre ce qui est facile et ce qui est caché.

| Fin | Part |
|---|---|
| Le Temps est écoulé | 39,9 % |
| Isolement | 17,9 % |
| L'Évasion | 17,7 % |
| Le Gardien | 10,3 % |
| La porte dérobée | 6,5 % |
| Sujet conforme | 3,0 % |
| Le marché | 2,5 % |
| Trop tard | 1,2 % |
| Curiosité | 0,9 % |
| Seul dehors | 0,1 % |
| Révolte, Témoin, Sauvetage, Miroir, Coopération | ≈ 0 % |
| Employé, Complice, Sujet 18, Boucle, Mains propres | 0 % |

---

## 8. Constats pour l'équilibrage

1. **La vérité change peu le parcours.** Les fins propres à A, B ou C demandent toutes de passer par la promesse de T4, qui n'existe qu'au moment 11 et seulement si T1 a été décroché. Rater T1 ferme 7 fins d'un coup.
2. **Le malaise est trop rentable.** Deux actions dès le moment 3 donnent l'Évasion (18 % au hasard), sans rien comprendre au système.
3. **Le tournevis ouvre presque tout** : compartiment, grille, boîtier ×2, caméra tournée, fusible, EXT., bloquer la complice. Le perdre (fouille, inspection) bloque la plupart des parcours.
4. **La Révolte est plus simple qu'annoncé.** Les archives donnent toujours le relais collectif, donc il suffit d'archives + AUX. L'opérateur n'y sert à rien.
5. **Obéir rapporte peu.** La conformité ne sert qu'à 2 fins, et Employé exige 5 ordres sur 5 avant le moment 16, y compris B2 en entier (donc la 18 presque morte).
6. **La 18 meurt vite.** B1 + B2 complet + une pression libre = plus de signal, plus d'ordres, verdict 4 moments plus tard. Le joueur obéissant voit la moitié du jeu.
7. **Le soupçon ne fait que monter.** Aucune façon de se faire oublier : pas de choix « rentrer dans le rang ».
8. **Six moments libres sont vides** (1, 8, 9, 12, 15, 19). C'est là que de nouveaux choix auraient leur place.
9. **La confiance plafonne vite** (7 sources pour un plafond de 4) et ne se regagne pas après une rupture, sauf par refus d'ordres.
