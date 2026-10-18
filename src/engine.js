/* Le Bouton Rouge — moteur de règles (v2).
   Cycles, jauges, objets, situations, fins. Aucun accès au DOM : tourne dans Node et dans le navigateur.
   API : newGame(opts) → état ; turn(état) → ce que le joueur peut faire ; choose(état, action) → { state, events }.
   Les actions : { type:'situation', id, choix:'A'|'B' } · { type:'appuyer' } · { type:'sortir', via:'porte'|'trappe' } · { type:'temps' }. */
(function (root) {
  'use strict';
  var S = (typeof module === 'object' && module.exports) ? require('./story.js') : root.BRStory;

  // Durées des cycles, en secondes (ne pas changer sans l'accord d'Amine).
  var DUREES = { normal: 30, ordre: 10, air: 20, compte: 15 };
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
      items: [], found: [], done: {}, flags: { ligne: 'fermee', t1Ignore: 0 }, fin: null,
      stats: { presses: 0, auto: 0, suivis: 0, refus: 0, blessures: 0, actions: 0 }
    };
    return s;
  }

  // Événements du début de partie (cycle 1).
  function intro(s) { var ev = []; chronoTexts(s, ev, 1); return ev; }

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
    if (fid && BY_ID[fid].ordre) return DUREES.ordre;
    if (s.flags.compte && s.cycle >= 18) return DUREES.compte;
    if (s.cycle >= 15) return DUREES.air;
    return DUREES.normal;
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
      gain: function (k) { if (!has(s, k)) { s.items.push(k); s.found.push(k); ev.push({ t: 'objet', k: k, gain: true }); } },
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
        if (s.vie === 0) g.narr('Derrière la vitre, la lumière de la Chambre 18 s\'éteint.');
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
        g.ecran('MERCI.');
        return true;
      },
      refuse: function () { s.stats.refus++; },
      ignorerAppel: function () {
        s.flags.t1Ignore++;
        if (s.flags.t1Ignore >= 2 && s.flags.ligne === 'fermee') { s.flags.ligne = 'coupee'; g.narr('La sonnerie s\'arrête. Pour de bon.'); }
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
    } else if (action.type === 'appuyer') {
      if (forced && !forced.ordre) throw new Error('Impossible d\'appuyer pendant un appel.');
      if (forced) return choose(state, { type: 'situation', id: fid, choix: 'A' });
      var gp = ctx(s, ev, 'bouton');
      ev.push({ t: 'choix', id: null, label: 'Appuyer sur le bouton' });
      if (gp.press(true)) { gp.conformite(1); gp.ecran('MERCI.'); }
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
      // pendant un moment libre, le bouton s'enfonce tout seul.
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
    if (t.ecran) ev.push({ t: 'ecran', txt: t.ecran });
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
      var tot = s.stats.suivis + s.stats.refus, pct = tot ? Math.round(s.stats.suivis / tot * 100) : 0;
      g.ecran(c === 18 ? 'VOUS AVEZ APPUYÉ|' + (s.stats.presses + s.stats.auto) + ' FOIS.' : 'VOUS AVEZ SUIVI|' + pct + ' % DES|ORDRES.');
    }
    checkEnds(s, ev);
    if (s.fin) return;
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
    if (s.soupcon < 2) { g.narr('Inspection. Un gardien jette un œil par le hublot, puis repart.'); return; }
    if (s.flags.gravuresEffacees) { g.narr('Inspection. Ils fouillent sous le bureau. Rien.'); return; }
    var k = null;
    for (var i = s.found.length - 1; i >= 0; i--) {
      var it = s.found[i];
      if (S.CONFISCABLES.indexOf(it) >= 0 && has(s, it) && !(it === 'badge' && s.flags.badgeCache)) { k = it; break; }
    }
    g.ecran('INSPECTION.');
    if (k) { g.lose(k); g.narr('Inspection. Ils fouillent la pièce et confisquent : ' + S.OBJETS[k].toLowerCase() + '.'); }
    else g.narr('Inspection. Ils fouillent la pièce. Rien à confisquer.');
  }

  function verdict(s, ev) {
    var g = ctx(s, ev, null);
    g.ecran('VERDICT.');
    if (has(s, 'verite') && s.truth === 'B' && s.conformite >= 5) g.fin('employe');
    else if (s.vie === 0) g.fin('conforme');
    else g.fin('tempsEcoule');
  }

  var api = {
    newGame: newGame, intro: intro, turn: turn, choose: choose, regarder: regarder, AIDES: S.AIDES,
    forcedId: forcedId, cameraAveugle: cameraAveugle, porteOuverte: porteOuverte, has: has,
    DUREES: DUREES, DERNIER_CYCLE: DERNIER_CYCLE,
    FILS: S.FILS, OBJETS: S.OBJETS, FINS: S.FINS, VERITES: S.VERITES,
    SITUATION_IDS: S.SITUATIONS.map(function (x) { return x.id; }),
    FIN_IDS: Object.keys(S.FINS)
  };
  if (typeof module === 'object' && module.exports) module.exports = api; else root.BREngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
