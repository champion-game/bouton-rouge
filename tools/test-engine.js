#!/usr/bin/env node
/* Tests du moteur : joue des milliers de parties au hasard et vérifie
   - aucune erreur ;
   - chaque partie finit avant ou au cycle 20 ;
   - les jauges restent dans leurs plages ;
   - chacune des 18 fins (+ bonus Curiosité) est atteinte ;
   - chacune des 23 situations est jouée au moins une fois.
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
function actions(t) {
  var list = [];
  function sit(x) { ['A', 'B'].forEach(function (c) { if (x[c] && x[c].ok) list.push({ w: 1, a: { type: 'situation', id: x.id, choix: c } }); }); }
  if (t.forced) sit(t.forced);
  else t.fils.forEach(function (f) { f.situations.forEach(sit); });
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
      var a = pick(actions(t), r);
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
    st = E.choose(st, a).state;
  }
  return st.fin;
}
var routes = [
  ['boucle', 'C', ['P1 A', 'press', 'T1 A', 'C1 A', 'press', 'PRENDRE_FUSIBLE', 'P3 B', 'FUS', 'press', 'P4 A', 'press', 'T4 A', 'H3 B', 'B5 B', 'P2 A', 'P5 A']],
  ['cooperation', 'A', ['P1 B', 'press', 'T1 A', 'C1 A', 'press', 'PRENDRE_TOURNEVIS', 'P3 A', 'P2 B', 'temps', 'T2 B', 'T3 A', 'B4 B', 'T4 A', 'T5 A', 'temps', 'PLAN']]
];
var routesOk = true;
routes.forEach(function (r) { var f; try { f = parcours(r[1], r[2]); } catch (e) { f = 'erreur : ' + e.message; } console.log((f === r[0] ? '  ok ' : '  !! ') + 'parcours ' + r[0] + ' → ' + f); if (f !== r[0]) routesOk = false; });

var ok = errors === 0 && routesOk;
console.log(N + ' parties, ' + errors + ' erreur(s), cycle maximum atteint : ' + maxCycle);
console.log('\nFins :');
Object.keys(fins).sort(function (a, b) { return E.FINS[a].n - E.FINS[b].n; }).forEach(function (k) {
  var F = E.FINS[k];
  console.log((fins[k] ? '  ok ' : '  !! ') + (F.bonus ? 'bonus' : String(F.n).padStart(5)) + '  ' + F.titre.padEnd(24) + fins[k]);
  if (!fins[k]) ok = false;
});
var missing = Object.keys(sits).filter(function (k) { return !sits[k]; });
console.log('\nSituations jouées : ' + (E.SITUATION_IDS.length - missing.length) + ' / ' + E.SITUATION_IDS.length + (missing.length ? ' — jamais : ' + missing.join(', ') : ''));
if (missing.length) ok = false;
if (maxCycle > 20) ok = false;
console.log(ok ? '\nTOUT EST BON.' : '\nÉCHEC.');
process.exit(ok ? 0 : 1);
