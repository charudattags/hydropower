import { useEffect, useRef, useState } from 'react';
import { SCENES, SCENE_SIZE } from '../scenes/draw';

/**
 * Canvas host for the per-component "focused" animation. Renders at device resolution, advances a
 * speed-scaled clock, and eases in a hover boost so the scene visibly revs up under the cursor.
 */
export default function SceneCanvas({ id, speedRef }) {
  const ref = useRef(null);
  const boost = useRef({ target: 0, v: 0 });
  const [hot, setHot] = useState(false);

  useEffect(() => {
    const cv = ref.current, ctx = cv.getContext('2d');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let raf, T = 0, last = performance.now();
    const fit = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = cv.clientWidth * dpr; cv.height = cv.clientHeight * dpr;
    };
    fit();
    const ro = new ResizeObserver(fit); ro.observe(cv);
    const loop = (now) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const b = boost.current; b.v += (b.target - b.v) * Math.min(1, dt * 6);
      T += dt * (speedRef.current || 1) * (1 + b.v * 0.9) * (reduce ? 0.2 : 1);
      const s = cv.width / SCENE_SIZE.w;
      ctx.setTransform(s, 0, 0, s, 0, 0);
      ctx.clearRect(0, 0, SCENE_SIZE.w, SCENE_SIZE.h);
      SCENES[id](ctx, T);
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [id, speedRef]);

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/10 shadow-[inset_0_0_40px_rgba(46,230,255,.06)]"
      style={{ aspectRatio: `${SCENE_SIZE.w} / ${SCENE_SIZE.h}` }}
      onPointerEnter={() => { boost.current.target = 1; setHot(true); }}
      onPointerLeave={() => { boost.current.target = 0; setHot(false); }}
    >
      <canvas ref={ref} className="h-full w-full" />
      <span className="pointer-events-none absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-aqua backdrop-blur">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-aqua" /> Live simulation
      </span>
      <span className={`pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/40 px-2.5 py-1 font-mono text-[10px] text-volt-hot backdrop-blur transition-opacity duration-300 ${hot ? 'opacity-100' : 'opacity-0'}`}>rev up ▲</span>
    </div>
  );
}
