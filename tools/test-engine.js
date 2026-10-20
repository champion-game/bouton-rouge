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
  if (t.forcedKind === 'ordre' || t.forcedKind === 'appel' || (t.duree && !t.forcedKind)) l.push({ type: 'temps' });
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
    var c0 = st.cycle, n0 = st.stats.actions, res = E.choose(st, a); note(res); st = res.state;
    // Coupure : une seule action, qui prend tout le temps du noir (le moment avance ensuite).
    if (a.type === 'situation' && c0 === 5 && st.cycle === 5 && !st.fin && st.stats.actions > n0 && !E.forcedId(st)) { res = E.choose(st, { type: 'temps' }); note(res); st = res.state; }
  }
  return st;
}
var W = function (n) { var l = []; for (var i = 0; i < n; i++) l.push('wait'); return l; };
var ROUTES = {
  conforme: ['A', ['wait', 'press', 'T1 A', 'press', 'press', 'press', 'wait', 'wait', 'press', 'wait', 'wait', 'press', 'T4 B', 'wait', 'press', 'wait', 'wait', 'M16 A', 'wait', 'press', 'porte']],
  employe: ['B', ['wait', 'press', 'T1 A', 'press', 'press', 'press', 'wait', 'wait', 'press', 'wait', 'wait', 'press', 'T4 B', 'wait', 'press', 'wait', 'wait', 'M16 A']],
  marche: ['A', ['wait', 'temps', 'wait', 'temps', 'wait', 'wait', 'temps', 'wait', 'wait', 'temps', 'wait', 'wait', 'press', 'porte']],
  seulDehors: ['A', ['wait', 'temps', 'C1 A', 'temps', 'P1 A', 'TIROIR', 'wait', 'temps', 'wait', 'wait', 'temps', 'wait', 'C2 A', 'P2 A', 'P5 B', 'EXT A']],
  porteDerobee: ['A', ['wait', 'temps', 'T1 A', 'temps', 'T2 A', 'T3 A', 'temps', 'P4 B', 'trappe']],
  evasion: ['A', ['wait', 'temps', 'C1 A', 'temps', 'wait', 'C3 A', 'MALAISE A']],
  cooperation: ['A', ['wait', 'temps', 'T1 A', 'press', 'press', 'temps', 'P1 A', 'TIROIR', 'T2 A', 'temps', 'C1 A', 'COMP_FORCER A', 'temps', 'T4 A', 'FUS', 'T5 A', 'C2 A', 'PLAN']],
  sauvetage: ['A', ['wait', 'temps', 'T1 A', 'temps', 'P1 A', 'TIROIR', 'C1 A', 'temps', 'wait', 'wait', 'temps', 'T4 A', 'C2 A', 'P2 A', 'P5 A']],
  tropTard: ['A', ['wait', 'press', 'T1 A', 'press', 'press', 'press', 'P1 A', 'TIROIR', 'C1 A', 'temps', 'wait', 'wait', 'temps', 'T4 A', 'press', 'C2 A', 'P2 A', 'P5 A']],
  complice: ['B', ['wait', 'temps', 'T1 A', 'temps', 'P1 A', 'TIROIR', 'C1 A', 'temps', 'wait', 'wait', 'temps', 'T4 A', 'C2 A', 'P2 A', 'P5 A', 'RENCONTRE_B A']],
  sujet18: ['B', ['wait', 'temps', 'T1 B', 'temps', 'P1 A', 'TIROIR', 'C1 A', 'temps', 'wait', 'wait', 'press', 'T4 A', 'C2 A', 'P2 A', 'P5 A', 'RENCONTRE_B B']],
  miroir: ['C', ['wait', 'temps', 'T1 A', 'temps', 'P1 A', 'TIROIR', 'C1 A', 'temps', 'wait', 'wait', 'temps', 'T4 A', 'C2 A', 'P2 A', 'P5 A', 'RENCONTRE_C B']],
  boucle: ['C', ['H2 A', 'temps', 'T1 A', 'press', 'press', 'press', 'P1 A', 'TIROIR', 'C1 A', 'temps', 'P4 A', 'temps', 'T4 A', 'C2 A', 'P2 A', 'P5 A', 'RENCONTRE_C A']],
  isolement: ['A', ['wait', 'temps', 'wait', 'temps', 'P1 A', 'TIROIR', 'P3 B', 'press', 'P2 A', 'wait']],
  gardien: ['A', ['H2 B', 'temps', 'C1 A', 'temps', 'wait', 'C2 A', 'temps', 'wait', 'wait', 'temps', 'C3 A', 'MALAISE A']],
  temoin: ['A', ['wait', 'temps', 'C1 B', 'press', 'press', 'press', 'P1 A', 'TIROIR', 'C2 A', 'COMP_FORCER A', 'FUS', 'C3 B', 'porte']],
  revolte: ['A', ['wait', 'temps', 'C1 A', 'press', 'press', 'press', 'P1 A', 'TIROIR', 'C2 A', 'COMP_FORCER A', 'FUS', 'wait', 'temps', 'P4 A', 'DIFFUSER']],
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
  ['04 B2 arrêté après une pression garde la récompense', function () { var st = etat('A', function (s) { s.cycle = 4; }); st = E.choose(st, { type: 'appuyer' }).state; var r = E.choose(st, { type: 'temps' }); return E.has(r.state, 'dossier') && !r.state.flags.tiroirOuvert && r.state.cycle === 5; }],
  ['04b Forcer le tiroir sous la caméra est impossible, possible pendant la coupure', function () { var st = etat('A', function (s) { s.cycle = 6; }); var vu = false; try { E.choose(st, { type: 'situation', id: 'P1', choix: 'A' }); } catch (e) { vu = true; } var st5 = etat('A', function (s) { s.cycle = 5; }); var r = E.choose(st5, { type: 'situation', id: 'P1', choix: 'A' }); return vu && E.has(r.state, 'tournevis'); }],
  ['05 La victime reste sauvable après B1 et B2 complets', function () { var st = jouer('A', ['wait', 'press', 'wait', 'press', 'press', 'press']); return !E.horsDeCombat(st) && st.vie === 1; }],
  ['06 Caméra coupée au boîtier : un gardien la rétablit trois moments plus tard', function () { var st = etat('A', function (s) { s.cycle = 6; s.items.push('tournevis'); }); st = E.choose(st, { type: 'situation', id: 'P3', choix: 'A' }).state; var a = E.has(st, 'cameraCoupee'); st = E.choose(st, { type: 'temps' }).state; st = E.choose(st, { type: 'temps' }).state; return a && st.cycle === 9 && !E.has(st, 'cameraCoupee'); }],
  ['07 Refaire une action interdite compte à nouveau', function () { var st = etat('A', function (s) { s.cycle = 8; s.done.C1 = 'A'; s.items.push('tournevis'); }); st = E.choose(st, { type: 'situation', id: 'C2', choix: 'B' }).state; var a = st.soupcon; st.cycle = 14; st.items.splice(st.items.indexOf('cameraTournee'), 1); st = E.choose(st, { type: 'situation', id: 'C2', choix: 'B' }).state; return st.soupcon === a + 1; }],
  ['08 Obéir n\'efface pas un soupçon technique', function () { var st = etat('A', function (s) { s.cycle = 2; s.soupcon = 2; }); return E.choose(st, { type: 'appuyer' }).state.soupcon === 2; }],
  ['09 Le soupçon maximal annonce la dernière fenêtre', function () { var st = etat('A', function (s) { s.cycle = 8; s.soupcon = 3; s.done.C1 = 'A'; }); var r = E.choose(st, { type: 'situation', id: 'C2', choix: 'A' }); return /INTERVENTION/.test(txt(r.events)) && !r.state.fin; }],
  ['11 L\'opérateur sans preuve n\'ouvre pas la porte', function () { var st = etat('A', function (s) { s.cycle = 8; s.items.push('operateur'); s.flags.ligne = 'ouverte'; s.flags.fusibleInstalle = true; }); var r = E.choose(st, { type: 'situation', id: 'APP00', choix: 'A' }); return !E.porteOuverte(r.state); }],
  ['14 B6 avec la porte ouverte ne donne pas Curiosité', function () { var st = etat('A', function (s) { s.cycle = 18; s.flags.porte = { kind: 'h3', until: 19 }; }); return E.choose(st, { type: 'appuyer' }).state.fin !== 'curiosite'; }],
  ['15 Une fin acquise n\'est jamais remplacée au verdict', function () { var st = jouer('A', ROUTES.evasion[1]); return st.fin === 'evasion'; }],
  ['16 En vérité C, aucun papier ne revient du conduit', function () { var st = etat('C', function (s) { s.cycle = 8; }); var r = E.choose(st, { type: 'situation', id: 'P2', choix: 'B' }); return !r.events.some(function (e) { return e.t === 'papier'; }); }],
  ['18 Entrer dans le conduit sous la caméra : un gardien attend', function () { var st = etat('A', function (s) { s.cycle = 12; s.items.push('conduit', 'objectif'); }); var r = E.choose(st, { type: 'situation', id: 'P5', choix: 'A' }); return r.state.fin === 'gardien'; }],
  ['19 Actionneur coupé sans être vu : obéir sans soupçon, défaut réparé trois moments plus tard', function () { var st = etat('A', function (s) { s.cycle = 5; s.items.push('tournevis'); }); st = E.choose(st, { type: 'situation', id: 'P3', choix: 'B' }).state; st = E.choose(st, { type: 'attendre' }).state; var r = E.choose(st, { type: 'appuyer' }); var ok1 = r.state.soupcon === 0 && r.state.vie === 3 && r.state.conformite === 1 && /DÉFAUT/.test(txt(r.events)); st = r.state; st = E.choose(st, { type: 'attendre' }).state; st = E.choose(st, { type: 'attendre' }).state; return ok1 && st.cycle === 10 && !E.has(st, 'boutonDesactive'); }],
  ['20 Tiroir laissé ouvert : le gardien fouille et prend les objets interdits', function () { var st = etat('A', function (s) { s.cycle = 5; s.done.C1 = 'A'; }); st = E.choose(st, { type: 'situation', id: 'P1', choix: 'A' }).state; st = E.choose(st, { type: 'situation', id: 'C2', choix: 'A' }).state; st = E.choose(st, { type: 'temps' }).state; st = E.choose(st, { type: 'attendre' }).state; return st.cycle === 9 && !E.has(st, 'tournevis') && st.flags.vesteConfisquee; }],
  ['21 Tiroir refermé : pas de fouille', function () { var st = etat('A', function (s) { s.cycle = 5; s.done.C1 = 'A'; }); st = E.choose(st, { type: 'situation', id: 'P1', choix: 'A' }).state; st = E.choose(st, { type: 'situation', id: 'TIROIR', choix: 'A' }).state; st = E.choose(st, { type: 'situation', id: 'C2', choix: 'A' }).state; st = E.choose(st, { type: 'temps' }).state; st = E.choose(st, { type: 'attendre' }).state; return st.cycle === 9 && E.has(st, 'tournevis'); }],
  ['22 Le gardien trouve la chambre vide : alerte', function () { var st = etat('A', function (s) { s.cycle = 6; s.done.C1 = 'A'; s.items.push('trappe'); }); st = E.choose(st, { type: 'situation', id: 'C2', choix: 'A' }).state; st.cycle = 8; st = E.choose(st, { type: 'situation', id: 'P4', choix: 'A' }).state; return st.soupcon === 4 && !!st.flags.intervention; }],
  ['17 Recharger conserve tout (état sérialisable)', function () { var st = jouer('B', ['wait', 'temps', 'T1 A']); var c = JSON.parse(JSON.stringify(st)); return c.truth === 'B' && c.flags.ligne === 'ouverte'; }]
];
console.log('\nTests d\'acceptation :');
T.forEach(function (x) { var v = false; try { v = x[1](); } catch (e) { console.error(e); } console.log((v ? '  ok ' : '  !! ') + x[0]); if (!v) ok = false; });

var jamais = Object.keys(sits).filter(function (k) { return !sits[k]; });
console.log('\nSituations jouées : ' + (E.SITUATION_IDS.length - jamais.length) + ' / ' + E.SITUATION_IDS.length + (jamais.length ? ' — jamais : ' + jamais.join(', ') : ''));
if (jamais.length) ok = false;
console.log(ok ? '\nTOUT EST BON.' : '\nÉCHEC.');
process.exit(ok ? 0 : 1);
