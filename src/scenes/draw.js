/**
 * Localised "focused view" animations. Each scene is a pure function
 *     draw(ctx, T)  →  paints one frame on a 400 × 260 design canvas
 * where T is *speed-scaled* seconds (the Flow Speed slider and hover boost feed into T),
 * so every scene speeds up / slows down consistently with the main overlay.
 */
const TAU = Math.PI * 2;
const W = 400, H = 260;
const frac = (v) => v - Math.floor(v);
const seed = (i, k = 1) => frac(Math.sin(i * 127.1 + k * 311.7) * 43758.5453);

function bg(ctx, a = '#0a1e3d', b = '#050d1d') {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, a); g.addColorStop(1, b);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(120,190,255,.05)'; ctx.lineWidth = 1;
  for (let x = 0; x <= W; x += 20) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y <= H; y += 20) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
}
function label(ctx, s, x, y, col = 'rgba(200,225,255,.85)', size = 10, align = 'left') {
  ctx.font = `500 ${size}px "JetBrains Mono", ui-monospace, monospace`;
  ctx.fillStyle = col; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  ctx.fillText(s, x, y);
}
function glow(ctx, x, y, r, rgb, a) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
}
function waves(ctx, y0, amp, T, colTop, colBot, x0 = 0, x1 = W, bottom = H, layers = 3) {
  for (let l = 0; l < layers; l++) {
    ctx.beginPath(); ctx.moveTo(x0, bottom);
    for (let x = x0; x <= x1; x += 4) ctx.lineTo(x, y0 + l * 5 + Math.sin(x * 0.03 + T * (1 + l * 0.5) + l * 2) * amp * (1 - l * 0.25));
    ctx.lineTo(x1, bottom); ctx.closePath();
    const g = ctx.createLinearGradient(0, y0, 0, bottom);
    g.addColorStop(0, colTop); g.addColorStop(1, colBot);
    ctx.globalAlpha = 0.55 + l * 0.2; ctx.fillStyle = g; ctx.fill(); ctx.globalAlpha = 1;
  }
}
function concrete(ctx, x0, y0, x1, y1) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  g.addColorStop(0, '#8b97a8'); g.addColorStop(1, '#4b5566');
  return g;
}

/* ── 01 Reservoir: stored water, head, potential energy ─────────────────────────────── */
function reservoir(ctx, T) {
  bg(ctx, '#0b2144', '#050d1d');
  const level = 62 + Math.sin(T * 0.4) * 2;
  waves(ctx, level, 3, T * 1.3, 'rgba(70,150,255,.85)', 'rgba(10,50,120,.95)', 0, 268, H);
  // potential-energy motes bobbing in the water – brighter the higher they sit
  for (let i = 0; i < 26; i++) {
    const x = 14 + seed(i) * 236, y = level + 18 + seed(i, 2) * 130 + Math.sin(T * 1.2 + i) * 4;
    const a = 0.75 - (y - level) / 220;
    glow(ctx, x, y, 7, '110,190,255', a * 0.6);
    ctx.fillStyle = `rgba(200,235,255,${a})`; ctx.beginPath(); ctx.arc(x, y, 1.6, 0, TAU); ctx.fill();
  }
  // dam wall
  ctx.fillStyle = concrete(ctx, 250, 40, 330, 230);
  ctx.beginPath(); ctx.moveTo(262, 44); ctx.lineTo(298, 44); ctx.lineTo(340, 236); ctx.lineTo(236, 236); ctx.lineTo(262, 44); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.14)'; for (let y = 70; y < 230; y += 26) { ctx.beginPath(); ctx.moveTo(258 - (y - 44) * -0.08, y); ctx.lineTo(320, y); ctx.stroke(); }
  waves(ctx, 214, 1.6, T * 2, 'rgba(60,140,240,.7)', 'rgba(8,40,100,.9)', 300, W, H, 2);
  // head dimension
  ctx.setLineDash([3, 4]); ctx.strokeStyle = 'rgba(255,214,90,.8)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(210, level); ctx.lineTo(210, 214); ctx.stroke(); ctx.setLineDash([]);
  [[level, 1], [214, -1]].forEach(([y, d]) => { ctx.beginPath(); ctx.moveTo(205, y + 7 * d); ctx.lineTo(210, y); ctx.lineTo(215, y + 7 * d); ctx.stroke(); });
  label(ctx, 'H = 160 m', 200, 142, '#ffe27a', 11, 'right');
  label(ctx, 'E = m·g·h', 14, 246, 'rgba(180,215,255,.8)', 11);
  // outflow through intake
  const p = frac(T * 0.5);
  glow(ctx, 262 + p * 60, 205 + p * 6, 10, '46,230,255', 0.7 * (1 - p));
}

/* ── 02 Intake: trash rack filters debris, gate meters the flow ─────────────────────── */
function intake(ctx, T) {
  bg(ctx, '#0a2145', '#061225');
  ctx.fillStyle = 'rgba(30,110,220,.28)'; ctx.fillRect(0, 40, 270, 190);
  waves(ctx, 40, 2, T * 1.4, 'rgba(90,170,255,.6)', 'rgba(20,80,180,.2)', 0, 270, 230, 2);
  // streaming water dots; every 5th is debris that is stopped by the rack and skimmed upward
  for (let i = 0; i < 46; i++) {
    const ph = frac(T * (0.16 + seed(i, 3) * 0.08) + seed(i));
    const y0 = 60 + seed(i, 4) * 150, debris = i % 5 === 0;
    let x = ph * 300, y = y0 + Math.sin(T * 2 + i) * 3;
    if (debris && x > 150) { x = 148 - Math.sin(T + i) * 2; y = y0 - Math.min(y0 - 44, (ph - 0.5) * 420); if (y < 46) continue; }
    if (debris) { ctx.fillStyle = '#a8794a'; ctx.fillRect(x - 3, y - 2, 6, 4); }
    else { glow(ctx, x, y, 6, '90,200,255', 0.5); ctx.fillStyle = '#cfefff'; ctx.beginPath(); ctx.arc(x, y, 1.5, 0, TAU); ctx.fill(); }
  }
  // trash rack
  for (let y = 40; y < 230; y += 9) { ctx.fillStyle = concrete(ctx, 0, 0, 0, 1); ctx.fillStyle = '#9aa6b8'; ctx.fillRect(158, y, 4, 6); }
  ctx.fillStyle = '#7e8ba0'; ctx.fillRect(156, 40, 2, 190); ctx.fillRect(162, 40, 2, 190);
  // gate house + gate
  ctx.fillStyle = concrete(ctx, 200, 30, 330, 240); ctx.fillRect(200, 30, 86, 205);
  const gateY = 70 + (Math.sin(T * 0.6) * 0.5 + 0.5) * 60;
  ctx.fillStyle = '#2b3550'; ctx.fillRect(206, 110, 74, 62);
  const gg = ctx.createLinearGradient(0, 0, 60, 0); gg.addColorStop(0, '#f5c542'); gg.addColorStop(1, '#b8871b');
  ctx.fillStyle = gg; ctx.fillRect(206, 40, 74, gateY + 20 - 40);
  ctx.strokeStyle = '#111'; ctx.lineWidth = 1; ctx.strokeRect(206, 40, 74, gateY - 20);
  // water passes beneath the gate → penstock
  for (let i = 0; i < 10; i++) { const p = frac(T * 0.5 + i / 10); glow(ctx, 206 + p * 200, 150 + p * 14, 8, '46,230,255', 0.7); }
  label(ctx, 'TRASH RACK', 160, 28, 'rgba(200,225,255,.8)', 9, 'center');
  label(ctx, 'GATE', 243, 28, '#ffe27a', 9, 'center');
  label(ctx, 'Q = A · v', 14, 246, 'rgba(180,215,255,.8)', 11);
}

/* ── 03 Penstock: pressurised, accelerating flow ────────────────────────────────────── */
function penstock(ctx, T) {
  bg(ctx, '#091a38', '#050d1d');
  const L = 400, ang = Math.atan2(170, 340);
  ctx.save(); ctx.translate(200, 128); ctx.rotate(ang);
  const shell = ctx.createLinearGradient(0, -36, 0, 36);
  shell.addColorStop(0, '#5f77a3'); shell.addColorStop(0.5, '#2c4270'); shell.addColorStop(1, '#16233f');
  ctx.fillStyle = shell; ctx.beginPath(); ctx.roundRect(-L / 2, -36, L, 72, 8); ctx.fill();
  const inner = ctx.createLinearGradient(-L / 2, 0, L / 2, 0);
  inner.addColorStop(0, '#1d4fd0'); inner.addColorStop(0.6, '#1ea0e6'); inner.addColorStop(1, '#3ff0ff');
  ctx.fillStyle = inner; ctx.fillRect(-L / 2, -27, L, 54);
  for (let i = 0; i < 44; i++) { // fast streaks – longer and quicker toward the turbine end
    const y = -24 + seed(i) * 48, u = frac(T * (0.35 + seed(i, 2) * 0.3) * (0.7 + 0.8 * seed(i, 5)) + seed(i, 3));
    const x = -L / 2 + u * L, len = 6 + u * 46;
    const g = ctx.createLinearGradient(x - len, 0, x, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(235,252,255,.95)');
    ctx.strokeStyle = g; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x - len, y); ctx.lineTo(x, y); ctx.stroke();
  }
  ctx.fillStyle = '#0d1730'; for (let x = -L / 2 + 44; x < L / 2; x += 66) ctx.fillRect(x, -36, 5, 72); // flanges
  ctx.fillStyle = 'rgba(255,255,255,.12)'; ctx.fillRect(-L / 2, -32, L, 5);
  ctx.restore();
  label(ctx, '0 bar', 16, 78, 'rgba(200,225,255,.7)', 10);
  label(ctx, '16 bar', 386, 252, '#3ff0ff', 10, 'right');
  label(ctx, 'v = √(2·g·h)', 14, 246, 'rgba(180,215,255,.8)', 11);
}

/* ── 04 Turbine: Francis runner with inward spiralling flow ─────────────────────────── */
function turbine(ctx, T) {
  bg(ctx, '#0a1d3d', '#050d1d');
  const cx = 200, cy = 126;
  glow(ctx, cx, cy, 120, '46,150,255', 0.16);
  ctx.strokeStyle = '#3a4b6e'; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(cx, cy, 116, 0, TAU); ctx.stroke();
  ctx.strokeStyle = 'rgba(160,190,255,.35)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(cx, cy, 111, 0, TAU); ctx.stroke();
  const open = 0.9 + Math.sin(T * 0.5) * 0.18; // wicket gates breathing open / shut
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * TAU;
    ctx.save(); ctx.translate(cx + Math.cos(a) * 94, cy + Math.sin(a) * 94); ctx.rotate(a + open);
    ctx.fillStyle = '#7d8fb5'; ctx.beginPath(); ctx.roundRect(-13, -2.5, 26, 5, 2.5); ctx.fill(); ctx.restore();
  }
  // water: cyan at the rim → gold as it hands energy to the runner
  for (let i = 0; i < 70; i++) {
    const u = frac(T * (0.22 + seed(i, 2) * 0.1) + seed(i));
    const r = 112 - u * 56, a = seed(i, 3) * TAU + u * 2.4 - T * 0.15;
    const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
    const k = Math.pow(u, 1.5), c = `${Math.round(46 + 209 * k)},${Math.round(230 - 36 * k)},${Math.round(255 - 204 * k)}`;
    glow(ctx, x, y, 6, c, 0.45 * (1 - u * 0.4)); ctx.fillStyle = `rgb(${c})`; ctx.beginPath(); ctx.arc(x, y, 1.7, 0, TAU); ctx.fill();
  }
  // runner
  const rot = T * 2.6;
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
  for (let i = 0; i < 9; i++) {
    ctx.save(); ctx.rotate((i / 9) * TAU);
    const g = ctx.createLinearGradient(0, 0, 60, 20); g.addColorStop(0, '#dfe8f8'); g.addColorStop(1, '#5b6c92');
    ctx.fillStyle = g; ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 0.8;
    ctx.beginPath(); ctx.moveTo(14, 0); ctx.bezierCurveTo(30, -8, 52, -4, 60, 16); ctx.bezierCurveTo(48, 6, 30, 8, 14, 9); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
  }
  ctx.restore();
  const hub = ctx.createRadialGradient(cx - 4, cy - 4, 1, cx, cy, 20); hub.addColorStop(0, '#fff3c0'); hub.addColorStop(1, '#9a7b1c');
  ctx.fillStyle = hub; ctx.beginPath(); ctx.arc(cx, cy, 15, 0, TAU); ctx.fill();
  glow(ctx, cx, cy, 30, '255,226,122', 0.35 + 0.1 * Math.sin(T * 6));
  label(ctx, '187.5 rpm', 14, 246, '#ffe27a', 11);
  label(ctx, 'KINETIC → MECHANICAL', 386, 246, 'rgba(180,215,255,.8)', 9, 'right');
}

/* ── 05 Generator: rotating magnetic field induces current in stator coils ──────────── */
function generator(ctx, T) {
  bg(ctx, '#0a1a38', '#050d1d');
  const cx = 200, cy = 112, rot = T * 1.5, POLES = 12;
  ctx.fillStyle = '#26324f'; ctx.beginPath(); ctx.arc(cx, cy, 104, 0, TAU); ctx.fill();
  ctx.fillStyle = '#0a1226'; ctx.beginPath(); ctx.arc(cx, cy, 80, 0, TAU); ctx.fill();
  for (let j = 0; j < 36; j++) { // stator coils light up as a pole sweeps past → induction
    const a = (j / 36) * TAU, k = Math.pow(Math.max(0, Math.cos((POLES / 2) * (a - rot))), 3);
    ctx.save(); ctx.translate(cx + Math.cos(a) * 91, cy + Math.sin(a) * 91); ctx.rotate(a);
    ctx.fillStyle = `rgb(${Math.round(120 + 135 * k)},${Math.round(80 + 114 * k)},${Math.round(40 + 10 * k)})`;
    if (k > 0.2) { glow(ctx, 0, 0, 14, '255,194,51', k * 0.6); }
    ctx.fillStyle = `rgb(${Math.round(150 + 105 * k)},${Math.round(100 + 94 * k)},${Math.round(50 * (1 - k) + 51 * k)})`;
    ctx.beginPath(); ctx.roundRect(-9, -3, 18, 6, 2); ctx.fill(); ctx.restore();
  }
  ctx.save(); ctx.strokeStyle = 'rgba(46,230,255,.75)'; ctx.lineWidth = 1.2; ctx.setLineDash([3, 5]); ctx.lineDashOffset = -T * 30;
  for (let i = 0; i < POLES; i += 2) { // field lines arcing between neighbouring N / S poles
    const a0 = rot + (i / POLES) * TAU, a1 = rot + ((i + 1) / POLES) * TAU, am = (a0 + a1) / 2;
    for (const off of [0, 5]) {
      ctx.beginPath(); ctx.moveTo(cx + Math.cos(a0) * 70, cy + Math.sin(a0) * 70);
      ctx.quadraticCurveTo(cx + Math.cos(am) * (92 + off), cy + Math.sin(am) * (92 + off), cx + Math.cos(a1) * 70, cy + Math.sin(a1) * 70); ctx.stroke();
    }
  }
  ctx.restore();
  ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
  for (let i = 0; i < POLES; i++) {
    ctx.save(); ctx.rotate((i / POLES) * TAU);
    ctx.fillStyle = i % 2 ? '#e0603c' : '#2f7cf0'; ctx.beginPath(); ctx.roundRect(46, -9, 26, 18, 3); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.font = '600 8px Inter'; ctx.textAlign = 'center'; ctx.fillText(i % 2 ? 'S' : 'N', 59, 3); ctx.restore();
  }
  ctx.fillStyle = '#39456b'; ctx.beginPath(); ctx.arc(0, 0, 46, 0, TAU); ctx.fill(); ctx.restore();
  const hub = ctx.createRadialGradient(cx - 3, cy - 3, 1, cx, cy, 16); hub.addColorStop(0, '#fff3c0'); hub.addColorStop(1, '#9a7b1c');
  ctx.fillStyle = hub; ctx.beginPath(); ctx.arc(cx, cy, 13, 0, TAU); ctx.fill();
  // AC output trace
  ctx.beginPath();
  for (let x = 20; x <= 380; x += 3) { const y = 246 - Math.sin(x * 0.075 - T * 6) * 9; x === 20 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
  ctx.strokeStyle = '#ffc233'; ctx.shadowColor = '#ffc233'; ctx.shadowBlur = 8; ctx.lineWidth = 1.8; ctx.stroke(); ctx.shadowBlur = 0;
  label(ctx, '50 Hz · 13.8 kV', 386, 232, 'rgba(255,226,122,.9)', 9, 'right');
}

/* ── 06 Tailrace: spent water calmly returns to the river ───────────────────────────── */
function tailrace(ctx, T) {
  bg(ctx, '#0a2145', '#061225');
  ctx.fillStyle = concrete(ctx, 0, 60, 90, 240); ctx.beginPath(); ctx.moveTo(0, 60); ctx.lineTo(74, 60); ctx.lineTo(96, 132); ctx.lineTo(96, 236); ctx.lineTo(0, 236); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#04101f'; ctx.beginPath(); ctx.roundRect(66, 132, 60, 78, 6); ctx.fill();
  const sur = 132;
  waves(ctx, sur, 2.5, T * 1.6, 'rgba(70,160,255,.85)', 'rgba(8,50,130,.9)', 96, W, 236, 3);
  for (let i = 0; i < 40; i++) { // streamlines: fast & turbulent at the outlet, calmer downstream
    const u = frac(T * (0.2 + seed(i, 2) * 0.08) + seed(i)), x = 100 + u * 300;
    const y = sur + 14 + seed(i, 3) * 76 + Math.sin(T * 3 + i) * (8 * (1 - u));
    glow(ctx, x, y, 6, '90,200,255', 0.4); ctx.fillStyle = '#d4f2ff'; ctx.beginPath(); ctx.arc(x, y, 1.4, 0, TAU); ctx.fill();
  }
  for (let i = 0; i < 3; i++) { // expanding surface ripples
    const p = frac(T * 0.35 + i / 3), x = 130 + i * 90 + p * 40;
    ctx.strokeStyle = `rgba(200,235,255,${(1 - p) * 0.5})`; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.ellipse(x, sur + 3, 8 + p * 40, 2 + p * 6, 0, 0, TAU); ctx.stroke();
  }
  ctx.fillStyle = '#3a2f24'; ctx.fillRect(96, 236, 304, 24);
  ctx.strokeStyle = '#3ff0ff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(300, 108); ctx.lineTo(364, 108); ctx.lineTo(356, 102); ctx.moveTo(364, 108); ctx.lineTo(356, 114); ctx.stroke();
  label(ctx, 'DRAFT TUBE', 60, 118, 'rgba(200,225,255,.8)', 9, 'center');
  label(ctx, 'Q_out = Q_in', 14, 252, 'rgba(180,215,255,.9)', 11);
  label(ctx, 'TO RIVER', 330, 96, '#3ff0ff', 9, 'center');
}

export const SCENES = { reservoir, intake, penstock, turbine, generator, tailrace };
export const SCENE_SIZE = { w: W, h: H };
