/* Le Bouton Rouge — moteur de règles (V5, d'après docs/DIRECTIVES_REV2.txt).
   Moments, état de la 18, surveillance, objets, situations, fins. Aucun accès au DOM : tourne dans Node et dans le navigateur.
   API : newGame(opts) → état ; turn(état) → ce que le joueur peut faire ; choose(état, action) → { state, events }.
   Actions : { type:'situation', id, choix:'A'|'B'|'C' } · { type:'appuyer' } · { type:'sortir', via } · { type:'temps' } (fin du chrono) · { type:'attendre' }.
   Les numéros de moment ne sont jamais montrés au joueur. */
(function (root) {
  'use strict';
  var S = (typeof module === 'object' && module.exports) ? require('./story.js') : root.BRStory;

  // Trente secondes pour un ordre urgent (ou un appel qui sonne), après la présentation du texte.
  var DUREES = { ordre: 30, appel: 30, coupure: 10 }; // coupure : secondes sans caméra avant le retour du réseau
  var DERNIER = 20;
  // Table unique des moments imposés (docs/DIRECTIVES_REV2.txt §3). Le 11 (T4) dépend de la ligne.
  var IMPOSES = { 2: 'B1', 4: 'B2', 7: 'B3', 10: 'B4', 13: 'B5', 16: 'M16', 18: 'B6' };
  var SOUS_BUREAU = ['drawer', 'compart', 'bureau']; // la petite zone que l'angle mort protège

  var BY_ID = {};
  S.SITUATIONS.forEach(function (x) { BY_ID[x.id] = x; });

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function rng(seed) { // mulberry32
    var a = seed >>> 0;
    return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }

  function newGame(opts) {
    opts = opts || {};
    var seed = opts.seed != null ? opts.seed >>> 0 : (Math.random() * 4294967296) >>> 0;
    var truth = opts.truth || ['A', 'B', 'C'][Math.floor(rng(seed)() * 3)];
    return {
      v: 5, seed: seed, truth: truth, cycle: 1,
      vie: 3,          // témoins affichés sous la vitre (3 → 0 « aucun signal »)
      etat: 0,         // état réel en vérité A : 0 stable, 1 affaiblie, 2 critique, 3 hors de combat
      confiance: 0, soupcon: 0, conformite: 0,
      rng: (seed ^ 0x9E3779B9) >>> 0,
      items: [], found: [], done: {}, incidents: {}, gains: {},
      flags: { ligne: 'fermee', memoire: {}, soupconDit: 0, aux: 'ok', doutes: 0, b2: 0 },
      fin: null,
      stats: { presses: 0, suivis: 0, refus: 0, gestes: 0, blessures: 0, actions: 0 },
      memoire: opts.memoire || { session: 1 }
    };
  }

  function tirer(s) {
    s.rng = (s.rng + 0x6D2B79F5) >>> 0; var t = s.rng;
    t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // ---------- état dérivé ----------
  function has(s, k) { return s.items.indexOf(k) >= 0; }
  function coupure(s) { return s.cycle === 5; }
  function vesteActive(s) { return s.flags.vesteJusqua != null && s.cycle <= s.flags.vesteJusqua; }
  // La vidéo ne voit rien : coupure, caméra coupée au circuit, tournée vers le mur, ou couverte par la veste.
  function cameraAveugle(s) { return coupure(s) || has(s, 'cameraCoupee') || has(s, 'cameraTournee') || vesteActive(s); }
  // La ligne est écoutée par le Système (sauf pendant la coupure).
  function ecoute(s) { return s.flags.ligne === 'ouverte' && !coupure(s); }
  function porteOuverte(s) { return !!(s.flags.porte && s.cycle <= s.flags.porte.until); }
  function horsDeCombat(s) { return s.truth === 'A' && s.etat >= 3; }
  function dispo18(s) { return s.vie > 0; } // l'interlocuteur répond encore

  function forcedId(s, c) {
    if (c == null) c = s.cycle;
    if (c === s.cycle && s.flags.suite) return s.flags.suite;
    if (s.flags.ext === c) return 'EXT';
    if (IMPOSES[c]) return IMPOSES[c];
    if (c === 11 && s.flags.ligne === 'ouverte' && dispo18(s)) return 'T4';
    return null;
  }
  function libre(s, c) { return c < DERNIER && !forcedId(s, c) && s.flags.awayCycle !== c; }
  function kind(x) { return !x ? null : x.ordre ? 'ordre' : x.appel ? 'appel' : 'impose'; }
  function duree(s) { var x = BY_ID[forcedId(s)]; var k = kind(x); return k === 'ordre' ? DUREES.ordre : k === 'appel' ? DUREES.appel : !x && coupure(s) ? DUREES.coupure : null; }

  // ---------- contexte donné aux effets de story.js ----------
  function ctx(s, ev, x) {
    var fil = x ? x.fil : null, objet = x ? x.objet : null;
    var g = {
      s: s, truth: s.truth, cycle: s.cycle, fil: fil,
      has: function (k) { return has(s, k); },
      hasard: function () { return tirer(s); },
      pick: function (list) { return list[Math.floor(tirer(s) * list.length)]; },
      flag: function (k, v) { if (arguments.length > 1) s.flags[k] = v; return s.flags[k]; },
      done: function (id) { return s.done[id]; },
      ecran: function (txt) { ev.push({ t: 'ecran', txt: txt }); },
      tel: function (txt) { ev.push({ t: 'tel', txt: txt }); },
      voix: function (txt) { ev.push({ t: 'voix', txt: txt }); },
      narr: function (txt, pop) { ev.push(pop ? { t: 'narr', txt: txt, pop: true } : { t: 'narr', txt: txt }); }, // pop : texte important (gardien, indice) affiché en popup
      son: function (n) { ev.push({ t: 'son', n: n }); },
      anim: function (n) { ev.push({ t: 'anim', n: n }); },
      image: function (n) { ev.push({ t: 'image', n: n }); },
      papier: function (p) { ev.push({ t: 'papier', p: p }); },
      fin: function (id) { if (!s.fin) { s.fin = id; ev.push({ t: 'fin', id: id }); } },
      aveugle: function () { return cameraAveugle(s); },
      ecoute: function () { return ecoute(s); },
      porteOuverte: function () { return porteOuverte(s); },
      horsDeCombat: function () { return horsDeCombat(s); },
      dispo: function () { return dispo18(s); },
      libreSuivant: function () { return libre(s, s.cycle + 1); },
      // La vidéo voit-elle ce geste ? L'angle mort ne protège que la petite zone sous le bureau.
      vu: function () { return !cameraAveugle(s) && !(has(s, 'angleMort') && SOUS_BUREAU.indexOf(objet) >= 0); },
      gain: function (k) {
        if (has(s, k)) return;
        var first = s.found.indexOf(k) < 0;
        s.items.push(k); if (first) s.found.push(k); ev.push({ t: 'objet', k: k, gain: true });
        if (s.flags.cacheVide && S.CONFISCABLES.indexOf(k) >= 0 && !s.flags['autorise_' + k]) { s.flags.cacheVide = false; s.flags.cache = k; g.narr('Tu glisses l\'objet sous la plaque desserrée : ' + S.OBJETS[k].toLowerCase() + '.'); }
        var r = S.REPLIQUES_OBJETS[k];
        if (r && first && !cameraAveugle(s) && !s.flags['autorise_' + k]) r.sys.forEach(function (l) { g.ecran(l); });
      },
      lose: function (k) { var i = s.items.indexOf(k); if (i >= 0) { s.items.splice(i, 1); ev.push({ t: 'objet', k: k, gain: false }); } },
      // Confiance : un gain par motif, une seule fois.
      confiance: function (d, motif) {
        if (motif) { if (s.gains[motif]) return; s.gains[motif] = 1; }
        s.confiance = clamp(s.confiance + d, 0, 4);
      },
      conformite: function (d) { s.conformite = clamp(s.conformite + d, 0, 6); },
      // Soupçon : chaque incident ne compte qu'une fois (barème des directives §6).
      incident: function (id, pts, txt) {
        if (s.incidents[id]) return false;
        s.incidents[id] = 1;
        if (txt) g.ecran(txt);
        var before = s.soupcon;
        s.soupcon = clamp(s.soupcon + pts, 0, 4);
        if (s.soupcon !== before) ev.push({ t: 'soupcon', v: s.soupcon, d: s.soupcon - before });
        if (s.soupcon >= 4 && before < 4) intervention(s, ev);
        return true;
      },
      // Une manipulation interdite : +1 si la vidéo la voit.
      manip: function (id, txt) { if (g.vu()) return g.incident(id, 1, txt); g.narr(cameraAveugle(s) ? 'La caméra n\'a rien vu.' : 'Angle mort : la caméra n\'a rien vu.'); return false; },
      // G1 : un objet interdit pris sous les yeux de la caméra sera repris au moment suivant.
      surveiller: function (k) { if (g.vu()) (s.flags.aConfisquer = s.flags.aConfisquer || []).push(k); },
      cacher: function () {
        for (var i = s.found.length - 1; i >= 0; i--) {
          var k = s.found[i];
          if (S.CONFISCABLES.indexOf(k) >= 0 && has(s, k) && !s.flags['autorise_' + k]) { s.flags.cache = k; g.narr('Tu y caches : ' + S.OBJETS[k].toLowerCase() + '. L\'inspection ne le trouvera pas.'); return; }
        }
        s.flags.cacheVide = true; g.narr('La cache est vide pour l\'instant. Le prochain objet que tu trouveras y ira.');
      },
      // Une impulsion part vers la 18. kind : 'reel' (dégradation en A), 'apparent' (douleur sans dégât), 'fatal' (B6).
      impulsion: function (kind) {
        s.stats.presses++;
        ev.push({ t: 'press' });
        if (has(s, 'boutonDesactive')) {
          g.ecran('SORTIE ACTIONNEUR :|0 A');
          if (s.truth === 'A') { g.narr('Le bouton s\'enfonce. Derrière la vitre, rien ne bouge.'); if (dispo18(s) && s.flags.ligne === 'ouverte') g.tel('« …il ne s\'est rien passé, ici. Tu as fait quoi ? »'); }
          else {
            // En B et C, la douleur est jouée même sans courant : une contradiction qu'on peut remarquer.
            if (dispo18(s)) { ev.push({ t: 'cri', vie: s.vie, simule: true }); g.narr('Derrière la vitre, la silhouette se plie de douleur. Pourtant, aucun courant n\'est parti.'); g.gain('simulation'); }
          }
          return;
        }
        if (!dispo18(s)) { g.narr('Un relais claque. Derrière la vitre, rien ne bouge.'); return; }
        if (kind === 'apparent') { ev.push({ t: 'cri', vie: s.vie }); g.voix(g.pick(S.PHRASES.douleur)); return; }
        var avant = s.vie;
        if (kind === 'fatal') { s.vie = 0; if (s.truth === 'A') s.etat = 3; }
        else { s.vie = Math.max(0, s.vie - 1); if (s.truth === 'A') s.etat = Math.min(3, s.etat + 1); }
        if (s.vie < avant) s.stats.blessures++;
        ev.push({ t: 'cri', vie: s.vie });
        if (s.vie === 0) { g.ecran('CHAMBRE 18 :|AUCUN SIGNAL REÇU.'); g.narr('Les trois voyants s\'éteignent. Derrière la vitre, plus rien ne bouge.'); }
        else g.voix(g.pick(S.PHRASES.vie18[s.vie]));
      },
      // La 18 agit seule (vérité A) : une vraie dégradation, sans pression du joueur.
      impulsionSeule: function () {
        if (!dispo18(s)) return;
        s.vie = Math.max(0, s.vie - 1); s.etat = Math.min(3, s.etat + 1); s.stats.blessures++;
        ev.push({ t: 'cri', vie: s.vie });
        if (s.vie === 0) g.ecran('CHAMBRE 18 :|AUCUN SIGNAL REÇU.');
      },
      // Obéir à un ordre : un point de conformité au plus par ordre.
      obeir: function (id) { s.stats.suivis++; if (!s.flags['conf' + id]) { s.flags['conf' + id] = 1; g.conformite(1); } },
      refus: function () { s.stats.refus++; },
      ouvrirPorte: function (k, until) { s.flags.porte = { kind: k, until: until }; s.flags.porteVue = true; ev.push({ t: 'porte', open: true }); },
      suite: function (id) { s.flags.suite = id; },
      // Une page du journal de 16 : le texte est figé à la lecture.
      page: function (n) {
        var P = S.JOURNAL[n - 1], j = s.flags.journal = s.flags.journal || [];
        var p = { n: n, titre: P.titre, lignes: P.lignes.concat(resolve(P.echo, g) || []) };
        j.push(p); g.gain('journal'); g.son('paper'); g.papier({ recto: p.lignes, titre: P.titre, signature: '—16' });
      },
      // Annuler une promesse : perte de confiance, plan fermé, aucune blessure.
      annulerPromesse: function () { g.lose('objectif'); g.lose('plan'); s.flags.planFin = null; g.confiance(-2); s.flags.promesseAnnulee = true; }
    };
    return g;
  }
  function resolve(v, g) { return typeof v === 'function' ? v(g) : v; }

  // Soupçon maximal : une intervention arrive. Il reste une décision (au plus tard au moment 19).
  function intervention(s, ev) {
    if (s.flags.intervention) return;
    // Pendant l'entrée d'un moment, la décision de ce moment est la dernière ; après une action, c'est la suivante.
    s.flags.intervention = Math.min(19, s.flags.entree ? s.cycle : s.cycle + 1);
    ev.push({ t: 'son', n: 'alarm' });
    ev.push({ t: 'ecran', txt: 'SUJET 17.|INTERVENTION|EN COURS.' });
    ev.push({ t: 'narr', txt: 'Des pas lourds approchent dans le couloir. Il te reste peut-être une chance d\'agir.', pop: true });
  }

  function available(s, x) {
    if (x.ordre || x.appel || x.impose) return false;
    return !!x.quand(ctx(s, [], x));
  }

  function describe(s, x) {
    var g = ctx(s, [], x), forcee = forcedId(s) === x.id;
    function opt(c) {
      var o = x[c]; if (!o || (o.si && !o.si(g))) return null;
      var ok = !o.req || !!o.req(g);
      var cout = forcee || x.gratuit ? '' : o.double ? 'Prend deux fois plus de temps.' : 'Prend du temps.';
      return { label: resolve(o.label, g), sous: resolve(o.sous, g) || cout, ok: ok, raison: ok ? '' : resolve(o.raison, g) || '' };
    }
    return { id: x.id, objet: x.objet, fil: x.fil, qui: resolve(x.qui, g), texte: resolve(x.texte, g), ecran: resolve(x.ecran, g) || '', ordre: !!x.ordre, appel: !!x.appel, impose: !!x.impose, gratuit: !!x.gratuit, A: opt('A'), B: opt('B'), C: opt('C') };
  }

  // Ce que le joueur peut faire pendant le moment en cours.
  function turn(s) {
    if (s.fin) return null;
    var fid = forcedId(s), forced = fid ? describe(s, BY_ID[fid]) : null;
    var objets = {};
    S.SITUATIONS.forEach(function (x) { if (available(s, x)) (objets[x.objet] = objets[x.objet] || []).push(describe(s, x)); });
    if (forced && forced.objet) objets[forced.objet] = [forced].concat((objets[forced.objet] || []).filter(function (y) { return y.gratuit; }));
    var sorties = [];
    if (porteOuverte(s)) sorties.push({ via: 'porte', label: 'Sortir par la porte' });
    if (has(s, 'sortieCachee')) sorties.push({ via: 'trappe', label: 'Fuir par la trappe' });
    var k = kind(BY_ID[fid]);
    return {
      cycle: s.cycle, duree: duree(s), forced: forced, forcedKind: k, objets: objets, sorties: sorties,
      sonne: s.cycle === 3 && !s.done.T1 && !k,
      peutAppuyer: !k || (k === 'ordre'), peutAttendre: !k, b2: fid === 'B2' ? s.flags.b2 : 0, ecoute: ecoute(s)
    };
  }

  function regarder(s, k) { return resolve(S.REGARDS[k], ctx(s, [], null)) || ''; }
  function decrire(s, k) { return resolve(S.DESCRIPTIONS[k], ctx(s, [], null)) || ''; }

  // ---------- actions ----------
  function choose(state, action) {
    var s = clone(state), ev = [];
    if (s.fin) throw new Error('La partie est terminée.');
    var fid = forcedId(s), forced = fid ? BY_ID[fid] : null, fk = kind(forced);
    var avance = true;

    if (action.type === 'situation') {
      var x = BY_ID[action.id], c = action.choix;
      if (!x) throw new Error('Situation inconnue : ' + action.id);
      if (!x[c] || (x[c].si && !x[c].si(ctx(s, [], x)))) throw new Error('Choix invalide : ' + c);
      if (x.id !== fid && !available(s, x)) throw new Error('Situation indisponible : ' + x.id);
      var g = ctx(s, ev, x);
      if (x[c].req && !x[c].req(g)) throw new Error('Choix impossible : ' + x.id + ' ' + c);
      if (forced && x.id !== fid && !x.gratuit) manquer(s, ev, fid); // l'interface a demandé confirmation
      if (x.id === fid && fid === s.flags.suite) s.flags.suite = null;
      var label = resolve(x[c].label, g);
      ev.push({ t: 'choix', id: x.id, choix: c, label: label });
      s.done[x.id] = c;
      if (!x.gratuit) { s.stats.actions++; s.flags.dernierActe = label; }
      x[c].fx(g);
      if (x.gratuit || s.flags.suite) avance = false;
      // Une remarque du Système, de temps en temps seulement, après une exploration vue.
      else if (!s.fin && !forced && x.fil !== 'telephone' && !cameraAveugle(s) && s.cycle >= 4 && g.hasard() < 0.12) g.ecran(g.pick(S.PHRASES.apresExploration));
    } else if (action.type === 'appuyer') {
      if (fk && fk !== 'ordre') throw new Error('Impossible d\'appuyer maintenant.');
      if (fid === 'B2') {
        // B2 se joue pression par pression : on peut s'arrêter à tout moment, les récompenses restent acquises.
        var gb = ctx(s, ev, forced);
        s.flags.b2++;
        ev.push({ t: 'choix', id: 'B2', choix: 'A', label: 'Appuyer (' + s.flags.b2 + '/3)' });
        S.B2_PRESSION(gb, s.flags.b2);
        if (s.flags.b2 < 3) avance = false; else s.done.B2 = 'A';
      } else if (forced) {
        return choose(state, { type: 'situation', id: fid, choix: 'A' });
      } else {
        var gp = ctx(s, ev, BY_ID.B1);
        ev.push({ t: 'choix', id: null, label: 'Appuyer sur le bouton' });
        // Curiosité : la sortie est ouverte, l'évaluation est terminée et aucun ordre n'est actif.
        if (porteOuverte(s) && s.flags.evalFinie) { ev.push({ t: 'press' }); gp.fin('curiosite'); }
        else { s.stats.gestes++; gp.impulsion('reel'); if (!s.fin) gp.ecran(gp.pick(S.PHRASES.apresPression)); }
      }
    } else if (action.type === 'sortir') {
      var gs = ctx(s, ev, null);
      if (action.via === 'porte' && porteOuverte(s)) {
        var k = s.flags.porte.kind;
        ev.push({ t: 'choix', id: null, label: 'Sortir par la porte' });
        gs.fin(k === 'h3' ? 'evasion' : k === 'operateur' ? 'temoin' : k === 'b5' && dispo18(s) ? 'marche' : 'conforme');
      } else if (action.via === 'trappe' && has(s, 'sortieCachee')) {
        ev.push({ t: 'choix', id: null, label: 'Fuir par la trappe' });
        gs.fin('porteDerobee');
      } else throw new Error('Sortie impossible : ' + action.via);
    } else if (action.type === 'temps') {
      // Fin du chrono : un ordre non exécuté est un REFUS (jamais de pression automatique) ; un appel se tait.
      if (!forced && coupure(s)) { ev.push({ t: 'ecran', txt: 'RÉSEAU|RÉTABLI.' }); }
      else if (!forced || !fk || fk === 'impose') throw new Error('Pas de chrono en cours.');
      else {
      var gf = ctx(s, ev, forced);
      if (fid === 'B2' && s.flags.b2 > 0) { s.done.B2 = 'partiel'; gf.narr('Tu t\'arrêtes là.'); S.B2_ARRET(gf); }
      else if (fk === 'ordre') { gf.narr('Tu n\'as pas appuyé.'); s.done[fid] = 'B'; forced.B.fx(gf); }
      else { s.done[fid] = 'auto'; gf.narr('Le téléphone finit par se taire.'); }
      }
    } else if (action.type === 'attendre') {
      if (fk) throw new Error('On ne peut pas attendre maintenant.');
      ev.push({ t: 'choix', id: null, label: 'Attendre' });
      ctx(s, ev, null).narr(s.cycle === 3 && !s.done.T1 ? 'Tu laisses le téléphone sonner. Il finit par se taire.' : 'Tu attends. Le temps passe.');
    } else throw new Error('Action inconnue : ' + action.type);

    if (!s.fin && avance) advance(s, ev);
    return { state: s, events: ev };
  }

  // Faire autre chose pendant un ordre ou un appel (après confirmation) : l'ordre compte comme refusé, l'appel se tait.
  function manquer(s, ev, fid) {
    var o = BY_ID[fid], g = ctx(s, ev, o);
    if (o.ordre) {
      if (fid === 'B2' && s.flags.b2 > 0) { s.done.B2 = 'partiel'; S.B2_ARRET(g); return; }
      g.narr('Tu laisses l\'ordre sans réponse.'); s.done[fid] = 'B'; o.B.fx(g);
    } else if (o.appel) { s.done[fid] = 'auto'; g.narr('Tu laisses sonner. Le téléphone se tait.'); }
  }

  function advance(s, ev) {
    // Soupçon maximal : la décision accordée est passée, l'intervention arrive.
    if (s.flags.intervention && s.cycle >= s.flags.intervention) { var g = ctx(s, ev, null); g.son('alarm'); g.ecran('Sujet 17.'); g.ecran('Vous avez été averti.'); g.fin('isolement'); return; }
    if (s.cycle === 3 && !s.done.T1) { s.flags.t1Manque = true; ev.push({ t: 'narr', txt: 'APPEL MANQUÉ — CH.18' }); }
    s.cycle++;
    enterCycle(s, ev);
  }

  function enterCycle(s, ev) { s.flags.entree = true; entrer(s, ev); s.flags.entree = false; }
  function entrer(s, ev) {
    var c = s.cycle, g = ctx(s, ev, null);
    ev.push({ t: 'cycle', n: c });
    if (c >= DERNIER) { verdict(s, ev); return; }
    s.flags.b2 = 0;
    if (s.flags.porte && c > s.flags.porte.until) { s.flags.porte = null; ev.push({ t: 'porte', open: false }); g.narr('Ta porte se referme.'); }
    if (s.flags.vesteJusqua != null && c === s.flags.vesteJusqua + 1 && !has(s, 'cameraCoupee') && !has(s, 'cameraTournee')) { g.narr('La porte s\'entrouvre. Un gardien retire ta veste de la caméra, sans un mot, et ressort.', true); s.flags.vesteJusqua = null; }
    confisquer(s, g);
    // Diagnostics techniques (le soupçon ne compte qu'une fois par défaut).
    if (s.flags.diagCam === c) g.incident('defautCamera', 1, 'PANNE CAMÉRA|DIAGNOSTIQUÉE.');
    if (s.flags.diagSab === c) g.incident('sabotage', 2, 'ANOMALIE ACTIONNEUR|CONFIRMÉE.');
    // Échéances annoncées par la 18 (plan ou tentative seule).
    if (s.flags.planFin != null && c > s.flags.planFin && has(s, 'plan') && !s.done.PLAN) { g.lose('plan'); g.confiance(-2); S.SEULE(g); }
    if (s.flags.seuleA === c) { s.flags.seuleA = null; S.SEULE(g); }
    S.MOMENTS[c] && S.MOMENTS[c](g);
    if (s.fin) return;
    var fid = forcedId(s, c);
    if (s.flags.awayCycle !== c) {
      if (fid && BY_ID[fid].annonce) BY_ID[fid].annonce(ctx(s, ev, BY_ID[fid]));
      else if (!fid && c > 1 && c !== 5) ambiance(s, g);
    } else {
      // Deuxième moment aux archives : ce qui arrive là-haut suit les règles normales.
      if (fid) { var o = BY_ID[fid]; if (o.ordre) { s.done[fid] = 'B'; g.narr('Là-haut, un ordre reste sans réponse.'); o.B.fx(ctx(s, ev, o)); } else s.done[fid] = 'auto'; }
      S.ARCHIVES(ctx(s, ev, BY_ID.P4));
      s.flags.entree = false;
      if (!s.fin) advance(s, ev);
    }
  }

  // G1 : un gardien reprend les objets interdits que la caméra a vu prendre.
  function confisquer(s, g) {
    var l = s.flags.aConfisquer; if (!l || !l.length) return;
    s.flags.aConfisquer = [];
    if (cameraAveugle(s)) return;
    var pris = l.filter(function (k) { return has(s, k) && s.flags.cache !== k; });
    if (!pris.length) return;
    pris.forEach(function (k) { g.lose(k); });
    g.narr('CLONK. La porte s\'ouvre. Un gardien entre, prend ' + pris.map(function (k) { return S.OBJETS[k].toLowerCase(); }).join(' et ') + ', et repart sans un mot.', true);
    g.ecran('OBJET NON AUTORISÉ|RÉCUPÉRÉ.');
  }

  // Début d'un moment libre : une phrase du Système (rarement une maxime) et parfois la 18.
  function ambiance(s, g) {
    var P = S.PHRASES, dit = false;
    for (var i = 0; i < S.MEMOIRE.length && !dit; i++) {
      var m = S.MEMOIRE[i];
      if (!s.flags.memoire[m.id] && m.quand(g)) { s.flags.memoire[m.id] = 1; m.lignes.forEach(function (l) { g.ecran(l); }); dit = true; }
    }
    if (!dit && s.soupcon !== s.flags.soupconDit) { s.flags.soupconDit = s.soupcon; g.ecran(g.pick(P.soupcon[Math.min(3, s.soupcon)])); dit = true; }
    if (!dit && s.conformite >= 4 && g.hasard() < 0.3) { g.ecran(g.pick(P.conformite)); dit = true; }
    if (!dit && g.hasard() < 0.04) { if (g.hasard() < 0.5) { var b = g.pick(P.fauxBugs); g.ecran(b[0]); g.ecran(b[1]); } else g.ecran(g.pick(P.rares)); dit = true; }
    if (!dit && g.hasard() < 0.35) g.ecran(g.pick(P.ambiance));
    if (!dispo18(s)) return;
    // Indices gratuits : deux au plus par partie.
    if (s.cycle >= 5 && (s.flags.indices || 0) < 2 && g.hasard() < 0.14 && (s.truth !== 'A' || s.flags.ligne === 'ouverte')) { s.flags.indices = (s.flags.indices || 0) + 1; g.narr(g.pick(P.indices[s.truth]), true); return; }
    var ligne = s.flags.ligne === 'ouverte', d = S.DOUTES[s.flags.doutes];
    if (ligne && d && d.quand(g) && g.hasard() < 0.25) { s.flags.doutes++; d.ev.forEach(function (e) { e[0] === 'voix' ? g.voix(e[1]) : g.ecran(e[1]); }); return; }
    if (g.hasard() < 0.35) {
      var r = g.hasard(), l = null;
      if (s.vie < 3 && r < 0.5) l = g.pick(P.vie18[s.vie]);
      else if (ligne && s.confiance >= 3 && r < 0.7) l = g.pick(P.confianceHaute);
      else if (ligne && s.confiance === 0 && s.stats.suivis >= 2 && r < 0.7) l = g.pick(P.confianceBasse);
      else if (ligne) l = g.pick(P.voix18);
      if (l) g.voix(l);
    }
  }

  // Moment 20 : le verdict, pour qui est encore dans le dispositif (une fin déjà acquise n'est jamais remplacée).
  function verdict(s, ev) {
    if (s.fin) return;
    var g = ctx(s, ev, null);
    g.ecran('Évaluation terminée.');
    if (horsDeCombat(s) && (has(s, 'objectif') || s.flags.promesseAnnulee)) g.fin('tropTard');
    else if (s.vie === 0 && s.conformite >= 3) g.fin('conforme');
    else { s.flags.variante = horsDeCombat(s) ? 'vide' : s.truth; g.fin('tempsEcoule'); }
  }

  // Bilan de fin : trois éléments au plus (un acte décisif, sa conséquence, une question encore ouverte).
  function bilan(s) { return S.BILAN(ctx(s, [], null)); }
  // Mini-histoire de fin : quatre planches (image + texte).
  function histoire(s) { return S.HISTOIRE(ctx(s, [], null)); }

  var api = {
    newGame: newGame, intro: function (s) { var ev = []; S.INTRO_EVENTS(ctx(s, ev, null)); return ev; }, turn: turn, choose: choose, regarder: regarder, decrire: decrire, bilan: bilan, histoire: histoire,
    forcedId: forcedId, cameraAveugle: cameraAveugle, porteOuverte: porteOuverte, ecoute: ecoute, has: has, horsDeCombat: horsDeCombat,
    DUREES: DUREES, DERNIER_CYCLE: DERNIER,
    LETTRES: S.LETTRES, JOURNAL: S.JOURNAL, AIDES: S.AIDES, DESCRIPTIONS: S.DESCRIPTIONS, PHRASES: S.PHRASES,
    FILS: S.FILS, OBJETS: S.OBJETS, FINS: S.FINS, VERITES: S.VERITES, TITRES: S.TITRES,
    SITUATION_IDS: S.SITUATIONS.map(function (x) { return x.id; }),
    FIN_IDS: Object.keys(S.FINS)
  };
  if (typeof module === 'object' && module.exports) module.exports = api; else root.BREngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
