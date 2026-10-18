/* Le Bouton Rouge — la Chambre 17 en SVG (vue fixe de face) et ses animations.
   Ne contient aucune règle : render() dessine l'état que lui donne game.js. */
(function (root) {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var STENCIL = 'Big Shoulders Stencil Text, Impact, sans-serif';
  var reduce = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var SVG = '' +
  '<svg id="room" viewBox="0 0 600 600" role="img" aria-label="La Chambre 17">' +
  '<defs>' +
  '<linearGradient id="wallG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a3533"/><stop offset="1" stop-color="#1b2322"/></linearGradient>' +
  '<linearGradient id="floorG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b2120"/><stop offset="1" stop-color="#0b0e0e"/></linearGradient>' +
  '<radialGradient id="coneG" cx="50%" cy="0%" r="100%"><stop id="coneStop" offset="0" stop-color="#fff3d6" stop-opacity=".55"/><stop offset="1" stop-color="#fff3d6" stop-opacity="0"/></radialGradient>' +
  '<radialGradient id="btnG" cx="40%" cy="30%" r="80%"><stop id="btnS1" offset="0" stop-color="#ff6a58"/><stop id="btnS2" offset=".45" stop-color="#d4161c"/><stop id="btnS3" offset="1" stop-color="#6e080c"/></radialGradient>' +
  '<radialGradient id="glowG"><stop offset="0" stop-color="#ff2a2a" stop-opacity=".55"/><stop offset="1" stop-color="#ff2a2a" stop-opacity="0"/></radialGradient>' +
  '<pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="2" fill="#000" opacity=".22"/></pattern>' +
  '</defs>' +
  // mur et sol
  '<rect x="0" y="0" width="600" height="470" fill="url(#wallG)"/>' +
  '<g stroke="#33403e" stroke-width="1.5" opacity=".7"><line x1="160" y1="0" x2="160" y2="462"/><line x1="440" y1="0" x2="440" y2="462"/><line x1="0" y1="120" x2="600" y2="120" opacity=".4"/></g>' +
  '<rect x="0" y="462" width="600" height="8" fill="#151b1a"/>' +
  '<polygon points="0,470 600,470 600,600 0,600" fill="url(#floorG)"/>' +
  '<g stroke="#202827" stroke-width="1.2"><line x1="300" y1="470" x2="300" y2="600"/><line x1="200" y1="470" x2="120" y2="600"/><line x1="400" y1="470" x2="480" y2="600"/><line x1="100" y1="470" x2="-60" y2="600"/><line x1="500" y1="470" x2="660" y2="600"/><line x1="0" y1="520" x2="600" y2="520"/></g>' +
  // trappe au sol
  '<g id="trappe" class="hs" data-k="trappe" opacity="0">' +
  '<polygon id="trappeLid" points="34,526 176,526 186,582 16,582" fill="#151b1a" stroke="#4a5754" stroke-width="2"/>' +
  '<rect id="trappeRing" x="90" y="550" width="22" height="6" rx="3" fill="#6b7673"/>' +
  '</g>' +
  // porte
  '<g id="door" class="hs" data-k="door">' +
  '<rect x="26" y="203" width="124" height="266" fill="#111716" stroke="#3b4846" stroke-width="3"/>' +
  '<rect id="doorLight" x="32" y="209" width="112" height="258" fill="#e9f6f0" opacity="0"/>' +
  '<g id="doorPanel">' +
  '<rect x="32" y="209" width="112" height="258" fill="#2e3938"/>' +
  '<rect x="44" y="224" width="88" height="96" fill="none" stroke="#3a4745" stroke-width="2"/>' +
  '<rect x="44" y="336" width="88" height="114" fill="none" stroke="#3a4745" stroke-width="2"/>' +
  '<text x="88" y="285" text-anchor="middle" font-family="' + STENCIL + '" font-weight="800" font-size="40" fill="#46534f">17</text>' +
  '<rect x="116" y="300" width="20" height="30" rx="2" fill="#0d1110"/>' +
  '<circle id="doorLed" cx="126" cy="310" r="4.5" fill="#e3262b"/>' +
  '<rect x="120" y="340" width="16" height="6" rx="3" fill="#8b9592"/>' +
  '</g></g>' +
  // grille d'aération
  '<g id="grille" class="hs" data-k="grille">' +
  '<rect x="470" y="40" width="92" height="56" rx="2" fill="#151b1a" stroke="#4a5754" stroke-width="2"/>' +
  '<g id="grilleSlats" stroke="#5d6a67" stroke-width="3"><line x1="478" y1="52" x2="554" y2="52"/><line x1="478" y1="62" x2="554" y2="62"/><line x1="478" y1="72" x2="554" y2="72"/><line x1="478" y1="82" x2="554" y2="82"/></g>' +
  '<g fill="#8b9592"><circle cx="475" cy="45" r="2"/><circle cx="557" cy="45" r="2"/><circle cx="475" cy="91" r="2"/><circle cx="557" cy="91" r="2"/></g>' +
  '</g>' +
  // vitre de la chambre 18 + ses 3 lumières (sa vie)
  '<g id="win" class="hs" data-k="window">' +
  '<rect x="446" y="138" width="136" height="194" fill="#0f1414" stroke="#3b4846" stroke-width="4"/>' +
  '<rect id="glass" x="454" y="146" width="120" height="178" fill="#7d7150"/>' +
  '<g id="sil" opacity=".82">' +
  '<ellipse cx="514" cy="214" rx="18" ry="22" fill="#0b0e0e"/>' +
  '<path d="M470 324 Q472 262 514 250 Q556 262 558 324 Z" fill="#0b0e0e"/>' +
  '</g>' +
  '<rect x="454" y="146" width="120" height="178" fill="#e8f0ec" opacity=".2"/>' +
  '<g stroke="#ffffff" stroke-width="1" opacity=".12"><line x1="460" y1="160" x2="500" y2="150"/><line x1="470" y1="300" x2="560" y2="280"/></g>' +
  '<text x="514" y="350" text-anchor="middle" font-family="' + STENCIL + '" font-weight="700" font-size="15" fill="#5d6a67" letter-spacing="2">CH. 18</text>' +
  '</g>' +
  '<g id="vies"><rect x="482" y="112" width="64" height="18" rx="9" fill="#0d1110" stroke="#3b4846"/>' +
  '<circle id="vie1" cx="497" cy="121" r="5"/><circle id="vie2" cx="514" cy="121" r="5"/><circle id="vie3" cx="531" cy="121" r="5"/></g>' +
  // boîtier électrique
  '<g id="box" class="hs" data-k="box">' +
  '<rect x="458" y="366" width="114" height="84" rx="3" fill="#161d1c" stroke="#59645f" stroke-width="2"/>' +
  '<path d="M468 374 l8 0 l-6 10 l8 0 l-12 16 l4 -12 l-7 0z" fill="#f2c14e" opacity=".8"/>' +
  '<text x="530" y="386" text-anchor="middle" font-family="' + STENCIL + '" font-weight="700" font-size="11" fill="#7f8d89" letter-spacing="2">COURANT</text>' +
  '<g id="boxOpen" opacity="0">' +
  '<rect x="484" y="396" width="20" height="40" rx="2" fill="#0b0f0e"/><rect id="levCam" x="486" y="399" width="16" height="16" rx="2" fill="#d4dcd9"/>' +
  '<rect x="526" y="396" width="20" height="40" rx="2" fill="#0b0f0e"/><rect id="levBtn" x="528" y="399" width="16" height="16" rx="2" fill="#d4dcd9"/>' +
  '<text x="494" y="447" text-anchor="middle" font-family="VT323, monospace" font-size="12" fill="#bff5e4">CAM</text>' +
  '<text x="536" y="447" text-anchor="middle" font-family="VT323, monospace" font-size="12" fill="#bff5e4">BTN</text>' +
  '</g></g>' +
  // moniteur
  '<g class="hs" data-k="monitor">' +
  '<rect x="290" y="44" width="20" height="20" fill="#151b1a"/>' +
  '<rect x="158" y="60" width="284" height="172" rx="8" fill="#111615" stroke="#36403e" stroke-width="2"/>' +
  '<text x="300" y="226" text-anchor="middle" font-family="' + STENCIL + '" font-weight="700" font-size="9" fill="#4d5956" letter-spacing="2">UNITÉ 17</text>' +
  '</g>' +
  // caméra
  '<g transform="translate(78 64)" class="hs" data-k="camera">' +
  '<rect x="-7" y="-64" width="14" height="56" fill="#1a2120"/>' +
  '<g id="camRot" transform="rotate(25)">' +
  '<rect x="-10" y="-11" width="50" height="22" rx="5" fill="#c4ccc9"/>' +
  '<rect x="34" y="-8" width="12" height="16" rx="2" fill="#8d9794"/>' +
  '<circle cx="44" cy="0" r="6" fill="#0b0d0d"/>' +
  '<circle id="camLed" cx="2" cy="-3" r="3" fill="#3b3f3e"/>' +
  '<path id="camMask" opacity="0" d="M20 -16 L58 -14 L62 22 L48 30 L36 20 L22 26 Z" fill="#3a2f2a"/>' +
  '</g></g>' +
  // lampe
  '<polygon id="cone" points="276,54 324,54 480,470 120,470" fill="url(#coneG)" opacity=".6" style="pointer-events:none"/>' +
  '<g class="hs" data-k="light">' +
  '<line x1="300" y1="0" x2="300" y2="30" stroke="#0f1312" stroke-width="3"/>' +
  '<path d="M272 50 L284 30 L316 30 L328 50 Z" fill="#283130"/>' +
  '<ellipse id="bulb" cx="300" cy="53" rx="11" ry="6" fill="#fff3d6"/>' +
  '</g>' +
  // socle, tiroir et bouton
  '<rect x="160" y="432" width="280" height="38" fill="#252d2c" stroke="#3a4644" stroke-width="2"/>' +
  '<g id="drawer" class="hs" data-k="drawer"><rect x="166" y="434" width="74" height="40" fill="transparent"/>' +
  '<rect x="176" y="440" width="54" height="24" fill="#070909"/>' +
  '<g id="drawerFront"><rect x="176" y="440" width="54" height="24" fill="#2f3938" stroke="#46524f"/><rect x="195" y="449" width="16" height="4" rx="2" fill="#8b9592"/></g>' +
  '</g>' +
  '<g class="hs" data-k="bureau"><rect x="214" y="470" width="172" height="104" fill="#1b2221"/>' +
  '<g opacity=".85"><rect x="228" y="488" width="144" height="12" fill="#f2c14e"/><g fill="#1b2221"><path d="M236 488 h8 l-8 12 h-8z"/><path d="M256 488 h8 l-8 12 h-8z"/><path d="M276 488 h8 l-8 12 h-8z"/><path d="M296 488 h8 l-8 12 h-8z"/><path d="M316 488 h8 l-8 12 h-8z"/><path d="M336 488 h8 l-8 12 h-8z"/><path d="M356 488 h8 l-8 12 h-8z"/><path d="M376 488 h8 l-8 12 h-8z"/></g></g>' +
  '<text x="300" y="526" text-anchor="middle" font-family="' + STENCIL + '" font-weight="800" font-size="16" fill="#3e4a48" letter-spacing="4">ACTIVATION</text>' +
  '<g stroke="#2d3736" stroke-width="1.4"><line x1="230" y1="545" x2="230" y2="562"/><line x1="236" y1="545" x2="236" y2="562"/><line x1="242" y1="545" x2="242" y2="562"/><line x1="248" y1="545" x2="248" y2="562"/><line x1="226" y1="556" x2="252" y2="550"/></g></g>' +
  '<g id="btn" class="hs" data-k="btn" role="button" tabindex="0" aria-label="Appuyer sur le bouton rouge">' +
  '<ellipse cx="300" cy="434" rx="74" ry="15" fill="#0b0d0d"/>' +
  '<ellipse cx="300" cy="428" rx="64" ry="13" fill="#3a3f3f"/>' +
  '<g id="dome"><path d="M240 426 Q240 376 300 374 Q360 376 360 426 Q330 438 300 438 Q270 438 240 426 Z" fill="url(#btnG)"/><ellipse cx="283" cy="392" rx="20" ry="8" fill="#fff" opacity=".32"/></g>' +
  '</g>' +
  // objets sur le socle et au sol
  '<g id="phone" class="hs" data-k="phone" opacity="0" transform="translate(-36 0)"><rect x="196" y="388" width="64" height="50" fill="transparent"/><g id="phoneInner">' +
  '<rect x="208" y="414" width="40" height="18" rx="4" fill="#1d1d1d"/><rect x="204" y="402" width="48" height="12" rx="6" fill="#2c2c2c"/><circle cx="228" cy="423" r="4" fill="#3a3a3a"/>' +
  '</g></g>' +
  '<g class="hs" data-k="mug" transform="translate(34 0)"><rect x="358" y="398" width="40" height="36" fill="transparent"/><rect x="364" y="406" width="18" height="24" rx="3" fill="#d6d1c4"/><path d="M382 412 q8 0 8 7 q0 7 -8 7" fill="none" stroke="#d6d1c4" stroke-width="3"/></g>' +
  '<g id="note" class="hs" data-k="note" opacity="0"><rect x="50" y="462" width="80" height="44" fill="transparent"/><g transform="rotate(-6 90 482)"><rect x="70" y="472" width="40" height="22" fill="#e7e2d2"/><g stroke="#9a9484" stroke-width="1"><line x1="75" y1="479" x2="104" y2="479"/><line x1="75" y1="484" x2="100" y2="484"/><line x1="75" y1="489" x2="96" y2="489"/></g></g></g>' +
  // lumière et alarme
  '<rect id="tint" x="0" y="0" width="600" height="600" fill="#ff1e1e" opacity="0" style="pointer-events:none"/>' +
  '<rect id="dark" x="0" y="0" width="600" height="600" fill="#000" opacity="0" style="pointer-events:none"/>' +
  '<ellipse id="btnGlow" cx="300" cy="410" rx="90" ry="50" fill="url(#glowG)" opacity="0" style="pointer-events:none"/>' +
  // écran (reste lisible dans le noir)
  '<g style="pointer-events:none">' +
  '<rect id="screen" x="170" y="72" width="260" height="140" rx="6" fill="#071311"/>' +
  '<g id="scr" font-family="VT323, Courier New, monospace" fill="#bff5e4" text-anchor="middle"></g>' +
  '<rect x="170" y="72" width="260" height="140" rx="6" fill="url(#scan)"/>' +
  '</g>' +
  '<rect id="flash" x="0" y="0" width="600" height="600" fill="#fff" opacity="0" style="pointer-events:none"/>' +
  '</svg>';

  var svg = null, onHot = null, track = false, glitchT = null;
  function $(id) { return document.getElementById(id); }
  function attr(id, k, v) { var e = $(id); if (e) e.setAttribute(k, v); }

  function mount(el, handler) {
    el.innerHTML = SVG; svg = $('room'); onHot = handler;
    svg.addEventListener('pointermove', function (e) { var p = pt(e); aim(p.x, p.y); });
    svg.addEventListener('click', function (e) {
      var p = pt(e); aim(p.x, p.y);
      var h = e.target.closest && e.target.closest('[data-k]');
      if (h && onHot) onHot(h.getAttribute('data-k'));
    });
    $('btn').addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); if (onHot) onHot('btn'); } });
  }
  function pt(e) { var r = svg.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * 600, y: (e.clientY - r.top) / r.height * 600 }; }
  function aim(x, y) { if (!track) return; var a = Math.atan2(y - 64, x - 78) * 180 / Math.PI; a = Math.max(-5, Math.min(85, a)); attr('camRot', 'transform', 'rotate(' + a.toFixed(1) + ')'); }

  // ---------- état → dessin ----------
  var GLASS = ['#000', '#463f30', '#5e553e', '#7d7150'];
  function render(s, info) {
    info = info || {};
    resetFx();
    var has = function (k) { return s.items.indexOf(k) >= 0; };
    // vie de la 18
    for (var i = 1; i <= 3; i++) attr('vie' + i, 'fill', s.vie >= i ? '#f2c14e' : '#262c2b');
    attr('glass', 'fill', GLASS[s.vie]);
    attr('sil', 'opacity', s.vie > 0 ? 0.82 : 0);
    attr('sil', 'transform', 'translate(0 ' + (3 - s.vie) * 8 + ')');
    // caméra
    var blind = info.cameraAveugle, cut = has('cameraCoupee');
    track = s.cycle >= 4 && !blind;
    attr('camMask', 'opacity', blind && !cut ? 1 : 0);
    if (cut) attr('camRot', 'transform', 'rotate(-60)');
    var led = blind ? '#3b3f3e' : s.cycle < 4 ? '#3b3f3e' : ['#3ee08f', '#3ee08f', '#f2a33a', '#e3262b', '#e3262b'][s.soupcon];
    attr('camLed', 'fill', led); attr('camLed', 'class', !blind && s.soupcon >= 3 ? 'pulse' : '');
    // objets
    attr('phone', 'opacity', s.cycle >= 3 ? 1 : 0);
    attr('note', 'opacity', s.cycle >= 4 && !s.done.H1 ? 1 : 0);
    attr('drawerFront', 'transform', s.flags.tiroirOuvert ? 'translate(0 16)' : '');
    attr('grilleSlats', 'opacity', has('conduit') ? 0 : 1);
    var known = has('trappe') || has('fusible') || s.done.P4;
    attr('trappe', 'opacity', known ? 1 : 0);
    attr('trappeLid', 'fill', s.done.P4 === 'A' ? '#030404' : '#151b1a');
    attr('trappeRing', 'opacity', s.done.P4 === 'B' ? 0 : 1);
    attr('boxOpen', 'opacity', s.done.P3 ? 1 : 0);
    attr('levCam', 'y', cut && s.done.P3 === 'A' ? 419 : 399);
    attr('levBtn', 'y', has('boutonDesactive') ? 419 : 399);
    // bouton
    var off = has('boutonDesactive');
    attr('btnS1', 'stop-color', off ? '#8a7a78' : '#ff6a58'); attr('btnS2', 'stop-color', off ? '#5a4040' : '#d4161c'); attr('btnS3', 'stop-color', off ? '#2a1c1c' : '#6e080c');
    attr('btnGlow', 'opacity', info.ordre && !off ? 0.7 : 0);
    // porte
    var open = info.porteOuverte;
    attr('doorLed', 'fill', open ? '#3ee08f' : '#e3262b');
    attr('doorPanel', 'transform', open ? 'translate(32 0) scale(.25 1) translate(-32 0)' : '');
    attr('doorLight', 'opacity', open ? 0.85 : 0);
    // lumière
    var mode = info.noir ? 'off' : (s.flags.compte && s.cycle >= 18) ? 'red' : s.cycle >= 15 ? 'cold' : 'normal';
    light(mode);
    // téléphone qui sonne
    attr('phoneInner', 'class', info.sonne ? 'ring' : '');
  }

  function light(mode) {
    var col = { normal: '#fff3d6', cold: '#bfe3ff', red: '#ff3b30', off: '#000' }[mode] || '#fff3d6';
    attr('coneStop', 'stop-color', col); attr('bulb', 'fill', mode === 'off' ? '#333' : col);
    attr('cone', 'opacity', mode === 'off' ? 0 : 0.6);
    attr('dark', 'opacity', mode === 'off' ? 0.82 : 0);
    attr('tint', 'fill', mode === 'cold' ? '#3a7cff' : '#ff1e1e');
    attr('tint', 'opacity', mode === 'cold' ? 0.06 : mode === 'red' ? 0.16 : 0);
  }

  // ---------- écran du moniteur ----------
  function wrap(text) {
    if (text.indexOf('|') >= 0) return text.split('|');
    var words = text.split(' '), lines = [], cur = '';
    words.forEach(function (w) { if ((cur + ' ' + w).trim().length > 17) { if (cur) lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); });
    if (cur) lines.push(cur); return lines;
  }
  function ecran(text, opt) {
    opt = opt || {}; var g = $('scr'); if (!g) return;
    g.innerHTML = '';
    if (!text) return;
    if (opt.big) {
      add(g, 300, 196, 92, text, opt.color || '#ff5a4a');
      if (opt.label) add(g, 300, 98, 20, opt.label, opt.color || '#ff5a4a');
    } else {
      var lines = wrap(text), fs = lines.length > 3 ? 23 : 29, lh = fs * 1.02, y0 = 142 - (lines.length - 1) * lh / 2 + fs * 0.32;
      lines.forEach(function (s, i) { add(g, 300, y0 + i * lh, fs, s, opt.color); });
    }
    if (opt.glitch) glitch(opt.glitch === true ? 600 : opt.glitch);
  }
  function add(g, x, y, fs, txt, col) {
    var t = document.createElementNS(NS, 'text'); t.setAttribute('x', x); t.setAttribute('y', y); t.setAttribute('font-size', fs);
    if (col) t.setAttribute('fill', col); t.textContent = txt; g.appendChild(t);
  }
  function glitch(ms) {
    clearInterval(glitchT); if (reduce) return;
    var t0 = performance.now();
    glitchT = setInterval(function () {
      var g = $('scr'); if (!g) return clearInterval(glitchT);
      if (performance.now() - t0 > ms) { clearInterval(glitchT); g.setAttribute('transform', ''); g.setAttribute('opacity', 1); return; }
      g.setAttribute('transform', 'translate(' + ((Math.random() - 0.5) * 10) + ' ' + ((Math.random() - 0.5) * 4) + ')'); g.setAttribute('opacity', Math.random() > 0.25 ? 1 : 0.3);
    }, 50);
  }

  // ---------- animations de fin ----------
  var fxTimers = [];
  function later(ms, f) { fxTimers.push(setTimeout(f, ms)); }
  function fade(id, op, ms, col) { var e = $(id); if (!e) return; if (col) e.setAttribute('fill', col); e.style.transition = 'opacity ' + ms + 'ms ease'; e.style.opacity = op; }
  function resetFx() {
    fxTimers.forEach(clearTimeout); fxTimers = [];
    ['dark', 'flash', 'tint'].forEach(function (id) { var e = $(id); if (e) { e.style.transition = ''; e.style.opacity = ''; } });
    attr('flash', 'fill', '#fff'); attr('screen', 'fill', '#071311');
  }
  function door(open) {
    attr('doorLed', 'fill', open ? '#3ee08f' : '#e3262b');
    attr('doorPanel', 'transform', open ? 'translate(32 0) scale(.25 1) translate(-32 0)' : '');
    attr('doorLight', 'opacity', open ? 0.85 : 0);
  }
  function glass(col, silhouette) { attr('glass', 'fill', col); attr('sil', 'opacity', silhouette ? 0.82 : 0); }
  function white(ms) { fade('flash', 0.92, ms, '#f4fbf8'); }
  function black(ms, op) { fade('dark', op == null ? 1 : op, ms); }
  // Dernière image de chaque fin (2 à 3 secondes), avant l'écran de fin.
  var FIN_FX = {
    conforme: function () { glass('#000', false); later(500, function () { door(true); }); },
    employe: function () { light('cold'); later(700, function () { door(true); }); },
    marche: function () { door(true); later(1600, function () { black(1200, 0.5); }); },
    seulDehors: function () { attr('grilleSlats', 'opacity', 0); later(400, function () { white(2000); }); },
    porteDerobee: function () { attr('trappeLid', 'fill', '#030404'); later(300, function () { black(2200, 0.92); }); },
    evasion: function () { door(true); alarm(2400); },
    cooperation: function () { glass('#fff2c0', false); later(600, function () { door(true); }); },
    sauvetage: function () { glass('#fff2c0', false); later(700, function () { white(1800); }); },
    tropTard: function () { glass('#000', false); later(900, function () { light('off'); }); },
    complice: function () { door(true); alarm(2000); },
    sujet18: function () { later(300, function () { black(1600); }); },
    miroir: function () { glitch(1800); var n = 0, iv = setInterval(function () { attr('sil', 'opacity', n % 2 ? 0.82 : 0); if (++n > 9) { clearInterval(iv); attr('sil', 'opacity', 0); } }, 180); fxTimers.push(iv); },
    boucle: function () { ecran(''); attr('screen', 'fill', '#000'); attr('btnGlow', 'opacity', 0); later(500, function () { black(1800, 0.95); }); },
    isolement: function () { black(700); },
    gardien: function () { alarm(2400); attr('camLed', 'fill', '#e3262b'); later(300, function () { door(true); }); later(1600, function () { door(false); }); },
    temoin: function () { attr('camLed', 'fill', '#3ee08f'); attr('camMask', 'opacity', 0); },
    revolte: function () { door(true); alarm(2400); later(900, function () { fade('flash', 0.5, 1500, '#f4fbf8'); }); },
    tempsEcoule: function () { light('red'); later(600, function () { door(true); harm(0); }); },
    curiosite: function () { door(false); flash(); }
  };
  function fin(id) { resetFx(); if (FIN_FX[id]) FIN_FX[id](); }

  // ---------- animations ----------
  function press() {
    attr('dome', 'transform', 'translate(0 9)');
    setTimeout(function () { attr('dome', 'transform', ''); }, 140);
  }
  function harm(vieApres) {
    var n = 0, base = GLASS[vieApres];
    var iv = setInterval(function () { attr('glass', 'fill', n % 2 ? base : '#ff2424'); if (++n > 5) { clearInterval(iv); attr('glass', 'fill', base); } }, 120);
  }
  function flash() { if (reduce) return; attr('flash', 'opacity', 0.45); setTimeout(function () { attr('flash', 'opacity', 0); }, 90); }
  function alarm(ms) {
    if (reduce) { attr('tint', 'opacity', 0.15); setTimeout(function () { attr('tint', 'opacity', 0); }, ms); return; }
    var n = 0, iv = setInterval(function () { attr('tint', 'fill', '#ff1e1e'); attr('tint', 'opacity', n % 2 ? 0.05 : 0.22); if (++n * 250 > ms) { clearInterval(iv); attr('tint', 'opacity', 0); } }, 250);
  }
  function blackout(on) { attr('dark', 'opacity', on ? 0.96 : 0); attr('cone', 'opacity', on ? 0 : 0.6); }

  root.BRRoom = { mount: mount, render: render, fin: fin, ecran: ecran, glitch: glitch, press: press, harm: harm, flash: flash, alarm: alarm, blackout: blackout };
})(typeof globalThis !== 'undefined' ? globalThis : this);
