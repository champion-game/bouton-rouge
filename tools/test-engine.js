#!/usr/bin/env node
/* Tests du moteur (V5). Rapides par défaut (demande d'Amine : pas de tests interminables).
   - parties au hasard : aucune erreur, aucune partie au-delà du moment 20, jauges dans leurs plages ;
   - un parcours voulu vers chacune des 18 fins + Curiosité ;
   - les tests d'acceptation de docs/DIRECTIVES_REV2.txt §16 qui concernent le moteur.
   Usage : node tools/test-engine.js [nombre de parties au hasard, 2000 par défaut] */
'use strict';
var E = require('../src/engine.js');
var N = +process.argv[2] || 2000;
var ok = true, fins = {}, errors = 0, sits = {};
E.FIN_IDS.forEach(function (k) { fins[k] = 0; });
E.SITUATION_IDS.forEach(function (k) { sits[k] = 0; });
function rnd(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function note(r) { r.events.forEach(function (e) { if (e.t === 'choix' && e.id) sits[e.id]++; }); }

// ---------- parties au hasard ----------
function actions(t, r) {
  var l = [];
  Object.keys(t.objets).forEach(function (o) { t.objets[o].forEach(function (x) { ['A', 'B', 'C'].forEach(function (c) { if (x[c] && x[c].ok && (!t.forced || x.id === t.forced.id || x.gratuit || r() < 0.2)) l.push({ type: 'situation', id: x.id, choix: c }); }); }); });
  if (t.forced && t.forced.impose && !t.forced.objet) ['A', 'B', 'C'].forEach(function (c) { if (t.forced[c] && t.forced[c].ok) l.push({ type: 'situation', id: t.forced.id, choix: c }); });
  if (t.peutAppuyer && (t.forcedKind === 'ordre' || r() < 0.15)) l.push({ type: 'appuyer' });
  if (t.forcedKind === 'ordre' || t.forcedKind === 'appel') l.push({ type: 'temps' });
  if (t.peutAttendre && (r() < 0.3 || !l.length)) l.push({ type: 'attendre' });
  t.sorties.forEach(function (x) { if (r() < 0.3) l.push({ type: 'sortir', via: x.via }); });
  return l;
}
for (var i = 0; i < N; i++) {
  var r = rnd(i * 7919 + 13), s = E.newGame({ seed: i }), steps = 0;
  try {
    E.intro(s);
    while (!s.fin) {
      if (++steps > 200) throw new Error('boucle infinie');
      var t = E.turn(s), l = actions(t, r);
      if (!l.length) throw new Error('aucune action possible au moment ' + s.cycle);
      var res = E.choose(s, l[Math.floor(r() * l.length)]); note(res); s = res.state;
      if (s.vie < 0 || s.vie > 3 || s.soupcon < 0 || s.soupcon > 4 || s.confiance < 0 || s.confiance > 4 || s.conformite < 0 || s.conformite > 6) throw new Error('jauge hors plage');
      if (s.cycle > 20) throw new Error('moment ' + s.cycle + ' dépassé');
    }
    fins[s.fin]++;
  } catch (e) { errors++; if (errors <= 3) console.error('Partie ' + i + ' : ' + e.stack); }
}
console.log(N + ' parties au hasard, ' + errors + ' erreur(s).');
if (errors) ok = false;

// ---------- un parcours vers chaque fin ----------
function jouer(truth, steps, avant) {
  var st = E.newGame({ seed: 1, truth: truth }); E.intro(st); if (avant) avant(st);
  for (var i = 0; i < steps.length && !st.fin; i++) {
    var p = steps[i].split(' '), a;
    if (p[0] === 'press') a = { type: 'appuyer' }; else if (p[0] === 'temps') a = { type: 'temps' }; else if (p[0] === 'wait') a = { type: 'attendre' };
    else if (p[0] === 'porte' || p[0] === 'trappe') a = { type: 'sortir', via: p[0] };
    else a = { type: 'situation', id: p[0], choix: p[1] || 'A' };
    var res = E.choose(st, a); note(res); st = res.state;
  }
  return st;
}
var W = function (n) { var l = []; for (var i = 0; i < n; i++) l.push('wait'); return l; };
var ROUTES = {
  conforme: ['A', ['wait', 'press', 'T1 A', 'press', 'press', 'press', 'wait', 'wait', 'press', 'wait', 'wait', 'press', 'T4 B', 'wait', 'press', 'wait', 'wait', 'M16 A', 'wait', 'press', 'porte']],
  employe: ['B', ['wait', 'press', 'T1 A', 'press', 'press', 'press', 'wait', 'wait', 'press', 'wait', 'wait', 'press', 'T4 B', 'wait', 'press', 'wait', 'wait', 'M16 A']],
  marche: ['A', ['wait', 'temps', 'wait', 'temps', 'wait', 'wait', 'temps', 'wait', 'wait', 'temps', 'wait', 'wait', 'press', 'porte']],
  seulDehors: ['A', ['wait', 'temps', 'wait', 'press', 'temps', 'PRENDRE_TOURNEVIS', 'P2 A', 'wait', 'temps', 'P5 B', 'EXT A']],
  porteDerobee: ['A', ['wait', 'temps', 'T1 A', 'temps', 'T2 A', 'T3 A', 'temps', 'P4 B', 'trappe']],
  evasion: ['A', ['wait', 'temps', 'C1 A', 'temps', 'wait', 'C3 A', 'MALAISE A']],
  cooperation: ['A', ['wait', 'temps', 'T1 A', 'press', 'press', 'temps', 'PRENDRE_TOURNEVIS', 'PRENDRE_FUSIBLE', 'T2 A', 'T3 A', 'temps', 'FUS', 'C1 A', 'temps', 'T4 A', 'T5 A', 'temps', 'C2 A', 'PLAN']],
  sauvetage: ['A', ['wait', 'temps', 'wait', 'press', 'temps', 'PRENDRE_TOURNEVIS', 'P2 A', 'P5 A']],
  tropTard: ['A', ['wait', 'press', 'wait', 'press', 'press', 'press', 'PRENDRE_TOURNEVIS', 'P2 A', 'press', 'temps', 'P5 A']],
  complice: ['B', ['wait', 'temps', 'wait', 'press', 'temps', 'PRENDRE_TOURNEVIS', 'P2 A', 'P5 A', 'RENCONTRE_B A']],
  sujet18: ['B', ['wait', 'temps', 'wait', 'press', 'temps', 'PRENDRE_TOURNEVIS', 'P2 A', 'P5 A', 'RENCONTRE_B B']],
  miroir: ['C', ['wait', 'temps', 'wait', 'press', 'temps', 'PRENDRE_TOURNEVIS', 'P2 A', 'P5 A', 'RENCONTRE_C B']],
  boucle: ['C', ['H2 B', 'temps', 'T1 A', 'press', 'temps', 'PRENDRE_TOURNEVIS', 'T2 A', 'T3 A', 'temps', 'P4 A', 'temps', 'T4 B', 'P2 A', 'temps', 'P5 A', 'RENCONTRE_C A']],
  isolement: ['A', ['wait', 'temps', 'wait', 'press', 'temps', 'PRENDRE_TOURNEVIS', 'wait', 'P2 A', 'temps', 'P3 B', 'wait', 'temps', 'wait']],
  gardien: ['A', ['P1 A', 'temps', 'C1 A', 'temps', 'wait', 'C2 A', 'temps', 'wait', 'wait', 'temps', 'C3 A', 'MALAISE A']],
  temoin: ['A', ['wait', 'temps', 'C1 B', 'press', 'press', 'press', 'PRENDRE_TOURNEVIS', 'PRENDRE_FUSIBLE', 'wait', 'FUS', 'temps', 'C3 B', 'porte']],
  revolte: ['A', ['wait', 'temps', 'T1 A', 'press', 'press', 'temps', 'PRENDRE_TOURNEVIS', 'PRENDRE_FUSIBLE', 'T2 A', 'T3 A', 'temps', 'FUS', 'C1 A', 'temps', 'T4 B', 'C2 A', 'temps', 'P4 A', 'M16 B', 'DIFFUSER']],
  tempsEcoule: ['A', ['wait', 'temps', 'wait', 'temps', 'wait', 'wait', 'temps', 'wait', 'wait', 'temps', 'wait', 'wait', 'temps', 'wait', 'wait', 'M16 B', 'wait', 'temps', 'wait']],
  curiosite: ['A', ['wait', 'temps', 'wait', 'temps', 'wait', 'wait', 'temps', 'wait', 'wait', 'temps', 'wait', 'wait', 'temps', 'wait', 'wait', 'M16 B', 'wait', 'press', 'press']]
};
console.log('\nUn parcours par fin :');
E.FIN_IDS.forEach(function (k) {
  var R = ROUTES[k], f;
  try { f = R ? jouer(R[0], R[1]).fin : 'aucun parcours'; } catch (e) { f = 'erreur : ' + e.message; }
  if (f === k) fins[k]++;
  console.log((f === k ? '  ok ' : '  !! ') + E.FINS[k].titre.padEnd(26) + (f === k ? '' : '→ ' + f));
  if (f !== k) ok = false;
});

// ---------- tests d'acceptation (DIRECTIVES §16) ----------
function etat(truth, f) { var st = E.newGame({ seed: 3, truth: truth }); E.intro(st); if (f) f(st); return st; }
function txt(evs) { return evs.map(function (e) { return e.txt || ''; }).join(' | '); }
var T = [
  ['01 Lire une page ne fait pas avancer le temps', function () { var st = etat('A', function (s) { s.cycle = 3; }); var r = E.choose(st, { type: 'situation', id: 'PAGE1', choix: 'A' }); return r.state.cycle === 3; }],
  ['02 Laisser expirer un ordre n\'appuie jamais', function () { var r = E.choose(etat('A', function (s) { s.cycle = 2; }), { type: 'temps' }); return r.state.stats.presses === 0 && r.state.vie === 3; }],
  ['04 B2 arrêté après une pression garde la récompense', function () { var st = etat('A', function (s) { s.cycle = 4; }); st = E.choose(st, { type: 'appuyer' }).state; var r = E.choose(st, { type: 'temps' }); return r.state.flags.tournevisDispo && r.state.cycle === 5; }],
  ['05 La victime reste sauvable après B1 et B2 complets', function () { var st = jouer('A', ['wait', 'press', 'wait', 'press', 'press', 'press']); return !E.horsDeCombat(st) && st.vie === 1; }],
  ['06 Couvrir la caméra n\'efface pas un défaut électrique', function () { var st = etat('A', function (s) { s.cycle = 8; s.items.push('tournevis', 'angleMort'); s.done.C1 = 'A'; }); st = E.choose(st, { type: 'situation', id: 'P3', choix: 'A' }).state; return st.incidents.defautCamera === 1; }],
  ['07 Un incident ne compte qu\'une fois', function () { var st = etat('A', function (s) { s.cycle = 8; s.done.C1 = 'A'; }); st = E.choose(st, { type: 'situation', id: 'C2', choix: 'A' }).state; var a = st.soupcon; st.cycle = 14; st.flags.vesteJusqua = null; st = E.choose(st, { type: 'situation', id: 'C2', choix: 'A' }).state; return st.soupcon === a; }],
  ['08 Obéir n\'efface pas un soupçon technique', function () { var st = etat('A', function (s) { s.cycle = 2; s.soupcon = 2; }); return E.choose(st, { type: 'appuyer' }).state.soupcon === 2; }],
  ['09 Le soupçon maximal annonce la dernière fenêtre', function () { var st = etat('A', function (s) { s.cycle = 8; s.soupcon = 3; s.done.C1 = 'A'; }); var r = E.choose(st, { type: 'situation', id: 'C2', choix: 'A' }); return /INTERVENTION/.test(txt(r.events)) && !r.state.fin; }],
  ['11 L\'opérateur sans preuve n\'ouvre pas la porte', function () { var st = etat('A', function (s) { s.cycle = 8; s.items.push('operateur'); s.flags.ligne = 'ouverte'; s.flags.fusibleInstalle = true; }); var r = E.choose(st, { type: 'situation', id: 'APP00', choix: 'A' }); return !E.porteOuverte(r.state); }],
  ['14 B6 avec la porte ouverte ne donne pas Curiosité', function () { var st = etat('A', function (s) { s.cycle = 18; s.flags.porte = { kind: 'h3', until: 19 }; }); return E.choose(st, { type: 'appuyer' }).state.fin !== 'curiosite'; }],
  ['15 Une fin acquise n\'est jamais remplacée au verdict', function () { var st = jouer('A', ROUTES.evasion[1]); return st.fin === 'evasion'; }],
  ['16 En vérité C, aucun papier ne revient du conduit', function () { var st = etat('C', function (s) { s.cycle = 8; }); var r = E.choose(st, { type: 'situation', id: 'P2', choix: 'B' }); return !r.events.some(function (e) { return e.t === 'papier'; }); }],
  ['17 Recharger conserve tout (état sérialisable)', function () { var st = jouer('B', ['wait', 'temps', 'T1 A']); var c = JSON.parse(JSON.stringify(st)); return c.truth === 'B' && c.flags.ligne === 'ouverte'; }]
];
console.log('\nTests d\'acceptation :');
T.forEach(function (x) { var v = false; try { v = x[1](); } catch (e) { console.error(e); } console.log((v ? '  ok ' : '  !! ') + x[0]); if (!v) ok = false; });

var jamais = Object.keys(sits).filter(function (k) { return !sits[k]; });
console.log('\nSituations jouées : ' + (E.SITUATION_IDS.length - jamais.length) + ' / ' + E.SITUATION_IDS.length + (jamais.length ? ' — jamais : ' + jamais.join(', ') : ''));
if (jamais.length) ok = false;
console.log(ok ? '\nTOUT EST BON.' : '\nÉCHEC.');
process.exit(ok ? 0 : 1);
