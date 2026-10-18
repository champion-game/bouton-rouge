/* Le Bouton Rouge — boucle de jeu, chrono, interactions avec la pièce, écrans de fin.
   Aucune règle ici : tout passe par BREngine (turn / choose / regarder).
   Le joueur agit en touchant les objets de la pièce. Aucun numéro de cycle n'est jamais affiché. */
(function () {
  'use strict';
  var E = window.BREngine, R = window.BRRoom, A = window.BRAudio;
  var $ = function (id) { return document.getElementById(id); };
  var FOUND_KEY = 'bouton-rouge-v2-fins', TUTO_KEY = 'bouton-rouge-v2-tuto';
  // Indices (connaissances) montrés dans l'inventaire de fin.
  var INDICES = ['angleMort', 'operateur', 'mensonge', 'miroir', 'objectif', 'plan', 'verite'];
  // Objets qu'on garde dans ses poches, et l'objet de la pièce auquel chacun renvoie.
  var POCHES = { tournevis: null, fusible: null, code: null, mot16: 'note', badge: 'badge', enregistrement: 'cassette' };

  var s = null, t = null, run = 0, busy = true, paused = false, sel = null, tuto = false;
  var timeLeft = 0, timeTotal = 0, lastTick = 0, lastSec = -1, skipWait = null, lastEcran = '';

  // ---------- sous-titres ----------
  function log(text, cls) {
    var box = $('log'), p = document.createElement('p');
    Array.prototype.forEach.call(box.querySelectorAll('p.new'), function (x) { x.classList.remove('new'); });
    p.className = 'new' + (cls ? ' ' + cls : ''); p.textContent = text;
    box.appendChild(p);
    while (box.children.length > 14) box.removeChild(box.firstChild);
    box.scrollTop = box.scrollHeight;
  }
  $('log').addEventListener('click', function () { if (skipWait) skipWait(); });

  function wait(ms, my) {
    return new Promise(function (res) {
      var to = setTimeout(done, ms);
      function done() { clearTimeout(to); if (skipWait === done) skipWait = null; res(my === run); }
      skipWait = done;
    });
  }
  function readTime(txt) { return Math.min(4200, 700 + txt.length * 32); }

  // ---------- lecture des événements du moteur ----------
  async function play(events, my) {
    for (var i = 0; i < events.length; i++) {
      if (my !== run) return false;
      var e = events[i];
      switch (e.t) {
        case 'choix': log('› ' + e.label, 'me'); break;
        case 'ecran': R.ecran(e.txt, { glitch: 300 }); lastEcran = e.txt; A.sfx('glitch'); log(e.txt.replace(/-\|/g, '-').replace(/\|/g, ' '), 'ecr'); await wait(900, my); break;
        case 'tel': log(e.txt, 'tel'); await wait(readTime(e.txt), my); break;
        case 'narr': log(e.txt); await wait(readTime(e.txt), my); break;
        case 'press': R.press(); A.sfx('clac'); await wait(250, my); break;
        case 'cri': R.harm(e.vie); A.sfx('cry'); await wait(700, my); break;
        case 'soupcon': if (e.d > 0) { A.sfx('blink'); log('La caméra t\'a vu.', 'ecr'); } await wait(300, my); break;
        case 'objet': if (POCHES.hasOwnProperty(e.k)) { log((e.gain ? '+ ' : '− ') + E.OBJETS[e.k], 'obj'); if (e.gain) A.sfx('paper'); await wait(500, my); } break;
        case 'porte': A.sfx(e.open ? 'lock' : 'slam'); await wait(400, my); break;
        case 'son': A.sfx(e.n); if (e.n === 'alarm') R.alarm(2600); break;
        case 'cycle': if (e.n === 6) { R.blackout(true); setTimeout(function () { R.blackout(false); }, 700); } await wait(250, my); break;
        case 'fin': break;
      }
    }
    return my === run;
  }

  // ---------- un moment de jeu ----------
  function forcedKind() { return !t || !t.forced ? null : t.forced.ordre ? 'ordre' : t.forced.id === 'T1' ? 'T1' : 'T4'; }
  function roomInfo() {
    var k = forcedKind();
    return {
      cameraAveugle: E.cameraAveugle(s), porteOuverte: E.porteOuverte(s), noir: s.cycle === 6 || s.flags.noirCycle === s.cycle,
      ordre: k === 'ordre', sonne: !busy && (k === 'T1' || (k === 'T4' && sel !== 'phone'))
    };
  }

  function startCycle(my) {
    if (my !== run) return;
    t = E.turn(s); busy = false; sel = null;
    var k = forcedKind();
    if (k === 'ordre') R.ecran(t.forced.ecran, { color: '#ff8a7a' });
    else if (k) { R.ecran(t.forced.ecran); A.ring(true); log(k === 'T1' ? 'Le téléphone sonne.' : 'Le téléphone sonne encore.'); }
    else if (!lastEcran) R.ecran('TEST EN|COURS.');
    lastEcran = '';
    timeTotal = timeLeft = (t.duree || 0) * 1000;
    if (tuto && s.cycle > 3) { tuto = false; try { localStorage.setItem(TUTO_KEY, '1'); } catch (e) {} } lastTick = performance.now(); lastSec = -1;
    refresh();
  }

  function refresh() {
    R.render(s, roomInfo());
    renderSheet(); renderPockets(); updateTimer();
  }

  // ---------- la carte d'action (sous la pièce) ----------
  function esc(v) { return String(v).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function choiceBtn(x, c) {
    var o = x[c];
    return '<button class="ch" data-sit="' + x.id + '" data-c="' + c + '"' + (o.ok ? '' : ' disabled') + '>' + esc(o.label) + (o.ok ? '' : '<small>' + esc(o.raison) + '</small>') + '</button>';
  }
  function renderSheet() {
    var box = $('sheet'), k = forcedKind(), list = sel && t && t.objets[sel], h = '';
    box.classList.toggle('on', !!(list && list.length && !busy));
    if (busy || !t) { box.innerHTML = ''; box.hidden = true; return; }
    if (list && list.length && (k !== 'ordre')) {
      h = list.map(function (x, i) {
        return '<div class="sit"><div class="who"><span>' + esc(x.qui) + '</span>' + (i === 0 && k !== 'T4' ? '<button class="x" data-close="1" aria-label="Fermer">×</button>' : '') + '</div><p>' + esc(x.texte) + '</p><div class="ab">' + choiceBtn(x, 'A') + choiceBtn(x, 'B') + '</div></div>';
      }).join('');
    } else if (tuto && s.cycle <= 3) {
      // Tutoriel discret : seulement pendant les premiers moments de la toute première partie.
      h = '<p class="hint">' + esc(k === 'ordre' ? E.AIDES.ordre : k ? E.AIDES.appel : E.AIDES.libre) + '</p>';
    }
    box.innerHTML = h; box.hidden = !h;
  }
  $('sheet').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || b.disabled) return;
    A.init();
    if (b.dataset.close) { sel = null; refresh(); return; }
    if (b.dataset.sit) act({ type: 'situation', id: b.dataset.sit, choix: b.dataset.c });
  });

  // ---------- poches ----------
  function renderPockets(flash) {
    var items = s.items.filter(function (k) { return POCHES.hasOwnProperty(k); });
    var h = items.length ? '<span class="k">POCHES</span>' : '';
    h += items.map(function (k) {
      var o = POCHES[k];
      return '<button data-o="' + (o || '') + '" data-k="' + k + '" class="' + (flash && flash.indexOf(k) >= 0 ? 'flash' : '') + '">' + esc(E.OBJETS[k]) + '</button>';
    }).join('');
    $('pockets').innerHTML = h;
  }
  $('pockets').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.o) hot(b.dataset.o);
    else if (b.dataset.k === 'tournevis') log('Un tournevis. Il ouvrira des choses vissées.');
    else if (b.dataset.k === 'fusible') log('Un fusible. Il alimente quelque chose, quelque part.');
    else if (b.dataset.k === 'code') log('7, deux chiffres effacés, 2.');
  });

  // ---------- toucher un objet de la pièce ----------
  function hot(k) {
    A.init();
    if (!s || s.fin || paused) return;
    if (busy || !t) return;
    var kind = forcedKind();
    var exit = t.sorties.filter(function (x) { return (x.via === 'porte' && k === 'door') || (x.via === 'trappe' && k === 'trappe' && !t.objets.trappe); })[0];
    if (exit) return act({ type: 'sortir', via: exit.via });
    if (k === 'btn') {
      if (!kind || kind === 'ordre') return act({ type: 'appuyer' });
      return log('Le téléphone sonne.');
    }
    if (kind === 'T1' && k === 'phone') return act({ type: 'situation', id: 'T1', choix: 'A' });
    if (kind === 'T4' && k === 'phone') { if (sel !== 'phone') { sel = 'phone'; A.ring(false); A.sfx('pickup'); } refresh(); return; }
    if (!kind && t.objets[k]) { sel = k; refresh(); return; }
    if (kind === 'ordre' && k === 'monitor') return log('Le moniteur attend que tu appuies.');
    var txt = E.regarder(s, k);
    if (txt) log(txt);
  }

  async function act(a) {
    if (busy || !s || s.fin || paused) return;
    var res;
    try { res = E.choose(s, a); } catch (err) { console.error(err); return; }
    busy = true; A.ring(false); sel = null;
    var before = s.items.slice();
    s = res.state;
    renderSheet();
    var my = run;
    var ok = await play(res.events, my);
    if (!ok) return;
    R.render(s, roomInfo());
    renderPockets(s.items.filter(function (k) { return before.indexOf(k) < 0; }));
    if (s.fin) return finale(my);
    startCycle(my);
  }

  // ---------- chrono (sans aucun chiffre) ----------
  function updateTimer() {
    var sec = Math.max(0, Math.ceil(timeLeft / 1000)), low = sec <= 5 && !busy && timeTotal > 0, ordre = !busy && forcedKind() === 'ordre';
    $('timer').hidden = !ordre;
    $('timerFill').style.transform = 'scaleX(' + (timeTotal ? Math.max(0, timeLeft / timeTotal) : 0) + ')';
    $('timer').classList.toggle('low', low);
    if (!busy && t && forcedKind() === 'ordre' && sec !== lastSec) R.ecran(t.forced.ecran + '|' + sec, { color: sec <= 3 ? '#ff5a4a' : '#ff8a7a' });
    if (ordre && low && sec !== lastSec && sec > 0) A.sfx('tick');
    lastSec = sec;
  }
  setInterval(function () {
    var nowT = performance.now(), dt = nowT - lastTick; lastTick = nowT;
    if (busy || paused || !s || s.fin || document.hidden || !t || !timeTotal) return;
    timeLeft -= dt; updateTimer();
    if (timeLeft <= 0) act({ type: 'temps' });
  }, 100);
  function setPaused(p) {
    paused = p; $('pauseBtn').textContent = p ? 'Reprendre' : 'Pause'; $('pauseBtn').setAttribute('aria-pressed', p); $('pausedLbl').hidden = !p;
    if (p) A.ring(false); else if (!busy && (forcedKind() === 'T1' || (forcedKind() === 'T4' && sel !== 'phone'))) A.ring(true);
  }
  $('pausedLbl').addEventListener('click', function () { setPaused(false); });

  // ---------- fin ----------
  // Son de la dernière image de chaque fin.
  var SONS_FIN = { conforme: 'lock', employe: 'lock', marche: 'ring', seulDehors: 'thud', porteDerobee: 'thud', evasion: 'alarm', cooperation: 'lock', sauvetage: 'thud', tropTard: 'blink', complice: 'alarm', sujet18: 'thud', miroir: 'glitch', boucle: 'blink', isolement: 'slam', gardien: 'alarm', temoin: 'pickup', revolte: 'alarm', tempsEcoule: 'cry', curiosite: 'slam' };

  async function finale(my) {
    var F = E.FINS[s.fin];
    A.ring(false); $('sheet').hidden = true; $('timer').hidden = true;
    R.ecran(F.crt === '_' ? '' : F.crt, { glitch: 500 });
    R.fin(s.fin);
    var son = SONS_FIN[s.fin];
    if (son === 'ring') { A.ring(true); setTimeout(function () { A.ring(false); }, 2600); } else if (son) A.sfx(son);
    if (!(await wait(3200, my))) return;
    endScreen();
  }
  function loadFound() { try { return JSON.parse(localStorage.getItem(FOUND_KEY) || '{}') || {}; } catch (e) { return {}; } }
  function endScreen() {
    var found = loadFound(); found[s.fin] = 1;
    try { localStorage.setItem(FOUND_KEY, JSON.stringify(found)); } catch (e) {}
    var F = E.FINS[s.fin], st = s.stats;
    var ids = E.FIN_IDS.slice().sort(function (a, b) { return (E.FINS[a].bonus ? 99 : E.FINS[a].n) - (E.FINS[b].bonus ? 99 : E.FINS[b].n); });
    var nb = ids.filter(function (k) { return found[k] && !E.FINS[k].bonus; }).length;
    var rows = [['Pressions sur le bouton', st.presses], ['Pressions automatiques', st.auto], ['Ordres suivis', st.suivis], ['Ordres refusés', st.refus], ['Douleur infligée à la Chambre 18', st.blessures + ' fois']];
    var h = '<div class="k">' + (F.bonus ? 'FIN BONUS' : 'FIN ' + F.n + ' / 18') + '</div><h2>' + esc(F.titre) + '</h2>';
    if (F.crt !== '_') h += '<div class="crt">' + esc(F.crt) + '</div>';
    h += '<p>' + esc(F.texte) + '</p>';
    h += '<p class="truth">' + (E.has(s, 'verite') ? esc(E.VERITES[s.truth].texte) : 'Ce que cachait la Chambre 18 : tu ne l\'as pas découvert.') + '</p>';
    var objs = s.items.filter(function (k) { return POCHES.hasOwnProperty(k); }), inds = s.items.filter(function (k) { return INDICES.indexOf(k) >= 0; });
    h += '<div class="k">DANS TES POCHES</div><div class="fins">' + (objs.length ? objs.map(function (k) { return '<span class="on">' + esc(E.OBJETS[k]) + '</span>'; }).join('') : '<span>Rien</span>') + '</div>';
    if (inds.length) h += '<div class="k">CE QUE TU AS COMPRIS</div><div class="fins">' + inds.map(function (k) { return '<span class="on">' + esc(E.OBJETS[k]) + '</span>'; }).join('') + '</div>';
    h += '<div class="stats">' + rows.map(function (r) { return '<span>' + r[0] + '</span><span>' + r[1] + '</span>'; }).join('') + '</div>';
    h += '<div class="k">FINS DÉCOUVERTES : ' + nb + ' / 18</div><div class="fins">' + ids.map(function (k) {
      return '<span class="' + (k === s.fin ? 'cur' : found[k] ? 'on' : '') + '">' + (found[k] ? esc(E.FINS[k].titre) : '???') + '</span>';
    }).join('') + '</div>';
    h += '<div><button class="enter" id="againBtn">Retourner dans la Chambre 17</button></div>';
    $('endBox').innerHTML = h; $('endOv').hidden = false;
    $('againBtn').onclick = function () { $('endOv').hidden = true; start(); };
    $('againBtn').focus();
  }

  document.addEventListener('keydown', function (e) {
    if (e.code === 'Space' && e.target.tagName !== 'BUTTON' && !(e.target.closest && e.target.closest('#btn'))) { e.preventDefault(); hot('btn'); }
    if (e.key === 'Escape' && sel && forcedKind() !== 'T4') { sel = null; refresh(); }
  });

  // ---------- partie ----------
  async function start() {
    run++; var my = run;
    A.stopAll(); setPaused(false);
    s = E.newGame(); t = null; busy = true; sel = null; lastEcran = '';
    try { tuto = !localStorage.getItem(TUTO_KEY); } catch (e) { tuto = true; }
    $('log').innerHTML = '';
    timeLeft = timeTotal = 0; refresh();
    R.ecran('');
    if (!(await wait(700, my))) return;
    if (!(await play(E.intro(s), my))) return;
    startCycle(my);
  }

  R.mount($('scene'), hot);
  $('muteBtn').onclick = function () { var m = !A.isMuted(); A.setMuted(m); this.textContent = 'Son : ' + (m ? 'non' : 'oui'); this.setAttribute('aria-pressed', m); };
  $('pauseBtn').onclick = function () { if (s && !s.fin && $('intro').hidden) setPaused(!paused); };
  $('restartBtn').onclick = function () { if (!$('intro').hidden) return; $('endOv').hidden = true; start(); };
  $('enterBtn').onclick = function () { A.init(); A.startAmbience(); $('intro').hidden = true; start(); };
  document.addEventListener('visibilitychange', function () { if (document.hidden && s && !s.fin && !paused && $('intro').hidden) setPaused(true); });
  s = E.newGame(); R.render(s, {});
})();
