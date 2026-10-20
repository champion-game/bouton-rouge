/* Le Bouton Rouge — sons synthétisés avec Web Audio (aucun fichier). */
(function (root) {
  'use strict';
  var AC = null, master = null, noiseBuf = null, hum = null, vent = null, muted = false;
  var ringOn = false, alarmOn = false;

  function init() {
    try {
      if (!AC) {
        AC = new (root.AudioContext || root.webkitAudioContext)();
        master = AC.createGain(); master.gain.value = muted ? 0 : 0.8; master.connect(AC.destination);
        noiseBuf = AC.createBuffer(1, AC.sampleRate, AC.sampleRate);
        var d = noiseBuf.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      }
      if (AC.state === 'suspended') AC.resume();
    } catch (e) { AC = null; }
  }
  function now() { return AC ? AC.currentTime : 0; }
  function osc(type, f, t0, dur, g, f2) {
    if (!AC) return; try {
      var o = AC.createOscillator(), a = AC.createGain(); o.type = type; o.frequency.setValueAtTime(f, t0); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
      a.gain.setValueAtTime(0, t0); a.gain.linearRampToValueAtTime(g, t0 + 0.01); a.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(a); a.connect(master); o.start(t0); o.stop(t0 + dur + 0.05);
    } catch (e) {}
  }
  function noise(t0, dur, g, type, f) {
    if (!AC) return; try {
      var s = AC.createBufferSource(), fl = AC.createBiquadFilter(), a = AC.createGain(); s.buffer = noiseBuf; fl.type = type || 'lowpass'; fl.frequency.value = f || 1000;
      a.gain.setValueAtTime(g, t0); a.gain.exponentialRampToValueAtTime(0.0001, t0 + dur); s.connect(fl); fl.connect(a); a.connect(master); s.start(t0); s.stop(t0 + dur + 0.05);
    } catch (e) {}
  }

  var SFX = {
    // Bouton : le poussoir s'enfonce (déclic), le ressort vibre, puis il remonte.
    clac: function () { var t = now(); noise(t, 0.025, 0.55, 'highpass', 2500); osc('square', 1700, t, 0.015, 0.05); osc('sine', 150, t, 0.18, 0.45, 70); osc('triangle', 420, t + 0.01, 0.12, 0.04, 380); noise(t + 0.14, 0.02, 0.3, 'highpass', 3200); osc('sine', 260, t + 0.14, 0.06, 0.12, 180); },
    blink: function () { var t = now(); osc('square', 100, t, 0.18, 0.06); osc('square', 120, t + 0.05, 0.1, 0.05); },
    thud: function () { var t = now(); osc('sine', 80, t, 0.45, 0.5, 40); noise(t, 0.2, 0.2, 'lowpass', 300); },
    knock: function () { var t = now(); for (var i = 0; i < 3; i++) { osc('sine', 180, t + i * 0.2, 0.12, 0.35, 90); noise(t + i * 0.2, 0.06, 0.25, 'bandpass', 900); } },
    cry: function () {
      if (!AC) return; try {
        var t = now(), o = AC.createOscillator(), f = AC.createBiquadFilter(), a = AC.createGain(); o.type = 'sawtooth';
        o.frequency.setValueAtTime(280, t); o.frequency.linearRampToValueAtTime(520, t + 0.25); o.frequency.linearRampToValueAtTime(240, t + 0.9);
        f.type = 'lowpass'; f.frequency.value = 650; a.gain.setValueAtTime(0, t); a.gain.linearRampToValueAtTime(0.16, t + 0.08); a.gain.exponentialRampToValueAtTime(0.0001, t + 1);
        o.connect(f); f.connect(a); a.connect(master); o.start(t); o.stop(t + 1.05);
      } catch (e) {}
    },
    lock: function () { var t = now(); noise(t, 0.03, 0.5, 'highpass', 3000); osc('square', 900, t, 0.04, 0.08); osc('sine', 120, t + 0.04, 0.12, 0.3, 60); },
    glitch: function () { var t = now(); for (var i = 0; i < 6; i++) osc('square', 300 + Math.random() * 1500, t + i * 0.04, 0.03, 0.05); },
    paper: function () { var t = now(); noise(t, 0.35, 0.15, 'bandpass', 3500); },
    slam: function () { var t = now(); noise(t, 0.4, 0.7, 'lowpass', 500); osc('sine', 55, t, 0.6, 0.6, 35); },
    pickup: function () { var t = now(); noise(t, 0.05, 0.3, 'bandpass', 1500); osc('sine', 600, t + 0.05, 0.08, 0.05); },
    tick: function () { var t = now(); osc('square', 1200, t, 0.03, 0.04); },
    cycle: function () { var t = now(); osc('sine', 330, t, 0.25, 0.06); osc('sine', 220, t + 0.12, 0.3, 0.05); },
    alarm: function () { startAlarm(2600); },
    pas: function () { var t = now(); for (var i = 0; i < 5; i++) { osc('sine', 70, t + i * 0.5, 0.2, 0.14, 45); noise(t + i * 0.5, 0.08, 0.06, 'lowpass', 400); } }
  };

  // Battement sourd (k de 0 à 1 : plus fort quand le temps de l'ordre s'écoule), moteur de caméra, grésillement de lampe.
  SFX.coeur = function (k) { k = k || 0; var t = now(); osc('sine', 58, t, 0.13, 0.22 + 0.4 * k, 38); osc('sine', 52, t + 0.2, 0.15, 0.16 + 0.3 * k, 34); };
  SFX.servo = function () { var t = now(); osc('sawtooth', 220, t, 0.22, 0.025, 330); noise(t, 0.22, 0.04, 'bandpass', 2400); };
  SFX.gresil = function () { var t = now(); for (var i = 0; i < 5; i++) noise(t + i * 0.05 + Math.random() * 0.03, 0.03, 0.12, 'highpass', 4000); };
  // Toucher un objet : un bruit propre à chaque objet de la pièce.
  var TOUCHE = {
    drawer: function (t) { noise(t, 0.4, 0.16, 'bandpass', 650); noise(t + 0.05, 0.3, 0.08, 'bandpass', 1300); osc('sine', 110, t + 0.38, 0.14, 0.35, 70); noise(t + 0.38, 0.08, 0.2, 'lowpass', 700); },
    compart: function (t) { osc('square', 1900, t, 0.015, 0.06); noise(t, 0.02, 0.35, 'highpass', 3000); osc('triangle', 520, t + 0.08, 0.35, 0.05, 490); osc('triangle', 780, t + 0.08, 0.25, 0.025); noise(t + 0.08, 0.12, 0.12, 'bandpass', 2500); },
    trappe: function (t) { osc('square', 1500, t, 0.015, 0.05); osc('triangle', 320, t + 0.06, 0.45, 0.06, 300); osc('triangle', 470, t + 0.06, 0.3, 0.03); noise(t + 0.06, 0.2, 0.15, 'bandpass', 1500); },
    grille: function (t) { for (var i = 0; i < 4; i++) { var d = t + i * 0.045 + Math.random() * 0.02; noise(d, 0.03, 0.2, 'bandpass', 2600 + Math.random() * 1200); osc('square', 650 + Math.random() * 300, d, 0.02, 0.03); } },
    box: function (t) { noise(t, 0.03, 0.3, 'highpass', 2000); osc('triangle', 290, t, 0.45, 0.07, 270); osc('triangle', 430, t, 0.35, 0.04, 410); noise(t, 0.25, 0.12, 'bandpass', 1200); },
    mug: function (t) { noise(t, 0.015, 0.25, 'highpass', 4000); osc('sine', 2350, t, 0.3, 0.05); osc('sine', 3650, t, 0.18, 0.03); osc('sine', 180, t, 0.06, 0.12, 120); },
    light: function (t) { noise(t, 0.015, 0.4, 'highpass', 4000); osc('square', 2100, t, 0.01, 0.05); osc('sine', 120, t, 0.05, 0.15, 90); },
    door: function (t) { for (var i = 0; i < 2; i++) { var d = t + i * 0.14; noise(d, 0.03, 0.35, 'bandpass', 2200); osc('triangle', 600, d, 0.08, 0.05, 520); osc('sine', 90, d, 0.12, 0.3, 60); } },
    carnet: function (t) { noise(t, 0.18, 0.14, 'bandpass', 3200); noise(t + 0.22, 0.2, 0.11, 'bandpass', 2300); },
    note: function (t) { noise(t, 0.22, 0.13, 'bandpass', 2900); },
    window: function (t) { for (var i = 0; i < 2; i++) { var d = t + i * 0.16; noise(d, 0.02, 0.3, 'highpass', 2600); osc('sine', 1850, d, 0.07, 0.05); osc('sine', 300, d, 0.05, 0.1, 220); } },
    bureau: function (t) { osc('sine', 210, t, 0.12, 0.3, 140); noise(t, 0.08, 0.2, 'lowpass', 800); },
    monitor: function (t) { osc('sine', 15600, t, 0.3, 0.008); osc('square', 880, t, 0.05, 0.03); }
  };
  SFX.toucher = function (k) { if (AC && TOUCHE[k]) TOUCHE[k](now()); };
  function sfx(n, a) { if (SFX[n]) SFX[n](a); }
  // Pression pendant un ordre : la ventilation et le bourdonnement montent ; null = retour à l'ambiance.
  function tension(k) { if (!AC) return; if (k == null) return ambiance({}); rampe(ventG, 0.05 + 0.13 * k); rampe(droneG, 0.012 + 0.06 * k); }

  // ---------- ambiance qui évolue avec la partie ----------
  var humG = null, ventG = null, droneG = null;
  var etat = { vie: 3, soupcon: 0, vent: 'normal', actif: false, phase: 1 }, souffleT = null, eventT = null;
  function startAmbience() {
    if (!AC || hum) return; try {
      hum = AC.createOscillator(); humG = AC.createGain(); hum.frequency.value = 50; humG.gain.value = 0.025; hum.connect(humG); humG.connect(master); hum.start();
      var s = AC.createBufferSource(), f = AC.createBiquadFilter(); ventG = AC.createGain(); s.buffer = noiseBuf; s.loop = true; f.type = 'lowpass'; f.frequency.value = 380; ventG.gain.value = 0.05; s.connect(f); f.connect(ventG); ventG.connect(master); s.start(); vent = s;
      // Bourdonnement grave qui monte avec le soupçon (deux notes proches qui battent).
      droneG = AC.createGain(); droneG.gain.value = 0; var lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 140; lp.connect(droneG); droneG.connect(master);
      [41, 43.3].forEach(function (fq) { var o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.value = fq; o.connect(lp); o.start(); });
    } catch (e) {}
  }
  function rampe(g, v) { if (g && AC) { g.gain.cancelScheduledValues(now()); g.gain.setTargetAtTime(v, now(), 0.8); } }
  // État de la partie → sons de fond : ventilation, bourdonnement du soupçon, respiration derrière la vitre, bruits lointains.
  function ambiance(e) {
    for (var k in e) etat[k] = e[k];
    if (!AC) return;
    rampe(ventG, { normal: 0.05, faible: 0.012, off: 0 }[etat.vent]);
    rampe(humG, etat.vent === 'off' ? 0.004 : 0.025);
    rampe(droneG, etat.actif ? [0, 0.008, 0.02, 0.04, 0.06][etat.soupcon] || 0 : 0);
    if (etat.actif && !souffleT) souffle();
    if (etat.actif && !eventT) evenement();
  }
  // Respiration de la 18 : calme, puis plus rapide, puis hachée ; plus rien quand elle n'a plus de vie.
  function souffle() {
    souffleT = null;
    if (!etat.actif || !AC) return;
    if (etat.vie > 0) {
      var t = now(), g = [0, 0.05, 0.04, 0.03][etat.vie];
      noise(t, 0.9, g, 'bandpass', 700); noise(t + 1.1, 1.1, g * 0.8, 'bandpass', 500);
      if (etat.vie === 1) noise(t + 0.5, 0.25, g * 0.6, 'bandpass', 900);
    }
    souffleT = setTimeout(souffle, [5000, 2300, 3200, 4400][etat.vie] + Math.random() * 600);
  }
  // Un bruit lointain de temps en temps : des pas, une porte, du métal, trois coups.
  function evenement() {
    eventT = setTimeout(function () {
      eventT = null;
      if (!etat.actif || !AC) return;
      var t = now(), r = Math.random();
      // Surveillance accrue : le petit moteur de la caméra se fait entendre.
      if (etat.phase === 2 && Math.random() < 0.4) { osc('sawtooth', 220, t, 0.6, 0.012, 260); osc('sawtooth', 260, t + 0.7, 0.5, 0.01, 210); }
      else if (r < 0.35) { for (var i = 0; i < 4; i++) { osc('sine', 70, t + i * 0.55, 0.2, 0.12, 45); noise(t + i * 0.55, 0.08, 0.05, 'lowpass', 400); } }
      else if (r < 0.6) { noise(t, 0.5, 0.18, 'lowpass', 300); osc('sine', 48, t, 0.7, 0.18, 32); }
      else if (r < 0.8) { osc('triangle', 1900, t, 1.2, 0.025); osc('triangle', 2650, t + 0.01, 0.9, 0.015); }
      else { for (var j = 0; j < 3; j++) { osc('sine', 160, t + j * 0.35, 0.1, 0.1, 90); } }
      evenement();
    }, (etat.phase === 3 ? 30000 : 18000) + Math.random() * 18000);
  }

  // Murmure synthétisé pendant que la voix de la 18 (ou une voix au téléphone) se tape : des syllabes sans mots.
  // `hauteur` : grave pour un homme, plus aigu pour une femme ou un enfant. `tel` : bande étroite du combiné.
  function murmure(ms, hauteur, tel) {
    if (!AC || muted || !ms) return; try {
      var t = now() + 0.03, fin = t + Math.min(ms, 7000) / 1000, h = hauteur || 1;
      var out = AC.createBiquadFilter(); out.type = tel ? 'bandpass' : 'lowpass'; out.frequency.value = tel ? 1400 : 900; out.Q.value = tel ? 0.8 : 0.7;
      var g = AC.createGain(); g.gain.value = tel ? 0.5 : 0.35; out.connect(g); g.connect(master);
      while (t < fin) {
        var d = 0.07 + Math.random() * 0.11, f0 = 105 * h * (0.88 + Math.random() * 0.28);
        var o = AC.createOscillator(), fo = AC.createBiquadFilter(), a = AC.createGain();
        o.type = 'sawtooth'; o.frequency.setValueAtTime(f0, t); o.frequency.linearRampToValueAtTime(f0 * (0.9 + Math.random() * 0.2), t + d);
        fo.type = 'bandpass'; fo.frequency.value = (450 + Math.random() * 900) * Math.sqrt(h); fo.Q.value = 3;
        a.gain.setValueAtTime(0, t); a.gain.linearRampToValueAtTime(0.09, t + d * 0.3); a.gain.linearRampToValueAtTime(0, t + d);
        o.connect(fo); fo.connect(a); a.connect(out); o.start(t); o.stop(t + d + 0.02);
        t += d + (Math.random() < 0.18 ? 0.12 + Math.random() * 0.15 : 0.01);
      }
    } catch (e) {}
  }

  function ring(on) {
    if (on === ringOn) return; ringOn = on; if (!on) return;
    (function loop() { if (!ringOn || !AC) return; var t = now(); for (var i = 0; i < 2; i++) { osc('sine', 440, t + i * 0.5, 0.4, 0.08); osc('sine', 480, t + i * 0.5, 0.4, 0.08); } setTimeout(loop, 2200); })();
  }
  function startAlarm(ms) {
    if (alarmOn) return; alarmOn = true; var end = Date.now() + (ms || 2000);
    (function loop() { if (!alarmOn || !AC || Date.now() > end) { alarmOn = false; return; } osc('sawtooth', 620, now(), 0.45, 0.06, 940); setTimeout(loop, 500); })();
  }
  function stopAll() { ringOn = false; alarmOn = false; }
  function setMuted(m) { muted = m; if (master) master.gain.value = m ? 0 : 0.8; }

  root.BRAudio = { tension: tension, murmure: murmure, ambiance: ambiance, init: init, sfx: sfx, startAmbience: startAmbience, ring: ring, stopAll: stopAll, setMuted: setMuted, isMuted: function () { return muted; } };
})(typeof globalThis !== 'undefined' ? globalThis : this);
