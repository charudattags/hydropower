import { useRef, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from 'framer-motion';
import Glass from '../components/Glass';
import { MaskWords } from '../components/Reveal';
import { MAIN_COMPONENTS, PRINCIPLE } from '../data/deck';

/**
 * Slide 5 — "6 Main Components". Scroll is hijacked (sticky viewport + tall section): vertical scroll
 * progress is mapped to the horizontal translation of a card track, so the page appears to slide sideways.
 */
export function Components() {
  const ref = useRef(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const x = useTransform(p, (v) => `calc(${-v} * (100% - 100vw))`);
  const bar = useTransform(p, [0, 1], [0.04, 1]);
  const [i, setI] = useState(0);
  useMotionValueEvent(p, 'change', (v) => setI(Math.min(5, Math.floor(v * 6.0))));
  return (
    <section ref={ref} id="components" data-page className="relative h-[480vh] w-full">
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div style={{ x }} className="flex h-full w-max items-center gap-6 pl-5 pr-[10vw] md:gap-8 md:pl-[8vw]">
          <div className="flex w-[82vw] shrink-0 flex-col justify-center md:w-[34vw]">
            <p className="font-mono text-[12px] uppercase tracking-[0.3em] text-aqua">Hydropower plant</p>
            <MaskWords text="6 Main Components" className="mt-4 font-display text-[clamp(44px,7vw,108px)] font-semibold leading-[0.95] tracking-tight text-white" />
            <p className="mt-6 max-w-sm text-slate-400">Keep scrolling — follow the water from the dam to the grid.</p>
          </div>
          {MAIN_COMPONENTS.map((c, k) => (
            <Glass key={c.n} tilt={5} className="group relative w-[78vw] shrink-0 overflow-hidden rounded-[28px] p-3 md:w-[27vw] md:min-w-[380px]">
              <div className="relative overflow-hidden rounded-[20px]">
                <img src={`/assets/photos/${c.photo}.jpg`} alt={c.title} className="aspect-[16/10] w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />
                <span className="absolute bottom-2 left-4 font-display text-[64px] font-semibold leading-none text-outline" style={{ WebkitTextStroke: '1.5px rgba(255,255,255,.7)' }}>{c.n}</span>
              </div>
              <div className="px-3 pb-4 pt-5">
                <h3 className="font-display text-[26px] font-semibold leading-tight text-white">{c.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-slate-300">{c.text}</p>
              </div>
              <motion.span className="pointer-events-none absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-aqua to-transparent" initial={{ opacity: 0 }} animate={{ opacity: i === k ? 1 : 0 }} />
            </Glass>
          ))}
        </motion.div>
        <div className="absolute inset-x-5 bottom-7 flex items-center gap-4 md:inset-x-[8vw]">
          <span className="font-mono text-[12px] tabular-nums text-white">{String(i + 1).padStart(2, '0')}<span className="text-slate-500"> / 06</span></span>
          <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/10"><motion.div className="h-full origin-left rounded-full bg-gradient-to-r from-[#1257d6] via-aqua to-volt" style={{ scaleX: bar }} /></div>
        </div>
      </div>
    </section>
  );
}

const STEP_COLORS = ['#3f86ff', '#2ee6ff', '#e9fbff', '#ffc233'];

/** Slide 6 — "How hydropower works." A pinned stage; scroll advances through the four steps. */
export function Principle() {
  const ref = useRef(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const [i, setI] = useState(0);
  useMotionValueEvent(p, 'change', (v) => setI(Math.min(3, Math.floor(v * 4))));
  const fill = useTransform(p, [0, 1], [0.05, 1]);
  const s = PRINCIPLE[i];
  return (
    <section ref={ref} id="principle" data-page className="relative h-[420vh] w-full">
      <div className="sticky top-0 flex h-screen items-center overflow-hidden px-5 md:px-[8vw]">
        <div className="mx-auto grid w-full max-w-[1300px] items-center gap-8 lg:grid-cols-[1fr_1.15fr]">
          <div className="relative">
            <p className="font-mono text-[12px] uppercase tracking-[0.3em] text-aqua">Working principle</p>
            <MaskWords text="How hydropower works." className="mt-3 font-display text-[clamp(34px,5vw,72px)] font-semibold leading-none tracking-tight text-white" />
            <div className="mt-8 flex gap-6">
              <div className="relative hidden w-[3px] shrink-0 overflow-hidden rounded-full bg-white/10 sm:block">
                <motion.div className="absolute inset-0 origin-top rounded-full" style={{ scaleY: fill, background: 'linear-gradient(180deg,#3f86ff,#2ee6ff,#ffc233)' }} />
              </div>
              <div className="min-h-[250px] flex-1">
                <AnimatePresence mode="wait">
                  <motion.div key={s.n} initial={{ opacity: 0, y: 40, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -30, filter: 'blur(8px)' }} transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}>
                    <div className="font-display text-[clamp(90px,13vw,190px)] font-semibold leading-[0.85]" style={{ backgroundImage: `linear-gradient(180deg, ${STEP_COLORS[i]}, transparent 95%)`, WebkitBackgroundClip: 'text', color: 'transparent' }}>{s.n}</div>
                    <h3 className="mt-2 font-display text-[clamp(26px,3vw,42px)] font-semibold text-white">{s.title}</h3>
                    <p className="mt-3 max-w-lg text-[16px] leading-relaxed text-slate-300 md:text-[18px]">{s.text}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            <div className="mt-6 flex gap-2" aria-hidden>{PRINCIPLE.map((x, k) => (<span key={x.n} className="h-1.5 rounded-full transition-all duration-500" style={{ width: k === i ? 44 : 14, background: k <= i ? STEP_COLORS[k] : 'rgba(255,255,255,.15)' }} />))}</div>
          </div>

          <Glass tilt={4} className="relative aspect-[16/10] w-full overflow-hidden rounded-[32px] p-2.5">
            <div className="relative h-full w-full overflow-hidden rounded-[24px]">
              <AnimatePresence mode="popLayout">
                <motion.img key={s.photo} src={`/assets/photos/${s.photo}.jpg`} alt={s.title} className="absolute inset-0 h-full w-full object-cover"
                  initial={{ opacity: 0, scale: 1.25, clipPath: 'inset(0 0 100% 0)' }} animate={{ opacity: 1, scale: 1, clipPath: 'inset(0 0 0% 0)' }} exit={{ opacity: 0, scale: 0.94 }} transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }} />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent to-transparent" />
              <AnimatePresence mode="wait">
                <motion.span key={s.tag} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="liquid absolute bottom-4 left-4 flex items-center gap-2 rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white">
                  <span className="h-2 w-2 rounded-full" style={{ background: STEP_COLORS[i], boxShadow: `0 0 12px ${STEP_COLORS[i]}` }} />{s.tag}
                </motion.span>
              </AnimatePresence>
            </div>
          </Glass>
        </div>
      </div>
    </section>
  );
}
