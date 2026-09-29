import { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * Fixed living backdrop behind every page: drifting colour orbs (parallaxed by scroll so the
 * liquid-glass panels always have something to refract), a faint blueprint grid, film grain and a
 * canvas of slow rising bubbles.
 */
export default function Background() {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], ['0%', '-30%']);
  const y2 = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const hue = useTransform(scrollYProgress, [0, 0.5, 1], [0, -18, 12]);
  const filter = useTransform(hue, (h) => `hue-rotate(${h}deg)`);
  const cv = useRef(null);

  useEffect(() => {
    const c = cv.current, ctx = c.getContext('2d');
    let w, h, raf; const dpr = Math.min(2, devicePixelRatio || 1);
    const bubbles = Array.from({ length: 46 }, () => ({ x: Math.random(), y: Math.random(), r: 1 + Math.random() * 3.2, v: 0.02 + Math.random() * 0.05, p: Math.random() * 6 }));
    const size = () => { w = c.clientWidth; h = c.clientHeight; c.width = w * dpr; c.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); window.addEventListener('resize', size);
    let last = performance.now();
    const loop = (t) => {
      raf = requestAnimationFrame(loop); const dt = Math.min(0.05, (t - last) / 1000); last = t;
      ctx.clearRect(0, 0, w, h);
      bubbles.forEach((b) => {
        b.y -= b.v * dt; if (b.y < -0.05) { b.y = 1.05; b.x = Math.random(); }
        const x = (b.x + Math.sin(t / 1800 + b.p) * 0.012) * w, y = b.y * h;
        ctx.strokeStyle = 'rgba(160,225,255,.28)'; ctx.fillStyle = 'rgba(160,225,255,.05)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(x, y, b.r * 2, 0, 6.283); ctx.fill(); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.arc(x - b.r * 0.6, y - b.r * 0.6, b.r * 0.4, 0, 6.283); ctx.fill();
      });
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', size); };
  }, []);

  const orb = (cls, anim, dur) => (<motion.div className={`absolute rounded-full blur-[90px] ${cls}`} animate={anim} transition={{ duration: dur, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }} />);
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink-950" aria-hidden>
      <motion.div className="absolute inset-0" style={{ filter }}>
        <motion.div className="absolute inset-0" style={{ y: y1 }}>
          {orb('left-[-10%] top-[5%] h-[55vmax] w-[55vmax] bg-[#1257d6]/40', { x: [0, 90, -30], y: [0, 60, 20], scale: [1, 1.15, 0.95] }, 16)}
          {orb('right-[-15%] top-[40%] h-[45vmax] w-[45vmax] bg-[#0bc8e6]/25', { x: [0, -80, 20], y: [0, -50, 30] }, 19)}
        </motion.div>
        <motion.div className="absolute inset-0" style={{ y: y2 }}>
          {orb('left-[30%] top-[70%] h-[38vmax] w-[38vmax] bg-[#ffb020]/[.11]', { x: [0, 60, -40], scale: [1, 1.2, 1] }, 22)}
        </motion.div>
      </motion.div>
      <div className="absolute inset-0 opacity-[.5]" style={{ backgroundImage: 'linear-gradient(rgba(120,190,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(120,190,255,.05) 1px, transparent 1px)', backgroundSize: '64px 64px', maskImage: 'radial-gradient(80% 70% at 50% 40%, #000 30%, transparent 100%)', WebkitMaskImage: 'radial-gradient(80% 70% at 50% 40%, #000 30%, transparent 100%)' }} />
      <canvas ref={cv} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 opacity-[.07] mix-blend-overlay" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
    </div>
  );
}
