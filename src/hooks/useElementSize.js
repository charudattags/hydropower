import { useLayoutEffect, useRef, useState } from 'react';

export function useElementSize() {
  const ref = useRef(null);
  const [size, setSize] = useState({ cw: 0, ch: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setSize({ cw: el.clientWidth, ch: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size];
}
