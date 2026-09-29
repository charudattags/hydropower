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
  const [phase, setPhase] = useState('intro'); // 'intro' → 'morph' (plant morphs into the hero) → 'story'
  const lenis = useRef(null);

  useEffect(() => {
    document.body.classList.toggle('locked', phase !== 'story');
    if (phase !== 'story') return;
    window.scrollTo(0, 0);
    const l = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
    lenis.current = l;
    let raf; const loop = (t) => { l.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); l.destroy(); };
  }, [phase]);

  // Adaptive quality: if the first seconds of the story run under ~45 fps, drop the expensive glass blur / bubbles.
  useEffect(() => {
    if (phase !== 'story') return;
    let raf, n = 0, last = performance.now(), sum = 0;
    const loop = (now) => { sum += now - last; last = now; if (++n < 120) raf = requestAnimationFrame(loop); else if (sum / n > 22) document.documentElement.classList.add('lite'); };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  const scrollTo = useCallback((id) => {
    const el = document.getElementById(id);
    if (el) lenis.current?.scrollTo(el, { duration: 1.8, offset: id === 'plant' ? 0 : 0 });
  }, []);

  return (
    <>
      <Background />
      {phase !== 'intro' && (
        <motion.main initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
          <Nav scrollTo={scrollTo} />
          <Hero scrollTo={scrollTo} orbReady={phase === 'story'} />
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
      <AnimatePresence>{phase !== 'story' && <Intro key="intro" phase={phase} onBegin={() => setPhase('morph')} onMorphDone={() => setPhase('story')} />}</AnimatePresence>
    </>
  );
}
