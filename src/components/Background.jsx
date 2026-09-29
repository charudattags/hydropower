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
  const cv = useRef(null);

  useEffect(() => {
    const c = cv.current, ctx = c.getContext('2d');
    let w, h, raf; const dpr = 1;
    const bubbles = Array.from({ length: 26 }, () => ({ x: Math.random(), y: Math.random(), r: 1 + Math.random() * 3.2, v: 0.02 + Math.random() * 0.05, p: Math.random() * 6 }));
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

  // Orbs are plain radial-gradients (no blur filter → cheap) animated with transforms only.
  const orb = (style, anim, dur) => (<motion.div className="absolute rounded-full" style={{ ...style, willChange: 'transform' }} animate={anim} transition={{ duration: dur, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }} />);
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink-950" aria-hidden>
      <motion.div className="absolute inset-0" style={{ y: y1 }}>
        {orb({ left: '-14%', top: '0%', width: '62vmax', height: '62vmax', background: 'radial-gradient(closest-side, rgba(18,87,214,.42), transparent)' }, { x: [0, 90, -30], y: [0, 60, 20] }, 18)}
        {orb({ right: '-18%', top: '38%', width: '52vmax', height: '52vmax', background: 'radial-gradient(closest-side, rgba(11,200,230,.24), transparent)' }, { x: [0, -80, 20], y: [0, -50, 30] }, 22)}
      </motion.div>
      <motion.div className="absolute inset-0" style={{ y: y2 }}>
        {orb({ left: '28%', top: '66%', width: '44vmax', height: '44vmax', background: 'radial-gradient(closest-side, rgba(255,176,32,.12), transparent)' }, { x: [0, 60, -40] }, 26)}
      </motion.div>
      <div className="absolute inset-0 opacity-[.5]" style={{ backgroundImage: 'linear-gradient(rgba(120,190,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(120,190,255,.05) 1px, transparent 1px)', backgroundSize: '64px 64px', maskImage: 'radial-gradient(80% 70% at 50% 40%, #000 30%, transparent 100%)', WebkitMaskImage: 'radial-gradient(80% 70% at 50% 40%, #000 30%, transparent 100%)' }} />
      <canvas ref={cv} data-bubbles className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-0 opacity-[.07] mix-blend-overlay" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />
    </div>
  );
}
