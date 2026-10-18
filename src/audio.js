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
    clac: function () { var t = now(); noise(t, 0.05, 0.5, 'highpass', 1800); osc('sine', 140, t, 0.16, 0.5, 50); },
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
    alarm: function () { startAlarm(2600); }
  };

  function sfx(n) { if (SFX[n]) SFX[n](); }

  function startAmbience() {
    if (!AC || hum) return; try {
      hum = AC.createOscillator(); var g = AC.createGain(); hum.frequency.value = 50; g.gain.value = 0.025; hum.connect(g); g.connect(master); hum.start();
      var s = AC.createBufferSource(), f = AC.createBiquadFilter(), g2 = AC.createGain(); s.buffer = noiseBuf; s.loop = true; f.type = 'lowpass'; f.frequency.value = 380; g2.gain.value = 0.05; s.connect(f); f.connect(g2); g2.connect(master); s.start(); vent = s;
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

  root.BRAudio = { init: init, sfx: sfx, startAmbience: startAmbience, ring: ring, stopAll: stopAll, setMuted: setMuted, isMuted: function () { return muted; } };
})(typeof globalThis !== 'undefined' ? globalThis : this);
