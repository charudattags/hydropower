import { useEffect, useRef } from 'react';
import { FLOW_PATHS, POWER_PATH } from '../data/flow';
import { STAGE } from '../data/components';

/**
 * ── ENERGY PATH OVERLAY ──────────────────────────────────────────────────────
 * One full-viewport <canvas>. Every frame we read the live camera MotionValues (x, y, scale) and
 * set a canvas transform that maps the 1400×764 design space onto the screen, so particles are
 * always crisp (rendered at screen resolution, never bitmap-scaled) and stay locked to the artwork
 * while the camera flies.
 *
 * Two layers: the AMBIENT layer is always on (the plant is never static: penstock flow, spillway, river,
 * reservoir glints, spinning runner, energy packets on the cables); the OVERLAY layer (toggle) intensifies it,
 * dims the photo and adds the underglow ribbon, pulse rings and the lightning bolt.
 *
 * Colour = energy conversion:  deep blue (potential) → cyan (kinetic) → white-hot (transfer) → yellow (electric).
 * Flow speed comes from `speedRef` (slider) so it can change without re-mounting anything.
 */

const rand = (a, b) => a + Math.random() * (b - a);
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
const BLUE = [40, 120, 255], CYAN = [46, 230, 255], WHITE = [235, 250, 255], GOLD = [255, 194, 51], HOT = [255, 236, 150];

/** Pre-sample an SVG path into a polyline with cumulative length for O(1)-ish lookup per particle. */
function samplePath(d) {
  const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  p.setAttribute('d', d);
  const len = p.getTotalLength();
  const n = Math.max(2, Math.ceil(len / 3));
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const pt = p.getPointAtLength((i / n) * len);
    pts.push([pt.x, pt.y]);
  }
  return { pts, len };
}
const at = (path, t) => {
  const f = Math.min(0.9999, Math.max(0, t)) * (path.pts.length - 1);
  const i = Math.floor(f), r = f - i;
  const a = path.pts[i], b = path.pts[i + 1];
  return [a[0] + (b[0] - a[0]) * r, a[1] + (b[1] - a[1]) * r, b[0] - a[0], b[1] - a[1]];
};

function buildScene() {
  const paths = FLOW_PATHS.map((f) => {
    const s = samplePath(f.d);
    const count = f.kind === 'transfer' ? 0 : Math.round(s.len / (f.kind === 'spill' ? 5 : f.kind === 'river' ? 9 : f.id === 'penstock' ? 7 : 12));
    const parts = Array.from({ length: count }, () => ({ t: Math.random(), off: rand(-9, 9), sz: rand(1.1, 2.6), v: rand(0.8, 1.2) }));
    return { ...f, ...s, parts };
  });
  const pw = samplePath(`M${POWER_PATH.map((p) => p.join(' ')).join(' L')}`);
  return { paths, pw, sparks: [] };
}

export default function FlowCanvas({ active, cam, box, speedRef, dimmed, visible = true }) {
  const cv = useRef(null);
  const scene = useRef(null);
  const live = useRef({ active, dimmed, box, visible });
  live.current = { active, dimmed, box, visible };
  const fade = useRef(0);

  useEffect(() => {
    scene.current = buildScene();
    const canvas = cv.current;
    const ctx = canvas.getContext('2d');
    let raf, last = performance.now(), clock = 0, jitterAt = 0, jag = null, w = 0, h = 0, dpr = 1;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const streak = (path, t, len, width, col, alpha) => {
      const [x, y] = at(path, t), [x0, y0] = at(path, t - len);
      ctx.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},${alpha})`;
      ctx.lineWidth = width;
      ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x, y); ctx.stroke();
    };
    const norm = (dx, dy) => { const l = Math.hypot(dx, dy) || 1; return [-dy / l, dx / l]; };

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const { active: on, dimmed: dim } = live.current;
      fade.current += ((on ? 1 : 0) - fade.current) * Math.min(1, dt * 5);
      if (!live.current.visible) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height); return; }
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const sp = (speedRef.current || 1) * (reduce ? 0.25 : 1);
      clock += dt * sp;
      const { pw, paths, sparks } = scene.current;
      const b = live.current.box; // { W, H } stage pixel size
      const kk = b.W / STAGE.w;
      const cs = cam.scale.get() * kk * dpr;
      ctx.setTransform(cs, 0, 0, cs, cam.x.get() * dpr, cam.y.get() * dpr);
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      const F = fade.current;                 // overlay strength 0..1
      const A = (0.55 + 0.45 * F) * (dim ? 0.55 : 1); // ambient layer is always visible

      // 1 ─ Water particles along intake → penstock → tailrace. They ACCELERATE down the penstock
      //     (speed factor rises with t) to show potential energy converting to kinetic energy.
      paths.forEach((p) => {
        if (p.kind === 'transfer') return;
        if (p.kind === 'spill' || p.kind === 'river') {
          const river = p.kind === 'river';
          p.parts.forEach((q) => {
            q.t += (dt * sp * (river ? 60 : 150) * q.v) / p.len;
            if (q.t > 1) { q.t -= 1; q.off = rand(river ? -42 : -16, river ? 42 : 16); }
            const [x, y, dx, dy] = at(p, q.t), [nx, ny] = norm(dx, dy);
            const ox = nx * q.off * (river ? 1 + q.t * 0.4 : 1), oy = ny * q.off * (river ? 1 + q.t * 0.4 : 1);
            ctx.save(); ctx.translate(ox, oy);
            streak(p, q.t, river ? 0.03 : 0.045, river ? 1.4 : 1.9, river ? CYAN : WHITE, (river ? 0.32 : 0.6) * A * Math.sin(q.t * Math.PI));
            ctx.restore();
          });
          return;
        }
        const isPen = p.id === 'penstock';
        p.parts.forEach((q) => {
          const accel = isPen ? 0.55 + q.t * 1.5 : p.id === 'tailrace' ? 0.9 - q.t * 0.35 : 0.5;
          q.t += (dt * sp * 95 * q.v * accel) / p.len;
          if (q.t > 1) { q.t -= 1; q.off = rand(-9, 9); }
          const [x, y, dx, dy] = at(p, q.t);
          const [nx, ny] = norm(dx, dy);
          const ox = nx * q.off, oy = ny * q.off;
          const col = isPen ? mix(BLUE, CYAN, q.t) : p.id === 'tailrace' ? mix(CYAN, BLUE, q.t) : BLUE;
          const trail = (isPen ? 0.012 + q.t * 0.05 : 0.02) * (260 / p.len) * Math.min(2, 0.6 + sp * 0.5);
          ctx.save(); ctx.translate(ox, oy);
          streak(p, q.t, trail, q.sz, col, 0.85 * A);
          ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${0.9 * A})`;
          ctx.beginPath(); ctx.arc(x, y, q.sz * 0.9, 0, 6.283); ctx.fill();
          ctx.restore();
        });
        // soft underglow so the channel reads as a continuous ribbon
        ctx.strokeStyle = `rgba(46,150,255,${0.13 * F})`; ctx.lineWidth = isPen ? 15 : 10;
        ctx.beginPath(); p.pts.forEach((pt, i) => (i ? ctx.lineTo(pt[0], pt[1]) : ctx.moveTo(pt[0], pt[1]))); ctx.stroke();
      });

      // 2 ─ Kinetic transfer at the turbine: rotating arc segments shift cyan → white → gold, and
      //     pulse rings expand outward as motion is handed to the shaft.
      const cx = 812, cy = 548;
      for (let i = 0; i < 9; i++) {
        const a = clock * 4.2 + (i / 9) * 6.283;
        const col = mix(CYAN, HOT, i / 9);
        ctx.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},${0.9 * A})`;
        ctx.lineWidth = 3.2;
        ctx.beginPath(); ctx.arc(cx, cy, 30, a, a + 0.36); ctx.stroke();
      }
      for (let i = 0; i < 2; i++) {
        const ph = (clock * 0.7 + i * 0.5) % 1;
        ctx.strokeStyle = `rgba(255,226,122,${(1 - ph) * 0.5 * F})`; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx, cy, 20 + ph * 46, 0, 6.283); ctx.stroke();
      }
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 44);
      g.addColorStop(0, `rgba(255,236,150,${(0.14 + 0.31 * F)})`); g.addColorStop(1, 'rgba(46,230,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, 44, 0, 6.283); ctx.fill();

      // 2b ─ Ambient life: spinning runner blades (motion-blurred), rotor glow at the generator,
      //      twinkling glints on the reservoir surface.
      ctx.lineWidth = 2.4;
      for (let i = 0; i < 6; i++) {
        const a = clock * 6.5 + (i / 6) * 6.283;
        ctx.strokeStyle = `rgba(235,250,255,${0.5 * A})`;
        ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * 9, cy + Math.sin(a) * 9); ctx.quadraticCurveTo(cx + Math.cos(a + 0.5) * 20, cy + Math.sin(a + 0.5) * 20, cx + Math.cos(a + 0.9) * 27, cy + Math.sin(a + 0.9) * 27); ctx.stroke();
      }
      for (let i = 0; i < 3; i++) {
        const a = clock * 3 + i * 2.094;
        ctx.strokeStyle = `rgba(255,194,51,${0.85 * A})`; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(832, 383, 44, 12, 0, a, a + 0.9); ctx.stroke();
      }
      for (let i = 0; i < 46; i++) {
        const gx = 20 + ((i * 97) % 310) + Math.sin(clock * 0.4 + i) * 6, gy = 176 + ((i * 53) % 150) * (1 + (i % 3) * 0.05);
        const tw = Math.max(0, Math.sin(clock * (0.9 + (i % 5) * 0.3) + i * 1.7));
        ctx.strokeStyle = `rgba(230,246,255,${0.55 * tw * A})`; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + 5 + tw * 6, gy); ctx.stroke();
      }

      // 3 ─ Lightning: jagged polyline re-randomised ~every 90 ms (scaled by speed) with three
      //     stacked strokes (halo, body, white-hot core). A bright "packet" travels the route.
      jitterAt -= dt * sp;
      if (jitterAt <= 0 || !jag) {
        jitterAt = 0.09;
        jag = [];
        for (let i = 0; i < pw.pts.length - 1; i += 6) {
          const [x, y, dx, dy] = at(pw, i / (pw.pts.length - 1));
          const [nx, ny] = norm(dx, dy), j = rand(-7, 7);
          jag.push([x + nx * j, y + ny * j]);
        }
        jag.push(pw.pts[pw.pts.length - 1]);
      }
      const bolt = (wid, col, al) => {
        ctx.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},${al * A})`; ctx.lineWidth = wid;
        ctx.beginPath(); jag.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.stroke();
      };
      const LB = F; // bolt strength follows the overlay toggle
      if (LB > 0.02) { ctx.globalAlpha = LB; bolt(11, GOLD, 0.16); bolt(4.5, GOLD, 0.6); bolt(1.6, WHITE, 0.95); ctx.globalAlpha = 1; }
      for (let i = 0; i < 3; i++) {
        const t = (clock * 0.38 + i / 3) % 1;
        const [x, y] = at(pw, t);
        const gg = ctx.createRadialGradient(x, y, 0, x, y, 22);
        gg.addColorStop(0, `rgba(255,245,190,${(0.3 + 0.65 * F) * A})`); gg.addColorStop(1, 'rgba(255,194,51,0)');
        ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(x, y, 22, 0, 6.283); ctx.fill();
        if (Math.random() < dt * (6 + 24 * F) * sp) sparks.push({ x, y, vx: rand(-40, 40), vy: rand(-55, 10), life: 1 });
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.life -= dt * 2.2; s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 60 * dt;
        if (s.life <= 0) { sparks.splice(i, 1); continue; }
        ctx.fillStyle = `rgba(255,220,100,${s.life * A})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, 1.6 * s.life + 0.4, 0, 6.283); ctx.fill();
      }
      if (sparks.length > 160) sparks.splice(0, sparks.length - 160);
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [cam, speedRef]);

  return <canvas ref={cv} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />;
}
