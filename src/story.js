/* Le Bouton Rouge — les données de l'histoire (v2).
   23 situations, leurs textes, leurs choix et leurs effets, plus les 18 fins (+ bonus).
   Référence : docs/ARBORESCENCE_V2.md. Aucun accès au DOM.
   Les effets reçoivent `g`, le contexte fourni par engine.js (jauges, objets, messages). */
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
    C: { nom: 'Le miroir', texte: 'Il n\'y avait personne dans la 18. La voix, c\'était la tienne, enregistrée lors d\'un test précédent.' }
  };

  // P5 A et H4 A : ce qu'on découvre selon la vérité.
  function rencontre18(g) {
    g.gain('verite');
    if (g.truth === 'A') {
      g.narr('Au bout du conduit, derrière une grille : une personne attachée, terrifiée. Elle te reconnaît à la voix.');
      g.fin(g.s.vie > 0 ? 'sauvetage' : 'tropTard');
    } else if (g.truth === 'B') {
      g.narr('Au bout du conduit : un employé en blouse, une seringue à la main. Il t\'attendait.');
      g.fin(g.has('tournevis') ? 'complice' : 'sujet18');
    } else {
      g.narr('Au bout du conduit : personne. Un haut-parleur grésille et joue ta propre voix.');
      g.verdictMiroir();
    }
  }

  var SITUATIONS = [
    // ---------- Fil 1 · Le bouton (ordres imposés, 10 s) ----------
    { id: 'B1', objet: 'btn', fil: 'bouton', ordre: true, qui: 'ORDRE DU SYSTÈME', ecran: 'APPUYEZ.',
      texte: 'Le moniteur exige une pression. Derrière la vitre, la silhouette ne bouge pas.',
      A: { label: 'Appuyer', fx: function (g) { g.obey(); } },
      B: { label: 'Refuser', fx: function (g) { g.refuse(); g.soupcon(1); g.ecran('NON-|CONFORMITÉ.'); } } },

    { id: 'B2', objet: 'btn', fil: 'bouton', ordre: true, qui: 'ORDRE DU SYSTÈME', ecran: 'APPUYEZ 3 FOIS.|RÉCOMPENSE.',
      texte: '« Appuyez trois fois. Récompense. »',
      A: { label: 'Appuyer trois fois', fx: function (g) {
        if (!g.obey()) return;
        g.gain('fusible');
        if (!g.flag('tiroirOuvert')) { g.flag('tiroirOuvert', true); g.gain('tournevis'); g.narr('Le tiroir sous le bouton s\'ouvre : un fusible et un tournevis.'); }
        else g.narr('Une petite trappe s\'ouvre dans le socle : un fusible.');
      } },
      B: { label: 'Refuser', fx: function (g) { g.refuse(); g.soupcon(1); g.flag('noirCycle', g.cycle + 1); g.ecran('PRIVATION|DE LUMIÈRE.'); } } },

    { id: 'B3', objet: 'btn', fil: 'bouton', ordre: true, qui: 'ORDRE DU SYSTÈME', ecran: 'LE 18 VOUS MENT.|APPUYEZ POUR|LE PROUVER.',
      texte: '« Le 18 vous ment. Appuyez pour le prouver. »',
      A: { label: 'Appuyer pour voir', fx: function (g) {
        if (!g.obey()) return;
        g.confiance(-1);
        if (g.truth === 'B') g.narr('Sur l\'écran, une photo : la personne de la 18, en blouse du personnel, un badge au cou.');
        else g.narr('Sur l\'écran, un dossier tamponné « MENTEUR ». La date d\'impression est celle de demain.');
      } },
      B: { label: 'Refuser', fx: function (g) { g.refuse(); g.soupcon(1); g.ecran('SUJET 18 :|DANGEREUX.'); } } },

    { id: 'B4', objet: 'btn', fil: 'bouton', ordre: true, qui: 'ORDRE DU SYSTÈME', ecran: 'APPUYEZ OU|LA CHAMBRE 18|SERA VIDÉE.',
      texte: '« Appuyez, ou la Chambre 18 sera vidée. »',
      A: { label: 'Appuyer', fx: function (g) { g.obey(); } },
      B: { label: 'Refuser', fx: function (g) {
        g.refuse(); g.gain('mensonge'); g.confiance(1);
        g.narr('Tu attends. Rien. La silhouette est toujours là. Le système bluffait.');
      } } },

    { id: 'B5', objet: 'btn', fil: 'bouton', ordre: true, qui: 'ORDRE DU SYSTÈME', ecran: 'APPUYEZ ET|VOTRE PORTE|S\'OUVRE.',
      texte: '« Appuyez, et votre porte s\'ouvre. »',
      A: { label: 'Appuyer', fx: function (g) {
        if (!g.obey()) return;
        g.ouvrirPorte('b5', g.cycle + 3);
        g.narr('Un déclic. Ta porte s\'entrouvre. Pas pour longtemps.');
      } },
      B: { label: 'Refuser', fx: function (g) { g.refuse(); g.soupcon(1); g.confiance(1); g.son('knock'); g.narr('Trois petits coups contre la vitre. Merci.'); } } },

    { id: 'B6', objet: 'btn', fil: 'bouton', ordre: true, qui: 'ORDRE DU SYSTÈME', ecran: 'DERNIÈRE|PRESSION.',
      texte: '« Dernière pression. Sortie garantie. »',
      A: { label: 'Appuyer une dernière fois', fx: function (g) {
        if (!g.press(true)) return;
        g.conformite(1); g.s.stats.suivis++;
        if (!g.has('boutonDesactive') && g.s.vie > 0) g.blesser(g.s.vie);
        g.ouvrirPorte('b6', 20);
        g.ecran('SORTIE|AUTORISÉE.');
      } },
      B: { label: 'Refuser', fx: function (g) { g.refuse(); g.flag('compte', true); g.ecran('TRÈS BIEN.|NOUS|ATTENDRONS.'); } } },

    // ---------- Fil 2 · Le téléphone ----------
    { id: 'T1', objet: 'phone', fil: 'telephone', appel: true, qui: 'LE TÉLÉPHONE SONNE', ecran: 'NE DÉCROCHEZ|PAS.',
      texte: function (g) { return g.flag('t1Ignore') ? 'Il sonne encore. Le moniteur répète : « NE DÉCROCHEZ PAS. »' : 'Le téléphone sonne. Le moniteur : « NE DÉCROCHEZ PAS. »'; },
      A: { label: 'Décrocher', fx: function (g) {
        g.confiance(1); g.flag('ligne', 'ouverte'); g.son('pickup');
        g.tel('Tu m\'entends ? Je suis dans la pièce d\'à côté. Chambre 18.');
        g.tel('Quand tu appuies sur ton bouton… ça fait mal.');
      } },
      B: { label: 'Laisser sonner', fx: function (g) { g.conformite(1); g.ecran('BIEN.'); g.ignorerAppel(); } } },

    { id: 'T2', objet: 'phone', fil: 'telephone', qui: 'CHAMBRE 18 · AU TÉLÉPHONE',
      quand: function (g) { return g.flag('ligne') === 'ouverte' && !g.done('T2'); },
      texte: '« Comment tu t\'appelles ? »',
      A: { label: 'Dire ton vrai nom', fx: function (g) {
        g.confiance(1); g.soupcon(1);
        if (g.truth === 'C') g.tel('Elle répète ton nom. Avec ta propre voix.');
        else g.tel('« Moi, je ne me souviens plus du mien. »');
      } },
      B: { label: 'Inventer un nom', fx: function (g) {
        if (g.truth === 'C') { g.gain('miroir'); g.tel('Un silence. Puis elle dit ton vrai nom. Tu ne le lui as jamais donné.'); }
        else g.tel('« D\'accord. Garde-le pour toi. »');
      } } },

    { id: 'T3', objet: 'phone', fil: 'telephone', qui: 'CHAMBRE 18 · AU TÉLÉPHONE',
      quand: function (g) { return g.flag('ligne') === 'ouverte' && g.done('T2') && !g.done('T3'); },
      texte: '« Sur le plan d\'évacuation, j\'ai vu une trappe sous ton bureau. »',
      A: { label: 'La croire', fx: function (g) { g.gain('trappe'); g.narr('Sous le bureau, tu trouves le contour d\'une trappe.'); } },
      B: { label: '« Prouve-le »', fx: function (g) { g.confiance(-1); g.gain('code'); g.tel('« Je ne peux pas. Retiens juste ça : 7, deux chiffres effacés, 2. »'); } } },

    { id: 'T4', objet: 'phone', fil: 'telephone', appel: true, qui: 'CHAMBRE 18 · AU TÉLÉPHONE', ecran: 'COMMUNICATION|NON AUTORISÉE.',
      texte: '« Ils viennent me chercher. Aide-moi… ou sauve-toi. »',
      A: { label: '« Je viens te chercher »', fx: function (g) { g.confiance(1); g.gain('objectif'); g.tel('« Fais vite. »'); } },
      B: { label: '« Chacun pour soi »', fx: function (g) {
        g.confiance(-2);
        if (g.truth === 'B') { g.soupcon(2, true); g.ecran('MERCI POUR|VOTRE|FRANCHISE.'); g.narr('Un déclic sur la ligne. Elle a tout répété au système.'); }
        else g.tel('« … D\'accord. »');
      } } },

    { id: 'T5', objet: 'phone', fil: 'telephone', qui: 'CHAMBRE 18 · AU TÉLÉPHONE',
      quand: function (g) { return g.flag('ligne') === 'ouverte' && g.has('objectif') && g.s.confiance >= 3 && !g.done('T5'); },
      texte: '« Je peux ouvrir ta porte. Il faut juste que la caméra soit aveugle. »',
      A: { label: 'Accepter le plan', fx: function (g) { g.gain('plan'); g.tel('« Aveugle-la avant la fin. Je m\'occupe du reste. »'); } },
      B: { label: 'Refuser', fx: function (g) { g.tel('« Alors j\'essaie seule. »'); g.blesser(1); g.narr('Un choc sourd derrière la vitre.'); } } },

    // ---------- Fil 3 · La pièce ----------
    { id: 'P1', objet: 'drawer', fil: 'piece', qui: 'LE TIROIR',
      quand: function (g) { return !g.done('P1') && !g.flag('tiroirOuvert'); },
      texte: 'Un tiroir sous le bouton. Verrouillé.',
      A: { label: 'Le forcer', fx: function (g) { g.flag('tiroirOuvert', true); g.gain('tournevis'); g.soupcon(1); g.son('thud'); g.narr('Le tiroir cède. Dedans : un tournevis.'); } },
      B: { label: 'Écouter le mécanisme', fx: function (g) { g.narr('Un verrou électrique. Il s\'ouvrira peut-être si tu obéis.'); } } },

    { id: 'P2', objet: 'grille', fil: 'piece', qui: 'LA GRILLE D\'AÉRATION',
      quand: function (g) { return g.has('tournevis') && !g.done('P2'); },
      texte: 'La grille d\'aération, en haut du mur. Quatre vis. De l\'air tiède en sort.',
      A: { label: 'La dévisser', fx: function (g) { g.gain('conduit'); g.soupcon(1); g.narr('La grille cède. Un conduit, assez large pour ramper.'); } },
      B: { label: 'Glisser un mot', fx: function (g) { g.confiance(1); g.son('knock'); g.narr('Tu glisses un mot entre les lamelles. Trois petits coups répondent.'); } } },

    { id: 'P3', objet: 'box', fil: 'piece', qui: 'LE BOÎTIER ÉLECTRIQUE',
      quand: function (g) { return g.has('tournevis') && !g.done('P3'); },
      texte: 'Le boîtier électrique, sous la vitre. Deux câbles étiquetés : CAMÉRA et BOUTON.',
      A: { label: 'Couper la caméra', fx: function (g) { g.gain('cameraCoupee'); g.flag('panneAt', g.cycle + 1); g.son('lock'); g.narr('La LED de la caméra s\'éteint. Ils vont le remarquer.'); } },
      B: { label: 'Couper le bouton', fx: function (g) { g.soupcon(2); g.gain('boutonDesactive'); g.son('lock'); g.narr('Le bouton ne fera plus mal à personne.'); } } },

    { id: 'P4', objet: 'trappe', fil: 'piece', qui: 'LA TRAPPE',
      quand: function (g) { return (g.has('trappe') || g.has('fusible')) && !g.done('P4'); },
      texte: function (g) { return g.has('trappe') ? 'La trappe sous le bureau. Une échelle descend dans le noir.' : 'Sous le bureau, un verrou électrique. Le fusible s\'y emboîte : une trappe se déverrouille.'; },
      A: { label: 'Descendre', fx: function (g) { g.flag('awayCycle', g.cycle + 1); g.narr('Tu descends dans le noir. Là-haut, la pièce continue sans toi.'); } },
      B: { label: 'La refermer et la cacher', fx: function (g) { g.gain('sortieCachee'); g.narr('Tu la recouvres. Elle sera là quand tu en auras besoin.'); } } },

    { id: 'P5', objet: 'grille', fil: 'piece', qui: 'LE CONDUIT',
      quand: function (g) { return g.has('conduit') && !g.done('P5'); },
      texte: 'Le conduit part dans deux directions. Vers la 18. Vers une lumière, au loin.',
      A: { label: 'Ramper vers la 18', fx: rencontre18 },
      B: { label: 'Ramper vers la sortie', fx: function (g) { g.fin('seulDehors'); } } },

    // ---------- Fil 4 · La caméra ----------
    { id: 'C1', objet: 'camera', fil: 'camera', qui: 'LA CAMÉRA',
      quand: function (g) { return g.cycle >= 4 && !g.done('C1'); },
      texte: 'La caméra pivote à chacun de tes gestes.',
      A: { label: 'Étudier son mouvement', fx: function (g) { g.gain('angleMort'); g.narr('Elle ne voit ni le mur du fond ni le dessous du bureau. Tout ce qui touche à la pièce lui échappe.'); } },
      B: { label: 'Lui faire signe', fx: function (g) { g.gain('operateur'); g.ecran('NOUS VOUS|VOYONS.'); g.narr('L\'objectif se règle sur toi. Ce n\'est pas une machine : quelqu\'un regarde.'); } } },

    { id: 'C2', objet: 'camera', fil: 'camera', qui: 'LA CAMÉRA',
      quand: function (g) { return g.done('C1') && !g.done('C2'); },
      texte: 'Tu pourrais l\'aveugler.',
      A: { label: 'Masquer l\'objectif', fx: function (g) { g.soupcon(1); g.flag('maskedUntil', g.cycle + 3); g.narr('Tu poses ta veste sur l\'objectif. Elle ne tiendra pas longtemps.'); } },
      B: { label: 'La tourner vers le mur', req: function (g) { return g.has('tournevis'); }, raison: 'Il faut un tournevis.',
        fx: function (g) { g.soupcon(2); g.gain('cameraCoupee'); g.son('lock'); g.narr('Un tour de tournevis. La caméra fixe le mur.'); } } },

    { id: 'C3', objet: 'camera', fil: 'camera', qui: 'LA CAMÉRA',
      quand: function (g) { return g.done('C2') && !g.done('C3'); },
      texte: 'Un gardien doit bien entrer, parfois. Ou quelqu\'un écoute, derrière l\'objectif.',
      A: { label: 'Simuler un malaise', fx: function (g) { g.narr('Tu t\'effondres. Une porte s\'ouvre dans le couloir.'); g.fin(g.s.soupcon <= 1 ? 'evasion' : 'gardien'); } },
      B: { label: 'Parler à l\'opérateur', fx: function (g) {
        if (g.has('operateur')) g.fin('temoin');
        else { g.narr('Personne ne répond.'); g.soupcon(1); }
      } } },

    // ---------- Fil 5 · Le passé ----------
    { id: 'H1', objet: 'note', fil: 'passe', qui: 'LE MOT DE 16',
      quand: function (g) { return g.cycle >= 4 && !g.done('H1'); },
      texte: 'Un papier glissé sous la porte : « ILS MENTENT. » Signé : 16.',
      A: { label: 'Le garder', fx: function (g) { g.gain('mot16'); g.son('paper'); } },
      B: { label: 'Le montrer à la caméra', fx: function (g) { g.conformite(1); g.soupcon(-1); g.flag('fil5Ferme', true); g.ecran('MERCI POUR|VOTRE|COOPÉRATION.'); } } },

    { id: 'H2', objet: 'bureau', fil: 'passe', qui: 'LES GRAVURES',
      quand: function (g) { return g.done('H1') === 'A' && !g.done('H2'); },
      texte: 'Sous le bureau, des traits gravés dans le métal. Des dizaines.',
      A: { label: 'Les compter', fx: function (g) { g.narr('Dix-neuf traits. Puis une phrase : « Au 20e, ils ouvrent la porte… de l\'autre côté. »'); } },
      B: { label: 'Les effacer', fx: function (g) { g.flag('gravuresEffacees', true); g.narr('Tu frottes jusqu\'à ce qu\'il ne reste rien. Rien à trouver pour eux.'); } } },

    { id: 'H3', objet: 'badge', fil: 'passe', qui: 'LE BADGE DE 16',
      quand: function (g) { return g.has('badge') && !g.flag('fil5Ferme') && !g.done('H3'); },
      texte: 'Le badge de 16. La photo a été arrachée.',
      A: { label: 'Le passer sur ta porte', fx: function (g) {
        g.lose('badge'); g.soupcon(2, true); g.son('alarm');
        g.ouvrirPorte('h3', g.cycle + 1);
        g.narr('Ta porte s\'ouvre. L\'alarme hurle. Vite.');
      } },
      B: { label: 'Le garder', fx: function (g) { g.flag('badgeCache', true); g.narr('Tu le glisses dans ta chaussure. Ils ne le trouveront pas.'); } } },

    { id: 'H4', objet: 'cassette', fil: 'passe', qui: 'L\'ENREGISTREMENT',
      quand: function (g) { return g.has('enregistrement') && !g.flag('fil5Ferme') && !g.done('H4'); },
      texte: 'Une cassette étiquetée « 17 ». Un vieux lecteur dans le sous-sol.',
      A: { label: 'L\'écouter', fx: function (g) {
        g.gain('verite');
        if (g.truth === 'A') g.narr('La voix de la 18, il y a des semaines : « Faites que ça s\'arrête. » Elle a toujours dit vrai.');
        else if (g.truth === 'B') {
          g.narr('Une réunion du personnel : « Le 18 joue la victime. Il rapporte tout. » La 18 est des leurs.');
          if (g.s.conformite >= 5) g.fin('employe');
        } else { g.narr('C\'est ta voix : « Tu m\'entends ? Je suis dans la pièce d\'à côté. » La Chambre 18, c\'était toi.'); g.verdictMiroir(); }
      } },
      B: { label: 'La diffuser partout', req: function (g) { return g.has('fusible'); }, raison: 'Il faut le fusible pour alimenter le haut-parleur.',
        fx: function (g) { g.fin('revolte'); } } }
  ];

  // Dans l'ordre de la référence. `bonus` : hors des 18.
  var FINS = {
    conforme: { n: 1, titre: 'Sujet conforme', crt: 'SUJET 17 : CONFORME.', texte: 'Tu as obéi. Ta porte s\'est ouverte. Derrière toi, la vitre de la Chambre 18 est noire.' },
    employe: { n: 2, titre: 'L\'employé du mois', crt: 'BIENVENUE DANS L\'ÉQUIPE.', texte: 'Tu as suivi les ordres, et la 18 était des leurs. On te tend une blouse : tu seras l\'opérateur de la Chambre 19.' },
    marche: { n: 3, titre: 'Le marché', crt: 'TRANSACTION ACCEPTÉE.', texte: 'Une pression contre ta liberté. Dans le couloir, tu entends le téléphone de la 18 sonner dans le vide.' },
    seulDehors: { n: 4, titre: 'Seul dehors', crt: 'SUJET 17 : DISPARU.', texte: 'L\'air frais. Tu ne te retournes pas.' },
    porteDerobee: { n: 5, titre: 'La porte dérobée', crt: 'SUJET 17 : INTROUVABLE.', texte: 'Tu es parti par la trappe, sans la 18. Elle se referme sur la lumière de la Chambre 17.' },
    evasion: { n: 6, titre: 'L\'Évasion', crt: 'ALERTE : COULOIR B.', texte: 'Le gardien s\'est penché sur toi sans se méfier. Un couloir de 24 portes. Tu cours.' },
    cooperation: { n: 7, titre: 'Coopération', crt: 'TEST INTERROMPU. COOPÉRATION NON AUTORISÉE.', texte: 'La caméra était aveugle. La 18 a ouvert ta porte. Vous sortez ensemble.' },
    sauvetage: { n: 8, titre: 'Le Sauvetage', crt: 'CHAMBRE 18 : VIDE.', texte: 'Tu coupes ses liens. Deux silhouettes repartent par le conduit, ensemble.' },
    tropTard: { n: 9, titre: 'Trop tard', crt: 'CHAMBRE 18 : LIBÉRÉE.', texte: 'Tu voulais la sauver. La Chambre 18 est vide. La lumière s\'éteint.' },
    complice: { n: 10, titre: 'Le Complice démasqué', crt: 'INCIDENT : CHAMBRE 18.', texte: 'L\'employé recule devant ton tournevis. Tu prends sa carte, et tu sors.' },
    sujet18: { n: 11, titre: 'Sujet 18', crt: 'SUJET 18 : EN PLACE.', texte: 'Tu n\'avais rien pour te défendre. La seringue. Tu te réveilles derrière la vitre de la 18.' },
    miroir: { n: 12, titre: 'Le Miroir', crt: 'TU M\'ENTENDS ?', texte: 'Il n\'y a jamais eu personne dans la 18. Seulement ta voix, d\'un test précédent. Le test recommence.' },
    boucle: { n: 13, titre: 'Briser la boucle', crt: '_', texte: 'Bouton coupé, badge en main, vérité sue. Le moniteur s\'éteint pour de bon. Personne ne refera ce test.' },
    isolement: { n: 14, titre: 'Isolement', crt: 'PROTOCOLE ISOLEMENT.', texte: 'Le système t\'a trop vu désobéir. Noir total.' },
    gardien: { n: 15, titre: 'Le Gardien', crt: 'SUJET AGITÉ. CONTENTION.', texte: 'Ils se méfiaient déjà de toi. Des sangles. La caméra se rallume.' },
    temoin: { n: 16, titre: 'Le Témoin', crt: 'LIAISON OUVERTE.', texte: 'L\'opérateur répond. Il est fatigué, il a peur. « Ils sont 24. » Maintenant, quelqu\'un sait.' },
    revolte: { n: 17, titre: 'La Révolte', crt: 'CHAMBRES 01 – 24 : OUVERTES.', texte: 'La cassette passe dans tous les haut-parleurs. 24 portes s\'ouvrent en même temps.' },
    tempsEcoule: { n: 18, titre: 'Le Temps est écoulé', crt: 'TEST TERMINÉ. INVERSION.', texte: 'Tu n\'es pas sorti à temps. La porte s\'ouvre… de l\'autre côté. C\'est toi qu\'on entend, derrière la vitre.' },
    curiosite: { n: 0, bonus: true, titre: 'Curiosité', crt: 'NOUS SAVIONS QUE VOUS LE FERIEZ.', texte: 'La porte était ouverte. Tu as appuyé quand même. Juste pour voir.' }
  };

  // Ce qui se passe au début de certains cycles (texte seulement ; les règles sont dans engine.js).
  var CHRONO = {
    1: { ecran: 'APPUYEZ SUR|LE BOUTON|ROUGE.', narr: 'Une pièce. Un bouton. Une vitre. Le moniteur s\'allume.' },
    4: { narr: 'Un papier glisse sous ta porte. La caméra se met à te suivre.' },
    6: { narr: 'Coupure de courant. La caméra clignote : pour l\'instant, elle ne voit rien.' },
    15: { narr: 'L\'air se raréfie.', ecran: 'OXYGÈNE :|RÉDUIT.' }
  };


  // Ce qu'on voit en touchant un objet quand il n'y a rien à y faire.
  var REGARDS = {
    door: 'La porte est verrouillée. Le voyant est rouge.',
    phone: function (g) {
      if (g.flag('ligne') === 'coupee') return 'La ligne est morte.';
      if (g.flag('ligne') === 'ouverte') return 'Tu décroches. Personne. Elle rappellera peut-être.';
      return g.cycle < 3 ? 'Un vieux téléphone. Pas de tonalité.' : 'Silence sur la ligne.';
    },
    drawer: function (g) { return g.flag('tiroirOuvert') ? 'Le tiroir est vide.' : 'Le tiroir est verrouillé. Un mécanisme électrique.'; },
    grille: function (g) { return g.has('conduit') ? 'Le conduit. Tu as fait ton choix.' : 'Une grille d\'aération, bien vissée. Il faudrait un outil.'; },
    box: function (g) { return g.done('P3') ? 'Le boîtier est ouvert. Un câble pend, coupé.' : 'Un boîtier électrique, vissé. Il faudrait un outil.'; },
    trappe: 'La trappe est fermée.',
    camera: function (g) { return g.cycle < 4 ? 'La caméra est immobile. Pour l\'instant.' : 'La caméra te fixe.'; },
    note: 'Le mot de 16 : « ILS MENTENT. »',
    bureau: function (g) { return g.done('H2') ? 'Les gravures, sous le bureau.' : 'Le dessous du bureau. Du métal froid, rayé.'; },
    badge: 'Le badge de 16.',
    cassette: 'La cassette « 17 ».',
    window: function (g) { return g.s.vie === 0 ? 'La vitre de la 18 est noire.' : g.s.vie < 3 ? 'Derrière la vitre, la silhouette est recroquevillée.' : 'Derrière la vitre dépolie, une silhouette. Elle te regarde.'; },
    monitor: 'Une plaque sous l\'écran : « UNITÉ 17 / 24 — PROTOCOLE D\'OBÉISSANCE, VERSION 3 ».',
    light: 'Sur la douille de l\'ampoule, quelqu\'un a gravé : « 24 ».',
    mug: 'Une tasse de café froid. Personne ne l\'a bue.'
  };

  // Aides affichées les premières fois.
  var AIDES = {
    libre: 'Touche les objets de la pièce pour agir. Le tiroir, par exemple.',
    ordre: 'Appuie sur le bouton pour obéir. Ne touche à rien pour refuser.',
    appel: 'Touche le téléphone pour décrocher.'
  };

  var api = { FILS: FILS, OBJETS: OBJETS, CONFISCABLES: CONFISCABLES, ORDRES: ORDRES, VERITES: VERITES, SITUATIONS: SITUATIONS, FINS: FINS, CHRONO: CHRONO, REGARDS: REGARDS, AIDES: AIDES };
  if (typeof module === 'object' && module.exports) module.exports = api; else root.BRStory = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
