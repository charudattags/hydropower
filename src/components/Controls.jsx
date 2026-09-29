import { motion } from 'framer-motion';
import { COMPONENTS } from '../data/components';

const Bolt = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6z" /></svg>);

/** Bottom dock: component chips · Energy Path toggle · Flow Speed · Reset View. */
export default function Controls({ activeId, hoverId, setHover, onSelect, overlay, setOverlay, slider, setSlider, speed, onReset }) {
  return (
    <div className="glass absolute inset-x-2 bottom-2 z-50 mx-auto flex max-w-[1180px] flex-col gap-2 rounded-3xl p-2 shadow-2xl md:inset-x-6 md:bottom-4 md:flex-row md:items-center md:gap-3 md:p-2.5">
      <nav aria-label="Components" className="no-scrollbar flex gap-1.5 overflow-x-auto md:shrink-0">
        {COMPONENTS.map((c) => {
          const on = activeId === c.id, hot = hoverId === c.id;
          return (
            <button key={c.id} onClick={() => onSelect(c.id)} onMouseEnter={() => setHover(c.id)} onMouseLeave={() => setHover(null)} aria-current={on}
              className={`relative shrink-0 rounded-full px-3 py-2 text-[12px] font-medium transition-colors ${on ? 'text-ink-950' : hot ? 'text-white' : 'text-slate-300'}`}>
              {on && <motion.span layoutId="chip" className="absolute inset-0 rounded-full bg-aqua" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
              {!on && hot && <span className="absolute inset-0 rounded-full bg-white/10" />}
              <span className="relative flex items-center gap-1.5"><span className="font-mono text-[10px] opacity-70">{c.n}</span>{c.title}</span>
            </button>
          );
        })}
      </nav>

      <span className="hidden h-8 w-px bg-white/10 md:block" />

      <div className="flex items-center gap-3 md:flex-1">
        <button role="switch" aria-checked={overlay} onClick={() => setOverlay(!overlay)}
          className={`relative flex shrink-0 items-center gap-2 overflow-hidden rounded-full border py-2 pl-3 pr-4 text-[12px] font-medium transition ${overlay ? 'border-volt/70 text-ink-950' : 'border-white/15 text-white hover:border-volt/50'}`}>
          {overlay && <motion.span layoutId="ov" className="absolute inset-0 bg-gradient-to-r from-aqua via-white to-volt" initial={{ opacity: 0 }} animate={{ opacity: 1 }} />}
          <span className="relative flex items-center gap-2"><Bolt /><span className="hidden sm:inline">Energy Path Overlay</span><span className="sm:hidden">Energy</span></span>
        </button>

        <label className="flex min-w-0 flex-1 items-center gap-3">
          <span className="hidden whitespace-nowrap text-[11px] text-slate-400 xl:block">Flow speed</span>
          <input type="range" min="0" max="100" value={slider} onChange={(e) => setSlider(+e.target.value)} aria-label="Flow speed control" className="flow-range min-w-[80px]" style={{ '--p': `${slider}%` }} />
          <span className="w-11 shrink-0 text-right font-mono text-[12px] text-aqua tabular-nums">{speed.toFixed(1)}×</span>
        </label>

        <button onClick={onReset} className="flex shrink-0 items-center gap-2 rounded-full border border-white/15 px-3.5 py-2 text-[12px] font-medium text-white transition hover:border-aqua/60 hover:bg-aqua/10">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></svg>
          <span className="hidden sm:inline">Reset View</span>
        </button>
      </div>
    </div>
  );
}
