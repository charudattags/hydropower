export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const fmt = (v, decimals = 0) => Number(v).toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
/** Flow-speed slider value (0–100) → multiplier (0.25× … 4×, 1× at the midpoint), exponential so the middle feels like 1×. */
export const speedFromSlider = (s) => 0.25 * Math.pow(16, s / 100);
