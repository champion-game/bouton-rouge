/* Le Bouton Rouge — boucle de jeu, chrono des ordres, popups, inventaire, historique, écrans de fin.
   Aucune règle ici : tout passe par BREngine (turn / choose / regarder).
   Le joueur agit en touchant les objets de la pièce. Aucun numéro de cycle n'est jamais affiché. */
(function () {
  'use strict';
  var E = window.BREngine, R = window.BRRoom, A = window.BRAudio;
  var $ = function (id) { return document.getElementById(id); };
  var FOUND_KEY = 'bouton-rouge-v2-fins', TUTO_KEY = 'bouton-rouge-v2-tuto';
  // Les 6 cases de l'inventaire, et l'objet de la pièce auquel chaque objet renvoie (pour agir avec).
  var POCHES = ['tournevis', 'fusible', 'code', 'mot16', 'badge', 'enregistrement'];
  var POCHE_OBJET = { badge: 'badge', enregistrement: 'cassette' };
  // Indices (connaissances) montrés à la fin.
  var INDICES = ['angleMort', 'operateur', 'mensonge', 'miroir', 'objectif', 'plan', 'verite'];

  var s = null, t = null, run = 0, busy = true, paused = false, sel = null, tuto = false;
  var timeLeft = 0, timeTotal = 0, lastTick = 0, lastSec = -1, lastEcran = '', popDone = null, flashItems = [];
  var hist = [];

  function esc(v) { return String(v).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // ---------- historique (une ligne, touchée = tout) ----------
  function addHist(text, cls) {
    hist.push({ txt: text, cls: cls || '' });
    if (hist.length > 80) hist.shift();
    $('histLast').textContent = text;
    if (!$('histBox').hidden) renderHist();
  }
  function renderHist() {
    var box = $('histBox');
    box.innerHTML = hist.map(function (h) { return '<p class="' + h.cls + '">' + esc(h.txt) + '</p>'; }).join('');
    box.scrollTop = box.scrollHeight;
  }
  $('histBtn').onclick = function () {
    var open = $('histBox').hidden; $('histBox').hidden = !open; this.setAttribute('aria-expanded', open);
    if (open) renderHist();
  };

  // ---------- messages courts sur la pièce ----------
  var toastT = null;
  function toast(text, cls) {
    var el = $('toast'); el.textContent = text; el.className = 'toast on' + (cls ? ' ' + cls : '');
    clearTimeout(toastT); toastT = setTimeout(function () { el.className = 'toast'; }, 2400);
  }

  function wait(ms, my) { return new Promise(function (res) { setTimeout(function () { res(my === run); }, ms); }); }

  // ---------- popup au centre ----------
  function closePop() { $('pop').hidden = true; $('card').innerHTML = ''; var d = popDone; popDone = null; if (d) d(); }
  function openPop(html, onClose) { $('card').innerHTML = html; $('pop').hidden = false; popDone = onClose || null; var b = $('card').querySelector('button.ch:not([disabled]), button.go'); if (b) b.focus({ preventScroll: true }); }
  // Popup d'information : les textes d'une action, puis « Continuer ».
  function infoPop(lines, my) {
    return new Promise(function (res) {
      var h = '<div class="lines">' + lines.map(function (e) { return '<p class="' + (e.t === 'tel' ? 'tel' : '') + '">' + esc(e.txt) + '</p>'; }).join('') + '</div><div class="ab"><button class="ch go" data-go="1">Continuer</button></div>';
      openPop(h, function () { res(my === run); });
    });
  }
  function choiceBtn(x, c) {
    var o = x[c];
    return '<button class="ch" data-sit="' + x.id + '" data-c="' + c + '"' + (o.ok ? '' : ' disabled') + '>' + esc(o.label) + (o.ok ? '' : '<small>' + esc(o.raison) + '</small>') + '</button>';
  }
  // Popup d'un objet : description, et les choix possibles.
  function objetPop(titre, texte, list, closable) {
    list = list || [];
    var head = titre || (list[0] && list[0].qui) || '';
    var h = '<div class="who"><span>' + esc(head) + '</span>' + (closable ? '<button class="x" data-close="1" aria-label="Fermer">×</button>' : '') + '</div>';
    if (texte) h += '<p>' + esc(texte) + '</p>';
    list.forEach(function (x, i) {
      if (i || texte) h += '<div class="sep"></div><div class="who"><span>' + esc(x.qui) + '</span></div>';
      h += '<p>' + esc(x.texte) + '</p><div class="ab">' + choiceBtn(x, 'A') + choiceBtn(x, 'B') + '</div>';
    });
    openPop(h, function () { sel = null; });
  }
  $('pop').addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) { if (e.target.id === 'pop' && $('card').querySelector('[data-go], [data-close]')) closePop(); return; }
    if (b.disabled) return;
    A.init();
    if (b.dataset.go || b.dataset.close) return closePop();
    if (b.dataset.sit) { var a = { type: 'situation', id: b.dataset.sit, choix: b.dataset.c }; popDone = null; $('pop').hidden = true; act(a); }
  });

  // ---------- lecture des événements du moteur ----------
  async function play(events, my) {
    var lines = [];
    for (var i = 0; i < events.length; i++) {
      if (my !== run) return false;
      var e = events[i];
      switch (e.t) {
        case 'choix': addHist('› ' + e.label, 'me'); break;
        case 'ecran': R.ecran(e.txt, { glitch: 300 }); lastEcran = e.txt; A.sfx('glitch'); addHist(e.txt.replace(/-\|/g, '-').replace(/\|/g, ' '), 'ecr'); await wait(800, my); break;
        case 'tel': case 'narr': lines.push(e); addHist(e.txt, e.t === 'tel' ? 'tel' : ''); break;
        case 'press': R.press(); A.sfx('clac'); await wait(250, my); break;
        case 'cri': R.harm(e.vie); A.sfx('cry'); await wait(700, my); break;
        case 'soupcon': if (e.d > 0) { A.sfx('blink'); toast('La caméra t\'a vu.', 'ecr'); addHist('La caméra t\'a vu.', 'ecr'); } break;
        case 'objet':
          if (POCHES.indexOf(e.k) >= 0) {
            var txt = (e.gain ? '+ ' : '− ') + E.OBJETS[e.k];
            toast(txt, 'obj'); addHist(txt, 'obj'); if (e.gain) { A.sfx('paper'); flashItems.push(e.k); }
            await wait(400, my);
          }
          break;
        case 'porte': A.sfx(e.open ? 'lock' : 'slam'); await wait(400, my); break;
        case 'son': A.sfx(e.n); if (e.n === 'alarm') R.alarm(2600); break;
        case 'cycle': if (e.n === 6) { R.blackout(true); setTimeout(function () { R.blackout(false); }, 700); } break;
      }
    }
    if (lines.length && my === run) { R.render(s, roomInfo()); renderBag(); return infoPop(lines, my); }
    return my === run;
  }

  // ---------- un moment de jeu ----------
  function forcedKind() { return !t || !t.forced ? null : t.forced.ordre ? 'ordre' : t.forced.id === 'T1' ? 'T1' : 'T4'; }
  function roomInfo() {
    var k = forcedKind();
    return {
      cameraAveugle: E.cameraAveugle(s), porteOuverte: E.porteOuverte(s), noir: s.cycle === 6 || s.flags.noirCycle === s.cycle,
      ordre: !busy && k === 'ordre', sonne: !busy && (k === 'T1' || (k === 'T4' && sel !== 'phone'))
    };
  }

  function startCycle(my) {
    if (my !== run) return;
    t = E.turn(s); busy = false; sel = null;
    var k = forcedKind();
    if (k === 'ordre') R.ecran(t.forced.ecran, { color: '#ff8a7a' });
    else if (k) { R.ecran(t.forced.ecran); A.ring(true); toast('Le téléphone sonne.'); addHist('Le téléphone sonne.'); }
    else if (!lastEcran) R.ecran('TEST EN|COURS.');
    lastEcran = '';
    timeTotal = timeLeft = (t.duree || 0) * 1000; lastTick = performance.now(); lastSec = -1;
    if (tuto && s.cycle > 3) { tuto = false; try { localStorage.setItem(TUTO_KEY, '1'); } catch (e) {} }
    refresh();
  }

  function refresh() {
    R.render(s, roomInfo());
    renderBag(); updateTimer();
    var k = forcedKind(), hint = !busy && t && tuto && s.cycle <= 3 ? (k === 'ordre' ? E.AIDES.ordre : k ? E.AIDES.appel : E.AIDES.libre) : '';
    $('hintcap').textContent = hint; $('hintcap').hidden = !hint;
  }

  // ---------- inventaire ----------
  function renderBag() {
    $('bag').innerHTML = POCHES.map(function (k) {
      if (!E.has(s, k)) return '<div class="slot"></div>';
      return '<button class="slot' + (flashItems.indexOf(k) >= 0 ? ' flash' : '') + '" data-k="' + k + '" aria-label="' + esc(E.OBJETS[k]) + '" title="' + esc(E.OBJETS[k]) + '">' + R.icone(k) + '</button>';
    }).join('');
  }
  $('bag').addEventListener('click', function (e) {
    var b = e.target.closest('button.slot'); if (!b || !s || s.fin || paused) return;
    A.init();
    var k = b.dataset.k, o = POCHE_OBJET[k], list = !busy && t && !t.forced && o ? t.objets[o] : null;
    flashItems = flashItems.filter(function (x) { return x !== k; }); renderBag();
    if (list && list.length) { sel = o; objetPop(E.OBJETS[k], '', list, true); }
    else objetPop(E.OBJETS[k], E.DESCRIPTIONS[k], null, true);
  });

  // ---------- toucher un objet de la pièce ----------
  var TITRES = { phone: 'LE TÉLÉPHONE', drawer: 'LE TIROIR', grille: 'LA GRILLE', box: 'LE BOÎTIER', trappe: 'LA TRAPPE', camera: 'LA CAMÉRA', note: 'LE MOT', bureau: 'SOUS LE BUREAU', window: 'LA CHAMBRE 18', monitor: 'LE MONITEUR', light: 'LA LAMPE', mug: 'LA TASSE', door: 'LA PORTE' };
  function hot(k) {
    A.init();
    if (!s || s.fin || paused || busy || !t || !$('pop').hidden) return;
    var kind = forcedKind();
    var exit = t.sorties.filter(function (x) { return (x.via === 'porte' && k === 'door') || (x.via === 'trappe' && k === 'trappe' && !t.objets.trappe); })[0];
    if (exit) return act({ type: 'sortir', via: exit.via });
    if (k === 'btn') {
      if (!kind || kind === 'ordre') return act({ type: 'appuyer' });
      return toast('Le téléphone sonne.');
    }
    if (kind === 'T1' && k === 'phone') return act({ type: 'situation', id: 'T1', choix: 'A' });
    if (kind === 'T4' && k === 'phone') { sel = 'phone'; A.ring(false); A.sfx('pickup'); R.render(s, roomInfo()); objetPop('', '', t.objets.phone, false); return; }
    if (kind) return toast('Pas maintenant.');
    if (t.objets[k]) { sel = k; objetPop('', '', t.objets[k], true); return; }
    var txt = E.regarder(s, k);
    if (txt) objetPop(TITRES[k] || '', txt, null, true);
  }

  async function act(a) {
    if (busy || !s || s.fin || paused) return;
    var res;
    try { res = E.choose(s, a); } catch (err) { console.error(err); return; }
    busy = true; A.ring(false); sel = null; flashItems = [];
    if (!$('pop').hidden) { popDone = null; $('pop').hidden = true; }
    s = res.state;
    refresh();
    var my = run;
    var ok = await play(res.events, my);
    if (!ok) return;
    R.render(s, roomInfo()); renderBag();
    if (s.fin) return finale(my);
    startCycle(my);
  }

  // ---------- chrono : visible seulement pendant un ordre ----------
  function updateTimer() {
    var sec = Math.max(0, Math.ceil(timeLeft / 1000)), ordre = !busy && forcedKind() === 'ordre', low = ordre && sec <= 5;
    $('timer').hidden = !ordre;
    $('timerFill').style.transform = 'scaleX(' + (timeTotal ? Math.max(0, timeLeft / timeTotal) : 0) + ')';
    $('timer').classList.toggle('low', low);
    if (ordre && sec !== lastSec) R.ecran(t.forced.ecran + '|' + sec, { color: sec <= 3 ? '#ff5a4a' : '#ff8a7a' });
    if (low && sec !== lastSec && sec > 0) A.sfx('tick');
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
  var SONS_FIN = { conforme: 'lock', employe: 'lock', marche: 'ring', seulDehors: 'thud', porteDerobee: 'thud', evasion: 'alarm', cooperation: 'lock', sauvetage: 'thud', tropTard: 'blink', complice: 'alarm', sujet18: 'thud', miroir: 'glitch', boucle: 'blink', isolement: 'slam', gardien: 'alarm', temoin: 'pickup', revolte: 'alarm', tempsEcoule: 'cry', curiosite: 'slam' };
  async function finale(my) {
    var F = E.FINS[s.fin];
    A.ring(false); $('timer').hidden = true; $('hintcap').hidden = true;
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
    var rows = [['Pressions sur le bouton', st.presses], ['Ordres suivis', st.suivis], ['Ordres refusés', st.refus], ['Douleur infligée à la Chambre 18', st.blessures + ' fois']];
    var h = '<div class="k">' + (F.bonus ? 'FIN BONUS' : 'FIN ' + F.n + ' / 18') + '</div><h2>' + esc(F.titre) + '</h2>';
    if (F.crt !== '_') h += '<div class="crt">' + esc(F.crt) + '</div>';
    h += '<p>' + esc(F.texte) + '</p>';
    h += '<p class="truth">' + (E.has(s, 'verite') ? esc(E.VERITES[s.truth].texte) : 'Ce que cachait la Chambre 18 : tu ne l\'as pas découvert.') + '</p>';
    var objs = POCHES.filter(function (k) { return E.has(s, k); }), inds = INDICES.filter(function (k) { return E.has(s, k); });
    h += '<div class="k">DANS TES POCHES</div><div class="bag">' + POCHES.map(function (k) { return '<div class="slot">' + (objs.indexOf(k) >= 0 ? R.icone(k) : '') + '</div>'; }).join('') + '</div>';
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
    if (e.key === 'Escape' && !$('pop').hidden && $('card').querySelector('[data-go], [data-close]')) { closePop(); return; }
    if (e.code === 'Space' && $('pop').hidden && e.target.tagName !== 'BUTTON' && !(e.target.closest && e.target.closest('#btn'))) { e.preventDefault(); hot('btn'); }
  });

  // ---------- partie ----------
  async function start() {
    run++; var my = run;
    A.stopAll(); setPaused(false);
    if (!$('pop').hidden) { popDone = null; $('pop').hidden = true; }
    s = E.newGame(); t = null; busy = true; sel = null; lastEcran = ''; hist = []; flashItems = [];
    try { tuto = !localStorage.getItem(TUTO_KEY); } catch (e) { tuto = true; }
    $('histLast').textContent = '…'; $('histBox').innerHTML = ''; $('histBox').hidden = true;
    timeLeft = timeTotal = 0; refresh();
    R.ecran('');
    if (!(await wait(600, my))) return;
    if (!(await play(E.intro(s), my))) return;
    startCycle(my);
  }

  R.mount($('scene'), hot);
  $('muteBtn').onclick = function () { var m = !A.isMuted(); A.setMuted(m); this.textContent = 'Son : ' + (m ? 'non' : 'oui'); this.setAttribute('aria-pressed', m); };
  $('pauseBtn').onclick = function () { if (s && !s.fin && $('intro').hidden) setPaused(!paused); };
  $('restartBtn').onclick = function () { if (!$('intro').hidden) return; $('endOv').hidden = true; start(); };
  $('enterBtn').onclick = function () { A.init(); A.startAmbience(); $('intro').hidden = true; start(); };
  document.addEventListener('visibilitychange', function () { if (document.hidden && s && !s.fin && !paused && $('intro').hidden) setPaused(true); });
  s = E.newGame(); R.render(s, {}); renderBag();
})();
