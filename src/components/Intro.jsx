import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { AnimatePresence, motion } from 'framer-motion';
import { audio } from '../utils/audio';

/**
 * ── INTRO: the plant assembles itself ───────────────────────────────────────────
 * A Three.js scene of low-poly "blocks" (bedrock, reservoir, dam, intake, penstock, powerhouse,
 * turbine, generator, tailrace, transformer, pylon). Each block has a start offset and a time slot;
 * it flies/falls in with an ease, and when it reaches its slot:
 *   • the camera takes an impulse (shake) that decays exponentially,
 *   • the block squashes, its outline flashes white-hot and a shock ring expands from the contact point.
 * Post-processing: UnrealBloom (kicked up on every impact and at power-on), noise-based camera shake with a little
 * roll, spark bursts, letterbox bars and an optional synthesised soundtrack.
 * The whole build is scheduled inside BUILD_END seconds (< 4 s). When the last block lands the plant
 * "powers on" (bolt + emissive pulse) and the React overlay reveals the title → subtitle → button.
 */
const BUILD_END = 3.45;
const MORPH_DUR = 2.0;
const BG0 = new THREE.Color(0x03070f), BG1 = new THREE.Color(0x0c1b36);
const ease = { out: (t) => 1 - (1 - t) ** 3, in: (t) => t * t * t, back: (t) => 1 + 2.4 * (t - 1) ** 3 + 1.4 * (t - 1) ** 2 };

const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.2, ...o });

function makeScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x03070f); scene.fog = new THREE.Fog(0x03070f, 30, 70);
  const blocks = [];
  const edgeMats = [];
  const root = new THREE.Group();
  root.position.y = -2.4;
  scene.add(root);

  const add = (name, obj, target, from, t0, dur, mode = 'out', glowColor = 0x2ee6ff) => {
    const g = new THREE.Group();
    g.add(obj);
    obj.traverse((m) => {
      if (m.isMesh && m.geometry && !m.userData.noEdge) {
        m.castShadow = true; m.receiveShadow = true;
        const em = new THREE.LineBasicMaterial({ color: glowColor, transparent: true, opacity: 0.5 });
        edgeMats.push(em);
        m.add(new THREE.LineSegments(new THREE.EdgesGeometry(m.geometry, 30), em));
        (g.userData.edges ||= []).push(em);
      }
    });
    g.position.copy(target).add(from);
    g.visible = false;
    root.add(g);
    blocks.push({ name, g, target: target.clone(), from: from.clone(), t0, dur, mode, landed: false, landT: 0 });
    return g;
  };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const glass = (color, op, o = {}) => mat(color, { transparent: true, opacity: op, roughness: 0.12, metalness: 0.1, ...o });

  // ── The cutaway diorama, modelled on the reference render: reservoir block · sloping dam · penstock ·
  //    powerhouse (generator over turbine) · tailrace block, all on one concrete plinth.
  add('bedrock', new THREE.Mesh(new THREE.BoxGeometry(16.6, 0.7, 7.6), mat(0x9aa6b8, { roughness: 0.85 })), V(0, -0.35, 0), V(0, -9, 0), 0.0, 0.6, 'out');

  const water = new THREE.Group();
  water.add(new THREE.Mesh(new THREE.BoxGeometry(5.2, 5.6, 7), glass(0x1f78e8, 0.5, { emissive: 0x0a3a9a, emissiveIntensity: 0.55 })));
  const top = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.06, 7), glass(0x7fd0ff, 0.75, { emissive: 0x3aa8ff, emissiveIntensity: 0.6 })); top.position.y = 2.8; water.add(top);
  add('reservoir', water, V(-5.4, 2.8, 0), V(-14, 0, 0), 0.2, 0.75, 'out', 0x66aaff);

  // dam: extruded gravity-dam profile (vertical upstream face, stepped/sloping downstream face)
  const prof = new THREE.Shape();
  [[0, 0], [6.2, 0], [6.2, 1.0], [4.4, 1.0], [4.4, 2.5], [1.7, 6.2], [0, 6.2]].forEach(([x, y], i) => (i ? prof.lineTo(x, y) : prof.moveTo(x, y)));
  const damGeo = new THREE.ExtrudeGeometry(prof, { depth: 7, bevelEnabled: false }); damGeo.translate(0, 0, -3.5);
  add('dam', new THREE.Mesh(damGeo, mat(0xb8c2d2, { roughness: 0.8 })), V(-2.8, 0, 0), V(0, 12, 0), 0.45, 0.75, 'in');

  // intake: trash-rack grid on the upstream face
  const intake = new THREE.Group();
  intake.add(new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.5, 2.4), mat(0x6c7a94)));
  for (let i = 0; i < 8; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.3, 0.04), mat(0xd6e0f2, { metalness: 0.6 })); b.position.set(-0.21, 0, -1 + i * 0.29); b.userData.noEdge = true; intake.add(b); }
  add('intake', intake, V(-3.0, 4.9, 1.6), V(-7, 3, 0), 0.85, 0.5, 'out');

  // penstock: one smooth curve, built from three pipe segments that land in sequence
  const curve = new THREE.CatmullRomCurve3([V(-2.65, 5.1, 3.55), V(-2.05, 4.9, 3.55), V(-1.3, 3.7, 3.55), V(-0.5, 2.3, 3.55), V(0.6, 1.4, 3.55), V(1.7, 1.25, 3.4)]);
  for (let i = 0; i < 3; i++) {
    const pts = curve.getPoints(60).slice(i * 20, i * 20 + 21);
    const seg = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.3, 18, false), mat(0x2f7bff, { emissive: 0x0a2a8a, emissiveIntensity: 0.75, metalness: 0.4, roughness: 0.3 }));
    add(`pen${i}`, seg, V(0, 0, 0), V(-3 + i * 0.8, 4 - i * 0.5, 2.2), 1.0 + i * 0.28, 0.5, 'out', 0x66ccff);
  }

  // powerhouse: open glass room on the dam's foot ledge
  add('powerhouse', new THREE.Mesh(new THREE.BoxGeometry(2.9, 2.7, 4.2), glass(0xc9d8ee, 0.28)), V(1.75, 2.35, 1.6), V(0, 9, 0), 1.5, 0.55, 'in');

  // turbine: scroll casing + spinning runner + shaft
  const turb = new THREE.Group();
  const casing = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.2, 14, 32), mat(0x1d5cff, { emissive: 0x0a2a9a, emissiveIntensity: 0.6, metalness: 0.5 })); casing.rotation.x = Math.PI / 2; turb.add(casing);
  const runner = new THREE.Group(); runner.name = 'runner';
  for (let i = 0; i < 9; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.26, 0.05), mat(0xdfe8f8, { metalness: 0.8, roughness: 0.25 })); const a = (i / 9) * Math.PI * 2; b.position.set(Math.cos(a) * 0.3, 0, Math.sin(a) * 0.3); b.rotation.y = -a + 0.55; b.userData.noEdge = true; runner.add(b); }
  turb.add(runner);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.5, 12), mat(0xaab6cc, { metalness: 0.8 })); shaft.position.y = 0.75; shaft.userData.noEdge = true; turb.add(shaft);
  add('turbine', turb, V(2.1, 1.4, 2.6), V(0, 8, 0), 1.85, 0.5, 'in', 0xffffff);

  // generator: copper stator drum with a glowing gold ring
  const gen = new THREE.Group();
  gen.add(new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.8, 32), mat(0xc4823a, { metalness: 0.55, roughness: 0.4 })));
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.87, 0.05, 10, 40), mat(0xffc233, { emissive: 0xffa800, emissiveIntensity: 0.9, metalness: 0.5 })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.24; ring.userData.noEdge = true; gen.add(ring);
  add('generator', gen, V(2.1, 2.9, 2.6), V(0, 8, 0), 2.15, 0.5, 'in', 0xffc233);

  // tailrace block
  const tail = new THREE.Group();
  tail.add(new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.95, 7), glass(0x2b9dff, 0.55, { emissive: 0x0a4a9a, emissiveIntensity: 0.55 })));
  const tt = new THREE.Mesh(new THREE.BoxGeometry(4.4, 0.05, 7), glass(0x9be0ff, 0.75, { emissive: 0x3aa8ff, emissiveIntensity: 0.5 })); tt.position.y = 0.47; tail.add(tt);
  add('tailrace', tail, V(5.7, 0.475, 0), V(14, 0, 0), 2.3, 0.65, 'out', 0x66ccff);

  const grid = new THREE.GridHelper(44, 44, 0x2ee6ff, 0x123255); grid.position.y = -0.85; grid.material.transparent = true; grid.material.opacity = 0.32; scene.add(grid);
  scene.add(new THREE.HemisphereLight(0x9cc0ff, 0x0a1020, 0.55));
  const sun = new THREE.DirectionalLight(0xffffff, 1.7); sun.position.set(7, 12, 9); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.05;
  Object.assign(sun.shadow.camera, { left: -13, right: 13, top: 13, bottom: -13, near: 1, far: 44 }); scene.add(sun);
  const cyan = new THREE.PointLight(0x2ee6ff, 26, 26); cyan.position.set(-5, 4, 7); scene.add(cyan);
  const amber = new THREE.PointLight(0xffc233, 0, 16); amber.position.set(2.1, 4, 5); scene.add(amber);

  // power-on bolt (generator → sky) and travelling water sparks along the penstock
  const boltPts = 9; const boltGeo = new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(boltPts * 3), 3));
  const bolt = new THREE.Line(boltGeo, new THREE.LineBasicMaterial({ color: 0xffe27a, transparent: true, opacity: 0 })); root.add(bolt);
  const sparks = Array.from({ length: 16 }, (_, i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), new THREE.MeshBasicMaterial({ color: 0x8fe9ff, transparent: true, opacity: 0 })); root.add(m); return { m, o: i / 16 }; });
  const runnerRef = turb.getObjectByName('runner');
  return { scene, blocks, edgeMats, runner: runnerRef, amber, bolt, boltPts, sparks, curve, root };
}

export default function Intro({ phase = 'intro', onBegin, onMorphDone }) {
  const mount = useRef(null);
  const morphRef = useRef({ on: false, t0: null, done: false });
  const doneRef = useRef(onMorphDone); doneRef.current = onMorphDone;
  const morphing = phase === 'morph';
  const [stage, setStage] = useState(0); // 0 building · 1 title · 2 subtitle · 3 button
  const [run, setRun] = useState(0);
  const [snd, setSnd] = useState(audio.on);
  useEffect(() => audio.subscribe(setSnd), []);

  // ── MORPH trigger: measure where the hero's turbine orb sits, then let the render loop take over
  useEffect(() => {
    if (!morphing) return;
    const slot = document.getElementById('hero-orb-slot');
    const r = slot ? slot.getBoundingClientRect() : { left: innerWidth * 0.62, top: innerHeight * 0.25, width: 320, height: 320 };
    let cx = r.left + r.width / 2, cy = r.top + r.height / 2, rad = Math.min(r.width, r.height) * 0.43;
    if (cy + rad > innerHeight || cy - rad < 0) { cx = innerWidth / 2; cy = innerHeight * 0.5; rad = Math.min(innerWidth, innerHeight) * 0.2; } // orb below the fold (phones): shrink to centre and fade
    morphRef.current = { on: true, t0: null, done: false, cx, cy, rad };
    audio.whoosh();
  }, [morphing]);

  useEffect(() => {
    const el = mount.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio));
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.8;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    el.appendChild(renderer.domElement);
    const S = makeScene();
    const cam = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    const look = new THREE.Vector3(0.0, 1.6, 0);
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(S.scene, cam));
    const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.5, 0.6, 0.82);
    composer.addPass(bloom); composer.addPass(new OutputPass());
    const camPos = new THREE.Vector3(0, 6, 22);
    const mouse = { x: 0, y: 0, sx: 0, sy: 0 };
    const onMove = (e) => { mouse.x = e.clientX / innerWidth - 0.5; mouse.y = e.clientY / innerHeight - 0.5; };
    window.addEventListener('pointermove', onMove);
    const resize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      renderer.setSize(w, h); composer.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix();
    };
    resize(); const ro = new ResizeObserver(resize); ro.observe(el);

    const clock = new THREE.Clock();
    let shake = 0, raf, powered = false, powerT = 0, orbit = 0, fov = 38, t = 0;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tmp = new THREE.Vector3();
    const dust = [];
    const SP = 480; const spPos = new Float32Array(SP * 3), spVel = new Float32Array(SP * 3), spLife = new Float32Array(SP); let spI = 0;
    const spGeo = new THREE.BufferGeometry(); spGeo.setAttribute('position', new THREE.BufferAttribute(spPos, 3));
    const sparksPts = new THREE.Points(spGeo, new THREE.PointsMaterial({ color: 0xbff4ff, size: 0.09, transparent: true, opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false }));
    sparksPts.frustumCulled = false; S.scene.add(sparksPts);
    for (let i = 0; i < SP; i++) spPos[i * 3 + 1] = -100;
    const burst = (pos, n = 26, spd = 3.2) => { for (let k = 0; k < n; k++) { const i = spI++ % SP, a = Math.random() * 6.283, r = Math.random() * spd; spPos.set([pos.x + (Math.random() - 0.5) * 1.2, Math.max(0.05, pos.y - 0.4), pos.z + (Math.random() - 0.5) * 1.2], i * 3); spVel.set([Math.cos(a) * r, 1.2 + Math.random() * spd, Math.sin(a) * r], i * 3); spLife[i] = 0.7 + Math.random() * 0.6; } };
    let bloomKick = 0;
    const nz = (k) => Math.sin(t * 37 * k + 1.1) * 0.5 + Math.sin(t * 61 * k + 2.3) * 0.3 + Math.sin(t * 97 * k + 4.1) * 0.2;
    const spawnRing = (pos, color) => {
      const m = new THREE.Mesh(new THREE.RingGeometry(0.2, 0.26, 40), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, side: THREE.DoubleSide }));
      m.rotation.x = -Math.PI / 2; m.position.copy(pos); m.position.y = Math.max(0.02, pos.y - 0.5 + 0.05); S.scene.add(m); dust.push({ m, t: 0 });
    };

    const frame = () => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, clock.getDelta()); t = clock.elapsedTime * (reduce ? 3 : 1); // real elapsed time keeps the < 4 s promise on slow GPUs

      // ── MORPH progress 0→1 over MORPH_DUR: the plant disassembles, the runner grows and the whole scene is
      //    clipped into the circle where the hero page's turbine orb lives.
      const M = morphRef.current; let mp = 0;
      if (M.on) { if (M.t0 == null) { M.t0 = t; S.blocks.forEach((b) => burst(b.target, 10, 4.5)); } mp = Math.min(1, (t - M.t0) / (MORPH_DUR * (window.__morphSlow || 1))); }
      const smooth = (x) => x * x * (3 - 2 * x), c01 = (x) => Math.min(1, Math.max(0, x));
      S.blocks.forEach((b, bi) => {
        const p = Math.min(1, Math.max(0, (t - b.t0) / b.dur));
        if (p > 0) b.g.visible = true;
        const e = b.mode === 'in' ? ease.in(p) : ease.out(p);
        b.g.position.copy(b.target).addScaledVector(b.from, 1 - e);
        b.g.rotation.z = b.mode === 'out' ? (1 - e) * 0.12 : 0;
        if (!b.landed && b.mode === 'in') { const st = p * p * 0.07; b.g.scale.set(1 - st * 0.5, 1 + st, 1 - st * 0.5); } // speed stretch while falling
        if (p >= 1 && !b.landed) { // ── IMPACT: shake + flash + ring + squash
          b.landed = true; b.landT = t; shake = Math.min(0.55, shake + (b.name === 'dam' || b.name === 'powerhouse' || b.name === 'bedrock' ? 0.34 : 0.2));
          spawnRing(b.target, 0x9be9ff); burst(b.target, b.mode === 'in' ? 30 : 16); bloomKick = Math.min(1.1, bloomKick + 0.55); audio.thud(b.name === 'dam' || b.name === 'powerhouse' || b.name === 'bedrock' ? 1 : 0.6);
        }
        if (b.landed) {
          const k = t - b.landT;
          const sq = Math.exp(-k * 9) * Math.sin(k * 40) * 0.045; b.g.scale.set(1 + sq, 1 - sq, 1 + sq);
          if (b.mode === 'in') b.g.position.y += Math.exp(-k * 7) * Math.abs(Math.sin(k * 16)) * 0.1; // small rebound
          const flash = Math.max(0, 1 - k * 2.2);
          b.g.userData.edges?.forEach((em) => { em.color.setRGB(0.18 + flash * 0.82, 0.9, 1); em.opacity = 0.5 + flash * 0.5; });
        }
        if (mp > 0) {
          if (b.name === 'turbine') { // the runner is the one part that survives: it flies to the focus point and swells to orb size
            const e = smooth(c01(mp / 0.75)), h = el.clientHeight, fit = (M.rad * 1.05 * 7.6) / (h * 0.82);
            b.g.position.lerpVectors(b.target, tmp.copy(look).sub(S.root.position), e);
            b.g.scale.setScalar(1 + (fit - 1) * e);
            b.g.rotation.x = e * Math.PI / 2;                                   // tip the runner so its disc faces the camera, like the hero orb
            const sh = b.g.children[0].children[2]; if (sh) sh.scale.setScalar(Math.max(0.001, 1 - e * 1.3)); // shaft retracts
          } else { // everything else shrinks away in a staggered wave, drifting up and spinning
            const q = smooth(c01((mp - (bi % 7) * 0.04 - bi * 0.01) / 0.42)), sc = Math.max(0.0001, 1 - q);
            b.g.scale.multiplyScalar(sc); b.g.position.y += q * q * 4; b.g.rotation.y += q * 1.6;
            b.g.userData.edges?.forEach((em) => { em.color.setRGB(1, 1, 1); em.opacity = 0.6 + q * 0.4; });
          }
        }
      });
      for (let i = dust.length - 1; i >= 0; i--) { const d = dust[i]; d.t += dt; const s = 1 + d.t * 9; d.m.scale.set(s, s, s); d.m.material.opacity = Math.max(0, 0.9 - d.t * 2.2); if (d.t > 0.5) { S.scene.remove(d.m); dust.splice(i, 1); } }

      for (let i = 0; i < SP; i++) { if (spLife[i] <= 0) continue; spLife[i] -= dt; spVel[i * 3 + 1] -= 7 * dt; spPos[i * 3] += spVel[i * 3] * dt; spPos[i * 3 + 1] += spVel[i * 3 + 1] * dt; spPos[i * 3 + 2] += spVel[i * 3 + 2] * dt; if (spLife[i] <= 0 || spPos[i * 3 + 1] < 0) { spLife[i] = 0; spPos[i * 3 + 1] = -100; } }
      spGeo.attributes.position.needsUpdate = true;
      S.runner.rotation.y += dt * (powered ? 9 : 2.5) * (1 + mp * 2.5);
      if (t > BUILD_END && !powered) { powered = true; powerT = t; setStage(1); bloomKick = 1.4; audio.sting(); audio.ambience(); }
      if (powered) { // ── POWER-ON pulse
        const k = t - powerT, pulse = Math.max(0, 1 - k / 1.1);
        S.amber.intensity = 30 * pulse + 6; S.edgeMats.forEach((m) => { m.opacity = 0.45 + pulse * 0.5; });
        S.bolt.material.opacity = mp > 0 ? 0 : k < 0.55 ? Math.random() * 0.6 + 0.4 : Math.max(0, S.bolt.material.opacity - dt * 3);
        const pos = S.bolt.geometry.attributes.position, a = new THREE.Vector3(2.1, 3.4, 2.6), z = new THREE.Vector3(6.6, 8.6, 0.5);
        for (let i = 0; i < S.boltPts; i++) { const f = i / (S.boltPts - 1); tmp.lerpVectors(a, z, f); const j = i === 0 || i === S.boltPts - 1 ? 0 : 0.28; pos.setXYZ(i, tmp.x + (Math.random() - 0.5) * j, tmp.y + (Math.random() - 0.5) * j + Math.sin(f * Math.PI) * 0.9, tmp.z + (Math.random() - 0.5) * j); }
        pos.needsUpdate = true;
        S.sparks.forEach((s) => { const f = (s.o + k * 0.35) % 1; S.curve.getPointAt(f, s.m.position); s.m.position.z += 0.02 * Math.sin(f * 30); s.m.material.opacity = Math.min(1, k * 2) * 0.9 * (1 - mp); });
      }

      // camera: cinematic dolly-in during the build, damped follow, noise shake + roll on impacts, slow orbit + parallax after
      shake *= Math.exp(-dt * 5.5); bloomKick *= Math.exp(-dt * 3.2);
      mouse.sx += (mouse.x - mouse.sx) * 0.04; mouse.sy += (mouse.y - mouse.sy) * 0.04;
      orbit += dt * 0.06;
      const build = Math.min(1, t / BUILD_END), dist = (27 - ease.out(build) * 3.6) * Math.min(2.9, Math.max(1, 1.55 / cam.aspect)); // pull back on portrait screens
      const ang = 0.55 + Math.sin(orbit) * 0.12 - mouse.sx * 0.35 - (1 - ease.out(build)) * 0.35;
      tmp.set(Math.sin(ang) * dist, 5.6 + build * 0.6 - mouse.sy * 1.4, Math.cos(ang) * dist);
      camPos.lerp(tmp, 1 - Math.exp(-dt * 5));
      cam.position.copy(camPos);
      cam.position.x += nz(1) * shake; cam.position.y += nz(1.3) * shake; cam.position.z += nz(0.8) * shake * 0.6;
      if (mp > 0) { // camera swoops to face the runner head-on, then the frame is shifted + clipped into the orb slot
        const w = el.clientWidth, h = el.clientHeight, e2 = smooth(c01(mp / 0.7));
        camPos.lerp(tmp.set(look.x, look.y + 0.4, look.z + 11), 1 - Math.exp(-dt * (2 + e2 * 6)));
        cam.position.copy(camPos);
        const e3 = smooth(c01((mp - 0.22) / 0.78)), dx = (M.cx - w / 2) * e3, dy = (M.cy - h / 2) * e3;
        cam.setViewOffset(w, h, -dx, -dy, w, h);
        const R0 = Math.hypot(w, h) * 0.6, R = R0 + (M.rad - R0) * e3;
        el.style.clipPath = `circle(${R}px at ${w / 2 + dx}px ${h / 2 + dy}px)`;
        bloomKick = Math.max(bloomKick, Math.sin(Math.min(1, mp * 1.4) * Math.PI) * 0.9);
        S.scene.background.lerpColors(BG0, BG1, e3); S.scene.fog.color.copy(S.scene.background); // dark void → the orb's deep glass blue
        if (mp >= 1 && !M.done) { M.done = true; doneRef.current?.(); }
      }
      cam.lookAt(look);
      cam.rotateZ(nz(0.7) * shake * 0.035);
      bloom.strength = 0.5 + bloomKick * 0.9;
      composer.render();
    };
    frame();
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); window.removeEventListener('pointermove', onMove);
      S.scene.traverse((o) => { o.geometry?.dispose?.(); (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m?.dispose?.()); });
      composer.dispose?.(); renderer.dispose(); renderer.domElement.remove();
    };
  }, [run]);

  const replay = () => { setStage(0); setRun((r) => r + 1); };
  const begin = () => onBegin();

  return (
    <motion.div className="fixed inset-0 z-[100] overflow-hidden" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.7, ease: 'easeOut' }} style={{ pointerEvents: morphing ? 'none' : undefined }}>
      <div ref={mount} key={run} className="absolute inset-0" />
      <motion.div className="absolute inset-0" animate={{ opacity: morphing ? 0 : 1 }} transition={{ duration: 0.5 }}>
      <div className="pointer-events-none absolute inset-0 mix-blend-screen" style={{ background: 'radial-gradient(70% 60% at 50% 60%, rgba(30,90,200,.22), transparent 70%), radial-gradient(40% 30% at 50% 100%, rgba(255,194,51,.08), transparent 70%)' }} />
      {/* letterbox bars: close in for the build, open when the title lands */}
      {[0, 1].map((k) => (<motion.div key={k} className="pointer-events-none absolute inset-x-0 z-10 bg-black" style={{ [k ? 'bottom' : 'top']: 0 }} initial={{ height: '30vh' }} animate={{ height: stage >= 3 ? '0vh' : stage >= 1 ? '5vh' : '7vh' }} transition={{ duration: stage >= 3 ? 1.4 : 1.6, ease: [0.65, 0, 0.35, 1] }} />))
      }
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(90% 70% at 50% 50%, transparent 45%, rgba(3,7,15,.9) 100%)' }} />

      <div className="absolute bottom-5 left-5 z-20 flex gap-2 md:bottom-7 md:left-8">
        <button onClick={() => audio.enable(!audio.on)} aria-pressed={snd} className="liquid relative rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-200 transition hover:text-white">{snd ? '◉ Sound on' : '○ Sound off'}</button>
        {stage >= 3 && !morphing && <button onClick={replay} className="liquid relative rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-slate-200 transition hover:text-white">↻ Replay</button>}
      </div>
      <div className="pointer-events-none absolute inset-x-0 top-[9%] flex flex-col items-center px-6 text-center md:top-[11%]">
        <AnimatePresence>
          {stage >= 1 && (
            <motion.h1
              key="title"
              className="text-[clamp(38px,8.6vw,132px)] leading-[0.95] tracking-[-0.02em] text-white"
              style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontStyle: 'italic' }}
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 1, 0.1, 1, 0.25, 1, 0.55, 1, 0.85, 1],
                textShadow: ['0 0 0 #2ee6ff', '0 0 60px #2ee6ff', '0 0 4px #2ee6ff', '0 0 70px #ffc233', '0 0 6px #2ee6ff', '0 0 50px #2ee6ff', '0 0 10px #2ee6ff', '0 0 42px #ffc233', '0 0 18px #2ee6ff', '0 0 28px rgba(46,230,255,.75)'],
                scale: [1.12, 1, 1.03, 1, 1.02, 1, 1.01, 1, 1, 1],
              }}
              transition={{ duration: 1.25, times: [0, 0.1, 0.18, 0.3, 0.38, 0.5, 0.58, 0.7, 0.84, 1], ease: 'linear' }}
              onAnimationComplete={() => setStage((s) => Math.max(s, 2))}
            >
              Hydropower Plant
            </motion.h1>
          )}
        </AnimatePresence>
        {stage >= 2 && (
          <motion.p
            className="mt-4 max-w-[90vw] text-[clamp(16px,2.3vw,30px)] text-slate-200"
            style={{ fontFamily: '"Instrument Serif", serif', letterSpacing: '0.02em' }}
            initial={{ opacity: 0, y: 14, filter: 'blur(10px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            onAnimationComplete={() => setStage((s) => Math.max(s, 3))}
          >
            Introduction to Mechanical Engineering – Presentation
          </motion.p>
        )}
      </div>

      <div className="absolute inset-x-0 bottom-[9%] flex justify-center px-6">
        <AnimatePresence>
          {stage >= 3 && !morphing && (
            <motion.button
              onClick={begin}
              initial={{ opacity: 0, y: 24, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} transition={{ type: 'spring', stiffness: 220, damping: 20 }}
              whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.97 }}
              className="liquid group relative overflow-hidden rounded-full px-9 py-4 font-display text-[15px] font-semibold tracking-wide text-white"
            >
              <span className="shimmer pointer-events-none absolute inset-0 opacity-40" />
              <span className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-aqua/25 to-volt/25 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <span className="relative flex items-center gap-3">Begin Immersion
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-1"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </span>
              <span className="pointer-events-none absolute -inset-2 -z-20 animate-ping rounded-full bg-aqua/10" style={{ animationDuration: '2.6s' }} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      </motion.div>
    </motion.div>
  );
}
