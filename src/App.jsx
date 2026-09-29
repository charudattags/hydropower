import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Lenis from 'lenis';
import Intro from './components/Intro';
import Background from './components/Background';
import Nav from './components/Nav';
import PlantSection from './components/PlantSection';
import { Agenda, Divider, Hero, What } from './pages/Opening';
import { Components, Principle } from './pages/Mechanics';
import { Future, Stats, Tradeoffs, Types } from './pages/Comparison';

/**
 * Flow: <Intro/> (three.js assembly → title → "Begin Immersion") → story pages, one per slide of the deck,
 * scrolled with Lenis smoothing and driven by framer-motion scroll transforms. The final page is the live plant.
 */
export default function App() {
  const [phase, setPhase] = useState('intro'); // 'intro' | 'story'
  const lenis = useRef(null);

  useEffect(() => {
    document.body.classList.toggle('locked', phase === 'intro');
    if (phase !== 'story') return;
    window.scrollTo(0, 0);
    const l = new Lenis({ duration: 1.25, easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)), smoothWheel: true });
    lenis.current = l;
    let raf; const loop = (t) => { l.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); l.destroy(); };
  }, [phase]);

  const scrollTo = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) lenis.current?.scrollTo(el, { duration: 1.8, offset: id === 'plant' ? 0 : 0 });
  }, []);

  return (
    <>
      <Background />
      {phase === 'story' && (
        <motion.main initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}>
          <Nav scrollTo={scrollTo} />
          <Hero scrollTo={scrollTo} />
          <Agenda scrollTo={scrollTo} />
          <Divider />
          <What />
          <Components />
          <Principle />
          <Types />
          <Tradeoffs />
          <Stats />
          <Future />
          <PlantSection />
        </motion.main>
      )}
      <AnimatePresence>{phase === 'intro' && <Intro key="intro" onBegin={() => setPhase('story')} />}</AnimatePresence>
    </>
  );
}
