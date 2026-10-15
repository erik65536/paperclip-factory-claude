// Tiny synthesized sound effects (no audio files). Created lazily on first user gesture.
let ctx = null, enabled = true, master = null;
let lastType = 0;

export function setSound(on) { enabled = on; }

function ac() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0.18; master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, dur, { type = 'triangle', vol = 1, at = 0, slide = 0 } = {}) {
  const c = ac(); if (!c) return;
  const t = c.currentTime + at;
  const o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g); g.connect(master);
  o.start(t); o.stop(t + dur + 0.02);
}

function noise(dur, vol = 0.4, at = 0) {
  const c = ac(); if (!c) return;
  const len = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const s = c.createBufferSource(), g = c.createGain(), f = c.createBiquadFilter();
  f.type = 'highpass'; f.frequency.value = 2500;
  s.buffer = buf; g.gain.value = vol; s.connect(f); f.connect(g); g.connect(master);
  s.start(c.currentTime + at);
}

const SFX = {
  click: () => tone(520, 0.05, { type: 'square', vol: 0.25 }),
  make: () => { noise(0.05, 0.35); tone(900 + Math.random() * 200, 0.06, { type: 'triangle', vol: 0.4, slide: -300 }); },
  cash: () => { tone(1046, 0.08, { vol: 0.5 }); tone(1568, 0.16, { vol: 0.5, at: 0.06 }); },
  buy: () => { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.12, { vol: 0.4, at: i * 0.05 })); },
  type: () => { const n = performance.now(); if (n - lastType < 35) return; lastType = n; tone(1400 + Math.random() * 400, 0.02, { type: 'square', vol: 0.12 }); },
  alert: () => { tone(220, 0.25, { type: 'sawtooth', vol: 0.3 }); tone(165, 0.35, { type: 'sawtooth', vol: 0.3, at: 0.2 }); },
  story: () => { tone(784, 0.2, { vol: 0.35 }); tone(988, 0.3, { vol: 0.35, at: 0.12 }); },
  bad: () => tone(200, 0.15, { type: 'square', vol: 0.25, slide: -80 }),
  memo: () => { noise(0.08, 0.2); tone(660, 0.1, { vol: 0.3, at: 0.05 }); },
  phase: () => { [392, 523, 659, 784, 1046, 1318].forEach((f, i) => tone(f, 0.25, { vol: 0.35, at: i * 0.09 })); },
};

export function sfx(name) {
  if (!enabled) return;
  try { SFX[name] && SFX[name](); } catch (e) { /* audio unavailable */ }
}
