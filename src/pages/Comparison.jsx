import { useRef, useState } from 'react';
import { animate, motion, useInView, useScroll, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import Glass from '../components/Glass';
import { MaskWords, Page } from '../components/Reveal';
import { STATS, TIMELINE, TRADEOFFS, TYPES } from '../data/deck';

const Check = ({ ok }) => ok
  ? <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-400/15 text-emerald-300"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5 9-10" /></svg></span>
  : <span className="grid h-6 w-6 place-items-center rounded-full bg-white/[0.06] text-slate-500"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18" /></svg></span>;

const TYPE_ICONS = [
  <svg key="a" viewBox="0 0 64 40" className="h-10 w-16"><path d="M0 40 22 6l10 16 8-10 24 28Z" fill="rgba(46,230,255,.18)" stroke="#2ee6ff" strokeWidth="1.5" /></svg>,
  <svg key="b" viewBox="0 0 64 40" className="h-10 w-16"><path d="M0 22c8-8 16 8 24 0s16 8 24 0 12 4 16 0M0 32c8-8 16 8 24 0s16 8 24 0 12 4 16 0" fill="none" stroke="#2ee6ff" strokeWidth="2" strokeLinecap="round" /></svg>,
  <svg key="c" viewBox="0 0 64 40" className="h-10 w-16"><path d="M12 30V10m0 0-5 6m5-6 5 6M52 10v20m0 0-5-6m5 6 5-6" fill="none" stroke="#ffc233" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /><rect x="22" y="14" width="20" height="12" rx="3" fill="rgba(255,194,51,.15)" stroke="#ffc233" /></svg>,
];

export function Types() {
  const [hr, setHr] = useState(null);
  return (
    <Page id="types" className="px-5 py-24 md:px-[8vw]">
      <div className="mx-auto w-full max-w-[1200px]">
        <p className="font-mono text-[12px] uppercase tracking-[0.3em] text-aqua">Types of plants</p>
        <MaskWords text="Three main types of hydro plants." className="mt-3 max-w-3xl font-display text-[clamp(32px,5vw,70px)] font-semibold leading-[1] tracking-tight text-white" />
        <div className="mt-12 grid gap-5 md:grid-cols-3" style={{ perspective: 1400 }}>
          {TYPES.cols.map((c, ci) => (
            <motion.div key={c} initial={{ opacity: 0, y: 90, rotateX: 28 }} whileInView={{ opacity: 1, y: 0, rotateX: 0 }} viewport={{ once: true, margin: '-10% 0px' }} transition={{ duration: 0.9, delay: ci * 0.14, ease: [0.22, 1, 0.36, 1] }}>
              <Glass tilt={7} className="h-full rounded-[28px] p-6">
                <div className="flex items-center justify-between">{TYPE_ICONS[ci]}<span className="font-mono text-[11px] text-slate-500">0{ci + 1}</span></div>
                <h3 className="mt-4 font-display text-[28px] font-semibold text-white">{c}</h3>
                <ul className="mt-5 divide-y divide-white/[0.07]">
                  {TYPES.rows.map(([label, vals], ri) => {
                    const v = vals[ci], yn = v === 'Yes' || v === 'No';
                    return (
                      <li key={label} onMouseEnter={() => setHr(ri)} onMouseLeave={() => setHr(null)} className={`flex items-center justify-between gap-3 py-3 transition-colors ${hr === ri ? 'bg-white/[0.04]' : ''}`}>
                        <span className="text-[13px] text-slate-400">{label}</span>
                        {yn ? <Check ok={v === 'Yes'} /> : <span className="font-display text-[15px] font-medium text-white">{v}</span>}
                      </li>
                    );
                  })}
                </ul>
              </Glass>
            </motion.div>
          ))}
        </div>
      </div>
    </Page>
  );
}

export function Tradeoffs() {
  const Panel = ({ data, side }) => {
    const pro = side === 'pros';
    return (
      <motion.div initial={{ opacity: 0, x: pro ? -120 : 120, rotateY: pro ? 22 : -22 }} whileInView={{ opacity: 1, x: 0, rotateY: 0 }} viewport={{ once: true, margin: '-10% 0px' }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }} style={{ transformPerspective: 1200 }}>
        <Glass tilt={4} className="h-full rounded-[32px] p-7 md:p-9">
          <span className="absolute -top-16 h-40 w-40 rounded-full blur-3xl" style={{ [pro ? 'left' : 'right']: -30, background: pro ? 'rgba(46,230,255,.28)' : 'rgba(255,150,60,.25)' }} />
          <p className="relative font-mono text-[11px] uppercase tracking-[0.28em]" style={{ color: pro ? '#2ee6ff' : '#ffb454' }}>{data.kicker}</p>
          <h3 className="relative mt-2 font-display text-[clamp(28px,3.2vw,44px)] font-semibold text-white">{data.title}</h3>
          <ul className="relative mt-6 space-y-3.5">
            {data.items.map((t, i) => (
              <motion.li key={t} initial={{ opacity: 0, x: pro ? -24 : 24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.09 }} className="flex gap-3 text-[16px] leading-snug text-slate-200">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full text-[13px] font-bold" style={{ background: pro ? 'rgba(46,230,255,.15)' : 'rgba(255,150,60,.16)', color: pro ? '#2ee6ff' : '#ffb454' }}>{pro ? '+' : '–'}</span>{t}
              </motion.li>
            ))}
          </ul>
        </Glass>
      </motion.div>
    );
  };
  return (
    <Page id="tradeoffs" className="px-5 py-24 md:px-[8vw]">
      <div className="mx-auto w-full max-w-[1250px]">
        <p className="font-mono text-[12px] uppercase tracking-[0.3em] text-aqua">Trade-offs</p>
        <MaskWords text="The benefits and the costs." className="mt-3 font-display text-[clamp(32px,5vw,70px)] font-semibold leading-none tracking-tight text-white" />
        <div className="relative mt-12 grid gap-6 md:grid-cols-2">
          <Panel data={TRADEOFFS.pros} side="pros" /><Panel data={TRADEOFFS.cons} side="cons" />
          <motion.div className="liquid absolute left-1/2 top-1/2 z-10 hidden h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full font-display text-lg font-semibold text-white md:grid" initial={{ scale: 0 }} whileInView={{ scale: 1, rotate: 360 }} viewport={{ once: true }} transition={{ delay: 0.6, type: 'spring', stiffness: 160, damping: 14 }}>vs</motion.div>
        </div>
      </div>
    </Page>
  );
}

function Ring({ frac, delay }) {
  const ref = useRef(null); const on = useInView(ref, { once: true, margin: '-20% 0px' });
  return (
    <svg ref={ref} viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
      <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="4" />
      <motion.circle cx="50" cy="50" r="44" fill="none" stroke="url(#rg)" strokeWidth="4" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: on ? frac : 0 }} transition={{ duration: 1.8, delay, ease: [0.22, 1, 0.36, 1] }} />
      <defs><linearGradient id="rg" x1="0" x2="1"><stop offset="0" stopColor="#1257d6" /><stop offset=".6" stopColor="#2ee6ff" /><stop offset="1" stopColor="#ffc233" /></linearGradient></defs>
    </svg>
  );
}
function Count({ to, pre = '', suf = '' }) {
  const ref = useRef(null); const on = useInView(ref, { once: true, margin: '-20% 0px' });
  const [v, setV] = useState(0);
  useEffect(() => { if (!on) return; const c = animate(0, to, { duration: 1.8, ease: [0.22, 1, 0.36, 1], onUpdate: (x) => setV(Math.round(x)) }); return () => c.stop(); }, [on, to]);
  return <span ref={ref}>{pre}{v}{suf}</span>;
}

export function Stats() {
  return (
    <Page id="stats" className="px-5 py-24 md:px-[8vw]">
      <div className="mx-auto w-full max-w-[1250px]">
        <p className="font-mono text-[12px] uppercase tracking-[0.3em] text-aqua">Key statistics</p>
        <MaskWords text="Hydropower by the numbers." className="mt-3 font-display text-[clamp(32px,5vw,70px)] font-semibold leading-none tracking-tight text-white" />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, scale: 0.7, y: 60 }} whileInView={{ opacity: 1, scale: 1, y: 0 }} viewport={{ once: true, margin: '-10% 0px' }} transition={{ type: 'spring', stiffness: 120, damping: 15, delay: i * 0.1 }}>
              <Glass tilt={9} className="rounded-[30px] p-6 text-center">
                <div className="relative mx-auto grid aspect-square w-[70%] place-items-center">
                  <Ring frac={s.ring} delay={i * 0.12} />
                  <div className="font-display text-[clamp(38px,4.4vw,60px)] font-semibold leading-none text-white"><Count to={s.v} pre={s.pre} suf={s.suf} /></div>
                </div>
                <div className="mt-5 font-display text-[18px] font-semibold text-white">{s.label}</div>
                <div className="mt-1 text-[13px] text-slate-400">{s.sub}</div>
              </Glass>
            </motion.div>
          ))}
        </div>
      </div>
    </Page>
  );
}

/** Slide 10 — the timeline line "draws" itself as you scroll; cards spring in from alternating sides. */
export function Future() {
  const ref = useRef(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start 70%', 'end 60%'] });
  const line = useTransform(p, [0, 1], [0, 1]);
  return (
    <section ref={ref} id="future" data-page className="relative w-full px-5 py-32 md:px-[8vw]">
      <div className="mx-auto max-w-[1100px]">
        <p className="font-mono text-[12px] uppercase tracking-[0.3em] text-aqua">The future</p>
        <MaskWords text="The evolution of hydropower." className="mt-3 max-w-3xl font-display text-[clamp(32px,5vw,70px)] font-semibold leading-none tracking-tight text-white" />
        <div className="relative mt-16">
          <div className="absolute bottom-0 left-[18px] top-0 w-[3px] rounded-full bg-white/10 md:left-1/2 md:-translate-x-1/2" />
          <motion.div className="absolute bottom-0 left-[18px] top-0 w-[3px] origin-top rounded-full md:left-1/2 md:-translate-x-1/2" style={{ scaleY: line, background: 'linear-gradient(180deg,#1257d6,#2ee6ff 55%,#ffc233)', boxShadow: '0 0 18px rgba(46,230,255,.6)' }} />
          <ol className="space-y-12 md:space-y-20">
            {TIMELINE.map(([y, t, d], i) => {
              const right = i % 2 === 1;
              return (
                <li key={y} className="relative pl-14 md:grid md:grid-cols-2 md:gap-24 md:pl-0">
                  <motion.span className="absolute left-[9px] top-6 z-10 h-5 w-5 rounded-full border-2 border-aqua bg-ink-950 md:left-1/2 md:-translate-x-1/2" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true, margin: '-20% 0px' }} transition={{ type: 'spring', stiffness: 300, damping: 14 }}>
                    <span className="absolute inset-0 animate-ping rounded-full bg-aqua/40" />
                  </motion.span>
                  <motion.div className={right ? 'md:col-start-2' : 'md:col-start-1 md:text-right'} initial={{ opacity: 0, x: right ? 100 : -100, rotateY: right ? -20 : 20 }} whileInView={{ opacity: 1, x: 0, rotateY: 0 }} viewport={{ once: true, margin: '-15% 0px' }} transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }} style={{ transformPerspective: 1000 }}>
                    <Glass tilt={5} className="rounded-3xl p-6">
                      <div className="font-display text-[clamp(40px,5vw,68px)] font-semibold leading-none" style={{ backgroundImage: 'linear-gradient(90deg,#2ee6ff,#ffffff,#ffc233)', WebkitBackgroundClip: 'text', color: 'transparent' }}>{y}</div>
                      <h3 className="mt-3 font-display text-[22px] font-semibold text-white">{t}</h3>
                      <p className="mt-2 text-[15px] leading-relaxed text-slate-300">{d}</p>
                    </Glass>
                  </motion.div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
