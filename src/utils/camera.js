import { STAGE } from '../data/components';

/**
 * ── ZOOM / CAMERA LOGIC ──────────────────────────────────────────────────────
 * The illustration lives on a "stage" element of W × H pixels with transform-origin 0 0.
 * The camera is simply that element's translate (x, y) and uniform scale, so:
 *
 *      screen = translate + scale · (stageFraction · [W, H])
 *
 * To frame a target point T (stage fractions) at screen anchor A (container fractions):
 *
 *      translate = A · [cw, ch] − scale · T · [W, H]
 *
 * We then clamp so the artwork never reveals empty space (or centre it when it is smaller
 * than the viewport, as happens in the "contain" fit used on portrait phones).
 *
 * Because x / y / scale are framer-motion MotionValues, the zoom is an imperative `animate()`
 * call – the same numbers also feed the canvas overlay every frame, keeping particles glued
 * to the artwork while the camera is mid-flight.
 */

/** The diorama floats on a transparent stage, so it is always *contained* (fully visible, side space kept for labels). */
export function fitStage(cw, ch) {
  const k = Math.min(cw / STAGE.w, ch / STAGE.h) * 0.96;
  return { W: STAGE.w * k, H: STAGE.h * k, k };
}

// Larger than the viewport → never expose empty space. Smaller (phone "contain" fit) → keep it fully on screen.
const clampAxis = (v, view, content) => (content <= view ? Math.min(view - content, Math.max(0, v)) : Math.min(0, Math.max(view - content, v)));

export function cameraFor({ cw, ch }, target, zoom, anchor = { x: 0.5, y: 0.5 }, freeY = false) {
  const { W, H } = fitStage(cw, ch);
  const x = anchor.x * cw - target.x * W * zoom;
  const y = anchor.y * ch - target.y * H * zoom;
  return { x: clampAxis(x, cw, W * zoom), y: freeY ? y : clampAxis(y, ch, H * zoom), scale: zoom };
}

/** `freeY` lets phones pan past the artwork's edge – the gap ends up hidden behind the bottom sheet. */
/** Overview camera: whole illustration, centred. */
export const overviewCamera = (size) => {
  const portrait = size.cw / size.ch < 0.9;
  return cameraFor(size, { x: 0.5, y: 0.5 }, 1, { x: 0.5, y: portrait ? 0.4 : 0.5 });
};
