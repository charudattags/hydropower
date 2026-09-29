import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { COMPONENTS } from './data/components';
import { useMediaQuery } from './hooks/useMediaQuery';
import { speedFromSlider } from './utils/format';
import Stage from './components/Stage';
import DetailPanel from './components/DetailPanel';
import Controls from './components/Controls';

/**
 * State machine
 *   mode 'full'    → overview, hotspots hoverable/clickable
 *   mode 'focused' → camera flown to `activeId`, DetailPanel visible
 * Transitions: select(id) full→focused (or focused→focused, camera glides between components)
 *              back() / Esc  focused→full
 *              reset()       → full + overlay off + speed back to 1×
 */
export default function App() {
  const [mode, setMode] = useState('full');
  const [activeId, setActiveId] = useState(null);
  const [hoverId, setHover] = useState(null);
  const [overlay, setOverlay] = useState(false);
  const [slider, setSlider] = useState(50);
  const wide = useMediaQuery('(min-width: 1024px)');

  const speed = useMemo(() => speedFromSlider(slider), [slider]);
  const speedRef = useRef(speed); // read by canvas loops every frame – no re-render needed
  speedRef.current = speed;

  const select = useCallback((id) => { setActiveId(id); setMode('focused'); setHover(null); }, []);
  const back = useCallback(() => { setMode('full'); }, []);
  const reset = useCallback(() => { setMode('full'); setOverlay(false); setSlider(50); setHover(null); }, []);
  const step = useCallback((d) => {
    const i = COMPONENTS.findIndex((c) => c.id === activeId);
    setActiveId(COMPONENTS[(i + d + COMPONENTS.length) % COMPONENTS.length].id);
  }, [activeId]);

  useEffect(() => {
    const on = (e) => {
      if (mode !== 'focused') return;
      if (e.key === 'Escape') back();
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [mode, back, step]);

  const active = COMPONENTS.find((c) => c.id === activeId);

  return (
    <div className="relative h-full w-full overflow-hidden bg-ink-950 font-sans">
      <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(60% 50% at 20% 0%, rgba(46,230,255,.10), transparent 70%), radial-gradient(50% 40% at 90% 100%, rgba(255,194,51,.07), transparent 70%)' }} />

      <header className="absolute inset-x-0 top-0 z-50 flex h-[64px] items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl border border-aqua/40 bg-aqua/10 text-aqua"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6z" /></svg></span>
          <div className="leading-tight">
            <h1 className="font-display text-[15px] font-semibold tracking-tight text-white md:text-[17px]">Hydropower Plant</h1>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-400">Interactive cutaway</p>
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.p key={mode} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} className="hidden font-mono text-[11px] uppercase tracking-[0.18em] text-slate-400 sm:block">
            {mode === 'full' ? 'Hover a zone · click to inspect' : 'Esc to go back · ← → to browse'}
          </motion.p>
        </AnimatePresence>
      </header>

      <main className="absolute inset-x-2 bottom-[118px] top-[64px] overflow-hidden rounded-[28px] border border-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,.8),0_0_0_1px_rgba(46,230,255,.05)] md:inset-x-6 md:bottom-[92px]">
        <Stage mode={mode} activeId={activeId} hoverId={hoverId} setHover={setHover} onSelect={select} overlay={overlay} speedRef={speedRef} wide={wide} />
        <AnimatePresence>{mode === 'focused' && active && <DetailPanel c={active} wide={wide} onBack={back} onStep={step} speedRef={speedRef} />}</AnimatePresence>

        <AnimatePresence>
          {mode === 'full' && !overlay && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ delay: 0.6 }} className="pointer-events-none absolute inset-x-5 bottom-5 md:right-auto md:max-w-[280px]">
              <p className="font-display text-[22px] font-semibold leading-tight md:text-[26px] tracking-tight text-white drop-shadow-[0_2px_12px_rgba(0,0,0,.6)]">From falling water<br />to the grid.</p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-slate-200/90 drop-shadow-[0_1px_8px_rgba(0,0,0,.7)]">Six stages turn stored potential energy into electricity. Switch on the energy path to watch it move.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Controls activeId={mode === 'focused' ? activeId : null} hoverId={hoverId} setHover={setHover} onSelect={select} overlay={overlay} setOverlay={setOverlay} slider={slider} setSlider={setSlider} speed={speed} onReset={reset} />
    </div>
  );
}
