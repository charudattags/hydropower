import { motion } from 'framer-motion';
import { fmt } from '../utils/format';

/** Live operating-point readout (bottom-left of the plant view). Values come from utils/physics.js. */
export default function Hud({ phys: p }) {
  const rows = [
    ['Flow rate Q', fmt(p.Q, 1), 'm³/s'],
    ['Net head Hn', fmt(p.Hn, 1), 'm'],
    ['Inlet pressure', fmt(p.pInlet, 1), 'bar'],
    ['Runner speed', fmt(p.rpm, 1), 'rpm'],
    ['Shaft power', fmt(p.Pshaft, 1), 'MW'],
    ['Electrical output', fmt(p.Pel, 1), 'MW'],
  ];
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 24 }}
      className="glass pointer-events-none absolute inset-x-3 bottom-3 z-20 rounded-2xl p-3 md:right-auto md:w-[224px] md:p-3.5">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-aqua">Operating point</span>
        <span className="flex items-center gap-1.5 font-mono text-[10px] text-slate-400"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />{Math.round(p.phi * 100)}% gate</span>
      </div>
      <dl className="grid grid-cols-2 gap-x-5 gap-y-1.5 md:block md:space-y-1.5">
        {rows.map(([k, v, u]) => (
          <div key={k} className="flex items-baseline justify-between gap-2">
            <dt className="text-[11px] text-slate-400">{k}</dt>
            <dd className="font-mono text-[12px] tabular-nums text-white">{v} <span className="text-[10px] text-aqua">{u}</span></dd>
          </div>
        ))}
      </dl>
      <p className="mt-2.5 hidden border-t border-white/10 pt-2 text-[10px] leading-snug text-slate-500 md:block">Runner is grid-locked: 32 poles at 50 Hz → N = 120·f/poles.</p>
    </motion.div>
  );
}
