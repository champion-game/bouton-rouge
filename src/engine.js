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
      items: [], found: [], done: {}, flags: { ligne: 'fermee', t1Ignore: 0, memoire: {}, soupconDit: 0, aux: 'ok', doutes: 0 }, fin: null,
      stats: { presses: 0, auto: 0, suivis: 0, refus: 0, blessures: 0, actions: 0 }
    };
    return s;
  }

  // Événements du début de partie (cycle 1).
  function intro(s) {
    var ev = [];
    S.INTRO.forEach(function (e) { ev.push(e[0] === 'anim' ? { t: 'anim', n: e[1] } : { t: e[0], txt: e[1] }); });
    return ev;
  }
  function tirer(s) { // mulberry32, l'état est gardé dans la partie
    s.rng = (s.rng + 0x6D2B79F5) >>> 0; var t = s.rng;
    t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // ---------- état dérivé ----------
  function has(s, k) { return s.items.indexOf(k) >= 0; }
  function cameraAveugle(s) { return has(s, 'cameraCoupee') || has(s, 'cameraTournee') || (s.flags.maskedUntil != null && s.cycle <= s.flags.maskedUntil); }
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
        if (s.flags.cacheVide && S.CONFISCABLES.indexOf(k) >= 0) { s.flags.cacheVide = false; s.flags.cache = k; g.narr('Tu glisses l\'objet sous la plaque desserrée : ' + S.OBJETS[k].toLowerCase() + '.'); }
        var r = S.REPLIQUES_OBJETS[k];
        if (r && first) { if (r.voix) g.voix(r.voix); if (!cameraAveugle(s)) r.sys.forEach(function (l) { g.ecran(l); }); }
      },
      hasard: function () { return tirer(s); },
      pick: function (list) { return list[Math.floor(tirer(s) * list.length)]; },
      voix: function (txt) { ev.push({ t: 'voix', txt: txt }); },
      anim: function (n) { ev.push({ t: 'anim', n: n }); },
      aveugle: function () { return cameraAveugle(s); },
      // H2 B : cache sous la plaque. Elle protège le dernier objet confiscable, ou le prochain obtenu.
      cacher: function () {
        for (var i = s.found.length - 1; i >= 0; i--) {
          var k = s.found[i];
          if (S.CONFISCABLES.indexOf(k) >= 0 && has(s, k)) { s.flags.cache = k; g.narr('Tu y caches : ' + S.OBJETS[k].toLowerCase() + '. L\'inspection ne le trouvera pas.'); return; }
        }
        s.flags.cacheVide = true; g.narr('La cache est vide pour l\'instant. Le prochain objet que tu trouveras y ira.');
      },
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
        if (s.flags.t1Ignore >= 2 && s.flags.ligne === 'fermee') { s.flags.ligne = 'coupee'; g.ecran('LIGNE 17|BLOQUÉE PAR|LE SYSTÈME.'); }
        else g.narr('APPEL MANQUÉ — CH.18');
      },
      ouvrirPorte: function (kind, until) { s.flags.porte = { kind: kind, until: until }; s.flags.porteVue = true; ev.push({ t: 'porte', open: true }); },
      // Vérité C révélée : Briser la boucle (bouton désactivé + badge) ou le Miroir.
      verdictMiroir: function () { g.fin(has(s, 'boutonDesactive') && has(s, 'badge') ? 'boucle' : 'miroir'); }
    };
    return g;
  }

  function resolve(v, g) { return typeof v === 'function' ? v(g) : v; }

  function available(s, x) {
    if (x.ordre || x.appel) return false;
    return !!x.quand(ctx(s, [], x.fil));
  }

  function describe(s, x) {
    var g = ctx(s, [], x.fil);
    function opt(c) { var o = x[c]; if (!o) return null; var ok = !o.req || !!o.req(g); return { label: o.label, sous: o.sous || '', ok: ok, raison: ok ? '' : (o.raison || '') }; }
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
      if ((c !== 'A' && c !== 'B') || !x[c]) throw new Error('Choix invalide : ' + c);
      if (forced ? x.id !== fid : !available(s, x)) throw new Error('Situation indisponible : ' + x.id);
      var g = ctx(s, ev, x.fil);
      if (x[c].req && !x[c].req(g)) throw new Error('Choix impossible : ' + x.id + ' ' + c);
      ev.push({ t: 'choix', id: x.id, choix: c, label: x[c].label });
      s.done[x.id] = c;
      x[c].fx(g);
      // Prendre un objet ne fait pas avancer le temps.
      if (x.gratuit) { s.stats.actions--; checkEnds(s, ev); return { state: s, events: ev }; }
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
        gs.fin(k === 'h3' ? 'evasion' : (s.vie > 0 ? 'marche' : 'conforme'));
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
    if (s.soupcon >= 4) { g.son('alarm'); g.ecran('Sujet 17.'); g.ecran('Vous avez été averti.'); g.fin('isolement'); }
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
    (t.ecran2 || []).forEach(function (l) { ev.push({ t: 'ecran', txt: l }); });
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
    var seize = has(s, 'mot16') || s.done.APP16;
    if (!dit && seize && g.hasard() < 0.15) { g.ecran(P.ambiance16[0]); dit = true; }
    if (!dit && g.hasard() < 0.1) { g.ecran(g.pick(P.douteSysteme)); dit = true; }
    if (!dit && g.hasard() < 0.55) g.ecran(g.pick(P.ambiance));
    // La 18 : à travers la vitre selon sa vie ; au téléphone si la ligne est ouverte.
    if (s.vie <= 0) return;
    var ligne = s.flags.ligne === 'ouverte';
    var d = S.DOUTES[s.flags.doutes];
    if (ligne && d && d.quand(g) && g.hasard() < 0.25) { s.flags.doutes++; d.ev.forEach(function (e) { e[0] === 'voix' ? g.voix(e[1]) : g.ecran(e[1]); }); return; }
    if (g.hasard() < 0.4) {
      var r = g.hasard(), l = null;
      if (s.vie < 3 && r < 0.5) l = g.pick(P.vie18[s.vie]);
      else if (ligne && s.confiance >= 3 && r < 0.7) l = g.pick(P.confianceHaute);
      else if (ligne && s.confiance === 0 && s.stats.suivis >= 2 && r < 0.7) l = g.pick(P.confianceBasse);
      else if (ligne) l = g.pick(P.voix18);
      else if (s.vie === 3 && r < 0.3) l = g.pick(P.vie18[3]);
      if (l) g.voix(l);
    }
  }

  function enterCycle(s, ev) {
    var c = s.cycle, g = ctx(s, ev, null);
    ev.push({ t: 'cycle', n: c });
    if (c >= DERNIER_CYCLE) { verdict(s, ev); return; }
    if (s.flags.porte && c > s.flags.porte.until) { s.flags.porte = null; ev.push({ t: 'porte', open: false }); g.narr('Ta porte se referme.'); }
    if (s.flags.maskedUntil != null && c === s.flags.maskedUntil + 1 && !has(s, 'cameraCoupee') && !has(s, 'cameraTournee')) g.narr('Un petit bras mécanique retire ta veste. La caméra revient.');
    if (c === 6) g.ecran('AUTOTEST|ALIMENTATION|IMMINENT.');
    chronoTexts(s, ev, c);
    if (c === 7) {
      // Retour du courant : le bus auxiliaire reste en défaut (fusible de protection ouvert).
      g.narr('CLAC. Les lumières reviennent. Mais un bip persiste, sur le boîtier électrique.');
      g.ecran('AUX 24 V —|DÉFAUT.'); g.ecran('FUSIBLE DE|PROTECTION|OUVERT.');
      s.flags.aux = 'defaut';
      if (has(s, 'fusible')) g.narr('Ton fusible porte la même étiquette : AUX 24 V. Pièce compatible.');
    }
    if (s.flags.panneAt === c) { g.ecran('PANNE CAMÉRA|DÉTECTÉE.'); g.soupcon(1, true); }
    if (s.flags.t5Echec === c) { g.narr('Un bruit violent derrière la vitre. Elle a essayé seule.'); g.blesser(1); }
    if (c === 10) inspection(s, g);
    if (s.flags.compte && c >= 18) {
      var lignes = [];
      S.HISTORIQUE.forEach(function (h) { if (h.quand(g)) lignes.push(resolve(h.lignes, g)); });
      var part = c === 18 ? lignes.slice(0, 2) : lignes.slice(2, 4);
      part.forEach(function (ls) { ls.forEach(function (l) { g.ecran(l); }); });
      g.ecran(c === 18 ? 'Nous allons évaluer l\'ensemble de vos décisions.' : 'IL RESTE UNE|DÉCISION.');
    }
    checkEnds(s, ev);
    if (s.fin) return;
    var fidA = forcedId(s, c);
    if (s.flags.awayCycle !== c) {
      if (fidA && BY_ID[fidA].annonce) BY_ID[fidA].annonce(ctx(s, ev, BY_ID[fidA].fil));
      else if (!fidA && c > 1 && c !== 6 && !(s.flags.compte && c >= 18)) ambiance(s, g);
    }
    if (s.flags.awayCycle === c) {
      // Deuxième cycle au sous-sol : ce qui arrive là-haut suit les règles normales.
      if (fidA === 'T1') g.ignorerAppel();
      else if (fidA === 'T4') { s.done.T4 = 'auto'; g.narr('Là-haut, le téléphone sonne dans le vide.'); }
      else if (fidA) { var o = BY_ID[fidA]; s.done[fidA] = 'B'; g.narr('Là-haut, un ordre reste sans réponse.'); o.B.fx(ctx(s, ev, o.fil)); }
      g.narr('Le sous-sol : rayonnages, anciens dossiers, terminaux éteints. Des photos. « SUJET 03 — NON COOPÉRATIF ». « SUJET 16 — ARCHIVÉ ». « SUJET 17 — EN COURS ».');
      g.gain('badge'); g.gain('enregistrement');
      g.narr('Tu remontes avec un badge et un enregistrement.');
      checkEnds(s, ev);
      if (!s.fin) advance(s, ev);
    }
  }

  function inspection(s, g) {
    g.ecran(g.pick(S.PHRASES.inspection));
    if (s.soupcon < 2) { g.narr('Il regarde la vitre de la 18, puis toi. Il repart.'); return; }
    var k = null;
    for (var i = s.found.length - 1; i >= 0; i--) {
      var it = s.found[i];
      if (S.CONFISCABLES.indexOf(it) >= 0 && has(s, it) && s.flags.cache !== it) { k = it; break; }
    }
    if (k) { g.lose(k); g.ecran('OBJET NON AUTORISÉ|CONFISQUÉ.'); g.narr('Il confisque : ' + S.OBJETS[k].toLowerCase() + '.' + (s.flags.cache && has(s, s.flags.cache) ? ' Il ne voit pas la plaque desserrée.' : '')); }
    else g.narr('Il fouille. Rien. Il repart.');
  }

  // Cycle 20 : le verdict, si le joueur n'est pas sorti.
  function verdict(s, ev) {
    var g = ctx(s, ev, null);
    g.ecran('Évaluation terminée.');
    if (has(s, 'objectif') && s.vie === 0) g.fin('tropTard');
    else if (has(s, 'verite') && s.truth === 'B' && s.conformite >= 5) g.fin('employe');
    else if (s.vie === 0 && s.conformite >= 3) g.fin('conforme');
    else g.fin('tempsEcoule');
  }

  // Description d'un objet des poches (peut dépendre de l'état).
  function decrire(s, k) { return resolve(S.DESCRIPTIONS[k], ctx(s, [], null)) || ''; }

  var api = {
    LETTRES: S.LETTRES, newGame: newGame, intro: intro, turn: turn, choose: choose, regarder: regarder, decrire: decrire, AIDES: S.AIDES, DESCRIPTIONS: S.DESCRIPTIONS, PHRASES: S.PHRASES,
    forcedId: forcedId, cameraAveugle: cameraAveugle, porteOuverte: porteOuverte, has: has,
    DUREES: DUREES, DERNIER_CYCLE: DERNIER_CYCLE,
    FILS: S.FILS, OBJETS: S.OBJETS, FINS: S.FINS, VERITES: S.VERITES,
    SITUATION_IDS: S.SITUATIONS.map(function (x) { return x.id; }),
    FIN_IDS: Object.keys(S.FINS)
  };
  if (typeof module === 'object' && module.exports) module.exports = api; else root.BREngine = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
