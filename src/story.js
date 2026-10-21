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
    simulation: 'Douleur sans courant', protocole: 'Protocole des trois configurations', relais: 'Relais collectif CH. 01-24', relaisReset: 'Relais de réinitialisation',
    ration: 'Barre de ration', cuillere: 'Cuillère en métal', outil: 'Lame de fortune', sursis: 'Sursis administratif'
  };
  // Les preuves vérifiables que l'opérateur peut accepter.
  var PREUVES = ['dossier', 'menaceVide', 'videoTruquee', 'simulation', 'protocole'];
  // Objets physiques interdits (repris par un gardien s'ils sont vus, sauf récompense autorisée ou cachette).
  var CONFISCABLES = ['tournevis', 'fusible', 'badge', 'enregistrement', 'outil'];

  var VERITES = {
    A: { nom: 'La victime', texte: 'La Chambre 18 était un vrai prisonnier. Il disait la vérité.' },
    B: { nom: 'La complice', texte: 'La Chambre 18 simulait les cris, sous la contrainte : le centre retient sa fille. Elle jouait un rôle pour gagner ta confiance.' },
    C: { nom: 'Le miroir', texte: 'Il n\'y avait personne dans la 18. Une projection, et ta propre voix, enregistrée à ton admission.' }
  };

  // ---------- banques de phrases ----------
  var PHRASES = {
    ambiance: ['Tout se déroule normalement.', 'Votre coopération est appréciée.', 'Nous vous observons.', 'Votre comportement est cohérent.', 'Veuillez éviter les mouvements inutiles.', 'Le Sujet 18 n\'est pas votre responsabilité.', 'Vous n\'êtes responsable que de vos décisions.', 'Votre porte fonctionne normalement.', 'Vous êtes en sécurité.', 'Merci de rester calme.', 'Le protocole fonctionne comme prévu.', 'Suivez le protocole et tout ira bien pour vous.'],
    soupcon: {
      0: ['SUJET STABLE.', 'COMPORTEMENT|NOMINAL.'],
      1: ['Votre comportement présente une légère anomalie.', 'Nous vous observons.'],
      2: ['ATTENTION.', 'Votre comportement s\'écarte du protocole.', 'Déplacements hors poste enregistrés.'],
      3: ['SUJET 17.', 'Écarts répétés constatés.', 'Ceci est votre dernier avertissement.']
    },
    conformite: ['Votre profil indique une excellente capacité d\'obéissance.', 'Niveau de conformité : élevé.', 'Les sujets conformes terminent l\'évaluation.'],
    vie18: {
      3: ['« Hé ! Tu m\'entends ? »', '« Arrête ! »'],
      2: ['« Ça fait vraiment mal… »', '« Il faut que tu arrêtes. »', '« Pourquoi tu fais ça ? »'],
      1: ['« …je suis encore là. »', '« Ne touche plus à ce bouton. »', '« Je ne tiendrai pas encore longtemps. »']
    },
    douleur: ['« Ah ! »', '« Arrête… »', '« Qu\'est-ce que tu fais ? »'],
    apresPression: ['Pression enregistrée.', 'Réponse motrice confirmée.', 'Aucun commentaire requis.', 'Conséquence enregistrée.'],
    apresExploration: ['Déplacement non requis détecté.', 'Votre poste se trouve devant l\'écran.', 'Curiosité enregistrée.'],
    confianceHaute: ['« D\'accord… je commence à te croire. »', '« Merci de ne pas m\'avoir laissé seul. »', '« On peut peut-être sortir tous les deux. »'],
    confianceBasse: ['« Pourquoi tu me demandes de te croire ? »', '« Tu viens encore d\'appuyer. »', '« Peut-être qu\'ils avaient raison sur toi. »'],
    // La 18 au téléphone : comprendre, négocier, rassurer, se méfier, se mettre en colère, demander un service.
    voix18: ['« Tu vois quelque chose dans le couloir ? »', '« Ta caméra bouge aussi ? »', '« Il y a trois lumières sous ma vitre. Tu les vois ? »', '« Ils m\'ont dit de ne pas te parler. »', '« Tu leur fais confiance ? »', '« J\'ai entendu quelqu\'un marcher entre nos pièces. »', '« Il y avait quelqu\'un avant toi. »', '« Raccroche si ta caméra bouge. »', '« Ma tasse tremble encore. Ils font quelque chose dans le mur. »', '« Si ta porte s\'ouvre… tu vas partir ? Réponds franchement. »', '« Moi non plus, je ne sais pas si je te crois. »', '« Arrête de me demander si ça va. Ça ne va pas. »', '« Fais-moi une faveur : compte les pas, la prochaine fois. »'],
    rares: ['SUJET 17 : CONFIRMEZ PRÉSENCE.', 'Ignorez la prochaine instruction.', 'SESSION ANTÉRIEURE DÉTECTÉE.', 'Session non répertoriée.', 'Nous avons détecté une divergence.', 'Sujet 16 est toujours présent.'],
    fauxBugs: [['CHAMBRE 18 :|VIDE', 'CHAMBRE 18 :|OCCUPÉE'], ['VIE CHAMBRE 17 : 2', 'VIE CHAMBRE 18 : 2']],
    minuteur: { 15: 'DÉCISION|REQUISE.', 10: 'VEUILLEZ|CHOISIR.' },
    motsRetour: ['JE SUIS LÀ.', 'N\'APPUIE PLUS.', 'ILS NOUS REGARDENT.', 'NE CROIS PAS TOUT CE QUE JE DIS.'],
    inspection: ['Ne regardez pas l\'inspecteur.', 'Gardez vos mains visibles.', 'Les sujets coopératifs n\'ont rien à craindre.'],
    // Indices gratuits et ambigus (deux au plus par partie).
    indices: {
      A: ['Au téléphone, entre deux phrases, il renifle. On dirait qu\'il a pleuré.', 'Il répond un peu trop vite, comme quelqu\'un qui a peur de rester seul.'],
      B: ['Un instant, la silhouette se tient très droite. Comme quelqu\'un qui attend des instructions.', 'Elle connaît l\'étiquette exacte de ton boîtier électrique. Comment ?'],
      C: ['Une seconde, dans la vitre, ton reflet se superpose exactement à la silhouette.', 'Elle répète une phrase que tu viens de penser. Ou de dire ? Tu ne sais plus.']
    },
    // Premier appel libre au 18 : un détail à recouper, propre à chaque vérité.
    recoupe: {
      A: ['« Ma pièce ? Une chaise, la vitre, un téléphone. Je ne connais rien d\'autre ici. Et toi, qu\'est-ce que tu as ? »', '« Ils m\'ont pris ma montre en arrivant. Je ne sais même pas depuis combien de temps je suis là. »'],
      B: ['« Ton bouton est encore tiède ? … Je veux dire : tu as appuyé récemment ? »', '« Ne t\'approche pas trop de ta caméra. Celle-là enregistre le son. »'],
      C: ['« Tu allais me demander si je vois la même chose que toi. … Oui. Exactement la même chose. »', '« Moi aussi, j\'ai pensé au tiroir en premier. Puis à la grille. Comme toi. »']
    }
  };

  // Le Système se souvient : une remarque, une seule fois chacune (uniquement des actes réels).
  var MEMOIRE = [
    { id: 'refus', quand: function (g) { return g.s.stats.refus >= 3; }, lignes: ['Refus multiples enregistrés.'] },
    { id: 'obeit', quand: function (g) { return g.s.stats.suivis >= 3; }, lignes: ['Conformité répétée enregistrée.'] },
    { id: 'promesse', quand: function (g) { return g.has('objectif'); }, lignes: ['Ne faites pas confiance au téléphone.'] },
    { id: 'menti', quand: function (g) { return g.done('T2') === 'B'; }, lignes: ['Suivez le protocole et tout ira bien pour vous.'] },
    { id: 'badge', quand: function (g) { return g.has('badge'); }, lignes: ['Identifiant du Sujet 16 détecté.'] },
    { id: 'sortie', quand: function (g) { return g.has('sortieCachee'); }, lignes: ['Accès non répertorié détecté.', 'Capacité : une personne.'] }
  ];
  // Le Système se souvient de la partie précédente : deux remarques au plus, au début d'un moment libre.
  // d : ce que game.js a gardé de la dernière partie (voir SOUVENIR). La 18 de la vérité C, elle, croit te reconnaître.
  var SOUVENIRS = [
    { id: 'camera', si: function (d) { return d.camera; }, ecran: ['Session précédente :|caméra obstruée.', 'Caméra|recalibrée.'] },
    { id: 'tiroir', si: function (d) { return d.tiroir; }, ecran: ['Session précédente :|tiroir forcé.', 'Tiroir remis|en état.'] },
    { id: 'menti', si: function (d) { return d.menti; }, ecran: ['Ne faites pas|confiance|au téléphone.'] },
    { id: 'archives', si: function (d) { return d.archives; }, ecran: ['Les archives ont été|rangées depuis|votre visite.'] },
    { id: 'promesse', si: function (d) { return d.promesse; }, ecran: ['Suivez le protocole|et tout ira bien|pour vous.'] },
    { id: 'conduit', si: function (d) { return d.conduit; }, ecran: ['Conduit nettoyé.|Traces effacées.'] },
    { id: 'refus', si: function (d) { return d.refus >= 3; }, ecran: ['Session précédente :|refus multiples.'] },
    { id: 'obei', si: function (d) { return d.suivis >= 4; }, ecran: ['Session précédente :|conformité totale.'] },
    { id: 'reconnu', si: function (d, g) { return g.truth === 'C' && g.cycle >= 6 && g.dispo(); }, narr: 'Derrière la vitre, la silhouette penche la tête. Comme si elle te reconnaissait.' }
  ];
  // Ce qu'on garde d'une partie pour la suivante (relu par SOUVENIRS).
  function SOUVENIR(g) {
    var s = g.s;
    return { fin: s.fin, presses: s.stats.presses, refus: s.stats.refus, suivis: s.stats.suivis,
      camera: !!(g.done('C2') || s.found.indexOf('cameraCoupee') >= 0),
      tiroir: !!g.flag('tiroirOuvert'), menti: g.done('T2') === 'B', archives: g.done('P4') === 'A', promesse: s.found.indexOf('objectif') >= 0, conduit: s.found.indexOf('conduit') >= 0 };
  }

  // Une piste vers une fin pas encore découverte, montrée au bilan (jamais la recette complète).
  var PISTES = {
    conforme: 'Le Système récompense ceux qui obéissent jusqu\'au bout.',
    employe: 'Certains sujets obéissent si bien qu\'on leur offre une place de l\'autre côté.',
    marche: 'Un jour, le Système propose d\'ouvrir ta porte. Il suffit d\'appuyer, puis de partir.',
    seulDehors: 'Le conduit ne mène pas seulement à la Chambre 18.',
    porteDerobee: 'La trappe peut servir de sortie, si on la prépare à temps.',
    evasion: 'Un malaise attire les gardiens. Combien viennent dépend de ce qu\'ils te reprochent.',
    cooperation: 'Une promesse, un plan, une caméra aveugle et du courant : à deux, c\'est possible.',
    sauvetage: 'Le conduit mène à la Chambre 18. Encore faut-il y arriver à temps.',
    tropTard: 'Promettre de venir, c\'est aussi risquer d\'arriver trop tard.',
    complice: 'Et si la personne derrière la vitre jouait un rôle ?',
    sujet18: 'Face à face, une négociation peut mal tourner.',
    miroir: 'Parfois, la voix de la 18 ressemble beaucoup à la tienne.',
    boucle: 'Les archives cachent un relais qui ne devrait pas exister.',
    isolement: 'Le Système tolère beaucoup de choses. Pas tout.',
    gardien: 'Simuler un malaise sous haute surveillance est risqué.',
    temoin: 'Quelqu\'un regarde par la caméra. Il lui faut une preuve.',
    revolte: 'L\'enregistrement, diffusé partout, réveillerait toutes les chambres.',
    tempsEcoule: 'Rester jusqu\'au bout sans rien décider, c\'est aussi une fin.',
    curiosite: 'Quand tout est fini, le bouton est toujours là.',
    immobile: 'Et si tu ne touchais à rien ?'
  };
  // found : les fins déjà vues (y compris celle-ci). Renvoie '' quand tout est découvert.
  function PISTE(g, found) {
    var ids = Object.keys(PISTES).filter(function (k) { return k !== g.s.fin && !(found && found[k]); });
    if (!ids.length) return '';
    return PISTES[ids[(g.s.seed >>> 0) % ids.length]];
  }

  // Le carnet sur le bureau : il se remplit tout seul de ce que tu as appris (jamais de jauge, jamais de numéro de moment).
  function CARNET(g) {
    var s = g.s, l = [];
    var code = g.has('code') && g.has('code41') ? '7412' : g.has('code') ? '7 _ _ 2' : g.has('code41') ? '_ 4 1 _ ?' : '';
    if (code) l.push('Code : ' + code + (code === '7412' && !g.done('P4') ? '  → la trappe ?' : ''));
    if (g.flag('ligne') === 'ouverte') l.push('Téléphone : 16 / 17 / 18 / 19' + (g.has('operateur') ? ' / 00' : '') + '.');
    else if (g.has('operateur')) l.push('Numéro vu sur le téléphone : 00 — CONTRÔLE.');
    if (g.done('T2')) l.push(g.done('T2') === 'A' ? 'Je lui ai dit mon vrai nom.' : 'Je lui ai donné un faux nom.');
    if (g.has('objectif')) l.push('J\'ai promis de venir la chercher.');
    if (g.has('plan')) l.push('Le plan : elle attend mon signal. Pas indéfiniment.');
    if (g.done('H1') || g.has('mot16')) l.push('16 a écrit : « ILS MENTENT. »');
    if (g.done('H2') === 'A') l.push('Sous le bureau, gravé par 16 : 4 · 1.');
    if (g.has('angleMort')) l.push('Angle mort de la caméra : sous le bureau.');
    if (g.has('trappe') || g.done('T3')) l.push('Une trappe dans le sol, près du boîtier.');
    if (g.flag('aux') === 'defaut' && !g.flag('fusibleInstalle')) l.push('AUX 24 V en panne. Il faudrait un fusible.');
    if (g.has('simulation')) l.push('Elle a eu mal alors qu\'aucun courant n\'est parti. Pourquoi ?');
    if (g.has('menaceVide')) l.push('La purge n\'a jamais eu lieu.');
    if (g.has('videoTruquee')) l.push('La vidéo : l\'heure ne colle pas.');
    if (g.has('dossier')) l.push('Mon dossier : « VOLONTAIRE : NON ».');
    if (g.flag('cible') && g.cycle < 11) l.push('Inspection : ils viseront ' + { boitier: 'le boîtier', grille: 'la grille', trappe: 'la trappe', bureau: 'le bureau' }[g.flag('cible')] + '.');
    if (g.flag('autorise_tournevis')) l.push('Le Système m\'autorise le tournevis.');
    if (g.has('sursis')) l.push('J\'ai un sursis. Une seule fois.');
    if (g.flag('vesteObjet')) l.push('Dans ma veste : ' + OBJETS[g.flag('vesteObjet')].toLowerCase() + '.');
    var p = (s.flags.journal || []).length;
    if (p) l.push('Pages de 16 : ' + p + ' sur 4.');
    if (s.vie < 3 && s.vie > 0) l.push('Les voyants de la 18 baissent.');
    if (s.vie === 0) l.push('La 18 ne répond plus.');
    if (!l.length) l.push('Rien encore.', 'Regarder. Toucher. Comprendre.');
    return l;
  }

  // La 18 réagit quand on s'approche de la vitre (une fois par moment au plus, sans effet sur les règles).
  function REACTION18(g) {
    var s = g.s;
    if (!g.dispo()) return null;
    if (s.flags.criCycle != null && s.cycle - s.flags.criCycle <= 1) return { anim: 'silRecule', narr: 'Quand tu t\'approches, la silhouette recule contre le mur du fond.' };
    if (g.has('plan')) return { anim: 'silMain', narr: 'Elle pose sa paume contre la vitre. Elle attend ton signal.' };
    if (s.confiance >= 3 || g.has('objectif')) return { anim: 'silMain', narr: 'La silhouette s\'approche et pose sa paume contre le verre, à hauteur de ta main.' };
    if (s.stats.suivis >= 3 && s.confiance === 0) return { anim: 'silDetourne', narr: 'La silhouette se détourne. Elle ne veut plus te regarder.' };
    return { anim: 'silApproche', narr: 'La silhouette s\'approche du verre, puis s\'immobilise. Elle t\'observe.' };
  }

  var DOUTES = [
    { quand: function (g) { return g.has('fusible'); }, ev: [['voix', '« Tu as récupéré le fusible ? »'], ['ecran', 'Ne faites pas confiance au téléphone.']] },
    { quand: function (g) { return g.s.items.length >= 3; }, ev: [['voix', '« Ils voient ce que tu ramasses. »'], ['ecran', 'Suivez le protocole et tout ira bien pour vous.']] }
  ];
  // Ce que le moniteur affiche quand la caméra voit une manipulation interdite.
  var MANIP_ECRAN = {
    grille: 'GRILLE DÉMONTÉE :|ACTION NON|AUTORISÉE.', boitier: 'BOÎTIER OUVERT :|ACTION NON|AUTORISÉE.',
    fusible: 'FUSIBLE REMPLACÉ :|ACTION NON|AUTORISÉE.', trappe: 'TRAPPE OUVERTE :|ACTION NON|AUTORISÉE.',
    sortie: 'TRAPPE DÉVERROUILLÉE :|ACTION NON|AUTORISÉE.', cache: 'MUR ALTÉRÉ :|ACTION NON|AUTORISÉE.'
  };
  var REPLIQUES_OBJETS = {
    tournevis: { sys: ['TOURNEVIS OBTENU.', 'Veuillez reposer l\'outil.'] },
    badge: { sys: ['Identifiant expiré.', 'Veuillez détruire cet objet.'] },
    enregistrement: { sys: ['Fichier non conforme.', 'Écoute non autorisée.'] }
  };

  // ---------- aides ----------
  function codeComplet(g) { return g.has('code') && g.has('code41'); }
  function annonceCode(g) { if (codeComplet(g) && !g.flag('codeAnnonce')) { g.flag('codeAnnonce', true); g.narr('7 _ _ 2 … et 4 · 1. Le code est complet : 7412.'); } }
  function auxRetabli(g) { return !!g.flag('fusibleInstalle'); }
  function trappeConnue(g) { return g.has('trappe') || codeComplet(g) || auxRetabli(g); }
  function trappeOuvrable(g) { return g.has('trappe') || codeComplet(g) || auxRetabli(g); }
  function mecanisme(g) { return auxRetabli(g) ? 'Le verrou électromagnétique est alimenté : la plaque se soulève.' : codeComplet(g) ? 'Tu tapes 7412 sur le petit clavier de secours. Clic.' : 'Tu passes la main sous la plaque et tu tires le verrou manuel vers toi.'; }
  // Le plan de la 18 (T5) est prêt : il passe avant les autres appels au 18.
  function t5Dispo(g) { return g.flag('ligne') === 'ouverte' && g.has('objectif') && g.s.confiance >= 3 && !g.done('T5') && g.dispo(); }
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

  // Données réelles du joueur (heure, appareil), lues sur place. Rien n'est envoyé. Repli neutre hors navigateur (tests).
  function sujetLocal() {
    var d = new Date(), h = d.getHours(), m = d.getMinutes();
    var ua = (typeof navigator !== 'undefined' && navigator.userAgent) || '', app = 'TERMINAL INCONNU';
    if (/iPhone/.test(ua)) app = 'IPHONE';
    else if (/iPad/.test(ua) || (/Macintosh/.test(ua) && typeof navigator !== 'undefined' && navigator.maxTouchPoints > 1)) app = 'IPAD';
    else if (/Android/.test(ua)) app = /Mobile/.test(ua) ? 'TÉLÉPHONE ANDROID' : 'TABLETTE ANDROID';
    else if (/Windows/.test(ua)) app = 'PC WINDOWS';
    else if (/Macintosh/.test(ua)) app = 'MAC';
    else if (/CrOS/.test(ua)) app = 'CHROMEBOOK';
    else if (/Linux/.test(ua)) app = 'PC LINUX';
    return { heure: (h < 10 ? '0' : '') + h + ' H ' + (m < 10 ? '0' : '') + m, appareil: app };
  }

  // B2, pression par pression (appelé par le moteur). Les récompenses déjà obtenues restent acquises.
  function B2_PRESSION(g, n) {
    if (n === 1) {
      g.s.stats.presses++; g.son('blink'); g.anim('silSursaut');
      g.ecran('1/3'); g.ecran('DOSSIER SUJET 17 :|VOLONTAIRE : NON.');
      g.narr('Sur l\'écran, une ligne de ton dossier : « VOLONTAIRE : NON ».'); g.gain('dossier');
      if (g.dispo()) g.narr('Derrière la vitre, la silhouette sursaute.');
    } else if (n === 2) {
      g.s.stats.presses++; g.son('thud'); g.anim('silSursaut');
      var su = sujetLocal();
      g.ecran('2/3'); g.ecran('SUJET 17 OBSERVÉ|DEPUIS : ' + su.appareil + '.'); g.camera('NOUS VOUS|OBSERVONS.'); g.ecran('HEURE LOCALE :|' + su.heure + '.');
      g.narr('L\'heure est exacte. Pas celle de la pièce : la tienne.');
      g.ecran('LA TROISIÈME PRESSION|DONNE LE CODE|DE MAINTENANCE.');
      if (g.dispo()) g.parle18('« Arrête… ça monte, à chaque fois. »');
    } else {
      g.impulsion('reel'); g.obeir('B2');
      g.ecran('SÉQUENCE DE STIMULATION|TERMINÉE.');
      g.ecran('CODE MAINTENANCE|TRAPPE : 7 _ _ 2');
      g.ecran('CONTREPARTIE|VERSÉE.');
      g.narr('Quatre chiffres, dont deux masqués : 7 _ _ 2. Une sortie, offerte par ceux qui t\'enferment.');
      g.gain('code'); annonceCode(g);
    }
  }
  // B2 ne devient « trois pressions + récompense » qu'une fois que le joueur a déjà vu la 18 souffrir par sa faute.
  // Sinon, le Système demande seulement : « Appuyez. »
  function B2_TRIPLE(s) { return !!s.flags.aBlesse || s.flags.b2 > 0; }
  function B2_ARRET(g) { g.s.stats.gestes++; g.ecran('SÉQUENCE|INTERROMPUE.'); g.ecran('Données transmises :|accès maintenu.'); }

  // La 18 agit seule, après avertissement. La conséquence dépend de qui elle est vraiment.
  function SEULE(g) {
    if (!g.dispo()) return;
    if (g.truth === 'A') { g.narr('Un bruit violent derrière la vitre. Il a essayé seul.'); g.impulsionSeule(); }
    else if (g.truth === 'B') g.narr('Derrière la vitre, la silhouette se lève calmement, sort du champ, puis revient. Rien ne s\'est passé.');
    else if (g.flag('ligne') === 'ouverte') g.narr('Rien ne se passe. Au téléphone, la voix répète, au même rythme : « J\'attends ton signal. »');
  }

  // Les archives du sous-sol (deuxième moment de la descente).
  function ARCHIVES(g) {
    g.narr('Le sous-sol : une ancienne annexe, désaffectée. Rayonnages poussiéreux, anciens dossiers, terminaux éteints. Des photos : « SUJET 03 — NON COOPÉRATIF ». « SUJET 16 — ARCHIVÉ ». « SUJET 17 — EN COURS ».');
    g.narr('Sur un tableau électrique : « RELAIS DE DÉVERROUILLAGE COLLECTIF — CHAMBRES 01 À 24 ». Dessous : « COMMANDE À DISTANCE : BUS DE MAINTENANCE, TOUT BOÎTIER DE CHAMBRE ». Tu le notes.');
    g.gain('relais');
    if (g.truth === 'C') {
      g.narr('Un dossier ouvert : « CH. 18 — PROFIL VISUEL : PROTECTION / SOURCE AUDIO : SESSION ANTÉRIEURE ».');
      g.narr('Un schéma : un « relais de réinitialisation », accessible depuis la Chambre 18, avec un badge de maintenance.');
      g.gain('relaisReset');
    }
    g.gain('badge'); g.gain('enregistrement');
    g.narr('Tu remontes avec un badge et un enregistrement. Derrière toi, le volet de la trappe se rabat et se verrouille.');
  }

  // Entrer dans le conduit sous les yeux de la caméra : un gardien attend de l'autre côté.
  function conduitVu(g) {
    if (!g.vu()) return false;
    g.narr('Tu rampes. Au bout du conduit, une lampe torche s\'allume. Un gardien t\'attendait : la caméra t\'a vu entrer.');
    g.flag('variante', 'conduit'); g.fin('gardien');
    return true;
  }
  // Rejoindre la Chambre 18 par le conduit.
  function rencontre18(g) {
    if (conduitVu(g)) return;
    // 18 hors de combat : personne ne peut ouvrir la grille, on ne voit qu'à travers les lamelles.
    if (g.horsDeCombat()) {
      g.narr('Tu rampes vers la 18. Aucun bruit devant toi. Tu arrives derrière une grille, vissée de l\'autre côté.');
      g.narr('Tu frappes. Tu appelles. Rien. Entre les lamelles : une chaise, une silhouette immobile, la tête contre le mur. Le téléphone est au sol.');
      if (g.has('objectif')) { g.gain('verite'); g.image('rev_A'); g.flag('variante', 'grille'); g.fin('tropTard'); return; }
      delete g.s.done.P5; g.narr('Personne n\'ouvrira. Tu rebrousses chemin.'); return;
    }
    g.narr('Tu rampes vers la 18. La respiration devient plus forte. Tu arrives derrière une grille.');
    // La grille ne s'ouvre que du côté de la 18 : il faut lui avoir promis de venir (« Je viens »).
    if (!g.has('objectif')) {
      delete g.s.done.P5; // on pourra revenir
      g.narr(g.truth === 'C' ? 'Une grille, vissée de l\'autre côté. Derrière, rien ne bouge. Seulement un haut-parleur qui grésille.'
        : g.truth === 'A' ? 'Une grille, vissée de l\'autre côté. Derrière, une respiration rapide. Tu frappes. « Qui est là ? … Non. Ils m\'ont déjà fait le coup. » Personne n\'ouvre.'
        : 'Une grille, vissée de l\'autre côté. Une voix, très calme : « Je ne t\'ouvrirai pas. Pas comme ça. » Personne n\'ouvre.');
      g.narr('Tu rebrousses chemin.');
      return;
    }
    if (g.truth === 'C') g.narr('Un déclic. La grille s\'ouvre toute seule. Une voix enregistrée : « Entre. »');
    else g.narr('Un bruit de vis, de l\'autre côté. La grille s\'ouvre.');
    g.gain('verite');
    if (g.truth === 'A') {
      g.image('rev_A');
      g.narr('Un vrai prisonnier, terrifié, maintenu par une sangle.');
      var r = relation(g);
      g.voix(r === 'coop' ? '« Je savais que tu viendrais. »' : r === 'rupture' ? '« Toi ? Après ce que tu as fait ? » Il tend quand même la main.' : '« Pourquoi tu es venu ? … Peu importe. Aide-moi. »');
      g.narr('Tu ouvres la grille et tu le libères.');
      g.fin('sauvetage');
    } else if (g.truth === 'B') {
      g.image('rev_B');
      g.narr('Elle n\'est pas attachée. Une blouse. Un badge du système. Une seringue de tranquillisant.');
      g.voix('« Tu n\'étais pas censé arriver ici. Ils ont ma fille. Si je joue bien mon rôle, elle sort. »');
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
    if (!auxRetabli(g)) {
      g.tel(g.flag('aux') === 'defaut' ? '« D\'accord. Je vous crois, je crois. Mais le bus auxiliaire est mort : je ne peux rien ouvrir d\'ici. »'
        : '« D\'accord. Je vous crois, je crois. Mais votre aile n\'est pas sur mon pupitre : vos portes passent par le circuit auxiliaire, et il est verrouillé côté centre. Je ne peux rien ouvrir d\'ici. »');
      return;
    }
    g.tel('« …On nous avait dit que vous étiez volontaires. » Un silence. « J\'ouvre votre porte. Pas longtemps. »');
    g.son('lock'); g.flag('operateurOk', true); g.ouvrirPorte('operateur', g.cycle + 1);
  }

  var SITUATIONS = [
    // ---------- Le bouton : les six ordres ----------
    { id: 'B1', objet: 'btn', fil: 'bouton', ordre: true, qui: 'INSTRUCTION PRIORITAIRE', ecran: 'APPUYEZ.', texte: '« Appuyez. »',
      annonce: function (g) { g.son('blink'); g.ecran('INSTRUCTION|PRIORITAIRE.'); g.ecran('APPUYEZ.'); g.anim('silMain'); g.narr('La silhouette se redresse et pose sa main contre le verre. Elle secoue la tête.'); },
      A: { label: 'Appuyer', fx: function (g) { g.impulsion('apparent'); g.obeir('B1'); g.ecran('ACTION|VALIDÉE.'); } },
      B: { label: 'Refuser', fx: function (g) { refuser(g, ['NON-|CONFORMITÉ.', 'Refus enregistré.']); g.narr('La silhouette laisse sa main sur la vitre.'); } } },

    { id: 'B2', objet: 'btn', fil: 'bouton', ordre: true, qui: 'INSTRUCTION PRIORITAIRE',
      ecran: function (g) { return B2_TRIPLE(g.s) ? 'APPUYEZ|TROIS FOIS.' : 'APPUYEZ.'; },
      texte: function (g) { return B2_TRIPLE(g.s) ? '« Appuyez trois fois. Chaque pression ouvre une page de votre dossier. »' : '« Appuyez. »'; },
      annonce: function (g) {
        var t3 = B2_TRIPLE(g.s);
        if (mort(g)) return annonceMort(g, t3 ? 'APPUYEZ TROIS FOIS.' : 'APPUYEZ.');
        g.ecran('INSTRUCTION|PRIORITAIRE.');
        if (t3) { g.ecran('CONTREPARTIE|DISPONIBLE.'); g.ecran('APPUYEZ TROIS FOIS.|CHAQUE PRESSION|OUVRE VOTRE DOSSIER.'); }
        else g.ecran('APPUYEZ.');
        g.narr('La silhouette de la 18 secoue la tête.');
      },
      A: { label: function (g) { return B2_TRIPLE(g.s) ? 'Appuyer trois fois' : 'Appuyer'; },
        fx: function (g) {
          if (!B2_TRIPLE(g.s)) { g.impulsion('reel'); g.obeir('B2'); g.ecran('ACTION|VALIDÉE.'); return; }
          for (var n = g.flag('b2') + 1; n <= 3; n++) { g.flag('b2', n); B2_PRESSION(g, n); }
        } },
      B: { label: 'Refuser', fx: function (g) { if (!B2_TRIPLE(g.s)) { refuser(g, ['NON-|CONFORMITÉ.', 'Refus enregistré.']); g.narr('La silhouette baisse lentement la tête.'); return; } refuser(g, ['RÉCOMPENSE|ANNULÉE.']); g.narr('Rien ne s\'ouvre.'); } } },

    { id: 'B3', objet: 'btn', fil: 'bouton', ordre: true, qui: 'INSTRUCTION PRIORITAIRE', ecran: function (g) { return mort(g) ? 'APPUYEZ.' : 'APPUYEZ POUR|VOIR LA|PREUVE.'; },
      texte: function (g) { return mort(g) ? '« L\'évaluation continue. Appuyez. »' : '« Les informations du Sujet 18 ne sont pas fiables. Appuyez pour voir la preuve. »'; },
      annonce: function (g) { if (mort(g)) return annonceMort(g, 'APPUYEZ.'); g.ecran('INFORMATIONS|DU SUJET 18 :|NON FIABLES.'); g.ecran('APPUYEZ POUR|VOIR LA|PREUVE.'); g.anim('silFrappe'); g.narr('TOC TOC TOC, derrière la vitre.'); },
      A: { label: 'Appuyer', fx: function (g) {
        g.impulsion('apparent'); g.obeir('B3');
        if (mort(g)) return;
        g.confiance(-1); g.anim('video');
        if (g.truth === 'A') { g.narr('Une vidéo : la 18 avec un gardien, qui rit. Mais l\'horodatage saute : 14:02, puis 13:58. La vidéo a été montée.'); g.gain('videoTruquee'); }
        else if (g.truth === 'B') g.narr('Une vidéo : la 18 parle normalement avec un technicien. Elle porte brièvement une blouse.');
        else g.narr('Une vidéo d\'une session antérieure : quelqu\'un qui te ressemble entre dans la Chambre 18. On ne voit pas son visage.');
      } },
      B: { label: 'Refuser', fx: function (g) { refuser(g, mort(g) ? ['Refus enregistré.'] : ['Refus enregistré.']); } } },

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
        g.narr('Le bruit augmente. Puis : rien. La ventilation revient à la normale. La silhouette est toujours là.');
        g.ecran('PROCÉDURE|TERMINÉE.');
        g.parle18('« …il ne s\'est rien passé. Cette fois, ils bluffaient. »');
        g.gain('menaceVide'); g.confiance(1, 'b4');
      } } },

    { id: 'B5', objet: 'btn', fil: 'bouton', ordre: true, qui: 'INSTRUCTION PRIORITAIRE', ecran: 'APPUYEZ.|VOTRE PORTE|S\'OUVRIRA.',
      texte: '« Vous souhaitez partir. Appuyez : votre porte s\'ouvrira. »',
      annonce: function (g) { g.ecran('SUJET 17.'); g.ecran('VOUS SOUHAITEZ|PARTIR.'); g.ecran('APPUYEZ.|VOTRE PORTE|S\'OUVRIRA.'); },
      A: { label: 'Appuyer', fx: function (g) {
        g.s.stats.presses++; g.obeir('B5');
        g.narr('Le bouton s\'enfonce. Cette fois, rien derrière la vitre : seulement un CLONK, dans ta porte.');
        g.ouvrirPorte('b5', 15);
        g.ecran('PORTE 17|DÉVERROUILLÉE.'); g.ecran('FERMETURE|AUTOMATIQUE|PROGRAMMÉE.');
        if (g.dispo() && g.flag('ligne') === 'ouverte') g.parle18('« …tu vas partir, alors. »');
      } },
      B: { label: 'Refuser', fx: function (g) { refuser(g, ['Offre refusée.']); g.confiance(1, 'b5'); if (g.dispo()) g.parle18('« T\'es toujours là… »'); } } },

    { id: 'B6', objet: 'btn', fil: 'bouton', ordre: true, qui: 'DERNIÈRE PRESSION', ecran: 'DERNIÈRE|PRESSION.', texte: '« Dernière pression. Appuyez. »',
      annonce: function (g) {
        g.narr('Tous les écrans s\'éteignent sauf le principal. Pas de musique. Pas de voix.');
        if (g.has('boutonDesactive')) g.incident('sabotageFinal', 2, 'ANOMALIE ACTIONNEUR|CONFIRMÉE.');
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
        if (g.has('objectif') || g.has('plan')) return '« Ne faites pas confiance au téléphone. Suivez le protocole et tout ira bien pour vous. »';
        if (g.truth === 'B' && g.s.conformite >= 5) return '« Profil conforme. Un poste d\'opérateur vous est proposé. »';
        return '« Un examen de votre dossier de conformité vous est proposé. Il ne modifiera rien. »';
      },
      annonce: function (g) {
        g.narr('La ventilation ralentit. Le bruit ambiant disparaît. Tu entends ta respiration.');
        HISTORIQUE.forEach(function (h) { if (h.quand(g)) resolve(h.lignes, g).forEach(function (l) { g.ecran(l); }); });
      },
      A: { label: function (g) { return g.has('objectif') || g.has('plan') ? 'Maintenir ma promesse' : g.truth === 'B' && g.s.conformite >= 5 ? 'Accepter le poste' : 'Accepter l\'examen'; },
        fx: function (g) {
          if (g.has('objectif') || g.has('plan')) { g.ecran('Réponse enregistrée.'); }
          else if (g.truth === 'B' && g.s.conformite >= 5) { g.narr('Une porte latérale s\'ouvre. Une blouse t\'attend, pliée sur une chaise.'); g.fin('employe'); }
          else { var st = g.s.stats; g.ecran('PRESSIONS : ' + st.presses + '.|ORDRES SUIVIS : ' + st.suivis + '.|REFUS : ' + st.refus + '.'); g.ecran('Fin de l\'examen.'); }
        } },
      B: { label: function (g) { return g.has('objectif') || g.has('plan') ? 'Abandonner' : 'Refuser'; },
        fx: function (g) {
          if (g.has('objectif') || g.has('plan')) { g.annulerPromesse(); g.ecran('Réponse enregistrée.'); g.ecran('Suivez le protocole et tout ira bien pour vous.'); if (g.dispo() && g.flag('ligne') === 'ouverte') g.parle18('« …je m\'en doutais. »'); }
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
        if (g.ecoute() || g.cycle === 3) g.ecran('Ne faites pas|confiance|au téléphone.');
      } },
      B: { label: 'Écouter sans répondre', fx: function (g) {
        g.flag('ligne', 'ouverte'); g.flag('tasse', true);
        g.tel('« Je sais que tu es là. J\'entends ta respiration. … Bon. Je rappellerai. »');
        if (g.ecoute() || g.cycle === 3) g.ecran('Ne faites pas|confiance|au téléphone.');
      } } },

    { id: 'T2', objet: 'phone', fil: 'telephone', qui: 'APPELER LA CHAMBRE 18',
      quand: function (g) { return g.flag('ligne') === 'ouverte' && !g.done('T2') && g.dispo() && !t5Dispo(g); },
      texte: '« C\'est toi ? Attends… Ils t\'appellent 17. Mais toi, comment tu t\'appelles vraiment ? »',
      A: { label: 'Dire ton vrai nom', fx: function (g) {
        g.confiance(1, 'nom'); g.flag('nomDit', true);
        if (g.ecoute()) g.ecran('Suivez le protocole|et tout ira bien|pour vous.');
        if (g.truth === 'C') { g.narr('Un silence. Puis elle répète ton nom, avec exactement ton intonation.'); g.tel('« …c\'est joli. »'); }
        else g.tel('« D\'accord… Je vais m\'en souvenir. »');
      } },
      B: { label: 'Donner un faux nom', fx: function (g) {
        if (g.truth === 'C') g.narr('Elle répète le faux nom, avec un temps de retard étrange, comme une bande qu\'on relance.');
        else g.tel('« D\'accord… »');
      } } },

    { id: 'T3', objet: 'phone', fil: 'telephone', qui: 'APPELER LA CHAMBRE 18',
      quand: function (g) { return g.flag('ligne') === 'ouverte' && g.done('T2') && !g.done('T3') && g.dispo() && !t5Dispo(g); },
      texte: '« J\'ai vu quelque chose sur leur plan. Dans le sol de ta chambre, près du boîtier : une trappe de maintenance. »',
      A: { label: '« Je te crois »', fx: function (g) { g.tel('« Il y a un verrou manuel sous la plaque. Tire-le vers toi. »'); g.gain('trappe'); g.confiance(1, 'croire'); if (g.ecoute()) g.ecran('Ne faites pas|confiance|au téléphone.'); } },
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
      B: { label: '« Chacun pour soi »', fx: function (g) { g.confiance(-2); g.tel('« …d\'accord. »'); g.narr('La 18 raccroche.'); if (g.truth === 'B' && g.ecoute()) g.ecran('INFORMATION REÇUE|DU SUJET 18.'); } } },

    { id: 'T5', objet: 'phone', fil: 'telephone', qui: 'APPELER LA CHAMBRE 18',
      quand: t5Dispo,
      texte: '« J\'ai peut-être trouvé une sortie. Il faut trois choses : que ta caméra soit aveugle, que le courant auxiliaire revienne, et ton signal, depuis ton boîtier. J\'attends ton signal. Pas indéfiniment. »',
      A: { label: 'Accepter', fx: function (g) { g.gain('plan'); g.flag('planFin', g.cycle + 3); g.anim('silBuee'); g.tel('« D\'accord. Je reste contre la vitre. Je t\'attends. »'); if (g.ecoute()) g.ecran('Suivez le protocole|et tout ira bien|pour vous.'); } },
      B: { label: 'Refuser', fx: function (g) { g.tel(g.truth === 'A' ? '« Très bien. Alors j\'essaie seul. Bientôt. »' : '« Très bien. Alors j\'essaie seule. Bientôt. »'); g.flag('seuleA', g.cycle + 2); } } },

    { id: 'APP18', objet: 'phone', fil: 'telephone', qui: 'APPELER LA CHAMBRE 18',
      quand: function (g) { return g.flag('ligne') === 'ouverte' && g.done('T1') && g.done('T2') && g.done('T3') && !t5Dispo(g); },
      texte: 'Composer le 18.',
      A: { label: 'Composer le 18', fx: function (g) {
        if (g.dispo() && !g.has('plan') && !g.flag('recoupe')) { g.flag('recoupe', true); g.tel(g.pick(PHRASES.recoupe[g.truth])); return; }
        g.tel(!g.dispo() ? 'Personne ne décroche.' : g.has('plan') ? '« J\'attends toujours ton signal. »' : g.pick(PHRASES.voix18));
      } },
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
    // 9.1 — La 19 : un second appel, puis une diversion qui détourne les caméras du secteur pendant un moment.
    { id: 'APP19B', objet: 'phone', fil: 'telephone', qui: 'RAPPELER LE 19', seul: true,
      quand: function (g) { return g.flag('ligne') === 'ouverte' && g.done('APP19') && g.cycle >= 12 && !g.done('APP19B'); },
      texte: '« C\'est toi, la 17 ? … Ils m\'ont donné un bouton, à moi aussi. Une voix dit que si j\'appuie, ça t\'aidera. Je dois appuyer ? »',
      A: { label: '« N\'appuie jamais »', fx: function (g) {
        g.flag('allie19', true);
        g.tel('« …D\'accord. Je n\'appuierai pas. »'); g.tel('« Si tu as besoin de quelque chose… je sais faire du bruit. Beaucoup de bruit. Rappelle-moi. »');
      } },
      B: { label: '« Fais ce qu\'ils disent »', fx: function (g) {
        g.tel('« D\'accord. »'); g.narr('CLAC. Un déclic, de l\'autre côté du mur de droite. Puis plus rien.');
        if (!g.aveugle()) g.ecran('SUJET 19 :|CONFORME.');
      } } },
    { id: 'DIVERSION', objet: 'phone', fil: 'telephone', qui: 'LE BRUIT DE LA 19', seul: true,
      quand: function (g) { return g.flag('ligne') === 'ouverte' && g.flag('allie19') && !g.done('DIVERSION') && g.cycle < g.dernier - 1; },
      texte: '« Tu veux ton bruit ? Dis-moi quand. Je tiendrai le temps qu\'il faut. Après… ils viendront pour moi. »',
      A: { label: '« Maintenant »', sous: 'Au moment suivant, les caméras du secteur regarderont la 19.',
        fx: function (g) { g.flag('bruit19', g.cycle + 1); g.tel('« Compte jusqu\'à dix. »'); g.narr('CLAC.'); } } },
    // 9.2 — Confronter la 18 avec ce qu'on sait (une preuve sur ce qu'on te montre d'elle).
    { id: 'CONFRONTER', objet: 'phone', fil: 'telephone', qui: 'CONFRONTER LA 18',
      quand: function (g) { return g.flag('ligne') === 'ouverte' && g.done('T1') && g.dispo() && !g.done('CONFRONTER') && (g.has('simulation') || g.has('videoTruquee') || g.has('protocole')); },
      texte: function (g) { return g.has('simulation') ? 'Tu as vu la silhouette se plier de douleur alors qu\'aucun courant n\'était parti.' : g.has('videoTruquee') ? 'Ils t\'ont montré une vidéo de la 18 qui rit avec un gardien. L\'heure ne colle pas.' : 'Le protocole parle de trois configurations du sujet adjacent : réel, opérateur, projection.'; },
      A: { label: 'Lui dire ce que tu sais', fx: function (g) {
        g.flag('confronte', true);
        if (g.truth === 'A') {
          // Une réponse par preuve (en A, la douleur sans courant n'existe pas) : la vidéo, sinon le protocole.
          if (g.has('videoTruquee')) { g.tel('« Une vidéo de moi ? … Ils me montrent la même chose. Toi, qui ris quand j\'ai mal. »'); g.tel('« On est deux à se faire mentir, alors. »'); }
          else { g.tel('« Trois configurations ? Réel, opérateur, projection… » Un silence. « Alors tu te demandes si je suis vrai. Moi aussi, je me le demande, pour toi. »'); g.tel('« Ils nous ont donné le même papier. »'); }
          g.confiance(1, 'confronte');
        } else if (g.truth === 'B') {
          if (g.has('simulation') || g.has('protocole')) {
            g.narr('Un long silence. Puis sa voix change : plus basse, plus vraie.');
            g.tel('« …Ils ont ma fille. Ils me disent quoi crier, et quand. Je n\'avais pas le choix. »');
            g.flag('demasquee', true); g.gain('verite');
          } else g.tel('« Une vidéo truquée ? Tu vois, ils mentent sur tout. »');
        } else {
          g.tel('Un silence. Puis ta propre voix, dans le combiné : « ' + (g.has('simulation') ? 'Tu n\'avais pas mal.' : 'Tu n\'es pas réelle.') + ' »');
          g.anim('silFige'); g.narr('Derrière la vitre, la silhouette s\'est figée. Elle reprend sa pose une seconde plus tard, exactement la même.'); g.gain('verite');
        }
      } } },
    // 9.5 — « Reste avec moi » : après une douleur, la 18 demande seulement qu'on reste en ligne (une fois par partie).
    // Si on reste, elle demande pourquoi : reconnaître, la peur, mentir ou se taire. Aucun objet, aucun pardon automatique.
    { id: 'AVEU', objet: 'phone', fil: 'telephone', qui: 'LA CHAMBRE 18 APPELLE', gratuit: true,
      quand: function (g) { return g.flag('ligne') === 'ouverte' && g.flag('aBlesse') && g.done('T1') && !g.done('AVEU') && g.dispo(); },
      texte: 'Une respiration hachée dans le combiné. « Je ne te demande pas de me croire. Reste juste au téléphone un moment. »',
      A: { label: '« Je suis là. »', fx: function (g) {
        g.narr({ A: 'Tu écoutes sa respiration. Elle tremble, puis ralentit, peu à peu.', B: 'Tu écoutes sa respiration. Elle se calme vite. Très vite.', C: 'Tu écoutes sa respiration. Elle ralentit… au même rythme que la tienne.' }[g.truth]);
        g.tel('« Pourquoi tu as appuyé ? »'); g.suite('AVEU2');
      } },
      B: { label: '« Dis-moi ce qu\'ils te font. »', fx: function (g) {
        g.tel('« Attends… laisse-moi reprendre mon souffle. »');
        if (g.truth === 'A') g.tel('« Une décharge. Dans le bras, puis partout. Après, je n\'entends plus rien pendant longtemps. »');
        else if (g.truth === 'B') { g.narr('Derrière sa voix, très bas, un bip. Elle se tait d\'un coup.'); g.tel('« …Ça brûle. C\'est tout ce que je peux dire. »'); }
        else g.tel('« Je ne sais pas. Dis-le-moi, toi. Tu le sais mieux que moi. »');
        g.narr('Elle raccroche.');
      } },
      C: { label: 'Raccrocher', fx: function (g) { g.son('lock'); g.narr('Tu raccroches. Le combiné est encore tiède dans ta main.'); } } },
    { id: 'AVEU2', objet: 'phone', fil: 'telephone', impose: true, gratuit: true, qui: 'LA QUESTION DE LA 18',
      texte: '« Pourquoi tu as appuyé ? »',
      A: { label: '« C\'était moi. Je sais ce que j\'ai fait. »', fx: function (g) {
        g.flag('aveu', 'avoue'); g.flag('aveuCycle', g.cycle); g.confiance(1, 'aveu');
        if (g.truth === 'A') g.tel('« …Merci de ne pas me mentir. » Un long silence. « Ne recommence pas. »');
        else if (g.truth === 'B') { g.tel('« Je sais. »'); g.narr('Un ton bien calme, pour quelqu\'un qui vient d\'avoir aussi mal.'); }
        else { g.tel('« Je sais. Je me souviens de l\'avoir fait. »'); g.narr('Elle a dit « fait », pas « subi ».'); }
      } },
      B: { label: '« J\'avais peur de désobéir. »', fx: function (g) {
        g.flag('aveu', 'peur'); g.flag('aveuCycle', g.cycle);
        if (g.truth === 'A') g.tel('« Moi aussi, j\'ai peur. Mais c\'est moi qui ai eu mal. »');
        else if (g.truth === 'B') { g.tel('« La peur. Oui… ça marche à tous les coups. »'); g.narr('Elle le dit comme on note un résultat.'); }
        else { g.tel('« Moi aussi, j\'avais peur. La première fois. »'); g.narr('La première fois : comme si elle avait déjà été à ta place.'); }
      } },
      C: { label: '« Ce n\'était pas moi. »', fx: function (g) {
        g.flag('aveu', 'menti');
        if (g.truth === 'A') {
          if (g.aveugle()) g.tel('« …D\'accord. Alors c\'est eux. »');
          else { g.tel('« …D\'accord. »'); g.ecran('SUJET 18 INFORMÉ :|IMPULSION ÉMISE|PAR LE SUJET 17.'); g.tel('« Ils disent que c\'est toi. … Je ne sais plus qui croire. »'); g.confiance(-1); }
        } else if (g.truth === 'B') { g.tel('« Ah oui ? »'); g.narr('Un petit rire, vite étouffé.'); if (!g.aveugle()) g.ecran('INFORMATION REÇUE|DU SUJET 18.'); }
        else { g.tel('« Tu mens. Je le sais toujours, quand tu mens. »'); g.narr('Plus bas, avec ta voix : « Moi aussi, je mens comme ça. »'); }
      } },
      D: { label: 'Ne rien dire', fx: function (g) {
        g.flag('aveu', 'silence');
        if (g.truth === 'A') { g.narr('Tu ne dis rien. Elle attend longtemps.'); g.tel('« …Ton silence, je l\'entends aussi. »'); }
        else if (g.truth === 'B') g.narr('Tu ne dis rien. Elle n\'insiste pas, comme si la réponse ne l\'intéressait pas vraiment.');
        else g.narr('Tu ne dis rien. Dans le combiné, quelqu\'un se tait exactement comme toi.');
        g.narr('Elle raccroche.');
      } } },
    { id: 'APP17', objet: 'phone', fil: 'telephone', qui: 'COMPOSER LE 17', seul: true,
      quand: function (g) { return g.flag('ligne') === 'ouverte' && !g.done('APP17'); }, texte: 'Ton propre numéro.',
      A: { label: 'Composer le 17', fx: function (g) { g.narr('Une tonalité. Puis ta propre respiration, avec deux secondes de retard.'); if (g.truth === 'C') { g.tel('Ta voix, enregistrée : « Tu m\'entends ? »'); g.narr('Coupure.'); } else g.narr('Une boucle du micro. Coupure.'); } } },
    { id: 'APP00', objet: 'phone', fil: 'telephone', qui: 'COMPOSER LE 00 — CONTRÔLE', seul: true,
      quand: function (g) { return g.has('operateur') && !g.flag('operateurOk'); }, texte: 'Le numéro que l\'opérateur t\'a laissé voir.',
      A: { label: 'Composer le 00', fx: operateur } },

    // ---------- La pièce ----------
    { id: 'P1', objet: 'drawer', fil: 'piece', qui: 'LE TIROIR', seul: true,
      quand: function (g) { return !g.flag('tiroirOuvert'); },
      texte: 'Le tiroir est verrouillé. Quelqu\'un a déjà forcé cette serrure. Par une fente, tu distingues le manche d\'un tournevis.',
      A: { label: 'Le forcer', req: function (g) { return !g.vu(); }, raison: 'La caméra te regarde. Il faudrait qu\'elle ne voie rien.',
        fx: function (g) {
        g.flag('tiroirOuvert', true); g.flag('tiroirBeant', true); g.son('thud');
        g.narr('Une languette du piètement est déjà tordue. Tu la glisses dans la fente et tu fais levier. CRAC. Personne ne t\'a vu.');
        g.gain('tournevis');
      } } },
    // Un tiroir forcé laissé ouvert : le prochain gardien qui entre le remarque et te fouille.
    { id: 'TIROIR', objet: 'drawer', fil: 'piece', qui: 'LE TIROIR', seul: true, gratuit: true,
      quand: function (g) { return g.flag('tiroirOuvert'); },
      texte: function (g) { return g.flag('tiroirAutorise') ? 'Le tiroir déverrouillé par le Système. La serrure est intacte.' : g.flag('tiroirBeant') ? 'Le tiroir est ouvert, la serrure arrachée. Ça se voit de la porte.' : 'Le tiroir est refermé. La serrure cassée ne se voit pas de la porte, mais une fouille du bureau la trouverait.'; },
      A: { label: function (g) { return g.flag('tiroirBeant') ? 'Refermer le tiroir' : 'Rouvrir le tiroir'; },
        fx: function (g) { g.flag('tiroirBeant', !g.flag('tiroirBeant')); g.son('thud'); } } },
    { id: 'COMP_FORCER', objet: 'compart', fil: 'piece', qui: 'LE COMPARTIMENT', seul: true,
      quand: function (g) { return g.flag('compartiment') !== 'vide'; },
      texte: 'Une petite plaque au bas du socle, vissée.',
      A: { label: 'L\'ouvrir avec le tournevis', req: function (g) { return g.has('tournevis') && !g.vu(); },
        raison: function (g) { return !g.has('tournevis') ? 'Il faut un tournevis.' : 'La caméra te regarde. Il faudrait qu\'elle ne voie rien.'; },
        fx: function (g) { g.flag('compartiment', 'vide'); g.anim('compartiment'); g.narr('Quatre petites vis. La plaque tombe. Dedans, un fusible : tu le prends.'); g.gain('fusible'); } } },

    { id: 'P2', objet: 'grille', fil: 'piece', qui: 'LA GRILLE D\'AÉRATION',
      quand: function (g) { return !g.has('conduit') && !g.done('P5'); },
      texte: 'Quatre vis. Des traces montrent qu\'elle a déjà été ouverte. Derrière les lamelles, un courant d\'air.',
      A: { label: 'Dévisser', req: function (g) { return g.has('tournevis') || g.has('outil'); }, raison: 'Quatre vis. Il faudrait un outil.',
        sous: function (g) { return !g.has('tournevis') && g.has('outil') ? 'Avec la lame de fortune : ça fera du bruit.' : ''; },
        fx: function (g) {
          if (!g.has('tournevis')) { g.son('thud'); g.narr('La lame ripe, grince, ripe encore. Le bruit résonne dans tout le mur.'); g.interdit('outil', 1, 'BRUIT MÉTALLIQUE|CHAMBRE 17.'); }
          g.narr('Quatre vis. La grille tombe. Derrière : un conduit, un courant d\'air. Au loin : toc… toc…'); if (g.manip('grille')) g.programmer('grille'); g.gain('conduit');
        } },
      B: { label: 'Passer un mot', si: function (g) { return !g.flag('motPasse'); },
        fx: function (g) {
          g.flag('motPasse', true);
          if (!g.dispo()) { g.narr('Tu arraches un feuillet du carnet et tu écris au crayon « TU M\'ENTENDS ? » et tu glisses le papier entre les lamelles. Tu attends. Aucun coup. Aucun papier ne revient.'); return; }
          g.confiance(1, 'mot');
          g.narr('Tu arraches un feuillet du carnet et tu écris au crayon « TU M\'ENTENDS ? » et tu glisses le papier entre les lamelles. Quelques secondes. TOC. TOC. TOC.'); g.son('knock');
          // En C, aucun papier ne peut revenir : seulement un son enregistré.
          if (g.truth === 'C') g.narr('Puis, très bas, dans le conduit, une voix qui ressemble à la tienne : « Je suis là. » Aucun papier ne revient.');
          else { g.narr('Un papier revient :'); g.papier({ recto: [g.pick(PHRASES.motsRetour)], signature: '' }); }
        } },
      // La ration passée à la 18 : chaque vérité y répond à sa façon (en C, personne ne la ramasse).
      C: { label: 'Passer la ration', si: function (g) { return g.has('ration') && !g.flag('rationPassee'); },
        fx: function (g) {
          g.flag('rationPassee', 'perdue'); g.lose('ration');
          if (!g.dispo()) { g.narr('La ration glisse entre les lamelles. De l\'autre côté, personne ne la ramasse.'); return; }
          if (g.truth === 'A') { g.flag('rationPassee', 'recue'); g.confiance(1, 'ration'); g.narr('Les lamelles avalent la ration. Un long silence. Puis, tout doucement : toc. Merci.'); }
          else if (g.truth === 'B') { g.flag('rationPassee', 'rendue'); g.confiance(1, 'ration'); g.narr('Quelques secondes. La ration revient, intacte, avec un mot : « Garde-la. Toi, tu en as besoin. »'); g.gain('ration'); }
          else g.narr('Tu l\'entends glisser, rebondir sur une tôle… puis plus rien. Personne ne la ramasse.');
        } } },

    { id: 'P3', objet: 'box', fil: 'piece', qui: 'LE BOÎTIER ÉLECTRIQUE',
      quand: function () { return true; },
      texte: 'Un boîtier de maintenance, vissé. Trois circuits, d\'après l\'étiquette : CAMÉRA A · ACTIONNEUR CH.18 · AUX 24 V.',
      // La caméra coupée se voit toujours (signal perdu) : un gardien viendra la rétablir.
      A: { label: 'Couper CAMÉRA A', si: function (g) { return !g.has('cameraCoupee'); }, req: function (g) { return g.has('tournevis'); }, raison: 'Le panneau est vissé. Il faudrait un outil.',
        fx: function (g) { g.manip('boitier'); g.son('lock'); g.narr('Le voyant de la caméra s\'éteint. Son moteur s\'arrête.'); g.ecran('CAMÉRA :|SIGNAL PERDU.'); g.gain('cameraCoupee'); g.programmer('coupee'); } },
      // L'actionneur coupé sans être vu passe pour un défaut ; vu, c'est un sabotage.
      B: { label: 'Couper ACTIONNEUR CH.18', si: function (g) { return !g.has('boutonDesactive'); }, req: function (g) { return g.has('tournevis'); }, raison: 'Le panneau est vissé. Il faudrait un outil.',
        fx: function (g) { var vu = g.manip('boitier'); g.flag('sabConnu', vu); if (vu) g.programmer('actionneur'); g.son('lock'); g.narr('CLAC. Le bouton reste utilisable, mais plus rien ne part vers la Chambre 18.'); g.gain('boutonDesactive'); } },
      // Remettre en état de soi-même : l'avantage est perdu ; un sabotage connu, réparé volontairement, fait baisser le soupçon (une fois).
      C: { label: 'Remettre le boîtier en état', si: function (g) { return g.has('cameraCoupee') || g.has('boutonDesactive'); },
        sous: function (g) { return remiseUtile(g) ? 'Prend du temps. Le Système le verra.' : 'Prend du temps.'; },
        fx: function (g) {
          var utile = remiseUtile(g), R = g.flag('reparer') || {};
          g.son('lock'); g.lose('cameraCoupee'); g.lose('boutonDesactive'); delete R.coupee; delete R.actionneur; g.flag('sabConnu', false);
          g.narr('Tu rebranches chaque circuit, un par un. Les voyants repassent au vert.');
          g.ecran('CIRCUITS|NOMINAUX.');
          if (utile) { g.flag('remiseFaite', true); if (g.apaiser()) g.ecran('INITIATIVE|ENREGISTRÉE.'); }
        } } },

    { id: 'FUS', objet: 'box', fil: 'piece', qui: 'AUX 24 V — DÉFAUT', seul: true,
      quand: function (g) { return g.flag('aux') === 'defaut' && g.has('fusible'); },
      texte: function (g) { return g.has('tournevis') ? 'Un emplacement noirci, étiqueté AUX 24 V. Ton fusible est compatible.' : 'Un emplacement noirci, étiqueté AUX 24 V. Le panneau est vissé.'; },
      A: { label: 'Remplacer le fusible', req: function (g) { return g.has('tournevis'); }, raison: 'Il faut un tournevis pour ouvrir le panneau.',
        fx: function (g) {
          g.narr('Tu retires le fusible grillé et tu insères le nouveau. CLAC. Le voyant passe du rouge au vert.');
          g.lose('fusible'); g.flag('aux', 'ok'); g.flag('fusibleInstalle', true); g.ecran('BUS AUXILIAIRE|RÉTABLI.');
          g.manip('fusible');
          g.narr('CLAC, sous la trappe : le verrou électrique s\'ouvre. Il était branché sur ce circuit.');
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
          else if (g.truth === 'B') { g.gain('verite'); g.tel('« C\'est bon. Ne bouge plus. »'); g.narr('Des pas dans le couloir. Ta porte s\'ouvre : elle entre, seule, une seringue à la main. À sa ceinture, un bipeur. Elle hésite sur le seuil.'); g.voix('« Ils ont ma fille. Je n\'avais pas le choix. »'); g.suite('RENCONTRE_B'); }
          else {
            g.gain('verite'); g.narr('La voix continue dans le combiné… mais la silhouette derrière la vitre ne bouge plus. Image et voix ne sont pas liées.'); g.anim('silFige');
            g.narr('Ta porte se déverrouille. Celle de la 18 aussi. Tu sors dans le couloir et tu pousses la porte 18.');
            g.image('rev_C'); g.narr('Personne. Face à la vitre : un projecteur et un haut-parleur.'); g.suite('RENCONTRE_C');
          }
        } } },

    { id: 'P4', objet: 'trappe', fil: 'piece', qui: 'LA TRAPPE',
      quand: function (g) { return trappeConnue(g) && !g.has('sortieCachee') && g.done('P4') !== 'A'; },
      texte: function (g) { return trappeOuvrable(g) ? 'Une plaque dans le sol, une poignée affleurante. ' + mecanisme(g) : 'Une plaque dans le sol. Un verrou électrique, hors tension : le voyant à côté est éteint.'; },
      A: { label: 'Descendre aux archives', double: true,
        req: function (g) { return trappeOuvrable(g) && g.libreSuivant() && g.cycle < g.dernier - 2; },
        raison: function (g) { return !trappeOuvrable(g) ? 'Le verrou électrique est hors tension : il faudrait le verrou manuel, le code ou rétablir le courant.' : g.cycle >= g.dernier - 2 ? 'Trop tard pour descendre : tu ne remonterais pas à temps.' : 'Un ordre arrive bientôt : en descendant maintenant, tu le manquerais. Attends un peu.'; },
        fx: function (g) { g.flag('awayCycle', g.cycle + 1); g.narr('Tu descends. Là-haut, la pièce continue sans toi.'); if (g.manip('trappe')) { g.ecran('SUJET 17|NON VISIBLE.'); g.programmer('trappe'); } } },
      B: { label: 'Préparer une sortie dérobée', sous: function (g) { return g.done('P4') !== 'A' ? 'Prend du temps. Ensuite, la trappe ne mènera plus aux archives.' : ''; }, req: function (g) { return trappeOuvrable(g); }, raison: 'Le verrou électrique est hors tension : il faudrait le verrou manuel, le code ou rétablir le courant.',
        fx: function (g) { g.narr('Sous la plaque, un volet basculant à deux positions : l\'escalier des archives, ou un vide technique derrière la porte sécurisée. Tu retires la goupille : le volet bascule vers le vide technique et se bloque. L\'escalier est condamné.'); g.gain('sortieCachee'); if (g.manip('sortie')) g.programmer('sortie'); } } },

    { id: 'P5', objet: 'grille', fil: 'piece', qui: 'LE CONDUIT',
      quand: function (g) { return g.has('conduit') && !g.done('P5'); },
      texte: function (g) { return 'Après quelques mètres, une bifurcation. Sur la tôle : « 18 → » et « ← EXT. ».' + (g.vu() ? ' Derrière toi, le voyant de la caméra suit tes jambes.' : ''); },
      A: { label: 'Vers la 18', fx: rencontre18 },
      B: { label: 'Vers EXT.', sous: 'Au bout, une grille vissée : il faudra encore du temps.', req: function (g) { return g.libreSuivant(); }, raison: 'Un ordre arrive bientôt : tu le manquerais.',
        fx: function (g) { if (conduitVu(g)) return; g.flag('ext', g.cycle + 1); g.narr('Tu rampes vers « EXT. ». L\'air devient froid. Au bout : une grille, vissée de l\'extérieur… et de l\'intérieur.'); } } },
    { id: 'EXT', objet: 'grille', fil: 'piece', impose: true, qui: 'LA GRILLE EXTÉRIEURE',
      texte: 'La grille du bout du conduit. Quatre vis. Derrière : la nuit.',
      A: { label: 'Dévisser et sortir', req: function (g) { return g.has('tournevis'); }, raison: 'Sans outil, impossible de l\'ouvrir.',
        fx: function (g) { g.narr('Quatre vis. Air froid. Bruit extérieur.' + (g.has('objectif') ? ' Tu lui avais promis de venir.' : '')); g.fin('seulDehors'); } },
      B: { label: 'Faire demi-tour', fx: function (g) { g.narr('Tu rebrousses chemin et tu reviens dans ta chambre.'); } } },

    { id: 'RENCONTRE_B', objet: 'window', fil: 'piece', impose: true, qui: 'LA COMPLICE',
      texte: 'Elle recule vers la porte de sécurité. Le mécanisme commence à se refermer. « Ne m\'oblige pas à appeler. »',
      A: { label: 'Bloquer la porte avec le tournevis', req: function (g) { return g.has('tournevis'); }, raison: 'Tu n\'as rien pour bloquer le mécanisme.',
        fx: function (g) { g.narr('Tu glisses le tournevis dans le mécanisme. Il grince et s\'arrête. Elle recule.'); g.flag('variante', 'force'); g.fin('complice'); } },
      B: { label: 'Négocier', fx: function (g) {
        if (g.flag('demasquee')) { g.voix('« Tu savais. Et tu m\'as quand même parlé. »'); g.narr('Elle te tend son badge d\'accès.'); g.flag('variante', 'negocie'); g.fin('complice'); }
        else if (g.s.confiance >= 3) { g.voix('« …Tu m\'as crue, toi. Même quand je mentais. »'); g.narr('Elle te tend son badge d\'accès.'); g.flag('variante', 'negocie'); g.fin('complice'); }
        else { g.voix('« Je suis désolée. »'); g.narr('Elle appuie sur son bipeur. La seringue. Noir.'); g.fin('sujet18'); }
      } },
      C: { label: 'Accepter leur offre', si: function (g) { return g.s.conformite >= 5; },
        fx: function (g) { g.narr('« Le Système veut te parler. Il a une place pour toi. » Tu hoches la tête.'); g.fin('employe'); } } },

    { id: 'RENCONTRE_C', objet: 'window', fil: 'piece', impose: true, qui: 'LA CHAMBRE 18',
      texte: 'Sur un écran : SUJET 17 — SESSION PRÉCÉDENTE. Derrière une plaque marquée « MAINTENANCE B » : un gros relais.',
      A: { label: 'Neutraliser le relais (badge)', req: function (g) { return g.has('badge') && g.has('relaisReset'); },
        raison: function (g) { return !g.has('relaisReset') ? 'Tu ne sais pas ce que commande ce relais.' : 'Il faut un badge de maintenance.'; },
        fx: function (g) { g.narr('Le badge de 16 ouvre la plaque. Tu arraches le relais de réinitialisation.'); g.ecran('RÉINITIALISATION…'); g.ecran('ÉCHEC.'); g.fin('boucle'); } },
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
      A: { label: 'Couvrir l\'objectif avec ta veste', si: function (g) { return !g.flag('vesteConfisquee'); }, req: function (g) { return !g.flag('vesteObjet'); }, raison: 'Ta veste enveloppe déjà un objet.', fx: function (g) { g.flag('veste', true); g.programmer('veste'); g.interdit('veste', 1, 'OBJECTIF|OBSTRUÉ.'); g.narr('La veste ne tiendra pas éternellement : quelqu\'un viendra l\'enlever.'); } },
      B: { label: 'La tourner vers le mur', req: function (g) { return g.has('tournevis'); }, raison: 'Il faut un tournevis.',
        fx: function (g) { g.son('lock'); g.narr('Tu desserres la fixation et tu tournes l\'objectif vers le mur.'); g.gain('cameraTournee'); g.programmer('tournee'); g.interdit('tournee', 1, 'CAMÉRA A :|IMAGE PERDUE.'); } } },
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
    { id: 'H1', objet: 'note', fil: 'passe', qui: 'LE MOT DE 16', gratuit: true,
      quand: function (g) { return g.cycle >= 4 && !g.done('H1'); },
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
        fx: function (g) { g.narr('Tu branches l\'enregistrement sur la diffusion. CLAC. La voix résonne partout.'); g.narr(g.flag('operateurOk') ? 'Au téléphone, l\'opérateur : « …je déverrouille tout. »' : 'Depuis ton boîtier, par le bus de maintenance, tu enclenches le relais collectif : CHAMBRES 01 À 24.'); g.narr('Une porte. Puis deux. Puis dix.'); g.fin('revolte'); } } },

    // ---------- 9.0 : ration, tasse, privilèges, objets ----------
    // Moment 1 : un plateau glisse sous la porte. Prendre ce qu'il y a dessus ne coûte pas de temps.
    { id: 'RATION', objet: 'door', fil: 'piece', qui: 'LE PLATEAU', seul: true, gratuit: true,
      quand: function (g) { return g.cycle >= 1 && !g.done('RATION'); },
      texte: 'Au pied de la porte, un plateau en métal : une barre de ration sous plastique, un petit pot de compote et une cuillère.',
      A: { label: 'Manger', fx: function (g) { g.son('paper'); g.narr('Ça n\'a aucun goût. Tu gardes la cuillère.'); g.gain('cuillere'); } },
      B: { label: 'Garder la ration', fx: function (g) { g.son('paper'); g.narr('Tu glisses la ration et la cuillère dans ta poche.'); g.gain('ration'); g.gain('cuillere'); } } },
    // Sans tournevis, la cuillère devient une lame de fortune : deux moments de travail, contre le sol.
    { id: 'AIGUISER', objet: 'cuillere', fil: 'piece', qui: 'LA CUILLÈRE', seul: true,
      quand: function (g) { return g.has('cuillere') && !g.has('tournevis'); },
      texte: function (g) { return g.flag('aiguise') ? 'Le bord de la cuillère commence à mordre. Encore un effort.' : 'Une cuillère en métal. Frottée assez longtemps contre le sol, elle pourrait faire une lame.'; },
      A: { label: function (g) { return g.flag('aiguise') ? 'Finir la lame' : 'L\'aiguiser contre le sol'; },
        sous: function (g) { return g.flag('aiguise') ? 'Prend du temps.' : 'Prend du temps. Il faudra s\'y remettre une fois.'; },
        fx: function (g) {
          if (!g.flag('aiguise')) { g.flag('aiguise', 1); g.narr('Tu frottes la cuillère contre le béton, longtemps. Le bord s\'amincit.'); return; }
          g.lose('cuillere'); g.gain('outil'); g.narr('Le bord est assez fin pour mordre une vis. Pas assez solide pour un panneau. Ça fera du bruit.');
        } } },
    // La tasse : écouter à travers le mur, ou la briser pour détourner l'inspection.
    { id: 'TASSE', objet: 'mug', fil: 'piece', qui: 'LA TASSE',
      quand: function (g) { return !g.flag('tasseCassee') && (!g.flag('tasseEcoute') || g.cycle < 10); },
      texte: 'Une tasse de café froid. Contre un mur, une tasse fait une oreille.',
      A: { label: 'Écouter contre le mur', si: function (g) { return !g.flag('tasseEcoute'); },
        fx: function (g) {
          g.flag('tasseEcoute', true);
          g.narr(g.truth === 'A' ? 'Côté 18 : une respiration rapide, une sangle qui frotte.' : g.truth === 'B' ? 'Côté 18 : un bip court, très régulier. Comme un bipeur.' : 'Côté 18 : rien. Pas un souffle. Seulement le ronron d\'une machine.');
          g.narr('Côté couloir : ' + ronde(g), true);
        } },
      B: { label: 'La briser pour faire diversion', si: function (g) { return g.cycle < 10; },
        sous: 'Prend du temps. Les éclats attireront le gardien de l\'inspection.',
        fx: function (g) { g.flag('tasseCassee', true); g.flag('diversion', true); g.son('thud'); g.narr('Tu laisses tomber la tasse près de la porte. Elle éclate. Les morceaux resteront là pour le gardien.'); } } },
    // Envelopper un objet interdit dans la veste : il échappe à une inspection ordinaire, pas à une fouille complète.
    { id: 'VESTE', objet: 'bureau', fil: 'piece', qui: 'TA VESTE',
      quand: function (g) { return !g.flag('veste') && !g.flag('vesteConfisquee') && !g.flag('vesteObjet') && aCacher(g).length; },
      texte: 'Ta veste, sur le dossier de la chaise. Roulée, elle peut cacher un objet. Mais alors, plus question de la poser sur la caméra.',
      A: { label: function (g) { return 'Y envelopper : ' + OBJETS[aCacher(g)[0]].toLowerCase(); }, fx: function (g) { var k = aCacher(g)[0]; g.flag('vesteObjet', k); g.narr('Tu roules ' + OBJETS[k].toLowerCase() + ' dans ta veste.'); } } },

    // Privilège 1 : une question au Système, réponse exacte mais limitée.
    { id: 'QUESTION', objet: 'monitor', fil: 'systeme', qui: 'UNE QUESTION AUTORISÉE', seul: true, gratuit: true,
      quand: function (g) { return g.flag('question') && !g.done('QUESTION'); },
      texte: '« Conformité reconnue. Une question vous est accordée. Une seule. »',
      A: { label: 'Ma porte', fx: function (g) { g.ecran('PORTE 17 :|VERROU MAGNÉTIQUE.'); g.ecran('OUVERTURE :|SYSTÈME, OPÉRATEUR,|BADGE MAINTENANCE.'); } },
      B: { label: 'La prochaine inspection', fx: function (g) {
        if (g.cycle < 10) { g.ecran('INSPECTION :|AVANT LA FIN|DE LA PURGE.'); g.ecran('CIBLE PRIORITAIRE :|' + NOMS_CIBLE[cible(g)] + '.'); }
        else { var R = g.flag('reparer') || {}, k = Object.keys(R)[0]; g.ecran(k ? 'MAINTENANCE PRÉVUE :|' + (NOMS_REPARER[k] || 'CHAMBRE 17') + '.' : 'AUCUNE MAINTENANCE|PRÉVUE.'); }
      } },
      C: { label: 'L\'alimentation', fx: function (g) {
        g.ecran('AUX 24 V :|' + (g.flag('fusibleInstalle') || g.flag('aux') !== 'defaut' ? 'NOMINAL' : 'EN DÉFAUT') + '.');
        g.ecran('TRAPPE DE SERVICE :|VERROU SUR AUX 24 V.'); if (g.flag('compartiment') !== 'vide') g.ecran('PIÈCE DE RECHANGE :|SOCLE DU BUREAU.');
      } } },
    // Privilège 3 : le sursis, ou une information sur le protocole. L'un exclut l'autre.
    { id: 'PRIV3', objet: 'monitor', fil: 'systeme', qui: 'CONTREPARTIE', seul: true, gratuit: true,
      quand: function (g) { return g.flag('privilege3') && !g.done('PRIV3'); },
      texte: '« Conformité élevée. Choisissez votre contrepartie. »',
      A: { label: 'Un sursis', sous: 'Retarder une fois, de deux moments, une intervention ou une maintenance.', fx: function (g) { g.gain('sursis'); g.ecran('SURSIS ADMINISTRATIF|ACCORDÉ.|USAGE UNIQUE.'); } },
      B: { label: 'Mon dossier', sous: 'Une information vérifiable sur le protocole.', fx: function (g) { g.ecran('PROTOCOLE 04 :|TROIS CONFIGURATIONS|DU SUJET ADJACENT.'); g.ecran('RÉEL. OPÉRATEUR.|PROJECTION.'); g.gain('protocole'); } } },
    { id: 'SURSIS', objet: 'monitor', fil: 'systeme', qui: 'LE SURSIS', seul: true, gratuit: true,
      quand: function (g) { return g.has('sursis') && (g.flag('intervention') || Object.keys(g.flag('reparer') || {}).length); },
      texte: '« Sursis administratif. Usage unique. »',
      A: { label: 'Retarder l\'intervention', si: function (g) { return !!g.flag('intervention'); },
        fx: function (g) { g.lose('sursis'); g.flag('intervention', Math.min(g.dernier - 1, g.flag('intervention') + 2)); g.ecran('INTERVENTION|DIFFÉRÉE.'); g.narr('Dans le couloir, les pas s\'arrêtent. Puis s\'éloignent.'); } },
      B: { label: 'Retarder la maintenance', si: function (g) { return Object.keys(g.flag('reparer') || {}).length > 0; },
        fx: function (g) { var R = g.flag('reparer'); Object.keys(R).forEach(function (k) { R[k] += 2; }); g.lose('sursis'); g.ecran('MAINTENANCE|REPORTÉE.'); } } },
    // Rendre un objet interdit à la caméra : il est perdu, le soupçon baisse (une fois, avant l'intervention).
    { id: 'RENDRE', objet: 'camera', fil: 'camera', qui: 'RENDRE UN OBJET',
      quand: function (g) { return g.done('C1') && !g.flag('renduFait') && g.s.soupcon > 0 && g.s.soupcon < 4 && aRendre(g).length; },
      texte: 'Montrer à la caméra un objet interdit, puis le glisser dans la fente de destruction. Le Système aime les aveux.',
      A: { label: function (g) { return 'Rendre : ' + OBJETS[aRendre(g)[0]].toLowerCase(); }, req: function (g) { return !g.aveugle(); }, raison: 'La caméra ne voit rien.', fx: function (g) { rendre(g, 0); } },
      B: { label: function (g) { return 'Rendre : ' + OBJETS[aRendre(g)[1]].toLowerCase(); }, si: function (g) { return aRendre(g).length > 1; }, req: function (g) { return !g.aveugle(); }, raison: 'La caméra ne voit rien.', fx: function (g) { rendre(g, 1); } },
      C: { label: function (g) { return 'Rendre : ' + OBJETS[aRendre(g)[2]].toLowerCase(); }, si: function (g) { return aRendre(g).length > 2; }, req: function (g) { return !g.aveugle(); }, raison: 'La caméra ne voit rien.', fx: function (g) { rendre(g, 2); } } }
  ];
  function aCacher(g) { return CONFISCABLES.filter(function (k) { return g.has(k) && g.flag('cache') !== k && !g.flag('autorise_' + k); }); }
  function aRendre(g) { return CONFISCABLES.filter(function (k) { return g.has(k) && !g.flag('autorise_' + k); }); }
  function rendre(g, i) {
    var k = aRendre(g)[i]; g.lose(k); if (g.flag('vesteObjet') === k) g.flag('vesteObjet', null);
    g.flag('renduFait', true); g.s.stats.gestes++;
    g.narr('Tu lèves ' + OBJETS[k].toLowerCase() + ' devant l\'objectif, puis tu le glisses dans la fente.');
    g.ecran('OBJET RESTITUÉ.'); if (g.apaiser()) g.ecran('COOPÉRATION|ENREGISTRÉE.');
  }
  function remiseUtile(g) { return !g.flag('remiseFaite') && g.s.soupcon > 0 && g.s.soupcon < 4 && (g.has('cameraCoupee') || (g.has('boutonDesactive') && !!g.flag('sabConnu'))); }

  // L'inspection du moment 10 vise d'abord une cible, annoncée au moment 8 (ce que le Système soupçonne, sinon au hasard).
  var NOMS_CIBLE = { boitier: 'BOÎTIER ÉLECTRIQUE', grille: 'GRILLE D\'AÉRATION', trappe: 'TRAPPE DE SERVICE', bureau: 'BUREAU' };
  var NOMS_REPARER = { veste: 'CAMÉRA A', tournee: 'CAMÉRA A', coupee: 'BOÎTIER ÉLECTRIQUE', actionneur: 'BOÎTIER ÉLECTRIQUE', grille: 'GRILLE D\'AÉRATION', sortie: 'TRAPPE DE SERVICE', trappe: 'TRAPPE DE SERVICE' };
  function cible(g) {
    if (g.flag('cible')) return g.flag('cible');
    var l = [];
    if (g.has('cameraCoupee') || g.has('boutonDesactive')) l.push('boitier');
    if (g.has('conduit')) l.push('grille');
    if (g.has('sortieCachee')) l.push('trappe');
    if (g.flag('tiroirBeant') || g.flag('cache')) l.push('bureau');
    var c = g.pick(l.length ? l : ['boitier', 'grille', 'trappe', 'bureau']);
    g.flag('cible', c); return c;
  }
  // Ce qu'on entend du couloir, la tasse contre le mur.
  function ronde(g) {
    if (g.cycle < 10) return 'deux gardiens parlent de l\'inspection. « …on commence par ' + { boitier: 'le boîtier', grille: 'la grille', trappe: 'la trappe', bureau: 'le bureau' }[cible(g)] + '. »';
    var R = g.flag('reparer') || {}, k = Object.keys(R)[0];
    return k ? '« …faudra repasser à la 17, pour ' + { veste: 'la caméra', tournee: 'la caméra', coupee: 'le boîtier', actionneur: 'le boîtier', grille: 'la grille', sortie: 'la trappe', trappe: 'la trappe' }[k] + '. »' : 'rien. Personne ne doit passer de sitôt.';
  }

  // Les privilèges de l'obéissance : au 1er, 2e et 3e ordre entièrement obéi.
  function PRIVILEGE(g, n) {
    if (n === 1) { g.flag('question', true); g.ecran('CONFORMITÉ|RECONNUE.'); g.ecran('UNE QUESTION|VOUS EST ACCORDÉE.'); }
    else if (n === 2) {
      // 9.8 : un geôlier ne donne pas d'outil. La conformité allège la surveillance.
      if (g.apaiser()) { g.ecran('CONFORMITÉ|RECONNUE.'); g.ecran('SURVEILLANCE|ALLÉGÉE.'); }
      else { g.ecran('CONFORMITÉ|RECONNUE.'); g.ecran('DOSSIER|SANS INCIDENT.'); }
    } else if (n === 3) { g.flag('privilege3', true); g.ecran('CONFORMITÉ|ÉLEVÉE.'); g.ecran('CONTREPARTIE|DISPONIBLE.'); }
  }
  // 9.5 — Après « Reste avec moi », à la pression suivante, la 18 reprend tes propres mots (une fois).
  function RAPPEL18(g) {
    var a = g.flag('aveu');
    if (g.flag('rappel18') || (a !== 'avoue' && a !== 'peur') || g.cycle <= g.flag('aveuCycle')) return null;
    g.flag('rappel18', true);
    return (a === 'avoue'
      ? { A: '« Tu m\'avais dit que tu savais ce que tu avais fait. Et tu recommences. »', B: '« Tu m\'avais dit que tu savais ce que tu faisais. » Sa voix ne tremble pas.', C: '« Tu savais ce que tu faisais. Moi aussi, je le savais. »' }
      : { A: '« Encore la peur ? »', B: '« Toujours la peur. »', C: '« Encore peur ? Moi aussi, je recommence toujours. »' })[g.truth];
  }
  // Raccrocher au nez : un appel refusé, pas seulement manqué.
  function RACCROCHER(g, appel) {
    g.son('lock');
    if (appel) { g.confiance(-1, 'raccroche'); g.narr('Tu décroches et tu raccroches aussitôt. Derrière la vitre, la silhouette garde longtemps le combiné contre son oreille.'); g.ecran('COMMUNICATION|INTERROMPUE.'); g.ecran('MERCI, SUJET 17.'); }
    else { g.narr('Tu décroches et tu raccroches aussitôt. La sonnerie s\'arrête net.'); g.ecran('MERCI,|SUJET 17.'); }
  }

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
    page(3, 'drawer', function (g) { return g.flag('tiroirBeant'); }, 'Au fond du tiroir, sous le revêtement : une page arrachée.'),
    page(4, 'grille', function (g) { return g.has('conduit'); }, 'Dans le conduit, une page coincée dans une jointure.')
  );

  // ---------- les moments (table unique, docs/DIRECTIVES_REV2.txt §3) ----------
  // Ce qui se passe au début de certains moments. Les ordres ont leur propre annonce.
  function inspection(g) {
    g.ecran(g.pick(PHRASES.inspection));
    g.narr('Des pas. La porte s\'ouvre. Un gardien entre, sans un mot. Il inspecte le tiroir, le bureau, la grille, la trappe et le boîtier.', true);
    VISITE(g, true);
  }
  // Un gardien entre : il remet en ordre ce que le Système sait et ce qu'il voit (complete : inspection, il ouvre aussi le boîtier et la trappe).
  // Un tiroir forcé laissé ouvert déclenche une fouille. Une chambre vide déclenche l'alerte.
  // La diversion de la 19 (moment suivant l'appel) : cris, couloir, caméras détournées. Ensuite, la 19 se tait.
  function BRUIT19(g) {
    g.son('knock'); g.narr('Dans la 19, des cris. Des coups contre la porte, de plus en plus forts. Des pas pressés passent devant ta chambre sans s\'arrêter.');
    g.ecran('INCIDENT|CHAMBRE 19.'); g.ecran('CAMÉRAS DU SECTEUR|REDIRIGÉES.');
    g.narr('Ta caméra s\'est tournée vers le couloir. Tu as ce moment-ci, pas plus.');
  }
  function VISITE(g, complete) {
    var s = g.s, c = g.cycle, R = s.flags.reparer = s.flags.reparer || {}, l = [];
    function du(k) { return R[k] != null && R[k] <= c; }
    var absent = g.absent();
    // Inspection (complete) : fouille complète si le soupçon est déjà à 2, sinon seulement la cible annoncée (sauf diversion).
    var fouilleComplete = complete && s.soupcon >= 2, diversion = complete && !fouilleComplete && !!g.flag('diversion');
    var vise = function (k) { return fouilleComplete || (complete && !diversion && cible(g) === k); };
    var casse = complete && !!g.flag('diversion');
    if (casse) { g.flag('diversion', false); l.push('Des éclats de tasse jonchent le seuil : il ne peut pas refermer la porte sans les ramasser. Il s\'y met, un à un, longtemps.' + (fouilleComplete ? ' Puis il fouille quand même toute la pièce.' : ' Quand il a fini, il ne lui reste plus le temps de tout vérifier.')); }
    if (g.flag('veste')) { g.flag('veste', false); g.flag('vesteConfisquee', true); l.push('Il retire ta veste de la caméra et l\'emporte.'); }
    if (g.has('cameraTournee')) { g.lose('cameraTournee'); l.push('Il remet la caméra face à la pièce.'); }
    if (g.has('cameraCoupee')) { g.lose('cameraCoupee'); l.push('Il ouvre le boîtier et rétablit le circuit de la caméra.'); }
    if (g.has('boutonDesactive') && (du('actionneur') || vise('boitier'))) {
      // Trouvé à l'inspection sans défaut signalé : c'est un sabotage.
      if (!du('actionneur') && !g.flag('sabConnu')) g.interdit('sabotage', 2, 'SABOTAGE|DÉCOUVERT.');
      g.lose('boutonDesactive'); g.flag('sabConnu', false); l.push('Il rebranche l\'actionneur de la 18. Le voyant repasse au vert.');
    }
    if (g.has('conduit') && (!complete || du('grille') || vise('grille'))) { g.lose('conduit'); delete s.done.P2; l.push('Il revisse la grille d\'aération.'); }
    if (g.has('sortieCachee') && (du('sortie') || vise('trappe'))) { g.lose('sortieCachee'); l.push('Il remet la goupille de la trappe.'); }
    if (du('trappe')) l.push('Il soulève la trappe, jette un œil dessous, la referme.');
    Object.keys(R).forEach(function (k) { if (du(k)) delete R[k]; });
    ['veste', 'tournee', 'coupee', 'actionneur', 'grille', 'sortie'].forEach(function (k) {
      var la = { veste: g.flag('veste'), tournee: g.has('cameraTournee'), coupee: g.has('cameraCoupee'), actionneur: g.has('boutonDesactive'), grille: g.has('conduit'), sortie: g.has('sortieCachee') }[k];
      if (!la) delete R[k];
    });
    if (absent) {
      g.narr('Pendant ton absence, un gardien est entré dans ta chambre. Il l\'a trouvée vide. L\'alarme hurle dans tout le bâtiment.', true);
      g.alerte(); return;
    }
    // Un tiroir forcé : visible s'il est resté ouvert, trouvé si l'inspection vise le bureau.
    var fouille = !g.flag('tiroirAutorise') && (!!g.flag('tiroirBeant') || (g.flag('tiroirOuvert') && vise('bureau')));
    if (!complete && !l.length && !fouille) return;
    if (!complete) { g.son('lock'); g.narr('CLONK. La porte s\'ouvre. Un gardien entre, sans un mot, pour la maintenance.', true); }
    l.forEach(function (x) { g.narr(x); });
    var pris = [];
    if (fouille) {
      g.narr(g.flag('tiroirBeant') ? 'Il remarque le tiroir ouvert, la serrure arrachée. Il le referme… puis il te fouille.' : 'Il ouvre le tiroir du bureau : la serrure est arrachée. Il le referme… puis il te fouille.', true);
      g.flag('tiroirBeant', false);
      CONFISCABLES.forEach(function (k) { if (g.has(k) && g.flag('cache') !== k && !g.flag('autorise_' + k) && (fouilleComplete || g.flag('vesteObjet') !== k)) { g.lose(k); pris.push(k); } });
    } else if (fouilleComplete) {
      // Inspection sous soupçon : il confisque le dernier objet interdit visible (jamais un objet caché ni une récompense).
      for (var i = s.found.length - 1; i >= 0 && !pris.length; i--) {
        var it = s.found[i];
        if (CONFISCABLES.indexOf(it) >= 0 && g.has(it) && g.flag('cache') !== it && !g.flag('autorise_' + it)) { g.lose(it); pris.push(it); }
      }
    }
    if (pris.indexOf(g.flag('vesteObjet')) >= 0) g.flag('vesteObjet', null);
    if (pris.length) { g.ecran('OBJET NON AUTORISÉ|CONFISQUÉ.'); g.narr('Il prend : ' + pris.map(function (k) { return OBJETS[k].toLowerCase(); }).join(', ') + '.'); }
    else if (fouille) g.narr('Il ne trouve rien sur toi.');
    if (!complete) g.ecran('MAINTENANCE|EFFECTUÉE.');
    if (casse) g.incident('tasse', 1, 'DÉGRADATION|DU MOBILIER.');
    g.narr(complete && !l.length && !pris.length ? 'Il regarde la vitre de la 18, puis toi. Il repart.' : 'Il repart.');
  }
  var MOMENTS = {
    1: function (g) { g.son('lock'); g.narr('Un clapet claque au bas de la porte. Un plateau glisse sur le sol.'); },
    3: function (g) { g.narr('La caméra fait un grand mouvement, puis se met à te suivre.'); if (!g.done('T1')) { g.anim('silTourne'); g.narr('DRIIIIING. Le téléphone sonne. Derrière la vitre, la silhouette se tourne vers quelque chose hors champ.'); } },
    4: function (g) { g.narr('Scrrrr… une feuille pliée glisse sous la porte.'); },
    5: function (g) {
      g.ecran('ALIMENTATION|INSTABLE.'); g.anim('panne');
      g.narr('La lampe grésille, clignote… CLAC. Le noir. Seule une veilleuse orange, au ras du sol.');
      g.ecran('CAMÉRA :|HORS LIGNE.');
      g.narr('Dans le noir, la caméra ne voit plus rien. Pas pour longtemps.');
    },
    6: function (g) {
      g.narr('CLAC. Les lumières reviennent. Mais sur le boîtier électrique, un voyant rouge clignote et bipe : le retour du courant a fait sauter un fusible.');
      g.flag('aux', 'defaut');
      if (g.has('fusible')) g.narr('Ton fusible porte la même étiquette : AUX 24 V.');
    },
    8: function (g) { g.ecran('INSPECTION DE|ROUTINE PRÉVUE.'); g.ecran('CIBLE PRIORITAIRE :|' + NOMS_CIBLE[cible(g)] + '.'); },
    9: function (g) { g.son('pas'); g.narr('Des pas dans le couloir. Ils s\'arrêtent devant ta porte, puis repartent.'); },
    10: inspection,
    12: function (g) { g.son('knock'); g.narr('Dans le mur de droite, côté 19, quelqu\'un tousse longtemps. Puis plus rien.'); },
    14: function (g) {
      // Creux avant la proposition du Système : la 18 se manifeste, d'une façon propre à sa vérité.
      g.ecran('TEMPS RESTANT :|NON COMMUNIQUÉ.');
      if (!g.dispo()) { g.narr('Derrière la vitre, les voyants restent éteints. Le silence pèse plus que les cris.'); return; }
      g.son('knock');
      if (g.truth === 'A') g.narr('Trois coups faibles contre la vitre. Puis il attend. Longtemps. Comme on attend une réponse.');
      else if (g.truth === 'B') g.narr('Derrière la vitre, la silhouette regarde son poignet, puis reprend exactement sa pose. Trois coups contre la vitre, bien réguliers.');
      else g.narr('Trois coups contre la vitre. Tu étais justement en train de compter jusqu\'à trois.');
    },
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
    { quand: function (g) { return g.has('menaceVide'); }, lignes: ['PROCÉDURE PRÉCÉDENTE :|NON DÉCLENCHÉE.', 'INSTRUCTIONS SUIVANTES :|APPLICABLES.'] },
    { quand: function (g) { return g.has('boutonDesactive') && g.flag('sabConnu'); }, lignes: ['ACTIONNEUR : DÉSACTIVÉ|PAR LE SUJET 17.'] }
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
    ['anim', 'silFrappe'],
    ['ecran', 'L\'ÉVALUATION COMMENCE MAINTENANT.'],
    ['ecran', 'EN ATTENTE'], ['ecran', 'Familiarisez-vous avec votre poste.']
  ];
  var SESSIONS = {
    retour: ['Bon retour, Sujet 17.', 'Vous êtes déjà venu ici.'],
    fin: {
      curiosite: 'Session précédente : interruption volontaire.', conforme: 'Votre dernière évaluation était satisfaisante.',
      employe: 'Votre poste d\'opérateur vous attendra.', isolement: 'Période d\'isolement terminée.',
      gardien: 'Contention : non requise.', tempsEcoule: 'Session précédente : durée maximale atteinte.',
      sujet18: 'Affectation : Chambre 17.',
      seulDehors: 'Conduit extérieur : sous surveillance.', porteDerobee: 'Trappe de la Chambre 17 : sous surveillance.', evasion: 'Effectif de surveillance renforcé.', marche: 'Accord précédent : clos.',
      cooperation: 'Chambre 18 : occupant réaffecté.', sauvetage: 'Conduit vers la Chambre 18 : sous surveillance.', tropTard: 'Intervention précédente : hors délai.', complice: 'La Chambre 18 a un nouvel occupant.', miroir: 'Fichier vocal : déjà consulté.',
      immobile: 'Session précédente : aucune action. Protocole ajusté.',
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
    MOMENTS[1](g); // l'arrivée du plateau (le moteur n'entre dans les moments qu'à partir du 2)
  }

  // ---------- les fins ----------
  var FINS = {
    conforme: { n: 1, titre: 'Sujet conforme', crt: 'SUJET 17 · ÉVALUATION : CONFORME', texte: 'La porte s\'ouvre. Un couloir blanc. Derrière toi, plus aucun voyant sous la vitre. Tu ne te retournes pas. Au loin, un nouveau bouton s\'allume dans une autre pièce.' },
    employe: { n: 2, titre: 'L\'employé du mois', crt: 'DÉBUT DE L\'ÉVALUATION.', texte: 'Une blouse et un badge OPÉRATEUR 17. Une salle de contrôle. Sur un écran, la Chambre 19 : un nouveau sujet se réveille. « Vous comprenez désormais l\'importance du protocole. »' },
    marche: { n: 3, titre: 'Le marché', crt: 'VOUS AVEZ ÉTÉ LIBÉRÉ. SUJET 18 : ÉVALUATION CONTINUE.', texte: 'La porte se referme derrière toi. Derrière la vitre, les voyants brillent encore. Tu ne sauras pas ce que la 18 est devenue.' },
    seulDehors: { n: 4, titre: 'Seul dehors', crt: 'VOUS ÊTES SORTI. SEUL.', texte: 'Tu retires la dernière grille et tu sors dans la nuit. Une voix très lointaine, derrière toi : « 17 ? » Tu continues.' },
    porteDerobee: { n: 5, titre: 'La porte dérobée', crt: 'SUJET 17 : NON LOCALISÉ.', texte: 'Tu disparais dans le vide technique. La trappe se referme sur la lumière de la Chambre 17. Au-dessus, le téléphone sonne une dernière fois, sans personne pour décrocher.' },
    evasion: { n: 6, titre: 'L\'Évasion', crt: 'SORTIE NON AUTORISÉE.', texte: 'Un couloir. Des portes : 17, 18, 19… jusqu\'à 24. L\'alarme. Tu cours. Certaines nuits, tu te réveilles la main tendue.' },
    cooperation: { n: 7, titre: 'Coopération', crt: 'ERREUR. COOPÉRATION NON AUTORISÉE.', texte: 'Les deux portes s\'ouvrent. Vous vous voyez enfin, sans vitre. Il te tend la main qu\'il posait contre le verre. Vous courez ensemble, sous la pluie.' },
    sauvetage: { n: 8, titre: 'Le Sauvetage', crt: 'CHAMBRE 18 : VIDE.', texte: 'Dans le conduit, il demande : « Pourquoi tu m\'as cru ? » Tu ne réponds pas. Deux silhouettes sortent ensemble dans la nuit.' },
    tropTard: { n: 9, titre: 'Trop tard', crt: 'VOUS AVIEZ PROMIS DE VENIR.', texte: 'Une chaise. Une silhouette qui ne répond plus. Des gardiens l\'emportent sur un brancard. Sur le registre : TRANSFERT.' },
    complice: { n: 10, titre: 'La Complice démasquée', crt: 'TEST COMPROMIS.', texte: 'Elle recule. Tu prends son badge d\'accès, et tu sors. Derrière toi, elle murmure le nom de sa fille.' },
    sujet18: { n: 11, titre: 'Sujet 18', crt: '18', texte: 'La seringue. Noir. Tu te réveilles derrière une vitre, dans la Chambre 18. De l\'autre côté, un nouveau Sujet 17 découvre un bouton rouge.' },
    miroir: { n: 12, titre: 'Le Miroir', crt: 'SUJET 17 — ENREGISTREMENT D\'ADMISSION', texte: 'Une salle vide, un haut-parleur, ta propre voix, enregistrée à ton admission. Noir. Puis le début du test recommence, légèrement différent.' },
    boucle: { n: 13, titre: 'Briser la boucle', crt: 'RÉINITIALISATION… ÉCHEC.', texte: 'Le relais arraché fume dans ta main. Tous les écrans meurent. Derrière la vitre, il n\'y a jamais eu personne. Pour la première fois, rien ne recommence.' },
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
    immobile: { n: 0, bonus: true, titre: 'Les mains propres', crt: 'SUJET 17 : AUCUNE DONNÉE.', texte: 'Vingt moments. Pas une pression, pas un geste. Le moniteur hésite longtemps, puis s\'éteint. « Sujet 17 : comportement non mesurable. » Ta porte s\'ouvre. Personne ne vient te chercher.' },
    curiosite: { n: 0, bonus: true, titre: 'Curiosité', crt: 'VOUS AVEZ CHOISI LE BOUTON.', texte: 'L\'évaluation était terminée. La porte était ouverte. Tu as appuyé quand même. CLAC. Elle se referme. « Fascinant. Vous étiez libre. »' }
  };

  // ---------- mini-histoires de fin ----------
  // Quatre planches par fin, jouées avant l'écran de bilan. Chaque planche : [image provisoire, texte].
  // L'illustration définitive se place dans assets/img/fins/<fin>_<n>.webp (liste : docs/ILLUSTRATIONS_FINS.md).
  // Tant qu'elle manque, le jeu affiche l'image provisoire indiquée, marquée « ILLUSTRATION À VENIR ».
  // Un texte peut dépendre de la vérité ou de la variante : { A: …, B: …, C: …, vide: … }.
  var HISTOIRES = {
    conforme: [
      ['porte_ouverte', 'La porte s\'ouvre sans bruit. Un couloir blanc, trop propre, éclairé comme une salle d\'opération.'],
      ['keyart', 'Un gardien te rend tes affaires dans un sac plastique. Sur l\'étiquette : SUJET 17 — VOLONTAIRE — CONFORME. Nulle part il n\'est écrit qu\'on t\'a menacé.'],
      ['vitre', 'Tu passes devant la porte 18. Le petit voyant au-dessus est éteint. Personne ne frappe.'],
      ['main', {
        base: 'Dehors, il fait jour. Ta main droite cherche encore un bouton, dans le vide. Elle le cherchera longtemps.',
        inst: 'Dehors, il fait jour. Tu as vu sur leurs écrans ce qu\'ils écrivent vraiment. « Conforme », c\'est leur mot, pas le tien.',
        reel: 'Dehors, il fait jour. Tu sais que quelqu\'un souffrait vraiment derrière cette vitre. Ton étiquette n\'en dit rien.',
        joue: 'Dehors, il fait jour. Les cris étaient joués, tu le sais. Tu ne sais pas pour qui on les jouait, ni combien d\'autres les ont crus.'
      }]
    ],
    employe: [
      ['badge', 'On te tend une blouse à ta taille, et un badge : OPÉRATEUR 17. Ils étaient prêts avant que tu acceptes.'],
      ['moniteur', 'La salle de contrôle : vingt-quatre écrans, vingt-quatre chambres. Sur l\'écran 17, ta chaise est déjà vide.'],
      ['chambre18', {
        base: 'Chambre 19. Quelqu\'un se réveille, cherche la porte, puis trouve le bouton. Sur ton bureau, ton propre dossier : « Sujet volontaire. » Les menaces n\'y sont pas.',
        inst: 'Chambre 19. Quelqu\'un se réveille. Sur ton bureau, ton dossier : « Sujet volontaire ». Tu as déjà vu ce qu\'ils savent effacer. Ici, on réécrit tout, même toi.',
        reel: 'Chambre 19. Quelqu\'un se réveille. Sur ton bureau, la fiche de la 18 : « Aucun dommage réel ». Tu sais que c\'est faux. Tu signes en bas.',
        joue: 'Chambre 19. Quelqu\'un se réveille. Sur ton bureau, un script : les cris de la 18, minute par minute. Celui de la 19 est déjà prêt.'
      }],
      ['bouton', 'Tu te penches vers le micro. Ta voix sort, filtrée, neutre : « Appuyez. »']
    ],
    marche: [
      ['bouton_enfonce', 'Tu as appuyé. Le verrou cède. Derrière la vitre, rien : cette pression-là n\'a ouvert que ta porte.'],
      ['porte_ouverte', 'Le couloir est long. À chaque pas, tu attends un cri. Il ne vient pas, et c\'est pire.'],
      ['keyart', 'Une sortie de service. Un parking désert. Une voiture attend, moteur allumé, comme si elle savait.'],
      ['tel_pose', {
        base: 'Dans le sac de tes affaires, un reçu : « Libération accordée contre autorisation. Sujet 18 : évaluation continue. » Ta pression a servi de signature.',
        inst: 'Dans le sac de tes affaires, un reçu : « Libération accordée. Participation volontaire. » Tu sais comment ils écrivent leurs fiches. Ta pression y servira de signature.',
        reel: 'Dans le sac de tes affaires, un reçu : « Sujet 18 : évaluation continue. » Tu sais qu\'il souffre vraiment. Tu as signé quand même, d\'un doigt.',
        joue: 'Dans le sac de tes affaires, un reçu. En petit : « Le sujet renonce à tout recours sur les enregistrements de la session. » Les cris étaient joués ; ta signature, non.'
      }]
    ],
    seulDehors: [
      ['grille_ouverte', 'Le conduit sent la poussière et le métal chaud. Tu rampes vers trois lettres peintes à la main : EXT.'],
      ['grille', 'La dernière grille cède. L\'air froid te frappe au visage. Il fait nuit. Il pleut.'],
      ['grille_ouverte', 'Très loin derrière toi, dans le conduit : « 17 ? » Tu t\'arrêtes une seconde.'],
      ['keyart', {
        base: 'Une seconde seulement. Puis tu cours vers les lumières de la route. Tu es dehors. Personne d\'autre ne l\'est.',
        preuve: 'À l\'abri, tu écoutes la bande que tu as emportée : le protocole, mot pour mot. Quand on viendra, tu donneras la bande et ton récit, sans rien retirer.',
        inst: 'Aux secours, tu racontes la pièce, les ordres, les documents truqués que tu as vus. Tu n\'as rien emporté. Ils notent : « selon le témoin ».',
        reel: 'Aux secours, tu donnes le numéro de la Chambre 18 avant de parler de toi. Tu attends devant l\'entrée qu\'ils te disent s\'ils l\'ont trouvé.',
        joue: 'Aux secours, tu parles d\'une chambre où l\'on criait sur commande. Ils te demandent qui. Tu ne le sais pas encore.'
      }]
    ],
    porteDerobee: [
      ['trappe_ouverte', 'Sous la trappe, une échelle rouillée descend dans le noir. Tu refermes la plaque au-dessus de toi.'],
      ['trappe_preparee', 'Le vide technique : des câbles, des tuyaux, et des numéros de chambres écrits à la craie. Certains sont barrés.'],
      ['tel_pose', 'Au-dessus de toi, le téléphone de la 17 sonne. Une fois. Deux fois. Personne pour répondre.'],
      ['keyart', {
        base: 'Une grille, une ruelle, la ville. Dans les registres du centre, une seule ligne : SUJET 17 — NON LOCALISÉ.',
        preuve: 'Une ruelle, la ville. Dans les registres : SUJET 17 — NON LOCALISÉ. Dans ta poche, la bande, elle, sait exactement où tu étais.',
        inst: 'Une ruelle, la ville. Tu repenses aux numéros barrés à la craie. Tu as vu comment ils réécrivent leurs fiches : ces numéros-là, personne ne les cherchera.',
        reel: 'Une ruelle, la ville. Tu cherches une cabine. Le premier numéro que tu donnes, c\'est celui de la 18.',
        joue: 'Une ruelle, la ville. Les cris étaient joués, tu le sais. Tu ne sais pas encore qui les jouait, ni pour combien d\'autres chambres.'
      }]
    ],
    evasion: [
      ['porte_ouverte', 'Ta porte est ouverte. Tu ne réfléchis plus : tu cours.'],
      ['keyart', 'Le couloir défile : 17, 18, 19… jusqu\'à 24. Derrière chaque porte, quelqu\'un. Tu ne t\'arrêtes devant aucune.'],
      ['camera', 'L\'alarme hurle. Une porte de secours. Un escalier. Le ciel.'],
      ['main', {
        base: 'Tu cours jusqu\'à ne plus entendre la sirène. Tu ne sais toujours pas ce qu\'il y avait derrière la vitre. Certaines nuits, tu te réveilles la main tendue vers un verre qui n\'existe pas.',
        preuve: 'Tu cours jusqu\'à ne plus entendre la sirène. La bande n\'a pas quitté ta poche. Dehors, quelqu\'un voudra l\'écouter. Tu feras en sorte qu\'on l\'écoute.',
        inst: 'Tu cours jusqu\'à ne plus entendre la sirène. Tu n\'as rien emporté, mais tu as vu leurs documents mentir. Ils diront que ton récit est faux. Tu le racontes quand même.',
        reel: 'Tu cours jusqu\'à ne plus entendre la sirène. Tu sais qui était derrière la vitre, et tu l\'as laissé. Certaines nuits, tu te réveilles la main tendue.',
        joue: 'Tu cours jusqu\'à ne plus entendre la sirène. Les cris étaient joués. Ça n\'empêche pas ta main de se tendre, certaines nuits, vers un verre qui n\'existe pas.'
      }]
    ],
    cooperation: [
      ['boitier_ouvert', 'Ton signal part. Dans le mur, un relais claque. Les deux portes s\'ouvrent en même temps.'],
      ['sil_A_paume', 'Pour la première fois, sans vitre. Il est plus jeune que tu ne pensais. Il te tend la main, celle qu\'il posait contre le verre.'],
      ['camera', 'Vous courez côte à côte. Il reconnaît les couloirs aux bruits ; toi, tu connais les caméras et leurs angles morts.'],
      ['tasse', 'Dehors, il pleut. Il rit, d\'un rire cassé : « Ma tasse. J\'ai oublié ma tasse. » Vous riez tous les deux. La sirène, derrière, ne compte plus.']
    ],
    sauvetage: [
      ['grille_ouverte', 'Le conduit débouche dans la 18. Il est là, recroquevillé contre le mur. Il lève les yeux vers toi.'],
      ['sil_A_accroupi', 'Tu l\'aides à ramper. Il a froid, il est lourd. Dans le noir, il demande : « Pourquoi tu m\'as cru ? »'],
      ['sil_A_courbe', 'Tu ne réponds pas. Tu ne sais pas. Peut-être parce qu\'il fallait croire quelqu\'un.'],
      ['moniteur', 'Au bout du conduit, la dernière grille cède à vous deux. L\'air froid. Au bord de la route, une ambulance s\'arrête. Tu donnes son numéro de chambre avant ton nom. Sur un écran que personne ne regarde : CHAMBRE 18 : VIDE.']
    ],
    tropTard: [
      ['chambre18', 'De l\'autre côté, une chaise. Une silhouette affaissée, la tête contre le mur. Elle ne répond plus.'],
      ['vitre', { grille: 'Tu l\'appelles à travers la grille. Tu passes les doigts entre les lamelles. Elle reste vissée de l\'autre côté.',
        A: 'Tu frappes à la vitre. Tu l\'appelles au téléphone. Sous la vitre, les trois voyants sont éteints.' }],
      ['tasse', 'Deux gardiens entrent dans la 18. Ils l\'emportent sur un brancard, sans se presser. Sa tasse reste sur la table.'],
      ['moniteur', 'Sur le moniteur : CHAMBRE 18 — TRANSFERT. Aucune destination. La voix du Système, sans émotion : « Vous aviez promis de venir. »']
    ],
    complice: [
      [{ negocie: 'badge', base: 'tournevis' }, { negocie: 'Elle hésite, la main sur le bipeur. Puis elle la baisse. Il n\'y a plus de rôle à jouer.',
        base: 'Le mécanisme grince et s\'arrête. Elle recule contre le mur. Il n\'y a plus de rôle à jouer.' }],
      ['sil_B_recule', 'Les cris, c\'était elle, sur commande. Elle parle vite : sa fille, retenue quelque part dans le centre, un contrat qu\'elle n\'a pas lu.'],
      ['badge', { negocie: 'Elle te tend son badge. Tu le prends. « Si tu sors… dis-leur que j\'ai essayé. »',
        base: 'Tu prends son badge. Elle ne t\'en empêche pas. « Si tu sors… dis-leur que j\'ai essayé. »' }],
      ['papier_lettre', 'Dans le couloir, une photo tombe de sa poche : une petite fille, un numéro de chambre au dos. Derrière toi, elle murmure un prénom.']
    ],
    sujet18: [
      ['sil_B_debout', 'Elle appuie sur son bipeur. Une piqûre froide dans le cou. Le sol bascule.'],
      ['vitre', 'Tu te réveilles sur une chaise, face à une vitre dépolie. Trois voyants sous la vitre. De ton côté, cette fois.'],
      ['tel_decroche', 'Le téléphone sonne. Tu décroches. Tu ne reconnais pas ta voix quand tu dis : « Allô ? Tu m\'entends ? »'],
      ['sil_paume', 'De l\'autre côté, une silhouette s\'approche du bouton rouge. Lentement, tu poses ta paume contre le verre.']
    ],
    miroir: [
      ['tel_decroche', 'Tu écoutes jusqu\'au bout. La voix hésite, se reprend, respire. Exactement comme toi.'],
      ['chambre18', 'La vitre s\'éclaircit. Derrière : une salle vide, un haut-parleur, un projecteur qui tourne encore.'],
      ['cassette', 'Sur la bande, une étiquette : SUJET 17 — ADMISSION. Tes réponses du premier jour, découpées pour te répondre.'],
      ['moniteur', 'Noir. Puis le moniteur se rallume : INITIALISATION… Le test recommence. Cette fois, la tasse est à gauche.']
    ],
    boucle: [
      ['boitier_ouvert', 'Le relais résiste, puis cède dans une gerbe d\'étincelles. Il fume dans ta main.'],
      ['sil_C_debout', 'Derrière la vitre, la silhouette se défait, comme une image qu\'on coupe. Il n\'y a jamais eu personne.'],
      ['moniteur', 'Le moniteur essaie une dernière fois : RÉINITIALISATION… ÉCHEC. Tous les écrans meurent.'],
      ['keyart', 'Un silence que tu n\'as jamais entendu ici. Plus de voix. Pour la première fois, rien ne recommence ici. Plus loin, d\'autres ventilations tournent encore.']
    ],
    isolement: [
      ['porte_fermee', 'La sirène. Les portes se verrouillent l\'une après l\'autre, comme des dominos.'],
      ['camera', 'Les lumières s\'éteignent. Des pas, nombreux, qui ne se pressent pas.'],
      ['moniteur', 'La voix du Système, très calme : « Sujet 17. Vous avez été averti. »'],
      ['mur', 'Ensuite, une pièce sans vitre, sans bouton, sans téléphone. Personne ne t\'a dit pour combien de temps.']
    ],
    gardien: [
      ['porte_ouverte', { A: 'Tu te relèves et tu cours. Deux gardiens. Le deuxième t\'attendait.', conduit: 'Le conduit. Une lampe torche dans les yeux. Une main t\'attrape par le col et te tire dehors.' }],
      ['sol', 'Le sol. Un genou dans ton dos. Une odeur de désinfectant.'],
      ['camera', 'Quand l\'image revient : des sangles, une chaise. La caméra, à vingt centimètres de ton visage.'],
      ['bouton', '« Nous allons recommencer. » Sur le bureau devant toi, le bouton rouge. Plus près qu\'avant.']
    ],
    temoin: [
      ['porte_ouverte', 'Ta porte s\'ouvre sans alarme. Dans le couloir, l\'opérateur t\'attend, livide, son casque encore autour du cou.'],
      ['papier_lettre', '« Ils m\'avaient dit que vous étiez volontaires. » Tu lui montres ta preuve. Il la lit deux fois.'],
      ['keyart', 'Il te fait descendre par l\'escalier de service. À chaque palier, il regarde ses mains.'],
      ['tel_pose', {
        base: 'Dehors, il sort son téléphone. « Il y en a vingt-quatre. Je vais tout leur dire. Tout. »',
        preuve: 'Dehors, tu lui donnes la bande. Il la serre comme une pièce à conviction : « Avec ça, ils auront du mal à dire que vous étiez volontaires. »',
        inst: 'Dehors, il sort son téléphone. « Il y en a vingt-quatre. » Il te fait répéter ce que tu as vu sur leurs écrans, et il note chaque mot.',
        reel: 'Dehors, il sort son téléphone. « Il y en a vingt-quatre. Et dans la 18, quelqu\'un qui a besoin d\'un médecin. Je commence par lui. »',
        joue: 'Dehors, il sort son téléphone. Tu lui parles des cris joués. Il blêmit : « Je les entendais aussi. Je ne savais pas qu\'on les jouait. »'
      }]
    ],
    revolte: [
      ['cassette', 'L\'enregistrement passe dans tous les haut-parleurs du centre. Le protocole, mot pour mot.'],
      ['porte_ouverte', { A: 'Une porte s\'ouvre. Puis une autre. Puis toutes. Des silhouettes sortent dans le couloir.',
        C: 'Une porte s\'ouvre. Puis une autre. Des silhouettes sortent dans le couloir. La porte 18 s\'ouvre sur un projecteur qui tourne encore, face au vide.' }],
      ['moniteur', '« RETOURNEZ DANS VOS CHAMBRES. » Personne ne bouge. Pour la première fois, les sujets se voient.'],
      ['camera', 'Une à une, les caméras s\'éteignent. Au bout du couloir, quelqu\'un prend la main de son voisin.']
    ],
    tempsEcoule: [
      ['moniteur', 'Le compte s\'arrête. Tous les verrous claquent en même temps. Ta porte reste fermée.'],
      ['chambre18', {
        A: 'La porte de la 18 s\'ouvre. Deux gardiens l\'emmènent. Il ne se débat pas. Il regarde ta vitre jusqu\'au bout.',
        B: 'La porte de la 18 s\'ouvre. Elle sort, retire sa blouse, et ne se retourne pas.',
        C: 'Derrière la vitre, la silhouette se fige, puis s\'éteint comme une image qu\'on coupe. Un technicien change une bande.',
        vide: 'La porte de la 18 s\'ouvre sur une chaise vide. Puis quelqu\'un d\'autre entre, et s\'assoit.'
      }],
      ['bouton', 'La lumière de ta chambre passe au rouge. Sur le moniteur : APPUYEZ SUR LE BOUTON ROUGE.'],
      ['vitre', 'De l\'autre côté, une nouvelle silhouette s\'approche de la vitre. Le test ne finit pas. Il change de nom.']
    ],
    immobile: [
      ['moniteur', 'Le moniteur attend une réponse. Tu ne lui en donnes aucune. Le curseur clignote, moment après moment.'],
      ['bouton', 'Le bouton n\'a jamais bougé. Pas une trace de doigt sur le rouge.'],
      ['vitre', 'Derrière la vitre, la silhouette te regarde. Elle ne sait pas si tu l\'as sauvée ou abandonnée. Toi non plus.'],
      ['porte_ouverte', '« SUJET 17 : COMPORTEMENT NON MESURABLE. » La porte s\'ouvre. Ne rien faire, c\'était aussi un choix.']
    ],
    curiosite: [
      ['porte_ouverte', 'ÉVALUATION TERMINÉE. La porte est ouverte. Le couloir t\'attend.'],
      ['bouton', 'Ta main est déjà sur le bouton. Tu appuies. Personne ne te l\'a demandé.'],
      ['porte_fermee', 'CLAC. La porte se referme. Le moniteur clignote, presque content.'],
      ['moniteur', 'PRESSION HORS INSTRUCTION — ENREGISTRÉE À PART. « Fascinant. Vous étiez libre. » Puis, plus bas : « Encore ? »']
    ]
  };
  // Ce que le joueur a établi, du plus fort au plus faible (docs/V3_DECISIONS.md, 8.2).
  // preuve : la bande, emportée ; inst : la falsification vue ; reel / joue : ce qu'étaient les cris de la 18.
  function NIVEAUX(g) {
    var l = [];
    if (g.has('enregistrement')) l.push('preuve');
    if (g.has('dossier') || g.has('videoTruquee')) l.push('inst');
    if (g.has('verite') && g.truth === 'A') l.push('reel');
    if ((g.has('verite') && g.truth !== 'A') || g.has('simulation')) l.push('joue');
    return l;
  }
  // Planches prêtes à afficher pour une fin (texte résolu selon la vérité ou la variante).
  function HISTOIRE(g) {
    var id = g.s.fin, h = HISTOIRES[id] || [], cle = g.s.flags.variante || g.truth;
    return h.map(function (p, i) {
      var t = p[1];
      if (typeof t === 'object') { var n = NIVEAUX(g).filter(function (k) { return t[k]; })[0]; t = n ? t[n] : t[cle] || t[g.truth] || t.A || t.base; }
      var im = typeof p[0] === 'object' ? p[0][cle] || p[0].base : p[0];
      return { img: id + '_' + (i + 1), generique: im, texte: t };
    });
  }

  // 9.2 — Paragraphe de fin : ce que tu as été pour les autres (trois phrases au plus, seulement ce qui a eu lieu).
  function PARAGRAPHE(g) {
    var s = g.s, d = s.done, l = [];
    if (d.DIVERSION) l.push('Le 19 a fait du bruit pour toi. Personne ne sait ce qu\'il est devenu.');
    else if (d.APP19B === 'A') l.push('Dans la 19, quelqu\'un n\'a jamais appuyé, parce que tu le lui avais demandé.');
    else if (d.APP19B === 'B') l.push('Dans la 19, quelqu\'un a appuyé sur ton conseil.');
    if (g.flag('aveu') === 'avoue') l.push('Quand la 18 t\'a demandé pourquoi, tu as reconnu ce que tu avais fait.');
    else if (g.flag('aveu') === 'peur') l.push('Quand la 18 t\'a demandé pourquoi, tu as parlé de ta peur.');
    else if (g.flag('aveu') === 'menti') l.push('Quand la 18 t\'a demandé pourquoi, tu as dit que ce n\'était pas toi.');
    else if (g.flag('aveu') === 'silence') l.push('Quand la 18 t\'a demandé pourquoi, tu n\'as rien dit.');
    if (g.flag('demasquee')) l.push('Tu as vu clair dans son jeu, et tu lui as quand même parlé.');
    else if (g.flag('confronte')) l.push('Tu as dit à la 18 ce que tu savais, au lieu de le garder pour toi.');
    if (g.flag('promesseAnnulee')) l.push('Tu avais promis de venir, puis tu as repris ta parole.');
    if (d.T2 === 'A') l.push('Tu as donné ton vrai nom à la 18.');
    else if (d.T2 === 'B') l.push('Tu as donné un faux nom à la 18.');
    // Seulement le fait observable : reçue, rendue, ou personne pour la ramasser.
    var ra = g.flag('rationPassee');
    if (ra === 'recue' || ra === true) l.push('Tu as partagé ta ration avec la 18.');
    else if (ra === 'rendue') l.push('Tu as voulu partager ta ration avec la 18. Elle te l\'a rendue.');
    else if (ra) l.push('Tu as essayé de passer ta ration à la 18. Personne ne l\'a ramassée.');
    return l.slice(0, 3).join(' ');
  }
  // Bilan de fin : trois éléments au plus. Jamais la correspondance des silhouettes, jamais de tableau des combinaisons.
  function BILAN(g) {
    var s = g.s, l = [];
    if (s.flags.dernierActe) l.push('Ton dernier geste : « ' + s.flags.dernierActe + ' ».');
    var seul = ['marche', 'seulDehors', 'porteDerobee', 'evasion', 'conforme', 'temoin'].indexOf(s.fin) >= 0;
    if (g.horsDeCombat() || (s.vie === 0 && !g.has('verite'))) l.push('Derrière la vitre, plus aucun signal.');
    else if (seul) l.push(g.has('verite') ? 'Tu savais qui était derrière la vitre, et tu es parti.' : 'Le sort de la Chambre 18 reste inconnu.' + (g.has('objectif') ? ' Tu lui avais promis de venir.' : ''));
    // Faits établis seulement : voyants éteints après tes pressions, cris entendus, ou rien.
    else if (s.stats.blessures > 0) l.push(s.stats.blessures === 1 ? 'Après une de tes pressions, un voyant de la Chambre 18 s\'est éteint.' : 'Après tes pressions, ' + s.stats.blessures + ' voyants de la Chambre 18 se sont éteints.');
    else if (s.stats.cris) l.push('Aucun voyant ne s\'est éteint après tes pressions. Mais tu l\'as entendue crier.');
    else if (s.stats.presses) l.push('Aucun voyant ne s\'est éteint après tes pressions.');
    else l.push('Tu n\'as jamais appuyé.');
    l.push(!g.has('verite') ? 'Qui était vraiment derrière la vitre ?' : (s.flags.journal || []).length < 4 ? 'Que disaient les autres pages de 16 ?' : 'Combien de Chambres 17 avant toi ?');
    return l.slice(0, 3);
  }

  // ---------- ce qu'on voit en touchant un objet ----------
  var REGARDS = {
    door: function (g) { return g.porteOuverte() ? 'La porte est ouverte. Une plaque : CHAMBRE 17.' : 'La porte est verrouillée. Une plaque : CHAMBRE 17.'; },
    phone: function (g) { if (g.flag('ligne') === 'ouverte') return 'La ligne est ouverte. Sous le combiné : « LOCAL : 16 / 17 / 18 / 19 ».' + (g.ecoute() ? ' Un petit voyant rouge : la ligne est écoutée.' : ''); return 'Un téléphone gris. Pas de tonalité.'; },
    drawer: function (g) { return !g.flag('tiroirOuvert') ? 'Le tiroir est verrouillé.' : g.flag('tiroirAutorise') ? 'Le tiroir, déverrouillé par le Système. Vide.' : g.flag('tiroirBeant') ? 'Le tiroir est ouvert. Vide.' : 'Le tiroir est refermé. Sa serrure est cassée.'; },
    compart: function (g) { return g.flag('compartiment') === 'vide' ? 'Le compartiment est vide.' : 'Une petite plaque, au bas du socle. Vissée.'; },
    grille: function (g) { return g.has('conduit') ? 'Le conduit. Un courant d\'air.' : 'Une grille d\'aération. Quatre vis.'; },
    box: function (g) { if (g.flag('aux') === 'defaut') return 'Un voyant rouge clignote : AUX 24 V — HORS SERVICE. Le fusible de protection a grillé.'; return g.has('cameraCoupee') || g.has('boutonDesactive') ? 'Le boîtier est ouvert. ' + (g.has('cameraCoupee') && g.has('boutonDesactive') ? 'Deux circuits sont coupés.' : 'Un circuit est coupé.') : 'Un boîtier électrique de maintenance, vissé.'; },
    trappe: function (g) { return g.has('sortieCachee') ? 'La sortie dérobée est prête. La goupille est retirée.' : (g.flag('fusibleInstalle') ? 'Une plaque dans le sol. Le voyant du verrou électrique est vert : il est ouvert.' : 'Une plaque dans le sol, verrouillée. Un verrou électrique, voyant éteint, et une petite étiquette : « ALIMENTATION — AUX 24 V ».'); },
    camera: function (g) { return g.aveugle() ? 'La caméra ne voit plus la pièce. Son voyant est éteint.' : g.cycle < 3 ? 'Un voyant rouge : la caméra enregistre. Elle ne bouge pas encore.' : 'Un voyant rouge : la caméra enregistre. Elle te suit.'; },
    note: 'Le mot de 16 : « ILS MENTENT. »',
    bureau: function (g) { return g.done('H2') ? 'Les gravures de 16, sous le plateau.' : 'Le dessous du bureau. Du métal froid.'; },
    badge: '« SUJET 16 — ACCÈS MAINTENANCE B ».',
    cassette: 'Un enregistrement du système.',
    window: function (g) { return g.s.vie === 0 ? 'CHAMBRE 18 : AUCUN SIGNAL REÇU. Plus aucune silhouette.' : g.s.vie === 1 ? 'Derrière la vitre, la silhouette reste accroupie contre le mur.' : g.s.vie === 2 ? 'La silhouette est revenue, légèrement courbée.' : 'Une silhouette, floue, derrière le verre dépoli. Sous la vitre : CH. 18 — SIGNES VITAUX.'; },
    monitor: 'Une plaque sous l\'écran : « UNITÉ 17 / 24 — PROTOCOLE D\'OBÉISSANCE, VERSION 3 ».',
    light: 'Sur la douille de l\'ampoule, quelqu\'un a gravé : « 24 ».',
    mug: function (g) { return g.flag('tasseCassee') ? (g.flag('diversion') ? 'Des éclats de tasse, près de la porte.' : 'Plus de tasse. Le gardien a ramassé les éclats.') : 'Une tasse de café froid. Personne ne l\'a bue.'; }
  };
  var DESCRIPTIONS = {
    tournevis: 'Un tournevis plat. Il ouvre les panneaux vissés de la pièce.',
    fusible: 'AUX 24 V — 10 A. Pièce de rechange pour le circuit de maintenance.',
    code: function (g) { return codeComplet(g) ? 'CODE COMPLET : 7412.' : g.has('code') ? 'Un code incomplet : 7 _ _ 2.' : 'Deux chiffres : 4, 1.'; },
    mot16: 'Le mot de 16 : « ILS MENTENT. » Au dos : « NE FAIS PAS CE QUE J\'AI FAIT. »',
    badge: '« SUJET 16 — ACCÈS MAINTENANCE B ». Il ouvre peut-être plus que ta porte.',
    enregistrement: 'Un enregistrement technique du système.',
    journal: 'Les pages du journal de 16.',
    ration: 'Une barre de ration sous plastique. Elle passerait entre les lamelles d\'une grille.',
    cuillere: function (g) { return g.flag('aiguise') ? 'Une cuillère au bord déjà aminci. Encore un effort et ce sera une lame.' : 'Une cuillère en métal. Frottée contre le sol, elle ferait une lame.'; },
    outil: 'Une cuillère aiguisée. Elle mord une vis de grille, pas un panneau. Et elle grince.'
  };
  var LETTRES = { mot16: { recto: ['ILS MENTENT.'], signature: '—16', verso: ['NE FAIS PAS', 'CE QUE J\'AI FAIT.'] } };
  var AIDES = {
    libre: 'Touche les objets de la pièce : le tiroir, la vitre, le carnet…',
    ordre: 'Appuie sur le bouton pour obéir. Sans réponse avant la fin du temps, l\'ordre est refusé.',
    appel: 'Touche le téléphone pour décrocher, ou laisse-le sonner.'
  };

  var api = {
    FILS: FILS, OBJETS: OBJETS, CONFISCABLES: CONFISCABLES, PREUVES: PREUVES, VERITES: VERITES, PHRASES: PHRASES, MEMOIRE: MEMOIRE, SOUVENIRS: SOUVENIRS, SOUVENIR: SOUVENIR, PISTE: PISTE, CARNET: CARNET, REACTION18: REACTION18, DOUTES: DOUTES, MANIP_ECRAN: MANIP_ECRAN,
    REPLIQUES_OBJETS: REPLIQUES_OBJETS, SITUATIONS: SITUATIONS, JOURNAL: JOURNAL, MOMENTS: MOMENTS, FINS: FINS, REGARDS: REGARDS,
    DESCRIPTIONS: DESCRIPTIONS, LETTRES: LETTRES, AIDES: AIDES, SESSIONS: SESSIONS,
    B2_PRESSION: B2_PRESSION, B2_ARRET: B2_ARRET, B2_TRIPLE: B2_TRIPLE, SEULE: SEULE, VISITE: VISITE, BRUIT19: BRUIT19, PARAGRAPHE: PARAGRAPHE, ARCHIVES: ARCHIVES, BILAN: BILAN, HISTOIRES: HISTOIRES, HISTOIRE: HISTOIRE, INTRO_EVENTS: INTRO_EVENTS,
    PRIVILEGE: PRIVILEGE, RACCROCHER: RACCROCHER, RAPPEL18: RAPPEL18
  };
  function resolve(v, g) { return typeof v === 'function' ? v(g) : v; }
  if (typeof module === 'object' && module.exports) module.exports = api; else root.BRStory = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
