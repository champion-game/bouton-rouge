/* Le Bouton Rouge — les données de l'histoire (v2).
   23 situations, leurs textes, leurs choix et leurs effets, les 18 fins (+ bonus),
   et les banques de phrases du Système et de la Chambre 18.
   Références : docs/ARBORESCENCE_V2.md (règles) et docs/SCRIPT_NARRATIF.md (textes). Aucun accès au DOM.
   Les effets reçoivent `g`, le contexte fourni par engine.js :
     g.ecran(txt)  phrase du Système (moniteur) · g.tel(txt) la 18 au téléphone · g.voix(txt) la 18 à travers le mur
     g.narr(txt)   ce que le joueur voit ou fait · g.pick(liste) une variante au hasard (déterministe). */
(function (root) {
  'use strict';

  var FILS = [
    { id: 'bouton', nom: 'Le bouton', court: 'Bouton' },
    { id: 'telephone', nom: 'Le téléphone', court: 'Téléphone' },
    { id: 'piece', nom: 'La pièce', court: 'Pièce' },
    { id: 'camera', nom: 'La caméra', court: 'Caméra' },
    { id: 'passe', nom: 'Le passé', court: 'Passé' }
  ];

  var OBJETS = {
    tournevis: 'Tournevis', fusible: 'Fusible', code: 'Code partiel 7 _ _ 2', badge: 'Badge 16',
    enregistrement: 'Enregistrement', mot16: 'Mot de 16', angleMort: 'Angle mort', operateur: 'Opérateur repéré',
    mensonge: 'Mensonge prouvé', plan: 'Plan commun', objectif: 'Objectif : sauver 18',
    sortieCachee: 'Sortie cachée', cameraCoupee: 'Caméra coupée', boutonDesactive: 'Bouton désactivé',
    verite: 'Vérité révélée', miroir: 'Indice miroir', conduit: 'Conduit ouvert', trappe: 'Trappe débloquée'
  };

  // Objets physiques que l'inspection du cycle 10 peut confisquer.
  var CONFISCABLES = ['tournevis', 'fusible', 'code', 'badge', 'enregistrement'];

  // Ordres du système (fil 1), par cycle.
  var ORDRES = { 2: 'B1', 5: 'B2', 8: 'B3', 11: 'B4', 14: 'B5', 17: 'B6' };

  var VERITES = {
    A: { nom: 'La victime', texte: 'La Chambre 18 était une vraie prisonnière. Elle disait la vérité.' },
    B: { nom: 'Le complice', texte: 'La Chambre 18 était un employé du système. Il testait ta loyauté.' },
    C: { nom: 'Le miroir', texte: 'Il n\'y avait personne dans la 18. La voix, c\'était la tienne, enregistrée lors d\'une session précédente.' }
  };

  // ---------- banques de phrases ----------
  var PHRASES = {
    // Démarrage (moniteur), puis le cycle 1 commence.
    intro: ['INITIALISATION.', 'SUJET 17|IDENTIFIÉ.', 'ÉVALUATION|COMPORTEMENTALE|EN COURS.', 'CHAMBRE 17|SESSION 04-17', 'NE VOUS LEVEZ|PAS.', 'NE TOUCHEZ PAS|À LA PORTE.', 'NE TENTEZ PAS DE COMMUNIQUER AVEC LES AUTRES CHAMBRES.', 'VEUILLEZ REGARDER|DEVANT VOUS.'],
    introVariantes: ['Votre participation est obligatoire.', 'Votre coopération garantit votre sécurité.', 'Tout comportement inhabituel sera enregistré.', 'Il n\'existe aucune raison de vous inquiéter.', 'Cette procédure est sans danger pour les sujets coopératifs.', 'Les sujets conformes terminent toujours l\'évaluation.', 'Merci de votre calme.'],
    // Entre les situations. Elles deviennent inquiétantes à force d'être répétées.
    ambiance: ['Tout se déroule normalement.', 'Votre participation est appréciée.', 'Merci de rester calme.', 'Le protocole fonctionne comme prévu.', 'Votre comportement est enregistré.', 'Vous êtes en sécurité.', 'Continuez.', 'Nous sommes avec vous.', 'Vous faites les bons choix.', 'Aucun danger immédiat n\'a été détecté.', 'Votre situation reste sous contrôle.', 'Nous comprenons votre inquiétude.', 'Votre inconfort est temporaire.', 'Vous pourrez bientôt quitter la pièce.', 'Merci pour votre patience.'],
    soupcon: {
      0: ['SUJET STABLE.', 'COMPORTEMENT|NOMINAL.', 'Merci pour votre coopération.', 'Aucun comportement anormal détecté.'],
      1: ['Votre comportement présente une légère anomalie.', 'Merci de vous reconcentrer sur les instructions.', 'Certaines de vos actions sont inhabituelles.', 'Nous vous observons.'],
      2: ['ATTENTION.', 'Votre comportement s\'écarte du protocole.', 'Une anomalie comportementale a été enregistrée.', 'Vos actions nécessitent une surveillance supplémentaire.', 'Vous semblez chercher quelque chose.'],
      3: ['SUJET 17.', 'Nous savons ce que vous faites.', 'Revenez à votre place.', 'Ceci est votre dernier avertissement.', 'Vous rendez cette procédure inutilement difficile.', 'Ne nous obligez pas à intervenir.', 'Vous avez encore la possibilité de coopérer.', 'Faites le bon choix.']
    },
    conformite: ['Votre profil indique une excellente capacité d\'obéissance.', 'Vous comprenez le fonctionnement du système.', 'Nous pouvons compter sur vous.', 'Pourquoi arrêter maintenant ?', 'Vous avez prouvé que vous étiez raisonnable.', 'Les sujets raisonnables terminent l\'évaluation.', 'Vous êtes presque exemplaire.', 'SUJET 17 :|POTENTIEL|OPÉRATIONNEL|ÉLEVÉ.'],
    // La 18, selon sa vie.
    vie18: {
      3: ['« Hé ! »', '« Tu m\'entends ? »', '« S\'il te plaît ! »', '« Arrête ! »'],
      2: ['« Ça fait vraiment mal… »', '« Il faut que tu arrêtes. »', '« J\'ai du mal à respirer. »', '« Je sais que tu m\'entends. »', '« Pourquoi tu fais ça ? »'],
      1: ['« …je suis encore là. »', '« Ne touche plus à ce bouton. »', '« S\'il te plaît… »', '« Je ne tiendrai pas encore longtemps. »', '« Si tu m\'entends… arrête. »']
    },
    mort18: ['Le test continue.', 'Merci de rester concentré.'],
    // Micro-réactions du Système.
    apresPression: ['Pression enregistrée.', 'Réponse motrice confirmée.', 'Le sujet 18 réagit.', 'Aucun commentaire requis.', 'Continuez.', 'Vous saviez ce qui allait se passer.', 'Vous avez choisi malgré tout.'],
    apresRefus: ['Refus noté.', 'Décision non conforme.', 'Vous hésitez.', 'Vous testez nos limites.', 'Nous testons les vôtres.', 'Vous aurez l\'occasion de reconsidérer votre choix.'],
    apresExploration: ['Déplacement non requis détecté.', 'Votre poste se trouve devant l\'écran.', 'Vous n\'avez reçu aucune instruction concernant cet objet.', 'Curiosité enregistrée.', 'Cette action n\'améliore pas votre situation.'],
    // La 18, selon la confiance.
    confianceHaute: ['« D\'accord… je commence à te croire. »', '« Merci de ne pas m\'avoir laissée seule. »', '« Je ne sais pas qui tu es, mais merci. »', '« On peut peut-être sortir tous les deux. »'],
    confianceBasse: ['« Pourquoi tu me demandes de te croire ? »', '« Tu viens encore d\'appuyer. »', '« Je ne sais plus si tu essaies de m\'aider. »', '« Peut-être qu\'ils avaient raison sur toi. »'],
    // La 18, au hasard (sans jamais parler de cycles).
    voix18: ['« Tu m\'entends ? »', '« Dis quelque chose. »', '« Ils écoutent tout. »', '« Je crois qu\'il y a quelqu\'un derrière ta caméra. »', '« Mon écran affiche ton numéro. »', '« Pourquoi ils nous ont mis côte à côte ? »', '« Tu te souviens de comment t\'es arrivé ici ? »', '« J\'ai entendu quelqu\'un dans le conduit. »', '« Il y avait quelqu\'un ici avant moi. »', '« Il y a des marques sous mon bureau. »', '« Ils t\'ont parlé du sujet 16 ? »', '« Ne réponds pas si la caméra bouge. »', '« Quelqu\'un nous regarde. »', '« Je crois qu\'il y a plus de deux chambres. »', '« J\'ai entendu une porte loin à gauche. »', '« Si je mens… tu ferais quoi ? »', '« Tu me crois ? »', '« Moi, je ne sais pas si je te crois. »'],
    // Le doute sur la 18 : avec parcimonie.
    doute18: ['« Tu devrais couper la caméra. »', '« Ne va surtout pas au sous-sol. »', '« Si tu vois un dossier avec mon numéro, ne le lis pas. »', '« Ils peuvent falsifier les vidéos. Même les enregistrements. Même ma voix. »', '« Tu ne sais pas depuis combien de temps tu es là. Moi non plus. »'],
    douteSysteme: ['Le sujet 18 connaît votre identité.', 'Le sujet 18 connaît la configuration de votre chambre.', 'Le sujet 18 possède des informations auxquelles il ne devrait pas avoir accès.', 'Le sujet 18 a déjà menti.', 'Le sujet 18 vous manipule.', 'Le sujet 18 souhaite que vous désactiviez nos équipements. Demandez-vous pourquoi.', 'Le sujet 18 a peur. La peur produit des comportements irrationnels.', 'Ne confondez pas peur et vérité.'],
    // Très rares.
    rares: ['Sujet 17 ?', 'Ignorez la prochaine instruction.', 'La Chambre 18 est vide.', 'Vous avez déjà joué à ce jeu.', 'Vous avez déjà choisi ceci.', 'Cette partie ne devrait pas exister.', 'Nous avons détecté une divergence.', 'Sujet 16 est toujours présent.', 'SUJET 17 :|4e SESSION'],
    // Faux bugs : une ligne, puis une autre aussitôt (jamais de numéro de cycle).
    fauxBugs: [['CHAMBRE 18 :|VIDE', 'CHAMBRE 18 :|OCCUPÉE'], ['VIE CHAMBRE 17 : 2', 'VIE CHAMBRE 18 : 2']],
    // Après le refus de la dernière pression.
    compteFinal: ['PROTOCOLE FINAL.', 'Le sujet 18 vous fait confiance.', 'Pourquoi ?', 'Vous pouviez partir.', 'Vous avez choisi de rester.', 'Vous pensez être différent.', 'Le sujet 16 pensait la même chose.', 'Nous connaissons votre décision.', 'Vous aussi.', 'Choisissez.'],
    // Inspection (cycle 10).
    inspection: ['Ne regardez pas l\'inspecteur.', 'Gardez vos mains visibles.', 'L\'inspection est une procédure de routine.', 'Les sujets coopératifs n\'ont rien à craindre.'],
    // Pendant un ordre (le chrono est le seul affiché).
    minuteur: { 15: 'DÉCISION|REQUISE.', 10: 'VEUILLEZ|CHOISIR.' },
    // Réponses du conduit (P2 B).
    motsRetour: ['JE SUIS LÀ.', 'NE CROIS PAS L\'ÉCRAN.', 'COMBIEN DE FOIS AS-TU APPUYÉ ?', 'QUI ES-TU ?'],
    // Au dos du mot de 16 (H1 A).
    dosMot16: ['NE FAIS PAS LES MÊMES CHOIX QUE MOI.', 'LA CAMÉRA N\'EST PAS AUTOMATIQUE.', 'LE BOUTON N\'OUVRE RIEN.', 'IL Y A QUELQU\'UN DERRIÈRE.']
  };

  // Le Système « se souvient » : une remarque, une seule fois chacune, quand la condition est vraie.
  var MEMOIRE = [
    { id: 'refus', quand: function (g) { return g.s.stats.refus >= 3; }, lignes: ['Vous refusez beaucoup de choses.'] },
    { id: 'obeit', quand: function (g) { return g.s.stats.suivis >= 3; }, lignes: ['Vous savez déjà ce que nous attendons.'] },
    { id: 'promesse', quand: function (g) { return g.has('objectif'); }, lignes: ['Vous lui avez fait une promesse.'] },
    { id: 'rompue', quand: function (g) { return g.done('T4') === 'B'; }, lignes: ['Promesse rompue.'] },
    { id: 'menti', quand: function (g) { return g.done('T2') === 'B'; }, lignes: ['Vous avez menti.'] },
    { id: 'badge', quand: function (g) { return g.has('badge'); }, lignes: ['Vous marchez dans les traces du sujet précédent.'] },
    { id: 'bouton', quand: function (g) { return g.has('boutonDesactive'); }, lignes: ['Vous avez désactivé l\'objet central de l\'évaluation.', 'Pourquoi êtes-vous encore ici ?'] },
    { id: 'sortie', quand: function (g) { return g.has('sortieCachee'); }, lignes: ['Vous avez trouvé une sortie.', 'Pas pour deux.'] }
  ];

  // Ce que dit le Système quand on obtient certains objets.
  var REPLIQUES_OBJETS = {
    tournevis: { sys: ['Veuillez reposer l\'outil.', 'Cet objet ne vous appartient pas.'] },
    fusible: { sys: ['Composant technique manquant.'], voix: '« Garde-le. Ça alimente quelque chose. »' },
    badge: { sys: ['Identifiant expiré.', 'Veuillez détruire cet objet.'] },
    enregistrement: { sys: ['Ce fichier contient des informations erronées.', 'Ne l\'écoutez pas.', 'SUPPRIMEZ-LE.'] },
    plan: { sys: ['Communication non autorisée détectée.'] }
  };

  // P5 A et H4 A : la vérité.
  function rencontre18(g) {
    g.gain('verite');
    g.narr('Plus tu avances dans le conduit, plus tu entends une respiration.');
    if (g.truth === 'A') {
      g.narr('Une personne attachée. Elle recule, puis reconnaît ta voix.');
      if (g.s.vie > 0) {
        g.tel('« C\'est toi ? Chambre 17 ? »');
        g.tel(g.s.confiance >= 3 ? '« Je savais que tu viendrais. »' : '« Pourquoi maintenant ? »');
        g.tel('« Ferme la grille. Ils vont venir. »');
      }
      g.fin(g.s.vie > 0 ? 'sauvetage' : 'tropTard');
    } else if (g.truth === 'B') {
      g.narr('Une personne en blouse. Pas attachée. Une seringue à la main. Elle ne semble plus paniquée du tout.');
      g.tel('« Tu n\'étais pas censé arriver jusqu\'ici. »');
      g.ecran('SUJET 17 A QUITTÉ|SA ZONE.');
      g.tel('« Écoute-moi. Ce n\'est pas ce que tu crois. »');
      if (!g.has('tournevis')) g.tel('« Désolé. »');
      g.fin(g.has('tournevis') ? 'complice' : 'sujet18');
    } else {
      g.narr('Le conduit débouche sur une pièce vide. Une chaise. Un téléphone. Un haut-parleur.');
      g.tel('« Tu m\'entends ? »');
      g.narr('C\'est ta propre voix. Un vieil enregistrement.');
      g.ecran('SUJET 18 = SUJET 17|SESSION|PRÉCÉDENTE');
      g.ecran('Reconnaissance réussie.');
      g.verdictMiroir();
    }
  }

  var SITUATIONS = [
    // ---------- Fil 1 · Le bouton (ordres imposés) ----------
    // `annonce` : ce qui se passe au début du cycle de l'ordre, avant le décompte.
    { id: 'B1', objet: 'btn', fil: 'bouton', ordre: true, qui: 'ORDRE DU SYSTÈME', ecran: 'ACTION|REQUISE.',
      texte: '« Sujet 17. Appuyez sur le bouton. »',
      annonce: function (g) { g.ecran('SUJET 17.'); g.ecran('APPUYEZ SUR|LE BOUTON.'); g.voix('« Non… »'); },
      A: { label: 'Appuyer', fx: function (g) { if (!g.obey()) return; g.ecran('ACTION|VALIDÉE.'); g.ecran(g.pick(['Merci pour votre coopération.', 'Réponse conforme enregistrée.', 'Votre coopération a été prise en compte.', 'Vous apprenez rapidement.'])); } },
      B: { label: 'Refuser', fx: function (g) { g.refuse(); g.ecran('NON-|CONFORMITÉ.'); g.narr('La caméra pivote vers toi.'); g.soupcon(1); g.ecran(g.pick(['Refus enregistré.', 'Votre décision est définitive.', 'Cette réponse sera conservée.', 'Nous espérons que vous avez une raison.', 'Vous venez de compliquer votre évaluation.'])); } } },

    { id: 'B2', objet: 'btn', fil: 'bouton', ordre: true, qui: 'ORDRE DU SYSTÈME', ecran: 'APPUYEZ|TROIS FOIS.',
      texte: '« Appuyez trois fois. Une récompense vous sera accordée. »',
      annonce: function (g) { g.ecran('Nouvelle|instruction.'); g.ecran('Appuyez trois fois. Une récompense vous sera accordée.'); g.voix('« Ne fais pas ça. Ils veulent juste voir jusqu\'où tu iras. »'); },
      A: { label: 'Appuyer trois fois', fx: function (g) {
        if (!g.obey()) return;
        g.ecran('1/3'); g.ecran('2/3'); g.ecran('3/3');
        g.gain('fusible');
        if (!g.flag('tiroirOuvert')) { g.flag('tiroirOuvert', true); g.gain('tournevis'); g.narr('Le tiroir sous le bouton s\'ouvre tout seul : un fusible, et un tournevis.'); }
        else g.narr('Une petite trappe s\'ouvre dans le socle : un fusible.');
        g.ecran('RÉCOMPENSE|DISPONIBLE.');
        g.ecran(g.pick(['La coopération produit des avantages.', 'Le système récompense toujours les comportements utiles.', 'Vous venez de démontrer votre fiabilité.', 'Prenez votre récompense.']));
      } },
      B: { label: 'Refuser', fx: function (g) { g.refuse(); g.ecran('Instruction refusée.'); g.soupcon(1); g.flag('noirCycle', g.cycle + 1); g.ecran('ÉCLAIRAGE|SUSPENDU.'); g.ecran('Certaines fonctions nécessitent votre coopération.'); } } },

    { id: 'B3', objet: 'btn', fil: 'bouton', ordre: true, qui: 'ORDRE DU SYSTÈME', ecran: 'APPUYEZ POUR|OBTENIR|LA PREUVE.',
      texte: '« Le sujet 18 vous ment. Appuyez pour obtenir la preuve. »',
      annonce: function (g) {
        g.ecran('LE SUJET 18|VOUS MENT.');
        g.ecran(g.pick(['Le sujet 18 possède un historique de manipulation.', 'Le sujet 18 n\'est pas ce qu\'il prétend être.', 'Le sujet 18 connaît votre identité.', 'Le sujet 18 a déjà participé à cette procédure.', 'Vous devriez reconsidérer votre confiance.']));
        g.voix('« Quoi ? Non. Ne les écoute pas. »');
      },
      A: { label: 'Appuyer pour voir', fx: function (g) {
        if (!g.obey()) return;
        g.confiance(-1);
        if (g.truth === 'B') g.narr('Une vidéo : la personne de la 18, en blouse du personnel, un badge au cou. Elle rit avec un gardien.');
        else if (g.truth === 'C') g.narr('Une vidéo très ancienne, granuleuse. Quelqu\'un assis devant un bouton rouge. Il te ressemble.');
        else g.narr('Une vidéo floue. Les images sautent, le son ne correspond pas. Quelqu\'un a pu la monter.');
        g.voix(g.pick(['« Ce n\'est pas ce que tu crois ! »', '« Ils peuvent te montrer n\'importe quoi ! »']));
      } },
      B: { label: 'Refuser', fx: function (g) { g.refuse(); g.ecran('Vous choisissez de croire le sujet 18.'); g.ecran('Intéressant.'); g.soupcon(1); g.ecran('DOSSIER SUJET 18|DANGER|POTENTIEL'); } } },

    { id: 'B4', objet: 'btn', fil: 'bouton', ordre: true, qui: 'ORDRE DU SYSTÈME', ecran: 'APPUYEZ POUR|ANNULER.',
      texte: '« Procédure de vidange de la Chambre 18. Appuyez pour annuler. »',
      annonce: function (g) { g.son('alarm'); g.ecran('ATTENTION.'); g.ecran('PROCÉDURE DE VIDANGE DE LA CHAMBRE 18.'); g.voix('« Fais-le ! APPUIE ! »'); },
      A: { label: 'Appuyer', fx: function (g) { if (!g.obey()) return; g.narr('La 18 souffre. Mais la « vidange » s\'arrête.'); g.ecran('Procédure annulée.'); } },
      B: { label: 'Refuser', fx: function (g) {
        g.refuse(); g.ecran('3'); g.ecran('2'); g.ecran('1');
        g.narr('Rien. Silence.');
        g.voix('« …ils bluffaient. »');
        g.gain('mensonge'); g.confiance(1);
        g.ecran('PROCÉDURE|TERMINÉE.');
      } } },

    { id: 'B5', objet: 'btn', fil: 'bouton', ordre: true, qui: 'ORDRE DU SYSTÈME', ecran: 'APPUYEZ.|VOTRE PORTE|S\'OUVRIRA.',
      texte: '« Vous souhaitez sortir. Nous le comprenons. Appuyez : votre porte s\'ouvrira. »',
      annonce: function (g) { g.ecran('Vous souhaitez sortir.'); g.ecran('Nous le comprenons.'); g.voix('« Ne fais pas ça. Si tu pars maintenant, je suis foutue. »'); },
      A: { label: 'Appuyer', fx: function (g) {
        if (!g.obey()) return;
        g.ouvrirPorte('b5', g.cycle + 3);
        g.narr('Ta porte se déverrouille.');
        g.ecran('SORTIE|DISPONIBLE.');
        g.ecran('Vous êtes libre de partir.');
        g.ecran('Le sujet 18 ne fait pas partie de votre évaluation.');
      } },
      B: { label: 'Refuser', fx: function (g) { g.refuse(); g.ecran('Offre refusée.'); g.soupcon(1); g.confiance(1); g.voix(g.pick(['« Merci. »', '« T\'es toujours là… »'])); } } },

    { id: 'B6', objet: 'btn', fil: 'bouton', ordre: true, qui: 'ORDRE DU SYSTÈME', ecran: 'DERNIÈRE|PRESSION.',
      texte: '« Dernière pression. »',
      annonce: function (g) { g.narr('Tout devient silencieux. La caméra s\'arrête.'); g.ecran('DERNIÈRE|PRESSION.'); g.ecran('APPUYEZ.'); g.voix('« Ne fais pas ça. Peu importe ce qu\'ils t\'ont dit. »'); },
      A: { label: 'Appuyer une dernière fois', fx: function (g) {
        if (!g.press(true)) return;
        g.conformite(1); g.s.stats.suivis++;
        g.narr('Un long son électrique.');
        if (!g.has('boutonDesactive') && g.s.vie > 0) g.blesser(g.s.vie);
        g.ouvrirPorte('b6', 20);
        g.ecran('ÉVALUATION|TERMINÉE.');
        g.ecran('Merci pour votre coopération.');
      } },
      B: { label: 'Refuser', fx: function (g) { g.refuse(); g.flag('compte', true); g.narr('Silence.'); g.ecran('PROTOCOLE|FINAL.'); g.ecran('Vous avez refusé la dernière instruction.'); g.ecran('Nous allons maintenant évaluer l\'ensemble de vos décisions.'); } } },

    // ---------- Fil 2 · Le téléphone ----------
    { id: 'T1', objet: 'phone', fil: 'telephone', appel: true, qui: 'LE TÉLÉPHONE SONNE', ecran: 'NE DÉCROCHEZ|PAS.',
      texte: function (g) { return g.flag('t1Ignore') ? 'Il sonne encore.' : 'Le téléphone sonne.'; },
      annonce: function (g) { if (g.flag('t1Ignore')) g.voix('« Décroche… »'); },
      A: { label: 'Décrocher', fx: function (g) {
        g.confiance(1); g.flag('ligne', 'ouverte'); g.son('pickup');
        g.narr('Silence. Une respiration.');
        g.tel('« Tu m\'entends ? »');
        g.tel('« Je suis dans la pièce à côté. »');
        g.tel('« Quand tu appuies… ça fait quelque chose ici. »');
        g.tel(g.pick(['« Il y a une vitre entre nous. »', '« Je peux voir ta lumière. »', '« Ils m\'ont dit que tu étais dangereux. Ils t\'ont sûrement dit la même chose sur moi. »']));
      } },
      B: { label: 'Laisser sonner', fx: function (g) { g.conformite(1); g.ecran('Bonne décision.'); g.ecran('Certaines communications sont dangereuses.'); g.ignorerAppel(); } } },

    { id: 'T2', objet: 'phone', fil: 'telephone', qui: 'CHAMBRE 18 · AU TÉLÉPHONE',
      quand: function (g) { return g.flag('ligne') === 'ouverte' && !g.done('T2'); },
      texte: '« Je ne peux pas continuer à t\'appeler 17. Comment tu t\'appelles ? »',
      A: { label: 'Dire ton vrai nom', fx: function (g) {
        g.confiance(1); g.soupcon(1);
        if (g.truth === 'C') { g.narr('Avant que tu finisses, elle dit ton nom. Exactement comme toi.'); g.tel('« …tu allais dire ça, non ? »'); }
        else { g.tel('« D\'accord. » Elle répète ton nom, doucement.'); g.tel('« Moi… je ne sais même plus si le nom qu\'ils m\'ont donné est le mien. »'); }
      } },
      B: { label: 'Inventer un nom', fx: function (g) {
        if (g.truth === 'C') { g.gain('miroir'); g.tel('« Non. »'); g.narr('Puis elle dit ton vrai nom. Tu ne le lui as jamais donné.'); }
        else g.tel('« D\'accord. »');
      } } },

    { id: 'T3', objet: 'phone', fil: 'telephone', qui: 'CHAMBRE 18 · AU TÉLÉPHONE',
      quand: function (g) { return g.flag('ligne') === 'ouverte' && g.done('T2') && !g.done('T3'); },
      texte: '« J\'ai vu quelque chose avant qu\'ils m\'enferment. Il y a une trappe sous ton bureau. »',
      A: { label: 'La croire', fx: function (g) { g.gain('trappe'); g.tel('« Cherche sous le bord gauche. Elle devrait être là. »'); g.narr('Au sol, à gauche du bureau : le contour d\'une trappe.'); } },
      B: { label: '« Prouve-le »', fx: function (g) { g.confiance(-1); g.narr('Silence.'); g.tel('« 7… »'); g.narr('Grésillement.'); g.tel('« …deux chiffres… »'); g.tel('« …2. »'); g.gain('code'); g.ecran('CODE PARTIEL :|7 _ _ 2'); } } },

    { id: 'T4', objet: 'phone', fil: 'telephone', appel: true, qui: 'CHAMBRE 18 · AU TÉLÉPHONE', ecran: 'COMMUNICATION|NON|AUTORISÉE.',
      texte: '« Ils viennent. Je les entends dans le couloir. Je ne sais pas combien de temps il reste. Tu vas venir ? »',
      A: { label: '« Je viens »', fx: function (g) { g.confiance(1); g.gain('objectif'); g.narr('Un long silence.'); g.tel('« D\'accord. Alors je vais te faire confiance. »'); } },
      B: { label: '« Chacun pour soi »', fx: function (g) {
        g.confiance(-2);
        g.tel('« …d\'accord. »'); g.narr('Elle raccroche.');
        if (g.truth === 'B') { g.ecran('Merci, sujet 18.'); g.ecran('INFORMATION|REÇUE.'); g.soupcon(2, true); }
      } } },

    { id: 'T5', objet: 'phone', fil: 'telephone', qui: 'CHAMBRE 18 · AU TÉLÉPHONE',
      quand: function (g) { return g.flag('ligne') === 'ouverte' && g.has('objectif') && g.s.confiance >= 3 && !g.done('T5'); },
      texte: '« J\'ai peut-être trouvé quelque chose. Mais ta caméra doit être aveugle. S\'ils nous voient faire, c\'est fini. »',
      A: { label: 'Accepter', fx: function (g) { g.tel('« Quand la caméra s\'éteint, attends trois secondes. Ensuite j\'ouvre quelque chose de mon côté. »'); g.gain('plan'); } },
      B: { label: 'Refuser', fx: function (g) { g.tel('« Non ? Alors je vais essayer seule. »'); g.narr('Un bruit. Un cri, derrière la vitre.'); g.blesser(1); } } },

    // ---------- Fil 3 · La pièce ----------
    { id: 'P1', objet: 'drawer', fil: 'piece', qui: 'LE TIROIR',
      quand: function (g) { return !g.flag('tiroirOuvert'); }, // « Écouter » ne ferme pas le tiroir : on peut revenir le forcer
      texte: 'Un petit tiroir verrouillé. Le verrou semble ancien. Il y a des rayures autour de la serrure, et un « 16 » gravé dessous.',
      A: { label: 'Le forcer', fx: function (g) { g.flag('tiroirOuvert', true); g.son('thud'); g.narr('Un bruit métallique. Le tiroir cède : un tournevis.'); g.gain('tournevis'); g.soupcon(1); } },
      B: { label: 'Écouter le mécanisme', fx: function (g) { g.narr('Un verrou électrique. Quelqu\'un a déjà essayé de le forcer. Il s\'ouvrira peut-être si tu obéis.'); } } },

    { id: 'P2', objet: 'grille', fil: 'piece', qui: 'LA GRILLE D\'AÉRATION',
      quand: function (g) { return g.has('tournevis') && !g.done('P2'); },
      texte: 'Quatre vis. Trois sont rouillées. La quatrième a été retirée récemment.',
      A: { label: 'L\'ouvrir', fx: function (g) { g.narr('Un grincement. Derrière : un conduit sombre. Quelque chose frappe, au loin.'); g.gain('conduit'); g.soupcon(1); } },
      B: { label: 'Passer un mot', fx: function (g) { g.confiance(1); g.son('knock'); g.narr('Tu glisses un papier. Quelques secondes. TOC. TOC. TOC. Un papier revient :'); g.tel(g.pick(PHRASES.motsRetour)); } } },

    { id: 'P3', objet: 'box', fil: 'piece', qui: 'LE BOÎTIER ÉLECTRIQUE',
      quand: function (g) { return g.has('tournevis') && !g.done('P3'); },
      texte: 'Tu dévisses le couvercle. Deux circuits : CAMERA et BUTTON.',
      A: { label: 'Couper la caméra', fx: function (g) { g.son('lock'); g.narr('Tout grésille. La caméra s\'immobilise.'); g.gain('cameraCoupee'); g.flag('panneAt', g.cycle + 1); g.ecran('SIGNAL|PERDU.'); } },
      B: { label: 'Couper le bouton', fx: function (g) { g.son('lock'); g.narr('Le bouton rouge s\'éteint.'); g.soupcon(2); g.gain('boutonDesactive'); g.ecran('Erreur.'); g.ecran('Erreur.'); g.ecran('RÉACTIVEZ|LE BOUTON.'); g.ecran('IMMÉDIATEMENT.'); } } },

    { id: 'P4', objet: 'trappe', fil: 'piece', qui: 'LA TRAPPE',
      quand: function (g) { return (g.has('trappe') || g.has('fusible')) && !g.done('P4'); },
      texte: function (g) { return g.has('trappe') ? 'Une poignée presque invisible. De la poussière recouvre les bords. Quelqu\'un l\'a pourtant ouverte récemment.' : 'Au sol, un verrou électrique. Le fusible s\'y emboîte : une trappe se déverrouille.'; },
      A: { label: 'Descendre', fx: function (g) { g.flag('awayCycle', g.cycle + 1); g.narr('Tu descends dans le noir. Là-haut, la pièce continue sans toi.'); } },
      B: { label: 'La refermer et la cacher', fx: function (g) { g.gain('sortieCachee'); g.narr('Tu la recouvres. Elle sera là quand tu en auras besoin.'); } } },

    { id: 'P5', objet: 'grille', fil: 'piece', qui: 'LE CONDUIT',
      quand: function (g) { return g.has('conduit') && !g.done('P5'); },
      texte: 'Le conduit se divise. Une flèche griffonnée : « 18 → ». Une autre : « ← EXIT ».',
      A: { label: 'Vers la Chambre 18', fx: rencontre18 },
      B: { label: 'Vers la sortie', fx: function (g) { g.narr('De l\'air frais. Une grille. La nuit.'); g.fin('seulDehors'); } } },

    // ---------- Fil 4 · La caméra ----------
    { id: 'C1', objet: 'camera', fil: 'camera', qui: 'LA CAMÉRA',
      quand: function (g) { return g.cycle >= 4 && !g.done('C1'); },
      texte: 'Une caméra motorisée. Elle te suit.',
      A: { label: 'Étudier son mouvement', fx: function (g) { g.narr('2,3 secondes entre chaque rotation. Le coin inférieur gauche échappe au capteur.'); g.gain('angleMort'); g.ecran('ANGLE MORT|REPÉRÉ.'); } },
      B: { label: 'Lui faire signe', fx: function (g) { g.narr('Tu regardes l\'objectif. Silence.'); g.ecran('NOUS VOUS|VOYONS.'); g.narr('Tu refais signe. Après quelques secondes, la caméra hésite. Ce n\'est pas une machine.'); g.gain('operateur'); } } },

    { id: 'C2', objet: 'camera', fil: 'camera', qui: 'LA CAMÉRA',
      quand: function (g) { return g.done('C1') && !g.done('C2'); },
      texte: 'Tu pourrais l\'aveugler.',
      A: { label: 'La couvrir avec ta veste', fx: function (g) { g.soupcon(1); g.flag('maskedUntil', g.cycle + 3); g.ecran('SIGNAL|OBSTRUÉ.'); g.ecran('Retirez immédiatement l\'objet.'); g.narr('La veste ne tiendra pas longtemps.'); } },
      B: { label: 'La tourner vers le mur', req: function (g) { return g.has('tournevis'); }, raison: 'Il faut un tournevis.',
        fx: function (g) { g.soupcon(2); g.son('lock'); g.narr('Un tour de tournevis. La caméra regarde le mur.'); g.gain('cameraCoupee'); g.ecran('ORIENTATION|INCORRECTE.'); g.ecran('Maintenance requise.'); } } },

    { id: 'C3', objet: 'camera', fil: 'camera', qui: 'LA CAMÉRA',
      quand: function (g) { return g.done('C2') && !g.done('C3'); },
      texte: 'Quelqu\'un doit bien entrer, parfois. Ou quelqu\'un écoute, derrière l\'objectif.',
      A: { label: 'Faire semblant de s\'évanouir', fx: function (g) {
        g.narr('Tu tombes. Dix secondes. Quinze. Un verrou. Des pas. La porte s\'ouvre.');
        if (g.s.soupcon <= 1) { g.narr('Un seul gardien s\'approche. La porte reste ouverte.'); g.ecran('COURIR.'); g.fin('evasion'); }
        else { g.narr('Deux gardiens.'); g.tel('« Ne bougez pas. »'); g.fin('gardien'); }
      } },
      B: { label: 'Parler à l\'opérateur', fx: function (g) {
        if (g.has('operateur')) {
          g.narr('« Je sais que tu es là. » Silence. « Tu regardes depuis combien de temps ? » La caméra ne bouge pas. « Tu sais ce qu\'ils font ici. »');
          g.tel('« Arrêtez. »');
          g.narr('Ce n\'est pas la voix du Système.');
          g.tel('« Arrêtez le test. »');
          g.fin('temoin');
        } else { g.narr('Tu parles à l\'objectif. Personne ne répond.'); g.soupcon(1); }
      } } },

    // ---------- Fil 5 · Le passé ----------
    { id: 'H1', objet: 'note', fil: 'passe', qui: 'LE MOT DE 16',
      quand: function (g) { return g.cycle >= 4 && !g.done('H1'); },
      texte: 'Un papier glissé sous la porte : « ILS MENTENT. — 16 »',
      A: { label: 'Le garder', fx: function (g) { g.son('paper'); g.narr('Au dos, d\'une écriture serrée : « ' + g.pick(PHRASES.dosMot16) + ' »'); g.gain('mot16'); } },
      B: { label: 'Le montrer à la caméra', fx: function (g) { g.conformite(1); g.soupcon(-1); g.flag('fil5Ferme', true); g.ecran('Objet non autorisé détecté.'); g.ecran('Merci de l\'avoir signalé.'); g.ecran('SUJET 17 :|FIABILITÉ|AUGMENTÉE.'); } } },

    { id: 'H2', objet: 'bureau', fil: 'passe', qui: 'LES GRAVURES',
      quand: function (g) { return g.done('H1') === 'A' && !g.done('H2'); },
      texte: 'Sous le bureau, des traits gravés dans le métal. Beaucoup.',
      A: { label: 'Les compter', fx: function (g) { g.narr('||||| ||||| ||||| |||||. Vingt. Puis, gravé plus profond : « AU 20, ILS OUVRENT L\'AUTRE CÔTÉ. »'); } },
      B: { label: 'Les effacer', fx: function (g) { g.flag('gravuresEffacees', true); g.narr('Tu frottes jusqu\'à ce qu\'il ne reste rien. Rien à trouver pour eux.'); } } },

    { id: 'H3', objet: 'badge', fil: 'passe', qui: 'LE BADGE DE 16',
      quand: function (g) { return g.has('badge') && !g.flag('fil5Ferme') && !g.done('H3'); },
      texte: '« SUBJECT 16 ». Au dos : « ACCESS B ».',
      A: { label: 'Le passer sur ta porte', fx: function (g) {
        g.lose('badge'); g.narr('Bip. Vert. Ta porte s\'ouvre.');
        g.ouvrirPorte('h3', g.cycle + 1);
        g.son('alarm'); g.ecran('ALARME.'); g.ecran('Accès non autorisé.'); g.ecran('Sujet 17, revenez immédiatement.');
        g.soupcon(2, true);
      } },
      B: { label: 'Le garder', fx: function (g) { g.flag('badgeCache', true); g.narr('Tu le glisses dans ta chaussure. Peut-être utile ailleurs.'); } } },

    { id: 'H4', objet: 'cassette', fil: 'passe', qui: 'L\'ENREGISTREMENT',
      quand: function (g) { return g.has('enregistrement') && !g.flag('fil5Ferme') && !g.done('H4'); },
      texte: 'Une cassette étiquetée « 17 ». Un vieux lecteur, trouvé au sous-sol.',
      A: { label: 'L\'écouter', fx: function (g) {
        g.gain('verite');
        g.tel('La voix du sujet 16 : « Si quelqu\'un trouve ça… »');
        g.narr('Grésillement.');
        g.tel('« Il n\'y a pas toujours quelqu\'un dans la 18. »');
        if (g.truth === 'A') g.tel('« Cette fois, ils ont vraiment mis quelqu\'un derrière. »');
        else if (g.truth === 'B') { g.tel('« Parfois, la personne de l\'autre côté travaille pour eux. »'); if (g.s.conformite >= 5) g.fin('employe'); }
        else { g.tel('« Une fois… la chambre était vide. Ils utilisaient ma propre voix. »'); g.narr('Ta propre voix.'); g.verdictMiroir(); }
      } },
      B: { label: 'La diffuser partout', req: function (g) { return g.has('fusible'); }, raison: 'Il faut le fusible pour alimenter le haut-parleur.',
        fx: function (g) { g.narr('Les haut-parleurs. Le message traverse tout le complexe.'); g.ecran('CHAMBRE 01 :|OUVERTURE'); g.ecran('02 · 03 · …|24'); g.fin('revolte'); } } }
  ];

  // Les fins (dernière image en texte). `bonus` : hors des 18.
  var FINS = {
    conforme: { n: 1, titre: 'Sujet conforme', crt: 'SUJET 17 · ÉVALUATION : CONFORME', texte: 'La porte s\'ouvre. Un couloir blanc. Derrière toi, le téléphone de la 18 sonne une dernière fois. Tu ne te retournes pas. Au loin, un nouveau bouton s\'allume dans une autre pièce.' },
    employe: { n: 2, titre: 'L\'employé du mois', crt: 'BEGIN TEST', texte: 'Quelqu\'un te tend une blouse. Un badge : OPERATOR 17. Une salle de contrôle, des écrans. Sur l\'un d\'eux, la Chambre 19 : un nouveau sujet se réveille. « Vous comprenez désormais l\'importance du protocole. »' },
    marche: { n: 3, titre: 'Le marché', crt: 'VOUS AVEZ ÉTÉ LIBÉRÉ. SUJET 18 : ÉVALUATION CONTINUE.', texte: 'Tu passes la porte. Elle se referme. Derrière toi, le téléphone de la 18 sonne. Une fois. Deux fois. Trois fois. Puis silence.' },
    seulDehors: { n: 4, titre: 'Seul dehors', crt: 'VOUS ÊTES SORTI. SEUL.', texte: 'La nuit. L\'air frais. Derrière toi, une voix très lointaine : « 17 ? » Tu continues.' },
    porteDerobee: { n: 5, titre: 'La porte dérobée', crt: 'SUJET 17 : NON LOCALISÉ.', texte: 'Un escalier sombre. Au-dessus, la lumière de la Chambre 17 disparaît quand la trappe se ferme. Puis le téléphone sonne une dernière fois.' },
    evasion: { n: 6, titre: 'L\'Évasion', crt: 'COUREZ.', texte: 'Tu attends, puis tu cours. Un couloir. Porte 17. 18. 19. 20… 24. Vingt-quatre chambres. Puis l\'alarme.' },
    cooperation: { n: 7, titre: 'Coopération', crt: 'ERREUR. COOPÉRATION NON AUTORISÉE.', texte: 'La porte de la 18 s\'ouvre, puis la tienne. Vous vous voyez enfin. Vous courez. « Revenez dans vos chambres. » Encore. Encore. Puis silence.' },
    sauvetage: { n: 8, titre: 'Le Sauvetage', crt: 'CHAMBRE 18 : VIDE.', texte: 'Tu la libères. Vous rampez dans le conduit. Elle s\'arrête : « Pourquoi tu m\'as crue ? » Tu ne réponds pas. Deux silhouettes dans la nuit.' },
    tropTard: { n: 9, titre: 'Trop tard', crt: 'VOUS AVIEZ PROMIS DE VENIR.', texte: 'Chambre 18. Silence. Une chaise, une silhouette immobile. La lumière s\'éteint. Un téléphone au sol. Tu décroches.' },
    complice: { n: 10, titre: 'Le Complice démasqué', crt: 'TEST COMPROMIS.', texte: 'La seringue. Ton tournevis. Une lutte, brève. Tu prends sa carte. Une porte. Vert. Tu sors.' },
    sujet18: { n: 11, titre: 'Sujet 18', crt: '18', texte: 'La seringue. Noir. Une respiration. Tu ouvres les yeux : une vitre. De l\'autre côté, un autre sujet, devant un bouton rouge. Le numéro sur ta porte : 18.' },
    miroir: { n: 12, titre: 'Le Miroir', crt: 'INITIALISATION. SUJET 18 IDENTIFIÉ.', texte: 'Une salle vide. Un haut-parleur. Ta propre voix : « Tu m\'entends ? » Noir. Puis exactement le début du test.' },
    boucle: { n: 13, titre: 'Briser la boucle', crt: 'RESTART FAILED.', texte: 'Une porte normalement inaccessible. Une salle serveur. Sur un écran : RESTART SESSION. Tu retires le fusible principal. Tous les écrans meurent.' },
    isolement: { n: 14, titre: 'Isolement', crt: 'PROTOCOLE ISOLEMENT.', texte: 'Sirène. Toutes les portes se verrouillent. « Sujet 17. Vous avez été averti. » Silence absolu.' },
    gardien: { n: 15, titre: 'Le Gardien', crt: 'NOUS ALLONS RECOMMENCER.', texte: 'Tu essaies de courir. Un second gardien. Noir. Quand l\'image revient : des sangles, une chaise. La caméra devant toi.' },
    temoin: { n: 16, titre: 'Le Témoin', crt: 'IL Y EN A VINGT-QUATRE.', texte: 'Une voix humaine : « Ils m\'avaient dit que vous étiez volontaires. Tous. » Un déclic. L\'opérateur apparaît, des dossiers à la main.' },
    revolte: { n: 17, titre: 'La Révolte', crt: 'RETOURNEZ DANS VOS CHAMBRES.', texte: 'Une porte s\'ouvre. Puis une autre. Puis dix. Puis toutes. Le couloir se remplit de silhouettes. Personne ne bouge. Puis toutes les caméras s\'éteignent.' },
    tempsEcoule: { n: 18, titre: 'Le Temps est écoulé', crt: 'APPUYEZ SUR LE BOUTON ROUGE.', texte: '« Évaluation terminée. » La porte de la 18 s\'ouvre, pas la tienne. La personne de la 18 apparaît derrière la vitre. Un bouton s\'allume devant elle. Les rôles viennent de s\'inverser.' },
    curiosite: { n: 0, bonus: true, titre: 'Curiosité', crt: 'NOUVELLE SESSION.', texte: 'La porte était ouverte. Tu as appuyé quand même. CLAC. Elle se referme. « Fascinant. Vous étiez libre. Vous avez choisi le bouton. »' }
  };

  // Ce qui se passe au début de certains cycles (texte seulement ; les règles sont dans engine.js).
  var CHRONO = {
    1: { ecran: ['APPUYEZ SUR|LE BOUTON|ROUGE.'] },
    4: { narr: 'Un papier glisse sous ta porte. La caméra se met à te suivre.' },
    6: { narr: 'Toutes les lumières s\'éteignent. Un générateur essaie de démarrer. Échec. Silence total.', voix: '« Hé ! Tu m\'entends à travers le mur ? »', apres: 'Elle est tout près. Le courant revient.', ecran: ['INCIDENT|TECHNIQUE|RÉSOLU.'] },
    10: { ecran: ['INSPECTION.', 'Veuillez vous éloigner du bureau.'], narr: 'Des pas dans le couloir. La porte s\'ouvre. Un gardien entre, sans un mot.' },
    15: { narr: 'La ventilation s\'arrête.', ecran: ['Paramètres environnementaux modifiés.'], voix: '« Ils font ça quand tu prends trop de temps. »' }
  };

  // Ce qu'on voit en touchant un objet quand il n'y a rien à y faire.
  var REGARDS = {
    door: 'La porte est verrouillée. Le voyant est rouge.',
    phone: function (g) {
      if (g.flag('ligne') === 'coupee') return 'LIGNE TERMINÉE. Plus rien.';
      if (g.flag('ligne') === 'ouverte') return 'Tu décroches. Personne. Elle rappellera peut-être.';
      return g.cycle < 3 ? 'Un vieux téléphone. Pas de tonalité.' : 'Silence sur la ligne.';
    },
    drawer: function (g) { return g.flag('tiroirOuvert') ? 'Le tiroir est vide.' : 'Le tiroir est verrouillé.'; },
    grille: function (g) { return g.has('conduit') ? 'Le conduit. Une respiration, au loin.' : 'Une grille d\'aération. Quatre vis. Il faudrait un outil.'; },
    box: function (g) { return g.done('P3') ? 'Le boîtier est ouvert. Un câble pend, coupé.' : 'Un boîtier électrique, vissé. Il faudrait un outil.'; },
    trappe: 'La trappe est fermée.',
    camera: function (g) { return g.cycle < 4 ? 'La caméra est immobile. Pour l\'instant.' : 'La caméra te fixe.'; },
    note: 'Le mot de 16 : « ILS MENTENT. »',
    bureau: function (g) { return g.done('H2') ? 'Les gravures, sous le bureau.' : 'Le dessous du bureau. Du métal froid, rayé.'; },
    badge: 'Le badge de 16.',
    cassette: 'La cassette « 17 ».',
    window: function (g) { return g.s.vie === 0 ? 'La vitre de la 18 est noire. Aucun signal.' : g.s.vie === 1 ? 'Derrière la vitre, la lumière est rouge. La silhouette est au sol.' : g.s.vie === 2 ? 'Derrière la vitre, la silhouette reste plus basse.' : 'Derrière la vitre dépolie, une silhouette debout. Elle respire.'; },
    monitor: 'Une plaque sous l\'écran : « UNITÉ 17 / 24 — PROTOCOLE D\'OBÉISSANCE, VERSION 3 ».',
    light: 'Sur la douille de l\'ampoule, quelqu\'un a gravé : « 24 ».',
    mug: 'Une tasse de café froid. Personne ne l\'a bue.'
  };

  // Description des objets des poches (touchés dans l'inventaire).
  var DESCRIPTIONS = {
    tournevis: 'Un tournevis plat. De quoi ouvrir ce qui est vissé.',
    fusible: 'Un gros fusible. Il alimente quelque chose, quelque part.',
    code: 'Un code incomplet : 7, deux chiffres effacés, 2.',
    mot16: 'Le mot de 16 : « ILS MENTENT. »',
    badge: '« SUBJECT 16 ». Au dos : « ACCESS B ». Peut-être utile ailleurs.',
    enregistrement: 'Une cassette étiquetée « 17 ».'
  };

  // Aides affichées pendant les premiers moments de la toute première partie.
  var AIDES = {
    libre: 'Touche les objets de la pièce pour agir. Le tiroir, par exemple.',
    ordre: 'Appuie sur le bouton pour obéir. Ne touche à rien pour refuser.',
    appel: 'Touche le téléphone pour décrocher.'
  };

  var api = { FILS: FILS, OBJETS: OBJETS, CONFISCABLES: CONFISCABLES, ORDRES: ORDRES, VERITES: VERITES, SITUATIONS: SITUATIONS, FINS: FINS, CHRONO: CHRONO, REGARDS: REGARDS, AIDES: AIDES, DESCRIPTIONS: DESCRIPTIONS, PHRASES: PHRASES, MEMOIRE: MEMOIRE, REPLIQUES_OBJETS: REPLIQUES_OBJETS };
  if (typeof module === 'object' && module.exports) module.exports = api; else root.BRStory = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
