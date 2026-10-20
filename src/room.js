/* Le Bouton Rouge — la Chambre 17 (vue fixe de face) : les dessins de l'artiste (assets/img), posés dans un SVG, et leurs animations.
   Ne contient aucune règle : render() dessine l'état que lui donne game.js. */
(function (root) {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var IMG = 'assets/img/';
  var reduce = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function I(id, name, x, y, w, h, extra) {
    return '<image' + (id ? ' id="' + id + '"' : '') + ' href="' + IMG + name + '.webp" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '"' + (extra && extra.indexOf('preserveAspectRatio') >= 0 ? '' : ' preserveAspectRatio="none"') + (extra || '') + '/>';
  }
  // Positions dans la pièce de base (1672 × 941, d'après l'image de référence d'Amine).
  // layout() élargit le mur et le sol selon l'écran ; le moniteur et le bouton restent au centre.
  // Pack graphique v1 (19/10) : chaque dessin garde son canevas d'export, les états d'une même famille se superposent.
  var W0 = 1672, H0 = 941, SOL = 684;
  var VT = { x: 1115, y: 70, w: 360, h: 315, k: 315 / 738 };                  // vitre (dessin 620 × 738, élargi par tranches)
  var GL = { x: 1138.5, y: 97.7, w: 308.8, h: 260.4 };                         // verre de la vitre de la 18
  var SIL = { x: GL.x + GL.w / 2 - 168, y: GL.y + 60, s: 336 };                // canevas commun des silhouettes (800 × 800)
  // Silhouettes par vérité (pack personnages 20/10) : A victime = homme, B complice = femme, C illusion = enfant (sil_A_, sil_B_, sil_C_).
  var SIL_PAR_VERITE = true;
  var SC = { x: 579.1, y: 111.1, w: 490.8, h: 178.1, cx: 824.5, cy: 200.2 };  // écran du moniteur
  var KS = SC.h / 117.8;                                                         // échelle du texte du moniteur
  // Signes vitaux : boîtier centré sous le verre, trois voyants posés sur les trous du dessin (régulièrement espacés).
  var SG = { w: 197, h: 76.5 }; SG.x = +(GL.x + GL.w / 2 - SG.w / 2).toFixed(1); SG.y = 393;
  var VIES = [106, 206, 306].map(function (px) { return +(SG.x + px * SG.w / 420).toFixed(1); }), VIES_Y = 440.8;
  var BTN = { x: 760.4, y: 449.3, w: 153.8, h: 97.8 };
  var BX = { x: 1517.4, y: 205, w: 172.5, h: 274 };                            // boîtier électrique (canevas 260 × 413)
  var LEV = 42.5, SOCK = [0.277, 0.487, 0.689];                                 // leviers posés sur les trois prises
  function bx(rx, ry) { return (BX.x + rx * BX.w).toFixed(1) + '" cy="' + (BX.y + ry * BX.h).toFixed(1); }
  function bt(rx, ry, t) { return '<text x="' + (BX.x + rx * BX.w).toFixed(1) + '" y="' + (BX.y + ry * BX.h).toFixed(1) + '">' + t + '</text>'; }
  function lev(id, ry) { return I(id, 'levier_haut', BX.x + 0.575 * BX.w - LEV / 2, BX.y + ry * BX.h - LEV / 2, LEV, LEV); }
  // Une tranche verticale d'un dessin (pour élargir la vitre sans déformer son cadre).
  function tranche(name, sx, sw, SW, SH, x, y, w, h, op) {
    var k = w / sw, id = 'tr' + Math.round(sx);
    return '<clipPath id="' + id + '"><rect x="' + x.toFixed(1) + '" y="' + y + '" width="' + w.toFixed(1) + '" height="' + h + '"/></clipPath>' +
      I('', name, +(x - sx * k).toFixed(1), y, +(SW * k).toFixed(1), h, ' clip-path="url(#' + id + ')"' + (op ? ' opacity="' + op + '"' : ''));
  }
  // Ombre portée d'un objet sur le mur, poussée à l'opposé de la lampe (x 838).
  function ombre(x1, y1, x2, y2, op) {
    var ox = ((x1 + x2) / 2 - 838) * 0.03;
    return '<rect x="' + (x1 + ox).toFixed(1) + '" y="' + (y1 + 14) + '" width="' + (x2 - x1) + '" height="' + (y2 - y1) + '" rx="6" fill="#000" opacity="' + (op || 0.6) + '" filter="url(#ombreF)" style="pointer-events:none"/>';
  }
  // Ombres d'un objet posé sur le plateau, tirées de son propre dessin (masque alpha) : une ombre de contact serrée
  // à sa base et une ombre portée courte et douce, poussée à l'opposé de la lampe (dx < 0 : vers la gauche).
  function ombreObjet(ref, bx, by, dx) {
    var r = ' translate(' + (-bx) + ' ' + (-by) + ')';
    return '<use href="#' + ref + '" transform="translate(' + (bx + dx) + ' ' + (by + 4) + ') matrix(1.04 0 ' + (-dx * 0.03).toFixed(3) + ' .26 0 0)' + r + '" filter="url(#castF)" opacity=".7"/>' +
      '<use href="#' + ref + '" transform="translate(' + bx + ' ' + (by + 2.5) + ') scale(1.03 .07)' + r + '" filter="url(#ctcF)" opacity=".95"/>';
  }
  // Ombre serrée sous un appui du bureau, légèrement poussée à l'opposé de la lampe.
  function pied(x1, x2) {
    var ox = ((x1 + x2) / 2 - 838) * 0.02;
    return '<rect x="' + (x1 + ox - 4).toFixed(1) + '" y="803" width="' + (x2 - x1 + 8) + '" height="10" rx="4" fill="#000" opacity=".9" filter="url(#ombreP)"/>' +
      '<rect x="' + (x1 + ox * 2 - 14).toFixed(1) + '" y="800" width="' + (x2 - x1 + 28) + '" height="24" rx="12" fill="#000" opacity=".55" filter="url(#ombreF)"/>';
  }
  // Liseré de lumière sur un bord tourné vers la lampe.
  function lisere(x1, x2, y, op) {
    return '<rect class="lit" x="' + x1 + '" y="' + y + '" width="' + (x2 - x1) + '" height="2.5" fill="url(#liseG)" opacity="' + op + '" style="pointer-events:none"/>';
  }
  // Tuyau vertical (cylindre ombré) avec ses colliers, comme sur le modèle.
  function tuyau(x, y1, y2, w) {
    var t = '<rect x="' + (x + w * 0.7) + '" y="' + y1 + '" width="' + w + '" height="' + (y2 - y1) + '" fill="#000" opacity=".45" filter="url(#ombreP)"/><rect x="' + x + '" y="' + y1 + '" width="' + w + '" height="' + (y2 - y1) + '" fill="url(#pipeG)"/>';
    for (var y = y1 + 90; y < y2 - 40; y += 210) t += '<rect x="' + (x - 3) + '" y="' + y + '" width="' + (w + 6) + '" height="7" rx="1.5" fill="url(#pipeG)" stroke="#060808" stroke-width="1"/>';
    return t;
  }
  var bord = 80 * VT.k;
  var VITRE = tranche('vitre', 0, 80, 620, 738, VT.x, VT.y, bord, VT.h) + tranche('vitre', 80, 460, 620, 738, VT.x + bord, VT.y, VT.w - 2 * bord, VT.h, 0.62) +
    tranche('vitre', 540, 80, 620, 738, VT.x + VT.w - bord, VT.y, bord, VT.h);

  var SVG = '' +
  '<svg id="room" viewBox="0 0 ' + W0 + ' ' + H0 + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="La Chambre 17">' +
  '<defs>' +
  // mur de fond reconstruit d'après le modèle (tools/fond-mur.py) : bandeau à y 500 dans l'image, recalé sur y 375 par layout()
  '<pattern id="wallP" width="1780" height="900" patternUnits="userSpaceOnUse">' + I('', 'mur_fond', 0, 0, 1780, 900) + '</pattern>' +
  '<pattern id="floorP" width="340" height="340" patternUnits="userSpaceOnUse">' + I('', 'sol', 0, 0, 340, 340) + '</pattern>' +
  '<pattern id="plinthP" width="560" height="36" patternUnits="userSpaceOnUse">' + I('', 'plinthe', 0, 0, 560, 36) + '</pattern>' +
  '<linearGradient id="coneG" x1="0" y1="0" x2="0" y2="1"><stop id="coneStop" offset="0" stop-color="#ffe9c2" stop-opacity=".5"/><stop offset="1" stop-color="#fff3d6" stop-opacity="0"/></linearGradient>' +
  '<radialGradient id="poolG"><stop id="poolStop" offset="0" stop-color="#ffe7bd" stop-opacity=".36"/><stop offset="1" stop-color="#fff3d6" stop-opacity="0"/></radialGradient>' +
  '<radialGradient id="bulbG"><stop id="bulbStop" offset="0" stop-color="#fff3d6" stop-opacity=".95"/><stop offset="1" stop-color="#fff3d6" stop-opacity="0"/></radialGradient>' +
  '<radialGradient id="glowG"><stop offset="0" stop-color="#ff2a2a" stop-opacity=".6"/><stop offset="1" stop-color="#ff2a2a" stop-opacity="0"/></radialGradient>' +
  '<radialGradient id="shadowG"><stop offset="0" stop-color="#000" stop-opacity=".7"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>' +
  '<radialGradient id="vigG" cx="50%" cy="45%" r="72%"><stop offset=".4" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".52"/></radialGradient>' +
  '<radialGradient id="ledG"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".35" stop-color="currentColor" stop-opacity="1"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></radialGradient>' +
  '<filter id="flou" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="2.6"/></filter>' +
  '<clipPath id="glassClip"><rect x="' + GL.x + '" y="' + GL.y + '" width="' + GL.w + '" height="' + GL.h + '"/></clipPath>' +
  '<clipPath id="screenClip"><rect x="' + SC.x + '" y="' + SC.y + '" width="' + SC.w + '" height="' + SC.h + '" rx="6"/></clipPath>' +
  '<linearGradient id="pipeG" x1="0" x2="1"><stop offset="0" stop-color="#070909"/><stop offset=".3" stop-color="#4c5553"/><stop offset=".45" stop-color="#a7b0ad"/><stop offset=".62" stop-color="#3a4240"/><stop offset="1" stop-color="#050707"/></linearGradient>' +
  '<linearGradient id="reflFade" gradientUnits="userSpaceOnUse" x1="0" y1="816" x2="0" y2="960"><stop offset="0" stop-color="#fff" stop-opacity=".13"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
  '<mask id="reflM" maskUnits="userSpaceOnUse" x="-3000" y="0" width="8000" height="3000"><rect x="-3000" y="816" width="8000" height="400" fill="url(#reflFade)"/></mask>' +
  '<linearGradient id="reflFadeD" gradientUnits="userSpaceOnUse" x1="0" y1="701" x2="0" y2="800"><stop offset="0" stop-color="#fff" stop-opacity=".1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
  '<mask id="reflD" maskUnits="userSpaceOnUse" x="-3000" y="0" width="8000" height="3000"><rect x="-3000" y="701" width="8000" height="300" fill="url(#reflFadeD)"/></mask>' +
  '<radialGradient id="sheenG"><stop offset="0" stop-color="#e9f2ef" stop-opacity=".26"/><stop offset="1" stop-color="#e9f2ef" stop-opacity="0"/></radialGradient>' +
  '<linearGradient id="glareG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".09"/><stop offset=".5" stop-color="#fff" stop-opacity=".02"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
  '<linearGradient id="glassRG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".16"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
  '<pattern id="grainP" width="256" height="256" patternUnits="userSpaceOnUse">' + I('', 'grain', 0, 0, 256, 256) + '</pattern>' +
  '<radialGradient id="specG"><stop offset="0" stop-color="#fff" stop-opacity=".3"/><stop offset=".55" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>' +
  '<radialGradient id="fogG" cx="50%" cy="8%" r="75%"><stop offset="0" stop-color="#f2f7f6" stop-opacity=".75"/><stop offset=".45" stop-color="#d9e3e1" stop-opacity=".28"/><stop offset="1" stop-color="#c9d4d2" stop-opacity=".12"/></radialGradient>' +
  '<filter id="coneBlur" x="-20%" y="-5%" width="140%" height="110%"><feGaussianBlur stdDeviation="16"/></filter>' +
  '<filter id="ombreF" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="11"/></filter>' +
  '<filter id="ombreP" x="-100%" y="-5%" width="300%" height="110%"><feGaussianBlur stdDeviation="3"/></filter>' +
  '<linearGradient id="liseG" x1="0" x2="1"><stop offset="0" stop-color="#fff6e0" stop-opacity="0"/><stop offset=".5" stop-color="#fff6e0" stop-opacity="1"/><stop offset="1" stop-color="#fff6e0" stop-opacity="0"/></linearGradient>' +
  '<linearGradient id="aoUp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></linearGradient>' +
  '<linearGradient id="aoDown" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".6"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>' +
  '<linearGradient id="sideL" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".82"/><stop offset="1" stop-color="#000" stop-opacity=".42"/></linearGradient>' +
  '<linearGradient id="sideR" x1="1" x2="0"><stop offset="0" stop-color="#000" stop-opacity=".82"/><stop offset="1" stop-color="#000" stop-opacity=".42"/></linearGradient>' +
  // néon froid au-dessus de la vitre, reflets et ombres de contact des objets du bureau
  '<linearGradient id="neonTubeG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#58d9c8"/><stop offset=".45" stop-color="#f4fffd"/><stop offset="1" stop-color="#3fbfae"/></linearGradient>' +
  '<radialGradient id="neonG"><stop offset="0" stop-color="#9ff7ea" stop-opacity=".55"/><stop offset=".4" stop-color="#6fe8d6" stop-opacity=".18"/><stop offset="1" stop-color="#6fe8d6" stop-opacity="0"/></radialGradient>' +
  '<radialGradient id="neonSpillG"><stop offset="0" stop-color="#7ff0de" stop-opacity=".15"/><stop offset=".5" stop-color="#7ff0de" stop-opacity=".05"/><stop offset="1" stop-color="#7ff0de" stop-opacity="0"/></radialGradient>' +
  '<linearGradient id="neonLiseG" x1="0" x2="1"><stop offset="0" stop-color="#bff9f0" stop-opacity="0"/><stop offset=".5" stop-color="#bff9f0" stop-opacity="1"/><stop offset="1" stop-color="#bff9f0" stop-opacity="0"/></linearGradient>' +
  '<linearGradient id="neonLiseV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bff9f0" stop-opacity=".9"/><stop offset="1" stop-color="#bff9f0" stop-opacity="0"/></linearGradient>' +
  '<radialGradient id="monG"><stop offset="0" stop-color="#a8f0da" stop-opacity=".2"/><stop offset="1" stop-color="#a8f0da" stop-opacity="0"/></radialGradient>' +
  '<linearGradient id="platFade" gradientUnits="userSpaceOnUse" x1="0" y1="520" x2="0" y2="556"><stop offset="0" stop-color="#fff" stop-opacity=".32"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
  '<mask id="mPlat" maskUnits="userSpaceOnUse" x="440" y="490" width="800" height="80"><rect x="457" y="498" width="756" height="58" fill="url(#platFade)"/></mask>' +
  '<filter id="reflBlur" x="-5%" y="-10%" width="110%" height="120%"><feGaussianBlur stdDeviation="1.3"/></filter>' +
  '<filter id="tracesF" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation=".9"/></filter>' +
  '<filter id="ctcF" x="-20%" y="-200%" width="140%" height="500%"><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"/><feGaussianBlur stdDeviation="2"/></filter>' +
  '<filter id="castF" x="-30%" y="-60%" width="160%" height="220%"><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"/><feGaussianBlur stdDeviation="5"/></filter>' +
  '<clipPath id="platClip"><rect x="440" y="400" width="790" height="152"/></clipPath>' +
  '<filter id="solF" x="-5%" y="-10%" width="110%" height="120%"><feGaussianBlur stdDeviation="3.5"/></filter>' +
  '<filter id="scrGlow" x="-10%" y="-40%" width="120%" height="180%"><feGaussianBlur stdDeviation="2.4" result="b"/><feComponentTransfer in="b" result="h"><feFuncA type="linear" slope=".5"/></feComponentTransfer><feMerge><feMergeNode in="h"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
  '<linearGradient id="neonReflG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8ff3e3" stop-opacity=".6"/><stop offset=".5" stop-color="#8ff3e3" stop-opacity=".25"/><stop offset="1" stop-color="#8ff3e3" stop-opacity=".05"/></linearGradient>' +
  '<filter id="rimF" x="-5%" y="-5%" width="110%" height="110%"><feOffset in="SourceAlpha" dx="2.5" dy="2.5" result="o"/><feComposite in="SourceAlpha" in2="o" operator="out" result="r"/><feGaussianBlur in="r" stdDeviation=".6" result="b"/><feFlood flood-color="#bff9f0"/><feComposite in2="b" operator="in"/></filter>' +
  '<linearGradient id="boxReflG" gradientUnits="userSpaceOnUse" x1="1520" y1="225" x2="1600" y2="420"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>' +
  '<mask id="boxReflM" maskUnits="userSpaceOnUse" x="1400" y="150" width="400" height="400"><rect x="1400" y="150" width="400" height="400" fill="url(#boxReflG)"/></mask>' +
  '<filter id="neonReflF" x="-60%" y="-10%" width="220%" height="120%"><feGaussianBlur stdDeviation="15"/></filter>' +
  '<pattern id="scan" width="5" height="5" patternUnits="userSpaceOnUse"><rect width="5" height="2.5" fill="#000" opacity=".12"/></pattern>' +
  '</defs>' +
  '<g id="bg"></g>' +
  // caméra de surveillance, en haut à droite (support fixe, corps qui pivote ; le dessin regarde la pièce)
  '<g id="gCam">' + I('', 'camera_support', 1520, 111, 80, 48.6, ' style="pointer-events:none"') +
  '<g id="camPivot" transform="translate(1560 135)" class="hs" data-k="camera"><g id="camRot">' +
  I('camImg', 'camera', -92.6, -45.5, 117.3, 89.5) +
  '<circle id="camLed" cx="12" cy="-20" r="3.5" fill="#3b3f3e"/>' +
  I('camMask', 'camera_drap', -92.6, -45.5, 117.3, 89.5, ' opacity="0"') +
  '</g></g></g>' +
  // porte et mot de 16 glissé dessous
  '<g id="gDoor"><g style="pointer-events:none">' + ombre(32, 45, 350, 690, 0.65) + '<ellipse cx="191" cy="702" rx="175" ry="9" fill="#000" opacity=".7" filter="url(#ombreP)"/>' + tuyau(376, -20, SOL + 8, 14) + tuyau(397, -20, SOL + 8, 7) +
  '<rect x="368" y="372" width="34" height="44" rx="2" fill="#262c2b" stroke="#0a0d0d" stroke-width="2"/><circle cx="385" cy="394" r="6" fill="#141818" stroke="#4c5553" stroke-width="1.5"/>' +
  '<g mask="url(#reflD)" filter="url(#solF)"><use href="#door" transform="translate(0 1121.6) scale(1 -.6)"/></g></g>' +
  '<g id="door" class="hs" data-k="door">' +
  '<rect id="doorLight" x="60" y="90" width="240" height="600" fill="#f4fbf8" opacity="0" filter="url(#flou)"/>' +
  I('doorImg', 'porte_fermee', -15.7, 17.5, 377.9, 709.6) + '</g></g>' +
  '<g id="gNote"><g id="note" class="hs" data-k="note" opacity="0"><rect x="140" y="672" width="108" height="44" fill="transparent"/><g id="noteSlide">' + I('', 'mot_plie', 150, 682, 88, 26.4) + '</g></g></g>' +
  // grille d'aération
  '<g id="gGrille"><g id="grille" class="hs" data-k="grille">' + I('grilleImg', 'grille', 1282.4, 518.9, 178.2, 92.3) + '</g></g>' +
  // trappe au sol, devant le bureau : toujours visible, verrouillée tant qu'on n'a pas le moyen de l'ouvrir
  '<g id="gTrappe"><g id="trappe" class="hs" data-k="trappe">' + I('trappeImg', 'trappe_fermee', 584.1, 636, 502.4, 456.8) + '</g></g>' +
  // vitre de la Chambre 18 : la pièce floue, la silhouette, puis le verre dépoli (partiellement transparent)
  '<g id="gWin">' + ombre(1116, 70, 1475, 385) + '<g id="win" class="hs" data-k="window">' +
  '<g clip-path="url(#glassClip)">' +
  I('', 'chambre18', GL.x, GL.y - 15, GL.w, GL.w, ' opacity=".9"') +
  '<g id="silMove" style="transition:transform .6s ease"><g id="sil" filter="url(#flou)" style="transition:opacity 1.2s ease">' + I('silImg', 'sil_debout', SIL.x, SIL.y, SIL.s, SIL.s) + '</g></g>' +
  '<rect x="' + GL.x + '" y="' + GL.y + '" width="' + GL.w + '" height="' + GL.h + '" fill="url(#fogG)" style="pointer-events:none"/>' +
  '<rect x="' + (GL.x + GL.w / 2 - 60) + '" y="' + (GL.y + 14) + '" width="120" height="7" rx="3" fill="#fff" opacity=".9" filter="url(#flou)" style="pointer-events:none"/>' +
  '</g>' + VITRE +
  '<g clip-path="url(#glassClip)">' +
  I('mainTrace', 'main', GL.x + 6, GL.y + 70, 250, 250, ' opacity="0" filter="url(#flou)" style="pointer-events:none"') +
  I('hand', 'main', GL.x + GL.w / 2 - 185, GL.y + 20, 370, 370, ' opacity="0" style="transition:opacity .5s ease"') +
  I('buee', 'fleche', GL.x + GL.w / 2 - 185, GL.y - 40, 370, 370, ' opacity="0" style="transition:opacity .8s ease"') +
  '<polygon points="' + (GL.x + 40) + ',' + (GL.y + GL.h) + ' ' + (GL.x + 120) + ',' + (GL.y + GL.h) + ' ' + (GL.x + 250) + ',' + GL.y + ' ' + (GL.x + 170) + ',' + GL.y + '" fill="url(#glassRG)" style="pointer-events:none"/>' +
  '<polygon points="' + (GL.x + 140) + ',' + (GL.y + GL.h) + ' ' + (GL.x + 160) + ',' + (GL.y + GL.h) + ' ' + (GL.x + 290) + ',' + GL.y + ' ' + (GL.x + 270) + ',' + GL.y + '" fill="url(#glassRG)" style="pointer-events:none"/>' +
  '<g class="lit"><g id="neonVitre"><rect x="' + (GL.x + GL.w * 0.6) + '" y="' + (GL.y - 30) + '" width="100" height="' + (GL.h + 60) + '" fill="url(#neonReflG)" filter="url(#neonReflF)"/></g></g>' +
  '<rect id="glassTint" x="' + GL.x + '" y="' + GL.y + '" width="' + GL.w + '" height="' + GL.h + '" fill="#000" opacity="0"/>' +
  '</g></g></g>' +
  // témoins CH. 18 — SIGNES VITAUX
  '<g id="gSig">' + ombre(SG.x, SG.y, SG.x + SG.w, SG.y + SG.h, 0.5) + '<g id="vies">' + I('', 'signes', SG.x, SG.y, SG.w, SG.h) +
  VIES.map(function (x, i) { return '<circle id="vieGlow' + (i + 1) + '" cx="' + x + '" cy="' + VIES_Y + '" r="20" fill="url(#ledG)" style="color:#3ee08f" opacity="0"/><circle id="vie' + (i + 1) + '" cx="' + x + '" cy="' + VIES_Y + '" r="9" fill="#3ee08f" opacity="0"/>'; }).join('') +
  '</g></g>' +
  // boîtier électrique de maintenance : ouvert, trois leviers (caméra, actionneur de la 18, auxiliaire)
  '<g id="gBox"><g style="pointer-events:none">' + ombre(1522, 205, 1660, 479) + tuyau(BX.x + 0.392 * BX.w, -20, BX.y + 4, 0.07 * BX.w) +
  tuyau(BX.x + 0.335 * BX.w, BX.y + BX.h - 4, SOL + 8, 0.061 * BX.w) + tuyau(BX.x + 0.462 * BX.w, BX.y + BX.h - 4, SOL + 8, 0.061 * BX.w) + '</g>' +
  '<g id="box" class="hs" data-k="box"><rect x="' + BX.x + '" y="' + BX.y + '" width="' + BX.w + '" height="' + BX.h + '" fill="transparent"/>' + I('boxImg', 'boitier_ferme', BX.x, BX.y, BX.w, BX.h) +
  '<g id="boxOpen" opacity="0" font-family="VT323, monospace" font-size="8" fill="#202421" text-anchor="middle">' +
  bt(0.361, 0.284, 'CAMÉRA A') + bt(0.361, 0.478, 'ACTIONNEUR') + bt(0.361, 0.503, 'CH.18') + bt(0.361, 0.692, 'AUX 24 V') +
  lev('levCam', SOCK[0]) + lev('levBtn', SOCK[1]) + lev('levAux', SOCK[2]) +
  '<circle id="ledCam" cx="' + bx(0.74, SOCK[0]) + '" r="3" fill="#3ee08f"/><circle id="ledBtn" cx="' + bx(0.74, SOCK[1]) + '" r="3" fill="#3ee08f"/><circle id="ledAux" cx="' + bx(0.74, SOCK[2]) + '" r="3" fill="#3ee08f"/></g>' +
  '<circle id="auxLed" cx="' + bx(0.7, 0.22) + '" r="4" fill="#3ee08f"/>' +
  '</g></g>' +
  // le centre : lampe, moniteur, bureau, bouton
  '<g id="gCenter">' +
  '<polygon id="cone" points="810,70 866,70 1140,850 530,850" fill="url(#coneG)" opacity=".6" filter="url(#coneBlur)" style="pointer-events:none"/>' +
  '<ellipse cx="836" cy="818" rx="340" ry="34" fill="url(#shadowG)" style="pointer-events:none"/>' +
  ombre(560, 92, 1090, 366, 0.7) +
  '<g class="hs" data-k="monitor">' + I('', 'moniteur', 560, 92, 530, 274.5) + '</g>' + '<ellipse class="monLueur" cx="824" cy="384" rx="240" ry="36" fill="url(#monG)" style="pointer-events:none"/>' + lisere(600, 1050, 92.5, 0.55) +
  '<g class="hs" data-k="light">' + I('', 'lampe', 745, -130, 187.3, 206) +
  '<circle id="bulb" cx="838" cy="68" r="30" fill="url(#bulbG)" style="pointer-events:none"/>' +
  '<g class="lit" style="pointer-events:none"><circle cx="838" cy="70" r="240" fill="url(#bulbG)" opacity=".16"/><ellipse cx="838" cy="63" rx="74" ry="9" fill="url(#bulbG)"/><ellipse cx="838" cy="63" rx="52" ry="5" fill="#fffdf6" opacity=".9"/></g></g>' +
  // sol mouillé : reflet du bureau et éclat de la lampe
  '<g style="pointer-events:none"><g mask="url(#reflM)" filter="url(#solF)"><use href="#desk" transform="translate(0 1305.6) scale(1 -.6)"/></g>' +
  '<g class="lit" opacity=".6"><ellipse cx="836" cy="884" rx="300" ry="70" fill="url(#sheenG)"/><ellipse cx="836" cy="890" rx="70" ry="120" fill="url(#sheenG)"/></g></g>' +
  '<g style="pointer-events:none">' + [[473, 542], [746, 933], [991, 1205]].map(function (p) { return pied(p[0], p[1]); }).join('') +
  '<ellipse id="btnFloor" cx="837" cy="880" rx="70" ry="46" fill="url(#glowG)" opacity="0"/></g>' +
  '<g id="desk">' +
  // bureau modulaire (pack 20/10, canevas 2000 × 1000 réduit d'un bloc à 0,4725) : fond, pied gravé, tiroir, compartiment, plateau
  I('', 'bureau3_fond', 471.2, 566.9, 713.5, 241, ' style="pointer-events:none"') +
  '<g class="hs" data-k="bureau">' + I('socleImg', 'bureau3_pied', 745.2, 566.9, 189, 241) + '</g>' +
  '<g id="compart" class="hs" data-k="compart">' + I('compImg', 'compart3_ferme', 990.9, 566.9, 215, 241) + '</g>' +
  '<g id="drawer" class="hs" data-k="drawer">' + I('drawerImg', 'tiroir3_ferme', 494.8, 574, 219.7, 87.9) + '</g>' +
  '<rect x="471" y="572" width="736" height="34" fill="url(#aoDown)" opacity=".75" style="pointer-events:none"/>' +  // ombre du plateau sur le dessous
  I('', 'bureau3_plateau', 457, 496, 756, 80.3, ' style="pointer-events:none"') + lisere(500, 1170, 496.5, 0.4) +
  '<ellipse class="lit" cx="836" cy="520" rx="330" ry="52" fill="url(#poolG)" style="pointer-events:none"/>' +
  '<g style="pointer-events:none"><ellipse class="lit" cx="836" cy="508" rx="230" ry="20" fill="url(#specG)"/></g>' +
  '<g style="pointer-events:none"><ellipse class="monLueur" cx="824" cy="508" rx="290" ry="16" fill="url(#monG)"/>' +
  '<g mask="url(#mPlat)" filter="url(#reflBlur)" opacity=".55"><use href="#phoneInner" transform="translate(0 1090) scale(1 -1)"/><use href="#btnImg" transform="translate(0 1092) scale(1 -1)"/><use href="#mugImg" transform="translate(0 1052) scale(1 -1)"/></g>' +
  '<g clip-path="url(#platClip)">' + ombreObjet('phoneInner', 573, 541, -16) + ombreObjet('btnImg', 837, 544, 0) + ombreObjet('mugImg', 1042, 524, 10) + '</g></g>' +
  '<ellipse id="btnGlow" cx="837" cy="495" rx="120" ry="60" fill="url(#glowG)" opacity="0" style="pointer-events:none"/>' +
  '<g id="btn" class="hs" data-k="btn" role="button" tabindex="0" aria-label="Appuyer sur le bouton rouge">' +
  I('btnImg', 'bouton', BTN.x, BTN.y, BTN.w, BTN.h) + I('btnImg2', 'bouton_enfonce', BTN.x, BTN.y, BTN.w, BTN.h, ' opacity="0"') +
  '<g id="traces" opacity="0" style="pointer-events:none" filter="url(#tracesF)"><g fill="#ffe2da" opacity=".3"><ellipse cx="818" cy="461" rx="7" ry="3.2" transform="rotate(-12 818 461)"/><ellipse cx="846" cy="457" rx="6" ry="2.8"/><ellipse cx="862" cy="464" rx="6.5" ry="3" transform="rotate(14 862 464)"/><ellipse cx="831" cy="467" rx="5" ry="2.4"/></g>' +
  '<g fill="#000" opacity=".4"><ellipse cx="806" cy="514" rx="15" ry="3"/><ellipse cx="872" cy="516" rx="12" ry="2.6"/></g></g></g>' +
  '<g id="phone" class="hs" data-k="phone"><rect x="500" y="440" width="172" height="104" fill="transparent"/><g id="phoneInner">' +
  I('telImg', 'tel_pose', 479.3, 445.5, 188.4, 99.6) + I('telImg2', 'tel_decroche', 479.3, 445.5, 188.4, 99.6, ' opacity="0"') + '</g>' +
  '<circle id="ecouteLed" cx="640" cy="520" r="4.5" fill="#ff3b30" class="pulse" opacity="0"/></g>' +
  // carnet de notes (dessin de l'artiste, aplati pour suivre la perspective du plateau)
  '<g id="carnet" class="hs" data-k="carnet"><rect x="916" y="500" width="84" height="50" fill="transparent"/>' +
  '<ellipse cx="958" cy="544" rx="40" ry="4" fill="#000" opacity=".55" filter="url(#ombreP)"/>' +
  I('carnetImg', 'carnet', 918, 515, 80, 31) +
  '</g>' +
  '<g class="hs" data-k="mug"><rect x="998" y="452" width="90" height="82" fill="transparent"/>' + I('mugImg', 'tasse', 1010, 468, 65.3, 58) + '</g>' +
  '</g></g>' +
  // ombre des coins, lumière et alarme
  // carte d'ombre tirée de l'image de référence : seule la lampe éclaire vraiment la pièce
  I('ombre', 'ombre', -400, -220, 2472, 1381, ' opacity=".8" style="pointer-events:none"') +
  // néon froid au-dessus de la vitre : il grésille de temps en temps, plus souvent quand le soupçon monte
  '<g id="gNeon" style="pointer-events:none"><rect x="1190" y="22" width="5" height="14" fill="#151a19"/><rect x="1395" y="22" width="5" height="14" fill="#151a19"/>' +
  '<rect x="1166" y="32" width="258" height="11" rx="2" fill="#1b201f" stroke="#070909" stroke-width="1.5"/>' +
  '<g class="lit"><g id="neonOn">' +
  '<ellipse cx="1295" cy="70" rx="340" ry="280" fill="url(#neonSpillG)"/>' +
  '<ellipse cx="1295" cy="47" rx="175" ry="26" fill="url(#neonG)"/>' +
  '<rect x="1172" y="43" width="246" height="7" rx="3.5" fill="url(#neonTubeG)"/>' +
  '' +
  // Reflet du néon sur le boîtier : liseré tiré du dessin lui-même (bords haut et gauche, tournés vers le néon), qu'il soit ouvert ou fermé.
  '<g mask="url(#boxReflM)"><use href="#boxImg" filter="url(#rimF)" opacity=".45" style="pointer-events:none"/></g>' +
  '<ellipse cx="1295" cy="830" rx="46" ry="150" fill="url(#neonSpillG)" opacity=".9"/>' +
  '</g></g></g>' +
  '<rect id="vig" x="0" y="0" width="' + W0 + '" height="' + H0 + '" fill="url(#vigG)" style="pointer-events:none"/>' +
  '<rect id="grain" x="0" y="0" width="' + W0 + '" height="' + H0 + '" fill="url(#grainP)" opacity=".05" style="pointer-events:none"/>' +
  '<rect id="tint" x="0" y="0" width="' + W0 + '" height="' + H0 + '" fill="#ff1e1e" opacity="0" style="pointer-events:none"/>' +
  '<rect id="dark" x="0" y="0" width="' + W0 + '" height="' + H0 + '" fill="#000" opacity="0" style="pointer-events:none"/>' +
  // écran (reste lisible dans le noir)
  '<g id="gCenter2" style="pointer-events:none">' +
  '<rect id="screen" x="' + SC.x + '" y="' + SC.y + '" width="' + SC.w + '" height="' + SC.h + '" rx="6" fill="#020605"/>' +
  '<g id="scr" font-family="VT323, Courier New, monospace" fill="#c8f8e8" text-anchor="middle" filter="url(#scrGlow)"></g>' +
  '<g id="video" clip-path="url(#screenClip)" opacity="0"></g>' +
  '<text id="journal" x="' + (SC.x + 10) + '" y="' + (SC.y + SC.h - 9) + '" font-family="VT323, monospace" font-size="15" fill="#7fd9bc" style="opacity:0"></text>' +
  '<rect x="' + SC.x + '" y="' + SC.y + '" width="' + SC.w + '" height="' + SC.h + '" rx="6" fill="url(#scan)"/>' +
  '<g class="lit" clip-path="url(#screenClip)"><rect x="' + SC.x + '" y="' + SC.y + '" width="' + SC.w + '" height="' + SC.h + '" fill="url(#glareG)"/>' +
  '<ellipse cx="' + SC.cx + '" cy="' + SC.y + '" rx="130" ry="18" fill="#fff3d6" opacity=".07"/>' +
  '<polygon points="' + (SC.x + SC.w - 95) + ',' + (SC.y + SC.h) + ' ' + (SC.x + SC.w - 60) + ',' + (SC.y + SC.h) + ' ' + (SC.x + SC.w - 5) + ',' + SC.y + ' ' + (SC.x + SC.w - 40) + ',' + SC.y + '" fill="#9ff7ea" opacity=".045"/></g>' +
  '</g>' +
  '<rect id="flash" x="0" y="0" width="' + W0 + '" height="' + H0 + '" fill="#fff" opacity="0" style="pointer-events:none"/>' +
  '</svg>';

  var svg = null, onHot = null, track = false, noteAvant = null, glitchT = null, host = null, sujet = 'A', pose = 'debout';
  function silNom(p) { return 'sil_' + (SIL_PAR_VERITE ? sujet + '_' : '') + p; }
  function $(id) { return document.getElementById(id); }
  function attr(id, k, v) { var e = $(id); if (e) e.setAttribute(k, v); }
  function taille(id, t) { var e = $(id); if (e) { e.setAttribute('x', t[0]); e.setAttribute('width', t[1]); e.setAttribute('height', t[2]); } }
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
  // La caméra suit le pointeur (petit angle : c'est un dessin de face). Le dessin regarde déjà la pièce.
  var camBase = '';
  function aim(x, y) {
    if (!track) return;
    var m = $('camPivot').getScreenCTM(); if (!m) return;
    var a = Math.atan2(y - m.f, m.e - x) * 180 / Math.PI; a = Math.max(-14, Math.min(14, (a - 30) / 3));
    attr('camRot', 'transform', camBase + ' rotate(' + (-a).toFixed(1) + ')');
  }

  // ---------- mise en page selon l'écran (paysage) ----------
  function shift(id, dx, dy) { attr(id, 'transform', 'translate(' + dx.toFixed(1) + ' ' + dy.toFixed(1) + ')'); }
  // Joints du sol en perspective : lignes vers le point de fuite (au-dessus du bureau), rangées qui s'écartent vers le joueur.
  function sol(W, H, fy, dy) {
    var vx = W / 2, vy = 300 + dy, d = '', k, t, y;
    for (k = -16; k <= 16; k++) { var xb = vx + k * 150; d += 'M' + (vx + (xb - vx) * (fy - vy) / (H - vy)).toFixed(1) + ' ' + fy + 'L' + xb.toFixed(1) + ' ' + H + ' '; }
    for (t = 1; t <= 6; t++) { y = fy + (H - fy) * Math.pow(t / 6, 1.7); d += 'M0 ' + y.toFixed(1) + 'L' + W + ' ' + y.toFixed(1) + ' '; }
    return '<path d="' + d + '" stroke="#000" stroke-opacity=".45" stroke-width="2" fill="none"/>' +
      '<path d="' + d + '" stroke="#cfd8d5" stroke-opacity=".05" stroke-width="1" fill="none" transform="translate(1.5 1.5)"/>';
  }
  function layout() {
    if (!svg || !host) return;
    var w = host.clientWidth, h = host.clientHeight; if (!w || !h) return;
    var a = w / h, W, H, dx = 0, dy = 0, sp = 0;
    if (a >= W0 / H0) { H = H0; W = H0 * a; dx = (W - W0) / 2; sp = Math.min(dx, 260) * 0.5; }
    else { W = W0; H = W0 / a; dy = (H - H0) / 2; }
    var floorY = SOL + dy;
    ['gCenter', 'gCenter2', 'gTrappe'].forEach(function (id) { shift(id, dx, dy); });
    ['gDoor', 'gNote'].forEach(function (id) { shift(id, dx - sp, dy); });
    ['gWin', 'gSig', 'gBox', 'gCam', 'gGrille', 'gNeon'].forEach(function (id) { shift(id, dx + sp, dy); });
    svg.setAttribute('viewBox', '0 0 ' + W.toFixed(1) + ' ' + H.toFixed(1));
    attr('ombre', 'x', dx - 400); attr('ombre', 'y', dy - 220);
    ['tint', 'dark', 'flash', 'vig', 'grain'].forEach(function (id) { attr(id, 'width', W); attr(id, 'height', H); });
    // Mur, plinthe, sol, et les deux coins de la pièce en perspective.
    attr('wallP', 'patternTransform', 'translate(' + ((W - 1780) / 2).toFixed(1) + ' ' + (dy - 125).toFixed(1) + ')');
    // mur en béton et soubassement vert-gris, comme sur le modèle
    var c = 84, g = '<rect x="0" y="0" width="' + W + '" height="' + floorY + '" fill="url(#wallP)"/>';
    g += '<rect x="0" y="' + floorY + '" width="' + W + '" height="' + (H - floorY) + '" fill="url(#floorP)"/>' +
      '<rect x="0" y="' + floorY + '" width="' + W + '" height="' + (H - floorY) + '" fill="#050707" opacity=".55"/>' +
      '<rect x="0" y="' + (floorY - 34) + '" width="' + W + '" height="36" fill="url(#plinthP)"/>' +
      '<rect x="0" y="' + (floorY - 34) + '" width="' + W + '" height="36" fill="#000" opacity=".4"/>' +
      '<rect x="0" y="' + (floorY - 110) + '" width="' + W + '" height="78" fill="url(#aoUp)"/>' +
      '<rect x="0" y="' + floorY + '" width="' + W + '" height="70" fill="url(#aoDown)"/>' +
      sol(W, H, floorY, dy) +
      '<polygon points="0,0 ' + c + ',0 ' + c + ',' + floorY + ' 0,' + (floorY + 70) + '" fill="url(#sideL)"/>' +
      '<polygon points="' + W + ',0 ' + (W - c) + ',0 ' + (W - c) + ',' + floorY + ' ' + W + ',' + (floorY + 70) + '" fill="url(#sideR)"/>' +
      '<g stroke="#000" stroke-opacity=".6" stroke-width="3"><line x1="' + c + '" y1="0" x2="' + c + '" y2="' + floorY + '"/><line x1="' + (W - c) + '" y1="0" x2="' + (W - c) + '" y2="' + floorY + '"/></g>';
    $('bg').innerHTML = g;
  }

  // ---------- état → dessin ----------
  function silhouette(p) {
    pose = p || pose;
    // Toutes les poses et les trois séries partagent le même canevas (l'enfant y est déjà dessiné plus petit) : pas de recalage.
    src('silImg', silNom(pose));
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
    // Le dernier voyant allumé vacille ; la pièce garde les traces : doigts sur le bouton, main sur la vitre.
    attr('vie1', 'class', s.vie === 1 ? 'vacille' : ''); attr('vieGlow1', 'class', s.vie === 1 ? 'vacille' : '');
    attr('traces', 'opacity', Math.min(1, (s.stats.presses || 0) * 0.18).toFixed(2));
    attr('mainTrace', 'opacity', s.stats.blessures ? Math.min(0.24, 0.1 + 0.05 * s.stats.blessures) : 0);
    // La silhouette se courbe avec sa vie ; la lumière de la 18 rougit quand le soupçon est élevé.
    // Quand la 18 attend ton signal, elle reste la paume contre la vitre.
    silhouette(s.items.indexOf('plan') >= 0 && s.vie > 0 ? 'paume' : poseVie(s.vie));
    attr('sil', 'opacity', s.vie > 0 && !info.silCachee ? 1 : 0);
    attr('glassTint', 'fill', s.vie > 0 && s.soupcon >= 3 ? '#7a1e10' : '#000');
    attr('glassTint', 'opacity', s.vie <= 0 ? 0.82 : s.soupcon >= 3 ? 0.3 : [0.82, 0.38, 0.18, 0][s.vie]);
    attr('hand', 'opacity', 0); attr('buee', 'opacity', 0); attr('silMove', 'transform', '');
    // caméra
    var blind = info.cameraAveugle, cut = has('cameraCoupee'), tournee = has('cameraTournee');
    track = s.cycle >= 3 && !blind && !info.urgence;
    camBase = tournee ? 'scale(-1 1)' : '';
    attr('camRot', 'transform', camBase);
    attr('camMask', 'opacity', blind && !cut && !tournee ? 1 : 0);
    attr('camImg', 'opacity', cut ? 0.75 : 1);
    attr('auxLed', 'fill', s.flags.aux === 'defaut' ? '#e3262b' : '#3ee08f'); attr('auxLed', 'class', s.flags.aux === 'defaut' ? 'pulse' : '');
    var led = blind ? '#2a2e2d' : s.cycle < 3 ? '#3b3f3e' : ['#3ee08f', '#3ee08f', '#f2a33a', '#e3262b', '#e3262b'][s.soupcon];
    attr('camLed', 'fill', led); attr('camLed', 'class', !blind && s.soupcon >= 3 ? 'pulse' : '');
    // objets
    attr('telImg', 'opacity', info.decroche ? 0 : 1); attr('telImg2', 'opacity', info.decroche ? 1 : 0);
    // Le mot de 16 glisse sous la porte au 4e appui (pas d'animation au chargement d'une partie).
    var noteVue = s.cycle >= 4 && !s.done.H1;
    if (!noteVue) attr('noteSlide', 'class', '');
    else if (noteAvant === false && s.cycle === 4) attr('noteSlide', 'class', 'glisse');
    noteAvant = noteVue;
    attr('note', 'opacity', noteVue ? 1 : 0);
    // Le tiroir et le compartiment ouverts ont un cadre plus grand que fermés : on change l'image et sa taille ensemble.
    var tir = s.flags.tiroirBeant ? (s.flags.tournevisDispo && !s.flags.tournevisPris && !has('tournevis') ? 'tiroir3_tournevis' : 'tiroir3_vide') : 'tiroir3_ferme';
    src('drawerImg', tir); taille('drawerImg', tir === 'tiroir3_ferme' ? [494.8, 219.7, 87.9] : [492.4, 224.4, 139.4]);
    var comp = !s.flags.compartiment ? 'compart3_ferme' : s.flags.compartiment === 'ouvert' ? 'compart3_fusible' : 'compart3_vide';
    src('compImg', comp); taille('compImg', comp === 'compart3_ferme' ? [990.9, 215, 241] : [990.9, 304.8, 241]);
    src('grilleImg', has('conduit') ? 'grille_ouverte' : 'grille');
    src('trappeImg', s.done.P4 === 'A' ? 'trappe_ouverte' : has('sortieCachee') ? 'trappe_preparee' : 'trappe_fermee');
    var ouvert = has('cameraCoupee') || has('boutonDesactive');
    src('boxImg', ouvert ? 'boitier_ouvert' : 'boitier_ferme'); attr('boxOpen', 'opacity', ouvert ? 1 : 0); attr('auxLed', 'opacity', ouvert ? 0 : 1);
    attr('ledCam', 'fill', cut ? '#e3262b' : '#3ee08f');
    attr('ledBtn', 'fill', has('boutonDesactive') ? '#e3262b' : '#3ee08f');
    attr('ledAux', 'fill', s.flags.aux === 'defaut' ? '#e3262b' : '#3ee08f');
    src('levCam', cut ? 'levier_bas' : 'levier_haut');
    src('levBtn', has('boutonDesactive') ? 'levier_bas' : 'levier_haut');
    src('levAux', s.flags.aux === 'defaut' ? 'levier_bas' : 'levier_haut');
    // bouton
    attr('btnGlow', 'opacity', info.ordre ? 0.8 : 0); attr('btnGlow', 'class', info.ordre ? 'pulse' : '');
    attr('btnFloor', 'opacity', info.ordre ? 0.3 : 0); attr('btnFloor', 'class', info.ordre ? 'pulse' : '');
    nerfs = s.soupcon || 0; neon();
    door(info.porteOuverte);
    // lumière
    usure = s.stats.presses || 0;
    var mode = info.urgence ? 'urgence' : (s.flags.compte && s.cycle >= 18) ? 'red' : s.cycle >= 16 ? 'cold' : 'normal';
    light(mode);
    attr('phoneInner', 'class', info.sonne ? 'ring' : '');
    // Petit voyant rouge : la ligne est écoutée.
    attr('ecouteLed', 'opacity', info.ecoute ? 1 : 0);
    // Garde-fou : pendant un ordre ou une sonnerie, les autres objets sont grisés (le moniteur reste lisible).
    var hs = svg.querySelectorAll('.hs');
    for (var i = 0; i < hs.length; i++) { var dk = hs[i].getAttribute('data-k'); hs[i].classList.toggle('grise', !!info.seulObjet && dk !== info.seulObjet && dk !== 'monitor'); }
  }

  // La pièce s'use : chaque pression baisse un peu la lumière de la lampe.
  var usure = 0;
  function light(mode) {
    var off = mode === 'off' || mode === 'urgence';
    var col = { normal: '#fff3d6', cold: '#bfe3ff', red: '#ff3b30' }[mode] || '#000';
    attr('coneStop', 'stop-color', col); attr('bulbStop', 'stop-color', col);
    attr('bulb', 'opacity', off ? 0 : 1);
    attr('cone', 'opacity', off ? 0 : 0.6 - Math.min(0.2, usure * 0.025));
    if (svg) svg.querySelectorAll('.lit').forEach(function (e) { e.setAttribute('opacity', off ? 0 : 1); });
    attr('dark', 'opacity', mode === 'off' ? 0.82 : mode === 'urgence' ? 0.86 : Math.min(0.14, usure * 0.018)); lueur();
    // Veilleuse orange pendant la coupure.
    attr('tint', 'fill', mode === 'cold' ? '#3a7cff' : mode === 'urgence' ? '#ff8a1e' : '#ff1e1e');
    attr('tint', 'opacity', mode === 'cold' ? 0.07 : mode === 'red' ? 0.16 : mode === 'urgence' ? 0.12 : 0);
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
    lueur(text ? 1 : 0.35);
    if (!text) return 0;
    var els = [], full = [];
    if (opt.big) {
      els.push(add(g, SC.cx, SC.cy + 30 * KS, 76 * KS, text, opt.color || '#ff5a4a')); full.push(text);
      if (opt.label) { els.push(add(g, SC.cx, SC.y + 22 * KS, 17 * KS, opt.label, opt.color || '#ff5a4a')); full.push(opt.label); }
    } else {
      var lines = wrap(text), fs = KS * (lines.length > 4 ? 16.5 : lines.length > 3 ? 19.5 : 24), lh = fs * 1.02, y0 = SC.cy - (lines.length - 1) * lh / 2 + fs * 0.32;
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
  // La lueur de l'écran sur le mur et le plateau suit ce qu'il affiche (et s'éteint avec le courant).
  var lueurEcran = 0.35;
  function lueur(o) { if (o != null) lueurEcran = o; if (svg) svg.querySelectorAll('.monLueur').forEach(function (e) { e.setAttribute('opacity', $('dark') && +$('dark').getAttribute('opacity') > 0.5 ? 0 : lueurEcran); }); }
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
  // B2 : la vraie caméra du joueur, en direct sur le moniteur (flux null = on retire).
  function camera(flux, txt) {
    var v = $('video'); if (!v) return;
    ecran('');
    if (!flux) { attr('video', 'opacity', 0); v.innerHTML = ''; return; }
    var x = SC.x, y = SC.y, w = SC.w, h = SC.h;
    v.innerHTML = '<foreignObject x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '"><video xmlns="http://www.w3.org/1999/xhtml" autoplay="" muted="" playsinline="" style="width:100%;height:100%;object-fit:cover;transform:scaleX(-1);filter:grayscale(1) contrast(1.35) brightness(.8)"></video></foreignObject>' +
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#0a2a22" opacity=".35"/>' +
      '<circle cx="' + (x + 13) + '" cy="' + (y + 14) + '" r="4.5" fill="#ff3b30" class="pulse"/>' +
      '<text x="' + (x + 24) + '" y="' + (y + 21) + '" font-family="VT323, monospace" font-size="' + (15 * KS) + '" fill="#ff8a7a">EN DIRECT</text>' +
      '<text x="' + (x + w / 2) + '" y="' + (y + h - 12) + '" text-anchor="middle" font-family="VT323, monospace" font-size="' + (26 * KS) + '" fill="#bff5e4">' + String(txt || '').replace(/\|/g, ' ').replace(/</g, '') + '</text>';
    var el = v.querySelector('video'); if (el) { el.muted = true; el.srcObject = flux; var p = el.play && el.play(); if (p && p.catch) p.catch(function () {}); }
    attr('video', 'opacity', 1); glitch(300);
  }
  // B3 : la « preuve », une vidéo granuleuse sur le moniteur (différente selon la vérité).
  function video(ms) {
    var v = $('video'); if (!v) return;
    var x = SC.x, y = SC.y, w = SC.w, h = SC.h, t = h * 1.25;
    var fond = sujet === 'B' ? I('', 'rev_B', x - 10, y - 8, w + 20, h + 16, ' preserveAspectRatio="xMidYMid slice"') : I('', 'chambre18', x - 10, y - 8, w + 20, h + 16, ' preserveAspectRatio="xMidYMid slice"') +
      (sujet === 'A' ? I('', silNom('debout'), x + w * 0.22, y - h * 0.05, t, t) + I('', silNom('poing'), x + w * 0.45, y - h * 0.08, t, t, ' opacity=".8"') : I('vidSil', silNom('debout'), x - t * 0.6, y + h * 0.05, t, t));
    v.innerHTML = '<g style="filter:grayscale(1) contrast(1.2) brightness(.8)">' + fond + '</g><rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="#0a2a22" opacity=".35"/>' +
      '<text id="vidT" x="' + (x + w - 8) + '" y="' + (y + 20) + '" text-anchor="end" font-family="VT323, monospace" font-size="17" fill="#bff5e4">14:02</text>' +
      '<circle cx="' + (x + 13) + '" cy="' + (y + 14) + '" r="4.5" fill="#ff3b30" class="pulse"/>';
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
    attr('flash', 'fill', '#fff'); attr('screen', 'fill', '#020605');
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

  // Le néon grésille au hasard : toutes les 8 à 20 s au calme, bien plus souvent quand le soupçon monte.
  var nerfs = 0, neonT = null;
  function neon() {
    if (neonT || reduce) return;
    neonT = setTimeout(function () {
      neonT = null;
      var seq = Math.random() < 0.5 ? [0.15, 1, 0.05, 0.8, 1] : [0.4, 1];
      seq.forEach(function (o, i) { later2(i * 70, function () { attr('neonOn', 'opacity', o); attr('neonVitre', 'opacity', o); }); });
      neon();
    }, (8000 + Math.random() * 12000) / (1 + nerfs));
  }

  // ---------- animations ----------
  function press() {
    attr('btnImg', 'opacity', 0); attr('btnImg2', 'opacity', 1); attr('traces', 'opacity', 0);
    setTimeout(function () { attr('btnImg', 'opacity', 1); attr('btnImg2', 'opacity', 0); }, 150);
    // La lampe grésille un instant après la pression.
    if (!reduce) { later2(350, function () { attr('bulb', 'opacity', 0.3); }); later2(420, function () { attr('bulb', 'opacity', 1); }); later2(500, function () { attr('bulb', 'opacity', 0.5); }); later2(560, function () { attr('bulb', 'opacity', 1); }); }
  }
  // Le moniteur note chaque geste vu par la caméra, en petit, en bas de l'écran.
  var journalT = null;
  function journal(txt) {
    var e = $('journal'); if (!e) return;
    e.textContent = txt; e.style.transition = ''; e.style.opacity = 0.85;
    clearTimeout(journalT); journalT = setTimeout(function () { e.style.transition = 'opacity 1.5s ease'; e.style.opacity = 0; }, 3500);
  }
  // La caméra réagit quand on touche un objet : petit mouvement, voyant qui clignote.
  function camRegarde() {
    if (reduce) return;
    attr('camRot', 'transform', camBase + ' rotate(-6)'); later2(300, function () { attr('camRot', 'transform', camBase); });
    var led = $('camLed'), f = led && led.getAttribute('fill'); if (!led) return;
    attr('camLed', 'fill', '#ff3b30'); later2(250, function () { attr('camLed', 'fill', f); });
  }
  function later2(ms, f) { setTimeout(f, ms); }
  // Une pose de la silhouette pendant un moment, puis retour à la pose qui suit sa vie.
  function poseTemp(p, ms) { silhouette(p); later2(ms, function () { silhouette(poseVie(vieCourante)); }); }
  // Animations jouées par les événements « anim » du moteur.
  var ANIMS = {
    // Coupure : « alimentation instable », la lampe clignote, puis le noir.
    panne: function () { blackout(false); var seq = [0.85, 0.1, 0.92, 0.3, 0.95, 0.5, 0.96]; seq.forEach(function (o, i) { later2(i * (reduce ? 0 : 110), function () { attr('dark', 'opacity', o); }); }); },
    lumiere: function () { blackout(false); if (reduce) return; attr('dark', 'opacity', 0.9); later2(120, function () { attr('dark', 'opacity', 0); }); later2(260, function () { attr('dark', 'opacity', 0.7); }); later2(420, function () { attr('dark', 'opacity', 0); }); },
    camTourne: function () { attr('camRot', 'transform', camBase + ' rotate(-10)'); later2(700, function () { attr('camRot', 'transform', camBase + ' rotate(8)'); }); later2(1400, function () { attr('camRot', 'transform', camBase); }); },
    vitreAllumee: function () { attr('glassTint', 'opacity', 0.7); later2(300, function () { attr('glassTint', 'opacity', 0.3); }); later2(600, function () { attr('glassTint', 'opacity', 0); }); },
    silArrive: function () { attr('sil', 'opacity', 1); },
    silMain: function () { poseTemp('paume', 2800); attr('hand', 'opacity', 0.9); later2(2600, function () { attr('hand', 'opacity', 0); }); },
    silFrappe: function () { poseTemp('poing', 1800); var n = 0, iv = setInterval(function () { attr('silMove', 'transform', n % 2 ? '' : 'translate(-4 2)'); if (++n > 5) { clearInterval(iv); attr('silMove', 'transform', ''); } }, 140); },
    silTourne: function () { poseTemp('tel', 2600); if (sujet !== 'A') { attr('silMove', 'transform', 'translate(40 0)'); later2(2200, function () { attr('silMove', 'transform', ''); }); } },
    silBuee: function () { attr('buee', 'opacity', 0.75); later2(3800, function () { attr('buee', 'opacity', 0); }); },
    compartiment: function () { src('compImg', 'compart3_fusible'); taille('compImg', [990.9, 304.8, 241]); },
    silSursaut: function () { harmLeger(); },
    silRecule: function () { poseTemp('recule', 1800); attr('silMove', 'transform', 'translate(26 0)'); later2(1700, function () { attr('silMove', 'transform', ''); }); },
    silApproche: function () { var cx = GL.x + GL.w / 2, cy = GL.y + GL.h; attr('silMove', 'transform', 'translate(' + cx + ' ' + cy + ') scale(1.08) translate(' + (-cx) + ' ' + (-cy) + ')'); later2(2000, function () { attr('silMove', 'transform', ''); }); },
    silDetourne: function () { poseTemp('tel', 2400); attr('silMove', 'transform', 'translate(-30 0)'); later2(2300, function () { attr('silMove', 'transform', ''); }); },
    silFige: function () { attr('hand', 'opacity', 0); attr('silMove', 'transform', ''); silhouette('debout'); },
    video: function () { video(5200); }
  };
  function anim(n) { if (ANIMS[n]) ANIMS[n](); }
  // B2 : chaque pression partielle fait sursauter la silhouette, sans blessure.
  function harmLeger() { poseTemp('recule', 400); attr('silMove', 'transform', 'translate(14 0)'); later2(250, function () { attr('silMove', 'transform', ''); }); }

  function harm(vieApres) {
    vieCourante = vieApres;
    silhouette('recule'); attr('silMove', 'transform', 'translate(30 0)');
    later2(900, function () { attr('silMove', 'transform', ''); silhouette(poseVie(vieApres)); if (vieApres <= 0) attr('sil', 'opacity', 0); });
    var n = 0;
    var iv = setInterval(function () { attr('glassTint', 'fill', n % 2 ? '#000' : '#ff2424'); attr('glassTint', 'opacity', n % 2 ? 0.2 : 0.45); if (++n > 5) { clearInterval(iv); attr('glassTint', 'fill', '#000'); attr('glassTint', 'opacity', [0.82, 0.38, 0.18, 0][Math.max(0, vieApres)]); } }, 120);
  }
  function flash() { if (reduce) return; attr('flash', 'opacity', 0.45); setTimeout(function () { attr('flash', 'opacity', 0); }, 90); }
  function alarm(ms) {
    if (reduce) { attr('tint', 'opacity', 0.15); setTimeout(function () { attr('tint', 'opacity', 0); }, ms); return; }
    var n = 0, iv = setInterval(function () { attr('tint', 'fill', '#ff1e1e'); attr('tint', 'opacity', n % 2 ? 0.05 : 0.22); if (++n * 250 > ms) { clearInterval(iv); attr('tint', 'opacity', 0); } }, 250);
  }
  function blackout(on) { attr('dark', 'opacity', on ? 0.96 : 0); lueur(); attr('cone', 'opacity', on ? 0 : 0.6); attr('bulb', 'opacity', on ? 0 : 1); svg.querySelectorAll('.lit').forEach(function (e) { e.setAttribute('opacity', on ? 0 : 1); }); }

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
    journal: journal, camRegarde: camRegarde, camera: camera, ecranFinir: ecranFinir, layout: layout, icone: icone, mount: mount, render: render, fin: fin, anim: anim, harmLeger: harmLeger, ecran: ecran, glitch: glitch, press: press, harm: harm, flash: flash, alarm: alarm, blackout: blackout
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
