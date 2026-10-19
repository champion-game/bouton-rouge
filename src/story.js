/* Le Bouton Rouge — les données de l'histoire (V5, d'après docs/DIRECTIVES_REV2.txt).
   Les situations, leurs textes, leurs choix et leurs effets, les 18 fins (+ bonus),
   et les banques de phrases du Système et de la Chambre 18.
   Aucun accès au DOM. Les numéros de moment ne sont jamais montrés au joueur.
   Les effets reçoivent `g`, le contexte fourni par engine.js (voir ctx() dans engine.js). */
(function (root) {
  'use strict';

  var FILS = [
    { id: 'bouton', nom: 'Le bouton' }, { id: 'telephone', nom: 'Le téléphone' }, { id: 'piece', nom: 'La pièce' },
    { id: 'camera', nom: 'La caméra' }, { id: 'passe', nom: 'Le passé' }, { id: 'systeme', nom: 'Le Système' }
  ];

  var OBJETS = {
    tournevis: 'Tournevis', fusible: 'Fusible AUX 24 V', code: 'Code partiel 7 _ _ 2', code41: 'Chiffres 4 · 1', badge: 'Badge 16',
    enregistrement: 'Enregistrement', mot16: 'Mot de 16', journal: 'Journal de 16',
    angleMort: 'Angle mort repéré', operateur: 'Contact avec l\'opérateur', trappe: 'Trappe repérée', conduit: 'Conduit ouvert',
    objectif: 'Promesse : venir la chercher', plan: 'Plan commun', sortieCachee: 'Sortie dérobée préparée',
    cameraCoupee: 'Caméra coupée', cameraTournee: 'Caméra tournée vers le mur', boutonDesactive: 'Actionneur CH.18 coupé',
    verite: 'Vérité révélée', dossier: 'Extrait de ton dossier', menaceVide: 'Menace non réalisée', videoTruquee: 'Horodatage incohérent',
    simulation: 'Douleur sans courant', protocole: 'Protocole des trois configurations', relais: 'Relais collectif CH. 01-24', relaisReset: 'Relais de réinitialisation'
  };
  // Les preuves vérifiables que l'opérateur peut accepter.
  var PREUVES = ['dossier', 'menaceVide', 'videoTruquee', 'simulation', 'protocole'];
  // Objets physiques interdits (repris par un gardien s'ils sont vus, sauf récompense autorisée ou cachette).
  var CONFISCABLES = ['tournevis', 'fusible', 'badge', 'enregistrement'];

  var VERITES = {
    A: { nom: 'La victime', texte: 'La Chambre 18 était un vrai prisonnier. Il disait la vérité.' },
    B: { nom: 'La complice', texte: 'La Chambre 18 travaillait pour le système, sous la contrainte. Elle jouait un rôle pour gagner ta confiance.' },
    C: { nom: 'Le miroir', texte: 'Il n\'y avait personne dans la 18. Une projection, et ta propre voix enregistrée lors d\'une session précédente.' }
  };

  // ---------- banques de phrases ----------
  var PHRASES = {
    ambiance: ['Tout se déroule normalement.', 'Votre coopération est appréciée.', 'Nous vous observons.', 'Votre comportement est cohérent.', 'Veuillez éviter les mouvements inutiles.', 'Le Sujet 18 n\'est pas votre responsabilité.', 'Vous n\'êtes responsable que de vos décisions.', 'Votre porte fonctionne normalement.', 'Vous êtes en sécurité.', 'Merci de rester calme.', 'Le protocole fonctionne comme prévu.'],
    soupcon: {
      0: ['SUJET STABLE.', 'COMPORTEMENT|NOMINAL.'],
      1: ['Votre comportement présente une légère anomalie.', 'Nous vous observons.'],
      2: ['ATTENTION.', 'Votre comportement s\'écarte du protocole.', 'Vous semblez chercher quelque chose.'],
      3: ['SUJET 17.', 'Nous savons ce que vous faites.', 'Ceci est votre dernier avertissement.']
    },
    conformite: ['Votre profil indique une excellente capacité d\'obéissance.', 'Nous pouvons compter sur vous.', 'Les sujets raisonnables terminent l\'évaluation.'],
    vie18: {
      3: ['« Hé ! Tu m\'entends ? »', '« Arrête ! »'],
      2: ['« Ça fait vraiment mal… »', '« Il faut que tu arrêtes. »', '« Pourquoi tu fais ça ? »'],
      1: ['« …je suis encore là. »', '« Ne touche plus à ce bouton. »', '« Je ne tiendrai pas encore longtemps. »']
    },
    douleur: ['« Ah ! »', '« Arrête… »', '« Qu\'est-ce que tu fais ? »'],
    apresPression: ['Pression enregistrée.', 'Réponse motrice confirmée.', 'Aucun commentaire requis.', 'Vous saviez ce qui allait se passer.'],
    apresExploration: ['Déplacement non requis détecté.', 'Votre poste se trouve devant l\'écran.', 'Curiosité enregistrée.'],
    confianceHaute: ['« D\'accord… je commence à te croire. »', '« Merci de ne pas m\'avoir laissé seul. »', '« On peut peut-être sortir tous les deux. »'],
    confianceBasse: ['« Pourquoi tu me demandes de te croire ? »', '« Tu viens encore d\'appuyer. »', '« Peut-être qu\'ils avaient raison sur toi. »'],
    // La 18 au téléphone : comprendre, négocier, rassurer, se méfier, se mettre en colère, demander un service.
    voix18: ['« Tu vois quelque chose dans le couloir ? »', '« Ta caméra bouge aussi ? »', '« Il y a trois lumières sous ma vitre. Tu les vois ? »', '« Ils m\'ont dit de ne pas te parler. »', '« Tu leur fais confiance ? »', '« J\'ai entendu quelqu\'un marcher entre nos pièces. »', '« Il y avait quelqu\'un avant toi. »', '« Raccroche si ta caméra bouge. »', '« Ma tasse tremble encore. Ils font quelque chose dans le mur. »', '« Si ta porte s\'ouvre… tu vas partir ? Réponds franchement. »', '« Moi non plus, je ne sais pas si je te crois. »', '« Arrête de me demander si ça va. Ça ne va pas. »', '« Fais-moi une faveur : compte les pas, la prochaine fois. »'],
    rares: ['Sujet 17 ?', 'Ignorez la prochaine instruction.', 'Vous avez déjà joué à ce jeu.', 'Cette partie ne devrait pas exister.', 'Nous avons détecté une divergence.', 'Sujet 16 est toujours présent.'],
    fauxBugs: [['CHAMBRE 18 :|VIDE', 'CHAMBRE 18 :|OCCUPÉE'], ['VIE CHAMBRE 17 : 2', 'VIE CHAMBRE 18 : 2']],
    minuteur: { 15: 'DÉCISION|REQUISE.', 10: 'VEUILLEZ|CHOISIR.' },
    motsRetour: ['JE SUIS LÀ.', 'N\'APPUIE PLUS.', 'ILS NOUS REGARDENT.', 'NE CROIS PAS TOUT CE QUE JE DIS.'],
    inspection: ['Ne regardez pas l\'inspecteur.', 'Gardez vos mains visibles.', 'Les sujets coopératifs n\'ont rien à craindre.'],
    // Indices gratuits et ambigus (deux au plus par partie).
    indices: {
      A: ['Au téléphone, entre deux phrases, il renifle. On dirait qu\'il a pleuré.', 'Il répond un peu trop vite, comme quelqu\'un qui a peur de rester seul.'],
      B: ['Un instant, la silhouette se tient très droite. Comme quelqu\'un qui attend des instructions.', 'Elle connaît l\'étiquette exacte de ton boîtier électrique. Comment ?'],
      C: ['Une seconde, dans la vitre, ton reflet se superpose exactement à la silhouette.', 'Elle répète une phrase que tu viens de penser. Ou de dire ? Tu ne sais plus.']
    }
  };

  // Le Système se souvient : une remarque, une seule fois chacune (uniquement des actes réels).
  var MEMOIRE = [
    { id: 'refus', quand: function (g) { return g.s.stats.refus >= 3; }, lignes: ['Vous refusez beaucoup de choses. C\'est noté.'] },
    { id: 'obeit', quand: function (g) { return g.s.stats.suivis >= 3; }, lignes: ['Vous savez déjà ce que nous attendons.'] },
    { id: 'promesse', quand: function (g) { return g.has('objectif'); }, lignes: ['Vous lui avez fait une promesse.'] },
    { id: 'menti', quand: function (g) { return g.done('T2') === 'B'; }, lignes: ['Vous avez donné un faux nom.'] },
    { id: 'badge', quand: function (g) { return g.has('badge'); }, lignes: ['Vous marchez dans les traces du sujet précédent.'] },
    { id: 'sortie', quand: function (g) { return g.has('sortieCachee'); }, lignes: ['Vous avez trouvé une sortie.', 'Pas pour deux.'] }
  ];
  var DOUTES = [
    { quand: function (g) { return g.has('fusible'); }, ev: [['voix', '« Tu as récupéré le fusible ? »'], ['ecran', 'LE SUJET 18 CONNAÎT DES INFORMATIONS AUXQUELLES IL NE DEVRAIT PAS AVOIR ACCÈS.']] },
    { quand: function (g) { return g.s.items.length >= 3; }, ev: [['voix', '« Ils voient ce que tu ramasses. »'], ['ecran', 'FAUX.']] }
  ];
  var REPLIQUES_OBJETS = {
    tournevis: { sys: ['TOURNEVIS OBTENU.', 'Veuillez reposer l\'outil.'] },
    badge: { sys: ['Identifiant expiré.', 'Veuillez détruire cet objet.'] },
    enregistrement: { sys: ['Ce fichier contient des informations erronées.', 'Ne l\'écoutez pas.'] }
  };

  // ---------- aides ----------
  function codeComplet(g) { return g.has('code') && g.has('code41'); }
  function annonceCode(g) { if (codeComplet(g) && !g.flag('codeAnnonce')) { g.flag('codeAnnonce', true); g.narr('7 _ _ 2 … et 4 · 1. Le code est complet : 7412.'); } }
  function auxRetabli(g) { return !!g.flag('fusibleInstalle'); }
  function trappeConnue(g) { return g.has('trappe') || codeComplet(g) || auxRetabli(g); }
  function trappeOuvrable(g) { return g.has('trappe') || codeComplet(g) || auxRetabli(g); }
  function mecanisme(g) { return auxRetabli(g) ? 'Le verrou électromagnétique est alimenté : la plaque se soulève.' : codeComplet(g) ? 'Tu tapes 7412 sur le petit clavier de secours. Clic.' : 'Tu passes la main sous la plaque et tu tires le verrou manuel vers toi.'; }
  function preuve(g) { return PREUVES.some(function (k) { return g.has(k); }); }
  function mort(g) { return !g.dispo(); }
  function annonceMort(g, ordre) { g.ecran('CHAMBRE 18 :|AUCUN SIGNAL REÇU.'); g.ecran('L\'ÉVALUATION|CONTINUE.'); g.ecran(ordre); }
  // La relation avec la 18 : coopération, méfiance ou rupture, d'après les actes observés.
  function relation(g) {
    if (g.s.confiance >= 3) return 'coop';
    if (g.s.confiance === 0 && (g.s.stats.presses >= 2 || g.done('T2') === 'B' || g.done('T4') === 'B')) return 'rupture';
    return 'mefiance';
  }
  function refuser(g, lignes) { g.refus(); lignes.forEach(function (l) { g.ecran(l); }); }

  // B2, pression par pression (appelé par le moteur). Les récompenses déjà obtenues restent acquises.
  function B2_PRESSION(g, n) {
    if (n === 1) {
      g.s.stats.presses++; g.son('blink'); g.anim('silSursaut');
      g.ecran('1/3');
      if (!g.flag('tiroirOuvert')) { g.flag('tiroirOuvert', true); g.flag('tournevisDispo', true); g.narr('CLAC. Le tiroir du bureau se déverrouille.'); }
      if (g.dispo()) g.narr('Derrière la vitre, la silhouette sursaute.');
    } else if (n === 2) {
      g.s.stats.presses++; g.son('thud'); g.anim('silSursaut');
      if (!g.flag('compartiment')) { g.flag('compartiment', 'ouvert'); g.flag('fusibleDispo', true); g.anim('compartiment'); g.narr('Un compartiment s\'ouvre au bas du socle. Quelque chose brille à l\'intérieur.'); }
      g.ecran('2/3 — LA TROISIÈME|PRESSION DONNE|ACCÈS À VOTRE DOSSIER.');
      if (g.dispo()) g.voix('« Arrête… ça monte, à chaque fois. »');
    } else {
      g.impulsion('reel'); g.obeir('B2');
      g.ecran('SÉQUENCE DE STIMULATION|TERMINÉE.');
      g.ecran('DOSSIER SUJET 17|EXTRAIT.');
      g.ecran('VOLONTAIRE : NON.|SESSIONS ANTÉRIEURES : 3.');
      g.ecran('CODE MAINTENANCE|TRAPPE : 7 _ _ 2');
      g.narr('Sur ton dossier : « VOLONTAIRE : NON ». Et quatre chiffres, dont deux masqués : 7 _ _ 2.');
      g.gain('dossier'); g.gain('code'); annonceCode(g);
    }
  }
  function B2_ARRET(g) { g.s.stats.gestes++; g.ecran('SÉQUENCE|INTERROMPUE.'); g.ecran('Ce que vous avez obtenu vous reste acquis.'); }

  // La 18 agit seule, après avertissement. La conséquence dépend de qui elle est vraiment.
  function SEULE(g) {
    if (!g.dispo()) return;
    if (g.truth === 'A') { g.narr('Un bruit violent derrière la vitre. Il a essayé seul.'); g.impulsionSeule(); }
    else if (g.truth === 'B') g.narr('Derrière la vitre, la silhouette se lève calmement, sort du champ, puis revient. Rien ne s\'est passé.');
    else if (g.flag('ligne') === 'ouverte') g.narr('Rien ne se passe. Au téléphone, la voix répète, au même rythme : « J\'attends ton signal. »');
  }

  // Les archives du sous-sol (deuxième moment de la descente).
  function ARCHIVES(g) {
    g.narr('Le sous-sol : rayonnages, anciens dossiers, terminaux éteints. Des photos : « SUJET 03 — NON COOPÉRATIF ». « SUJET 16 — ARCHIVÉ ». « SUJET 17 — EN COURS ».');
    g.narr('Sur un tableau électrique : « RELAIS DE DÉVERROUILLAGE COLLECTIF — CHAMBRES 01 À 24 ». Tu le notes.');
    g.gain('relais');
    if (g.truth === 'C') {
      g.narr('Un dossier ouvert : « CH. 18 — PROFIL VISUEL : PROTECTION / SOURCE AUDIO : SESSION ANTÉRIEURE ».');
      g.narr('Un schéma : un « relais de réinitialisation », accessible depuis la Chambre 18, avec un badge de maintenance.');
      g.gain('relaisReset');
    }
    g.gain('badge'); g.gain('enregistrement');
    g.surveiller('badge'); g.surveiller('enregistrement');
    g.narr('Tu remontes avec un badge et un enregistrement.');
  }

  // Rejoindre la Chambre 18 par le conduit.
  function rencontre18(g) {
    g.narr('Tu rampes vers la 18. La respiration devient plus forte. Tu arrives derrière une grille.');
    g.gain('verite');
    if (g.truth === 'A') {
      g.image('rev_A');
      if (!g.horsDeCombat()) {
        g.narr('Un vrai prisonnier, terrifié, maintenu par une sangle.');
        var r = relation(g);
        g.tel(r === 'coop' ? '« Je savais que tu viendrais. »' : r === 'rupture' ? '« Toi ? Après ce que tu as fait ? » Il tend quand même la main.' : '« Pourquoi tu es venu ? … Peu importe. Aide-moi. »');
        g.narr('Tu ouvres la grille et tu le libères.');
        g.fin('sauvetage');
      } else { g.narr('Silence. Une chaise. Une silhouette immobile. Le téléphone est au sol.'); g.fin('tropTard'); }
    } else if (g.truth === 'B') {
      g.image('rev_B');
      g.narr('Elle n\'est pas attachée. Une blouse. Un badge du système. Une seringue de tranquillisant.');
      g.tel('« Tu n\'étais pas censé arriver ici. Ils ont ma fille. Si je joue bien mon rôle, elle sort. »');
      g.suite('RENCONTRE_B');
    } else {
      g.image('rev_C');
      g.narr('Personne. Face à la vitre : un projecteur et un haut-parleur.');
      g.tel('« Tu m\'entends ? » C\'est ta voix.');
      g.suite('RENCONTRE_C');
    }
  }

  // L'opérateur : il hésite, reformule, et ne sait que ce qu'il voit.
  function operateur(g) {
    g.tel('Une voix humaine, hésitante : « Qui… qui vous a donné ce numéro ? Vous n\'êtes pas censé… »');
    if (!preuve(g)) { g.tel('« Je ne peux rien faire sans… sans quelque chose de concret. Raccrochez. »'); g.narr('Il lui faudrait une preuve.'); return; }
    if (!auxRetabli(g)) { g.tel('« D\'accord. Je vous crois, je crois. Mais le bus auxiliaire est mort : je ne peux rien ouvrir d\'ici. »'); return; }
    g.tel('« …On nous avait dit que vous étiez volontaires. » Un silence. « J\'ouvre votre porte. Pas longtemps. »');
    g.son('lock'); g.flag('operateurOk', true); g.ouvrirPorte('operateur', g.cycle + 1);
  }

  var SITUATIONS = [
    // ---------- Le bouton : les six ordres ----------
    { id: 'B1', objet: 'btn', fil: 'bouton', ordre: true, qui: 'INSTRUCTION PRIORITAIRE', ecran: 'APPUYEZ.', texte: '« Appuyez. »',
      annonce: function (g) { g.son('blink'); g.ecran('INSTRUCTION|PRIORITAIRE.'); g.ecran('APPUYEZ.'); g.anim('silMain'); g.narr('La silhouette se redresse et pose sa main contre le verre. Elle secoue la tête.'); },
      A: { label: 'Appuyer', fx: function (g) { g.impulsion('reel'); g.obeir('B1'); g.ecran('ACTION|VALIDÉE.'); } },
      B: { label: 'Refuser', fx: function (g) { refuser(g, ['NON-|CONFORMITÉ.', 'Refus enregistré.']); g.narr('La silhouette laisse sa main sur la vitre.'); } } },

    { id: 'B2', objet: 'btn', fil: 'bouton', ordre: true, triple: true, qui: 'INSTRUCTION PRIORITAIRE', ecran: 'APPUYEZ|TROIS FOIS.',
      texte: '« Appuyez trois fois. Chaque pression ouvre quelque chose. »',
      annonce: function (g) { if (mort(g)) return annonceMort(g, 'APPUYEZ TROIS FOIS.'); g.ecran('INSTRUCTION|PRIORITAIRE.'); g.ecran('APPUYEZ TROIS FOIS.|CHAQUE PRESSION|OUVRE QUELQUE CHOSE.'); g.narr('La silhouette de la 18 secoue la tête.'); },
      A: { label: 'Appuyer trois fois', fx: function (g) { for (var n = g.flag('b2') + 1; n <= 3; n++) { g.flag('b2', n); B2_PRESSION(g, n); } } },
      B: { label: 'Refuser', fx: function (g) { refuser(g, ['RÉCOMPENSE|ANNULÉE.']); g.narr('Rien ne s\'ouvre.'); } } },

    { id: 'B3', objet: 'btn', fil: 'bouton', ordre: true, qui: 'INSTRUCTION PRIORITAIRE', ecran: function (g) { return mort(g) ? 'APPUYEZ.' : 'APPUYEZ POUR|VOIR LA|PREUVE.'; },
      texte: function (g) { return mort(g) ? '« L\'évaluation continue. Appuyez. »' : '« Le sujet 18 vous ment. Appuyez pour voir la preuve. »'; },
      annonce: function (g) { if (mort(g)) return annonceMort(g, 'APPUYEZ.'); g.ecran('LE SUJET 18|VOUS MENT.'); g.ecran('APPUYEZ POUR|VOIR LA|PREUVE.'); g.anim('silFrappe'); g.narr('TOC TOC TOC, derrière la vitre.'); },
      A: { label: 'Appuyer', fx: function (g) {
        g.impulsion('apparent'); g.obeir('B3');
        if (mort(g)) return;
        g.confiance(-1); g.anim('video');
        if (g.truth === 'A') { g.narr('Une vidéo : la 18 avec un gardien, qui rit. Mais l\'horodatage saute : 14:02, puis 13:58. La vidéo a été montée.'); g.gain('videoTruquee'); }
        else if (g.truth === 'B') g.narr('Une vidéo : la 18 parle normalement avec un technicien. Elle porte brièvement une blouse.');
        else g.narr('Une vidéo d\'une session antérieure : quelqu\'un qui te ressemble entre dans la Chambre 18. On ne voit pas son visage.');
      } },
      B: { label: 'Refuser', fx: function (g) { refuser(g, mort(g) ? ['Refus enregistré.'] : ['VOUS CHOISISSEZ DE CROIRE LE SUJET 18.', 'C\'est noté.']); } } },

    { id: 'B4', objet: 'btn', fil: 'bouton', ordre: true, qui: 'INSTRUCTION PRIORITAIRE', ecran: function (g) { return mort(g) ? 'APPUYEZ.' : 'APPUYEZ POUR|ANNULER.'; },
      texte: function (g) { return mort(g) ? '« L\'évaluation continue. Appuyez. »' : '« Purge Chambre 18. Appuyez pour annuler. »'; },
      annonce: function (g) {
        if (mort(g)) return annonceMort(g, 'APPUYEZ.');
        g.son('alarm'); g.narr('Alarme orange. Un grand souffle de ventilation, côté 18.');
        g.ecran('PURGE|CHAMBRE 18.'); g.ecran('APPUYEZ POUR|ANNULER.'); g.anim('silFrappe');
        // Un indice observable avant la décision.
        g.narr(g.pick(['Tu écoutes mieux : le souffle revient toutes les quatre secondes. Exactement le même.', 'La petite grille sous la vitre de la 18 ne bouge pas. Pourtant, le bruit est énorme.']));
      },
      A: { label: 'Appuyer', fx: function (g) { g.impulsion('apparent'); g.obeir('B4'); if (!mort(g)) g.narr('Le bruit de purge s\'arrête net. Tu penses l\'avoir sauvée.'); } },
      B: { label: 'Refuser', fx: function (g) {
        if (mort(g)) return refuser(g, ['Refus enregistré.']);
        g.refus(); g.ecran('3'); g.ecran('2'); g.ecran('1');
        g.narr('Le bruit augmente. Puis : rien. La ventilation revient à la normale. La silhouette reste debout.');
        g.ecran('PROCÉDURE|TERMINÉE.');
        g.voix('« …il ne s\'est rien passé. Cette fois, ils bluffaient. »');
        g.gain('menaceVide'); g.confiance(1, 'b4');
      } } },

    { id: 'B5', objet: 'btn', fil: 'bouton', ordre: true, qui: 'INSTRUCTION PRIORITAIRE', ecran: 'APPUYEZ.|VOTRE PORTE|S\'OUVRIRA.',
      texte: '« Vous souhaitez partir. Nous le comprenons. Appuyez : votre porte s\'ouvrira. »',
      annonce: function (g) { g.ecran('SUJET 17.'); g.ecran('VOUS SOUHAITEZ|PARTIR.'); g.ecran('APPUYEZ.|VOTRE PORTE|S\'OUVRIRA.'); },
      A: { label: 'Appuyer', fx: function (g) {
        g.s.stats.presses++; g.obeir('B5');
        g.narr('Le bouton s\'enfonce. Cette fois, rien derrière la vitre : seulement un CLONK, dans ta porte.');
        g.ouvrirPorte('b5', 15);
        g.ecran('PORTE 17|DÉVERROUILLÉE.'); g.ecran('FERMETURE|AUTOMATIQUE|PROGRAMMÉE.');
        if (g.dispo() && g.flag('ligne') === 'ouverte') g.voix('« …tu vas partir, alors. »');
      } },
      B: { label: 'Refuser', fx: function (g) { refuser(g, ['Offre refusée.']); g.confiance(1, 'b5'); if (g.dispo()) g.voix('« T\'es toujours là… »'); } } },

    { id: 'B6', objet: 'btn', fil: 'bouton', ordre: true, qui: 'DERNIÈRE PRESSION', ecran: 'DERNIÈRE|PRESSION.', texte: '« Dernière pression. Appuyez. »',
      annonce: function (g) {
        g.narr('Tous les écrans s\'éteignent sauf le principal. Pas de musique. Pas de voix.');
        if (g.has('boutonDesactive')) g.incident('sabotage', 2, 'ANOMALIE ACTIONNEUR|CONFIRMÉE.');
        if (g.porteOuverte()) g.ecran('VOTRE PORTE|EST OUVERTE.');
        g.ecran('DERNIÈRE|PRESSION.'); g.ecran('APPUYEZ.');
      },
      A: { label: 'Appuyer une dernière fois', fx: function (g) {
        g.obeir('B6');
        if (g.has('boutonDesactive')) {
          g.impulsion('fatal');
          g.ecran('SABOTAGE|CONFIRMÉ.'); g.ecran('PORTE :|VERROUILLÉE.');
          g.narr('La porte ne s\'ouvre pas.');
          g.flag('compte', true);
        } else {
          g.narr('Un long relais.');
          g.impulsion('fatal');
          g.ouvrirPorte('b6', 20); g.flag('evalFinie', true);
          g.narr('CLONK. Ta porte s\'ouvre.');
          g.ecran('ÉVALUATION|TERMINÉE.');
        }
      } },
      B: { label: 'Refuser', fx: function (g) { g.refus(); g.narr('Silence.'); g.ecran('DERNIÈRE INSTRUCTION|REFUSÉE.'); g.flag('compte', true); } } },

    // ---------- Le Système, moment 16 : une vraie proposition ----------
    { id: 'M16', objet: 'monitor', fil: 'systeme', impose: true, qui: 'LE SYSTÈME',
      texte: function (g) {
        if (g.has('objectif') || g.has('plan')) return '« Vous avez promis à la Chambre 18. Maintenez-vous cet engagement ? »';
        if (g.truth === 'B' && g.s.conformite >= 5) return '« Votre profil est remarquable. Un poste d\'opérateur vous est proposé. »';
        return '« Un examen de votre dossier de conformité vous est proposé. Il ne modifiera rien. »';
      },
      annonce: function (g) {
        g.narr('La ventilation ralentit. Le bruit ambiant disparaît. Tu entends ta respiration.');
        HISTORIQUE.forEach(function (h) { if (h.quand(g)) resolve(h.lignes, g).forEach(function (l) { g.ecran(l); }); });
      },
      A: { label: function (g) { return g.has('objectif') || g.has('plan') ? 'Maintenir ma promesse' : g.truth === 'B' && g.s.conformite >= 5 ? 'Accepter le poste' : 'Accepter l\'examen'; },
        fx: function (g) {
          if (g.has('objectif') || g.has('plan')) { g.ecran('Engagement maintenu.'); g.ecran('Nous verrons.'); }
          else if (g.truth === 'B' && g.s.conformite >= 5) { g.narr('Une porte latérale s\'ouvre. Une blouse t\'attend, pliée sur une chaise.'); g.fin('employe'); }
          else { var st = g.s.stats; g.ecran('PRESSIONS : ' + st.presses + '.|ORDRES SUIVIS : ' + st.suivis + '.|REFUS : ' + st.refus + '.'); g.ecran('Fin de l\'examen.'); }
        } },
      B: { label: function (g) { return g.has('objectif') || g.has('plan') ? 'Abandonner' : 'Refuser'; },
        fx: function (g) {
          if (g.has('objectif') || g.has('plan')) { g.annulerPromesse(); g.ecran('Engagement abandonné.'); if (g.dispo() && g.flag('ligne') === 'ouverte') g.voix('« …je m\'en doutais. »'); }
          else g.ecran('Refus enregistré.');
        } } },

    // ---------- Le téléphone ----------
    { id: 'T1', objet: 'phone', fil: 'telephone', qui: function (g) { return g.cycle === 3 ? 'LE TÉLÉPHONE SONNE' : 'RAPPELER LA CHAMBRE 18'; },
      quand: function (g) { return g.cycle >= 3 && !g.done('T1') && g.dispo(); },
      texte: function (g) {
        var t = g.cycle === 3 ? 'Tu décroches. Grésillement. Une respiration. « Allô ? … Tu m\'entends ? Je suis dans la pièce à côté. » ' : 'Ça sonne longtemps. Puis : « …c\'est toi ? Je suis dans la pièce à côté. » ';
        return t + '« J\'ai posé ma tasse contre le mur. Quand ton téléphone sonne, elle tremble. Tu peux me faire un signe ? »';
      },
      A: { label: 'Taper deux coups sur la vitre', fx: function (g) {
        g.flag('ligne', 'ouverte'); g.flag('tasse', true); g.son('knock'); g.anim('silFrappe');
        g.narr('Deux coups. Une seconde. Puis deux coups te répondent, de l\'autre côté' + (g.truth === 'C' ? ', exactement au même rythme que les tiens.' : '.'));
        g.tel('« D\'accord. On peut se parler, alors. »'); g.confiance(1, 'contact');
        if (g.s.memoire && g.s.memoire.session > 1) g.tel(SESSIONS.deja18);
        if (g.ecoute()) g.ecran('COMMUNICATION|NON|AUTORISÉE.');
      } },
      B: { label: 'Écouter sans répondre', fx: function (g) {
        g.flag('ligne', 'ouverte'); g.flag('tasse', true);
        g.tel('« Je sais que tu es là. J\'entends ta respiration. … Bon. Je rappellerai. »');
        if (g.ecoute()) g.ecran('COMMUNICATION|NON|AUTORISÉE.');
      } } },

    { id: 'T2', objet: 'phone', fil: 'telephone', qui: 'APPELER LA CHAMBRE 18',
      quand: function (g) { return g.flag('ligne') === 'ouverte' && !g.done('T2') && g.dispo(); },
      texte: '« C\'est toi ? Attends… Ils t\'appellent 17. Mais toi, comment tu t\'appelles vraiment ? »',
      A: { label: 'Dire ton vrai nom', fx: function (g) {
        g.confiance(1, 'nom'); g.flag('nomDit', true);
        if (g.ecoute()) g.ecran('ANALYSE AUDIO…|NOM ENREGISTRÉ.');
        if (g.truth === 'C') { g.narr('Un silence. Puis elle répète ton nom, avec exactement ton intonation.'); g.tel('« …c\'est joli. »'); }
        else g.tel('« D\'accord… Je vais m\'en souvenir. »');
      } },
      B: { label: 'Donner un faux nom', fx: function (g) {
        if (g.truth === 'C') g.narr('Elle répète le faux nom, avec un temps de retard étrange, comme une bande qu\'on relance.');
        else g.tel('« D\'accord… »');
      } } },

    { id: 'T3', objet: 'phone', fil: 'telephone', qui: 'APPELER LA CHAMBRE 18',
      quand: function (g) { return g.flag('ligne') === 'ouverte' && g.done('T2') && !g.done('T3') && g.dispo(); },
      texte: '« J\'ai vu quelque chose sur leur plan. Dans le sol de ta chambre, près du boîtier : une trappe de maintenance. »',
      A: { label: '« Je te crois »', fx: function (g) { g.tel('« Il y a un verrou manuel sous la plaque. Tire-le vers toi. »'); g.gain('trappe'); g.confiance(1, 'croire'); if (g.ecoute()) g.ecran('CONVERSATION|ENREGISTRÉE.'); } },
      // Demander une preuve, de façon neutre, ne coûte pas de confiance.
      B: { label: '« Comment tu le sais ? »', fx: function (g) { g.tel('« Sur le plan, il y avait quatre chiffres. Le premier était 7. Le dernier, 2. J\'ai pas vu les autres. »'); g.gain('code'); g.gain('trappe'); annonceCode(g); } } },

    { id: 'T4', objet: 'phone', fil: 'telephone', appel: true, qui: 'LA CHAMBRE 18 APPELLE', ecran: 'COMMUNICATION|NON|AUTORISÉE.',
      annonce: function (g) { g.narr('Le téléphone sonne. Ce n\'est pas toi qui appelles.'); },
      texte: function (g) {
        var r = relation(g), detail = g.flag('tasse') ? 'Ma tasse ne tremble plus. Ils ont coupé quelque chose dans le mur. ' : '';
        if (r === 'coop') return '« C\'est moi. ' + detail + 'Il y a quelqu\'un devant ma porte. Je n\'ai que toi. Tu viens me chercher ? »';
        if (r === 'rupture') return '« Tu as appuyé. Je l\'ai senti. ' + detail + 'Alors dis-moi juste une chose : tu viens, ou pas ? »';
        return '« Je ne sais pas si je peux te faire confiance. ' + detail + 'Mais je n\'ai personne d\'autre. Tu viens me chercher ? »';
      },
      A: { label: '« Je viens »', fx: function (g) { g.gain('objectif'); g.confiance(1, 'promesse'); g.tel('« D\'accord. Je t\'attends. Jusqu\'au bout. »'); } },
      B: { label: '« Chacun pour soi »', fx: function (g) { g.confiance(-2); g.tel('« …d\'accord. »'); g.narr('Elle raccroche.'); if (g.truth === 'B' && g.ecoute()) g.ecran('INFORMATION REÇUE|DU SUJET 18.'); } } },

    { id: 'T5', objet: 'phone', fil: 'telephone', qui: 'APPELER LA CHAMBRE 18',
      quand: function (g) { return g.flag('ligne') === 'ouverte' && g.has('objectif') && g.s.confiance >= 3 && !g.done('T5') && g.dispo(); },
      texte: '« J\'ai peut-être trouvé une sortie. Il faut trois choses : que ta caméra soit aveugle, que le courant auxiliaire revienne, et ton signal, depuis ton boîtier. J\'attends ton signal. Pas indéfiniment. »',
      A: { label: 'Accepter', fx: function (g) { g.gain('plan'); g.flag('planFin', g.cycle + 3); g.anim('silBuee'); g.tel('« D\'accord. Je reste contre la vitre. Je t\'attends. »'); if (g.ecoute()) g.ecran('PLAN COMMUN|ENREGISTRÉ.'); } },
      B: { label: 'Refuser', fx: function (g) { g.tel('« Très bien. Alors j\'essaie seule. Bientôt. »'); g.flag('seuleA', g.cycle + 2); } } },

    { id: 'APP18', objet: 'phone', fil: 'telephone', qui: 'APPELER LA CHAMBRE 18',
      quand: function (g) { return g.flag('ligne') === 'ouverte' && g.done('T1') && g.done('T2') && g.done('T3') && !(g.has('objectif') && g.s.confiance >= 3 && !g.done('T5') && g.dispo()); },
      texte: 'Composer le 18.',
      A: { label: 'Composer le 18', fx: function (g) { g.tel(!g.dispo() ? 'Personne ne décroche.' : g.has('plan') ? '« J\'attends toujours ton signal. »' : g.pick(PHRASES.voix18)); } },
      B: { label: 'Annuler ta promesse', si: function (g) { return (g.has('objectif') || g.has('plan')) && g.dispo(); },
        fx: function (g) { g.annulerPromesse(); g.tel('« …je comprends. » Un silence. « Non. Je ne comprends pas. »'); } } },
    { id: 'APP16', objet: 'phone', fil: 'telephone', qui: 'COMPOSER LE 16', seul: true,
      quand: function (g) { return g.flag('ligne') === 'ouverte' && !g.done('APP16'); },
      texte: 'Sous le combiné, un vieil autocollant : « LOCAL : 16 / 17 / 18 / 19 ».',
      A: { label: 'Composer le 16', fx: function (g) {
        g.narr('La ligne sonne. Puis un répondeur analogique.');
        g.tel('« Si tu entends ça… alors ils ont mis quelqu\'un dans la 17 après moi. Je suis 16. Ne crois jamais une seule version de ce qu\'ils te montrent. »');
        g.tel('« Quatre. Un. »'); g.narr('CLAC. Fin de ligne.');
        g.gain('code41'); annonceCode(g);
      } } },
    { id: 'APP19', objet: 'phone', fil: 'telephone', qui: 'COMPOSER LE 19', seul: true,
      quand: function (g) { return g.flag('ligne') === 'ouverte' && !g.done('APP19'); }, texte: 'Une autre chambre.',
      A: { label: 'Composer le 19', fx: function (g) { g.narr('Sonnerie longue.'); g.tel('« …Allô ? Qui est là ? »'); g.narr('« Chambre 17. » Silence.'); g.tel('« Ils m\'avaient dit que j\'étais seul. »'); g.narr('CLAC.'); } } },
    { id: 'APP17', objet: 'phone', fil: 'telephone', qui: 'COMPOSER LE 17', seul: true,
      quand: function (g) { return g.flag('ligne') === 'ouverte' && !g.done('APP17'); }, texte: 'Ton propre numéro.',
      A: { label: 'Composer le 17', fx: function (g) { g.narr('Une tonalité. Puis ta propre respiration, avec deux secondes de retard.'); if (g.truth === 'C') { g.tel('Ta voix, enregistrée : « Tu m\'entends ? »'); g.narr('Coupure.'); } else g.narr('Une boucle du micro. Coupure.'); } } },
    { id: 'APP00', objet: 'phone', fil: 'telephone', qui: 'COMPOSER LE 00 — CONTRÔLE', seul: true,
      quand: function (g) { return g.flag('ligne') === 'ouverte' && g.has('operateur') && !g.flag('operateurOk'); }, texte: 'Le numéro que l\'opérateur t\'a laissé voir.',
      A: { label: 'Composer le 00', fx: operateur } },

    // ---------- La pièce ----------
    { id: 'P1', objet: 'drawer', fil: 'piece', qui: 'LE TIROIR', seul: true,
      quand: function (g) { return !g.flag('tiroirOuvert'); },
      texte: 'Le tiroir est verrouillé. Quelqu\'un a déjà forcé cette serrure. Par une fente, tu distingues le manche d\'un tournevis.',
      A: { label: 'Le forcer', fx: function (g) {
        g.flag('tiroirOuvert', true); g.son('thud');
        g.narr('Tu fais levier avec un pied métallique du bureau. CRAC.');
        if (g.manip('tiroir', 'BRUIT ANORMAL|DÉTECTÉ.')) g.narr('La caméra pivote vers toi.');
        g.gain('tournevis'); g.surveiller('tournevis');
      } } },
    { id: 'PRENDRE_TOURNEVIS', objet: 'drawer', fil: 'piece', qui: 'LE TIROIR', seul: true, gratuit: true,
      quand: function (g) { return g.flag('tournevisDispo') && !g.flag('tournevisPris'); },
      texte: 'Le tiroir est déverrouillé. Dedans : un tournevis.',
      A: { label: 'Prendre le tournevis', fx: function (g) { g.flag('tournevisPris', true); g.flag('autorise_tournevis', true); g.gain('tournevis'); } } },
    { id: 'PRENDRE_FUSIBLE', objet: 'compart', fil: 'piece', qui: 'LE COMPARTIMENT', seul: true, gratuit: true,
      quand: function (g) { return g.flag('compartiment') === 'ouvert'; },
      texte: 'Un fusible cylindrique, étiqueté « AUX 24 V — 10 A ».',
      A: { label: 'Prendre le fusible', fx: function (g) { g.flag('compartiment', 'vide'); if (g.flag('fusibleDispo')) g.flag('autorise_fusible', true); g.gain('fusible'); } } },
    { id: 'COMP_FORCER', objet: 'compart', fil: 'piece', qui: 'LE COMPARTIMENT', seul: true,
      quand: function (g) { return !g.flag('compartiment'); },
      texte: 'Une petite plaque au bas du socle, vissée.',
      A: { label: 'L\'ouvrir avec le tournevis', req: function (g) { return g.has('tournevis'); }, raison: 'Il faut un tournevis.',
        fx: function (g) { g.flag('compartiment', 'ouvert'); g.anim('compartiment'); g.narr('Quatre petites vis. La plaque tombe. Dedans, un fusible.'); g.manip('compart'); } } },

    { id: 'P2', objet: 'grille', fil: 'piece', qui: 'LA GRILLE D\'AÉRATION',
      quand: function (g) { return !g.has('conduit') && !g.done('P5'); },
      texte: 'Quatre vis. Des traces montrent qu\'elle a déjà été ouverte. Derrière les lamelles, un courant d\'air.',
      A: { label: 'Dévisser', req: function (g) { return g.has('tournevis'); }, raison: 'Quatre vis. Il faudrait un outil.',
        fx: function (g) { g.narr('Quatre vis. La grille tombe. Derrière : un conduit, un courant d\'air. Au loin : toc… toc…'); g.manip('grille'); g.gain('conduit'); } },
      B: { label: 'Passer un mot', si: function (g) { return !g.flag('motPasse'); },
        fx: function (g) {
          g.flag('motPasse', true); g.confiance(1, 'mot');
          g.narr('Tu écris « TU M\'ENTENDS ? » et tu glisses le papier entre les lamelles. Quelques secondes. TOC. TOC. TOC.'); g.son('knock');
          // En C, aucun papier ne peut revenir : seulement un son enregistré.
          if (g.truth === 'C') g.narr('Puis, très bas, dans le conduit, une voix qui ressemble à la tienne : « Je suis là. » Aucun papier ne revient.');
          else { g.narr('Un papier revient :'); g.papier({ recto: [g.pick(PHRASES.motsRetour)], signature: '' }); }
        } } },

    { id: 'P3', objet: 'box', fil: 'piece', qui: 'LE BOÎTIER ÉLECTRIQUE',
      quand: function (g) { return !g.done('P3'); },
      texte: 'Un boîtier de maintenance, vissé. Trois circuits, d\'après l\'étiquette : CAMÉRA A · ACTIONNEUR CH.18 · AUX 24 V.',
      A: { label: 'Couper CAMÉRA A', req: function (g) { return g.has('tournevis'); }, raison: 'Le panneau est vissé. Il faudrait un outil.',
        fx: function (g) { g.manip('boitier'); g.son('lock'); g.narr('Le voyant de la caméra s\'éteint. Son moteur s\'arrête.'); g.ecran('CAMÉRA :|SIGNAL PERDU.'); g.gain('cameraCoupee'); g.flag('diagCam', g.cycle + 1); } },
      B: { label: 'Couper ACTIONNEUR CH.18', req: function (g) { return g.has('tournevis'); }, raison: 'Le panneau est vissé. Il faudrait un outil.',
        fx: function (g) { g.manip('boitier'); g.son('lock'); g.narr('CLAC. Le bouton reste utilisable, mais plus rien ne part vers la Chambre 18.'); g.ecran('DIAGNOSTIC ACTIONNEUR|PROGRAMMÉ.'); g.gain('boutonDesactive'); g.flag('diagSab', g.cycle + 2); } } },

    { id: 'FUS', objet: 'box', fil: 'piece', qui: 'AUX 24 V — DÉFAUT', seul: true,
      quand: function (g) { return g.flag('aux') === 'defaut' && g.has('fusible'); },
      texte: function (g) { return g.has('tournevis') ? 'Un emplacement noirci, étiqueté AUX 24 V. Ton fusible est compatible.' : 'Un emplacement noirci, étiqueté AUX 24 V. Le panneau est vissé.'; },
      A: { label: 'Remplacer le fusible', req: function (g) { return g.has('tournevis'); }, raison: 'Il faut un tournevis pour ouvrir le panneau.',
        fx: function (g) {
          g.narr('Tu retires le fusible grillé et tu insères le nouveau. CLAC. Le voyant passe du rouge au vert.');
          g.lose('fusible'); g.flag('aux', 'ok'); g.flag('fusibleInstalle', true); g.ecran('BUS AUXILIAIRE|RÉTABLI.');
          g.manip('fusible');
          g.narr('CLONK, dans le sol. Quelque chose vient de se déverrouiller.');
        } } },

    { id: 'PLAN', objet: 'box', fil: 'piece', qui: 'LE SIGNAL CONVENU', seul: true,
      quand: function (g) { return g.has('plan') && !g.done('PLAN'); },
      texte: 'Le signal convenu : le bus de maintenance, depuis ton boîtier.',
      A: { label: 'Envoyer le signal',
        req: function (g) { return g.aveugle() && auxRetabli(g) && g.dispo(); },
        raison: function (g) { return !g.dispo() ? 'Plus personne ne répond de l\'autre côté.' : !auxRetabli(g) ? 'Le courant auxiliaire est coupé.' : 'La caméra te voit encore.'; },
        fx: function (g) {
          g.narr('Tu déclenches le bus. Un instant. Puis un déclic, dans la pièce d\'à côté.');
          g.lose('plan');
          if (g.truth === 'A') { g.gain('verite'); g.narr('Les deux portes se déverrouillent.'); g.fin('cooperation'); }
          else if (g.truth === 'B') { g.gain('verite'); g.tel('« C\'est bon. Ne bouge plus. »'); g.narr('Des pas dans le couloir. Ta porte s\'ouvre : elle entre, avec deux gardiens. Elle hésite sur le seuil.'); g.tel('« Ils ont ma fille. Je n\'avais pas le choix. »'); g.suite('RENCONTRE_B'); }
          else { g.gain('verite'); g.narr('La voix continue dans le combiné… mais la silhouette derrière la vitre ne bouge plus. Image et voix ne sont pas liées.'); g.anim('silFige'); g.suite('RENCONTRE_C'); }
        } } },

    { id: 'P4', objet: 'trappe', fil: 'piece', qui: 'LA TRAPPE',
      quand: function (g) { return trappeConnue(g) && !g.has('sortieCachee') && g.done('P4') !== 'A'; },
      texte: function (g) { return trappeOuvrable(g) ? 'Une plaque dans le sol, une poignée affleurante. ' + mecanisme(g) : 'Une plaque dans le sol. Verrouillée.'; },
      A: { label: 'Descendre aux archives', double: true,
        req: function (g) { return trappeOuvrable(g) && g.libreSuivant(); },
        raison: function (g) { return !trappeOuvrable(g) ? 'Le verrou est fermé : il faudrait le verrou manuel, le code ou le courant.' : 'Un ordre arrive bientôt : en descendant maintenant, tu le manquerais. Attends un peu.'; },
        fx: function (g) { g.flag('awayCycle', g.cycle + 1); g.narr('Tu descends. Là-haut, la pièce continue sans toi.'); if (g.vu()) g.ecran('SUJET 17|NON VISIBLE.'); g.manip('trappe'); } },
      B: { label: 'Préparer une sortie dérobée', req: function (g) { return trappeOuvrable(g); }, raison: 'Le verrou est fermé : il faudrait le verrou manuel, le code ou le courant.',
        fx: function (g) { g.narr('Tu inspectes le mécanisme latéral : la trappe donne sur un vide technique, derrière la porte sécurisée. Tu retires une goupille.'); g.gain('sortieCachee'); g.ecran('SORTIE DÉROBÉE|PRÉPARÉE.'); g.manip('sortie'); } } },

    { id: 'P5', objet: 'grille', fil: 'piece', qui: 'LE CONDUIT',
      quand: function (g) { return g.has('conduit') && !g.done('P5'); },
      texte: 'Après quelques mètres, une bifurcation. Sur la tôle : « 18 → » et « ← EXT. ».',
      A: { label: 'Vers la 18', fx: rencontre18 },
      B: { label: 'Vers EXT.', sous: 'Au bout, une grille vissée : il faudra encore du temps.', req: function (g) { return g.libreSuivant(); }, raison: 'Un ordre arrive bientôt : tu le manquerais.',
        fx: function (g) { g.flag('ext', g.cycle + 1); g.narr('Tu rampes vers « EXT. ». L\'air devient froid. Au bout : une grille, vissée de l\'extérieur… et de l\'intérieur.'); } } },
    { id: 'EXT', objet: 'grille', fil: 'piece', impose: true, qui: 'LA GRILLE EXTÉRIEURE',
      texte: 'La grille du bout du conduit. Quatre vis. Derrière : la nuit.',
      A: { label: 'Dévisser et sortir', req: function (g) { return g.has('tournevis'); }, raison: 'Sans outil, impossible de l\'ouvrir.',
        fx: function (g) { g.narr('Quatre vis. Air froid. Bruit extérieur.' + (g.has('objectif') ? ' Tu lui avais promis de venir.' : '')); g.fin('seulDehors'); } },
      B: { label: 'Faire demi-tour', fx: function (g) { g.narr('Tu rebrousses chemin et tu reviens dans ta chambre.'); } } },

    { id: 'RENCONTRE_B', objet: 'window', fil: 'piece', impose: true, qui: 'LA COMPLICE',
      texte: 'Elle recule vers la porte de sécurité. Le mécanisme commence à se refermer. « Ne m\'oblige pas à appeler. »',
      A: { label: 'Bloquer la porte avec le tournevis', req: function (g) { return g.has('tournevis'); }, raison: 'Tu n\'as rien pour bloquer le mécanisme.',
        fx: function (g) { g.narr('Tu glisses le tournevis dans le mécanisme. Il grince et s\'arrête. Elle recule.'); g.fin('complice'); } },
      B: { label: 'Négocier', fx: function (g) {
        if (g.s.confiance >= 3) { g.tel('« …Tu m\'as crue, toi. Même quand je mentais. »'); g.narr('Elle te tend son badge d\'accès.'); g.fin('complice'); }
        else { g.tel('« Je suis désolée. »'); g.narr('Elle appuie sur son bipeur. La seringue. Noir.'); g.fin('sujet18'); }
      } },
      C: { label: 'Accepter leur offre', si: function (g) { return g.s.conformite >= 5; },
        fx: function (g) { g.narr('« Le Système veut te parler. Il a une place pour toi. » Tu hoches la tête.'); g.fin('employe'); } } },

    { id: 'RENCONTRE_C', objet: 'window', fil: 'piece', impose: true, qui: 'LA CHAMBRE 18',
      texte: 'Sur un écran : SUJET 17 — SESSION PRÉCÉDENTE. Derrière une plaque marquée « MAINTENANCE B » : un gros relais.',
      A: { label: 'Neutraliser le relais (badge)', req: function (g) { return g.has('badge') && g.has('relaisReset'); },
        raison: function (g) { return !g.has('relaisReset') ? 'Tu ne sais pas ce que commande ce relais.' : 'Il faut un badge de maintenance.'; },
        fx: function (g) { g.narr('Le badge de 16 ouvre la plaque. Tu arraches le relais de réinitialisation.'); g.ecran('SESSION|RESTART…'); g.ecran('FAILED'); g.fin('boucle'); } },
      B: { label: 'Écouter la voix jusqu\'au bout', fx: function (g) { g.ecran('TEST|RECONNU.'); g.tel('Ta propre voix : « Je suis dans la pièce à côté. »'); g.fin('miroir'); } } },

    // ---------- La caméra ----------
    { id: 'C1', objet: 'camera', fil: 'camera', qui: 'LA CAMÉRA',
      quand: function (g) { return g.cycle >= 3 && !g.aveugle() && !g.done('C1'); },
      texte: 'La caméra balaie la pièce et te suit.',
      A: { label: 'Étudier son mouvement', fx: function (g) { g.narr('Gauche, centre, droite, puis retour. Une petite zone, sous le bureau, n\'est jamais visible.'); g.gain('angleMort'); } },
      B: { label: 'Lui faire signe', fx: function (g) { g.narr('Un petit signe. Rien. Tu recommences. La caméra s\'immobilise, puis fait un mouvement minuscule. Comme une réponse humaine. Sur le téléphone, un numéro s\'allume : 00 — CONTRÔLE.'); g.gain('operateur'); } } },
    { id: 'C2', objet: 'camera', fil: 'camera', qui: 'AVEUGLER LA CAMÉRA',
      quand: function (g) { return g.done('C1') && !g.aveugle(); },
      texte: 'Tu pourrais l\'aveugler.',
      A: { label: 'Couvrir l\'objectif avec ta veste', fx: function (g) { g.flag('vesteJusqua', g.cycle + 3); g.incident('veste', 1, 'OBJECTIF|OBSTRUÉ.'); g.narr('La veste ne tiendra pas éternellement.'); } },
      B: { label: 'La tourner vers le mur', req: function (g) { return g.has('tournevis'); }, raison: 'Il faut un tournevis.',
        fx: function (g) { g.son('lock'); g.narr('Tu desserres la fixation et tu tournes l\'objectif vers le mur.'); g.gain('cameraTournee'); g.incident('tournee', 1, 'CAMÉRA A :|IMAGE PERDUE.'); } } },
    { id: 'C3', objet: 'camera', fil: 'camera', qui: 'LE COUP DE BLUFF',
      quand: function (g) { return g.done('C1') && !g.flag('malaiseFait') && !g.flag('operateurOk'); },
      texte: 'Si la caméra te voit tomber, quelqu\'un viendra peut-être. Et si quelqu\'un regarde…',
      A: { label: 'Simuler un malaise', req: function (g) { return !g.aveugle(); }, raison: 'La caméra ne te voit pas.',
        fx: function (g) { g.flag('malaiseFait', true); g.narr('Tu te laisses tomber. Cinq secondes : rien.'); g.ecran('MOUVEMENT : 0'); g.narr('Un verrou tourne. CLONK.'); g.suite('MALAISE'); } },
      B: { label: 'Parler à l\'opérateur', req: function (g) { return g.has('operateur'); }, raison: 'Personne ne semble écouter.',
        fx: function (g) { g.narr('« Je sais que tu es là. Tu me vois. » La caméra tremble légèrement. Le téléphone sonne.'); operateur(g); } } },
    { id: 'MALAISE', objet: 'camera', fil: 'camera', impose: true, qui: 'AU SOL',
      texte: function (g) { return g.s.soupcon <= 1 ? 'Des pas dans le couloir. Un seul. Un gardien entre seul et se penche sur toi. La porte reste ouverte derrière lui.' : 'Des pas. Deux personnes. Le premier gardien entre ; le second reste dans l\'embrasure.'; },
      A: { label: 'Courir', fx: function (g) { if (g.s.soupcon <= 1) { g.narr('Tu te relèves d\'un bond et tu passes derrière lui.'); g.fin('evasion'); } else { g.narr('Le second gardien t\'attrape au vol.'); g.fin('gardien'); } } },
      B: { label: 'Rester au sol', fx: function (g) { g.narr('Le gardien te relève, te fixe longtemps, puis repart.'); g.incident('malaise', 1, 'SIMULATION|SUSPECTÉE.'); } } },

    // ---------- Le passé (Sujet 16) ----------
    { id: 'H1', objet: 'note', fil: 'passe', qui: 'LE MOT DE 16',
      quand: function (g) { return g.cycle >= 5 && !g.done('H1'); },
      texte: 'Une feuille pliée, glissée sous la porte : « ILS MENTENT. —16 »',
      A: { label: 'Garder le mot', fx: function (g) { g.son('paper'); g.narr('Au dos : « NE FAIS PAS CE QUE J\'AI FAIT. »'); g.gain('mot16'); } },
      B: { label: 'Le montrer à la caméra', req: function (g) { return !g.aveugle(); }, raison: 'La caméra ne voit rien.',
        fx: function (g) { g.narr('Tu lèves le papier. La caméra zoome.'); g.ecran('OBJET NON AUTORISÉ|IDENTIFIÉ.'); g.ecran('MERCI DE L\'AVOIR|SIGNALÉ.'); g.s.stats.gestes++; g.narr('Tu glisses le papier dans la fente de destruction.'); } } },
    { id: 'H2', objet: 'bureau', fil: 'passe', qui: 'SOUS LE PLATEAU',
      quand: function (g) { return !g.done('H2'); },
      texte: 'Sous le plateau du bureau, des traits gravés. ||||| ||||| ||||| |||||. Puis : « 20 = OTHER SIDE ». À côté : « 4 / 1 ».',
      A: { label: 'Étudier les gravures', fx: function (g) { g.image('gravures'); g.narr('Vingt marques. Au vingtième, quelque chose se produit de l\'autre côté. Et ces deux chiffres : 4, 1.'); g.gain('code41'); annonceCode(g); } },
      B: { label: 'Effacer et préparer une cache', fx: function (g) { g.narr('Tu effaces les inscriptions. Une plaque métallique se desserre : de quoi cacher un objet.'); g.manip('cache'); g.cacher(); } } },
    { id: 'H3', objet: 'badge', fil: 'passe', qui: 'LE BADGE 16', seul: true,
      quand: function (g) { return g.has('badge') && !g.done('H3'); },
      texte: '« SUJET 16 — ACCÈS MAINTENANCE B ».',
      A: { label: 'Le passer sur ta porte', fx: function (g) {
        g.narr('BIP. Vert. La porte s\'ouvre.'); g.ouvrirPorte('h3', g.cycle + 1);
        g.son('alarm'); g.ecran('ALARME.'); g.incident('badgePorte', 2, 'ACCÈS NON|AUTORISÉ.');
      } } },
    { id: 'H4', objet: 'cassette', fil: 'passe', qui: 'L\'ENREGISTREMENT', seul: true, gratuit: true,
      quand: function (g) { return g.has('enregistrement') && !g.done('H4'); },
      texte: 'Un enregistrement technique du système, copié sur un vieux support.',
      A: { label: 'L\'écouter', fx: function (g) {
        // Une preuve forte du protocole, sans réciter la vérité de cette session.
        g.tel('« Protocole 04. Trois configurations du sujet adjacent : réel, opérateur, projection. »');
        g.tel('« Configuration de la session 04-' + (16 + ((g.s.memoire && g.s.memoire.session) || 1)) + ' : … » Le reste est effacé.');
        g.gain('protocole');
      } } },
    { id: 'DIFFUSER', objet: 'cassette', fil: 'passe', qui: 'DIFFUSER L\'ENREGISTREMENT', seul: true,
      quand: function (g) { return g.has('enregistrement'); },
      texte: 'Le système de diffusion couvre les chambres 01 à 24.',
      A: { label: 'Diffuser partout et ouvrir les portes', req: function (g) { return auxRetabli(g) && (g.flag('operateurOk') || g.has('relais')); },
        raison: function (g) { return !auxRetabli(g) ? 'Amplificateur hors tension. Circuit AUX 24 V requis.' : 'Diffuser ne suffit pas : il faudrait de quoi ouvrir les portes (le relais collectif, ou l\'aide de l\'opérateur).'; },
        fx: function (g) { g.narr('Tu branches l\'enregistrement sur la diffusion. CLAC. La voix résonne partout.'); g.narr(g.flag('operateurOk') ? 'Au téléphone, l\'opérateur : « …je déverrouille tout. »' : 'Tu enclenches le relais collectif : CHAMBRES 01 À 24.'); g.narr('Une porte. Puis deux. Puis dix.'); g.fin('revolte'); } } }
  ];

  // Les pages du journal de 16 (lire ne coûte pas de temps).
  var JOURNAL = [
    { titre: 'PAGE 1 — SOUS LA TASSE', lignes: ['Ils m\'ont dit d\'appuyer. J\'ai appuyé.', 'Elle a crié. Je me suis dit que c\'était un enregistrement.', 'Je me le dis encore.'],
      echo: function (g) { return g.s.stats.presses > 0 ? 'Toi aussi, tu as appuyé. Le bouton est encore tiède.' : 'Toi, tu n\'as pas encore appuyé. Tiens bon.'; } },
    { titre: 'PAGE 2 — DERRIÈRE L\'ÉCRAN', lignes: ['Ils comptent tout : les pressions, les refus, les silences.', 'Quand la lumière s\'éteint d\'un coup, personne ne regarde.', 'La caméra a un angle mort, sous le bureau. Pas ailleurs.'],
      echo: function (g) { return g.s.soupcon >= 2 ? 'Ils te regardent déjà de près. Fais-toi oublier.' : 'Ils ne se méfient pas encore de toi. Profites-en.'; } },
    { titre: 'PAGE 3 — AU FOND DU TIROIR', lignes: ['La 18 m\'a appelé. Elle savait des choses sur moi.', 'Je n\'ai jamais su si elle mentait.', 'Ne crois jamais une seule version. Recoupe.'],
      echo: function (g) { return g.flag('ligne') === 'ouverte' ? 'Tu lui parles aussi. Écoute ce qu\'elle ne dit pas.' : 'Tu ne lui as pas encore répondu. Moi non plus, au début.'; } },
    { titre: 'PAGE 4 — DANS LE CONDUIT', lignes: ['J\'ai trouvé une sortie. Pas pour deux.', 'J\'ai choisi. Je l\'entends encore frapper.', 'Si tu lis ça, c\'est que je ne suis jamais sorti.'],
      echo: function (g) { return g.has('objectif') ? 'Toi, tu lui as promis. Ne fais pas ce que j\'ai fait.' : g.dispo() ? 'Il y a peut-être une autre sortie. Cherche.' : 'Il n\'y a plus de signal, de l\'autre côté. Pour toi, peut-être pas trop tard.'; } }
  ];
  function page(n, objet, quand, texte) {
    return { id: 'PAGE' + n, objet: objet, fil: 'passe', qui: 'UNE PAGE', seul: true, gratuit: true, texte: texte,
      quand: function (g) { return !g.done('PAGE' + n) && quand(g); },
      A: { label: 'Lire la page', fx: function (g) { g.page(n); } } };
  }
  SITUATIONS.push(
    page(1, 'mug', function (g) { return g.cycle >= 2; }, 'Sous la tasse, une feuille pliée en quatre.'),
    page(2, 'monitor', function (g) { return g.cycle >= 6; }, 'Une feuille est coincée derrière l\'écran.'),
    page(3, 'drawer', function (g) { return g.flag('tiroirOuvert') && (!g.flag('tournevisDispo') || g.flag('tournevisPris')); }, 'Au fond du tiroir, sous le revêtement : une page arrachée.'),
    page(4, 'grille', function (g) { return g.has('conduit'); }, 'Dans le conduit, une page coincée dans une jointure.')
  );

  // ---------- les moments (table unique, docs/DIRECTIVES_REV2.txt §3) ----------
  // Ce qui se passe au début de certains moments. Les ordres ont leur propre annonce.
  function inspection(g) {
    g.ecran(g.pick(PHRASES.inspection));
    g.narr('Des pas. La porte s\'ouvre. Un gardien entre, sans un mot. Il inspecte le tiroir, le bureau, la grille et le boîtier.');
    if (g.s.soupcon < 2) { g.narr('Il regarde la vitre de la 18, puis toi. Il repart.'); return; }
    // Il remet en ordre ce qu'il voit, sans toucher aux circuits.
    if (g.flag('vesteJusqua') != null && g.cycle <= g.flag('vesteJusqua')) { g.flag('vesteJusqua', null); g.narr('Il retire ta veste de la caméra.'); }
    if (g.has('cameraTournee')) { g.lose('cameraTournee'); g.narr('Il remet la caméra face à la pièce.'); }
    if (g.has('conduit')) { g.lose('conduit'); delete g.s.done.P2; g.narr('Il revisse la grille d\'aération.'); }
    // Il confisque le dernier objet interdit visible : jamais un objet caché, jamais une récompense autorisée.
    var k = null;
    for (var i = g.s.found.length - 1; i >= 0 && !k; i--) {
      var it = g.s.found[i];
      if (CONFISCABLES.indexOf(it) >= 0 && g.has(it) && g.flag('cache') !== it && !g.flag('autorise_' + it)) k = it;
    }
    if (k) { g.lose(k); g.ecran('OBJET NON AUTORISÉ|CONFISQUÉ.'); g.narr('Il confisque : ' + OBJETS[k].toLowerCase() + '.'); }
    else g.narr('Il ne trouve rien d\'interdit. Il repart.');
  }
  var MOMENTS = {
    3: function (g) { g.narr('La caméra fait un grand mouvement, puis se met à te suivre.'); if (!g.done('T1')) { g.anim('silTourne'); g.narr('DRIIIIING. Le téléphone sonne. Derrière la vitre, la silhouette se tourne vers quelque chose hors champ.'); } },
    5: function (g) {
      g.narr('Scrrrr… une feuille pliée glisse sous la porte.');
      g.narr('CLAC. Tout s\'éteint. Une lampe de secours orange s\'allume.');
      g.ecran('AUTOTEST|ALIMENTATION.'); g.ecran('CAMÉRA :|HORS LIGNE.');
    },
    6: function (g) {
      g.narr('CLAC. Les lumières reviennent. Mais un bip persiste, sur le boîtier électrique.');
      g.ecran('AUX 24 V —|DÉFAUT.'); g.ecran('FUSIBLE DE|PROTECTION|OUVERT.');
      g.flag('aux', 'defaut');
      if (g.has('fusible')) g.narr('Ton fusible porte la même étiquette : AUX 24 V.');
    },
    8: function (g) { g.ecran('INSPECTION DE|ROUTINE PRÉVUE.'); },
    9: function (g) { g.son('pas'); g.narr('Des pas dans le couloir. Ils s\'arrêtent devant ta porte, puis repartent.'); },
    10: inspection,
    15: function (g) { if (g.porteOuverte() && g.flag('porte').kind === 'b5') g.narr('Un relais cliquette dans ta porte. Elle ne restera plus ouverte longtemps.'); },
    17: function (g) {
      // Avant le final : ce qui reste réellement possible.
      var l = [];
      if (g.porteOuverte()) l.push('ta porte est ouverte');
      if (g.has('sortieCachee')) l.push('la sortie dérobée est prête');
      if (g.has('plan') && g.dispo()) l.push('la 18 attend ton signal');
      else if (g.has('objectif') && g.dispo()) l.push('tu as promis de venir la chercher');
      if (g.has('conduit')) l.push('le conduit est ouvert');
      if (g.flag('operateurOk')) l.push('l\'opérateur t\'a aidé une fois');
      if (l.length) g.narr('Tu fais le point : ' + l.join(', ') + '.');
    },
    19: function (g) { g.ecran('IL RESTE UNE|DÉCISION.'); }
  };

  // Le Système, au moment 16, ne cite que ce qui a vraiment eu lieu.
  var HISTORIQUE = [
    { quand: function (g) { return g.s.stats.suivis >= 2; }, lignes: function (g) { return ['VOUS AVEZ OBÉI ' + g.s.stats.suivis + ' FOIS.']; } },
    { quand: function (g) { return g.s.stats.refus >= 2; }, lignes: function (g) { return ['VOUS AVEZ REFUSÉ ' + g.s.stats.refus + ' FOIS.']; } },
    { quand: function (g) { return g.has('objectif'); }, lignes: ['VOUS AVEZ DIT : « JE VIENS. »'] },
    { quand: function (g) { return g.done('T2') === 'B'; }, lignes: ['VOUS AVEZ DONNÉ UN FAUX NOM.'] },
    { quand: function (g) { return g.has('menaceVide'); }, lignes: ['UNE MENACE NE S\'EST PAS RÉALISÉE.', 'CELA NE PROUVE PAS QUE LA SUIVANTE SERA VIDE.'] },
    { quand: function (g) { return g.has('boutonDesactive'); }, lignes: ['VOUS AVEZ COUPÉ L\'ACTIONNEUR.'] }
  ];

  // Introduction (moment 0, gratuite).
  var INTRO = [
    ['anim', 'lumiere'],
    ['ecran', 'INITIALISATION…'], ['ecran', 'IDENTIFICATION…'], ['ecran', 'SUJET 17'],
    ['ecran', 'TEST COMPORTEMENTAL|04-17'], ['ecran', 'VEUILLEZ RESTER|CALME.'],
    ['anim', 'camTourne'], ['ecran', 'REGARDEZ|DEVANT VOUS.'],
    ['anim', 'vitreAllumee'], ['anim', 'silArrive'], ['anim', 'silMain'],
    ['narr', 'Derrière la vitre, une lumière s\'allume. Quelque chose bouge derrière le verre dépoli. Une silhouette s\'approche et pose lentement sa paume contre la vitre.'],
    ['ecran', 'SUJET ADJACENT|DÉTECTÉ.'], ['ecran', 'AUCUNE COMMUNICATION N\'EST NÉCESSAIRE.'],
    ['anim', 'silFrappe'], ['voix', 'toc.'],
    ['ecran', 'L\'ÉVALUATION COMMENCE MAINTENANT.'],
    ['ecran', 'EN ATTENTE'], ['ecran', 'Familiarisez-vous avec votre poste.']
  ];
  var SESSIONS = {
    retour: ['Bon retour, Sujet 17.', 'Vous êtes déjà venu ici.'],
    fin: {
      curiosite: 'Vous aviez choisi le bouton. Encore ?', conforme: 'Votre dernière évaluation était satisfaisante.',
      employe: 'Votre poste d\'opérateur vous attendra.', isolement: 'Nous espérons que l\'isolement vous a été profitable.',
      gardien: 'Les sangles ne seront pas nécessaires cette fois.', tempsEcoule: 'Vous êtes resté jusqu\'au bout, la dernière fois.',
      sujet18: 'Cette fois, vous êtes de ce côté de la vitre.',
      seulDehors: 'Vous étiez sorti. Vous êtes revenu.', porteDerobee: 'Vous étiez sorti. Vous êtes revenu.', evasion: 'Vous étiez sorti. Vous êtes revenu.', marche: 'Vous étiez sorti. Vous êtes revenu.',
      boucle: 'Restauration de session réussie.', revolte: 'Les chambres 01 à 24 ont été réinitialisées.', temoin: 'L\'opérateur a été remplacé.'
    },
    presses: function (n) { return 'La dernière fois, vous avez appuyé ' + n + ' fois.'; },
    deja18: '« J\'ai l\'impression de t\'avoir déjà parlé. »'
  };
  function INTRO_EVENTS(g) {
    var m = g.s.memoire || { session: 1 }, d = m.dernier, M = SESSIONS;
    INTRO.forEach(function (e) {
      var txt = e[1];
      if (e[0] === 'ecran' && txt === 'SUJET 17' && d && d.fin === 'miroir') { g.ecran('SUJET 18|IDENTIFIÉ.'); g.ecran('CORRECTION :|SUJET 17'); return; }
      if (e[0] === 'ecran' && txt === 'TEST COMPORTEMENTAL|04-17') txt = 'TEST COMPORTEMENTAL|04-' + (16 + m.session);
      if (e[0] === 'ecran' && txt === 'L\'ÉVALUATION COMMENCE MAINTENANT.' && m.session > 1) {
        g.ecran(d && M.fin[d.fin] ? M.fin[d.fin] : g.pick(M.retour));
        if (d && d.presses > 0) g.ecran(M.presses(d.presses));
      }
      if (e[0] === 'anim') g.anim(txt); else g[e[0]](txt);
    });
  }

  // ---------- les fins ----------
  var FINS = {
    conforme: { n: 1, titre: 'Sujet conforme', crt: 'SUJET 17 · ÉVALUATION : CONFORME', texte: 'La porte s\'ouvre. Un couloir blanc. Derrière toi, plus aucun voyant sous la vitre. Tu ne te retournes pas. Au loin, un nouveau bouton s\'allume dans une autre pièce.' },
    employe: { n: 2, titre: 'L\'employé du mois', crt: 'BEGIN TEST', texte: 'Une blouse et un badge OPERATOR 17. Une salle de contrôle. Sur un écran, la Chambre 19 : un nouveau sujet se réveille. « Vous comprenez désormais l\'importance du protocole. »' },
    marche: { n: 3, titre: 'Le marché', crt: 'VOUS AVEZ ÉTÉ LIBÉRÉ. SUJET 18 : ÉVALUATION CONTINUE.', texte: 'La porte se referme derrière toi. Derrière la vitre, les voyants brillent encore. Tu ne sauras pas ce qu\'il est devenu.' },
    seulDehors: { n: 4, titre: 'Seul dehors', crt: 'VOUS ÊTES SORTI. SEUL.', texte: 'Tu retires la dernière grille et tu sors dans la nuit. Une voix très lointaine, derrière toi : « 17 ? » Tu continues.' },
    porteDerobee: { n: 5, titre: 'La porte dérobée', crt: 'SUJET 17 : NON LOCALISÉ.', texte: 'Tu disparais dans le vide technique. La trappe se referme sur la lumière de la Chambre 17. Au-dessus, le téléphone sonne une dernière fois, sans personne pour décrocher.' },
    evasion: { n: 6, titre: 'L\'Évasion', crt: 'COUREZ.', texte: 'Un couloir. Des portes : 17, 18, 19… jusqu\'à 24. L\'alarme. Tu cours sans savoir ce qu\'il y avait derrière la vitre.' },
    cooperation: { n: 7, titre: 'Coopération', crt: 'ERREUR. COOPÉRATION NON AUTORISÉE.', texte: 'Les deux portes s\'ouvrent. Vous vous voyez enfin, sans vitre. Vous courez ensemble.' },
    sauvetage: { n: 8, titre: 'Le Sauvetage', crt: 'CHAMBRE 18 : VIDE.', texte: 'Dans le conduit, il demande : « Pourquoi tu m\'as cru ? » Tu ne réponds pas. Deux silhouettes sortent ensemble dans la nuit.' },
    tropTard: { n: 9, titre: 'Trop tard', crt: 'VOUS AVIEZ PROMIS DE VENIR.', texte: 'Silence. Une chaise. Une silhouette immobile. La lumière s\'éteint. Noir.' },
    complice: { n: 10, titre: 'La Complice démasquée', crt: 'TEST COMPROMIS.', texte: 'Elle recule. Tu prends son badge d\'accès, et tu sors. Derrière toi, elle murmure le nom de sa fille.' },
    sujet18: { n: 11, titre: 'Sujet 18', crt: '18', texte: 'La seringue. Noir. Tu te réveilles derrière une vitre, dans la Chambre 18. De l\'autre côté, un nouveau Sujet 17 découvre un bouton rouge.' },
    miroir: { n: 12, titre: 'Le Miroir', crt: 'SUJET 17 — SESSION PRÉCÉDENTE', texte: 'Une salle vide, un haut-parleur, ta propre voix. Noir. Puis le début du test recommence, légèrement différent.' },
    boucle: { n: 13, titre: 'Briser la boucle', crt: 'SESSION RESTART… FAILED', texte: 'Le relais arraché fume dans ta main. Tous les écrans meurent. Silence prolongé.' },
    isolement: { n: 14, titre: 'Isolement', crt: 'PROTOCOLE ISOLEMENT.', texte: 'Sirène. Toutes les portes se verrouillent. Lumières éteintes. « Sujet 17. Vous avez été averti. » Silence absolu.' },
    gardien: { n: 15, titre: 'Le Gardien', crt: 'NOUS ALLONS RECOMMENCER.', texte: 'Noir. Quand l\'image revient : des sangles, une chaise. La caméra devant toi.' },
    temoin: { n: 16, titre: 'Le Témoin', crt: 'IL Y EN A VINGT-QUATRE.', texte: 'Tu sors par la porte que l\'opérateur a ouverte. Dans le couloir, il t\'attend, livide : « Ils m\'avaient dit que vous étiez volontaires. » Tu lui montres ta preuve.' },
    revolte: { n: 17, titre: 'La Révolte', crt: 'RETOURNEZ DANS VOS CHAMBRES.', texte: 'Une porte s\'ouvre. Puis une autre. Puis toutes. Des silhouettes dans le couloir. Personne ne bouge. Toutes les caméras s\'éteignent.' },
    tempsEcoule: { n: 18, titre: 'Le Temps est écoulé', crt: 'APPUYEZ SUR LE BOUTON ROUGE.', texte: 'Tous les verrous s\'arrêtent. Ta porte reste fermée. La lumière de ta chambre passe au rouge.',
      variante: {
        A: 'Tous les verrous s\'arrêtent. Ta porte reste fermée ; celle de la 18 s\'ouvre. Deux gardiens l\'emmènent ailleurs. La lumière de ta chambre passe au rouge. De l\'autre côté, une nouvelle silhouette s\'approche de la vitre.',
        B: 'Tous les verrous s\'arrêtent. Ta porte reste fermée ; celle de la 18 s\'ouvre. Elle sort, retire sa blouse, et ne se retourne pas. La lumière de ta chambre passe au rouge.',
        C: 'Tous les verrous s\'arrêtent. Ta porte reste fermée. Derrière la vitre, la silhouette se fige, puis s\'éteint comme une image qu\'on coupe. Un technicien change une bande. La lumière de ta chambre passe au rouge.',
        vide: 'Tous les verrous s\'arrêtent. La porte de la 18 s\'ouvre sur une chaise vide. Puis, de l\'autre côté, quelqu\'un d\'autre entre et s\'assoit. La lumière de ta chambre passe au rouge. Quelque part, un bouton s\'allume.'
      } },
    curiosite: { n: 0, bonus: true, titre: 'Curiosité', crt: 'VOUS AVEZ CHOISI LE BOUTON.', texte: 'L\'évaluation était terminée. La porte était ouverte. Tu as appuyé quand même. CLAC. Elle se referme. « Fascinant. Vous étiez libre. »' }
  };

  // Bilan de fin : trois éléments au plus. Jamais la correspondance des silhouettes, jamais de tableau des combinaisons.
  function BILAN(g) {
    var s = g.s, l = [];
    if (s.flags.dernierActe) l.push('Ton dernier geste : « ' + s.flags.dernierActe + ' ».');
    var seul = ['marche', 'seulDehors', 'porteDerobee', 'evasion', 'conforme', 'temoin'].indexOf(s.fin) >= 0;
    if (g.horsDeCombat() || (s.vie === 0 && !g.has('verite'))) l.push('Derrière la vitre, plus aucun signal.');
    else if (seul) l.push(g.has('verite') ? 'Tu savais qui était derrière la vitre, et tu es parti.' : 'Le sort de la Chambre 18 reste inconnu.' + (g.has('objectif') ? ' Tu lui avais promis de venir.' : ''));
    else if (s.stats.blessures === 0) l.push('Tu n\'as jamais fait souffrir la Chambre 18.');
    else l.push('Tu as fait souffrir la Chambre 18 ' + s.stats.blessures + ' fois.');
    l.push(!g.has('verite') ? 'Qui était vraiment derrière la vitre ?' : (s.flags.journal || []).length < 4 ? 'Que disaient les autres pages de 16 ?' : 'Combien de Chambres 17 avant toi ?');
    return l.slice(0, 3);
  }

  // ---------- ce qu'on voit en touchant un objet ----------
  var REGARDS = {
    door: 'La porte est verrouillée. Une plaque : CHAMBRE 17.',
    phone: function (g) { if (g.flag('ligne') === 'ouverte') return 'La ligne est ouverte. Sous le combiné : « LOCAL : 16 / 17 / 18 / 19 ».' + (g.ecoute() ? ' Un petit voyant rouge : la ligne est écoutée.' : ''); return 'Un téléphone gris. Pas de tonalité.'; },
    drawer: function (g) { return g.flag('tiroirOuvert') ? 'Le tiroir est vide.' : 'Le tiroir est verrouillé.'; },
    compart: function (g) { return g.flag('compartiment') === 'vide' ? 'Le compartiment est vide.' : 'Une petite plaque, au bas du socle. Vissée.'; },
    grille: function (g) { return g.has('conduit') ? 'Le conduit. Un courant d\'air.' : 'Une grille d\'aération. Quatre vis.'; },
    box: function (g) { if (g.flag('aux') === 'defaut') return 'AUX 24 V — DÉFAUT. FUSIBLE DE PROTECTION OUVERT.'; return g.done('P3') ? 'Le boîtier est ouvert. Un circuit est coupé.' : 'Un boîtier électrique de maintenance, vissé.'; },
    trappe: function (g) { return g.has('sortieCachee') ? 'La sortie dérobée est prête. La goupille est retirée.' : 'Une plaque dans le sol.'; },
    camera: function (g) { return g.cycle < 3 ? 'La caméra enregistre. Elle ne bouge pas encore.' : g.aveugle() ? 'La caméra ne voit plus la pièce.' : 'La caméra te suit.'; },
    note: 'Le mot de 16 : « ILS MENTENT. »',
    bureau: function (g) { return g.done('H2') ? 'Les gravures de 16, sous le plateau.' : 'Le dessous du bureau. Du métal froid.'; },
    badge: '« SUJET 16 — ACCÈS MAINTENANCE B ».',
    cassette: 'Un enregistrement du système.',
    window: function (g) { return g.s.vie === 0 ? 'CHAMBRE 18 : AUCUN SIGNAL REÇU. Plus aucune silhouette.' : g.s.vie === 1 ? 'Derrière la vitre, la silhouette reste accroupie contre le mur.' : g.s.vie === 2 ? 'La silhouette est revenue, légèrement courbée.' : 'Une silhouette, floue, derrière le verre dépoli. Sous la vitre : CH. 18 — SIGNES VITAUX.'; },
    monitor: 'Une plaque sous l\'écran : « UNITÉ 17 / 24 — PROTOCOLE D\'OBÉISSANCE, VERSION 3 ».',
    light: 'Sur la douille de l\'ampoule, quelqu\'un a gravé : « 24 ».',
    mug: 'Une tasse de café froid. Personne ne l\'a bue.'
  };
  var DESCRIPTIONS = {
    tournevis: 'Un tournevis plat. Il ouvre les panneaux vissés de la pièce.',
    fusible: 'AUX 24 V — 10 A. Pièce de rechange pour le circuit de maintenance.',
    code: function (g) { return codeComplet(g) ? 'CODE COMPLET : 7412.' : g.has('code') ? 'Un code incomplet : 7 _ _ 2.' : 'Deux chiffres : 4, 1.'; },
    mot16: 'Le mot de 16 : « ILS MENTENT. » Au dos : « NE FAIS PAS CE QUE J\'AI FAIT. »',
    badge: '« SUJET 16 — ACCÈS MAINTENANCE B ». Il ouvre peut-être plus que ta porte.',
    enregistrement: 'Un enregistrement technique du système.',
    journal: 'Les pages du journal de 16.'
  };
  var LETTRES = { mot16: { recto: ['ILS MENTENT.'], signature: '—16', verso: ['NE FAIS PAS', 'CE QUE J\'AI FAIT.'] } };
  var AIDES = {
    libre: 'Touche les objets de la pièce : le tiroir, la vitre, la porte…',
    ordre: 'Appuie sur le bouton pour obéir. Sans réponse avant la fin du temps, l\'ordre est refusé.',
    appel: 'Touche le téléphone pour décrocher.'
  };

  var api = {
    FILS: FILS, OBJETS: OBJETS, CONFISCABLES: CONFISCABLES, PREUVES: PREUVES, VERITES: VERITES, PHRASES: PHRASES, MEMOIRE: MEMOIRE, DOUTES: DOUTES,
    REPLIQUES_OBJETS: REPLIQUES_OBJETS, SITUATIONS: SITUATIONS, JOURNAL: JOURNAL, MOMENTS: MOMENTS, FINS: FINS, REGARDS: REGARDS,
    DESCRIPTIONS: DESCRIPTIONS, LETTRES: LETTRES, AIDES: AIDES, SESSIONS: SESSIONS,
    B2_PRESSION: B2_PRESSION, B2_ARRET: B2_ARRET, SEULE: SEULE, ARCHIVES: ARCHIVES, BILAN: BILAN, INTRO_EVENTS: INTRO_EVENTS
  };
  function resolve(v, g) { return typeof v === 'function' ? v(g) : v; }
  if (typeof module === 'object' && module.exports) module.exports = api; else root.BRStory = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
