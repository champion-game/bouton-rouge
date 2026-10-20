/* Le Bouton Rouge — boucle de jeu, chrono des ordres, popups, inventaire, historique, écrans de fin.
   Aucune règle ici : tout passe par BREngine (turn / choose / regarder).
   Le joueur agit en touchant les objets de la pièce. Aucun numéro de cycle n'est jamais affiché. */
(function () {
  'use strict';
  var E = window.BREngine, R = window.BRRoom, A = window.BRAudio;
  var $ = function (id) { return document.getElementById(id); };
  var FOUND_KEY = 'bouton-rouge-v2-fins', TUTO_KEY = 'bouton-rouge-v2-tuto', SESSION_KEY = 'bouton-rouge-v3-sessions';
  var SAVE_KEY = 'bouton-rouge-v5-partie', REGLAGES_KEY = 'bouton-rouge-v4-reglages';
  function lire(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } }
  function ecrire(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  // Mémoire des sessions précédentes (dans ce navigateur) : le Système s'en souvient.
  function lireMemoire() { try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch (e) { return null; } }
  function ecrireMemoire(m) { try { localStorage.setItem(SESSION_KEY, JSON.stringify(m)); } catch (e) {} }
  // Les 6 cases de l'inventaire, et l'objet de la pièce auquel chaque objet renvoie (pour agir avec).
  var POCHES = ['tournevis', 'fusible', 'code', 'mot16', 'badge', 'enregistrement', 'journal'];
  var POCHE_OBJET = { badge: 'badge', enregistrement: 'cassette' };
  // Indices (connaissances) montrés à la fin.
  // Ce que le joueur a appris (montré dans l'Historique : faits observés seulement).
  var SAVOIRS = ['trappe', 'angleMort', 'operateur', 'objectif', 'plan', 'sortieCachee', 'conduit', 'dossier', 'menaceVide', 'videoTruquee', 'simulation', 'protocole', 'relais', 'relaisReset', 'verite'];

  var s = null, t = null, run = 0, busy = true, paused = false, sel = null, tuto = false;
  var timeLeft = 0, timeTotal = 0, lastTick = 0, lastSec = -1, lastEcran = '', popDone = null, flashItems = [];
  var hist = [], introSil = false, confirmer = false, ringT = null;
  // Coupure : la pièce ne s'éteint qu'à l'animation « panne », et ne se rallume qu'à « lumiere » (pas avant les messages).
  var noirVu = false;

  function ecranTxt(t) { return t.replace(/-\|/g, '-').replace(/\|/g, ' '); }
  // Une lettre affichée comme un vrai papier (recto, et verso si on l'a gardée).
  function lettreHtml(L, verso) {
    if (typeof L === 'string') L = E.LETTRES[L];
    var h = '<div class="lettre">' + (L.titre ? '<span>' + esc(L.titre) + '</span>' : '') + '<p>' + L.recto.map(esc).join('<br>') + '</p>' + (L.signature ? '<p class="sig">' + esc(L.signature) + '</p>' : '') + '</div>';
    if (verso && L.verso) h += '<div class="lettre verso"><span>AU DOS</span><p>' + L.verso.map(esc).join('<br>') + '</p></div>';
    return h;
  }
  function esc(v) { return String(v).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // ---------- historique (une ligne, touchée = tout) ----------
  function addHist(text, cls) {
    hist.push({ txt: text, cls: cls || '' });
    if (hist.length > 80) hist.shift();
    if (!$('histBox').hidden) renderHist();
  }
  function renderHist() {
    var box = $('histBox');
    var sv = s ? SAVOIRS.filter(function (k) { return E.has(s, k); }) : [];
    box.innerHTML = (sv.length ? '<p class="obj">Ce que tu sais : ' + sv.map(function (k) { return esc(E.OBJETS[k]); }).join(' · ') + '</p>' : '') +
      hist.map(function (h) { return '<p class="' + h.cls + '">' + esc(h.txt) + '</p>'; }).join('');
    box.scrollTop = box.scrollHeight;
  }
  $('histBtn').onclick = function () {
    var open = $('histBox').hidden; $('histBox').hidden = !open; this.setAttribute('aria-expanded', open);
    if (open) renderHist();
  };

  // ---------- messages courts sur la pièce ----------
  var toastT = null;
  function toast(text, cls, ms) {
    var el = $('toast'); el.textContent = text; el.className = 'toast on' + (cls ? ' ' + cls : '');
    clearTimeout(toastT); toastT = setTimeout(function () { el.className = 'toast'; }, ms || 2400);
  }

  // Attente qu'on peut raccourcir en touchant la pièce.
  var skipWait = null;
  function wait(ms, my) {
    return new Promise(function (res) {
      var to = setTimeout(done, ms);
      function done() { clearTimeout(to); if (skipWait === done) skipWait = null; res(my === run); }
      skipWait = done;
    });
  }
  function passer() { R.ecranFinir(); if (skipWait) skipWait(); }
  // Temps pour taper puis lire une phrase du moniteur.
  function tempsEcran(n) { return Math.min(7000, n * R.VITESSE + 1300 + n * 35); }

  // ---------- texte tapé dans les popups ----------
  var typer = null, PAS = { lent: 1, normal: 2, rapide: 4 }, vitesse = 'normal';
  // La voix de la 18 murmure pendant que son texte se tape (plus grave ou plus aiguë selon qui elle est).
  // Toutes les voix passent par le même filtre (aucun second indice sonore selon la vérité).
  function taper(els, textes, fin, types) {
    var li = 0, ci = 0, iv = null, pas = PAS[vitesse] || 2;
    function voix(i) { var k = types && types[i]; if (k === 'voix' || k === 'tel') A.murmure(Math.ceil(textes[i].length / pas) * 22, 1, true); }
    function finir() { clearInterval(iv); typer = null; els.forEach(function (el, i) { el.textContent = textes[i]; }); if (fin) fin(); }
    els.forEach(function (el) { el.textContent = ''; });
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return finir();
    typer = { finir: finir };
    if (els.length) voix(0);
    iv = setInterval(function () {
      if (li >= els.length) return finir();
      ci += pas; els[li].textContent = textes[li].slice(0, ci);
      if (ci >= textes[li].length) { li++; ci = 0; if (li < els.length) voix(li); }
    }, 22);
  }

  // ---------- popup au centre ----------
  function closePop() { $('pop').hidden = true; $('card').innerHTML = ''; var d = popDone; popDone = null; if (d) d(); }
  function openPop(html, onClose) { $('card').innerHTML = html; $('pop').hidden = false; popDone = onClose || null; var b = $('card').querySelector('button.ch:not([disabled]), button.go'); if (b) b.focus({ preventScroll: true }); }
  // Popup d'information : les textes d'une action, puis « Continuer ».
  function infoPop(lines, my, auto) {
    return new Promise(function (res) {
      var txt = lines.filter(function (e) { return e.txt != null; });
      var textes = txt.map(function (e) { return e.t === 'ecran' ? ecranTxt(e.txt) : e.txt; });
      var h = '<div class="lines">' + lines.map(function (e) {
        if (e.t === 'image') return imageHtml(e.n);
        if (e.t === 'papier') return lettreHtml(e.p, true);
        return '<p class="t ' + ({ tel: 'tel', voix: 'voix', ecran: 'sys' }[e.t] || '') + '"></p>';
      }).join('') + '</div><div class="ab"><button class="ch go" data-go="1">Continuer</button></div>';
      openPop(h, function () { res(my === run); });
      taper(Array.prototype.slice.call($('card').querySelectorAll('.lines p.t')), textes, null, txt.map(function (e) { return e.t; }));
      // Popup qui se referme tout seul (intro) : pas besoin de toucher « Continuer ».
      if (auto) { var n = textes.join('').length, card = $('card').firstChild; setTimeout(function () { if (!$('pop').hidden && $('card').firstChild === card) closePop(); }, n * 11 + 2600 + n * 40); }
    });
  }
  // Ce qu'on voit vraiment : une révélation floue, ou les gravures de 16.
  function imageHtml(n) {
    if (n === 'gravures') return '<div class="gravure"><b>||||| ||||| ||||| |||||</b><b>20 = OTHER SIDE</b><b>4 / 1</b></div>';
    return '<img class="rev" src="assets/img/' + n + '.webp" alt="">';
  }
  function choiceBtn(x, c) {
    var o = x[c]; if (!o) return '';
    var small = !o.ok ? o.raison : o.sous;
    return '<button class="ch" data-sit="' + x.id + '" data-c="' + c + '"' + (o.ok ? '' : ' disabled') + '>' + esc(o.label) + (small ? '<small>' + esc(small) + '</small>' : '') + '</button>';
  }
  // Popup d'un objet : description, et les choix possibles.
  function objetPop(titre, texte, list, closable) {
    list = list || [];
    var head = titre || (list[0] && list[0].qui) || '';
    var h = '<div class="who"><span>' + esc(head) + '</span>' + (closable ? '<button class="x" data-close="1" aria-label="Fermer">×</button>' : '') + '</div>';
    if (texte) h += '<p>' + esc(texte) + '</p>';
    list.forEach(function (x, i) {
      if (i || texte || titre) h += (i || texte ? '<div class="sep"></div>' : '') + '<div class="who"><span>' + esc(x.qui) + '</span></div>';
      h += (x.id === 'H1' ? lettreHtml('mot16', false) : '<p>' + esc(x.texte) + '</p>') + '<div class="ab' + (x.B ? '' : ' one') + '">' + choiceBtn(x, 'A') + choiceBtn(x, 'B') + choiceBtn(x, 'C') + '</div>';
    });
    openPop(h, function () { sel = null; if (s && !s.fin) { R.render(s, roomInfo()); if (sonne()) A.ring(true); } });
  }
  // Le combiné décroché : la liste des numéros, sans rien de la conversation.
  function composerPop() {
    var h = '<div class="who"><span>LE TÉLÉPHONE</span><button class="x" data-close="1" aria-label="Fermer">×</button></div><p>Qui appeler ?</p><div class="ab">';
    t.objets.phone.forEach(function (x) { var q = String(x.qui).toLowerCase(); h += '<button class="ch" data-dial="' + x.id + '">' + esc(q.charAt(0).toUpperCase() + q.slice(1)) + '</button>'; });
    openPop(h + '</div>', function () { sel = null; if (s && !s.fin) R.render(s, roomInfo()); });
  }
  function composer(id) {
    var x = t.objets.phone.filter(function (y) { return y.id === id; })[0]; if (!x) return;
    popDone = null;
    // Un simple numéro à composer : on compose tout de suite. Sinon, la conversation et ses réponses.
    if (!x.B && !x.C && x.A.ok && /^Composer/.test(x.A.label)) { $('pop').hidden = true; return act({ type: 'situation', id: x.id, choix: 'A' }); }
    objetPop('', '', [x], true);
  }
  $('pop').addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (!b) { if (e.target.id === 'pop' && $('card').querySelector('[data-go], [data-close]')) closePop(); return; }
    if (b.disabled) return;
    A.init();
    if (b.dataset.go && typer) return typer.finir(); // premier toucher : tout afficher
    if (b.dataset.go || b.dataset.close) return closePop();
    if (b.dataset.dial) return composer(b.dataset.dial);
    if (b.dataset.ok) { confirmer = false; var a0 = JSON.parse(b.dataset.ok); popDone = null; $('pop').hidden = true; return act(a0); }
    if (b.dataset.no) { confirmer = false; return closePop(); }
    if (b.dataset.sit) {
      var a = { type: 'situation', id: b.dataset.sit, choix: b.dataset.c }, k = forcedKind();
      // Agir ailleurs pendant un ordre ou un appel : refus immédiat, sans confirmation (le moteur s'en charge).
      popDone = null; $('pop').hidden = true; act(a);
    }
  });

  function estGratuit(id) { var ok = false; Object.keys(t.objets).forEach(function (o) { t.objets[o].forEach(function (x) { if (x.id === id && x.gratuit) ok = true; }); }); return ok; }

  // ---------- lecture des événements du moteur ----------
  async function play(events, my, auto) {
    var lines = [];
    for (var i = 0; i < events.length; i++) {
      if (my !== run) return false;
      var e = events[i];
      switch (e.t) {
        case 'choix': addHist('› ' + e.label, 'me'); break;
        case 'ecran':
          // Le popup passe avant la suite du moniteur : tout reste dans l'ordre.
          if (lines.length) { R.render(s, roomInfo()); renderBag(); var l0 = lines; lines = []; if (!(await montrer(l0, my, auto))) return false; }
          var n = R.ecran(e.txt, { glitch: 250 }); lastEcran = e.txt; A.sfx('glitch'); addHist(ecranTxt(e.txt), 'ecr'); await wait(tempsEcran(n), my); break;
        case 'tel': case 'narr': case 'voix': lines.push(e); addHist(e.txt, e.t === 'narr' ? '' : 'tel'); break;
        case 'image': lines.push(e); break;
        case 'papier': lines.push(e); addHist((e.p.titre ? e.p.titre + ' : ' : '') + e.p.recto.join(' '), 'tel'); break;
        case 'press': R.press(); A.sfx('clac'); await wait(250, my); break;
        case 'cri': R.harm(e.vie); A.sfx('cry'); await wait(700, my); break;
        case 'soupcon': if (e.d > 0) { A.sfx('blink'); toast('La caméra t\'a vu.', 'ecr'); addHist('La caméra t\'a vu.', 'ecr'); } break;
        case 'objet':
          if (POCHES.indexOf(e.k) >= 0 || e.k === 'code41') {
            var txt = (e.gain ? '+ ' : '− ') + E.OBJETS[e.k];
            toast(txt, 'obj'); addHist(txt, 'obj'); if (e.gain) { A.sfx('paper'); flashItems.push(e.k); }
            await wait(400, my);
          }
          break;
        case 'porte': A.sfx(e.open ? 'lock' : 'slam'); await wait(400, my); break;
        case 'son': A.sfx(e.n); if (e.n === 'alarm') R.alarm(2600); break;
        case 'cycle': if (e.n === 5 || e.n === 6) R.render(s, roomInfo()); break;
        case 'anim':
          if (e.n === 'silArrive') introSil = false;
          if (e.n === 'panne') noirVu = true; else if (e.n === 'lumiere') noirVu = false;
          R.anim(e.n);
          if (e.n === 'silFrappe') A.sfx('knock'); else if (e.n === 'lumiere') A.sfx('lock'); else if (e.n === 'panne') A.sfx('gresil'); else if (e.n === 'camTourne') A.sfx('blink');
          await wait(e.n === 'lumiere' ? 900 : e.n === 'panne' ? 1100 : e.n === 'video' ? 5200 : 500, my); break;
      }
    }
    // Le popup ne répète pas le moniteur : seulement le téléphone, la voix de la 18 et ce qu'on voit ou fait.
    if (lines.length && my === run) { R.render(s, roomInfo()); renderBag(); return montrer(lines, my, auto); }
    return my === run;
  }
  // Popup seulement pour une discussion (téléphone, voix de la 18), un papier ou un moment fort (gardien, indice).
  // Une simple description de ce qu'on voit ou entend passe en bandeau, sans bloquer.
  async function montrer(lines, my, auto) {
    if (lines.some(function (e) { return e.t !== 'narr' || e.pop; })) return infoPop(lines, my, auto);
    for (var i = 0; i < lines.length; i++) {
      if (my !== run) return false;
      var n = lines[i].txt.length; toast(lines[i].txt, '', 1600 + n * 45);
      await wait(Math.min(3200, 700 + n * 30), my);
    }
    return my === run;
  }

  // ---------- un moment de jeu ----------
  function forcedKind() { return t ? t.forcedKind : null; }
  // 18 sans signal : 30 s sans geste et l'évaluation se termine. Chaque geste relance l'attente.
  function attenteSeul() { return t && !forcedKind() && t.duree && s.flags.mortA != null && s.cycle > s.flags.mortA && s.cycle !== 5; }
  // Garde-fou : pendant une séquence (textes, animations), tout est grisé ; pendant une sonnerie, seul le téléphone répond.
  // Pendant un ordre, tout reste permis : agir ailleurs ou laisser passer le temps = désobéir.
  function verrou() { var k = forcedKind(); return !t || s.fin ? null : busy ? '*' : (k === 'appel' || (t.sonne && ringT)) ? 'phone' : null; }
  function sonne() { return !busy && t && ((t.sonne && ringT) || (forcedKind() === 'appel' && sel !== 'phone')); }
  function roomInfo() {
    var k = forcedKind();
    return {
      cameraAveugle: E.cameraAveugle(s), porteOuverte: E.porteOuverte(s), urgence: noirVu, silCachee: introSil,
      ordre: !busy && k === 'ordre', sonne: sonne(), seulObjet: verrou(), decroche: sel === 'phone' && !$('pop').hidden, ecoute: E.ecoute(s)
    };
  }

  function startCycle(my) {
    if (my !== run) return;
    t = E.turn(s); busy = false; sel = null; confirmer = false; noirVu = s.cycle === 5;
    var k = forcedKind();
    clearTimeout(ringT); ringT = null;
    if (k === 'ordre') R.ecran(t.forced.ecran, { color: '#ff8a7a' });
    else if (k === 'appel' || t.sonne) {
      if (t.forced && t.forced.ecran) R.ecran(t.forced.ecran);
      A.ring(true); toast('Le téléphone sonne.'); addHist('Le téléphone sonne.');
      // Un appel libre (le premier) sonne trente secondes, puis se tait ; on pourra rappeler.
      // Le premier appel sonne trente secondes (chrono du moteur) : décrocher ou le laisser sonner.
      if (t.sonne) ringT = true;
    }
    else if (!lastEcran) R.ecran('TEST EN|COURS.');
    lastEcran = '';
    timeTotal = timeLeft = (t.duree || 0) * 1000; lastTick = performance.now(); lastSec = -1;
    if (tuto && s.cycle > 3) { tuto = false; try { localStorage.setItem(TUTO_KEY, '1'); } catch (e) {} }
    // Sauvegarde à chaque moment : « Continuer » reprend ici.
    ecrire(SAVE_KEY, { v: 5, s: s, hist: hist.slice(-60) });
    refresh();
    // Un moment imposé (proposition du Système, scène qui demande une décision) s'ouvre tout seul.
    if (k === 'impose') { sel = t.forced.objet; objetPop('', '', [t.forced], false); }
  }

  function refresh() {
    // Trois phases sonores : installation, surveillance accrue, confrontation finale (le silence gagne).
    var phase = s.cycle < 8 ? 1 : s.cycle < 16 ? 2 : 3;
    A.ambiance({ vie: s.vie, soupcon: s.soupcon, phase: phase, vent: s.cycle === 5 ? 'off' : phase === 3 ? 'faible' : 'normal', actif: !!t && !s.fin && !paused });
    R.render(s, roomInfo());
    renderBag(); updateTimer();
    var k = forcedKind(), hint = !busy && t && tuto && s.cycle <= 3 ? (k === 'ordre' ? E.AIDES.ordre : (k === 'appel' || (t.sonne && ringT)) ? E.AIDES.appel : !k ? E.AIDES.libre : '') : '';
    $('hintcap').textContent = hint; $('hintcap').hidden = !hint;
    $('waitBtn').hidden = !(t && !busy && t.peutAttendre && !s.fin && !verrou());
  }

  // ---------- inventaire ----------
  function possede(k) { return E.has(s, k) || (k === 'code' && E.has(s, 'code41')); }
  function codeTexte() { var a = E.has(s, 'code'), b = E.has(s, 'code41'); return a && b ? '7412' : a ? '7__2' : '41'; }
  function nomPoche(k) { return k === 'code' ? 'Code ' + codeTexte() : E.OBJETS[k]; }
  function renderBag() {
    $('bag').innerHTML = POCHES.map(function (k) {
      if (!possede(k)) return '<div class="slot"></div>';
      var nom = nomPoche(k);
      return '<button class="slot' + (flashItems.indexOf(k) >= 0 || (k === 'code' && flashItems.indexOf('code41') >= 0) ? ' flash' : '') + '" data-k="' + k + '" aria-label="' + esc(nom) + '" title="' + esc(nom) + '">' + R.icone(k, codeTexte()) + '</button>';
    }).join('');
  }
  $('bag').addEventListener('click', function (e) {
    var b = e.target.closest('button.slot'); if (!b || !s || s.fin || paused) return;
    A.init();
    var k = b.dataset.k, o = POCHE_OBJET[k], list = !busy && t && o && !forcedKind() && !verrou() ? t.objets[o] : null;
    flashItems = flashItems.filter(function (x) { return x !== k; }); renderBag();
    if (list && list.length) { sel = o; objetPop(nomPoche(k), '', list, true); }
    else if (k === 'journal') { openPop('<div class="who"><span>' + esc(nomPoche(k)) + '</span><button class="x" data-close="1" aria-label="Fermer">×</button></div>' + (s.flags.journal || []).slice().sort(function (a, b) { return a.n - b.n; }).map(function (p) { return lettreHtml({ titre: p.titre, recto: p.lignes, signature: '—16' }); }).join(''), null); }
    else if (E.LETTRES[k]) { openPop('<div class="who"><span>' + esc(nomPoche(k)) + '</span><button class="x" data-close="1" aria-label="Fermer">×</button></div>' + lettreHtml(k, true), null); }
    else objetPop(nomPoche(k), E.decrire(s, k), null, true);
  });

  // ---------- toucher un objet de la pièce ----------
  // Heure affichée par le moniteur (fictive : la séance commence à 14:02).
  function horloge() { var x = Math.floor(performance.now() / 1000) + 14 * 3600 + 120; return [Math.floor(x / 3600) % 24, Math.floor(x / 60) % 60, x % 60].map(function (n) { return (n < 10 ? '0' : '') + n; }).join(':'); }
  var TITRES = { mug: 'LA TASSE', compart: 'LE COMPARTIMENT', phone: 'LE TÉLÉPHONE', drawer: 'LE TIROIR', grille: 'LA GRILLE', box: 'LE BOÎTIER', trappe: 'LA TRAPPE', camera: 'LA CAMÉRA', note: 'LE MOT', bureau: 'SOUS LE BUREAU', window: 'LA CHAMBRE 18', monitor: 'LE MONITEUR', light: 'LA LAMPE', mug: 'LA TASSE', door: 'LA PORTE' };
  function hot(k) {
    A.init();
    if (!$('intro').hidden) return;
    if (s && busy && !s.fin) { passer(); return; }
    if (!s || s.fin || paused || busy || !t || !$('pop').hidden) return;
    var kind = forcedKind(), v = verrou(); calmeT = performance.now();
    if (v && k !== v && k !== 'monitor') { toast('Le téléphone sonne.'); return; }
    if (attenteSeul()) timeLeft = timeTotal;
    // La caméra voit le geste : petit mouvement, et le moniteur le note.
    if (k !== 'btn' && s.cycle >= 3 && !E.cameraAveugle(s) && TITRES[k]) { R.camRegarde(); A.sfx('servo'); R.journal(horloge() + ' — SUJET 17 : ' + TITRES[k].replace(/^(LE |LA |LES |L')/, '')); }
    var exit = t.sorties.filter(function (x) { return (x.via === 'porte' && k === 'door') || (x.via === 'trappe' && k === 'trappe' && !t.objets.trappe); })[0];
    if (exit) return act({ type: 'sortir', via: exit.via });
    if (kind === 'impose') { sel = t.forced.objet; objetPop('', '', [t.forced], false); return; }
    if (k === 'btn') {
      if (!kind || kind === 'ordre') return act({ type: 'appuyer' });
      return toast('Le téléphone sonne.');
    }
    // Pendant un ordre ou un appel, on peut toucher autre chose : agir ailleurs vaut refus (le moteur le dit sur le moniteur).
    if (k === 'phone' && (kind === 'appel' || (t.sonne && ringT))) { sel = 'phone'; A.ring(false); A.sfx('pickup'); objetPop('', '', t.objets.phone, kind === 'appel' ? false : true); R.render(s, roomInfo()); return; }
    // Téléphone : d'abord choisir qui appeler, ensuite quoi dire.
    if (k === 'phone' && t.objets.phone && t.objets.phone.length > 1) { sel = 'phone'; A.sfx('pickup'); composerPop(); R.render(s, roomInfo()); return; }
    if (t.objets[k]) { sel = k; objetPop(t.objets[k].length > 1 ? (TITRES[k] || '') : '', '', t.objets[k], true); if (k === 'phone') R.render(s, roomInfo()); return; }
    var txt = E.regarder(s, k);
    if (txt) objetPop(TITRES[k] || '', txt, null, true);
  }

  async function act(a) {
    if (busy || !s || s.fin || paused) return;
    var res;
    try { res = E.choose(s, a); } catch (err) { console.error(err); return; }
    var avant = { c: s.cycle, f: E.forcedId(s) };
    busy = true; A.ring(false); sel = null; flashItems = [];
    if (!$('pop').hidden) { popDone = null; $('pop').hidden = true; }
    s = res.state;
    refresh();
    var my = run;
    var ok = await play(res.events, my);
    if (!ok) return;
    R.render(s, roomInfo()); renderBag();
    if (s.fin) return finale(my);
    // Même moment, même ordre (B2 pression par pression, objet ramassé) : le chrono continue.
    if (s.cycle === avant.c && E.forcedId(s) === avant.f) {
      t = E.turn(s); busy = false; lastTick = performance.now();
      if (attenteSeul()) timeLeft = timeTotal;
      if (t.sonne && ringT) A.ring(true);
      ecrire(SAVE_KEY, { v: 5, s: s, hist: hist.slice(-60) });
      return refresh();
    }
    startCycle(my);
  }

  // ---------- chrono : visible seulement pendant un ordre ----------
  var coeurT = 0, tensionOn = false, calmeT = 0, frappeC = -1;
  function updateTimer() {
    var sec = Math.max(0, Math.ceil(timeLeft / 1000)), ordre = !busy && forcedKind() === 'ordre', low = false;
    // Ordre : aucun chrono affiché. Le moniteur garde l'ordre ; la ventilation et un battement sourd montent.
    $('timer').hidden = true;
    if (ordre) {
      var k = timeTotal ? Math.min(1, Math.max(0, 1 - timeLeft / timeTotal)) : 0, nowB = performance.now();
      if (lastSec === -1) R.ecran(t.forced.ecran, { color: '#ff8a7a', instant: true });
      A.tension(k);
      if (nowB >= coeurT) { A.sfx('coeur', k); coeurT = nowB + 1150 - 650 * k; }
    } else if (tensionOn) A.tension(null);
    tensionOn = ordre;
    // Coupure de courant : le moniteur, sur la batterie de secours, compte jusqu'au retour du réseau.
    var coup = !busy && !forcedKind() && t && t.duree && s.cycle === 5;
    if (coup && sec !== lastSec && lastSec !== -1) R.ecran('RÉTABLISSEMENT|RÉSEAU DANS|' + sec + ' S', { color: '#ffb060', instant: true });
    if ((low || (coup && sec <= 3)) && sec !== lastSec && sec > 0) A.sfx('tick');
    lastSec = sec;
  }
  setInterval(function () {
    var nowT = performance.now(), dt = nowT - lastTick; lastTick = nowT;
    // La 18 s'impatiente : après 25 s sans geste dans un moment libre, elle frappe à la vitre (une fois par moment).
    if (!busy && !paused && s && !s.fin && t && !forcedKind() && !t.duree && s.vie > 0 && s.cycle >= 2 && $('pop').hidden && !document.hidden) {
      if (nowT - calmeT > 25000 && frappeC !== s.cycle) { frappeC = s.cycle; R.anim('silFrappe'); A.sfx('knock'); }
    } else calmeT = nowT;
    if (busy || paused || confirmer || !s || s.fin || document.hidden || !t || !timeTotal) return;
    if (attenteSeul() && !$('pop').hidden) return; // lire un texte, c'est encore agir
    if (sel === 'phone' && !$('pop').hidden && (t.sonne || forcedKind() === 'appel')) return; // en ligne : l'appel ne se coupe pas
    timeLeft -= dt; updateTimer();
    if (timeLeft <= 0) act({ type: 'temps' });
  }, 100);
  function setPaused(p) {
    paused = p; $('pauseBtn').textContent = p ? 'Reprendre' : 'Pause'; $('pauseBtn').setAttribute('aria-pressed', p); $('pausedLbl').hidden = !p;
    A.ambiance({ actif: !p && !!t && s && !s.fin });
    if (p) A.ring(false); else if (sonne()) A.ring(true);
  }
  $('pausedLbl').addEventListener('click', function () { setPaused(false); });
  $('waitBtn').onclick = function () { A.init(); if (!busy && t && t.peutAttendre && !verrou() && $('pop').hidden) act({ type: 'attendre' }); };

  // ---------- fin ----------
  var SONS_FIN = { conforme: 'lock', employe: 'lock', marche: 'ring', seulDehors: 'thud', porteDerobee: 'thud', evasion: 'alarm', cooperation: 'lock', sauvetage: 'thud', tropTard: 'blink', complice: 'alarm', sujet18: 'thud', miroir: 'glitch', boucle: 'blink', isolement: 'slam', gardien: 'alarm', temoin: 'pickup', revolte: 'alarm', tempsEcoule: 'cry', curiosite: 'slam' };
  function texteFin(F) { return (s.flags.variante && F.variante && F.variante[s.flags.variante]) || F.texte; }
  async function finale(my) {
    var F = E.FINS[s.fin];
    ecrire(SAVE_KEY, null);
    A.ring(false); A.ambiance({ actif: false }); $('timer').hidden = true; $('hintcap').hidden = true;
    R.ecran(F.crt === '_' ? '' : F.crt, { glitch: 500 });
    R.fin(s.fin);
    var son = SONS_FIN[s.fin];
    if (son === 'ring') { A.ring(true); setTimeout(function () { A.ring(false); }, 2600); } else if (son) A.sfx(son);
    if (!(await wait(3200, my))) return;
    histoireFin(my);
  }
  // Mini-histoire : quatre planches avant le bilan. Toucher pour avancer, « Passer » pour aller au bilan.
  // Illustration manquante → image provisoire marquée « ILLUSTRATION À VENIR » (docs/ILLUSTRATIONS_FINS.md).
  function histoireFin(my) {
    var P = E.histoire(s), i = 0;
    if (!P.length) { endScreen(); return; }
    $('endBox').className = 'end histoire'; $('endOv').hidden = false;
    function suivante() {
      if (my !== run) return;
      if (i >= P.length) { $('endBox').className = 'end'; endScreen(); return; }
      var p = P[i++], img = new Image();
      $('endBox').innerHTML = '<div class="planche"><div class="hcadre"><div class="hmanque" hidden>ILLUSTRATION À VENIR<br>' + esc(p.img) + '</div></div>' +
        '<div class="htexte"><div class="k">' + esc(E.FINS[s.fin].titre.toUpperCase()) + ' · ' + i + ' / ' + P.length + '</div><p>' + esc(p.texte) + '</p>' +
        '<div class="endbtns"><button class="enter" id="hSuite">' + (i < P.length ? 'Suite' : 'Bilan') + '</button><button class="mbtn" id="hPasser">Passer</button></div></div></div>';
      var cadre = $('endBox').querySelector('.hcadre');
      img.alt = ''; img.onerror = function () { img.onerror = null; img.src = 'assets/img/' + p.generique + '.webp'; img.className = 'provisoire'; cadre.querySelector('.hmanque').hidden = false; };
      img.src = 'assets/img/fins/' + p.img + '.webp'; cadre.insertBefore(img, cadre.firstChild);
      A.sfx('tick');
      $('hSuite').onclick = function (e) { e.stopPropagation(); suivante(); };
      $('hPasser').onclick = function (e) { e.stopPropagation(); i = P.length; suivante(); };
      cadre.onclick = suivante;
      $('hSuite').focus();
    }
    suivante();
  }
  function loadFound() { try { return JSON.parse(localStorage.getItem(FOUND_KEY) || '{}') || {}; } catch (e) { return {}; } }
  function endScreen() {
    var found = loadFound(); found[s.fin] = 1;
    try { localStorage.setItem(FOUND_KEY, JSON.stringify(found)); } catch (e) {}
    ecrireMemoire({ sessions: s.memoire.session, dernier: { fin: s.fin, presses: s.stats.presses } });
    var F = E.FINS[s.fin];
    var ids = E.FIN_IDS.slice().sort(function (a, b) { return (E.FINS[a].bonus ? 99 : E.FINS[a].n) - (E.FINS[b].bonus ? 99 : E.FINS[b].n); });
    var nb = ids.filter(function (k) { return found[k] && !E.FINS[k].bonus; }).length;
    var h = '<div class="k">' + (F.bonus ? 'FIN BONUS' : 'FIN ' + F.n + ' / 18') + '</div><h2>' + esc(F.titre) + '</h2>';
    if (F.crt !== '_') h += '<div class="crt">' + esc(F.crt) + '</div>';
    h += '<p>' + esc(texteFin(F)) + '</p>';
    h += '<p class="truth">' + (E.has(s, 'verite') ? esc(E.VERITES[s.truth].texte) : 'Ce que cachait la Chambre 18 : tu ne l\'as pas découvert.') + '</p>';
    // Trois éléments au plus : un acte décisif, sa conséquence, une question encore ouverte.
    h += '<ul class="bilan">' + E.bilan(s).map(function (l) { return '<li>' + esc(l) + '</li>'; }).join('') + '</ul>';
    h += '<div class="k">FINS DÉCOUVERTES : ' + nb + ' / 18</div><div class="fins">' + ids.map(function (k) {
      return '<span class="' + (k === s.fin ? 'cur' : found[k] ? 'on' : '') + '">' + (found[k] ? esc(E.FINS[k].titre) : '???') + '</span>';
    }).join('') + '</div>';
    h += '<div class="endbtns"><button class="enter" id="againBtn">Retourner dans la Chambre 17</button><button class="mbtn" id="menuBtn2">Menu</button></div>';
    $('endBox').innerHTML = h; $('endOv').hidden = false;
    $('againBtn').onclick = function () { $('endOv').hidden = true; start(); };
    $('menuBtn2').onclick = function () { $('endOv').hidden = true; titre(); };
    $('againBtn').focus();
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !$('pop').hidden && $('card').querySelector('[data-go], [data-close]')) { closePop(); return; }
    if (e.code === 'Space' && $('pop').hidden && e.target.tagName !== 'BUTTON' && !(e.target.closest && e.target.closest('#btn'))) { e.preventDefault(); hot('btn'); }
  });

  // ---------- partie ----------
  // Reprendre la partie sauvegardée, au début du dernier moment.
  async function reprendre() {
    var sv = lire(SAVE_KEY); if (!sv || !sv.s) return start();
    run++; var my = run;
    A.stopAll(); setPaused(false);
    if (!$('pop').hidden) { popDone = null; $('pop').hidden = true; }
    s = sv.s; t = null; busy = true; sel = null; lastEcran = ''; hist = sv.hist || []; flashItems = []; introSil = false; tuto = false;
    $('histBox').innerHTML = ''; $('histBox').hidden = true;
    timeLeft = timeTotal = 0; refresh(); R.ecran('');
    R.blackout(true);
    if (!(await wait(900, my))) return;
    R.anim('lumiere'); A.sfx('lock');
    R.ecran('REPRISE DE|SESSION.', { glitch: 300 });
    if (!(await wait(1600, my))) return;
    startCycle(my);
  }

  async function start() {
    ecrire(SAVE_KEY, null);
    run++; var my = run;
    A.stopAll(); setPaused(false);
    if (!$('pop').hidden) { popDone = null; $('pop').hidden = true; }
    var mem = lireMemoire();
    s = E.newGame({ memoire: { session: mem ? mem.sessions + 1 : 1, dernier: mem ? mem.dernier : null } });
    t = null; busy = true; sel = null; lastEcran = ''; hist = []; flashItems = []; introSil = true;
    try { tuto = !localStorage.getItem(TUTO_KEY); } catch (e) { tuto = true; }
    $('histBox').innerHTML = ''; $('histBox').hidden = true;
    timeLeft = timeTotal = 0; refresh();
    R.ecran('');
    // Démarrage : écran noir, le moniteur s'allume, puis la lumière avec le bruit sec d'un relais.
    // Écran noir, un souffle de ventilation, puis le relais (anim « lumiere »).
    R.blackout(true);
    if (!(await wait(1800, my))) return;
    // Réglage « passer les passages déjà vus » : l'introduction, déjà vue, est sautée (elle ne contient aucun choix).
    if (reglages.passer && s.memoire.session > 1) { E.intro(s); R.anim('lumiere'); A.sfx('lock'); R.ecran('Familiarisez-vous|avec votre poste.'); if (!(await wait(1200, my))) return; }
    else if (!(await play(E.intro(s), my, true))) return;
    introSil = false;
    startCycle(my);
  }

  R.mount($('scene'), hot);
  $('muteBtn').onclick = function () { reglages.muet = !reglages.muet; ecrire(REGLAGES_KEY, reglages); appliquer(); };
  $('pauseBtn').onclick = function () { if (s && !s.fin && $('intro').hidden) setPaused(!paused); };
  $('restartBtn').onclick = function () { if (!$('intro').hidden) return; $('endOv').hidden = true; titre(); };

  // ---------- écran titre : Continuer, Nouvelle partie, Fins découvertes, Réglages ----------
  function titre() {
    run++; busy = true; A.stopAll(); A.ambiance({ actif: false }); setPaused(false); $('pausedLbl').hidden = true;
    if (!$('pop').hidden) { popDone = null; $('pop').hidden = true; }
    $('timer').hidden = true; $('hintcap').hidden = true;
    var sv = lire(SAVE_KEY);
    $('contBtn').hidden = !(sv && sv.s);
    panneau(null); $('intro').hidden = false;
  }
  function panneau(id) { ['menuMain', 'finsPanel', 'setPanel'].forEach(function (p) { $(p).hidden = p !== (id || 'menuMain'); }); }
  function entrer(f) {
    A.init(); A.startAmbience(); $('intro').hidden = true;
    // Sur téléphone : plein écran et paysage, quand le navigateur le permet.
    try {
      if (window.matchMedia('(pointer: coarse)').matches && document.documentElement.requestFullscreen && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(function () { if (screen.orientation && screen.orientation.lock) return screen.orientation.lock('landscape'); }).catch(function () {});
      }
    } catch (e) {}
    f();
  }
  $('contBtn').onclick = function () { entrer(reprendre); };
  $('newBtn').onclick = function () { entrer(start); };
  $('finsBtn').onclick = function () {
    var found = loadFound(), ids = E.FIN_IDS.slice().sort(function (a, b) { return (E.FINS[a].bonus ? 99 : E.FINS[a].n) - (E.FINS[b].bonus ? 99 : E.FINS[b].n); });
    var nb = ids.filter(function (k) { return found[k] && !E.FINS[k].bonus; }).length;
    $('finsList').innerHTML = '<p class="k">' + nb + ' / 18</p><ol>' + ids.map(function (k) {
      var F = E.FINS[k]; return '<li class="' + (found[k] ? 'on' : '') + '"><b>' + (F.bonus ? 'Bonus' : F.n) + '</b>' + (found[k] ? esc(F.titre) : '???') + '</li>';
    }).join('') + '</ol>';
    panneau('finsPanel');
  };
  $('setBtn').onclick = function () { majReglages(); panneau('setPanel'); };
  Array.prototype.forEach.call(document.querySelectorAll('[data-back]'), function (b) { b.onclick = function () { panneau(null); }; });
  // Réglages : vitesse du texte et son (gardés dans ce navigateur).
  var reglages = lire(REGLAGES_KEY) || { vitesse: 'normal', muet: false };
  function appliquer() {
    vitesse = reglages.vitesse; R.setVitesse(reglages.vitesse); A.setMuted(!!reglages.muet);
    $('muteBtn').textContent = 'Son : ' + (reglages.muet ? 'non' : 'oui'); $('muteBtn').setAttribute('aria-pressed', !!reglages.muet);
  }
  function majReglages() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-vit]'), function (b) { b.setAttribute('aria-pressed', b.dataset.vit === reglages.vitesse); });
    $('sonSet').textContent = reglages.muet ? 'Non' : 'Oui'; $('sonSet').setAttribute('aria-pressed', !reglages.muet);
    $('passSet').textContent = reglages.passer ? 'Oui' : 'Non'; $('passSet').setAttribute('aria-pressed', !!reglages.passer);
  }
  Array.prototype.forEach.call(document.querySelectorAll('[data-vit]'), function (b) { b.onclick = function () { reglages.vitesse = b.dataset.vit; ecrire(REGLAGES_KEY, reglages); appliquer(); majReglages(); }; });
  $('passSet').onclick = function () { reglages.passer = !reglages.passer; ecrire(REGLAGES_KEY, reglages); majReglages(); };
  // Remise à zéro explicite de la mémoire du Système (et des fins découvertes).
  $('oubliSet').onclick = function () { ecrire(SESSION_KEY, null); ecrire(FOUND_KEY, null); this.textContent = 'Mémoire effacée'; };
  $('sonSet').onclick = function () { reglages.muet = !reglages.muet; ecrire(REGLAGES_KEY, reglages); appliquer(); majReglages(); };
  appliquer(); titre();
  document.addEventListener('visibilitychange', function () { if (document.hidden && s && !s.fin && !paused && $('intro').hidden) setPaused(true); });
  s = E.newGame(); R.render(s, {}); renderBag();
})();
