/**
 * Tiny synthesised sound design (no audio files). Browsers only allow audio after a user gesture,
 * so everything is opt-in: `audio.enable()` is called from a click on the sound toggle.
 *   thud(size)  – block landing: pitched-down sine + filtered noise burst
 *   sting()     – "power on": rising fifth stack
 *   whoosh()    – camera push-through
 *   ambience()  – low water-like drone (filtered noise + sub), fades in/out
 */
let ctx = null, master = null, amb = null, on = false;
const listeners = new Set();

function ensure() {
  if (ctx) return ctx;
  ctx = new (window.AudioContext || window.webkitAudioContext)();
  master = ctx.createGain(); master.gain.value = 0.0; master.connect(ctx.destination);
  return ctx;
}
const noiseBuf = () => {
  const b = ctx.createBuffer(1, ctx.sampleRate * 1.5, ctx.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return b;
};

export const audio = {
  get on() { return on; },
  subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  enable(v = true) {
    ensure(); ctx.resume();
    on = v;
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.linearRampToValueAtTime(v ? 0.8 : 0, ctx.currentTime + 0.4);
    listeners.forEach((f) => f(on));
  },
  thud(size = 1) {
    if (!on) return; const t = ctx.currentTime;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(120 * size + 40, t); o.frequency.exponentialRampToValueAtTime(34, t + 0.35);
    g.gain.setValueAtTime(0.9 * Math.min(1, size), t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.5);
    const n = ctx.createBufferSource(); n.buffer = noiseBuf();
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(1400, t); f.frequency.exponentialRampToValueAtTime(120, t + 0.25);
    const ng = ctx.createGain(); ng.gain.setValueAtTime(0.35 * size, t); ng.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    n.connect(f); f.connect(ng); ng.connect(master); n.start(t); n.stop(t + 0.35);
  },
  sting() {
    if (!on) return; const t = ctx.currentTime;
    [110, 165, 220, 330, 440].forEach((fr, i) => {
      const o = ctx.createOscillator(), g = ctx.createGain(); o.type = i % 2 ? 'triangle' : 'sawtooth';
      o.frequency.setValueAtTime(fr * 0.5, t); o.frequency.exponentialRampToValueAtTime(fr, t + 0.6);
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(3200, t + 0.7);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.11, t + 0.35); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.6);
      o.connect(f); f.connect(g); g.connect(master); o.start(t); o.stop(t + 2.7);
    });
  },
  whoosh() {
    if (!on) return; const t = ctx.currentTime;
    const n = ctx.createBufferSource(); n.buffer = noiseBuf();
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 0.7; f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(5200, t + 0.9);
    const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.5, t + 0.6); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
    n.connect(f); f.connect(g); g.connect(master); n.start(t); n.stop(t + 1.3);
  },
  ambience() {
    if (!ctx || amb) return;
    const n = ctx.createBufferSource(); n.buffer = noiseBuf(); n.loop = true;
    const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 420;
    const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.12; lg.gain.value = 160; lfo.connect(lg); lg.connect(f.frequency); lfo.start();
    const g = ctx.createGain(); g.gain.value = 0; g.gain.linearRampToValueAtTime(0.09, ctx.currentTime + 3);
    const sub = ctx.createOscillator(), sg = ctx.createGain(); sub.frequency.value = 46.875; sg.gain.value = 0.05; sub.connect(sg); sg.connect(g); sub.start(); // 187.5 rpm / 4
    n.connect(f); f.connect(g); g.connect(master); n.start(); amb = { n, g };
  },
};
