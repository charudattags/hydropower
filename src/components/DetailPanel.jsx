import { motion } from 'framer-motion';
import { COMPONENTS } from '../data/components';
import SceneCanvas from './SceneCanvas';
import AnimatedNumber from './AnimatedNumber';

const stagger = { show: { transition: { staggerChildren: 0.06, delayChildren: 0.35 } } };
const rise = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 26 } } };

/**
 * FOCUSED state UI. Slides in from the right (bottom on phones) while the camera is still
 * flying, then its sections stagger in. Keyed by component id so switching components re-plays it.
 */
export default function DetailPanel({ c, phys, wide, onBack, onStep, speedRef }) {
  const idx = COMPONENTS.findIndex((x) => x.id === c.id);
  return (
    <motion.aside
      key="panel"
      initial={wide ? { x: 60, opacity: 0 } : { y: 80, opacity: 0 }}
      animate={{ x: 0, y: 0, opacity: 1 }}
      exit={wide ? { x: 60, opacity: 0 } : { y: 80, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 170, damping: 24, delay: 0.25 }}
      className={`glass absolute z-40 flex flex-col overflow-hidden shadow-2xl ${wide ? 'bottom-3 right-3 top-3 w-[430px] rounded-3xl' : 'inset-x-2 bottom-2 h-[54%] rounded-3xl'}`}
      aria-label={`${c.title} details`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
        <button onClick={onBack} className="group inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 py-1.5 pl-2.5 pr-4 text-[13px] font-medium text-white transition hover:border-aqua/60 hover:bg-aqua/10">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:-translate-x-0.5"><path d="M15 18l-6-6 6-6" /></svg>
          Back to Main View
        </button>
        <div className="flex items-center gap-1">
          {[[-1, 'Previous component', 'M15 18l-6-6 6-6'], [1, 'Next component', 'M9 18l6-6-6-6']].map(([d, l, p]) => (
            <button key={d} aria-label={l} onClick={() => onStep(d)} className="grid h-8 w-8 place-items-center rounded-full border border-white/10 text-slate-300 transition hover:border-aqua/60 hover:text-aqua">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={p} /></svg>
            </button>
          ))}
        </div>
      </div>

      <motion.div key={c.id} variants={stagger} initial="hidden" animate="show" className="no-scrollbar flex-1 space-y-5 overflow-y-auto px-5 pb-6 pt-5">
        <motion.header variants={rise}>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-aqua">{c.n} / 06 · {c.tagline}</p>
          <h2 className="mt-1.5 font-display text-[34px] font-semibold leading-none tracking-tight text-white">{c.title}</h2>
          <p className="mt-3 text-[14px] leading-relaxed text-slate-300">{c.summary}</p>
        </motion.header>

        <motion.div variants={rise}><SceneCanvas id={c.id} speedRef={speedRef} /></motion.div>

        <motion.div variants={rise} className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-volt/10 px-3 py-1.5 text-[12px] font-medium text-volt-hot">{c.energy}</span>
          <span className="rounded-full border border-white/10 px-3 py-1.5 font-mono text-[12px] text-slate-200">{c.formula}</span>
        </motion.div>

        <motion.section variants={rise} aria-label="Technical specifications">
          <h3 className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-400">Technical data</h3>
          <dl className="grid grid-cols-2 gap-2">
            {c.specs.map((s) => (
              <div key={s.label} className="group rounded-xl border border-white/[0.07] bg-white/[0.03] p-3 transition hover:border-aqua/40 hover:bg-aqua/[0.06]">
                <dt className="text-[11px] text-slate-400">{s.label}</dt>
                <dd className="mt-1 font-display text-[20px] font-semibold leading-none text-white">
                  <AnimatedNumber value={s.value} decimals={s.decimals} />
                  {s.unit && <span className="ml-1 font-sans text-[12px] font-normal text-aqua">{s.unit}</span>}
                </dd>
              </div>
            ))}
          </dl>
        </motion.section>

        <motion.section variants={rise} aria-label="Worked calculation">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-400">Worked calculation</h3>
            <span className="rounded-full bg-aqua/10 px-2.5 py-1 font-mono text-[10px] text-aqua">live · {Math.round(phys.phi * 100)}% flow</span>
          </div>
          <div className="divide-y divide-white/[0.06] overflow-hidden rounded-xl border border-white/[0.07] bg-black/20">
            {c.calc(phys).map(([name, eq, val]) => (
              <div key={name} className="px-3.5 py-2.5">
                <div className="flex items-baseline justify-between gap-3"><span className="text-[12px] text-slate-300">{name}</span><span className="font-mono text-[10.5px] text-slate-500">{eq}</span></div>
                <div className="mt-1 font-mono text-[12.5px] tabular-nums text-volt-hot">{val}</div>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.figure variants={rise} className="overflow-hidden rounded-2xl border border-white/10">
          <img src={`/assets/photos/${c.photo}.jpg`} alt={`${c.title} reference`} className="h-40 w-full object-cover transition duration-700 hover:scale-105" loading="lazy" />
          <figcaption className="flex items-center justify-between bg-black/30 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-slate-400"><span>Reference · {c.title}</span><span>{c.n}</span></figcaption>
        </motion.figure>

        <motion.ul variants={rise} className="space-y-2">
          {c.facts.map((f) => (
            <li key={f} className="flex gap-3 text-[13px] leading-relaxed text-slate-300"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-volt" />{f}</li>
          ))}
        </motion.ul>
      </motion.div>
      <span className="pointer-events-none absolute -bottom-px left-1/2 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-aqua/60 to-transparent" aria-hidden />
      <span className="sr-only">Component {idx + 1} of {COMPONENTS.length}</span>
    </motion.aside>
  );
}
