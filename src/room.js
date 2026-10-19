/* Le Bouton Rouge — la Chambre 17 (vue fixe de face) : les dessins de l'artiste (assets/img), posés dans un SVG, et leurs animations.
   Ne contient aucune règle : render() dessine l'état que lui donne game.js. */
(function (root) {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var IMG = 'assets/img/';
  var reduce = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function I(id, name, x, y, w, h, extra) {
    return '<image' + (id ? ' id="' + id + '"' : '') + ' href="' + IMG + name + '.webp" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" preserveAspectRatio="none"' + (extra || '') + '/>';
  }
  // Positions dans la pièce de base (carré de 600). layout() replace les blocs selon la forme de l'écran.
  var GL = { x: 420, y: 140.6, w: 141.6, h: 86.6 };          // verre de la vitre de la 18
  var SC = { x: 192.7, y: 90.2, w: 213.4, h: 117.5, cx: 299.4, cy: 149 }; // écran du moniteur
  var VIES = [467.6, 494.4, 520.9], VIES_Y = 305.6;
  var BTN = { x: 254, y: 294.8, w: 92, h: 55.2 }, BTN2 = { x: 255.9, y: 304.9, w: 88.1, h: 45.1 };

  var SVG = '' +
  '<svg id="room" viewBox="0 0 600 600" preserveAspectRatio="xMidYMid meet" role="img" aria-label="La Chambre 17">' +
  '<defs>' +
  '<pattern id="wallP" width="220" height="220" patternUnits="userSpaceOnUse">' + I('', 'mur', 0, 0, 220, 220) + '</pattern>' +
  '<pattern id="floorP" width="170" height="170" patternUnits="userSpaceOnUse">' + I('', 'sol', 0, 0, 170, 170) + '</pattern>' +
  '<pattern id="plinthP" width="110" height="22" patternUnits="userSpaceOnUse">' + I('', 'plinthe', 0, 0, 110, 22) + '</pattern>' +
  '<radialGradient id="coneG" cx="50%" cy="0%" r="100%"><stop id="coneStop" offset="0" stop-color="#fff3d6" stop-opacity=".45"/><stop offset="1" stop-color="#fff3d6" stop-opacity="0"/></radialGradient>' +
  '<radialGradient id="bulbG"><stop id="bulbStop" offset="0" stop-color="#fff3d6" stop-opacity=".95"/><stop offset="1" stop-color="#fff3d6" stop-opacity="0"/></radialGradient>' +
  '<radialGradient id="glowG"><stop offset="0" stop-color="#ff2a2a" stop-opacity=".6"/><stop offset="1" stop-color="#ff2a2a" stop-opacity="0"/></radialGradient>' +
  '<radialGradient id="vigG" cx="50%" cy="48%" r="70%"><stop offset=".35" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".62"/></radialGradient>' +
  '<radialGradient id="ledG"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".35" stop-color="currentColor" stop-opacity="1"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></radialGradient>' +
  '<filter id="flou" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.3"/></filter>' +
  '<clipPath id="glassClip"><rect x="' + GL.x + '" y="' + GL.y + '" width="' + GL.w + '" height="' + GL.h + '"/></clipPath>' +
  '<clipPath id="screenClip"><rect x="' + SC.x + '" y="' + SC.y + '" width="' + SC.w + '" height="' + SC.h + '" rx="4"/></clipPath>' +
  '<pattern id="scan" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="2" fill="#000" opacity=".22"/></pattern>' +
  '</defs>' +
  '<g id="bg"></g>' +
  // trappe au sol (apparaît quand on la connaît)
  '<g id="gTrappe"><g id="trappe" class="hs" data-k="trappe" opacity="0">' + I('trappeImg', 'trappe_fermee', 34, 526, 124, 46) + '</g></g>' +
  // porte
  '<g id="gDoor"><g id="door" class="hs" data-k="door">' +
  '<rect id="doorLight" x="20" y="226" width="150" height="250" fill="#f4fbf8" opacity="0" filter="url(#flou)"/>' +
  I('doorImg', 'porte_fermee', 8, 218, 176.6, 252) + '</g></g>' +
  // mot de 16 glissé sous la porte
  '<g id="gNote"><g id="note" class="hs" data-k="note" opacity="0"><rect x="60" y="470" width="66" height="36" fill="transparent"/>' + I('', 'mot_plie', 70, 480, 46, 18.6, ' transform="rotate(-6 93 489)"') + '</g></g>' +
  // grille d'aération
  '<g id="gGrille"><g id="grille" class="hs" data-k="grille">' + I('grilleImg', 'grille', 112, 128, 60, 58.7) + '</g></g>' +
  // vitre de la Chambre 18 : la pièce floue, la silhouette, le verre dépoli
  '<g id="gWin"><g id="win" class="hs" data-k="window">' + I('', 'vitre', 388, 112, 210, 149.8) +
  '<g clip-path="url(#glassClip)">' +
  I('', 'chambre18', GL.x - 4, GL.y - 6, 150, 97.4, ' opacity=".9"') +
  '<g id="silMove" style="transition:transform .6s ease"><g id="sil" filter="url(#flou)" style="transition:opacity 1.2s ease">' + I('silImg', 'sil_A_debout', 431, 141, 119, 124) + '</g></g>' +
  I('hand', 'main', 432, 150, 40, 47, ' opacity="0" style="transition:opacity .5s ease"') +
  I('buee', 'fleche', 458, 172, 74, 43.5, ' opacity="0" style="transition:opacity .8s ease"') +
  '<rect x="' + GL.x + '" y="' + GL.y + '" width="' + GL.w + '" height="' + GL.h + '" fill="#e8f0ec" opacity=".2"/>' +
  '<rect id="glassTint" x="' + GL.x + '" y="' + GL.y + '" width="' + GL.w + '" height="' + GL.h + '" fill="#000" opacity="0"/>' +
  '</g></g></g>' +
  // témoins CH. 18 — SIGNES VITAUX
  '<g id="gSig"><g id="vies">' + I('', 'signes', 435, 268, 116, 61) +
  VIES.map(function (x, i) { return '<circle id="vieGlow' + (i + 1) + '" cx="' + x + '" cy="' + VIES_Y + '" r="13" fill="url(#ledG)" style="color:#3ee08f" opacity="0"/><circle id="vie' + (i + 1) + '" cx="' + x + '" cy="' + VIES_Y + '" r="6.2" fill="#3ee08f" opacity="0"/>'; }).join('') +
  '</g></g>' +
  // boîtier électrique de maintenance
  '<g id="gBox"><g id="box" class="hs" data-k="box">' + I('boxImg', 'boitier_ferme', 447, 350, 92, 96.8) +
  '<g id="boxOpen" opacity="0" font-family="VT323, monospace" font-size="8" fill="#e8f0ec" text-anchor="middle">' +
  '<text x="471" y="373">CAM</text><text x="493" y="373">BTN</text><text x="515" y="373">AUX</text>' +
  '<circle id="ledCam" cx="471" cy="428" r="2.6" fill="#3ee08f"/><circle id="ledBtn" cx="493" cy="428" r="2.6" fill="#3ee08f"/><circle id="ledAux" cx="515" cy="428" r="2.6" fill="#3ee08f"/></g>' +
  '<circle id="auxLed" cx="528" cy="360" r="3.2" fill="#3ee08f"/>' +
  '</g></g>' +
  // le centre : lampe, moniteur, bureau, bouton
  '<g id="gCenter">' +
  '<polygon id="cone" points="282,50 318,50 470,520 130,520" fill="url(#coneG)" opacity=".5" style="pointer-events:none"/>' +
  '<g class="hs" data-k="monitor">' + I('', 'moniteur', 150, 58, 300, 194.8) + '</g>' +
  '<g class="hs" data-k="light"><line x1="300" y1="-200" x2="300" y2="0" stroke="#1a1f1e" stroke-width="2.5"/>' + I('', 'lampe', 267, -8, 66, 64.2) +
  '<circle id="bulb" cx="300" cy="47" r="16" fill="url(#bulbG)" style="pointer-events:none"/></g>' +
  '<g class="hs" data-k="bureau">' + I('socleImg', 'socle', 208, 430, 184, 149.6) + '</g>' +
  '<g id="compart" class="hs" data-k="compart">' + I('compImg', 'compart_ferme', 342, 528, 34, 30.8) + '</g>' +
  '<g id="drawer" class="hs" data-k="drawer">' + I('drawerImg', 'tiroir_ferme', 252, 396, 96, 49) + '</g>' +
  I('', 'plateau', 182, 292, 236, 111.4, ' style="pointer-events:none"') +
  '<ellipse id="btnGlow" cx="300" cy="330" rx="86" ry="44" fill="url(#glowG)" opacity="0" style="pointer-events:none"/>' +
  '<g id="btn" class="hs" data-k="btn" role="button" tabindex="0" aria-label="Appuyer sur le bouton rouge">' +
  I('btnImg', 'bouton', BTN.x, BTN.y, BTN.w, BTN.h) + I('btnImg2', 'bouton_enfonce', BTN2.x, BTN2.y, BTN2.w, BTN2.h, ' opacity="0"') + '</g>' +
  '<g id="phone" class="hs" data-k="phone" opacity="0"><rect x="184" y="296" width="80" height="50" fill="transparent"/><g id="phoneInner">' +
  I('telImg', 'tel_pose', 188, 300, 64, 40.3) + I('telImg2', 'tel_decroche', 184, 304, 76, 37.3, ' opacity="0"') + '</g></g>' +
  '<g class="hs" data-k="mug"><rect x="360" y="308" width="42" height="40" fill="transparent"/>' + I('', 'tasse', 366, 316, 30, 26.4) + '</g>' +
  '</g>' +
  // caméra de surveillance (support fixe, corps qui pivote)
  '<g id="gCam">' + I('', 'camera_support', 16, 60, 62, 43, ' style="pointer-events:none"') +
  '<g id="camPivot" transform="translate(64 52)" class="hs" data-k="camera"><g id="camRot">' +
  I('camImg', 'camera', -37, -34, 74, 64.3) +
  '<circle id="camLed" cx="26" cy="-14" r="2.6" fill="#3b3f3e"/>' +
  I('camMask', 'camera_drap', -38, -36, 76, 61.7, ' opacity="0"') +
  '</g></g></g>' +
  // ombre des coins, lumière et alarme
  '<rect id="vig" x="0" y="0" width="600" height="600" fill="url(#vigG)" style="pointer-events:none"/>' +
  '<rect id="tint" x="0" y="0" width="600" height="600" fill="#ff1e1e" opacity="0" style="pointer-events:none"/>' +
  '<rect id="dark" x="0" y="0" width="600" height="600" fill="#000" opacity="0" style="pointer-events:none"/>' +
  // écran (reste lisible dans le noir)
  '<g id="gCenter2" style="pointer-events:none">' +
  '<rect id="screen" x="' + SC.x + '" y="' + SC.y + '" width="' + SC.w + '" height="' + SC.h + '" rx="4" fill="#061210"/>' +
  '<g id="scr" font-family="VT323, Courier New, monospace" fill="#bff5e4" text-anchor="middle"></g>' +
  '<g id="video" clip-path="url(#screenClip)" opacity="0"></g>' +
  '<rect x="' + SC.x + '" y="' + SC.y + '" width="' + SC.w + '" height="' + SC.h + '" rx="4" fill="url(#scan)"/>' +
  '</g>' +
  '<rect id="flash" x="0" y="0" width="600" height="600" fill="#fff" opacity="0" style="pointer-events:none"/>' +
  '</svg>';

  var svg = null, onHot = null, track = false, glitchT = null, host = null, sujet = 'A', pose = 'debout';
  function $(id) { return document.getElementById(id); }
  function attr(id, k, v) { var e = $(id); if (e) e.setAttribute(k, v); }
  function src(id, name) { var e = $(id); if (e && e.getAttribute('href') !== IMG + name + '.webp') e.setAttribute('href', IMG + name + '.webp'); }

  function mount(el, handler) {
    el.innerHTML = SVG; svg = $('room'); onHot = handler; host = el;
    svg.addEventListener('pointermove', function (e) { aim(e.clientX, e.clientY); });
    svg.addEventListener('click', function (e) {
      aim(e.clientX, e.clientY);
      var h = e.target.closest && e.target.closest('[data-k]');
      if (h && onHot) onHot(h.getAttribute('data-k'));
    });
    $('btn').addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); if (onHot) onHot('btn'); } });
    if (root.ResizeObserver) new ResizeObserver(function () { layout(); }).observe(el);
    root.addEventListener('resize', layout);
    layout();
  }
  // La caméra suit le pointeur (petit angle : c'est un dessin de face).
  var camBase = '';
  function aim(x, y) {
    if (!track) return;
    var m = $('camPivot').getScreenCTM(); if (!m) return;
    var a = Math.atan2(y - m.f, x - m.e) * 180 / Math.PI; a = Math.max(-14, Math.min(14, (a - 40) / 3));
    attr('camRot', 'transform', camBase + ' rotate(' + a.toFixed(1) + ')');
  }

  // ---------- mise en page selon l'écran ----------
  function place(id, x0, y0, X, Y, k) { attr(id, 'transform', 'translate(' + (X - k * x0).toFixed(1) + ' ' + (Y - k * y0).toFixed(1) + ') scale(' + k + ')'); }
  function shift(id, dx, dy) { attr(id, 'transform', 'translate(' + dx.toFixed(1) + ' ' + dy.toFixed(1) + ')'); }
  function layout() {
    if (!svg || !host) return;
    var w = host.clientWidth, h = host.clientHeight; if (!w || !h) return;
    var a = w / h, W, H, floorY, cx;
    if (a >= 0.9) {
      // Écran large : la pièce d'origine, élargie ; les objets des côtés s'écartent un peu.
      H = 600; W = Math.max(600, 600 * a); cx = W / 2; floorY = 470;
      var dx = cx - 300, sp = Math.min((W - 600) / 2, 170) * 0.55;
      ['gCenter', 'gCenter2'].forEach(function (id) { shift(id, dx, 0); });
      ['gDoor', 'gNote', 'gTrappe', 'gCam', 'gGrille'].forEach(function (id) { shift(id, dx - sp, 0); });
      ['gWin', 'gSig', 'gBox'].forEach(function (id) { shift(id, dx + sp, 0); });
    } else {
      // Écran haut (téléphone) : le moniteur et le bouton au centre, les autres objets autour.
      W = 460; H = Math.max(600, W / a); cx = W / 2;
      var dy = H / 2 - 290; floorY = 470 + dy;
      ['gCenter', 'gCenter2'].forEach(function (id) { shift(id, cx - 300, dy); });
      var top = dy + 50, kw = Math.max(0.42, Math.min(0.8, (top - 62) / 150));
      place('gWin', 388, 112, W - 210 * kw - 4, top - 150 * kw, kw);
      place('gCam', 0, 0, 0, Math.max(0, top - 112), 1);
      place('gGrille', 112, 128, 84, Math.max(4, top - 58), 0.85);
      place('gSig', 435, 268, W - 82, dy + 262, 0.68);
      place('gBox', 447, 350, W - 74, dy + 318, 0.76);
      place('gDoor', 8, 218, 2, floorY - 252 * 0.56, 0.56);
      place('gNote', 60, 470, 4, floorY + 8, 0.8);
      place('gTrappe', 34, 526, 4, floorY + 50, 0.72);
    }
    svg.setAttribute('viewBox', '0 0 ' + W.toFixed(1) + ' ' + H.toFixed(1));
    ['tint', 'dark', 'flash', 'vig'].forEach(function (id) { attr(id, 'width', W); attr(id, 'height', H); });
    // Mur, plinthe et sol (textures répétées), à la taille de l'écran.
    $('bg').innerHTML = '<rect x="0" y="0" width="' + W + '" height="' + floorY + '" fill="url(#wallP)"/>' +
      '<rect x="0" y="0" width="' + W + '" height="' + floorY + '" fill="#0d1212" opacity=".55"/>' +
      '<rect x="0" y="' + floorY + '" width="' + W + '" height="' + (H - floorY) + '" fill="url(#floorP)"/>' +
      '<rect x="0" y="' + floorY + '" width="' + W + '" height="' + (H - floorY) + '" fill="#050707" opacity=".62"/>' +
      '<rect x="0" y="' + (floorY - 20) + '" width="' + W + '" height="22" fill="url(#plinthP)"/>' +
      '<rect x="0" y="' + (floorY - 20) + '" width="' + W + '" height="22" fill="#000" opacity=".45"/>';
  }

  // ---------- état → dessin ----------
  function silhouette(p) {
    pose = p || pose;
    var nom = pose === 'tel' && sujet !== 'A' ? 'debout' : pose;
    src('silImg', 'sil_' + sujet + '_' + nom);
    // L'enfant (vérité C) est plus petit : sa tête apparaît plus bas derrière le verre.
    var k = sujet === 'C' ? 0.8 : 1, S = 124 * k, pied = 141 + 0.975 * 124;
    attr('silImg', 'width', (119 * k).toFixed(1)); attr('silImg', 'height', S.toFixed(1));
    attr('silImg', 'x', (GL.x + GL.w / 2 - 119 * k / 2).toFixed(1)); attr('silImg', 'y', (pied - 0.975 * S).toFixed(1));
  }
  function poseVie(vie) { return vie >= 3 ? 'debout' : vie === 2 ? 'courbe' : 'accroupi'; }
  var vieCourante = 3;
  function render(s, info) {
    info = info || {};
    resetFx();
    var has = function (k) { return s.items.indexOf(k) >= 0; };
    sujet = s.truth || 'A'; vieCourante = s.vie;
    // vie de la 18 : les trois voyants
    for (var i = 1; i <= 3; i++) { var on = s.vie >= i; attr('vie' + i, 'opacity', on ? 1 : 0); attr('vieGlow' + i, 'opacity', on ? 0.8 : 0); }
    // La silhouette se courbe avec sa vie ; la lumière de la 18 rougit quand le soupçon est élevé.
    silhouette(poseVie(s.vie));
    attr('sil', 'opacity', s.vie > 0 && !info.silCachee ? 1 : 0);
    attr('glassTint', 'fill', s.vie > 0 && s.soupcon >= 3 ? '#7a1e10' : '#000');
    attr('glassTint', 'opacity', s.vie <= 0 ? 0.82 : s.soupcon >= 3 ? 0.3 : [0.82, 0.38, 0.18, 0][s.vie]);
    attr('hand', 'opacity', 0); attr('buee', 'opacity', 0); attr('silMove', 'transform', '');
    // caméra
    var blind = info.cameraAveugle, cut = has('cameraCoupee'), tournee = has('cameraTournee');
    track = s.cycle >= 4 && !blind && !info.urgence;
    camBase = tournee ? 'scale(-1 1)' : '';
    attr('camRot', 'transform', camBase);
    attr('camMask', 'opacity', blind && !cut && !tournee ? 1 : 0);
    attr('camImg', 'opacity', cut ? 0.75 : 1);
    attr('auxLed', 'fill', s.flags.aux === 'defaut' ? '#e3262b' : '#3ee08f'); attr('auxLed', 'class', s.flags.aux === 'defaut' ? 'pulse' : '');
    var led = blind ? '#2a2e2d' : s.cycle < 4 ? '#3b3f3e' : ['#3ee08f', '#3ee08f', '#f2a33a', '#e3262b', '#e3262b'][s.soupcon];
    attr('camLed', 'fill', led); attr('camLed', 'class', !blind && s.soupcon >= 3 ? 'pulse' : '');
    // objets
    attr('phone', 'opacity', s.cycle >= 3 ? 1 : 0);
    attr('telImg', 'opacity', info.decroche ? 0 : 1); attr('telImg2', 'opacity', info.decroche ? 1 : 0);
    attr('note', 'opacity', s.cycle >= 4 && !s.done.H1 ? 1 : 0);
    var tir = s.flags.tiroirOuvert ? (s.flags.tournevisDispo && !s.flags.tournevisPris && !has('tournevis') ? 'tiroir_tournevis' : 'tiroir_vide') : 'tiroir_ferme';
    src('drawerImg', tir); attr('drawerImg', 'height', tir === 'tiroir_ferme' ? 49 : 69.1);
    src('compImg', s.flags.compartiment === 'ouvert' ? 'compart_fusible' : s.flags.compartiment === 'vide' ? 'compart_vide' : 'compart_ferme');
    src('grilleImg', has('conduit') ? 'grille_ouverte' : 'grille');
    src('socleImg', s.done.H2 === 'B' ? 'socle_efface' : 'socle');
    var known = has('trappe') || (has('code') && has('code41')) || s.flags.fusibleInstalle || s.done.P4;
    attr('trappe', 'opacity', known ? 1 : 0);
    src('trappeImg', s.done.P4 === 'A' ? 'trappe_ouverte' : s.done.P4 === 'B' ? 'trappe_preparee' : 'trappe_fermee');
    var ouvert = !!s.done.P3;
    src('boxImg', ouvert ? 'boitier_ouvert' : 'boitier_ferme'); attr('boxOpen', 'opacity', ouvert ? 1 : 0); attr('auxLed', 'opacity', ouvert ? 0 : 1);
    attr('ledCam', 'fill', cut && s.done.P3 === 'A' ? '#e3262b' : '#3ee08f');
    attr('ledBtn', 'fill', has('boutonDesactive') ? '#e3262b' : '#3ee08f');
    attr('ledAux', 'fill', s.flags.aux === 'defaut' ? '#e3262b' : '#3ee08f');
    // bouton
    attr('btnGlow', 'opacity', info.ordre ? 0.8 : 0); attr('btnGlow', 'class', info.ordre ? 'pulse' : '');
    door(info.porteOuverte);
    // lumière
    var mode = info.urgence ? 'urgence' : (s.flags.compte && s.cycle >= 18) ? 'red' : s.cycle >= 15 ? 'cold' : 'normal';
    light(mode);
    attr('phoneInner', 'class', info.sonne ? 'ring' : '');
  }

  function light(mode) {
    var off = mode === 'off' || mode === 'urgence';
    var col = { normal: '#fff3d6', cold: '#bfe3ff', red: '#ff3b30' }[mode] || '#000';
    attr('coneStop', 'stop-color', col); attr('bulbStop', 'stop-color', col);
    attr('bulb', 'opacity', off ? 0 : 1);
    attr('cone', 'opacity', off ? 0 : 0.5);
    attr('dark', 'opacity', mode === 'off' ? 0.82 : mode === 'urgence' ? 0.66 : 0);
    // Lampe de secours orange pendant l'autotest.
    attr('tint', 'fill', mode === 'cold' ? '#3a7cff' : mode === 'urgence' ? '#ff8a1e' : '#ff1e1e');
    attr('tint', 'opacity', mode === 'cold' ? 0.07 : mode === 'red' ? 0.16 : mode === 'urgence' ? 0.22 : 0);
  }

  // ---------- écran du moniteur ----------
  function wrap(text) {
    if (text.indexOf('|') >= 0) return text.split('|');
    var words = text.split(' '), lines = [], cur = '';
    words.forEach(function (w) { if ((cur + ' ' + w).trim().length > 17) { if (cur) lines.push(cur); cur = w; } else cur = (cur + ' ' + w).trim(); });
    if (cur) lines.push(cur); return lines;
  }
  // Texte du moniteur, tapé lettre par lettre (sauf opt.instant). Renvoie le nombre de lettres.
  var typeT = null, typeFin = null, VIT = { lent: 48, normal: 32, rapide: 16 }, vitesse = 'normal';
  function ecran(text, opt) {
    opt = opt || {}; var g = $('scr'); if (!g) return 0;
    clearInterval(typeT); typeFin = null;
    g.innerHTML = '';
    if (!text) return 0;
    var els = [], full = [];
    if (opt.big) {
      els.push(add(g, SC.cx, SC.cy + 30, 76, text, opt.color || '#ff5a4a')); full.push(text);
      if (opt.label) { els.push(add(g, SC.cx, SC.y + 22, 17, opt.label, opt.color || '#ff5a4a')); full.push(opt.label); }
    } else {
      var lines = wrap(text), fs = lines.length > 4 ? 16.5 : lines.length > 3 ? 19.5 : 24, lh = fs * 1.02, y0 = SC.cy - (lines.length - 1) * lh / 2 + fs * 0.32;
      lines.forEach(function (l, i) { els.push(add(g, SC.cx, y0 + i * lh, fs, l, opt.color)); full.push(l); });
    }
    if (opt.glitch) glitch(opt.glitch === true ? 600 : opt.glitch);
    var total = full.join('').length;
    if (opt.instant || reduce) return total;
    // Les lignes restent centrées : on mesure leur largeur finale, puis on les tape depuis la gauche.
    els.forEach(function (el) {
      var w = 0; try { w = el.getComputedTextLength(); } catch (e) {}
      if (w) { el.setAttribute('text-anchor', 'start'); el.setAttribute('x', (SC.cx - w / 2).toFixed(1)); }
      el.textContent = '';
    });
    var li = 0, ci = 0;
    function fini() { clearInterval(typeT); typeFin = null; els.forEach(function (el, i) { el.textContent = full[i]; }); }
    typeFin = fini;
    typeT = setInterval(function () {
      if (li >= els.length) return fini();
      ci++;
      els[li].textContent = full[li].slice(0, ci) + (ci < full[li].length ? '▌' : '');
      if (ci >= full[li].length) { li++; ci = 0; }
    }, VIT[vitesse]);
    return total;
  }
  function ecranFinir() { if (typeFin) typeFin(); }
  function add(g, x, y, fs, txt, col) {
    var t = document.createElementNS(NS, 'text'); t.setAttribute('x', x); t.setAttribute('y', y); t.setAttribute('font-size', fs);
    if (col) t.setAttribute('fill', col); t.textContent = txt; g.appendChild(t);
    return t;
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
  // B3 : la « preuve », une vidéo granuleuse sur le moniteur (différente selon la vérité).
  function video(ms) {
    var v = $('video'); if (!v) return;
    var x = SC.x, y = SC.y, w = SC.w, h = SC.h, sil = 'sil_' + sujet + '_debout';
    var fond = sujet === 'B' ? I('', 'rev_B', x - 10, y - 8, w + 20, h + 16) : I('', 'chambre18', x - 10, y - 8, w + 20, h + 16) +
      (sujet === 'A' ? I('', sil, x + w * 0.2, y + 6, 100, 104) + I('', 'sil_A_poing', x + w * 0.55, y + 4, 100, 104, ' opacity=".8"') : I('vidSil', 'sil_C_debout', x - 60, y + 22, 84, 88));
    v.innerHTML = '<g style="filter:grayscale(1) contrast(1.2) brightness(.8)">' + fond + '</g><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#0a2a22" opacity=".35"/>' +
      '<text id="vidT" x="' + (x + w - 6) + '" y="' + (y + 16) + '" text-anchor="end" font-family="VT323, monospace" font-size="14" fill="#bff5e4">14:02</text>' +
      '<circle cx="' + (x + 10) + '" cy="' + (y + 11) + '" r="3.5" fill="#ff3b30" class="pulse"/>';
    attr('video', 'opacity', 1);
    if (!reduce && sujet === 'C') { var e = $('vidSil'); e.style.transition = 'transform 3.5s linear'; requestAnimationFrame(function () { e.style.transform = 'translateX(' + (w * 0.65) + 'px)'; }); }
    later2(ms * 0.55, function () { var t = $('vidT'); if (t) t.textContent = sujet === 'A' ? '13:58' : '14:03'; glitch(300); });
    later2(ms, function () { attr('video', 'opacity', 0); $('video').innerHTML = ''; });
  }

  // ---------- animations de fin ----------
  var fxTimers = [];
  function later(ms, f) { fxTimers.push(setTimeout(f, ms)); }
  function fade(id, op, ms, col) { var e = $(id); if (!e) return; if (col) e.setAttribute('fill', col); e.style.transition = 'opacity ' + ms + 'ms ease'; e.style.opacity = op; }
  function resetFx() {
    fxTimers.forEach(clearTimeout); fxTimers = [];
    ['dark', 'flash', 'tint'].forEach(function (id) { var e = $(id); if (e) { e.style.transition = ''; e.style.opacity = ''; } });
    attr('flash', 'fill', '#fff'); attr('screen', 'fill', '#061210');
  }
  function door(open) {
    src('doorImg', open ? 'porte_ouverte' : 'porte_fermee');
    attr('doorLight', 'opacity', open ? 0.5 : 0);
  }
  function glass(op, col, silhouetteVisible) { attr('glassTint', 'fill', col || '#000'); attr('glassTint', 'opacity', op); attr('sil', 'opacity', silhouetteVisible ? 1 : 0); }
  function white(ms) { fade('flash', 0.92, ms, '#f4fbf8'); }
  function black(ms, op) { fade('dark', op == null ? 1 : op, ms); }
  // Dernière image de chaque fin (2 à 3 secondes), avant l'écran de fin.
  var FIN_FX = {
    conforme: function () { glass(0.85, '#000', false); later(500, function () { door(true); }); },
    employe: function () { light('cold'); later(700, function () { door(true); }); },
    marche: function () { door(true); later(1600, function () { black(1200, 0.5); }); },
    seulDehors: function () { src('grilleImg', 'grille_ouverte'); later(400, function () { white(2000); }); },
    porteDerobee: function () { attr('trappe', 'opacity', 1); src('trappeImg', 'trappe_ouverte'); later(300, function () { black(2200, 0.92); }); },
    evasion: function () { door(true); alarm(2400); },
    cooperation: function () { glass(0.5, '#fff2c0', false); later(600, function () { door(true); }); },
    sauvetage: function () { glass(0.5, '#fff2c0', false); later(700, function () { white(1800); }); },
    tropTard: function () { glass(0.9, '#000', false); later(900, function () { light('off'); }); },
    complice: function () { door(true); alarm(2000); },
    sujet18: function () { later(300, function () { black(1600); }); },
    miroir: function () { glitch(1800); var n = 0, iv = setInterval(function () { attr('sil', 'opacity', n % 2 ? 1 : 0); if (++n > 9) { clearInterval(iv); attr('sil', 'opacity', 0); } }, 180); fxTimers.push(iv); },
    boucle: function () { ecran(''); attr('screen', 'fill', '#000'); attr('btnGlow', 'opacity', 0); later(500, function () { black(1800, 0.95); }); },
    isolement: function () { black(700); },
    gardien: function () { alarm(2400); attr('camLed', 'fill', '#e3262b'); later(300, function () { door(true); }); later(1600, function () { door(false); }); },
    temoin: function () { attr('camLed', 'fill', '#3ee08f'); attr('camMask', 'opacity', 0); },
    revolte: function () { door(true); alarm(2400); later(900, function () { fade('flash', 0.5, 1500, '#f4fbf8'); }); },
    tempsEcoule: function () { light('red'); later(600, function () { door(true); if (vieCourante > 0) harm(0); else glass(0.15, '#fff', false); }); },
    curiosite: function () { door(false); flash(); }
  };
  function fin(id) { resetFx(); if (FIN_FX[id]) FIN_FX[id](); }

  // ---------- animations ----------
  function press() {
    attr('btnImg', 'opacity', 0); attr('btnImg2', 'opacity', 1);
    setTimeout(function () { attr('btnImg', 'opacity', 1); attr('btnImg2', 'opacity', 0); }, 150);
  }
  function later2(ms, f) { setTimeout(f, ms); }
  // Une pose de la silhouette pendant un moment, puis retour à la pose qui suit sa vie.
  function poseTemp(p, ms) { silhouette(p); later2(ms, function () { silhouette(poseVie(vieCourante)); }); }
  // Animations jouées par les événements « anim » du moteur.
  var ANIMS = {
    lumiere: function () { blackout(false); if (reduce) return; attr('dark', 'opacity', 0.9); later2(120, function () { attr('dark', 'opacity', 0); }); later2(260, function () { attr('dark', 'opacity', 0.7); }); later2(420, function () { attr('dark', 'opacity', 0); }); },
    camTourne: function () { attr('camRot', 'transform', 'rotate(-10)'); later2(700, function () { attr('camRot', 'transform', 'rotate(8)'); }); later2(1400, function () { attr('camRot', 'transform', ''); }); },
    vitreAllumee: function () { attr('glassTint', 'opacity', 0.7); later2(300, function () { attr('glassTint', 'opacity', 0.3); }); later2(600, function () { attr('glassTint', 'opacity', 0); }); },
    silArrive: function () { attr('sil', 'opacity', 1); },
    silMain: function () { poseTemp('paume', 2800); attr('hand', 'opacity', 0.9); later2(2600, function () { attr('hand', 'opacity', 0); }); },
    silFrappe: function () { poseTemp('poing', 1800); var n = 0, iv = setInterval(function () { attr('silMove', 'transform', n % 2 ? '' : 'translate(-2 1)'); if (++n > 5) { clearInterval(iv); attr('silMove', 'transform', ''); } }, 140); },
    silTourne: function () { poseTemp('tel', 2600); if (sujet !== 'A') { attr('silMove', 'transform', 'translate(18 0)'); later2(2200, function () { attr('silMove', 'transform', ''); }); } },
    silBuee: function () { attr('buee', 'opacity', 0.75); later2(3800, function () { attr('buee', 'opacity', 0); }); },
    compartiment: function () { src('compImg', 'compart_fusible'); },
    silFige: function () { attr('hand', 'opacity', 0); attr('silMove', 'transform', ''); silhouette('debout'); },
    video: function () { video(5200); }
  };
  function anim(n) { if (ANIMS[n]) ANIMS[n](); }
  // B2 : chaque pression partielle fait sursauter la silhouette, sans blessure.
  function harmLeger() { poseTemp('recule', 400); attr('silMove', 'transform', 'translate(6 0)'); later2(250, function () { attr('silMove', 'transform', ''); }); }

  function harm(vieApres) {
    vieCourante = vieApres;
    silhouette('recule'); attr('silMove', 'transform', 'translate(14 0)');
    later2(900, function () { attr('silMove', 'transform', ''); silhouette(poseVie(vieApres)); if (vieApres <= 0) attr('sil', 'opacity', 0); });
    var n = 0;
    var iv = setInterval(function () { attr('glassTint', 'fill', n % 2 ? '#000' : '#ff2424'); attr('glassTint', 'opacity', n % 2 ? 0.2 : 0.45); if (++n > 5) { clearInterval(iv); attr('glassTint', 'fill', '#000'); attr('glassTint', 'opacity', [0.82, 0.38, 0.18, 0][Math.max(0, vieApres)]); } }, 120);
  }
  function flash() { if (reduce) return; attr('flash', 'opacity', 0.45); setTimeout(function () { attr('flash', 'opacity', 0); }, 90); }
  function alarm(ms) {
    if (reduce) { attr('tint', 'opacity', 0.15); setTimeout(function () { attr('tint', 'opacity', 0); }, ms); return; }
    var n = 0, iv = setInterval(function () { attr('tint', 'fill', '#ff1e1e'); attr('tint', 'opacity', n % 2 ? 0.05 : 0.22); if (++n * 250 > ms) { clearInterval(iv); attr('tint', 'opacity', 0); } }, 250);
  }
  function blackout(on) { attr('dark', 'opacity', on ? 0.96 : 0); attr('cone', 'opacity', on ? 0 : 0.5); attr('bulb', 'opacity', on ? 0 : 1); }

  // ---------- objets de l'inventaire (dessins de l'artiste) ----------
  var ICONES = { tournevis: 'tournevis', fusible: 'fusible', code: 'papier_carre', mot16: 'carte_pliee', badge: 'badge', enregistrement: 'cassette', journal: 'papier_lettre' };
  function icone(k, code) {
    var h = '<svg viewBox="0 0 40 40" aria-hidden="true"><image href="' + IMG + ICONES[k] + '.webp" x="2" y="2" width="36" height="36" preserveAspectRatio="xMidYMid meet"/>';
    if (k === 'code') h += '<text x="20" y="24" text-anchor="middle" font-family="VT323, monospace" font-size="11" fill="#2b2620">' + (code || '7__2') + '</text>';
    if (k === 'mot16') h += '<text x="27" y="27" font-family="Reenie Beanie, cursive" font-size="11" fill="#7a1d16">16</text>';
    return h + '</svg>';
  }

  root.BRRoom = {
    get VITESSE() { return VIT[vitesse]; }, setVitesse: function (v) { if (VIT[v]) vitesse = v; },
    ecranFinir: ecranFinir, layout: layout, icone: icone, mount: mount, render: render, fin: fin, anim: anim, harmLeger: harmLeger, ecran: ecran, glitch: glitch, press: press, harm: harm, flash: flash, alarm: alarm, blackout: blackout
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
