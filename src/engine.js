/* Le Bouton Rouge — moteur de règles (v2).
   Cycles, jauges, objets, situations, fins. Aucun accès au DOM : tourne dans Node et dans le navigateur.
   API : newGame(opts) → état ; turn(état) → ce que le joueur peut faire ; choose(état, action) → { state, events }.
   Les actions : { type:'situation', id, choix:'A'|'B' } · { type:'appuyer' } · { type:'sortir', via:'porte'|'trappe' } · { type:'temps' }. */
(function (root) {
  'use strict';
  var S = (typeof module === 'object' && module.exports) ? require('./story.js') : root.BRStory;

  // Durées, en secondes (décidées par Amine le 18/10) : un ordre attend 30 s puis compte comme refusé ;
  // un appel sonne 30 s puis s'arrête ; les moments libres n'ont pas de limite de temps.
  var DUREES = { ordre: 30, appel: 30 };
  var DERNIER_CYCLE = 20;

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
    var s = {
      seed: seed, truth: truth, cycle: 1,
      vie: 3, confiance: 0, soupcon: 0, conformite: 0,
      rng: (seed ^ 0x9E3779B9) >>> 0, // pour tirer les variantes de texte (même graine = même partie)
      items: [], found: [], done: {}, flags: { ligne: 'fermee', t1Ignore: 0, memoire: {}, soupconDit: 0 }, fin: null,
      stats: { presses: 0, auto: 0, suivis: 0, refus: 0, blessures: 0, actions: 0 }
    };
    return s;
  }

  // Événements du début de partie (cycle 1).
  function intro(s) {
    var ev = [], g = ctx(s, ev, null), P = S.PHRASES;
    P.intro.forEach(function (l) { g.ecran(l); });
    g.ecran(g.pick(P.introVariantes));
    chronoTexts(s, ev, 1);
    return ev;
  }
  function tirer(s) { // mulberry32, l'état est gardé dans la partie
    s.rng = (s.rng + 0x6D2B79F5) >>> 0; var t = s.rng;
    t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // ---------- état dérivé ----------
  function has(s, k) { return s.items.indexOf(k) >= 0; }
  function cameraAveugle(s) { return has(s, 'cameraCoupee') || (s.flags.maskedUntil != null && s.cycle <= s.flags.maskedUntil); }
  function porteOuverte(s) { return !!(s.flags.porte && s.cycle <= s.flags.porte.until); }

  function forcedId(s, c) {
    if (c == null) c = s.cycle;
    if (S.ORDRES[c]) return S.ORDRES[c];
    if (c === 3) return 'T1';
    if (c === 6 && s.flags.t1Ignore === 1 && s.flags.ligne === 'fermee') return 'T1';
    if (c === 12 && s.flags.ligne === 'ouverte') return 'T4';
    return null;
  }

  function duree(s) {
    var fid = forcedId(s);
    if (!fid) return null;
    return BY_ID[fid].ordre ? DUREES.ordre : DUREES.appel;
  }

  function prochainOrdre(s) {
    for (var c = s.cycle; c < DERNIER_CYCLE; c++) if (S.ORDRES[c]) return c;
    return null;
  }

  // ---------- contexte donné aux effets de story.js ----------
  function ctx(s, ev, fil) {
    var g = {
      s: s, truth: s.truth, cycle: s.cycle, fil: fil,
      has: function (k) { return has(s, k); },
      gain: function (k) {
        if (has(s, k)) return;
        var first = s.found.indexOf(k) < 0;
        s.items.push(k); s.found.push(k); ev.push({ t: 'objet', k: k, gain: true });
        var r = S.REPLIQUES_OBJETS[k];
        if (r && first) { if (r.voix) g.voix(r.voix); if (!cameraAveugle(s)) r.sys.forEach(function (l) { g.ecran(l); }); }
      },
      hasard: function () { return tirer(s); },
      pick: function (list) { return list[Math.floor(tirer(s) * list.length)]; },
      voix: function (txt) { ev.push({ t: 'voix', txt: txt }); },
      lose: function (k) { var i = s.items.indexOf(k); if (i >= 0) { s.items.splice(i, 1); ev.push({ t: 'objet', k: k, gain: false }); } },
      flag: function (k, v) { if (arguments.length > 1) s.flags[k] = v; return s.flags[k]; },
      done: function (id) { return s.done[id]; },
      ecran: function (txt) { ev.push({ t: 'ecran', txt: txt }); },
      tel: function (txt) { ev.push({ t: 'tel', txt: txt }); },
      narr: function (txt) { ev.push({ t: 'narr', txt: txt }); },
      son: function (n) { ev.push({ t: 'son', n: n }); },
      fin: function (id) { if (!s.fin) { s.fin = id; ev.push({ t: 'fin', id: id }); } },
      confiance: function (d) { s.confiance = clamp(s.confiance + d, 0, 4); },
      conformite: function (d) { s.conformite = clamp(s.conformite + d, 0, 6); },
      // Soupçon : rien ne monte si la caméra est aveugle, pendant la coupure du cycle 6, ou dans le fil 3 avec l'angle mort.
      // `force` : événements que la caméra n'a pas besoin de voir (panne remarquée, dénonciation, alarme).
      soupcon: function (d, force) {
        if (d > 0 && !force) {
          if (cameraAveugle(s)) { g.narr('La caméra n\'a rien vu.'); return; }
          if (s.cycle === 6) { g.narr('Dans la coupure, personne n\'a rien vu.'); return; }
          if (fil === 'piece' && has(s, 'angleMort')) { g.narr('Angle mort : la caméra n\'a rien vu.'); return; }
        }
        var before = s.soupcon;
        s.soupcon = clamp(s.soupcon + d, 0, 4);
        if (s.soupcon !== before) ev.push({ t: 'soupcon', v: s.soupcon, d: s.soupcon - before });
      },
      blesser: function (n) {
        if (s.vie <= 0) return;
        s.vie = Math.max(0, s.vie - n); s.stats.blessures++;
        ev.push({ t: 'cri', vie: s.vie });
        if (s.vie === 0) { g.narr('Un dernier bruit. Puis silence.'); g.ecran('CHAMBRE 18 :|AUCUN SIGNAL'); g.ecran(g.pick(S.PHRASES.mort18)); }
        else g.voix(g.pick(S.PHRASES.vie18[s.vie]));
      },
      // Pression sur le bouton. Renvoie false si la partie s'arrête (Curiosité).
      press: function (joueur) {
        if (joueur && porteOuverte(s)) { ev.push({ t: 'press' }); g.fin('curiosite'); return false; }
        s.stats[joueur ? 'presses' : 'auto']++;
        ev.push({ t: 'press', auto: !joueur });
        if (has(s, 'boutonDesactive')) g.narr('Le bouton s\'enfonce dans le vide. Rien ne se passe derrière la vitre.');
        else g.blesser(1);
        return true;
      },
      obey: function () {
        if (!g.press(true)) return false;
        g.conformite(1); s.stats.suivis++;
        return true;
      },
      refuse: function () { s.stats.refus++; },
      ignorerAppel: function () {
        s.flags.t1Ignore++;
        if (s.flags.t1Ignore >= 2 && s.flags.ligne === 'fermee') { s.flags.ligne = 'coupee'; g.narr('La sonnerie s\'arrête. Pour de bon.'); g.ecran('LIGNE|TERMINÉE.'); }
        else g.narr('La sonnerie s\'arrête.');
      },
      ouvrirPorte: function (kind, until) { s.flags.porte = { kind: kind, until: until }; ev.push({ t: 'porte', open: true }); },
      // Vérité C révélée : Briser la boucle (bouton désactivé + badge) ou le Miroir.
      verdictMiroir: function () { g.fin(has(s, 'boutonDesactive') && has(s, 'badge') ? 'boucle' : 'miroir'); }
    };
    return g;
  }

  function resolve(v, g) { return typeof v === 'function' ? v(g) : v; }

  function available(s, x) {
    if (x.ordre || x.appel) return false;
    if (x.fil === 'piece' && s.flags.noirCycle === s.cycle) return false;
    return !!x.quand(ctx(s, [], x.fil));
  }

  function describe(s, x) {
    var g = ctx(s, [], x.fil);
    function opt(c) { var o = x[c], ok = !o.req || !!o.req(g); return { label: o.label, ok: ok, raison: ok ? '' : (o.raison || '') }; }
    return { id: x.id, objet: x.objet, fil: x.fil, qui: x.qui, texte: resolve(x.texte, g), ecran: x.ecran || '', ordre: !!x.ordre, appel: !!x.appel, A: opt('A'), B: opt('B') };
  }

  // Ce que le joueur peut faire pendant le cycle en cours.
  function turn(s) {
    if (s.fin) return null;
    var fid = forcedId(s);
    var forced = fid ? describe(s, BY_ID[fid]) : null;
    var fils = S.FILS.map(function (f) {
      var info = { id: f.id, nom: f.nom, court: f.court, situations: [], note: '' };
      if (forced) return info;
      S.SITUATIONS.forEach(function (x) { if (x.fil === f.id && available(s, x)) info.situations.push(describe(s, x)); });
      if (!info.situations.length) info.note = noteFil(s, f.id);
      return info;
    });
    var sorties = [];
    if (porteOuverte(s)) sorties.push({ via: 'porte', label: 'Sortir par la porte' });
    if (has(s, 'sortieCachee')) sorties.push({ via: 'trappe', label: 'Fuir par la trappe cachée' });
    // Les situations rangées par objet de la pièce (ce que le joueur touche).
    var objets = {};
    if (forced) objets[BY_ID[fid].objet] = [forced];
    else fils.forEach(function (f) { f.situations.forEach(function (x) { (objets[BY_ID[x.id].objet] = objets[BY_ID[x.id].objet] || []).push(x); }); });
    return {
      cycle: s.cycle, dernier: DERNIER_CYCLE, duree: duree(s), forced: forced, fils: fils, sorties: sorties, objets: objets,
      peutAppuyer: !forced || forced.ordre, prochainOrdre: prochainOrdre(s)
    };
  }

  // Texte affiché quand on touche un objet sans rien pouvoir y faire.
  function regarder(s, k) { return resolve(S.REGARDS[k], ctx(s, [], null)) || ''; }

  function noteFil(s, fil) {
    if (fil === 'bouton') return 'Le bouton attend.';
    if (fil === 'piece' && s.flags.noirCycle === s.cycle) return 'Noir complet : tu ne vois plus la pièce.';
    if ((fil === 'camera' || fil === 'passe') && s.cycle < 4) return 'Rien pour l\'instant.';
    if (fil === 'telephone') {
      if (s.flags.ligne === 'coupee') return 'La ligne est coupée.';
      if (s.flags.ligne === 'fermee') return s.cycle < 3 ? 'Il ne sonne pas. Pas encore.' : 'Silence.';
    }
    if (fil === 'passe' && s.flags.fil5Ferme) return 'Tu as donné le mot de 16. Ce fil est fermé.';
    return 'Rien à faire ici pour l\'instant.';
  }

  // ---------- actions ----------
  function choose(state, action) {
    var s = clone(state), ev = [];
    if (s.fin) throw new Error('La partie est terminée.');
    var fid = forcedId(s), forced = fid ? BY_ID[fid] : null;
    s.stats.actions++;

    if (action.type === 'situation') {
      var x = BY_ID[action.id], c = action.choix;
      if (!x) throw new Error('Situation inconnue : ' + action.id);
      if (c !== 'A' && c !== 'B') throw new Error('Choix invalide : ' + c);
      if (forced ? x.id !== fid : !available(s, x)) throw new Error('Situation indisponible : ' + x.id);
      var g = ctx(s, ev, x.fil);
      if (x[c].req && !x[c].req(g)) throw new Error('Choix impossible : ' + x.id + ' ' + c);
      ev.push({ t: 'choix', id: x.id, choix: c, label: x[c].label });
      s.done[x.id] = c;
      x[c].fx(g);
      // Micro-réaction du Système après une exploration vue par la caméra.
      if (!s.fin && !forced && x.fil !== 'telephone' && !cameraAveugle(s) && s.cycle >= 4 && g.hasard() < 0.25) g.ecran(g.pick(S.PHRASES.apresExploration));
    } else if (action.type === 'appuyer') {
      if (forced && !forced.ordre) throw new Error('Impossible d\'appuyer pendant un appel.');
      if (forced) return choose(state, { type: 'situation', id: fid, choix: 'A' });
      var gp = ctx(s, ev, 'bouton');
      ev.push({ t: 'choix', id: null, label: 'Appuyer sur le bouton' });
      if (gp.press(true)) { gp.conformite(1); gp.ecran(gp.hasard() < 0.4 ? 'MERCI.' : gp.pick(S.PHRASES.apresPression)); }
    } else if (action.type === 'sortir') {
      var gs = ctx(s, ev, null);
      if (action.via === 'porte' && porteOuverte(s)) {
        var k = s.flags.porte.kind;
        ev.push({ t: 'choix', id: null, label: 'Sortir par la porte' });
        gs.fin(k === 'h3' ? 'seulDehors' : (s.vie > 0 ? 'marche' : 'conforme'));
      } else if (action.via === 'trappe' && has(s, 'sortieCachee')) {
        ev.push({ t: 'choix', id: null, label: 'Fuir par la trappe' });
        gs.fin('porteDerobee');
      } else throw new Error('Sortie impossible : ' + action.via);
    } else if (action.type === 'temps') {
      // Temps écoulé : pendant un ordre, ne rien faire = refuser ; un appel sans réponse = laisser sonner ;
      // pendant un moment libre (plus utilisé par l'interface : pas de chrono), le bouton s'enfonce tout seul.
      if (forced && (forced.ordre || fid === 'T1')) {
        var gf = ctx(s, ev, forced.fil);
        if (forced.ordre) gf.narr('Tu n\'as pas appuyé.');
        s.done[fid] = 'B';
        forced.B.fx(gf);
      } else if (fid === 'T4') {
        s.done.T4 = 'auto';
        ctx(s, ev, null).narr('Le téléphone finit par se taire.');
      } else {
        var gt = ctx(s, ev, 'bouton');
        gt.narr('Trop tard. Le bouton s\'enfonce tout seul.');
        gt.press(false); gt.conformite(1);
      }
    } else throw new Error('Action inconnue : ' + action.type);

    checkEnds(s, ev);
    if (!s.fin) advance(s, ev);
    return { state: s, events: ev };
  }

  // Fins qui se déclenchent dès que l'état les remplit.
  function checkEnds(s, ev) {
    if (s.fin) return;
    var g = ctx(s, ev, null);
    if (s.soupcon >= 4) g.fin('isolement');
    else if (s.vie === 0 && has(s, 'objectif')) g.fin('tropTard');
    else if (has(s, 'plan') && cameraAveugle(s) && s.vie > 0) { g.narr('Un déclic. Puis un autre, dans la pièce d\'à côté.'); g.fin('cooperation'); }
  }

  function advance(s, ev) {
    s.cycle++;
    enterCycle(s, ev);
  }

  function chronoTexts(s, ev, c) {
    var t = S.CHRONO[c]; if (!t) return;
    if (t.narr) ev.push({ t: 'narr', txt: t.narr });
    if (t.voix) ev.push({ t: 'voix', txt: t.voix });
    if (t.apres) ev.push({ t: 'narr', txt: t.apres });
    (t.ecran || []).forEach(function (l) { ev.push({ t: 'ecran', txt: l }); });
  }

  // Début d'un moment libre : une phrase du Système (mémoire, soupçon, conformité, ambiance…) et parfois la 18.
  function ambiance(s, g) {
    var P = S.PHRASES, dit = false;
    for (var i = 0; i < S.MEMOIRE.length && !dit; i++) {
      var m = S.MEMOIRE[i];
      if (!s.flags.memoire[m.id] && m.quand(g)) { s.flags.memoire[m.id] = 1; m.lignes.forEach(function (l) { g.ecran(l); }); dit = true; }
    }
    if (!dit && s.soupcon !== s.flags.soupconDit) { s.flags.soupconDit = s.soupcon; g.ecran(g.pick(P.soupcon[Math.min(3, s.soupcon)])); dit = true; }
    if (!dit && s.conformite >= 4 && g.hasard() < 0.4) { g.ecran(g.pick(P.conformite)); dit = true; }
    if (!dit && g.hasard() < 0.04) {
      if (g.hasard() < 0.5) { var b = g.pick(P.fauxBugs); g.ecran(b[0]); g.ecran(b[1]); } else g.ecran(g.pick(P.rares));
      dit = true;
    }
    if (!dit && g.hasard() < 0.12) { g.ecran(g.pick(P.douteSysteme)); dit = true; }
    if (!dit && g.hasard() < 0.6) g.ecran(g.pick(P.ambiance));
    if (s.vie > 0 && g.hasard() < 0.4) {
      var r = g.hasard(), l;
      if (s.vie < 3 && r < 0.5) l = g.pick(P.vie18[s.vie]);
      else if (s.confiance >= 3 && r < 0.7) l = g.pick(P.confianceHaute);
      else if (s.confiance === 0 && s.stats.suivis >= 2 && r < 0.7) l = g.pick(P.confianceBasse);
      else if (r > 0.9) l = g.pick(P.doute18);
      else l = g.pick(P.voix18);
      g.voix(l);
    }
  }

  function enterCycle(s, ev) {
    var c = s.cycle, g = ctx(s, ev, null);
    ev.push({ t: 'cycle', n: c });
    if (c >= DERNIER_CYCLE) { verdict(s, ev); return; }
    if (s.flags.porte && c > s.flags.porte.until) { s.flags.porte = null; ev.push({ t: 'porte', open: false }); g.narr('Ta porte se referme.'); }
    if (s.flags.maskedUntil != null && c === s.flags.maskedUntil + 1 && !has(s, 'cameraCoupee')) g.narr('La veste glisse. La caméra voit à nouveau.');
    chronoTexts(s, ev, c);
    if (s.flags.panneAt === c) { g.ecran('PANNE CAMÉRA|DÉTECTÉE.'); g.soupcon(1, true); }
    if (s.flags.noirCycle === c) g.narr('Noir complet. Tu ne vois plus rien de la pièce.');
    if (c === 10) inspection(s, g);
    if (s.flags.compte && c >= 18) {
      if (c === 18) { g.ecran('Vous avez refusé ' + s.stats.refus + ' instruction' + (s.stats.refus > 1 ? 's' : '') + '.'); g.ecran('Vous avez appuyé ' + (s.stats.presses + s.stats.auto) + ' fois.'); }
      g.ecran(g.pick(S.PHRASES.compteFinal.slice(1, -1)));
      if (c === 19) g.ecran('Choisissez.');
    }
    checkEnds(s, ev);
    if (s.fin) return;
    var fidA = forcedId(s, c);
    if (s.flags.awayCycle !== c) {
      if (fidA && BY_ID[fidA].annonce) BY_ID[fidA].annonce(ctx(s, ev, BY_ID[fidA].fil));
      else if (!fidA && c > 1 && !(s.flags.compte && c >= 18)) ambiance(s, g);
    }
    if (s.flags.awayCycle === c) {
      var fid = forcedId(s, c);
      if (fid === 'T1') g.ignorerAppel();
      else if (fid === 'T4') { s.done.T4 = 'auto'; g.narr('Là-haut, le téléphone sonne dans le vide.'); }
      else if (fid) { s.done[fid] = 'auto'; g.narr('Là-haut, le bouton s\'enfonce tout seul.'); g.press(false); g.conformite(1); }
      g.gain('badge'); g.gain('enregistrement');
      g.narr('Dans le sous-sol : un badge au nom de 16, et une cassette. Tu remontes.');
      checkEnds(s, ev);
      if (!s.fin) advance(s, ev);
    }
  }

  function inspection(s, g) {
    g.ecran(g.pick(S.PHRASES.inspection));
    if (s.soupcon < 2) { g.narr('Il jette un œil autour de lui. Il regarde la vitre de la 18, puis toi. Il repart.'); return; }
    if (s.flags.gravuresEffacees) { g.narr('Il fouille sous le bureau.'); g.ecran('Aucun élément inhabituel détecté.'); return; }
    var k = null;
    for (var i = s.found.length - 1; i >= 0; i--) {
      var it = s.found[i];
      if (S.CONFISCABLES.indexOf(it) >= 0 && has(s, it) && !(it === 'badge' && s.flags.badgeCache)) { k = it; break; }
    }
    if (k) { g.lose(k); g.ecran('OBJET NON|AUTORISÉ.'); g.narr('Il fouille la pièce et confisque : ' + S.OBJETS[k].toLowerCase() + '. Avant de partir, il regarde la vitre de la 18, puis toi.'); }
    else g.narr('Il fouille la pièce. Rien. Avant de partir, il regarde la vitre de la 18, puis toi.');
  }

  function verdict(s, ev) {
    var g = ctx(s, ev, null);
    g.ecran('Évaluation terminée.');
    if (has(s, 'verite') && s.truth === 'B' && s.conformite >= 5) g.fin('employe');
    else if (s.vie === 0) g.fin('conforme');
    else g.fin('tempsEcoule');
  }

  var api = {
    newGame: newGame, intro: intro, turn: turn, choose: choose, regarder: regarder, AIDES: S.AIDES, DESCRIPTIONS: S.DESCRIPTIONS, PHRASES: S.PHRASES,
    forcedId: forcedId, cameraAveugle: cameraAveugle, porteOuverte: porteOuverte, has: has,
    DUREES: DUREES, DERNIER_CYCLE: DERNIER_CYCLE,
    FILS: S.FILS, OBJETS: S.OBJETS, FINS: S.FINS, VERITES: S.VERITES,
    SITUATION_IDS: S.SITUATIONS.map(function (x) { return x.id; }),
    FIN_IDS: Object.keys(S.FINS)
  };
  if (typeof module === 'object' && module.exports) module.exports = api; else root.BREngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
