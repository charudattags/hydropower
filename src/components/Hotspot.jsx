import { AnimatePresence, motion, useTransform } from 'framer-motion';

/**
 * A hotspot = a clickable, glowing "zone" laid over the artwork (it zooms with the stage) plus a
 * numbered pin and info card that are counter-scaled by 1/cameraScale so they keep a constant
 * on-screen size no matter how far the camera has zoomed.
 */
export default function Hotspot({ c, camScale, hovered, active, mode, onHover, onSelect }) {
  const { x, y, w, h, rot } = c.hotspot;
  const inv = useTransform(camScale, (s) => 1 / s);
  const focused = mode === 'focused';
  const isActive = focused && active;
  const hidden = focused && !active;

  // Card placement: open upward near the bottom of the artwork, and hug the nearest edge.
  const up = y > 0.6;
  const align = x < 0.25 ? 'left-[-14px]' : x > 0.72 ? 'right-[-14px]' : 'left-1/2 -translate-x-1/2';

  return (
    <div
      className="absolute"
      style={{ left: `${x * 100}%`, top: `${y * 100}%`, width: `${w * 100}%`, height: `${h * 100}%`, transform: 'translate(-50%,-50%)', zIndex: hovered ? 30 : 10, pointerEvents: hidden ? 'none' : 'auto' }}
    >
      <motion.button
        type="button"
        aria-label={`${c.title}: ${c.basic.value}. Open detailed view`}
        onMouseEnter={() => onHover(c.id)}
        onMouseLeave={() => onHover(null)}
        onFocus={() => onHover(c.id)}
        onBlur={() => onHover(null)}
        onClick={() => onSelect(c.id)}
        disabled={focused}
        className="absolute inset-0 cursor-pointer rounded-[50%] outline-none disabled:cursor-default"
        style={{ rotate: rot }}
        animate={{ opacity: hidden ? 0 : 1 }}
        transition={{ duration: 0.4 }}
      >
        {/* glow: soft radial fill + rim light, revealed on hover/focus */}
        <motion.span
          className="absolute inset-0 rounded-[50%]"
          style={{ background: 'radial-gradient(closest-side, rgba(46,230,255,.42), rgba(46,230,255,.12) 62%, transparent 100%)', boxShadow: '0 0 0 1.5px rgba(46,230,255,.75), 0 0 40px 6px rgba(46,230,255,.45)' }}
          initial={false}
          animate={{ opacity: hovered ? 1 : isActive ? 0.55 : 0, scale: hovered ? 1.06 : 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        />
        {/* resting hint: faint dashed outline so zones are discoverable without hover */}
        <span className="absolute inset-0 rounded-[50%] border border-dashed border-white/25" style={{ opacity: hovered || focused ? 0 : 0.5, transition: "opacity .3s" }} />
      </motion.button>

      <motion.div className="pointer-events-none absolute left-1/2 top-1/2" style={{ scale: inv, x: '-50%', y: '-50%' }} animate={{ opacity: hidden ? 0 : 1 }}>
        <div className="relative grid h-8 w-8 place-items-center">
          {!focused && <span className="absolute inset-0 animate-ping rounded-full bg-aqua/40" style={{ animationDuration: '2.4s' }} />}
          <motion.span
            className="relative grid h-8 w-8 place-items-center rounded-full border border-aqua/80 bg-ink-950/80 font-mono text-[11px] font-medium text-aqua backdrop-blur"
            animate={{ scale: hovered ? 1.2 : 1, backgroundColor: hovered || isActive ? 'rgba(46,230,255,1)' : 'rgba(3,7,15,.8)', color: hovered || isActive ? '#03070f' : '#2ee6ff' }}
          >
            {c.n}
          </motion.span>
        </div>

        <AnimatePresence>
          {hovered && !focused && (
            <motion.div
              key="card"
              initial={{ opacity: 0, y: up ? 8 : -8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: up ? 6 : -6, scale: 0.98, transition: { duration: 0.12 } }}
              transition={{ type: 'spring', stiffness: 380, damping: 28 }}
              className={`glass absolute w-[248px] rounded-2xl p-4 shadow-glow ${align} ${up ? 'bottom-[30px]' : 'top-[30px]'}`}
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] tracking-widest text-aqua">{c.n} / 06</span>
                <span className="h-px flex-1 bg-white/10" />
              </div>
              <h3 className="mt-1.5 font-display text-[17px] font-semibold leading-tight text-white">{c.title}</h3>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-volt/10 px-2.5 py-1 text-[11px] font-medium text-volt-hot">
                <span className="h-1.5 w-1.5 rounded-full bg-volt" />
                {c.basic.value}
              </div>
              <p className="mt-2.5 text-[12.5px] leading-relaxed text-slate-300">{c.summary}</p>
              <p className="mt-3 flex items-center gap-1 text-[11px] font-medium text-aqua">Click to inspect <span aria-hidden>→</span></p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
