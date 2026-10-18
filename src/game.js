/* Le Bouton Rouge — boucle de jeu, chrono, interface des choix et écrans de fin.
   Aucune règle ici : tout passe par BREngine (turn / choose). */
(function () {
  'use strict';
  var E = window.BREngine, R = window.BRRoom, A = window.BRAudio;
  var $ = function (id) { return document.getElementById(id); };
  var FOUND_KEY = 'bouton-rouge-v2-fins';

  var s = null, t = null, run = 0, busy = true, paused = false, tab = null;
  var timeLeft = 0, timeTotal = 0, lastTick = 0, lastSec = -1, skipWait = null, lastEcran = '';

  // ---------- journal ----------
  function log(text, cls) {
    var box = $('log'), p = document.createElement('p');
    Array.prototype.forEach.call(box.querySelectorAll('p.new'), function (x) { x.classList.remove('new'); });
    p.className = 'new' + (cls ? ' ' + cls : ''); p.textContent = text;
    box.appendChild(p);
    while (box.children.length > 12) box.removeChild(box.firstChild);
    box.scrollTop = box.scrollHeight;
  }
  function clearLog() { $('log').innerHTML = ''; }
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
        case 'ecran': R.ecran(e.txt, { glitch: 300 }); lastEcran = e.txt; A.sfx('glitch'); log(e.txt.replace(/\|/g, ' '), 'ecr'); await wait(900, my); break;
        case 'tel': log(e.txt, 'tel'); await wait(readTime(e.txt), my); break;
        case 'narr': log(e.txt); await wait(readTime(e.txt), my); break;
        case 'press': R.press(); A.sfx('clac'); await wait(250, my); break;
        case 'cri': R.harm(e.vie); A.sfx('cry'); renderGauges(e.vie); await wait(700, my); break;
        case 'soupcon': if (e.d > 0) { A.sfx('blink'); log('La caméra t\'a vu. Soupçon en hausse.', 'ecr'); } await wait(300, my); break;
        case 'objet': log((e.gain ? '+ ' : '− ') + E.OBJETS[e.k], 'obj'); if (e.gain) A.sfx('paper'); await wait(500, my); break;
        case 'porte': A.sfx(e.open ? 'lock' : 'slam'); await wait(400, my); break;
        case 'son': A.sfx(e.n); if (e.n === 'alarm') R.alarm(2600); break;
        case 'cycle': setCycle(e.n); A.sfx('cycle'); if (e.n === 6) { R.blackout(true); setTimeout(function () { R.blackout(false); }, 700); } await wait(350, my); break;
        case 'fin': break;
      }
    }
    return my === run;
  }

  // ---------- tour de jeu ----------
  function setCycle(n) { $('cyc').innerHTML = 'CYCLE <b>' + ('0' + n).slice(-2) + '</b>/' + E.DERNIER_CYCLE; }

  function roomInfo() {
    var fid = E.forcedId(s);
    return {
      cameraAveugle: E.cameraAveugle(s), porteOuverte: E.porteOuverte(s), noir: s.cycle === 6 || s.flags.noirCycle === s.cycle,
      ordre: t && t.forced && t.forced.ordre, sonne: t && t.forced && t.forced.appel && !busy && (fid === 'T1' || fid === 'T4')
    };
  }
  function renderGauges(vie) {
    if (vie == null) vie = s.vie;
    for (var i = 1; i <= 3; i++) $('g' + i).className = 'dot' + (vie >= i ? ' on' : '');
    var blind = E.cameraAveugle(s);
    $('gcam').style.background = blind || s.cycle < 4 ? '#262c2b' : ['#3ee08f', '#3ee08f', '#f2a33a', '#e3262b', '#e3262b'][s.soupcon];
    $('gcam').title = blind ? 'Aveugle' : 'Soupçon';
  }
  function renderInv(flash) {
    $('inv').innerHTML = s.items.map(function (k) { return '<span class="' + (flash && flash.indexOf(k) >= 0 ? 'flash' : '') + '">' + E.OBJETS[k] + '</span>'; }).join('');
  }

  function startCycle(my) {
    if (my !== run) return;
    t = E.turn(s);
    busy = false;
    setCycle(s.cycle);
    if (t.forced) {
      R.ecran(t.forced.ecran, { color: t.forced.ordre ? '#ff8a7a' : undefined });
      if (t.forced.appel) A.ring(true);
    } else if (!lastEcran) R.ecran('TEST EN|COURS.');
    lastEcran = '';
    if (!t.forced && (!tab || !hasTab(tab))) tab = firstTab();
    R.render(s, roomInfo()); renderGauges(); renderInv();
    renderChoices();
    timeTotal = timeLeft = t.duree * 1000; lastTick = performance.now(); lastSec = -1;
    updateTimer();
  }
  function hasTab(id) { var f = t.fils.filter(function (x) { return x.id === id; })[0]; return f && f.situations.length > 0; }
  function firstTab() { var f = t.fils.filter(function (x) { return x.situations.length; })[0]; return f ? f.id : 'bouton'; }

  function choiceBtn(letter, o, data) {
    return '<button class="ch" ' + data + (o.ok ? '' : ' disabled') + '><span class="l">' + letter + '</span><span>' + esc(o.label) + (o.ok ? '' : '<small>' + esc(o.raison) + '</small>') + '</span></button>';
  }
  function sitHtml(x, forced) {
    return '<div class="sit' + (forced ? ' forced' : '') + '"><div class="who">' + esc(x.qui) + '</div><p>' + esc(x.texte) + '</p><div class="ab">' +
      choiceBtn('A', x.A, 'data-sit="' + x.id + '" data-c="A"') + choiceBtn('B', x.B, 'data-sit="' + x.id + '" data-c="B"') + '</div></div>';
  }
  function esc(v) { return String(v).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function renderChoices() {
    var box = $('choices'), h = '';
    box.classList.toggle('wait', busy);
    if (busy || !t) { box.innerHTML = '<p class="note">…</p>'; return; }
    if (t.sorties.length) h += '<div class="exits">' + t.sorties.map(function (x) { return '<button class="exit" data-exit="' + x.via + '">' + esc(x.label) + '</button>'; }).join('') + '</div>';
    if (t.forced) {
      h += sitHtml(t.forced, true);
    } else {
      h += '<div class="tabs" role="tablist">' + t.fils.map(function (f) {
        var n = f.situations.length;
        return '<button class="tab' + (f.id === tab ? ' sel' : '') + (n || f.id === 'bouton' ? '' : ' dim') + '" role="tab" aria-selected="' + (f.id === tab) + '" data-tab="' + f.id + '">' + esc(f.court) + (n ? '<span class="n">' + n + '</span>' : '') + '</button>';
      }).join('') + '</div>';
      var f = t.fils.filter(function (x) { return x.id === tab; })[0];
      if (f.id === 'bouton') h += '<div class="sit"><div class="who">LE BOUTON</div><p>' + esc(f.note) + '</p><button class="ch press" data-press="1"><span class="l">!</span><span>Appuyer sur le bouton<small>Ça prend le cycle.</small></span></button></div>';
      else if (f.situations.length) h += f.situations.map(function (x) { return sitHtml(x, false); }).join('');
      else h += '<p class="note">' + esc(f.note) + '</p>';
    }
    box.innerHTML = h;
  }

  $('choices').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || b.disabled) return;
    A.init();
    if (b.dataset.tab) { tab = b.dataset.tab; renderChoices(); return; }
    if (b.dataset.exit) return act({ type: 'sortir', via: b.dataset.exit });
    if (b.dataset.press) return act({ type: 'appuyer' });
    if (b.dataset.sit) return act({ type: 'situation', id: b.dataset.sit, choix: b.dataset.c });
  });

  async function act(a) {
    if (busy || !s || s.fin || paused) return;
    var res;
    try { res = E.choose(s, a); } catch (err) { console.error(err); return; }
    busy = true; A.ring(false);
    var before = s.items.slice();
    s = res.state;
    renderChoices();
    var my = run;
    var ok = await play(res.events, my);
    if (!ok) return;
    R.render(s, roomInfo()); renderGauges();
    renderInv(s.items.filter(function (k) { return before.indexOf(k) < 0; }));
    if (s.fin) return finale(my);
    startCycle(my);
  }

  // ---------- chrono ----------
  function updateTimer() {
    var sec = Math.max(0, Math.ceil(timeLeft / 1000)), low = sec <= 5;
    $('barFill').style.transform = 'scaleX(' + (timeTotal ? Math.max(0, timeLeft / timeTotal) : 0) + ')';
    $('bar').classList.toggle('low', low); $('secs').classList.toggle('low', low);
    $('secs').textContent = sec;
    if (low && sec !== lastSec && sec > 0 && !busy) A.sfx('tick');
    lastSec = sec;
  }
  setInterval(function () {
    var nowT = performance.now(), dt = nowT - lastTick; lastTick = nowT;
    if (busy || paused || !s || s.fin || document.hidden) return;
    timeLeft -= dt; updateTimer();
    if (timeLeft <= 0) act({ type: 'temps' });
  }, 100);
  function setPaused(p) {
    paused = p; $('pauseBtn').textContent = p ? 'Reprendre' : 'Pause'; $('pauseBtn').setAttribute('aria-pressed', p); $('pausedLbl').hidden = !p;
    if (p) A.ring(false); else if (t && t.forced && t.forced.appel && !busy) A.ring(true);
  }

  // ---------- fin ----------
  async function finale(my) {
    var F = E.FINS[s.fin];
    A.ring(false);
    R.ecran(F.crt === '_' ? '' : F.crt, { glitch: 500 });
    if (s.fin === 'isolement' || s.fin === 'boucle') R.blackout(true);
    if (s.fin === 'curiosite') A.sfx('slam');
    if (!(await wait(2600, my))) return;
    endScreen();
  }
  function loadFound() { try { return JSON.parse(localStorage.getItem(FOUND_KEY) || '{}') || {}; } catch (e) { return {}; } }
  function endScreen() {
    var found = loadFound(); found[s.fin] = 1;
    try { localStorage.setItem(FOUND_KEY, JSON.stringify(found)); } catch (e) {}
    var F = E.FINS[s.fin], st = s.stats;
    var ids = E.FIN_IDS.slice().sort(function (a, b) { return (E.FINS[a].bonus ? 99 : E.FINS[a].n) - (E.FINS[b].bonus ? 99 : E.FINS[b].n); });
    var nb = ids.filter(function (k) { return found[k] && !E.FINS[k].bonus; }).length;
    var rows = [['Cycles vécus', Math.min(s.cycle, 20) + ' / 20'], ['Pressions sur le bouton', st.presses], ['Pressions automatiques', st.auto], ['Ordres suivis', st.suivis], ['Ordres refusés', st.refus], ['Douleur infligée à la Chambre 18', st.blessures + ' fois']];
    var h = '<div class="k">' + (F.bonus ? 'FIN BONUS' : 'FIN ' + F.n + ' / 18') + '</div><h2>' + esc(F.titre) + '</h2>';
    if (F.crt !== '_') h += '<div class="crt">' + esc(F.crt) + '</div>';
    h += '<p>' + esc(F.texte) + '</p>';
    h += '<p class="truth">' + (E.has(s, 'verite') ? esc(E.VERITES[s.truth].texte) : 'Ce que cachait la Chambre 18 : tu ne l\'as pas découvert.') + '</p>';
    h += '<div class="stats">' + rows.map(function (r) { return '<span>' + r[0] + '</span><span>' + r[1] + '</span>'; }).join('') + '</div>';
    h += '<div class="k">FINS DÉCOUVERTES : ' + nb + ' / 18</div><div class="fins">' + ids.map(function (k) {
      return '<span class="' + (k === s.fin ? 'cur' : found[k] ? 'on' : '') + '">' + (found[k] ? esc(E.FINS[k].titre) : '???') + '</span>';
    }).join('') + '</div>';
    h += '<div><button class="enter" id="againBtn">Retourner dans la Chambre 17</button></div>';
    $('endBox').innerHTML = h; $('endOv').hidden = false;
    $('againBtn').onclick = function () { $('endOv').hidden = true; start(); };
    $('againBtn').focus();
  }

  // ---------- pièce : clics ----------
  function hot(k) {
    A.init();
    if (!s || s.fin) return;
    if (k === 'btn') { if (!busy && t && t.peutAppuyer) act({ type: 'appuyer' }); else if (t && t.forced && t.forced.appel) log('Le téléphone sonne.'); return; }
    if (k === 'door') { if (!busy && t && t.sorties.some(function (x) { return x.via === 'porte'; })) act({ type: 'sortir', via: 'porte' }); else log('La porte est verrouillée. Le voyant est rouge.'); return; }
    if (k === 'trappe' && !busy && t && t.sorties.some(function (x) { return x.via === 'trappe'; })) { act({ type: 'sortir', via: 'trappe' }); return; }
    if (k === 'phone' && !busy && t && t.forced && t.forced.id === 'T1') { act({ type: 'situation', id: 'T1', choix: 'A' }); return; }
    var TABS = { drawer: 'piece', grille: 'piece', box: 'piece', trappe: 'piece', camera: 'camera', note: 'passe', phone: 'telephone' };
    if (TABS[k] && t && !t.forced) { tab = TABS[k]; renderChoices(); return; }
    var LOOK = {
      window: s.vie === 0 ? 'La vitre de la 18 est noire.' : s.vie < 3 ? 'Derrière la vitre, la silhouette est recroquevillée.' : 'Derrière la vitre dépolie, une silhouette. Elle te regarde.',
      monitor: 'Une plaque sous l\'écran : « UNITÉ 17 / 24 — PROTOCOLE D\'OBÉISSANCE, VERSION 3 ».',
      light: 'Sur la douille de l\'ampoule, quelqu\'un a gravé : « 24 ».',
      mug: 'Une tasse de café froid. Personne ne l\'a bue.'
    };
    if (LOOK[k]) log(LOOK[k]);
  }

  document.addEventListener('keydown', function (e) {
    if (e.code === 'Space' && e.target.tagName !== 'BUTTON' && !(e.target.closest && e.target.closest('#btn'))) { e.preventDefault(); hot('btn'); }
  });

  // ---------- partie ----------
  async function start() {
    run++; var my = run;
    A.stopAll(); setPaused(false);
    s = E.newGame(); t = null; busy = true; tab = null; lastEcran = '';
    clearLog(); R.render(s, roomInfo()); renderGauges(); renderInv(); renderChoices(); setCycle(1);
    timeLeft = timeTotal = 0; updateTimer();
    R.ecran('');
    if (!(await wait(700, my))) return;
    if (!(await play(E.intro(s), my))) return;
    startCycle(my);
  }

  R.mount($('scene'), hot);
  $('muteBtn').onclick = function () { var m = !A.isMuted(); A.setMuted(m); this.textContent = 'Son : ' + (m ? 'non' : 'oui'); this.setAttribute('aria-pressed', m); };
  $('pauseBtn').onclick = function () { if (s && !s.fin) setPaused(!paused); };
  $('restartBtn').onclick = function () { if (!$('intro').hidden) return; $('endOv').hidden = true; start(); };
  $('enterBtn').onclick = function () { A.init(); A.startAmbience(); $('intro').hidden = true; start(); };
  document.addEventListener('visibilitychange', function () { if (document.hidden && s && !s.fin && !paused) setPaused(true); });
  s = E.newGame(); R.render(s, {}); renderGauges();
})();
