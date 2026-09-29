import { useEffect, useRef } from 'react';
import { animate, motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { COMPONENTS, PASSIVE_LABELS } from '../data/components';
import { useElementSize } from '../hooks/useElementSize';
import { cameraFor, fitStage, overviewCamera } from '../utils/camera';
import Hotspot, { PassiveLabel } from './Hotspot';
import FlowCanvas from './FlowCanvas';

// Energy-conversion legend pinned to the artwork while the overlay is on (blue → gold).
const TAGS = [
  { t: 'Potential', x: 0.27, y: 0.21, c: '#3f86ff' },
  { t: 'Kinetic', x: 0.385, y: 0.43, c: '#2ee6ff' },
  { t: 'Mechanical', x: 0.665, y: 0.63, c: '#e9fbff' },
  { t: 'Electrical', x: 0.72, y: 0.3, c: '#ffc233' },
];

const EASE = [0.65, 0.02, 0.18, 1]; // slow-in / slow-out "camera crane" curve

export default function Stage({ mode, activeId, hoverId, setHover, onSelect, overlay, speedRef, wide, phys, visible = true, labels = true }) {
  const [wrap, size] = useElementSize();
  const camX = useMotionValue(0), camY = useMotionValue(0), camS = useMotionValue(1);
  const cam = useRef({ x: camX, y: camY, scale: camS }).current;
  const fit = size.cw ? fitStage(size.cw, size.ch) : { W: 0, H: 0 };
  const placed = useRef(false);
  const flights = useRef([]);

  /**
   * ── STATE → CAMERA ───────────────────────────────────────────────────────
   * Whenever the mode / active component / viewport changes we compute the target camera and tween
   * x, y and scale together with one shared easing curve, which reads as a single fluid fly-to.
   * The first placement is instant (no fly-in from 0,0).
   * When the detail panel is docked on the right (wide screens) the subject is anchored at 30% of
   * the width; on phones the panel is a bottom sheet so it is anchored in the upper third.
   */
  useEffect(() => {
    if (!size.cw) return;
    const comp = COMPONENTS.find((c) => c.id === activeId);
    const anchor = wide ? { x: 0.3, y: 0.5 } : { x: 0.5, y: 0.22 };
    const zoomK = wide ? 1 : 0.78;
    const target = mode === 'focused' && comp ? cameraFor(size, comp.camera, comp.camera.zoom * zoomK, anchor, !wide) : overviewCamera(size);
    flights.current.forEach((f) => f.stop());
    if (!placed.current) {
      camX.set(target.x); camY.set(target.y); camS.set(target.scale);
      placed.current = true;
      return;
    }
    const opt = { duration: mode === 'focused' ? 1.25 : 1.05, ease: EASE };
    flights.current = [animate(camX, target.x, opt), animate(camY, target.y, opt), animate(camS, target.scale, opt)];
  }, [mode, activeId, size.cw, size.ch, wide]); // eslint-disable-line react-hooks/exhaustive-deps

  // Pointer parallax: the whole illustration tilts in 3D toward the cursor (damped by a spring).
  const px = useMotionValue(0), py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 90, damping: 18 }), sy = useSpring(py, { stiffness: 90, damping: 18 });
  const tiltGain = mode === 'full' ? 1 : 0.35;
  const rotY = useTransform(sx, (v) => v * 5 * tiltGain);
  const rotX = useTransform(sy, (v) => -v * 3.5 * tiltGain);
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };

  const inv = useTransform(camS, (s) => 1 / s);
  const focused = mode === 'focused';

  return (
    <div ref={wrap} className="absolute inset-0 overflow-hidden bg-ink-900" style={{ perspective: 1500 }} onPointerMove={onMove} onPointerLeave={() => { px.set(0); py.set(0); }}>
      <motion.div className="absolute inset-0" style={{ rotateX: rotX, rotateY: rotY, scale: 1.03, transformStyle: 'preserve-3d' }}>
        {size.cw > 0 && (
          <motion.div className="absolute left-0 top-0" style={{ width: fit.W, height: fit.H, x: camX, y: camY, scale: camS, originX: 0, originY: 0, transformStyle: 'preserve-3d' }}>
            <motion.img
              src="/assets/plant-clean.jpg"
              alt="Cutaway illustration of a hydropower plant: reservoir, intake, penstock, turbine, generator and tailrace"
              draggable={false}
              className="h-full w-full select-none object-cover"
              initial={false}
              animate={{ filter: overlay ? 'brightness(.5) saturate(1.2) contrast(1.05)' : focused ? 'brightness(.82) saturate(1.05)' : 'brightness(1) saturate(1)' }}
              transition={{ duration: 0.7 }}
            />
            {COMPONENTS.map((c) => (
              <Hotspot key={c.id} c={c} phys={phys} showLabel={labels} camScale={camS} mode={mode} active={c.id === activeId} hovered={hoverId === c.id} onHover={setHover} onSelect={onSelect} />
            ))}
            {PASSIVE_LABELS.map((l) => <PassiveLabel key={l.t} l={l} camScale={camS} show={!focused && labels} />)}
            {TAGS.map((g, i) => (
              <motion.div key={g.t} className="pointer-events-none absolute" style={{ left: `${g.x * 100}%`, top: `${g.y * 100}%`, scale: inv, x: '-50%', y: '-50%' }}
                initial={false} animate={{ opacity: overlay && !focused ? 1 : 0, y: overlay && !focused ? '-50%' : '-30%' }} transition={{ delay: overlay ? 0.15 * i : 0, duration: 0.5 }}>
                <span className="glass flex items-center gap-2 rounded-full py-1 pl-2 pr-3 font-mono text-[10px] uppercase tracking-[0.14em] text-white">
                  <span className="h-2 w-2 rounded-full" style={{ background: g.c, boxShadow: `0 0 10px ${g.c}` }} />{g.t}
                </span>
              </motion.div>
            ))}
          </motion.div>
        )}
        {size.cw > 0 && <FlowCanvas visible={visible} active={overlay} dimmed={false} cam={cam} box={fit} speedRef={speedRef} />}
      </motion.div>

      {/* Static vignette + edge fade so the bright daylight art sits comfortably in the dark UI */}
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(120% 90% at 50% 45%, transparent 55%, rgba(3,7,15,.75) 100%), linear-gradient(180deg, rgba(3,7,15,.55), transparent 22%, transparent 78%, rgba(3,7,15,.6))' }} />
    </div>
  );
}
