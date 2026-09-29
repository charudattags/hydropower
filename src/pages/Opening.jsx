import { useRef } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { useState } from 'react';
import Glass from '../components/Glass';
import { MaskWords, Page, ScrubWords } from '../components/Reveal';
import { AGENDA } from '../data/deck';

/** Spinning runner used as the hero emblem. */
function TurbineOrb() {
  return (
    <div className="relative mx-auto aspect-square w-[min(78vw,460px)]">
      {[0, 1, 2].map((i) => (
        <motion.span key={i} className="absolute inset-0 rounded-full border border-aqua/30" animate={{ scale: [0.7, 1.25], opacity: [0.6, 0] }} transition={{ duration: 4, delay: i * 1.3, repeat: Infinity, ease: 'easeOut' }} />
      ))}
      <Glass tilt={10} className="absolute inset-[7%] grid place-items-center overflow-hidden rounded-full">
        <svg viewBox="-100 -100 200 200" className="h-[88%] w-[88%]">
          <defs>
            <linearGradient id="bl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f2f8ff" /><stop offset="1" stopColor="#4d7bd8" /></linearGradient>
            <radialGradient id="hub"><stop offset="0" stopColor="#fff3c0" /><stop offset="1" stopColor="#c99a1c" /></radialGradient>
          </defs>
          <circle r="92" fill="none" stroke="rgba(255,255,255,.18)" strokeWidth="6" />
          <motion.g animate={{ rotate: 360 }} transition={{ duration: 7, repeat: Infinity, ease: 'linear' }}>
            {Array.from({ length: 9 }).map((_, i) => (
              <path key={i} transform={`rotate(${i * 40})`} d="M12 0 C28 -10 55 -6 74 20 C55 8 30 10 12 12 Z" fill="url(#bl)" stroke="rgba(255,255,255,.6)" strokeWidth=".6" />
            ))}
          </motion.g>
          <motion.g animate={{ rotate: -360 }} transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}>
            {Array.from({ length: 24 }).map((_, i) => (<circle key={i} r="1.6" cx="86" cy="0" transform={`rotate(${i * 15})`} fill={i % 2 ? '#2ee6ff' : '#ffc233'} />))}
          </motion.g>
          <circle r="14" fill="url(#hub)" />
        </svg>
      </Glass>
      <motion.div className="liquid absolute -left-2 top-[16%] rounded-2xl px-3.5 py-2 text-[12px]" animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity }}>
        <span className="font-mono text-[10px] uppercase tracking-widest text-aqua">Head</span><div className="font-display text-lg font-semibold text-white">160 m</div>
      </motion.div>
      <motion.div className="liquid absolute -right-2 bottom-[14%] rounded-2xl px-3.5 py-2 text-[12px]" animate={{ y: [0, 10, 0] }} transition={{ duration: 6, repeat: Infinity }}>
        <span className="font-mono text-[10px] uppercase tracking-widest text-volt">Output</span><div className="font-display text-lg font-semibold text-white">123 MW</div>
      </motion.div>
    </div>
  );
}

export function Hero({ scrollTo }) {
  const ref = useRef(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const tx = useTransform(p, [0, 1], [0, -160]);
  const blur = useTransform(p, [0, 0.8], [0, 14]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);
  const orbY = useTransform(p, [0, 1], [0, 140]);
  const orbR = useTransform(p, [0, 1], [0, 25]);
  return (
    <section ref={ref} id="hero" data-page className="relative flex min-h-screen w-full items-center overflow-hidden px-5 md:px-[8vw]">
      <div className="mx-auto grid w-full max-w-[1300px] items-center gap-10 pt-20 lg:grid-cols-[1.25fr_1fr]">
        <motion.div style={{ x: tx, filter }}>
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="font-mono text-[12px] uppercase tracking-[0.3em] text-aqua">Renewable Energy · 2026</motion.p>
          <h1 className="mt-5 text-[clamp(52px,9.6vw,150px)] leading-[0.9] tracking-[-0.03em] text-white" style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 900, fontStyle: 'italic' }} aria-label="Hydro Power Plant">
            {['Hydro', 'Power', 'Plant'].map((w, i) => (
              <span key={w} className="block overflow-hidden pb-[0.06em]">
                <motion.span className="block" initial={{ y: '110%', rotate: 5 }} animate={{ y: 0, rotate: 0 }} transition={{ duration: 1.1, delay: 0.25 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
                  style={i === 2 ? { backgroundImage: 'linear-gradient(90deg,#2ee6ff,#ffffff 55%,#ffc233)', WebkitBackgroundClip: 'text', color: 'transparent' } : undefined}>{w}</motion.span>
              </span>
            ))}
          </h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.9 }} className="mt-7 max-w-[34rem] font-serif text-[clamp(22px,2.6vw,34px)] leading-snug text-slate-200">
            Harnessing the energy of flowing water to generate clean, renewable electricity.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }} className="mt-8 flex flex-wrap items-center gap-3">
            <span className="liquid relative inline-flex items-center gap-2 rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-white"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-volt" />Team of 5 · Group Project</span>
            <button onClick={() => scrollTo('agenda')} className="group inline-flex items-center gap-2 rounded-full px-3 py-2 text-[13px] text-slate-300 transition hover:text-white">Scroll to begin <span className="inline-block" style={{ animation: 'bob 1.6s ease-in-out infinite' }}>↓</span></button>
          </motion.div>
        </motion.div>
        <motion.div style={{ y: orbY, rotate: orbR }} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}><TurbineOrb /></motion.div>
      </div>
    </section>
  );
}

export function Agenda({ scrollTo }) {
  return (
    <Page id="agenda" className="px-5 py-24 md:px-[8vw]">
      <div className="mx-auto grid w-full max-w-[1200px] gap-12 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="lg:sticky lg:top-32 lg:self-start">
          <p className="font-mono text-[12px] uppercase tracking-[0.3em] text-aqua">Agenda</p>
          <MaskWords text="What we'll cover." className="mt-4 font-display text-[clamp(40px,6vw,84px)] font-semibold leading-[0.98] tracking-tight text-white" />
          <p className="mt-6 max-w-sm text-slate-400">Seven stops, about twenty minutes. Click any row to jump straight there.</p>
        </div>
        <ol className="space-y-3">
          {AGENDA.map(([n, t, m, id], i) => (
            <motion.li key={n} initial={{ opacity: 0, x: 80, rotateY: -25 }} whileInView={{ opacity: 1, x: 0, rotateY: 0 }} viewport={{ once: true, margin: '-8% 0px' }} transition={{ duration: 0.8, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }} style={{ transformPerspective: 900 }}>
              <Glass as="button" tilt={3} onClick={() => scrollTo(id)} whileHover={{ x: 10 }} className="group flex w-full items-center gap-5 rounded-2xl px-5 py-4 text-left md:px-7 md:py-5">
                <span className="font-display text-[34px] font-semibold leading-none text-outline transition-all duration-300 group-hover:text-aqua md:text-[44px]" style={{ WebkitTextStroke: undefined }}>{n}</span>
                <span className="flex-1 font-display text-[18px] font-medium text-white md:text-[22px]">{t}</span>
                <span className="rounded-full bg-white/[0.07] px-3 py-1 font-mono text-[11px] text-slate-300">{m}</span>
                <span className="text-aqua opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">→</span>
              </Glass>
            </motion.li>
          ))}
        </ol>
      </div>
    </Page>
  );
}

/** Section divider: the cutaway zooms toward you as you scroll past. */
export function Divider() {
  const ref = useRef(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const scale = useTransform(p, [0, 1], [1.05, 1.5]);
  const imgY = useTransform(p, [0, 1], ['-6%', '8%']);
  const numX = useTransform(p, [0, 1], ['12%', '-22%']);
  const clip = useTransform(p, [0, 0.35], ['inset(14% 8% 14% 8% round 48px)', 'inset(0% 0% 0% 0% round 0px)']);
  return (
    <section ref={ref} id="intro" data-page className="relative h-[150vh] w-full">
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div className="absolute inset-0" style={{ clipPath: clip }}>
          <motion.img src="/assets/plant-clean.jpg" alt="" className="h-full w-full object-cover" style={{ scale, y: imgY }} />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/40 to-ink-950/70" />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(70% 60% at 30% 60%, rgba(18,87,214,.35), transparent 70%)' }} />
        </motion.div>
        <motion.span aria-hidden className="text-outline pointer-events-none absolute bottom-[4%] font-display font-semibold leading-none" style={{ x: numX, fontSize: 'clamp(160px,34vw,520px)', WebkitTextStroke: '2px rgba(255,255,255,.5)' }}>01</motion.span>
        <div className="absolute inset-x-0 bottom-[14%] px-5 md:px-[8vw]">
          <p className="font-mono text-[12px] uppercase tracking-[0.3em] text-aqua">Chapter 01</p>
          <MaskWords text="Introduction to Hydropower" className="mt-3 max-w-4xl font-display text-[clamp(38px,7vw,104px)] font-semibold leading-[0.98] tracking-tight text-white" />
        </div>
      </div>
    </section>
  );
}

function Counter({ to, suffix = '', className = '' }) {
  const [v, setV] = useState(0);
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 90%', 'start 50%'] });
  useMotionValueEvent(scrollYProgress, 'change', (x) => setV(Math.round(to * x)));
  return <span ref={ref} className={className}>{v}{suffix}</span>;
}

export function What() {
  const ref = useRef(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const orb = useTransform(p, [0, 1], [0.7, 1.15]);
  const rot = useTransform(p, [0, 1], [0, 200]);
  return (
    <section ref={ref} id="what" data-page className="relative h-[260vh] w-full">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden px-5 md:px-[8vw]">
        <div className="mx-auto grid w-full max-w-[1300px] items-center gap-10 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="font-mono text-[12px] uppercase tracking-[0.3em] text-aqua">What is hydropower?</p>
            <ScrubWords text="Hydropower captures the kinetic energy of moving water and converts it into electricity." progress={p} start={0.02} end={0.5} className="mt-6 font-display text-[clamp(28px,4.4vw,64px)] font-semibold leading-[1.08] tracking-tight text-white" />
            <ScrubWords text="It is one of the oldest and largest sources of renewable energy, supplying about 16% of the world's electricity and over 60% of all renewable power generation." progress={p} start={0.5} end={0.92} className="mt-8 max-w-2xl font-serif text-[clamp(20px,2.2vw,30px)] leading-snug text-slate-300" />
          </div>
          <motion.div style={{ scale: orb, rotate: rot }} className="relative mx-auto aspect-square w-[min(70vw,420px)]">
            <div className="absolute inset-0 rounded-full" style={{ background: 'conic-gradient(from 0deg, #1257d6, #2ee6ff, #ffc233, #1257d6)', filter: 'blur(38px)', opacity: 0.55 }} />
            <Glass tilt={0} glow={false} className="absolute inset-[6%] overflow-hidden rounded-full">
              <motion.div className="absolute inset-x-[-30%] bottom-0 h-[70%] rounded-[45%] bg-gradient-to-b from-aqua/40 to-[#1257d6]/60" animate={{ rotate: 360, y: [0, -8, 0] }} transition={{ rotate: { duration: 9, repeat: Infinity, ease: 'linear' }, y: { duration: 4, repeat: Infinity } }} />
              <motion.div className="absolute inset-x-[-30%] bottom-[-8%] h-[64%] rounded-[42%] bg-gradient-to-b from-[#1257d6]/50 to-[#0a2a80]/80" animate={{ rotate: -360 }} transition={{ duration: 13, repeat: Infinity, ease: 'linear' }} />
            </Glass>
          </motion.div>
        </div>
        <div className="pointer-events-none absolute bottom-[8%] right-[6%] hidden gap-4 md:flex">
          {[[16, 'of world electricity'], [60, 'of all renewables']].map(([n, l]) => (
            <Glass key={l} tilt={0} className="rounded-2xl px-5 py-3"><div className="font-display text-4xl font-semibold text-white"><Counter to={n} suffix="%" /></div><div className="font-mono text-[10px] uppercase tracking-widest text-slate-400">{l}</div></Glass>
          ))}
        </div>
      </div>
    </section>
  );
}
