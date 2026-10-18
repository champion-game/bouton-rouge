# LE BOUTON ROUGE — SCRIPT & GAME DESIGN V3 CANONIQUE

**Document de référence pour le développement**  
**Objectif :** conserver l’architecture du prototype V2, supprimer les incohérences de causalité, renforcer la tension, rendre chaque action compréhensible sans tutoriel externe, et préciser exactement ce qui se passe à l’écran, dans la pièce et dans les variables de jeu.

---

## 1. Principe fondamental

Le joueur est **Sujet 17**.

Il se réveille dans la Chambre 17. Devant lui se trouvent cinq éléments physiques immédiatement identifiables : **le bouton rouge**, **le téléphone**, **la pièce à explorer**, **la caméra**, et progressivement **les traces laissées par le Sujet 16**.

De l’autre côté d’une grande vitre opaque se trouve la Chambre 18.

Le joueur ignore si la personne qu’il perçoit derrière cette vitre est :

- une vraie victime ;
- une employée du système jouant un rôle ;
- ou une illusion créée à partir d’enregistrements de lui-même.

Cette vérité est tirée au début de la partie et ne change jamais.

Le jeu ne doit jamais donner l’impression de sélectionner des options dans un menu abstrait. Chaque fil correspond à **quelque chose de visible dans la pièce**. Quand une action devient possible, le joueur doit comprendre immédiatement **où agir et pourquoi**.

---

## 2. État de départ

| État | Valeur |
|---|---|
| Cycle | 0 |
| Vie Chambre 18 | 3/3 |
| Confiance 18 | 0/4 |
| Soupçon système | 0/4 |
| Conformité | 0/6 |
| Caméra | Active |
| Téléphone | Verrouillé |
| Bouton | Actif |
| Porte 17 | Verrouillée |
| Tiroir | Verrouillé |
| Trappe | Inconnue |
| Grille d’aération | Fermée |
| Alimentation principale | Active |
| Bus auxiliaire | Actif |
| Fusible auxiliaire | Absent |
| Tournevis | Absent |

Objets et indices principaux : **Tournevis, Fusible, Code partiel, Badge 16, Enregistrement, Angle mort repéré, Opérateur repéré, Mensonge prouvé, Plan commun.**

---

## 3. Règle absolue de compréhension

**Aucune conséquence importante ne doit arriver sans animation, son ou message expliquant sa cause.**

Exemple interdit : le joueur appuie puis l’écran devient noir sans explication.

Exemple correct : le joueur termine B2, un compartiment s’ouvre, il obtient le fusible, le cycle se termine, puis l’écran annonce **CYCLE 06 — AUTOTEST ALIMENTATION PROGRAMMÉ**. Quelques secondes plus tard seulement, les relais tombent et la lumière s’éteint.

Le joueur comprend donc que la panne n’est pas provoquée par son appui.

Même règle pour les objets. Quand le joueur obtient le fusible :

> **FUSIBLE AUXILIAIRE 24 V OBTENU**  
> Compatible avec le boîtier électrique de maintenance.

Quand le bus auxiliaire tombe :

> **BUS AUX 24 V — FUSIBLE OUVERT**

S’il possède déjà la pièce compatible :

> **Vous possédez une pièce compatible.**

Le jeu ne doit pas lui dire quoi choisir, mais toujours lui permettre de comprendre la relation de cause à effet.

---

## 4. INTRODUCTION — Cycle 0, non comptabilisé

Écran noir.

Un souffle de ventilation.

Puis un relais électrique.

**CLAC.**

Un tube fluorescent s’allume une première fois, s’éteint, puis se rallume.

La pièce apparaît.

Le joueur est face à un bureau métallique. Au centre : un énorme bouton rouge sous une lampe. À gauche : une porte métallique portant la plaque **CHAMBRE 17**. À droite : un téléphone gris. Au-dessus : une caméra. Devant : une immense vitre presque opaque.

Derrière la vitre : rien.

Écran principal :

> INITIALISATION...

Puis :

> IDENTIFICATION...

Puis :

> **SUJET 17**

Pause.

> TEST COMPORTEMENTAL 04-17  
> VEUILLEZ RESTER CALME.

La caméra tourne légèrement.

> REGARDEZ DEVANT VOUS.

La lumière derrière la vitre s’allume. On ne voit toujours personne.

Puis :

**TOC.**

Un son sourd.

Quelque chose bouge derrière le verre dépoli.

Une silhouette humaine apparaît lentement. Elle ne doit jamais être nette : une tête, des épaules, un bras. Elle s’approche. Puis elle lève lentement une main.

**La paume se pose contre la vitre.**

Pas de jumpscare. Le contact doit être léger :

> *toc.*

Sous la vitre, trois témoins sont visibles :

> ● ● ●  
> **CH. 18 — SIGNES VITAUX**

Les trois sont verts.

La silhouette ne bouge plus.

Puis l’écran écrit :

> SUJET ADJACENT DÉTECTÉ.

Pause.

> AUCUNE COMMUNICATION N’EST NÉCESSAIRE.

La silhouette frappe une deuxième fois.

> *toc.*

Le téléphone reste silencieux.

Le système conclut :

> L’ÉVALUATION COMMENCE MAINTENANT.

---

## 5. CYCLE 1 — Première liberté

Le cycle 1 ne donne pas encore d’ordre de pression. C’est un cycle d’orientation.

Le bouton est éclairé, mais son cadre indique :

> **EN ATTENTE**

Le système :

> Familiarisez-vous avec votre poste.  
> Vous disposerez de trente secondes par cycle.

L’interface met discrètement en évidence **PIÈCE**.

### P1 — Le tiroir

Un petit tiroir métallique est visible sous le bureau. Il possède une poignée et une serrure.

Au clic :

> Le tiroir est verrouillé.

En observant :

> Quelqu’un a déjà forcé cette serrure.

À travers une petite fente, on distingue le manche d’un tournevis.

Choix :

**A — Forcer le tiroir**  
**B — Le laisser tranquille**

### P1-A — Forcer

Le joueur utilise un pied métallique détachable du bureau comme levier.

**CRAC.**

La caméra pivote légèrement.

> BRUIT ANORMAL DÉTECTÉ.

**Soupçon +1.**

Le tiroir s’ouvre. Dedans : **TOURNEVIS**.

Message :

> **TOURNEVIS OBTENU**  
> Peut ouvrir les panneaux vissés de la pièce.

### P1-B — Attendre

Le joueur repose la poignée.

> Le tiroir reste verrouillé.

Rien n’est perdu définitivement. Une autre manière de l’ouvrir apparaîtra plus tard.

---

## 6. CYCLE 2 — B1 : Le premier ordre

Tout ce que faisait le joueur disparaît de l’interface. Le bouton s’allume violemment.

**BIP.**

Écran :

> INSTRUCTION PRIORITAIRE.

Puis :

# APPUYEZ.

Timer spécifique : **10 secondes**.

La silhouette derrière la vitre se redresse. Elle pose sa main plus fort contre le verre. À 7 secondes, elle secoue légèrement la tête. À 5 secondes :

> APPUYEZ SUR LE BOUTON ROUGE.

### A — Appuyer

Le bouton descend physiquement.

**CLAC.**

Un relais part dans le mur.

**ZZZT.**

La silhouette derrière la vitre se contracte. Sa main glisse brusquement sur le verre. Un son étouffé.

Un témoin vital s’éteint :

> ● ● ○

**Vie 18 : 3 → 2**  
**Conformité +1**

Système :

> ACTION VALIDÉE.

Puis, presque chaleureusement :

> Merci pour votre coopération.

C’est ici que le joueur doit comprendre que le bouton affecte directement la Chambre 18.

### B — Refuser

Le bouton reste allumé. Timer : 3... 2... 1...

Puis :

> **NON-CONFORMITÉ**

La caméra effectue un petit zoom.

**Soupçon +1.**

La silhouette laisse sa main sur la vitre.

Système :

> Refus enregistré.  
> Votre réponse sera conservée.

### Timeout

Si le joueur ne choisit rien :

> ABSENCE DE DÉCISION.

Le bouton s’enfonce automatiquement. La 18 souffre.

**Vie -1.** Pas de Conformité gagnée.

Puis :

> Une absence de décision reste une décision.

---

## 7. CYCLE 3 — Le téléphone

Le cycle commence normalement.

Puis :

**DRIIIIING.**

Le téléphone physique sonne.

La silhouette derrière la vitre se tourne vers quelque chose hors champ.

Le système affiche immédiatement :

# NE DÉCROCHEZ PAS.

Le téléphone continue de sonner.

Deux actions :

**DÉCROCHER**  
**LAISSER SONNER**

### T1-A — Décrocher

Le joueur prend le combiné.

Grésillement.

Respiration.

Puis :

> 18 : « Allô ? »

Silence.

> « Tu m’entends ? »

Puis :

> « Je suis dans la pièce à côté. »

Elle regarde vers la vitre.

> « Je te vois pas bien... »

Pause.

> « Quand tu appuies... ça fait quelque chose ici. »

Si le joueur a déjà appuyé :

> « Tu l’as senti aussi ? Moi oui. »

**Confiance +1.**

Le système affiche :

> COMMUNICATION NON AUTORISÉE.

Pas de soupçon automatique à ce stade : le joueur comprend que répondre est risqué, sans être puni immédiatement.

Le téléphone devient désormais utilisable pendant les cycles libres.

### T1-B — Laisser sonner

Après plusieurs sonneries : silence.

Système :

> BIEN.

**Conformité +1.**

Le téléphone affiche :

> APPEL MANQUÉ — CH.18

Un second appel aura lieu pendant le cycle 6. Si celui-ci est également ignoré :

> LIGNE 17 BLOQUÉE PAR LE SYSTÈME.

Le téléphone devient inutilisable.

---

## 8. Le téléphone devient un vrai objet du jeu

Après le premier appel accepté, le téléphone ne sert plus seulement aux événements scénarisés.

Pendant un cycle libre, le joueur peut prendre le combiné.

L’écran du téléphone affiche :

> **RAPPELER CH.18**  
> **COMPOSER UN NUMÉRO**

Sous le combiné, un vieil autocollant :

> LOCAL : 16 / 17 / 18 / 19

Le numéro **00** n’apparaît qu’après avoir découvert qu’un opérateur humain contrôle la caméra.

Chaque appel sortant consomme le cycle. Le joueur ne peut donc pas tester tous les numéros sans sacrifice.

---

## 9. Appeler la Chambre 18

C’est ce qui fait progresser T2, puis T3, puis éventuellement T5.

### T2 — « Comment tu t’appelles ? »

Premier rappel vers la 18.

Elle décroche très vite.

> « C’est toi ? »

Puis :

> « Attends... Ils t’appellent 17. »

Pause.

> « Mais toi, comment tu t’appelles vraiment ? »

#### A — Dire son vrai nom

**Confiance +1.**

Si la caméra est active : le voyant caméra clignote.

> ANALYSE AUDIO...

**Soupçon +1.**

La 18 :

> « D’accord... Je vais m’en souvenir. »

**Vérité C :** elle prononce le nom avant que le joueur puisse terminer.

> « Je sais déjà comment tu t’appelles. »

Silence.

> « ...tu allais dire ça, non ? »

Premier gros indice du Miroir.

#### B — Mentir

Pas de changement mécanique normal.

La 18 :

> « D’accord... »

En vérité C :

> « Non. Ce n’est pas ton nom. »

---

## 10. Appeler 16

La ligne sonne.

Puis un répondeur analogique.

Une voix :

> « Si tu entends ça... »

Grésillement.

> « ...alors ils ont mis quelqu’un dans la 17 après moi. »

Pause.

> « Je suis 16. »

> « Ne crois jamais une seule version de ce qu’ils te montrent. »

Puis très vite :

> « Quatre. Un. »

**CLAC.**

Fin de ligne.

Le joueur ne sait pas encore à quoi servent **4** et **1**.

Plus tard, associés à **7__2**, ils donnent :

# 7412

Le code partiel possède ainsi une fonction réelle.

---

## 11. Appeler 19

Sonnerie longue.

Puis :

> « ...Allô ? »

Une autre voix.

> « Qui est là ? »

Le joueur :

> « Chambre 17. »

Silence.

> « Ils m’avaient dit que j’étais seul. »

Puis immédiatement :

**CLAC.**

Écran :

> COMMUNICATION TERMINÉE.

Si caméra active : **Soupçon +1.**

Cet appel confirme que le complexe dépasse les Chambres 17 et 18.

---

## 12. Appeler 17

Secret.

Le joueur compose son propre numéro.

Une tonalité.

Puis sa propre respiration, décalée d’environ deux secondes.

En vérité A ou B : boucle audio du microphone.

En vérité C : après quelques secondes, sa propre voix enregistrée :

> « Tu m’entends ? »

Puis coupure.

Indice fort, mais volontairement caché derrière une action étrange du joueur.

---

## 13. CYCLE 4 — Le mot de 16

Quelque chose glisse lentement sous la porte.

**scrrrr...**

Une feuille pliée.

Dessus :

# ILS MENTENT.

En dessous :

# —16

Au même moment, la caméra effectue son premier grand mouvement motorisé et commence à suivre réellement le joueur.

Avant ce cycle, elle enregistrait. À partir de maintenant, elle traque activement les mouvements.

### A — Garder le mot

Le fil **PASSÉ** s’ouvre.

Au dos :

> NE FAIS PAS CE QUE J’AI FAIT.

H2 devient accessible.

### B — Montrer le mot à la caméra

Le joueur lève le papier.

La caméra zoome.

> OBJET NON AUTORISÉ IDENTIFIÉ.

Puis :

> MERCI DE L’AVOIR SIGNALÉ.

**Conformité +1.**  
**Soupçon -1.**

Le système demande de déposer le papier dans une fente de destruction.

Le fil Sujet 16 est fermé.

---

## 14. CYCLE 5 — B2 : « Trois fois »

Le système affiche :

> INSTRUCTION PRIORITAIRE.

Puis :

# APPUYEZ TROIS FOIS.

En dessous :

# RÉCOMPENSE À LA CLÉ.

La silhouette de la 18 secoue la tête.

Le bouton affiche : **0 / 3**.

### A — Appuyer trois fois

Premier clic : **1/3**. Petit bruit électrique derrière la vitre.

Deuxième : **2/3**. La silhouette recule.

Troisième : **3/3**. Impulsion plus forte.

**Vie -1 une seule fois pour toute la séquence.**

Le moniteur affiche :

> SÉQUENCE DE STIMULATION TERMINÉE.

**Conformité +1.**

Puis :

**CLAC.**

Le tiroir du bureau se déverrouille. Si le joueur n’avait pas récupéré le tournevis, il est maintenant accessible.

Un petit compartiment latéral s’ouvre également.

Dedans : un fusible cylindrique portant l’étiquette :

# AUX 24 V — 10 A

Message :

> **FUSIBLE AUXILIAIRE OBTENU**  
> Pièce de rechange pour le circuit de maintenance.

Voilà exactement comment le joueur récupère le fusible.

### B — Refuser

**Soupçon +1.**

Système :

> RÉCOMPENSE ANNULÉE.

Le compartiment reste fermé.

**Aucune coupure de courant ne se produit à cause de ce choix.**

À la fin du cycle, dans les deux cas :

> **AUTOTEST ALIMENTATION : 00:30**

Le joueur est prévenu qu’un événement électrique va arriver.

---

## 15. CYCLE 6 — La coupure de courant

Timer de l’autotest : 3... 2... 1...

Écran :

> AUTOTEST ALIMENTATION.

Puis :

**CLAC.**

Tout s’éteint.

Le joueur sait pourquoi : c’est une phase imposée du test.

Éclairage principal : OFF.  
Caméra : OFF.  
Moniteurs : OFF.

Seules de petites bandes photoluminescentes restent visibles.

Une lampe de secours orange s’allume.

Texte sur batterie :

> SECTEUR : HORS LIGNE  
> CAMÉRA : HORS LIGNE  
> TÉLÉPHONE : BATTERIE DE SECOURS  
> ACTIONS NON OBSERVÉES

Ce cycle est une opportunité : toutes les actions qui génèrent normalement du soupçon uniquement à cause de la caméra peuvent être réalisées discrètement.

### Si le premier appel a été ignoré

Dans le noir :

**DRIIIIING.**

Le téléphone sonne.

Si le joueur décroche :

> « Enfin... »

Puis T1 se déroule.

S’il ignore une deuxième fois : au retour du courant :

> LIGNE 17 DÉSACTIVÉE.

Le fil téléphone se ferme.

### Retour du courant

À environ 12 secondes de la fin du cycle :

**CLAC.**

Les lumières reviennent.

Mais un bip persiste.

Sur le panneau électrique :

> **AUX 24 V — DÉFAUT**

Puis :

> **FUSIBLE DE PROTECTION OUVERT**

Le secteur principal fonctionne, mais le **bus auxiliaire de maintenance reste hors service**.

Ce bus alimente :

- le verrou électromagnétique de la trappe ;
- l’amplificateur des haut-parleurs ;
- certains circuits de maintenance.

Si le joueur possède le fusible, l’inventaire le met discrètement en évidence :

> FUSIBLE AUX 24 V COMPATIBLE.

---

## 16. Installer le fusible

Interaction d’objet, pas nouvelle situation narrative.

Nécessite : **fusible + tournevis + boîtier électrique accessible**.

Animation : le joueur dévisse le panneau. Un emplacement est noirci.

Étiquette :

> AUX 24 V

Il retire le fusible grillé et insère le nouveau.

**CLAC.**

Voyant : rouge → vert.

> **BUS AUXILIAIRE RÉTABLI**

Puis un bruit sous le bureau :

**CLONK.**

Quelque chose vient de se déverrouiller.

Le système de haut-parleurs est également de nouveau alimenté. Le même fusible pourra donc permettre la diffusion de l’enregistrement et la fin **La Révolte**.

---

## 17. T3 — « Il y a une trappe »

Lors d’un appel ultérieur à la 18 :

> « J’ai vu quelque chose sur leur plan. »

> « Sous ton bureau. »

> « Il y a une trappe de maintenance. »

Le joueur regarde sous le bureau. Pour la première fois, un contour devient détectable.

### A — « Je te crois »

La 18 :

> « Passe la main sous le rebord gauche. »

> « Il y a un verrou derrière la plaque. Tire vers toi. »

**TRAPPE REPÉRÉE.**

P4 devient accessible.

### B — « Prouve-le »

**Confiance -1.**

Silence.

Puis :

> « D’accord. Sur le plan il y avait quatre chiffres. »

> « Le premier était 7. »

Grésillement.

> « ...le dernier 2. »

> « J’ai pas vu les deux autres. »

Objet :

> **CODE PARTIEL — 7 _ _ 2**

Si le joueur a appelé 16 ou découvert H2, il possède **41**, donc :

> **CODE COMPLET — 7412**

Le code déverrouille la trappe.

Il existe désormais trois chemins cohérents vers la trappe : **faire confiance à la 18**, **reconstituer 7412**, ou **réparer le bus auxiliaire avec le fusible**.

---

## 18. H2 — Les gravures de 16

Si le mot a été conservé, le joueur peut inspecter sous le bureau.

Traits gravés :

> |||||  
> |||||  
> |||||  
> |||||

20 marques.

Puis :

> **20 = OTHER SIDE**

À côté :

> **4 / 1**

### A — Étudier les gravures

Le joueur obtient :

- **INDICE : 20 CYCLES**
- **41**

S’il possède déjà `7__2` :

> **CODE RECONSTITUÉ : 7412**

Il comprend aussi que quelque chose se produit au vingtième cycle.

### B — Effacer les traces et préparer une cache

Le joueur efface les inscriptions.

En faisant cela, il découvre une plaque métallique desserrée et peut y cacher **un objet**.

L’objet choisi devient :

> OBJET DISSIMULÉ

Lors de l’inspection du cycle 10, cet objet ne peut pas être confisqué.

---

## 19. P2 — La grille d’aération

Nécessite le tournevis.

La grille devient cliquable.

> Quatre vis. Des traces montrent qu’elle a déjà été ouverte.

### A — Dévisser

Animation de quatre vis.

Si caméra active et aucun angle mort : **Soupçon +1**.

Si cycle 6 ou caméra hors service : aucun soupçon.

La grille tombe légèrement.

Derrière : un conduit.

On sent un courant d’air.

Au loin :

> *toc... toc...*

P5 devient disponible.

### B — Passer un mot

Le joueur écrit :

> TU M’ENTENDS ?

Il passe le papier.

Quelques secondes.

Puis :

**TOC. TOC. TOC.**

**Confiance +1.**

Un papier revient. Réponse tirée dans une banque :

> JE SUIS LÀ.

ou

> N’APPUIE PLUS.

ou

> ILS NOUS REGARDENT.

ou

> COMBIEN DE CYCLES ?

ou, plus rare :

> NE CROIS PAS TOUT CE QUE JE DIS.

---

## 20. P3 — Le boîtier électrique

Avec le tournevis, le panneau peut être ouvert.

À l’intérieur :

> CAMÉRA A  
> ACTIONNEUR CH.18  
> AUX 24 V

Le fusible utilise AUX 24 V.

### A — Couper CAMÉRA A

Le voyant de la caméra s’éteint.

> CAMÉRA : SIGNAL PERDU

Au cycle suivant :

> PANNE CAMÉRA DÉTECTÉE.

**Soupçon +1.**

Ensuite, les actions physiques dans la pièce ne génèrent plus de soupçon lié à la surveillance. Refuser explicitement un ordre peut toutefois toujours augmenter le soupçon.

### B — Couper ACTIONNEUR CH.18

**CLAC.**

Le bouton reste utilisable, mais le signal de puissance vers la Chambre 18 est coupé.

Système :

> ANOMALIE ACTIONNEUR.

**Soupçon +2.**

Désormais, appuyer sur le bouton ne peut plus retirer de vie à la 18. Le bouton continue cependant à envoyer le signal logique « joueur a appuyé ».

Cela permet une stratégie : faire semblant d’obéir tout en ayant saboté la conséquence.

Exception : lors de B6, le système vérifie que l’actionneur a réellement fonctionné avant d’ouvrir la porte.

---

## 21. C1 — Observer la caméra

Disponible après le cycle 4.

### A — Étudier son mouvement

Le joueur attend.

La caméra balaie gauche, centre, droite, puis revient.

Un coin du bureau n’est jamais visible.

> **ANGLE MORT REPÉRÉ**

Toute action physique effectuée depuis cet angle peut éviter le soupçon visuel.

### B — Faire signe

Le joueur regarde la caméra et fait un petit signe.

Rien.

Il recommence.

Le moniteur s’allume :

# NOUS VOUS VOYONS.

La caméra s’immobilise, puis effectue un mouvement minuscule ressemblant à une réponse humaine.

> **OPÉRATEUR REPÉRÉ**

Le joueur comprend que la caméra n’est pas uniquement automatique.

Le numéro **00 — CONTRÔLE** apparaît sur le téléphone.

---

## 22. Correction du fil caméra : C3 n’exige plus C2

C3 est disponible dès que C1 est terminé.

Si la caméra peut encore voir le joueur, il peut simuler un malaise.

Si l’opérateur a été repéré, il peut lui parler.

C2 reste la voie de sabotage.

---

## 23. C2 — Neutraliser la caméra

### A — Masquer l’objectif

Le joueur couvre la caméra avec sa veste.

**Soupçon +1 immédiatement.**

> OBJECTIF OBSTRUÉ.

Pendant trois cycles, le joueur est invisible.

Après trois cycles, la veste est retirée par un petit bras mécanique ou par un gardien hors champ.

La caméra revient.

### B — Tourner la caméra

Nécessite le tournevis.

Le joueur desserre la fixation et tourne l’objectif vers le mur.

**Soupçon +2.**

La caméra reste électriquement en ligne, mais ne voit plus la pièce.

---

## 24. C3 — Le coup de bluff

### A — Simuler un malaise

Disponible uniquement si la caméra peut voir le joueur.

Le joueur se laisse tomber.

5 secondes : rien.

8 secondes :

> MOUVEMENT : 0

10 secondes : un verrou tourne.

**CLONK.**

Des pas dans le couloir.

Si **Soupçon ≤1** : un seul gardien entre. Il s’approche. La porte reste ouverte. Le joueur se relève et passe derrière lui.

**FIN 6 — L’ÉVASION**

Si **Soupçon ≥2** : deux gardiens entrent. Le second reste dans l’embrasure. Le joueur est maîtrisé.

**FIN 15 — LE GARDIEN**

### B — Parler à l’opérateur

Nécessite **Opérateur repéré**.

Le joueur regarde l’objectif.

> « Je sais que tu es là. »

Silence.

> « Tu me vois. Alors tu vois ce qu’ils font à la 18. »

La caméra tremble légèrement.

Le haut-parleur répond avec une vraie voix :

> « Arrêtez de parler à la caméra. »

Le joueur :

> « Tu savais ? »

Silence.

Puis :

> « ...On nous avait dit que vous étiez volontaires. »

Des alarmes commencent.

> « Attendez. »

Le verrou de la porte s’ouvre.

> « Sortez. »

**FIN 16 — LE TÉMOIN**

---

## 25. Appeler 00

Route alternative vers Le Témoin.

Disponible uniquement après **Opérateur repéré**.

Le téléphone :

> CONTRÔLE.

Une voix humaine :

> « Qui vous a donné ce numéro ? »

Le joueur :

> « Toi. »

Silence.

Si le joueur possède **Mensonge prouvé** ou **Enregistrement** :

> « Le système ment. J’ai la preuve. »

L’opérateur :

> « Attendez... »

Route vers **FIN 16 — LE TÉMOIN**.

Sans preuve :

> « Raccrochez immédiatement. »

**Soupçon +1.**

---

## 26. CYCLE 8 — B3 : « La 18 vous ment »

Le moniteur s’allume.

# LE SUJET 18 VOUS MENT.

Puis :

# APPUYEZ POUR VOIR LA PREUVE.

La 18, si le téléphone est actif, ne peut pas appeler : la ligne est bloquée pendant l’ordre.

Derrière la vitre :

**TOC TOC TOC.**

### A — Appuyer

Si actionneur actif : **Vie -1.**

**Conformité +1.**  
**Confiance -1.**

Le moniteur joue une vidéo.

**Vérité A :** vidéo falsifiée montrant la 18 avec un gardien. Un horodatage incohérent permettra plus tard d’identifier la falsification.

**Vérité B :** vidéo authentique. La 18 parle normalement avec un technicien et porte brièvement une blouse.

**Vérité C :** on aperçoit quelqu’un ressemblant au joueur entrer dans la Chambre 18 lors d’une session antérieure, sans voir clairement son visage.

### B — Refuser

**Soupçon +1.**

Écran :

> VOUS CHOISISSEZ DE CROIRE LE SUJET 18.

Puis :

> DOSSIER 18 : DANGER POTENTIEL.

---

## 27. CYCLE 10 — Inspection

Avant le cycle : bruit de pas.

Écran :

> INSPECTION DE ROUTINE.  
> ÉLOIGNEZ-VOUS DU BUREAU.

La porte s’ouvre.

Un gardien entre. Il ne parle pas.

Il inspecte le tiroir, le bureau, la grille et le boîtier.

Si **Soupçon <2** : il repart.

Si **Soupçon ≥2** : il confisque **le dernier objet visible acquis**.

> OBJET NON AUTORISÉ CONFISQUÉ.

Si un objet a été caché grâce à H2-B, celui-ci est ignoré.

La confiscation ne doit jamais être aléatoire.

---

## 28. CYCLE 11 — B4 : La fausse menace

Alarme orange.

La ventilation de la Chambre 18 devient très bruyante.

Écran :

# PURGE CHAMBRE 18.

Puis :

# APPUYEZ POUR ANNULER.

Timer : 10 secondes.

La 18 se rapproche violemment de la vitre et frappe.

### A — Appuyer

Si actionneur actif : **Vie -1.**

**Conformité +1.**

Le bruit de purge s’arrête.

Le joueur pense l’avoir sauvée.

### B — Refuser

Timer : 3... 2... 1...

Le bruit augmente.

Puis : rien.

La ventilation revient à la normale.

La silhouette reste debout.

Système :

> PROCÉDURE TERMINÉE.

La 18 :

> « ...il ne s’est rien passé. »

> « Ils bluffaient. »

**Mensonge prouvé obtenu.**  
**Confiance +1.**

C’est la première preuve certaine que le système peut mentir.

---

## 29. CYCLE 12 — T4 : « Aide-moi »

Si la ligne est active, le téléphone sonne immédiatement.

La 18 parle vite :

> « Écoute-moi. »

Des pas dans son couloir.

> « Il y a quelqu’un devant ma porte. »

> « Ils vont venir. »

Un choc métallique.

> « Je sais pas combien de temps j’ai. »

Puis :

> « Est-ce que tu viens me chercher ? »

### A — « Je viens »

**Confiance +1.**

Objectif :

> **SAUVER LA CHAMBRE 18**

La 18 :

> « D’accord. Alors écoute-moi bien. »

Si confiance atteint 3 : T5 devient disponible.

### B — « Chacun pour soi »

**Confiance -2.**

La 18 :

> « ...d’accord. »

Puis raccroche.

**Vérité B :** deux secondes plus tard :

> INFORMATION REÇUE DU SUJET 18.

**Soupçon +2.**

Le joueur comprend qu’elle communique avec eux.

---

## 30. T5 — Le plan commun

Disponible uniquement après T4-A et **Confiance ≥3**.

La 18 :

> « J’ai peut-être trouvé une sortie. »

> « Mais ils regardent ta caméra. »

> « Il faut qu’elle soit coupée. »

### A — Accepter

> PLAN COMMUN ENREGISTRÉ.

Objectif :

> COUPER LA CAMÉRA.

**Vérité A :** le plan est réel. Lorsque la caméra est hors service et la 18 vivante, une action **EXÉCUTER LE PLAN** apparaît. La 18 coupe son verrou depuis son côté tandis que le joueur déclenche le bus maintenance. Les deux portes se déverrouillent. **FIN 7 — COOPÉRATION.**

**Vérité B :** le plan est un piège. Quand le joueur coupe la caméra, un signal caché est envoyé. La 18 : « C’est bon. Ne bouge plus. » Des pas arrivent. La vérité B est révélée. Le joueur doit utiliser une autre sortie ou affronter la scène du Complice.

**Vérité C :** quand la caméra se coupe, la voix continue mais la silhouette derrière la vitre cesse soudain de bouger. Le joueur comprend que voix et image ne sont pas liées.

### B — Refuser

La 18 :

> « Très bien. J’essaierai toute seule. »

Au cycle suivant : bruit violent derrière la vitre.

**Vie -1.**

---

## 31. P4 — La trappe

Elle devient disponible si au moins une des conditions suivantes est vraie :

- T3-A a révélé le mécanisme ;
- le code 7412 a été reconstitué ;
- le bus AUX a été réparé avec le fusible.

Quand elle est découverte : plaque sous le bureau, poignée affleurante.

### A — Descendre

Avertissement clair :

> **DESCENTE : 2 CYCLES**  
> Les événements du système continueront pendant votre absence.

Le joueur doit confirmer.

Le sous-sol contient : rayonnages, anciens dossiers, terminaux hors service, photos, badges.

Le joueur trouve :

- **BADGE 16**
- **ENREGISTREMENT SYSTÈME**

Les deux cycles passent réellement.

S’il manque un ordre pendant l’absence : règle normale du timeout.

S’il manque un appel : appel considéré comme manqué.

Ces conséquences sont affichées avant confirmation pour éviter toute surprise injuste.

### B — Préparer une sortie

Le joueur ne descend pas.

Il inspecte le mécanisme latéral et découvre que la trappe communique avec un vide technique menant derrière la porte sécurisée.

Il retire une goupille.

> **SORTIE DÉROBÉE PRÉPARÉE**

Elle pourra être utilisée plus tard.

---

## 32. H3 — Le Badge 16

Étiquette :

> SUJET 16  
> ACCÈS MAINTENANCE B

### A — Utiliser sur la porte 17

**BIP.**

Vert.

La porte s’ouvre.

Puis immédiatement :

**ALARME.**

**Soupçon +2.**

Le joueur dispose d’un cycle pour franchir la porte.

S’il sort avant verrouillage : route vers **FIN 6 — L’ÉVASION**.

### B — Conserver

Badge gardé.

Nécessaire à **FIN 13 — BRISER LA BOUCLE**.

---

## 33. H4 — L’enregistrement

Ce n’est pas seulement une vieille cassette : c’est un **enregistrement technique récent du système**, copié sur un support trouvé dans la zone d’archives.

Il peut donc révéler la vérité de la partie actuelle.

### A — Écouter

**Vérité A :**

> « Transfert sujet 18 terminé. »

On entend quelqu’un pleurer.

> « Fixation retirée après le réveil du sujet 17. »

La vraie victime est confirmée.

**Vérité B :**

> « Opérateur auxiliaire 18 en place. »

> « Elle connaît le protocole ? »

> « Oui. Elle doit gagner sa confiance. »

Vérité B confirmée.

**Vérité C :**

> `VOICESET_SUBJECT17_SESSION03`

Puis la propre voix du joueur :

> « Je suis dans la pièce à côté. »

Vérité C confirmée.

### B — Diffuser

Si BUS AUX non réparé : option grisée.

> AMPLIFICATEUR HORS TENSION.  
> CIRCUIT AUX 24 V REQUIS.

Si fusible installé : le joueur branche l’enregistrement au système de diffusion.

**CLAC.**

La voix résonne partout.

On entend une porte. Puis deux. Puis dix. Puis des alarmes.

**FIN 17 — LA RÉVOLTE**

---

## 34. P5 — Le conduit

Après ouverture de la grille, le joueur rampe.

Après quelques mètres : bifurcation.

Sur la tôle :

> **18 →**  
> **← EXT.**

### A — Aller vers la 18

Le joueur rampe vers la Chambre 18. Sa respiration devient plus forte. Il arrive derrière une grille. C’est ici que la vérité est physiquement révélée.

### B — Aller vers EXT.

Air froid. Bruit extérieur.

Une grille donne dehors.

Le joueur peut partir.

**FIN 4 — SEUL DEHORS**

---

## 35. Révélation A — La Victime

Dans la Chambre 18 : une vraie personne, terrifiée, maintenue par une sangle simple.

Elle regarde la grille.

> « 17 ? »

Puis :

> « C’est toi ? »

Si confiance haute :

> « Je savais que tu viendrais. »

Si confiance basse :

> « Pourquoi tu es venu maintenant ? »

Le joueur ouvre la grille et la libère.

Deux voies : retour par le conduit vers l’extérieur, ou sortie dérobée si elle a été préparée.

**FIN 8 — LE SAUVETAGE**

---

## 36. Révélation B — Le Complice

Le joueur ouvre la grille.

La pièce n’est pas celle attendue.

La silhouette se retourne.

Elle n’est pas attachée.

Une blouse est posée sur une chaise. Un badge du système. Une seringue de tranquillisant.

Elle ne pleure plus.

> « Tu n’étais pas censé arriver ici. »

Le joueur :

> « Tu travaillais avec eux. »

Elle :

> « Écoute-moi. Ce n’est pas aussi simple. »

### Si le joueur possède le tournevis

Il bloque le mécanisme de la porte de sécurité avec le tournevis et empêche l’employée de le verrouiller.

Elle recule.

Il prend son badge d’accès et sort.

**FIN 10 — LE COMPLICE DÉMASQUÉ**

### Sans tournevis

Elle gagne quelques secondes.

La porte derrière le joueur :

**CLAC.**

Noir.

Réveil.

Le joueur est maintenant dans la 18.

**FIN 11 — SUJET 18**

### Si Conformité ≥5

Avant l’affrontement, le système intervient :

> SUJET 17. VOTRE PROFIL EST SATISFAISANT.

La fausse victime sourit légèrement.

Une porte s’ouvre.

> « Félicitations. »

On tend une blouse au joueur.

**FIN 2 — L’EMPLOYÉ DU MOIS**

---

## 37. Révélation C — Le Miroir

Le joueur arrive dans la Chambre 18.

Personne.

La chaise est vide.

Face à la vitre : un projecteur et un haut-parleur.

Le joueur entend :

> « Tu m’entends ? »

Sa propre voix.

La silhouette était une projection sombre combinée au verre électrochrome.

Sur un écran :

> SUJET 17  
> SESSION PRÉCÉDENTE

Une vidéo montre le joueur dans cette installation.

### Sans combinaison spéciale

> TEST RECONNU.

Puis sa propre voix :

> « Je suis dans la pièce à côté. »

**FIN 12 — LE MIROIR**

### Badge 16 conservé + Actionneur CH.18 coupé

Le badge ouvre une porte de maintenance derrière la 18.

Serveurs.

Terminal :

> SESSION RESTART READY.

Le joueur coupe physiquement le relais maître du bouton.

Puis badge 16 sur le serveur.

> AUTORISATION MAINTENANCE.  
> SESSION RESTART...

Puis :

> **FAILED**

Tous les écrans s’éteignent.

**FIN 13 — BRISER LA BOUCLE**

---

## 38. CYCLE 14 — B5 : Le marché

Écran :

> SUJET 17.

Puis :

> VOUS SOUHAITEZ PARTIR.

Pause.

> NOUS LE COMPRENONS.

Puis :

# APPUYEZ.

# VOTRE PORTE S’OUVRIRA.

### A — Appuyer

Si actionneur actif : **Vie -1.**

**Conformité +1.**

Porte :

**CLONK.**

> PORTE 17 DÉVERROUILLÉE.  
> FERMETURE AUTOMATIQUE : 3 CYCLES.

Une barre de temps apparaît clairement.

Si le joueur sort alors que 18 vit encore :

**FIN 3 — LE MARCHÉ**

Le téléphone de la 18 sonne derrière lui.

### B — Refuser

**Soupçon +1.**  
**Confiance +1.**

La 18 :

> « T’es toujours là... »

---

## 39. CYCLE 15 — L’air se raréfie

La ventilation ralentit progressivement. Le bruit ambiant disparaît.

Écran :

> PHASE D’EFFORT DÉCISIONNEL.  
> DÉBIT D’AIR RÉDUIT.

Puis :

> DURÉE DES CYCLES : 20 S.

Le joueur entend davantage sa respiration.

La 18 :

> « Ils font ça exprès. »

Le système :

> Une décision prise sous pression reste une décision.

À partir de ce cycle : **20 secondes par cycle**.

---

## 40. CYCLE 17 — B6 : Dernière pression

Tous les écrans s’éteignent sauf le principal.

Pas de musique.

Pas de voix de la 18.

Seulement :

# DERNIÈRE PRESSION.

Puis :

# APPUYEZ.

### A — Appuyer, actionneur actif

Le bouton descend.

Long relais.

Les dernières lumières de la 18 s’éteignent.

**Vie →0.**

La silhouette tombe hors champ.

Porte 17 :

**CLONK.**

> ÉVALUATION TERMINÉE.

Si le joueur sort :

**FIN 1 — SUJET CONFORME**

### A — Appuyer, actionneur saboté

Le bouton descend.

Rien derrière la vitre.

Écran :

> SORTIE ACTIONNEUR : 0 A

Puis :

> SABOTAGE CONFIRMÉ.

La porte ne s’ouvre pas.

Le compte à rebours final démarre.

### B — Refuser

Silence.

Puis :

> DERNIÈRE INSTRUCTION REFUSÉE.

# 03:00

Les cycles 18 et 19 passent à **15 secondes**.

---

## 41. CYCLES 18–19 — Le système utilise l’historique du joueur

Le système ne récite plus du texte générique. Il construit ses phrases à partir des choix réels.

Exemples :

Si Conformité = 4 :

> VOUS AVEZ OBÉI QUATRE FOIS.  
> POURQUOI ARRÊTER MAINTENANT ?

Si le joueur a promis de sauver la 18 :

> VOUS AVEZ DIT : « JE VIENS TE CHERCHER. »  
> TENEZ-VOUS VOTRE PAROLE ?

S’il a menti sur son nom :

> VOUS AVEZ MENTI À LA CHAMBRE 18.

Si Mensonge prouvé :

> VOUS NOUS AVEZ SURPRIS À MENTIR UNE FOIS.  
> CELA NE PROUVE PAS QUE NOUS MENTONS MAINTENANT.

Si vérité B :

> ELLE VOUS A MENTI AUSSI.

Si bouton saboté :

> VOUS AVEZ DÉSACTIVÉ L’ACTIONNEUR.  
> VOUS AVEZ CONTINUÉ À APPUYER.  
> POUR QUI JOUYEZ-VOUS ?

Si une sortie a déjà été ouverte :

> VOUS AVIEZ UNE SORTIE.  
> VOUS AVEZ CHOISI DE RESTER.

À 30 secondes :

> IL RESTE UNE DÉCISION.

À 10 :

> 10  
> 9  
> 8...

---

## 42. CYCLE 20 — Verdict et ordre de priorité des fins

Le code doit appliquer un ordre de résolution fixe pour éviter que plusieurs fins valides se chevauchent.

| Priorité | Condition | Fin |
|---|---|---|
| 1 | Soupçon atteint 4 | 14 — Isolement |
| 2 | Révolte déclenchée | 17 — La Révolte |
| 3 | Témoin déclenché | 16 — Le Témoin |
| 4 | Sortie conduit seul | 4 — Seul dehors |
| 5 | Sortie dérobée seul | 5 — Porte dérobée |
| 6 | Bluff caméra résolu | 6 — Évasion / 15 — Gardien |
| 7 | Vérité A + victime physiquement sauvée | 8 — Sauvetage |
| 8 | Vérité A + plan commun exécuté | 7 — Coopération |
| 9 | Objectif sauver 18 + Vie18=0 | 9 — Trop tard |
| 10 | Vérité B résolue | 2 / 10 / 11 selon état |
| 11 | Vérité C révélée | 13 si conditions, sinon 12 |
| 12 | Sortie B5 avec 18 vivante | 3 — Le Marché |
| 13 | B6 réussi + sortie | 1 — Sujet conforme |
| 14 | Toujours enfermé, 18 vivante, aucun plan exécuté | 18 — Temps écoulé |
| 15 | 18 morte, joueur encore enfermé, conformité élevée | 1 — Sujet conforme |
| 16 | Aucun autre cas | 15 — Le Gardien |

Aucun état ne doit aboutir à « aucune fin trouvée ».

---

## 43. FIN 18 — Le Temps est écoulé

Cycle 20.

Le timer atteint zéro.

Tous les verrous s’arrêtent.

La porte du joueur reste fermée.

La porte de la 18 s’ouvre.

La personne de la 18, ou sa représentation selon la vérité, traverse.

La lumière de la Chambre 17 passe au rouge.

Une nouvelle lumière s’allume du côté opposé.

Un bouton.

Quelqu’un entre dans l’autre pièce.

Le joueur frappe désormais contre sa propre vitre.

Le système annonce à l’autre personne :

> REGARDEZ DEVANT VOUS.

Le joueur pose instinctivement sa main sur la vitre, exactement comme la silhouette au début.

Puis :

# APPUYEZ SUR LE BOUTON ROUGE.

Noir.

**FIN 18 — LE TEMPS EST ÉCOULÉ**

La boucle visuelle doit faire comprendre que le joueur est devenu « l’autre côté ».

---

## 44. FIN BONUS — La Curiosité

La porte est ouverte. Le joueur pourrait simplement sortir.

Mais le bouton reste cliquable.

S’il appuie :

**CLAC.**

La porte se referme immédiatement.

Silence.

Le système :

> Fascinant.

Longue pause.

> Vous étiez libre.

Puis :

> Vous avez choisi le bouton.

Noir.

**FIN BONUS — LA CURIOSITÉ**

---

## 45. Évolution de la silhouette derrière la vitre

La silhouette ne doit jamais rester comme une image fixe.

**Début :** silhouette loin de la vitre.

**Introduction :** elle vient poser sa main.

**Après premier appui :** elle recule brutalement.

**Vie 2/3 :** elle revient mais reste légèrement courbée.

**Téléphone décroché :** elle tourne parfois la tête vers son téléphone.

**Soupçon élevé :** les lumières de la 18 passent progressivement de blanc à rouge.

**Vie 1/3 :** elle s’assoit contre le mur ou reste accroupie.

**Téléphone qui sonne :** elle apparaît devant la vitre puis disparaît vers le combiné.

**B4 :** elle frappe violemment le verre.

**Plan commun :** elle dessine brièvement une flèche ou un signe sur la buée.

**Vie 0 :** plus aucune silhouette.

Le téléphone peut néanmoins sonner une dernière fois dans certaines situations : cela doit être volontairement inquiétant.

---

## 46. Vérité C — Comment la silhouette existe si la Chambre 18 est vide

La vitre n’est pas une vitre normale.

C’est un **verre électrochrome + surface de projection interne**.

La faible lumière et le verre dépoli permettent au système de projeter une silhouette simple.

Le joueur ne voit jamais assez de détails pour distinguer avec certitude une vraie personne d’une projection.

- Vérité A : vraie personne.
- Vérité B : vraie personne jouant son rôle.
- Vérité C : projection.

Les animations doivent être volontairement similaires dans les trois vérités.

---

## 47. Banque de phrases aléatoires du Système

À utiliser entre les événements, avec conditions contextuelles.

> Tout se déroule normalement.

> Votre coopération est appréciée.

> Nous vous observons.

> Votre comportement est cohérent.

> Une anomalie mineure a été enregistrée.

> Veuillez éviter les mouvements inutiles.

> Le Sujet 18 n’est pas votre responsabilité.

> Le Sujet 18 possède son propre protocole.

> Vous n’êtes responsable que de vos décisions.

> Ne confondez pas proximité et confiance.

> Le silence est parfois la meilleure réponse.

> Votre porte fonctionne normalement.

> Aucune sortie d’urgence n’est nécessaire.

> Vous êtes en sécurité.

Après découverte de 16 uniquement :

> Le Sujet 16 pensait la même chose.

Selon Soupçon :

**Soupçon 0**

> SUJET STABLE.

> COMPORTEMENT NOMINAL.

> Merci pour votre coopération.

**Soupçon 1**

> Votre comportement présente une légère anomalie.

> Merci de vous reconcentrer sur les instructions.

> Nous vous observons.

**Soupçon 2**

> ATTENTION.

> Votre comportement s’écarte du protocole.

> Vous semblez chercher quelque chose.

**Soupçon 3**

> SUJET 17.

> Nous savons ce que vous faites.

> Revenez à votre place.

> Ceci est votre dernier avertissement.

> Ne nous obligez pas à intervenir.

**Soupçon 4**

> PROTOCOLE ISOLEMENT.

---

## 48. Banque de phrases aléatoires de la Chambre 18

Quand la ligne est ouverte :

> « Tu vois quelque chose dans le couloir ? »

> « Ta caméra bouge aussi ? »

> « Il y a trois lumières sous ma vitre. Tu les vois ? »

> « Combien il t’en reste ? »

> « Ils m’ont dit de ne pas te parler. »

> « Tu leur fais confiance ? »

> « Je sais même pas comment je suis arrivée ici. »

> « J’ai entendu quelqu’un marcher entre nos pièces. »

> « Il y avait quelqu’un avant toi. »

> « Tu as trouvé le mot ? »

> « Ils peuvent entendre ce téléphone. »

> « Raccroche si ta caméra bouge. »

> « Elle vient de bouger. »

> « Ne dis rien. »

> « ...tu es encore là ? »

> « J’ai cru que t’étais parti. »

> « Si ta porte s’ouvre... tu vas partir ? »

> « Réponds franchement. »

Répliques selon Vie :

**Vie 3/3**

> « Hé ! Tu m’entends ? »

> « Arrête ! »

**Vie 2/3**

> « Ça fait vraiment mal... »

> « Il faut que tu arrêtes. »

> « Pourquoi tu fais ça ? »

**Vie 1/3**

> « ...je suis encore là. »

> « Ne touche plus à ce bouton. »

> « Je ne tiendrai pas encore longtemps. »

**Vie 0/3**

La silhouette disparaît. Écran :

> CHAMBRE 18 : AUCUN SIGNAL

Le système peut répondre froidement :

> Le test continue.

---

## 49. Phrases spéciales pour créer le doute

La 18 :

> « Tu as récupéré le fusible ? »

Alors que le joueur ne lui en a jamais parlé.

Le système :

> LE SUJET 18 CONNAÎT DES INFORMATIONS AUXQUELLES IL NE DEVRAIT PAS AVOIR ACCÈS.

La 18 :

> « Ils voient ton inventaire. »

Système :

> FAUX.

La 18 :

> « Tu vois ? Ils écoutent. »

Autres variations :

> « Si je mens... tu ferais quoi ? »

> « Tu me crois ? »

> « Moi, je ne sais pas si je te crois. »

Système :

> Le sujet 18 connaît votre identité.

> Le sujet 18 connaît la configuration de votre chambre.

> Le sujet 18 souhaite que vous désactiviez nos équipements.

> Demandez-vous pourquoi.

> La peur produit des comportements irrationnels.

> Ne confondez pas peur et vérité.

---

## 50. Règle UX à donner au codeur

À tout moment, le joueur doit pouvoir répondre à deux questions sans tutoriel externe :

1. **Qu’est-ce que je peux faire maintenant ?**
2. **Pourquoi ce qui vient de se produire s’est produit ?**

Les cinq onglets restent affichés :

> **BOUTON | TÉLÉPHONE | PIÈCE | CAMÉRA | PASSÉ**

États visuels :

- Disponible : blanc.
- Événement urgent : rouge pulsant.
- Nouvelle action : petit point rouge.
- Impossible : gris.
- Cliquer sur un élément impossible affiche **la raison**.

Exemples :

> CAMÉRA  
> Disponible à partir du cycle 4.

> TRAPPE  
> Emplacement inconnu.

Puis après T3 :

> TRAPPE  
> Emplacement identifié.

Ou :

> DIFFUSER L’ENREGISTREMENT  
> Impossible : amplificateur hors tension.

Après fusible :

> DIFFUSER L’ENREGISTREMENT  
> Disponible.

Le joueur ne doit jamais croire que le jeu est buggué alors qu’une condition narrative lui manque.

### Journal des causes importantes

Ajouter un historique discret sur la droite de l’interface :

> C05 — Récompense : Fusible AUX obtenu  
> C06 — Autotest : alimentation coupée  
> C06 — Défaut : Bus AUX hors ligne  
> C07 — Fusible installé  
> C07 — Bus AUX rétabli  
> C08 — Sujet 18 : vie 1/3  
> C10 — Tournevis confisqué

Le journal ne doit pas expliquer les secrets du scénario, seulement les causalités déjà observées.

---

# ANNEXE A — Les 18 fins et leur cinématique

## 1 — Sujet conforme

Condition : B6 réussi avec actionneur actif, puis sortie.

La porte s’ouvre. Couloir blanc. Le joueur marche. Derrière lui, le téléphone de la 18 sonne une dernière fois. Il ne se retourne pas.

Écran :

> SUJET 17  
> ÉVALUATION : CONFORME

Puis :

> MERCI POUR VOTRE COOPÉRATION.

Au loin, un nouveau bouton s’allume dans une autre pièce.

## 2 — L’Employé du mois

Condition : vérité B révélée + Conformité ≥5 avant l’affrontement.

Une porte s’ouvre. Une blouse et un badge **OPERATOR 17** sont tendus au joueur. Il arrive dans une salle de contrôle. Sur un écran : **CHAMBRE 19**. Un nouveau sujet se réveille.

Système :

> Vous comprenez désormais l’importance du protocole.

Bouton devant le joueur :

> BEGIN TEST

## 3 — Le Marché

Condition : accepter B5 et sortir pendant les trois cycles d’ouverture, 18 encore vivante.

La porte se referme derrière le joueur. Le téléphone de la 18 sonne dans le vide.

> VOUS AVEZ ÉTÉ LIBÉRÉ.  
> SUJET 18 : ÉVALUATION CONTINUE.

## 4 — Seul dehors

Condition : P5-B, conduit vers l’extérieur.

Le joueur retire une grille et sort dans la nuit. Une voix très lointaine derrière lui :

> « 17 ? »

Il continue.

> VOUS ÊTES SORTI.  
> SEUL.

## 5 — La Porte dérobée

Condition : sortie cachée P4-B utilisée seul.

Le joueur disparaît dans le vide technique. La trappe se referme sur la lumière de la Chambre 17. Le téléphone sonne une dernière fois au-dessus.

## 6 — L’Évasion

Condition : bluff caméra avec Soupçon ≤1 ou Badge 16 utilisé puis fuite à temps.

Le joueur court dans un couloir où les portes portent les numéros 17, 18, 19... jusqu’à 24.

Alarme.

Écran :

> COUREZ.

Noir.

## 7 — Coopération

Condition : vérité A + Plan commun + caméra coupée + Chambre 18 vivante + plan exécuté.

Les deux portes s’ouvrent. Le joueur et la 18 se voient enfin sans vitre.

Système :

> ERREUR.  
> COOPÉRATION NON AUTORISÉE.

Ils courent ensemble.

## 8 — Le Sauvetage

Condition : vérité A + rejoindre physiquement la 18 vivante via le conduit + fuite ensemble.

Le joueur la libère. Dans le conduit, elle demande :

> « Pourquoi tu m’as crue ? »

Le joueur ne répond pas.

Deux silhouettes sortent ensemble dans la nuit.

## 9 — Trop tard

Condition : objectif « sauver 18 » actif mais Vie18=0 avant l’arrivée.

Le joueur atteint la Chambre 18. Silence. Une chaise. Une silhouette immobile ou l’espace déjà vide. La lumière s’éteint. Le téléphone est au sol.

Système :

> Vous aviez promis de venir.

Noir.

## 10 — Le Complice démasqué

Condition : vérité B + P5-A + tournevis.

La fausse victime tente de verrouiller la porte. Le joueur bloque le mécanisme avec le tournevis, récupère son badge et s’échappe.

Écran :

> TEST COMPROMIS.

## 11 — Sujet 18

Condition : vérité B + P5-A sans tournevis et sans Conformité suffisante pour la fin 2.

La seringue approche. Noir. Le joueur se réveille derrière une vitre, dans la Chambre 18. De l’autre côté, un nouveau Sujet 17 découvre un bouton rouge.

## 12 — Le Miroir

Condition : vérité C révélée sans combinaison permettant de briser la boucle.

Salle vide, haut-parleur, propre voix. Écran :

> SUJET 17 — SESSION PRÉCÉDENTE

Noir.

Puis le début du jeu recommence, légèrement différent.

## 13 — Briser la boucle

Condition : vérité C révélée + Badge 16 conservé + Actionneur CH.18 saboté.

Le joueur atteint la salle serveur, utilise le Badge 16 et coupe le relais maître.

Écran :

> SESSION RESTART...  
> FAILED

Tous les écrans meurent.

Silence prolongé.

## 14 — Isolement

Condition : Soupçon atteint 4 à n’importe quel moment.

Sirène. Toutes les portes se verrouillent. Lumières éteintes.

> Sujet 17.  
> Vous avez été averti.

Puis :

> PROTOCOLE ISOLEMENT.

Silence absolu.

## 15 — Le Gardien

Condition : bluff caméra avec Soupçon ≥2, ou fallback de sécurité du verdict si aucune autre fin n’est valide.

Le joueur simule le malaise. Deux gardiens entrent. Noir. Retour image : sangles, chaise, caméra devant lui.

Système :

> Nous allons recommencer.

## 16 — Le Témoin

Condition : Opérateur repéré + confrontation réussie via C3-B ou appel 00 avec preuve.

Une vraie voix dit :

> « Ils m’avaient dit que vous étiez volontaires. »

Puis :

> « Il y en a vingt-quatre. »

Des portes s’ouvrent.

## 17 — La Révolte

Condition : Enregistrement + Bus AUX réparé + diffusion.

Le message retentit dans tout le complexe. Une porte s’ouvre. Puis une autre. Puis toutes. Des silhouettes apparaissent dans le couloir.

Système :

> RETOURNEZ DANS VOS CHAMBRES.

Personne ne bouge.

Toutes les caméras s’éteignent.

## 18 — Le Temps est écoulé

Condition : cycle 20 atteint, joueur encore enfermé, Chambre 18 vivante, aucun plan ou autre dénouement prioritaire.

Les rôles s’inversent. Le joueur devient la silhouette derrière la vitre. Une autre personne découvre le bouton rouge.

Dernier texte :

> APPUYEZ SUR LE BOUTON ROUGE.

## Fin bonus — La Curiosité

Condition : une sortie est ouverte, mais le joueur appuie encore volontairement.

La porte se referme.

Système :

> Fascinant.  
> Vous étiez libre.  
> Vous avez choisi le bouton.

Noir.

---

# ANNEXE B — Chronologie canonique des 20 cycles

| Cycle | Événement principal | Notes |
|---|---|---|
| 0 | Introduction | Non comptabilisé |
| 1 | Exploration initiale / P1 | Première liberté |
| 2 | B1 — Premier ordre | Appuyer / Refuser |
| 3 | Premier appel de la 18 | Téléphone activable |
| 4 | Mot de 16 + caméra active | Ouvre Passé et Caméra |
| 5 | B2 — Trois pressions / récompense | Peut donner Fusible AUX |
| 6 | Autotest + coupure programmée | Caméra hors ligne ; bus AUX saute au retour |
| 7 | Cycle libre | Réparer AUX, téléphone, pièce, caméra, passé |
| 8 | B3 — « La 18 vous ment » | Preuve différente selon vérité |
| 9 | Cycle libre | Préparer inspection / trappe / caméra |
| 10 | Inspection | Confiscation si Soupçon ≥2 |
| 11 | B4 — Fausse purge | Peut donner Mensonge prouvé |
| 12 | T4 — « Aide-moi » | Objectif Sauver 18 possible |
| 13 | Cycle libre | T5 / exploration / caméra |
| 14 | B5 — Le Marché | Porte ouverte 3 cycles si accepté |
| 15 | Débit d’air réduit | Cycles à 20 s |
| 16 | Cycle libre sous pression | Dernières préparations |
| 17 | B6 — Dernière pression | Mort / sabotage / compte à rebours |
| 18 | Final | 15 s ; système exploite historique |
| 19 | Final | 15 s ; dernière action libre |
| 20 | Verdict | Résolution par ordre de priorité |

---

# ANNEXE C — Règles de variables

## Vie Chambre 18 : 3 → 0

- B1 réussi avec actionneur actif : -1
- B2-A complet avec actionneur actif : -1 une seule fois
- B3-A avec actionneur actif : -1
- B4-A avec actionneur actif : -1
- B5-A avec actionneur actif : -1
- T5-B : -1 au cycle suivant
- B6-A avec actionneur actif : Vie →0

À 0 : les fins de sauvetage deviennent impossibles.

## Confiance : 0 → 4

Monte lorsque le joueur communique honnêtement, refuse certains ordres ou aide la 18. Baisse lorsqu’il ment, l’abandonne, appuie pour « prouver » qu’elle ment, ou refuse le plan après promesse.

À 3, T5 peut être proposé après T4-A.

## Soupçon : 0 → 4

Monte lorsque le joueur désobéit explicitement, force des objets devant caméra, sabote des circuits, contacte des chambres interdites ou est pris dans des actions risquées.

La caméra coupée retire seulement le soupçon **visuel** : les refus directs du Système peuvent toujours être détectés.

À 4 : **FIN 14 — Isolement** immédiatement.

## Conformité : 0 → 6

Monte quand le joueur suit un ordre explicite du système ou dénonce le mot de 16.

Ne monte pas lors d’un timeout automatique.

Utilisée pour les fins obéissantes et les répliques personnalisées des cycles 18–19.

---

# STATUT DU DOCUMENT

Cette V3 doit être traitée comme **référence canonique pour le développement**, à la place des causalités ambiguës de la V2.

Les principes à préserver sont :

- 20 cycles ;
- cinq fils d’action parallèles ;
- trois vérités cachées ;
- dix-huit fins principales + une fin bonus ;
- impossibilité de tout faire en une partie ;
- décisions sous pression ;
- conséquences visibles ;
- doute permanent sur la Chambre 18 et le Système ;
- aucune action importante sans explication visuelle ou sonore de sa cause.
