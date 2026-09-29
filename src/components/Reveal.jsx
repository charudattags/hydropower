import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/** Headline whose lines/words rise out of a mask when scrolled into view. */
export function MaskWords({ text, className = '', delay = 0, as: Tag = 'h2', style }) {
  const T = motion[Tag];
  return (
    <T className={className} style={style} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-12% 0px' }} aria-label={text}>
      {text.split(' ').map((w, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-bottom" aria-hidden>
          <motion.span className="inline-block" variants={{ hidden: { y: '115%', rotate: 6 }, show: { y: 0, rotate: 0 } }} transition={{ duration: 0.9, delay: delay + i * 0.07, ease: [0.22, 1, 0.36, 1] }}>
            {w}&nbsp;
          </motion.span>
        </span>
      ))}
    </T>
  );
}

/** Scroll-scrubbed text: each word fades/sharpens as `progress` sweeps across [start, end]. */
export function ScrubWords({ text, progress, start = 0, end = 1, className = '' }) {
  const words = text.split(' ');
  return (
    <p className={className}>
      {words.map((w, i) => {
        const a = start + ((end - start) * i) / words.length, b = start + ((end - start) * (i + 1)) / words.length;
        return <ScrubWord key={i} progress={progress} range={[a, b]}>{w}</ScrubWord>;
      })}
    </p>
  );
}
function ScrubWord({ children, progress, range }) {
  const o = useTransform(progress, range, [0.12, 1]);
  const blur = useTransform(progress, range, [6, 0]);
  const y = useTransform(progress, range, [10, 0]);
  const filter = useTransform(blur, (v) => `blur(${v}px)`);
  return <motion.span style={{ opacity: o, filter, y, display: 'inline-block', marginRight: '0.28em' }}>{children}</motion.span>;
}

/**
 * Page shell: content flies in with a 3D tilt from below as the page enters, sits flat while it owns
 * the viewport, then tilts back and recedes as the next page arrives — this is the "forward" feel.
 */
export function Page({ id, children, className = '', flat = false }) {
  const ref = useRef(null);
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const scale = useTransform(p, [0, 0.28, 0.72, 1], [0.86, 1, 1, 0.9]);
  const y = useTransform(p, [0, 0.28, 0.72, 1], [160, 0, 0, -120]);
  const rotateX = useTransform(p, [0, 0.28, 0.72, 1], [16, 0, 0, -8]);
  const opacity = useTransform(p, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  return (
    <section ref={ref} id={id} data-page className={`relative min-h-screen w-full ${className}`} style={{ perspective: 1400 }}>
      <motion.div className="flex min-h-screen w-full items-center" style={flat ? undefined : { scale, y, rotateX, opacity, transformOrigin: '50% 100%' }}>
        {children}
      </motion.div>
    </section>
  );
}
