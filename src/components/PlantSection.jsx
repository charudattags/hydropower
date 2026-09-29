import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { COMPONENTS } from '../data/components';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { speedFromSlider } from '../utils/format';
import { plant } from '../utils/physics';
import Stage from './Stage';
import DetailPanel from './DetailPanel';
import Controls from './Controls';
import Hud from './Hud';

/**
 * The interactive plant — replaces the deck's "Working Prototype" slide.
 * State machine
 *   mode 'full'    → overview, hotspots hoverable/clickable (the plant is always animated)
 *   mode 'focused' → camera flown to `activeId`, DetailPanel visible
 * Transitions: select(id) full→focused (or focused→focused: camera glides between components)
 *              back() / Esc  focused→full        reset() → full + overlay off + speed 1×
 *
 * Operating point: slider speed k (1× at midpoint) also sets the gate opening φ = clamp(k, 0.3, 1.2)
 * so pressures, power and currents in the labels / HUD / panel are recomputed live.
 */
export default function PlantSection() {
  const root = useRef(null);
  const inView = useInView(root, { margin: '0px 0px -10% 0px' });
  const [mode, setMode] = useState('full');
  const [activeId, setActiveId] = useState(null);
  const [hoverId, setHover] = useState(null);
  const [overlay, setOverlay] = useState(false);
  const [slider, setSlider] = useState(50);
  const wide = useMediaQuery('(min-width: 1024px)');
  const md = useMediaQuery('(min-width: 768px)');

  const speed = useMemo(() => speedFromSlider(slider), [slider]);
  const speedRef = useRef(speed);
  speedRef.current = speed;
  const phys = useMemo(() => plant(Math.min(1.2, Math.max(0.3, speed))), [speed]);

  const select = useCallback((id) => { setActiveId(id); setMode('focused'); setHover(null); }, []);
  const back = useCallback(() => setMode('full'), []);
  const reset = useCallback(() => { setMode('full'); setOverlay(false); setSlider(50); setHover(null); }, []);
  const step = useCallback((d) => {
    const i = COMPONENTS.findIndex((c) => c.id === activeId);
    setActiveId(COMPONENTS[(i + d + COMPONENTS.length) % COMPONENTS.length].id);
  }, [activeId]);

  useEffect(() => {
    if (mode !== 'focused' || !inView) return;
    const on = (e) => { if (e.key === 'Escape') back(); if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [mode, inView, back, step]);

  const active = COMPONENTS.find((c) => c.id === activeId);

  return (
    <section ref={root} id="plant" className="relative h-screen min-h-[640px] w-full overflow-hidden">
      <div className="absolute inset-x-0 top-0 z-30 flex h-[84px] items-end justify-between pl-16 pr-4 pb-3 md:pl-[76px] md:pr-8">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-aqua">Live demo · Working prototype</p>
          <h2 className="font-display text-[16px] font-semibold tracking-tight text-white md:text-[26px]">Click any part to see how it works</h2>
        </div>
        <AnimatePresence mode="wait">
          <motion.p key={mode} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="hidden pb-1 font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400 sm:block">
            {mode === 'full' ? 'Hover a zone · click to inspect' : 'Esc to go back · ← → to browse'}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="absolute inset-x-2 bottom-[118px] top-[88px] overflow-hidden rounded-[28px] border border-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,.8),0_0_0_1px_rgba(46,230,255,.05)] md:inset-x-6 md:bottom-[92px]">
        <Stage mode={mode} activeId={activeId} hoverId={hoverId} setHover={setHover} onSelect={select} overlay={overlay} speedRef={speedRef} wide={wide} phys={phys} visible={inView} labels={md} />
        <AnimatePresence>{mode === 'focused' && active && <DetailPanel c={active} phys={phys} wide={wide} onBack={back} onStep={step} speedRef={speedRef} />}</AnimatePresence>
        <AnimatePresence>{mode === 'full' && <Hud phys={phys} />}</AnimatePresence>
      </div>

      <Controls activeId={mode === 'focused' ? activeId : null} hoverId={hoverId} setHover={setHover} onSelect={select} overlay={overlay} setOverlay={setOverlay} slider={slider} setSlider={setSlider} speed={speed} onReset={reset} />
    </section>
  );
}
