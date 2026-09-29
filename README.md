# Hydropower Plant — Interactive Cutaway

React + Tailwind CSS + Framer Motion single-page app built from the *Hydro Power Plant* deck
(palette, copy and photography come from it).

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle in dist/
```

## What it does
- **Main view** – cutaway illustration with six glowing, keyboard-focusable zones. Hovering a zone lights it up and opens a summary card; the whole scene tilts in 3D toward the cursor.
- **Click to zoom** – the camera glides (translate + scale share one easing curve) to the chosen component; a detail panel slides in with a live canvas simulation (spinning Francis runner, rotating magnetic field, accelerating penstock flow, …), animated spec counters and a **Back to Main View** button. `Esc` goes back, `←`/`→` browse.
- **Energy Path Overlay** – canvas particles down the penstock (accelerating), kinetic-transfer rings at the turbine, and a jagged lightning bolt with sparks from the generator to the grid. Blue → cyan → white → gold encodes the energy conversion.
- **Bottom dock** – component chips, overlay toggle, Flow Speed slider (0.25×–4×, drives every animation) and Reset View.
- **Responsive** – phones use a "contain" fit plus a bottom-sheet detail panel.

## Structure
```
src/
  App.jsx                 state machine (full ⇄ focused), keyboard, layout
  data/components.js      title / basic info / technical data / hotspot + camera per component
  data/flow.js            overlay path geometry (design space 1400×764)
  utils/camera.js         zoom maths — see the comment block at the top
  components/Stage.jsx    camera MotionValues, 3D tilt, hotspots, overlay tags
  components/Hotspot.jsx  glow zone, counter-scaled pin + hover card
  components/FlowCanvas.jsx  energy-path particles / lightning (screen-resolution canvas)
  components/DetailPanel.jsx, SceneCanvas.jsx, scenes/draw.js   focused view
  components/Controls.jsx, AnimatedNumber.jsx
public/assets/            plant-cutaway.jpg + component photos cropped from the deck
```
Specs are illustrative figures for a ~125 MW high-head plant, not a real installation.
