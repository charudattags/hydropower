import { useEffect, useRef, useState } from 'react';
import { animate } from 'framer-motion';
import { fmt } from '../utils/format';

/** Counts up to numeric spec values; non-numeric specs (e.g. "4.5 × 6.0") render as-is. */
export default function AnimatedNumber({ value, decimals = 0 }) {
  const [v, setV] = useState(typeof value === 'number' ? 0 : value);
  const prev = useRef(0);
  useEffect(() => {
    if (typeof value !== 'number') { setV(value); return; }
    const c = animate(prev.current, value, { duration: 1.1, ease: [0.22, 1, 0.36, 1], onUpdate: (x) => { prev.current = x; setV(x); } });
    return () => c.stop();
  }, [value]);
  return <>{typeof v === 'number' ? fmt(v, decimals) : v}</>;
}
