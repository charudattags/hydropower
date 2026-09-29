import { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { audio } from '../utils/audio';

const PAGES = [['hero', 'Title'], ['agenda', 'Agenda'], ['intro', 'Introduction'], ['what', 'What is hydropower'], ['components', 'Components'], ['principle', 'Working principle'], ['types', 'Types of plants'], ['tradeoffs', 'Trade-offs'], ['stats', 'Key statistics'], ['future', 'The future'], ['plant', 'Working prototype']];

/** Top progress bar + right-hand page rail (click to glide to a page). */
export default function Nav({ scrollTo }) {
  const { scrollYProgress } = useScroll();
  const bar = useSpring(scrollYProgress, { stiffness: 140, damping: 26 });
  const [cur, setCur] = useState('hero');
  const [snd, setSnd] = useState(audio.on);
  useEffect(() => audio.subscribe(setSnd), []);
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setCur(e.target.id)), { rootMargin: '-45% 0px -45% 0px' });
    PAGES.forEach(([id]) => { const el = document.getElementById(id); el && io.observe(el); });
    return () => io.disconnect();
  }, []);
  return (
    <>
      <motion.div className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-[#1257d6] via-aqua to-volt" style={{ scaleX: bar }} />
      <div className="fixed left-4 top-4 z-[60] flex items-center gap-2.5 md:left-8 md:top-6">
        <span className="grid h-8 w-8 place-items-center rounded-xl border border-aqua/40 bg-aqua/10 text-aqua backdrop-blur"><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6z" /></svg></span>
        
      </div>
      <button onClick={() => { audio.enable(!audio.on); audio.ambience(); }} aria-pressed={snd} aria-label="Toggle sound" className="liquid fixed right-4 top-4 z-[60] rounded-full px-3 py-[7px] font-mono text-[10px] uppercase tracking-[0.2em] text-slate-200 transition hover:text-white md:right-8 md:top-6">{snd ? '◉ Sound' : '○ Sound'}</button>
      <nav aria-label="Pages" className="fixed right-3 top-1/2 z-[60] hidden -translate-y-1/2 flex-col items-end gap-2.5 md:flex">
        {PAGES.map(([id, label], i) => {
          const on = cur === id;
          return (
            <button key={id} onClick={() => scrollTo(id)} aria-label={label} aria-current={on} className="group flex items-center gap-3">
              <span className="pointer-events-none rounded-md bg-ink-900/80 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-slate-200 opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">{String(i + 1).padStart(2, '0')} · {label}</span>
              <motion.span className="block rounded-full bg-white" animate={{ height: on ? 26 : 7, width: 4, opacity: on ? 1 : 0.35, backgroundColor: on ? '#2ee6ff' : '#ffffff' }} transition={{ type: 'spring', stiffness: 300, damping: 24 }} />
            </button>
          );
        })}
      </nav>
    </>
  );
}
