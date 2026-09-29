import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * Liquid-glass surface. Pointer position drives (a) a specular highlight (CSS vars --mx/--my used by
 * `.liquid::before`), (b) the rotation of the rim light (--ang), and (c) an optional 3D tilt.
 */
export default function Glass({ as = 'div', className = '', children, tilt = 6, style, glow = true, flat = false, ...rest }) {
  const Tag = motion[as] || motion.div;
  const rx = useMotionValue(0), ry = useMotionValue(0);
  const sx = useSpring(rx, { stiffness: 160, damping: 16 }), sy = useSpring(ry, { stiffness: 160, damping: 16 });
  const rotateX = useTransform(sy, (v) => -v * tilt), rotateY = useTransform(sx, (v) => v * tilt);

  const move = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
    rx.set(x - 0.5); ry.set(y - 0.5);
    e.currentTarget.style.setProperty('--mx', `${x * 100}%`);
    e.currentTarget.style.setProperty('--my', `${y * 100}%`);
    e.currentTarget.style.setProperty('--ang', `${Math.round(180 + (x - 0.5) * 140 + (y - 0.5) * 90)}deg`);
    e.currentTarget.style.setProperty('--glow', '1');
  };
  const leave = (e) => { rx.set(0); ry.set(0); e.currentTarget.style.setProperty('--glow', '.55'); };

  return (
    <Tag
      onPointerMove={glow ? move : undefined} onPointerLeave={glow ? leave : undefined}
      className={`liquid ${flat ? 'liquid-flat' : ''} ${/\b(absolute|fixed|sticky)\b/.test(className) ? '' : 'relative'} ${className}`}
      style={{ ...(tilt ? { rotateX, rotateY, transformPerspective: 1000 } : null), ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
