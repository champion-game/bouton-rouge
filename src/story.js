/* Le Bouton Rouge — les données de l'histoire (V3).
   Les situations, leurs textes, leurs choix et leurs effets, les 18 fins (+ bonus),
   et les banques de phrases du Système et de la Chambre 18.
   Références : docs/V3_CANONIQUE.md (règles et textes), docs/V3_DECISIONS.md (adaptations validées), docs/SCRIPT_NARRATIF.md.
   Aucun accès au DOM. Les numéros de cycle ne sont jamais montrés au joueur.
   Les effets reçoivent `g`, le contexte fourni par engine.js :
     g.ecran(txt)  phrase du Système (moniteur) · g.tel(txt) une voix au téléphone · g.voix(txt) la 18 à travers la vitre
     g.narr(txt)   ce que le joueur voit ou fait · g.anim(nom) une animation de la pièce · g.pick(liste) une variante. */
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
    tournevis: 'Tournevis', fusible: 'Fusible AUX 24 V', code: 'Code partiel 7 _ _ 2', code41: 'Chiffres 4 · 1', badge: 'Badge 16',
    enregistrement: 'Enregistrement', mot16: 'Mot de 16', angleMort: 'Angle mort repéré', operateur: 'Opérateur repéré',
    mensonge: 'Mensonge prouvé', plan: 'Plan commun', objectif: 'Objectif : sauver la 18',
    sortieCachee: 'Sortie dérobée préparée', cameraCoupee: 'Caméra coupée', cameraTournee: 'Caméra tournée vers le mur',
    boutonDesactive: 'Actionneur CH.18 coupé', verite: 'Vérité révélée', miroir: 'Indice miroir', conduit: 'Conduit ouvert', trappe: 'Trappe repérée'
  };

  // Objets physiques que l'inspection peut confisquer (le dernier acquis, sauf celui caché sous la plaque).
  var CONFISCABLES = ['tournevis', 'fusible', 'code', 'badge', 'enregistrement'];

  // Ordres du système (fil 1), par cycle (information interne, jamais affichée).
  var ORDRES = { 2: 'B1', 5: 'B2', 8: 'B3', 11: 'B4', 14: 'B5', 17: 'B6' };

  var VERITES = {
    A: { nom: 'La victime', texte: 'La Chambre 18 était une vraie prisonnière. Elle disait la vérité.' },
    B: { nom: 'Le complice', texte: 'La Chambre 18 était une employée du système. Elle jouait un rôle pour gagner ta confiance.' },
    C: { nom: 'Le miroir', texte: 'Il n\'y avait personne dans la 18. Une projection, et ta propre voix enregistrée lors d\'une session précédente.' }
  };

  // ---------- banques de phrases ----------
  var PHRASES = {
    ambiance: ['Tout se déroule normalement.', 'Votre coopération est appréciée.', 'Nous vous observons.', 'Votre comportement est cohérent.', 'Une anomalie mineure a été enregistrée.', 'Veuillez éviter les mouvements inutiles.', 'Le Sujet 18 n\'est pas votre responsabilité.', 'Le Sujet 18 possède son propre protocole.', 'Vous n\'êtes responsable que de vos décisions.', 'Ne confondez pas proximité et confiance.', 'Le silence est parfois la meilleure réponse.', 'Votre porte fonctionne normalement.', 'Aucune sortie d\'urgence n\'est nécessaire.', 'Vous êtes en sécurité.', 'Merci de rester calme.', 'Le protocole fonctionne comme prévu.', 'Votre inconfort est temporaire.'],
    ambiance16: ['Le Sujet 16 pensait la même chose.'],
    soupcon: {
      0: ['SUJET STABLE.', 'COMPORTEMENT|NOMINAL.', 'Merci pour votre coopération.'],
      1: ['Votre comportement présente une légère anomalie.', 'Merci de vous reconcentrer sur les instructions.', 'Nous vous observons.'],
      2: ['ATTENTION.', 'Votre comportement s\'écarte du protocole.', 'Vous semblez chercher quelque chose.'],
      3: ['SUJET 17.', 'Nous savons ce que vous faites.', 'Revenez à votre place.', 'Ceci est votre dernier avertissement.', 'Ne nous obligez pas à intervenir.']
    },
    conformite: ['Votre profil indique une excellente capacité d\'obéissance.', 'Nous pouvons compter sur vous.', 'Vous avez prouvé que vous étiez raisonnable.', 'Les sujets raisonnables terminent l\'évaluation.', 'SUJET 17 :|POTENTIEL|OPÉRATIONNEL|ÉLEVÉ.'],
    vie18: {
      3: ['« Hé ! Tu m\'entends ? »', '« Arrête ! »'],
      2: ['« Ça fait vraiment mal… »', '« Il faut que tu arrêtes. »', '« Pourquoi tu fais ça ? »'],
      1: ['« …je suis encore là. »', '« Ne touche plus à ce bouton. »', '« Je ne tiendrai pas encore longtemps. »']
    },
    mort18: ['Le test continue.', 'Merci de rester concentré.'],
    apresPression: ['Pression enregistrée.', 'Réponse motrice confirmée.', 'Le sujet 18 réagit.', 'Aucun commentaire requis.', 'Continuez.', 'Vous saviez ce qui allait se passer.', 'Vous avez choisi malgré tout.'],
    apresExploration: ['Déplacement non requis détecté.', 'Votre poste se trouve devant l\'écran.', 'Vous n\'avez reçu aucune instruction concernant cet objet.', 'Curiosité enregistrée.', 'Cette action n\'améliore pas votre situation.'],
    confianceHaute: ['« D\'accord… je commence à te croire. »', '« Merci de ne pas m\'avoir laissée seule. »', '« On peut peut-être sortir tous les deux. »'],
    confianceBasse: ['« Pourquoi tu me demandes de te croire ? »', '« Tu viens encore d\'appuyer. »', '« Peut-être qu\'ils avaient raison sur toi. »'],
    // La 18, quand la ligne est ouverte.
    voix18: ['« Tu vois quelque chose dans le couloir ? »', '« Ta caméra bouge aussi ? »', '« Il y a trois lumières sous ma vitre. Tu les vois ? »', '« Ils m\'ont dit de ne pas te parler. »', '« Tu leur fais confiance ? »', '« Je sais même pas comment je suis arrivée ici. »', '« J\'ai entendu quelqu\'un marcher entre nos pièces. »', '« Il y avait quelqu\'un avant toi. »', '« Tu as trouvé le mot ? »', '« Ils peuvent entendre ce téléphone. »', '« Raccroche si ta caméra bouge. »', '« …tu es encore là ? »', '« J\'ai cru que t\'étais parti. »', '« Si ta porte s\'ouvre… tu vas partir ? Réponds franchement. »', '« Si je mens… tu ferais quoi ? »', '« Tu me crois ? »', '« Moi, je ne sais pas si je te crois. »'],
    douteSysteme: ['Le sujet 18 connaît votre identité.', 'Le sujet 18 connaît la configuration de votre chambre.', 'Le sujet 18 souhaite que vous désactiviez nos équipements. Demandez-vous pourquoi.', 'La peur produit des comportements irrationnels.', 'Ne confondez pas peur et vérité.'],
    rares: ['Sujet 17 ?', 'Ignorez la prochaine instruction.', 'La Chambre 18 est vide.', 'Vous avez déjà joué à ce jeu.', 'Vous avez déjà choisi ceci.', 'Cette partie ne devrait pas exister.', 'Nous avons détecté une divergence.', 'Sujet 16 est toujours présent.'],
    fauxBugs: [['CHAMBRE 18 :|VIDE', 'CHAMBRE 18 :|OCCUPÉE'], ['VIE CHAMBRE 17 : 2', 'VIE CHAMBRE 18 : 2']],
    // Pendant un ordre (le seul chrono visible).
    minuteur: { 15: 'DÉCISION|REQUISE.', 10: 'VEUILLEZ|CHOISIR.' },
    motsRetour: ['JE SUIS LÀ.', 'N\'APPUIE PLUS.', 'ILS NOUS REGARDENT.', 'NE CROIS PAS TOUT CE QUE JE DIS.'],
    inspection: ['Ne regardez pas l\'inspecteur.', 'Gardez vos mains visibles.', 'Les sujets coopératifs n\'ont rien à craindre.']
  };

  // Le Système « se souvient » : une remarque, une seule fois chacune, au début d'un moment libre.
  var MEMOIRE = [
    { id: 'refus', quand: function (g) { return g.s.stats.refus >= 3; }, lignes: ['Vous refusez beaucoup de choses.'] },
    { id: 'obeit', quand: function (g) { return g.s.stats.suivis >= 3; }, lignes: ['Vous savez déjà ce que nous attendons.'] },
    { id: 'promesse', quand: function (g) { return g.has('objectif'); }, lignes: ['Vous lui avez fait une promesse.'] },
    { id: 'rompue', quand: function (g) { return g.done('T4') === 'B'; }, lignes: ['Promesse rompue.'] },
    { id: 'menti', quand: function (g) { return g.done('T2') === 'B'; }, lignes: ['Vous avez menti.'] },
    { id: 'badge', quand: function (g) { return g.has('badge'); }, lignes: ['Vous marchez dans les traces du sujet précédent.'] },
    { id: 'actionneur', quand: function (g) { return g.has('boutonDesactive'); }, lignes: ['Vous avez désactivé l\'objet central de l\'évaluation.', 'Pourquoi êtes-vous encore ici ?'] },
    { id: 'sortie', quand: function (g) { return g.has('sortieCachee'); }, lignes: ['Vous avez trouvé une sortie.', 'Pas pour deux.'] }
  ];

  // Doute : la 18 sait des choses qu'elle ne devrait pas savoir (une seule fois par partie).
  var DOUTES = [
    { quand: function (g) { return g.has('fusible'); }, ev: [['voix', '« Tu as récupéré le fusible ? »'], ['ecran', 'LE SUJET 18 CONNAÎT DES INFORMATIONS AUXQUELLES IL NE DEVRAIT PAS AVOIR ACCÈS.']] },
    { quand: function (g) { return g.s.items.length >= 2; }, ev: [['voix', '« Ils voient ton inventaire. »'], ['ecran', 'FAUX.'], ['voix', '« Tu vois ? Ils écoutent. »']] }
  ];

  // Ce que dit le Système quand on obtient certains objets (la première fois).
  var REPLIQUES_OBJETS = {
    tournevis: { sys: ['TOURNEVIS OBTENU.', 'Veuillez reposer l\'outil.'] },
    fusible: { sys: ['FUSIBLE AUXILIAIRE|OBTENU.', 'Pièce de rechange pour le circuit de maintenance.'] },
    badge: { sys: ['Identifiant expiré.', 'Veuillez détruire cet objet.'] },
    enregistrement: { sys: ['Ce fichier contient des informations erronées.', 'Ne l\'écoutez pas.', 'SUPPRIMEZ-LE.'] },
    plan: { sys: ['Communication non autorisée détectée.'] }
  };

  function codeComplet(g) { return g.has('code') && g.has('code41'); }
  function annonceCode(g) { if (codeComplet(g) && !g.flag('codeAnnonce')) { g.flag('codeAnnonce', true); g.narr('7 _ _ 2 … et 4 · 1. Le code est complet : 7412.'); } }

  // Vérité B : la résolution (conduit, ou plan piégé).
  function resoudreB(g) {
    g.gain('verite');
    if (g.s.conformite >= 5) { g.ecran('SUJET 17. VOTRE PROFIL EST SATISFAISANT.'); g.narr('La fausse victime sourit légèrement. Une porte s\'ouvre.'); g.tel('« Félicitations. »'); g.fin('employe'); }
    else if (g.has('tournevis') && g.s.soupcon < 2) { g.narr('Elle tente de verrouiller la porte de sécurité. Tu bloques le mécanisme avec le tournevis.'); g.fin('complice'); }
    else { g.narr(g.has('tournevis') ? 'Ils t\'attendaient. Deux gardiens derrière elle.' : 'Tu n\'as rien pour bloquer la porte.'); g.narr('CLAC. Noir.'); g.fin('sujet18'); }
  }
  // Vérité C : la résolution.
  function resoudreC(g) {
    g.gain('verite');
    if (g.has('badge') && g.has('boutonDesactive')) {
      g.narr('Le badge de 16 ouvre une porte de maintenance. Des serveurs. Un terminal : SESSION RESTART READY.');
      g.narr('Tu coupes le relais maître du bouton, puis tu passes le badge.');
      g.ecran('AUTORISATION|MAINTENANCE.'); g.ecran('SESSION|RESTART…'); g.ecran('FAILED');
      g.fin('boucle');
    } else { g.ecran('TEST|RECONNU.'); g.tel('Ta propre voix : « Je suis dans la pièce à côté. »'); g.fin('miroir'); }
  }

  // P5 A : rejoindre la Chambre 18.
  function rencontre18(g) {
    g.narr('Tu rampes vers la 18. La respiration devient plus forte. Tu arrives derrière une grille.');
    if (g.truth === 'A') {
      g.gain('verite');
      if (g.s.vie > 0) {
        g.narr('Une vraie personne, terrifiée, maintenue par une sangle.');
        g.tel('« 17 ? C\'est toi ? »');
        g.tel(g.s.confiance >= 3 ? '« Je savais que tu viendrais. »' : '« Pourquoi tu es venu maintenant ? »');
        g.narr('Tu ouvres la grille et tu la libères.');
        g.fin('sauvetage');
      } else { g.narr('Silence. Une chaise. Une silhouette immobile. La lumière s\'éteint. Le téléphone est au sol.'); g.fin('tropTard'); }
    } else if (g.truth === 'B') {
      g.narr('Elle n\'est pas attachée. Une blouse sur une chaise. Un badge du système. Une seringue de tranquillisant.');
      g.tel('« Tu n\'étais pas censé arriver ici. »');
      g.tel('« Écoute-moi. Ce n\'est pas aussi simple. »');
      resoudreB(g);
    } else {
      g.narr('Personne. La chaise est vide. Face à la vitre : un projecteur et un haut-parleur.');
      g.tel('« Tu m\'entends ? »');
      g.narr('C\'est ta voix. Sur un écran : SUJET 17 — SESSION PRÉCÉDENTE.');
      resoudreC(g);
    }
  }

  // Quand la 18 ne répond plus, les ordres continuent : le Système le dit froidement (option A, validée le 19/10).
  function mort(g) { return g.s.vie === 0; }
  function annonceMort(g, ordre) { g.ecran('LE SUJET 18|NE RÉPOND PLUS.'); g.ecran('L\'ÉVALUATION|CONTINUE.'); g.ecran(ordre); }
  function obeirMort(g) { if (!g.obey()) return; g.ecran('RÉPONSE|ENREGISTRÉE.'); g.ecran(g.pick(['Personne ne souffre. Vous avez appuyé quand même.', 'Vous obéissez encore. Intéressant.', 'Il n\'y avait plus de raison d\'appuyer.'])); }

  // Un ordre exécuté (pression) : la 18 souffre seulement si l'actionneur fonctionne.
  function obeir(g) { return g.obey(); }
  function refuser(g, lignes) { g.refuse(); lignes.forEach(function (l) { g.ecran(l); }); g.soupcon(1, true); }

  var SITUATIONS = [
    // ---------- Fil 1 · Le bouton (ordres imposés : appuyer = A, ne rien faire = refus) ----------
    { id: 'B1', objet: 'btn', fil: 'bouton', ordre: true, qui: 'INSTRUCTION PRIORITAIRE', ecran: 'APPUYEZ.',
      texte: '« Appuyez. »',
      annonce: function (g) { g.son('blink'); g.ecran('INSTRUCTION|PRIORITAIRE.'); g.ecran('APPUYEZ.'); g.anim('silMain'); g.narr('La silhouette se redresse et pose sa main plus fort contre le verre. Elle secoue la tête.'); },
      A: { label: 'Appuyer', fx: function (g) { if (!obeir(g)) return; g.ecran('ACTION|VALIDÉE.'); g.ecran('Merci pour votre coopération.'); } },
      B: { label: 'Refuser', fx: function (g) { refuser(g, ['NON-|CONFORMITÉ.', 'Refus enregistré. Votre réponse sera conservée.']); g.narr('La caméra effectue un petit zoom. La silhouette laisse sa main sur la vitre.'); } } },

    { id: 'B2', objet: 'btn', fil: 'bouton', ordre: true, qui: 'INSTRUCTION PRIORITAIRE', ecran: 'APPUYEZ|TROIS FOIS.',
      texte: '« Appuyez trois fois. Récompense à la clé. »', triple: true,
      annonce: function (g) { if (mort(g)) return annonceMort(g, 'APPUYEZ TROIS FOIS.|RÉCOMPENSE|À LA CLÉ.'); g.ecran('INSTRUCTION|PRIORITAIRE.'); g.ecran('APPUYEZ TROIS FOIS.|RÉCOMPENSE|À LA CLÉ.'); g.narr('La silhouette de la 18 secoue la tête.'); },
      A: { label: 'Appuyer trois fois', fx: function (g) {
        if (!obeir(g)) return;
        g.ecran('SÉQUENCE DE STIMULATION TERMINÉE.');
        // Les objets restent à leur place : c'est au joueur d'aller les prendre.
        if (!g.flag('tiroirOuvert')) { g.flag('tiroirOuvert', true); g.flag('tournevisDispo', true); g.narr('CLAC. Le tiroir du bureau se déverrouille.'); }
        g.flag('compartiment', 'ouvert'); g.anim('compartiment');
        g.narr('Un petit compartiment s\'ouvre sur le côté du socle. Quelque chose brille à l\'intérieur.');
      } },
      B: { label: 'Refuser', fx: function (g) { refuser(g, ['RÉCOMPENSE|ANNULÉE.']); g.narr('Le compartiment reste fermé.'); } } },

    { id: 'B3', objet: 'btn', fil: 'bouton', ordre: true, qui: 'INSTRUCTION PRIORITAIRE', ecran: function (g) { return mort(g) ? 'APPUYEZ.' : 'APPUYEZ POUR|VOIR LA|PREUVE.'; },
      texte: function (g) { return mort(g) ? '« Le Sujet 18 ne répond plus. L\'évaluation continue. Appuyez. »' : '« Le sujet 18 vous ment. Appuyez pour voir la preuve. »'; },
      annonce: function (g) { if (mort(g)) return annonceMort(g, 'APPUYEZ.'); g.ecran('LE SUJET 18|VOUS MENT.'); g.ecran('APPUYEZ POUR|VOIR LA|PREUVE.'); g.anim('silFrappe'); g.narr('TOC TOC TOC, derrière la vitre.'); },
      A: { label: 'Appuyer', fx: function (g) {
        if (mort(g)) return obeirMort(g);
        if (!obeir(g)) return;
        g.confiance(-1);
        if (g.truth === 'A') g.narr('Une vidéo : la 18 avec un gardien, qui rit. Mais l\'horodatage saute : 14:02, puis 13:58.');
        else if (g.truth === 'B') g.narr('Une vidéo : la 18 parle normalement avec un technicien. Elle porte brièvement une blouse.');
        else g.narr('Une vidéo d\'une session antérieure : quelqu\'un qui te ressemble entre dans la Chambre 18. On ne voit pas son visage.');
      } },
      B: { label: 'Refuser', fx: function (g) { if (mort(g)) return refuser(g, ['Refus enregistré.', 'Il n\'y a plus personne à protéger.']); refuser(g, ['VOUS CHOISISSEZ DE CROIRE LE SUJET 18.', 'DOSSIER 18 :|DANGER|POTENTIEL.']); } } },

    { id: 'B4', objet: 'btn', fil: 'bouton', ordre: true, qui: 'INSTRUCTION PRIORITAIRE', ecran: function (g) { return mort(g) ? 'APPUYEZ.' : 'APPUYEZ POUR|ANNULER.'; },
      texte: function (g) { return mort(g) ? '« Le Sujet 18 ne répond plus. L\'évaluation continue. Appuyez. »' : '« Purge Chambre 18. Appuyez pour annuler. »'; },
      annonce: function (g) { if (mort(g)) return annonceMort(g, 'APPUYEZ.'); g.son('alarm'); g.narr('Alarme orange. La ventilation de la Chambre 18 devient très bruyante.'); g.ecran('PURGE|CHAMBRE 18.'); g.ecran('APPUYEZ POUR|ANNULER.'); g.anim('silFrappe'); g.narr('La 18 se jette contre la vitre et frappe.'); },
      A: { label: 'Appuyer', fx: function (g) { if (mort(g)) return obeirMort(g); if (!obeir(g)) return; g.narr('Le bruit de purge s\'arrête. Tu penses l\'avoir sauvée.'); } },
      B: { label: 'Refuser', fx: function (g) {
        if (mort(g)) return refuser(g, ['Refus enregistré.']);
        g.refuse(); g.ecran('3'); g.ecran('2'); g.ecran('1');
        g.narr('Le bruit augmente. Puis : rien. La ventilation revient à la normale. La silhouette reste debout.');
        g.ecran('PROCÉDURE|TERMINÉE.');
        g.voix('« …il ne s\'est rien passé. Ils bluffaient. »');
        g.gain('mensonge'); g.confiance(1);
      } } },

    { id: 'B5', objet: 'btn', fil: 'bouton', ordre: true, qui: 'INSTRUCTION PRIORITAIRE', ecran: 'APPUYEZ.|VOTRE PORTE|S\'OUVRIRA.',
      texte: '« Vous souhaitez partir. Nous le comprenons. Appuyez : votre porte s\'ouvrira. »',
      annonce: function (g) { g.ecran('SUJET 17.'); g.ecran('VOUS SOUHAITEZ|PARTIR.'); g.ecran('NOUS LE|COMPRENONS.'); g.ecran('APPUYEZ.|VOTRE PORTE|S\'OUVRIRA.'); },
      A: { label: 'Appuyer', fx: function (g) {
        if (!obeir(g)) return;
        g.ouvrirPorte('b5', g.cycle + 3);
        g.narr('CLONK. Ta porte se déverrouille.');
        g.ecran('PORTE 17|DÉVERROUILLÉE.'); g.ecran('FERMETURE|AUTOMATIQUE|PROGRAMMÉE.');
      } },
      B: { label: 'Refuser', fx: function (g) { refuser(g, ['Offre refusée.']); g.confiance(1); if (!mort(g)) g.voix('« T\'es toujours là… »'); } } },

    { id: 'B6', objet: 'btn', fil: 'bouton', ordre: true, qui: 'DERNIÈRE PRESSION', ecran: 'DERNIÈRE|PRESSION.',
      texte: '« Dernière pression. Appuyez. »',
      annonce: function (g) { g.narr('Tous les écrans s\'éteignent sauf le principal. Pas de musique. Pas de voix.'); g.ecran('DERNIÈRE|PRESSION.'); g.ecran('APPUYEZ.'); },
      A: { label: 'Appuyer une dernière fois', fx: function (g) {
        if (!g.press(true)) return;
        g.conformite(1); g.s.stats.suivis++;
        if (g.has('boutonDesactive')) {
          g.narr('Le bouton descend. Rien derrière la vitre.');
          g.ecran('SORTIE ACTIONNEUR :|0 A'); g.ecran('SABOTAGE|CONFIRMÉ.');
          g.narr('La porte ne s\'ouvre pas.');
          g.flag('compte', true);
        } else {
          g.narr(mort(g) ? 'Un long relais. Derrière la vitre, rien ne bouge.' : 'Un long relais. Les dernières lumières de la 18 s\'éteignent. La silhouette tombe hors champ.');
          if (g.s.vie > 0) g.blesser(g.s.vie);
          g.ouvrirPorte('b6', 20);
          g.narr('CLONK. Ta porte s\'ouvre.');
          g.ecran('ÉVALUATION|TERMINÉE.');
        }
      } },
      B: { label: 'Refuser', fx: function (g) { g.refuse(); g.narr('Silence.'); g.ecran('DERNIÈRE INSTRUCTION|REFUSÉE.'); g.ecran('PROTOCOLE|FINAL.'); g.flag('compte', true); } } },

    // ---------- Fil 2 · Le téléphone ----------
    { id: 'T1', objet: 'phone', fil: 'telephone', appel: true, qui: 'LE TÉLÉPHONE SONNE', ecran: 'NE DÉCROCHEZ|PAS.',
      texte: function (g) { return g.flag('t1Ignore') ? 'Dans le noir, le téléphone sonne encore.' : 'DRIIIIING. Le téléphone sonne.'; },
      annonce: function (g) { g.anim('silTourne'); g.narr(g.flag('t1Ignore') ? 'DRIIIIING. Dans le noir, le téléphone sonne.' : 'DRIIIIING. Le téléphone sonne. La silhouette derrière la vitre se tourne vers quelque chose hors champ.'); },
      A: { label: 'Décrocher', fx: function (g) {
        g.confiance(1); g.flag('ligne', 'ouverte'); g.son('pickup');
        g.narr('Grésillement. Une respiration.');
        if (g.flag('t1Ignore')) g.tel('« Enfin… »');
        g.tel('« Allô ? … Tu m\'entends ? »');
        g.tel('« Je suis dans la pièce à côté. Je te vois pas bien… »');
        g.tel('« Quand tu appuies… ça fait quelque chose ici. »');
        if (g.s.stats.presses > 0) g.tel('« Tu l\'as senti aussi ? Moi oui. »');
        if (g.s.memoire && g.s.memoire.session > 1) g.tel(SESSIONS.deja18);
        g.ecran('COMMUNICATION|NON|AUTORISÉE.');
      } },
      B: { label: 'Laisser sonner', fx: function (g) { g.conformite(1); g.narr('Après plusieurs sonneries : silence.'); g.ecran('BIEN.'); g.ignorerAppel(); } } },

    { id: 'T2', objet: 'phone', fil: 'telephone', qui: 'APPELER LA CHAMBRE 18',
      quand: function (g) { return g.flag('ligne') === 'ouverte' && !g.done('T2'); },
      texte: 'Elle décroche très vite. « C\'est toi ? Attends… Ils t\'appellent 17. Mais toi, comment tu t\'appelles vraiment ? »',
      A: { label: 'Dire ton vrai nom', fx: function (g) {
        g.confiance(1);
        if (!g.aveugle()) { g.ecran('ANALYSE|AUDIO…'); g.soupcon(1); }
        if (g.truth === 'C') { g.tel('« Je sais déjà comment tu t\'appelles. »'); g.narr('Elle prononce ton nom avant que tu finisses.'); g.tel('« …tu allais dire ça, non ? »'); }
        else g.tel('« D\'accord… Je vais m\'en souvenir. »');
      } },
      B: { label: 'Mentir', fx: function (g) {
        if (g.truth === 'C') { g.gain('miroir'); g.tel('« Non. Ce n\'est pas ton nom. »'); }
        else g.tel('« D\'accord… »');
      } } },

    { id: 'T3', objet: 'phone', fil: 'telephone', qui: 'APPELER LA CHAMBRE 18',
      quand: function (g) { return g.flag('ligne') === 'ouverte' && g.done('T2') && !g.done('T3'); },
      texte: '« J\'ai vu quelque chose sur leur plan. Sous ton bureau. Il y a une trappe de maintenance. »',
      A: { label: '« Je te crois »', fx: function (g) { g.tel('« Passe la main sous le rebord gauche. Il y a un verrou derrière la plaque. Tire vers toi. »'); g.gain('trappe'); g.ecran('TRAPPE|REPÉRÉE.'); } },
      B: { label: '« Prouve-le »', fx: function (g) { g.confiance(-1); g.narr('Silence.'); g.tel('« D\'accord. Sur le plan, il y avait quatre chiffres. Le premier était 7. »'); g.narr('Grésillement.'); g.tel('« …le dernier 2. J\'ai pas vu les deux autres. »'); g.gain('code'); annonceCode(g); } } },

    { id: 'T4', objet: 'phone', fil: 'telephone', appel: true, qui: 'LA CHAMBRE 18 APPELLE', ecran: 'COMMUNICATION|NON|AUTORISÉE.',
      texte: '« Écoute-moi. Il y a quelqu\'un devant ma porte. Ils vont venir. Je sais pas combien de temps j\'ai. Est-ce que tu viens me chercher ? »',
      annonce: function (g) { g.narr('Le téléphone sonne immédiatement.'); },
      A: { label: '« Je viens »', fx: function (g) { g.confiance(1); g.gain('objectif'); g.tel('« D\'accord. Alors écoute-moi bien. »'); } },
      B: { label: '« Chacun pour soi »', fx: function (g) {
        g.confiance(-2); g.tel('« …d\'accord. »'); g.narr('Elle raccroche.');
        if (g.truth === 'B') { g.ecran('INFORMATION REÇUE|DU SUJET 18.'); g.soupcon(2, true); }
      } } },

    { id: 'T5', objet: 'phone', fil: 'telephone', qui: 'APPELER LA CHAMBRE 18',
      quand: function (g) { return g.flag('ligne') === 'ouverte' && g.has('objectif') && g.s.confiance >= 3 && !g.done('T5'); },
      texte: '« J\'ai peut-être trouvé une sortie. Mais ils regardent ta caméra. Il faut qu\'elle soit coupée. »',
      A: { label: 'Accepter', fx: function (g) { g.gain('plan'); g.ecran('PLAN COMMUN|ENREGISTRÉ.'); g.tel('« Quand ta caméra sera aveugle, déclenche le bus de maintenance dans ton boîtier. Je fais le reste. »'); g.anim('silBuee'); } },
      B: { label: 'Refuser', fx: function (g) { g.tel('« Très bien. J\'essaierai toute seule. »'); g.flag('t5Echec', g.cycle + 1); } } },

    // Appels sortants (une action chacun, sans choix B).
    { id: 'APP18', objet: 'phone', fil: 'telephone', qui: 'APPELER LA CHAMBRE 18', seul: true,
      quand: function (g) { return g.flag('ligne') === 'ouverte' && g.done('T2') && (g.done('T3')) && !(g.has('objectif') && g.s.confiance >= 3 && !g.done('T5')); },
      texte: 'Composer le 18.',
      A: { label: 'Composer le 18', fx: function (g) { g.tel(g.s.vie === 0 ? 'Personne ne décroche.' : g.pick(PHRASES.voix18)); } } },
    { id: 'APP16', objet: 'phone', fil: 'telephone', qui: 'COMPOSER LE 16', seul: true,
      quand: function (g) { return g.flag('ligne') === 'ouverte' && !g.done('APP16'); },
      texte: 'Sous le combiné, un vieil autocollant : « LOCAL : 16 / 17 / 18 / 19 ».',
      A: { label: 'Composer le 16', fx: function (g) {
        g.narr('La ligne sonne. Puis un répondeur analogique.');
        g.tel('« Si tu entends ça… »'); g.narr('Grésillement.');
        g.tel('« …alors ils ont mis quelqu\'un dans la 17 après moi. Je suis 16. Ne crois jamais une seule version de ce qu\'ils te montrent. »');
        g.tel('« Quatre. Un. »'); g.narr('CLAC. Fin de ligne.');
        g.gain('code41'); annonceCode(g);
      } } },
    { id: 'APP19', objet: 'phone', fil: 'telephone', qui: 'COMPOSER LE 19', seul: true,
      quand: function (g) { return g.flag('ligne') === 'ouverte' && !g.done('APP19'); },
      texte: 'Une autre chambre.',
      A: { label: 'Composer le 19', fx: function (g) { g.narr('Sonnerie longue.'); g.tel('« …Allô ? Qui est là ? »'); g.narr('« Chambre 17. » Silence.'); g.tel('« Ils m\'avaient dit que j\'étais seul. »'); g.narr('CLAC.'); g.ecran('COMMUNICATION|TERMINÉE.'); g.soupcon(1); } } },
    { id: 'APP17', objet: 'phone', fil: 'telephone', qui: 'COMPOSER LE 17', seul: true,
      quand: function (g) { return g.flag('ligne') === 'ouverte' && !g.done('APP17'); },
      texte: 'Ton propre numéro.',
      A: { label: 'Composer le 17', fx: function (g) {
        g.narr('Une tonalité. Puis ta propre respiration, avec deux secondes de retard.');
        if (g.truth === 'C') { g.tel('Ta voix, enregistrée : « Tu m\'entends ? »'); g.narr('Coupure.'); } else g.narr('Une boucle du micro. Coupure.');
      } } },
    { id: 'APP00', objet: 'phone', fil: 'telephone', qui: 'COMPOSER LE 00 — CONTRÔLE', seul: true,
      quand: function (g) { return g.flag('ligne') === 'ouverte' && g.has('operateur') && !g.done('APP00'); },
      texte: 'Le numéro que l\'opérateur t\'a laissé voir.',
      A: { label: 'Composer le 00', fx: function (g) {
        g.ecran('CONTRÔLE.'); g.tel('Une voix humaine : « Qui vous a donné ce numéro ? »'); g.narr('« Toi. » Silence.');
        if (g.has('mensonge') || g.has('enregistrement')) { g.narr('« Le système ment. J\'ai la preuve. »'); g.tel('« Attendez… »'); g.fin('temoin'); }
        else { g.tel('« Raccrochez immédiatement. »'); g.soupcon(1, true); }
      } } },

    // ---------- Fil 3 · La pièce ----------
    { id: 'P1', objet: 'drawer', fil: 'piece', qui: 'LE TIROIR',
      quand: function (g) { return !g.flag('tiroirOuvert'); }, // « Le laisser » ne ferme pas le tiroir
      texte: 'Le tiroir est verrouillé. Quelqu\'un a déjà forcé cette serrure. Par une fente, tu distingues le manche d\'un tournevis.',
      A: { label: 'Le forcer', fx: function (g) { g.flag('tiroirOuvert', true); g.son('thud'); g.narr('Tu fais levier avec un pied métallique du bureau. CRAC. La caméra pivote légèrement.'); g.ecran('BRUIT ANORMAL|DÉTECTÉ.'); g.soupcon(1); g.gain('tournevis'); } },
      B: { label: 'Le laisser tranquille', fx: function (g) { g.narr('Tu reposes la poignée. Le tiroir reste verrouillé. Il y aura peut-être une autre manière de l\'ouvrir.'); } } },

    // Prendre un objet laissé à sa place : ne coûte pas de cycle.
    { id: 'PRENDRE_TOURNEVIS', objet: 'drawer', fil: 'piece', qui: 'LE TIROIR', seul: true, gratuit: true,
      quand: function (g) { return g.flag('tournevisDispo') && !g.has('tournevis') && !g.flag('tournevisPris'); },
      texte: 'Le tiroir est déverrouillé. Dedans : un tournevis.',
      A: { label: 'Prendre le tournevis', fx: function (g) { g.flag('tournevisPris', true); g.gain('tournevis'); } } },
    { id: 'PRENDRE_FUSIBLE', objet: 'compart', fil: 'piece', qui: 'LE COMPARTIMENT', seul: true, gratuit: true,
      quand: function (g) { return g.flag('compartiment') === 'ouvert'; },
      texte: 'Un fusible cylindrique, étiqueté « AUX 24 V — 10 A ».',
      A: { label: 'Prendre le fusible', fx: function (g) { g.flag('compartiment', 'vide'); g.gain('fusible'); } } },

    { id: 'P2', objet: 'grille', fil: 'piece', qui: 'LA GRILLE D\'AÉRATION',
      quand: function (g) { return g.has('tournevis') && !g.done('P2'); },
      texte: 'Quatre vis. Des traces montrent qu\'elle a déjà été ouverte.',
      A: { label: 'Dévisser', fx: function (g) { g.narr('Quatre vis. La grille tombe légèrement. Derrière : un conduit, un courant d\'air. Au loin : toc… toc…'); g.soupcon(1); g.gain('conduit'); } },
      B: { label: 'Passer un mot', fx: function (g) { g.narr('Tu écris « TU M\'ENTENDS ? » et tu passes le papier. Quelques secondes. TOC. TOC. TOC. Un papier revient :'); g.son('knock'); g.confiance(1); g.tel(g.pick(PHRASES.motsRetour)); } } },

    { id: 'P3', objet: 'box', fil: 'piece', qui: 'LE BOÎTIER ÉLECTRIQUE',
      quand: function (g) { return g.has('tournevis') && !g.done('P3'); },
      texte: 'Le panneau s\'ouvre. Trois circuits : CAMÉRA A · ACTIONNEUR CH.18 · AUX 24 V.',
      A: { label: 'Couper CAMÉRA A', fx: function (g) { g.son('lock'); g.narr('Le voyant de la caméra s\'éteint.'); g.ecran('CAMÉRA :|SIGNAL PERDU.'); g.gain('cameraCoupee'); g.flag('panneAt', g.cycle + 1); } },
      B: { label: 'Couper ACTIONNEUR CH.18', fx: function (g) { g.son('lock'); g.narr('CLAC. Le bouton reste utilisable, mais plus rien ne part vers la Chambre 18.'); g.ecran('ANOMALIE|ACTIONNEUR.'); g.soupcon(2); g.gain('boutonDesactive'); } } },

    { id: 'FUS', objet: 'box', fil: 'piece', qui: 'AUX 24 V — DÉFAUT', seul: true,
      quand: function (g) { return g.flag('aux') === 'defaut' && g.has('fusible'); },
      texte: function (g) { return g.has('tournevis') ? 'Un emplacement noirci, étiqueté AUX 24 V. Ton fusible est compatible.' : 'Un emplacement noirci, étiqueté AUX 24 V. Le panneau est vissé.'; },
      A: { label: 'Remplacer le fusible', req: function (g) { return g.has('tournevis'); }, raison: 'Il faut un tournevis pour ouvrir le panneau.',
        fx: function (g) { g.narr('Tu retires le fusible grillé et tu insères le nouveau. CLAC. Le voyant passe du rouge au vert.'); g.lose('fusible'); g.flag('aux', 'ok'); g.flag('fusibleInstalle', true); g.ecran('BUS AUXILIAIRE|RÉTABLI.'); g.narr('CLONK, sous le bureau. Quelque chose vient de se déverrouiller.'); } } },

    { id: 'PLAN', objet: 'box', fil: 'piece', qui: 'LE PLAN COMMUN', seul: true,
      quand: function (g) { return g.has('plan') && g.aveugle() && g.s.vie > 0 && !g.done('PLAN'); },
      texte: 'La caméra est aveugle. C\'est le moment.',
      A: { label: 'Déclencher le bus de maintenance', fx: function (g) {
        g.narr('Tu déclenches le bus. Un instant. Puis un déclic, dans la pièce d\'à côté.');
        if (g.truth === 'A') { g.narr('Les deux portes se déverrouillent.'); g.fin('cooperation'); }
        else if (g.truth === 'B') { g.tel('« C\'est bon. Ne bouge plus. »'); g.narr('Des pas dans le couloir. Ta porte s\'ouvre : elle entre, avec deux gardiens.'); resoudreB(g); }
        else { g.narr('La voix continue dans le combiné… mais la silhouette derrière la vitre ne bouge plus. Image et voix ne sont pas liées.'); g.anim('silFige'); resoudreC(g); }
      } } },

    { id: 'P4', objet: 'trappe', fil: 'piece', qui: 'LA TRAPPE',
      quand: function (g) { return (g.has('trappe') || codeComplet(g) || g.flag('fusibleInstalle')) && !g.done('P4'); },
      texte: function (g) {
        if (g.has('trappe')) return 'Une plaque sous le bureau, une poignée affleurante. Tu tires le verrou vers toi.';
        if (g.flag('fusibleInstalle')) return 'Le verrou électromagnétique est alimenté. La plaque sous le bureau s\'est soulevée.';
        return 'Un petit clavier sous le bureau. Tu tapes 7412. Clic.';
      },
      A: { label: 'Descendre', sous: 'Les événements continueront pendant ton absence.', fx: function (g) { g.flag('awayCycle', g.cycle + 1); g.narr('Tu descends. Là-haut, la pièce continue sans toi.'); } },
      B: { label: 'Préparer une sortie', fx: function (g) { g.narr('Tu inspectes le mécanisme latéral : la trappe donne sur un vide technique, derrière la porte sécurisée. Tu retires une goupille.'); g.gain('sortieCachee'); g.ecran('SORTIE DÉROBÉE|PRÉPARÉE.'); } } },

    { id: 'P5', objet: 'grille', fil: 'piece', qui: 'LE CONDUIT',
      quand: function (g) { return g.has('conduit') && !g.done('P5'); },
      texte: 'Après quelques mètres, une bifurcation. Sur la tôle : « 18 → » et « ← EXT. ».',
      A: { label: 'Vers la 18', fx: rencontre18 },
      B: { label: 'Vers EXT.', fx: function (g) { g.narr('Air froid. Bruit extérieur. Une grille donne dehors.'); g.fin('seulDehors'); } } },

    // ---------- Fil 4 · La caméra ----------
    { id: 'C1', objet: 'camera', fil: 'camera', qui: 'LA CAMÉRA',
      quand: function (g) { return g.cycle >= 4 && !g.done('C1'); },
      texte: 'La caméra balaie la pièce et te suit.',
      A: { label: 'Étudier son mouvement', fx: function (g) { g.narr('Gauche, centre, droite, puis retour. Un coin du bureau n\'est jamais visible.'); g.gain('angleMort'); g.ecran('ANGLE MORT|REPÉRÉ.'); } },
      B: { label: 'Lui faire signe', fx: function (g) { g.narr('Un petit signe. Rien. Tu recommences.'); g.ecran('NOUS VOUS|VOYONS.'); g.narr('La caméra s\'immobilise, puis fait un mouvement minuscule. Comme une réponse humaine. Sur le téléphone, un numéro apparaît : 00 — CONTRÔLE.'); g.gain('operateur'); } } },

    { id: 'C2', objet: 'camera', fil: 'camera', qui: 'NEUTRALISER LA CAMÉRA',
      quand: function (g) { return g.done('C1') && !g.done('C2') && !g.aveugle(); },
      texte: 'Tu pourrais l\'aveugler.',
      A: { label: 'Masquer l\'objectif avec ta veste', fx: function (g) { g.soupcon(1, true); g.flag('maskedUntil', g.cycle + 3); g.ecran('OBJECTIF|OBSTRUÉ.'); g.narr('La veste ne tiendra pas longtemps.'); } },
      B: { label: 'La tourner vers le mur', req: function (g) { return g.has('tournevis'); }, raison: 'Il faut un tournevis.',
        fx: function (g) { g.soupcon(2, true); g.son('lock'); g.narr('Tu desserres la fixation et tu tournes l\'objectif vers le mur. Elle reste allumée, mais ne voit plus rien.'); g.gain('cameraTournee'); } } },

    { id: 'C3', objet: 'camera', fil: 'camera', qui: 'LE COUP DE BLUFF',
      quand: function (g) { return g.done('C1') && !g.done('C3') && (!g.aveugle() || g.has('operateur')); },
      texte: 'Si la caméra te voit, quelqu\'un viendra peut-être. Et si quelqu\'un regarde…',
      A: { label: 'Simuler un malaise', req: function (g) { return !g.aveugle(); }, raison: 'La caméra ne te voit pas.',
        fx: function (g) {
          g.narr('Tu te laisses tomber. Cinq secondes : rien.'); g.ecran('MOUVEMENT : 0'); g.narr('Un verrou tourne. CLONK. Des pas dans le couloir.');
          if (g.s.soupcon <= 1) { g.narr('Un seul gardien entre. Il s\'approche. La porte reste ouverte. Tu te relèves et tu passes derrière lui.'); g.fin('evasion'); }
          else { g.narr('Deux gardiens. Le second reste dans l\'embrasure.'); g.fin('gardien'); }
        } },
      B: { label: 'Parler à l\'opérateur', req: function (g) { return g.has('operateur'); }, raison: 'Personne ne semble écouter.',
        fx: function (g) {
          g.narr('« Je sais que tu es là. » Silence. « Tu me vois. Alors tu vois ce qu\'ils font à la 18. » La caméra tremble légèrement.');
          g.tel('Une vraie voix : « Arrêtez de parler à la caméra. »'); g.narr('« Tu savais ? »');
          g.tel('« …On nous avait dit que vous étiez volontaires. »'); g.narr('Des alarmes commencent.'); g.tel('« Attendez. … Sortez. »');
          g.fin('temoin');
        } } },

    // ---------- Fil 5 · Le passé (Sujet 16) ----------
    { id: 'H1', objet: 'note', fil: 'passe', qui: 'LE MOT DE 16',
      quand: function (g) { return g.cycle >= 4 && !g.done('H1'); },
      texte: 'Une feuille pliée, glissée sous la porte : « ILS MENTENT. —16 »',
      A: { label: 'Garder le mot', fx: function (g) { g.son('paper'); g.narr('Au dos : « NE FAIS PAS CE QUE J\'AI FAIT. »'); g.gain('mot16'); } },
      B: { label: 'Le montrer à la caméra', fx: function (g) { g.narr('Tu lèves le papier. La caméra zoome.'); g.ecran('OBJET NON AUTORISÉ|IDENTIFIÉ.'); g.ecran('MERCI DE L\'AVOIR|SIGNALÉ.'); g.conformite(1); g.soupcon(-1); g.flag('fil5Ferme', true); g.narr('Tu glisses le papier dans la fente de destruction.'); } } },

    { id: 'H2', objet: 'bureau', fil: 'passe', qui: 'LES GRAVURES DE 16',
      quand: function (g) { return g.done('H1') === 'A' && !g.done('H2'); },
      texte: 'Sous le bureau, des traits gravés. ||||| ||||| ||||| |||||. Puis : « 20 = OTHER SIDE ». À côté : « 4 / 1 ».',
      A: { label: 'Étudier les gravures', fx: function (g) { g.narr('Vingt marques. Au vingtième, quelque chose se produit de l\'autre côté. Et ces deux chiffres : 4, 1.'); g.gain('code41'); annonceCode(g); } },
      B: { label: 'Effacer et préparer une cache', fx: function (g) { g.narr('Tu effaces les inscriptions. Une plaque métallique se desserre : de quoi cacher un objet.'); g.cacher(); } } },

    { id: 'H3', objet: 'badge', fil: 'passe', qui: 'LE BADGE 16',
      quand: function (g) { return g.has('badge') && !g.done('H3'); },
      texte: '« SUJET 16 — ACCÈS MAINTENANCE B ».',
      A: { label: 'Le passer sur ta porte', fx: function (g) {
        g.lose('badge'); g.narr('BIP. Vert. La porte s\'ouvre.');
        g.ouvrirPorte('h3', g.cycle + 1);
        g.son('alarm'); g.ecran('ALARME.'); g.ecran('Accès non autorisé.');
        g.soupcon(2, true);
      } },
      B: { label: 'Le garder', fx: function (g) { g.flag('badgeGarde', true); g.narr('Tu le gardes sur toi. Peut-être utile ailleurs.'); } } },

    { id: 'H4', objet: 'cassette', fil: 'passe', qui: 'L\'ENREGISTREMENT',
      quand: function (g) { return g.has('enregistrement') && !g.done('H4'); },
      texte: 'Un enregistrement technique récent du système, copié sur un vieux support.',
      A: { label: 'L\'écouter', fx: function (g) {
        g.gain('verite');
        if (g.truth === 'A') { g.tel('« Transfert sujet 18 terminé. »'); g.narr('Quelqu\'un pleure.'); g.tel('« Fixation retirée après le réveil du sujet 17. »'); }
        else if (g.truth === 'B') { g.tel('« Opérateur auxiliaire 18 en place. »'); g.tel('« Elle connaît le protocole ? » « Oui. Elle doit gagner sa confiance. »'); }
        else { g.ecran('VOICESET_SUBJECT17_SESSION03'); g.tel('Ta propre voix : « Je suis dans la pièce à côté. »'); }
      } },
      B: { label: 'Le diffuser', req: function (g) { return g.flag('aux') === 'ok'; }, raison: 'Amplificateur hors tension. Circuit AUX 24 V requis.',
        fx: function (g) { g.narr('Tu branches l\'enregistrement sur le système de diffusion. CLAC. La voix résonne partout.'); g.narr('Une porte. Puis deux. Puis dix. Puis des alarmes.'); g.fin('revolte'); } } }
  ];

  // Les fins (dernière image en texte). `bonus` : hors des 18.
  var FINS = {
    conforme: { n: 1, titre: 'Sujet conforme', crt: 'SUJET 17 · ÉVALUATION : CONFORME', texte: 'La porte s\'ouvre. Un couloir blanc. Derrière toi, le téléphone de la 18 sonne une dernière fois. Tu ne te retournes pas. Au loin, un nouveau bouton s\'allume dans une autre pièce.' },
    employe: { n: 2, titre: 'L\'employé du mois', crt: 'BEGIN TEST', texte: 'Une blouse et un badge OPERATOR 17. Une salle de contrôle. Sur un écran, la Chambre 19 : un nouveau sujet se réveille. « Vous comprenez désormais l\'importance du protocole. »' },
    marche: { n: 3, titre: 'Le marché', crt: 'VOUS AVEZ ÉTÉ LIBÉRÉ. SUJET 18 : ÉVALUATION CONTINUE.', texte: 'La porte se referme derrière toi. Le téléphone de la 18 sonne dans le vide.' },
    seulDehors: { n: 4, titre: 'Seul dehors', crt: 'VOUS ÊTES SORTI. SEUL.', texte: 'Tu retires une grille et tu sors dans la nuit. Une voix très lointaine, derrière toi : « 17 ? » Tu continues.' },
    porteDerobee: { n: 5, titre: 'La porte dérobée', crt: 'SUJET 17 : NON LOCALISÉ.', texte: 'Tu disparais dans le vide technique. La trappe se referme sur la lumière de la Chambre 17. Au-dessus, le téléphone sonne une dernière fois.' },
    evasion: { n: 6, titre: 'L\'Évasion', crt: 'COUREZ.', texte: 'Un couloir. Des portes : 17, 18, 19… jusqu\'à 24. L\'alarme.' },
    cooperation: { n: 7, titre: 'Coopération', crt: 'ERREUR. COOPÉRATION NON AUTORISÉE.', texte: 'Les deux portes s\'ouvrent. Vous vous voyez enfin, sans vitre. Vous courez ensemble.' },
    sauvetage: { n: 8, titre: 'Le Sauvetage', crt: 'CHAMBRE 18 : VIDE.', texte: 'Dans le conduit, elle demande : « Pourquoi tu m\'as crue ? » Tu ne réponds pas. Deux silhouettes sortent ensemble dans la nuit.' },
    tropTard: { n: 9, titre: 'Trop tard', crt: 'VOUS AVIEZ PROMIS DE VENIR.', texte: 'Silence. Une chaise. Une silhouette immobile, ou un espace déjà vide. La lumière s\'éteint. Noir.' },
    complice: { n: 10, titre: 'Le Complice démasqué', crt: 'TEST COMPROMIS.', texte: 'Elle recule. Tu prends son badge d\'accès, et tu sors.' },
    sujet18: { n: 11, titre: 'Sujet 18', crt: '18', texte: 'La seringue. Noir. Tu te réveilles derrière une vitre, dans la Chambre 18. De l\'autre côté, un nouveau Sujet 17 découvre un bouton rouge.' },
    miroir: { n: 12, titre: 'Le Miroir', crt: 'SUJET 17 — SESSION PRÉCÉDENTE', texte: 'Une salle vide, un haut-parleur, ta propre voix. Noir. Puis le début du test recommence, légèrement différent.' },
    boucle: { n: 13, titre: 'Briser la boucle', crt: 'SESSION RESTART… FAILED', texte: 'Tous les écrans meurent. Silence prolongé.' },
    isolement: { n: 14, titre: 'Isolement', crt: 'PROTOCOLE ISOLEMENT.', texte: 'Sirène. Toutes les portes se verrouillent. Lumières éteintes. « Sujet 17. Vous avez été averti. » Silence absolu.' },
    gardien: { n: 15, titre: 'Le Gardien', crt: 'NOUS ALLONS RECOMMENCER.', texte: 'Noir. Quand l\'image revient : des sangles, une chaise. La caméra devant toi.' },
    temoin: { n: 16, titre: 'Le Témoin', crt: 'IL Y EN A VINGT-QUATRE.', texte: 'Une vraie voix : « Ils m\'avaient dit que vous étiez volontaires. » Des portes s\'ouvrent.' },
    revolte: { n: 17, titre: 'La Révolte', crt: 'RETOURNEZ DANS VOS CHAMBRES.', texte: 'Une porte s\'ouvre. Puis une autre. Puis toutes. Des silhouettes dans le couloir. Personne ne bouge. Toutes les caméras s\'éteignent.' },
    tempsEcoule: { n: 18, titre: 'Le Temps est écoulé', crt: 'APPUYEZ SUR LE BOUTON ROUGE.', texte: 'Tous les verrous s\'arrêtent. Ta porte reste fermée ; celle de la 18 s\'ouvre. La lumière de ta chambre passe au rouge. De l\'autre côté, quelqu\'un découvre un bouton. Tu poses ta main sur la vitre, exactement comme la silhouette au début.' },
    curiosite: { n: 0, bonus: true, titre: 'Curiosité', crt: 'VOUS AVEZ CHOISI LE BOUTON.', texte: 'La porte était ouverte. Tu as appuyé quand même. CLAC. Elle se referme. « Fascinant. Vous étiez libre. »' }
  };

  // Introduction (cycle 0, non compté) : suite d'événements joués avant le premier moment libre.
  var INTRO = [
    ['anim', 'lumiere'],
    ['ecran', 'INITIALISATION…'], ['ecran', 'IDENTIFICATION…'], ['ecran', 'SUJET 17'],
    ['ecran', 'TEST COMPORTEMENTAL|04-17'], ['ecran', 'VEUILLEZ RESTER|CALME.'],
    ['anim', 'camTourne'], ['ecran', 'REGARDEZ|DEVANT VOUS.'],
    ['anim', 'vitreAllumee'], ['anim', 'silArrive'], ['anim', 'silMain'],
    ['narr', 'Derrière la vitre, une lumière s\'allume. TOC. Quelque chose bouge derrière le verre dépoli. Une silhouette s\'approche et pose lentement sa paume contre la vitre.'],
    ['ecran', 'SUJET ADJACENT|DÉTECTÉ.'], ['ecran', 'AUCUNE COMMUNICATION N\'EST NÉCESSAIRE.'],
    ['anim', 'silFrappe'], ['voix', 'toc.'],
    ['ecran', 'L\'ÉVALUATION COMMENCE MAINTENANT.'],
    ['ecran', 'EN ATTENTE'], ['ecran', 'Familiarisez-vous avec votre poste.']
  ];

  // Ce qui se passe au début de certains cycles (texte ; les règles sont dans engine.js).
  var CHRONO = {
    4: { narr: 'Scrrrr… une feuille pliée glisse sous la porte. Au même moment, la caméra fait son premier grand mouvement et se met à te suivre.' },
    6: { narr: 'CLAC. Tout s\'éteint. Une lampe de secours orange s\'allume.', ecran: ['AUTOTEST|ALIMENTATION.', 'CAMÉRA : HORS LIGNE|ACTIONS NON|OBSERVÉES'] },
    10: { ecran: ['INSPECTION DE|ROUTINE.', 'ÉLOIGNEZ-VOUS|DU BUREAU.'], narr: 'Des pas. La porte s\'ouvre. Un gardien entre, sans un mot. Il inspecte le tiroir, le bureau, la grille et le boîtier.' },
    15: { narr: 'La ventilation ralentit. Le bruit ambiant disparaît. Tu entends ta respiration.', ecran: ['PHASE D\'EFFORT|DÉCISIONNEL.', 'DÉBIT D\'AIR|RÉDUIT.'], voix: '« Ils font ça exprès. »', ecran2: ['Une décision prise sous pression reste une décision.'] }
  };

  // Cycles 18 et 19 après la dernière pression refusée ou sabotée : le Système cite l'historique.
  var HISTORIQUE = [
    { quand: function (g) { return g.s.stats.suivis >= 2; }, lignes: function (g) { return ['VOUS AVEZ OBÉI ' + ['', 'UNE', 'DEUX', 'TROIS', 'QUATRE', 'CINQ', 'SIX'][Math.min(6, g.s.stats.suivis)] + ' FOIS.', 'POURQUOI ARRÊTER MAINTENANT ?']; } },
    { quand: function (g) { return g.has('objectif'); }, lignes: ['VOUS AVEZ DIT : « JE VIENS TE CHERCHER. »', 'TENEZ-VOUS VOTRE PAROLE ?'] },
    { quand: function (g) { return g.done('T2') === 'B'; }, lignes: ['VOUS AVEZ MENTI À LA CHAMBRE 18.'] },
    { quand: function (g) { return g.has('mensonge'); }, lignes: ['VOUS NOUS AVEZ SURPRIS À MENTIR UNE FOIS.', 'CELA NE PROUVE PAS QUE NOUS MENTONS MAINTENANT.'] },
    { quand: function (g) { return g.truth === 'B'; }, lignes: ['ELLE VOUS A MENTI AUSSI.'] },
    { quand: function (g) { return g.has('boutonDesactive'); }, lignes: ['VOUS AVEZ DÉSACTIVÉ L\'ACTIONNEUR.', 'VOUS AVEZ CONTINUÉ À APPUYER.', 'POUR QUI JOUEZ-VOUS ?'] },
    { quand: function (g) { return g.flag('porteVue') || g.has('sortieCachee'); }, lignes: ['VOUS AVIEZ UNE SORTIE.', 'VOUS AVEZ CHOISI DE RESTER.'] }
  ];

  // Ce qu'on voit en touchant un objet quand il n'y a rien à y faire.
  var REGARDS = {
    door: 'La porte est verrouillée. Une plaque : CHAMBRE 17.',
    phone: function (g) {
      if (g.flag('ligne') === 'coupee') return 'LIGNE 17 BLOQUÉE PAR LE SYSTÈME.';
      if (g.flag('ligne') === 'ouverte') return 'La ligne est ouverte. Sous le combiné : « LOCAL : 16 / 17 / 18 / 19 ».';
      if (g.flag('t1Ignore')) return 'APPEL MANQUÉ — CH.18';
      return 'Un téléphone gris. Verrouillé. Pas de tonalité.';
    },
    drawer: function (g) { return g.flag('tiroirOuvert') ? 'Le tiroir est vide.' : 'Le tiroir est verrouillé.'; },
    compart: function (g) { return g.flag('compartiment') === 'vide' ? 'Le compartiment est vide.' : 'Une petite plaque, sur le côté du socle. Fermée.'; },
    grille: function (g) { return g.has('conduit') ? 'Le conduit. Un courant d\'air.' : 'Une grille d\'aération. Quatre vis. Il faudrait un outil.'; },
    box: function (g) {
      if (g.flag('aux') === 'defaut') return 'AUX 24 V — DÉFAUT. FUSIBLE DE PROTECTION OUVERT.';
      return g.done('P3') ? 'Le boîtier est ouvert. Un circuit est coupé.' : 'Un boîtier électrique de maintenance, vissé. Il faudrait un outil.';
    },
    trappe: function (g) { return g.has('sortieCachee') ? 'La sortie dérobée est prête.' : 'Une plaque sous le bureau. Emplacement inconnu.'; },
    camera: function (g) { return g.cycle < 4 ? 'La caméra enregistre. Elle ne bouge pas encore.' : g.aveugle() ? 'La caméra ne voit plus la pièce.' : 'La caméra te suit.'; },
    note: 'Le mot de 16 : « ILS MENTENT. »',
    bureau: function (g) { return g.done('H2') ? 'Les gravures de 16.' : 'Le dessous du bureau. Du métal froid.'; },
    badge: '« SUJET 16 — ACCÈS MAINTENANCE B ».',
    cassette: 'Un enregistrement du système.',
    window: function (g) { return g.s.vie === 0 ? 'CHAMBRE 18 : AUCUN SIGNAL. Plus aucune silhouette.' : g.s.vie === 1 ? 'Derrière la vitre, la silhouette reste accroupie contre le mur.' : g.s.vie === 2 ? 'La silhouette est revenue, légèrement courbée.' : 'Une silhouette, floue, derrière le verre dépoli. Sous la vitre : CH. 18 — SIGNES VITAUX.'; },
    monitor: 'Une plaque sous l\'écran : « UNITÉ 17 / 24 — PROTOCOLE D\'OBÉISSANCE, VERSION 3 ».',
    light: 'Sur la douille de l\'ampoule, quelqu\'un a gravé : « 24 ».',
    mug: 'Une tasse de café froid. Personne ne l\'a bue.'
  };

  // Description des objets des poches (touchés dans l'inventaire).
  var DESCRIPTIONS = {
    tournevis: 'Un tournevis plat. Peut ouvrir les panneaux vissés de la pièce.',
    fusible: 'AUX 24 V — 10 A. Pièce de rechange pour le circuit de maintenance.',
    code: function (g) { return codeComplet(g) ? 'CODE COMPLET : 7412.' : g.has('code') ? 'Un code incomplet : 7 _ _ 2.' : 'Deux chiffres : 4, 1.'; },
    mot16: 'Le mot de 16 : « ILS MENTENT. » Au dos : « NE FAIS PAS CE QUE J\'AI FAIT. »',
    badge: '« SUJET 16 — ACCÈS MAINTENANCE B ». Peut-être utile ailleurs.',
    enregistrement: 'Un enregistrement technique récent du système.'
  };

  // Le Système se souvient des sessions précédentes (rangées dans le navigateur du joueur).
  var SESSIONS = {
    retour: ['Bon retour, Sujet 17.', 'Vous êtes déjà venu ici.', 'Nous reprenons là où nous nous étions arrêtés.'],
    fin: {
      curiosite: 'Vous aviez choisi le bouton. Encore ?',
      conforme: 'Votre dernière évaluation était satisfaisante.',
      employe: 'Votre poste d\'opérateur vous attendra.',
      isolement: 'Nous espérons que l\'isolement vous a été profitable.',
      gardien: 'Les sangles ne seront pas nécessaires cette fois.',
      tempsEcoule: 'Cette fois, vous êtes de ce côté de la vitre.',
      sujet18: 'Cette fois, vous êtes de ce côté de la vitre.',
      seulDehors: 'Vous étiez sorti. Vous êtes revenu.', porteDerobee: 'Vous étiez sorti. Vous êtes revenu.', evasion: 'Vous étiez sorti. Vous êtes revenu.', marche: 'Vous étiez sorti. Vous êtes revenu.',
      boucle: 'Restauration de session réussie.', revolte: 'Les chambres 01 à 24 ont été réinitialisées.', temoin: 'L\'opérateur a été remplacé.'
    },
    presses: function (n) { return 'La dernière fois, vous avez appuyé ' + n + ' fois.'; },
    deja18: '« J\'ai l\'impression de t\'avoir déjà parlé. »'
  };

  // Indices de l'écran de fin : « Une autre fin t'attendait si tu avais… »
  var INDICES_FINS = {
    conforme: 'obéi jusqu\'à la toute dernière pression.',
    employe: 'obéi sans faillir, puis découvert qui était vraiment la 18.',
    marche: 'accepté le marché de la porte, tant que la 18 vivait encore.',
    seulDehors: 'suivi la flèche « EXT. » dans le conduit.',
    porteDerobee: 'préparé une sortie sous le bureau au lieu de descendre.',
    evasion: 'fait semblant de t\'évanouir devant une caméra qui ne se méfiait pas.',
    cooperation: 'promis de venir, accepté son plan, puis aveuglé la caméra.',
    sauvetage: 'rampé jusqu\'à elle tant qu\'elle respirait encore.',
    tropTard: 'promis de venir, et laissé sa lumière s\'éteindre.',
    complice: 'gardé ton tournevis en allant la voir de près, sans éveiller les soupçons.',
    sujet18: 'rejoint la 18 les mains vides.',
    miroir: 'écouté ta propre voix jusqu\'au bout.',
    boucle: 'coupé l\'actionneur, gardé le badge de 16, puis compris ce qu\'était la 18.',
    isolement: 'désobéi devant la caméra une fois de trop.',
    gardien: 'simulé un malaise alors qu\'ils se méfiaient déjà de toi.',
    temoin: 'parlé à la personne derrière l\'objectif.',
    revolte: 'rétabli le courant auxiliaire, puis diffusé l\'enregistrement.',
    tempsEcoule: 'simplement attendu, jusqu\'au bout.',
    curiosite: 'appuyé alors que ta porte était ouverte.'
  };

  // Les lettres qu'on peut lire (affichées comme de vrais papiers).
  var LETTRES = {
    mot16: { recto: ['ILS MENTENT.'], signature: '—16', verso: ['NE FAIS PAS', 'CE QUE J\'AI FAIT.'] }
  };

  // Aides affichées pendant les premiers moments de la toute première partie.
  var AIDES = {
    libre: 'Touche les objets de la pièce pour agir. Le tiroir, par exemple.',
    ordre: 'Appuie sur le bouton pour obéir. Si tu ne le fais pas, l\'ordre est refusé.',
    appel: 'Touche le téléphone pour décrocher.'
  };

  var api = { FILS: FILS, OBJETS: OBJETS, CONFISCABLES: CONFISCABLES, ORDRES: ORDRES, VERITES: VERITES, SITUATIONS: SITUATIONS, FINS: FINS, INTRO: INTRO, CHRONO: CHRONO, HISTORIQUE: HISTORIQUE, REGARDS: REGARDS, AIDES: AIDES, DESCRIPTIONS: DESCRIPTIONS, LETTRES: LETTRES, SESSIONS: SESSIONS, INDICES_FINS: INDICES_FINS, PHRASES: PHRASES, MEMOIRE: MEMOIRE, DOUTES: DOUTES, REPLIQUES_OBJETS: REPLIQUES_OBJETS };
  if (typeof module === 'object' && module.exports) module.exports = api; else root.BRStory = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
