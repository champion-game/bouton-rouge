#!/usr/bin/env node
/* Tests du moteur : joue des milliers de parties au hasard et vérifie
   - aucune erreur ;
   - chaque partie finit avant ou au cycle 20 ;
   - les jauges restent dans leurs plages ;
   - chacune des 18 fins (+ bonus Curiosité) est atteinte ;
   - chacune des situations est jouée au moins une fois.
   Usage : node tools/test-engine.js [nombre de parties] */
'use strict';
var E = require('../src/engine.js');

var N = +process.argv[2] || 30000;
var fins = {}, sits = {}, errors = 0, maxCycle = 0;
E.FIN_IDS.forEach(function (k) { fins[k] = 0; });
E.SITUATION_IDS.forEach(function (k) { sits[k] = 0; });

function rnd(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

// Les actions possibles pendant un tour, avec un poids (les sorties et le temps écoulé sont plus rares,
// pour que les parties au hasard aillent assez loin).
function actions(t, r) {
  var list = [];
  function sit(x) { ['A', 'B'].forEach(function (c) { if (x[c] && x[c].ok) list.push({ w: 1, a: { type: 'situation', id: x.id, choix: c } }); }); }
  if (t.forced) sit(t.forced);
  t.fils.forEach(function (f) { f.situations.forEach(function (x) { if (!t.forced || r() < 0.3) sit(x); }); }); // pendant un ordre, faire autre chose reste possible
  if (t.peutAppuyer && !t.forced) list.push({ w: 0.15, a: { type: 'appuyer' } });
  t.sorties.forEach(function (s) { list.push({ w: 0.25, a: { type: 'sortir', via: s.via } }); });
  if (t.forced) list.push({ w: 0.3, a: { type: 'temps' } }); // pas de chrono pendant les moments libres
  return list;
}
function pick(list, r) {
  var tot = list.reduce(function (s, x) { return s + x.w; }, 0), v = r() * tot;
  for (var i = 0; i < list.length; i++) { v -= list[i].w; if (v <= 0) return list[i].a; }
  return list[list.length - 1].a;
}

for (var i = 0; i < N; i++) {
  var r = rnd(i * 7919 + 13), s = E.newGame({ seed: i }), steps = 0;
  try {
    E.intro(s);
    while (!s.fin) {
      if (++steps > 90) throw new Error('boucle infinie');
      var t = E.turn(s);
      var a = pick(actions(t, r), r);
      var res = E.choose(s, a);
      res.events.forEach(function (e) { if (e.t === 'choix' && e.id) sits[e.id]++; });
      s = res.state;
      if (s.vie < 0 || s.vie > 3 || s.soupcon < 0 || s.soupcon > 4 || s.confiance < 0 || s.confiance > 4 || s.conformite < 0 || s.conformite > 6) throw new Error('jauge hors plage');
      if (s.cycle > 20) throw new Error('cycle ' + s.cycle + ' dépassé');
    }
    if (!(s.fin in fins)) throw new Error('fin inconnue : ' + s.fin);
    fins[s.fin]++; maxCycle = Math.max(maxCycle, s.cycle);
  } catch (e) {
    errors++;
    if (errors <= 5) console.error('Partie ' + i + ' : ' + e.stack);
  }
}

// Parcours voulus vers les fins les plus rares au hasard : ils doivent rester possibles.
function parcours(truth, steps) {
  var st = E.newGame({ seed: 1, truth: truth }); E.intro(st);
  for (var i = 0; i < steps.length && !st.fin; i++) {
    var p = steps[i].split(' ');
    var a = p[0] === 'press' ? { type: 'appuyer' } : p[0] === 'temps' ? { type: 'temps' } : { type: 'situation', id: p[0], choix: p[1] || 'A' };
    var r = E.choose(st, a); st = r.state;
    r.events.forEach(function (e) { if (e.t === 'choix' && e.id) sits[e.id]++; });
  }
  return st.fin;
}
var routes = [
  ['boucle', 'C', ['P1 B', 'press', 'T1 A', 'C1 A', 'press', 'PRENDRE_TOURNEVIS', 'PRENDRE_FUSIBLE', 'P3 B', 'FUS', 'press', 'P4 A', 'press', 'T4 A', 'H3 B', 'B5 B', 'P2 A', 'P5 A']],
  ['cooperation', 'A', ['P1 B', 'press', 'T1 A', 'C1 A', 'press', 'PRENDRE_TOURNEVIS', 'P3 A', 'P2 B', 'temps', 'T2 B', 'T3 A', 'B4 B', 'T4 A', 'T5 A', 'temps', 'PLAN']],
  // Garder le tournevis reçu en récompense (jamais confisqué) et rejoindre la 18 sans éveiller les soupçons.
  ['complice', 'B', ['P1 B', 'press', 'T1 A', 'C1 A', 'press', 'PRENDRE_TOURNEVIS', 'P2 A', 'P5 A']]
];
var routesOk = true;
var parRoute = {};
routes.forEach(function (r) { var f; try { f = parcours(r[1], r[2]); } catch (e) { f = 'erreur : ' + e.message; } console.log((f === r[0] ? '  ok ' : '  !! ') + 'parcours ' + r[0] + ' → ' + f); if (f !== r[0]) routesOk = false; else parRoute[r[0]] = true; });

// Garde-fous G1 à G7 (docs/ETUDE_SCENARIOS.md).
function etat(truth, f) { var st = E.newGame({ seed: 3, truth: truth }); E.intro(st); if (f) f(st); return st; }
function txt(evs) { return evs.map(function (e) { return e.txt || ''; }).join(' | '); }
var gardes = [
  ['G1 tournevis forcé sous la caméra = confisqué', function () { var r = E.choose(etat('A'), { type: 'situation', id: 'P1', choix: 'A' }); return !E.has(r.state, 'tournevis') && /RÉCUPÉRÉ/.test(txt(r.events)); }],
  ['G1 tournevis forcé pendant la coupure = gardé', function () { var r = E.choose(etat('A', function (st) { st.cycle = 6; }), { type: 'situation', id: 'P1', choix: 'A' }); return E.has(r.state, 'tournevis'); }],
  ['G2 descendre sous la caméra = soupçon', function () { var r = E.choose(etat('A', function (st) { st.cycle = 9; st.items.push('trappe'); }), { type: 'situation', id: 'P4', choix: 'A' }); return r.state.soupcon >= 1; }],
  ['G3 l\'inspection revisse la grille et remet la caméra', function () { var r = E.choose(etat('A', function (st) { st.cycle = 9; st.soupcon = 2; st.items.push('conduit', 'cameraTournee'); st.done.P2 = 'A'; }), { type: 'temps' }); return !E.has(r.state, 'conduit') && !E.has(r.state, 'cameraTournee'); }],
  ['G4 18 morte et conformité faible = pièce vide', function () { var r = E.choose(etat('A', function (st) { st.cycle = 19; st.vie = 0; }), { type: 'appuyer' }); return r.state.fin === 'tempsEcoule' && r.state.flags.variante === 'vide'; }],
  ['G5 B6 annonce la porte ouverte', function () { var r = E.choose(etat('A', function (st) { st.cycle = 16; st.flags.porte = { kind: 'b5', until: 20 }; }), { type: 'temps' }); return /VOTRE PORTE/.test(txt(r.events)); }],
  ['G6 obéir fait baisser le soupçon', function () { var r = E.choose(etat('A', function (st) { st.cycle = 2; st.soupcon = 2; }), { type: 'appuyer' }); return r.state.soupcon === 1; }],
  ['G7 plan abandonné : elle tente seule', function () { var r = E.choose(etat('A', function (st) { st.cycle = 15; st.items.push('plan'); st.flags.planAt = 13; }), { type: 'temps' }); return /essayé seule/.test(txt(r.events)) && !E.has(r.state, 'plan'); }]
];
var gardesOk = true;
console.log('\nGarde-fous :');
gardes.forEach(function (x) { var v = false; try { v = x[1](); } catch (e) { v = false; console.error(e); } console.log((v ? '  ok ' : '  !! ') + x[0]); if (!v) gardesOk = false; });

var ok = errors === 0 && routesOk && gardesOk;
console.log(N + ' parties, ' + errors + ' erreur(s), cycle maximum atteint : ' + maxCycle);
console.log('\nFins :');
Object.keys(fins).sort(function (a, b) { return E.FINS[a].n - E.FINS[b].n; }).forEach(function (k) {
  var F = E.FINS[k];
  // Une fin rare au hasard compte comme atteinte si son parcours voulu fonctionne.
  var atteinte = fins[k] || parRoute[k];
  console.log((atteinte ? '  ok ' : '  !! ') + (F.bonus ? 'bonus' : String(F.n).padStart(5)) + '  ' + F.titre.padEnd(24) + fins[k] + (!fins[k] && parRoute[k] ? ' (par parcours)' : ''));
  if (!atteinte) ok = false;
});
var missing = Object.keys(sits).filter(function (k) { return !sits[k]; });
console.log('\nSituations jouées : ' + (E.SITUATION_IDS.length - missing.length) + ' / ' + E.SITUATION_IDS.length + (missing.length ? ' — jamais : ' + missing.join(', ') : ''));
if (missing.length) ok = false;
if (maxCycle > 20) ok = false;
console.log(ok ? '\nTOUT EST BON.' : '\nÉCHEC.');
process.exit(ok ? 0 : 1);
