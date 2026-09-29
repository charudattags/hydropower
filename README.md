# Hydropower Plant — immersive presentation site

React + Tailwind CSS + Framer Motion + Three.js, built from the *Hydro Power Plant* deck (copy, palette and photography).

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle in dist/
```

## Flow
1. **Intro** (`components/Intro.jsx`) – a Three.js scene: bedrock, reservoir, dam, intake, penstock, powerhouse, turbine, generator, tailrace, transformer and pylon drop/slide into place in ~3.4 s. Every landing shakes the camera, squashes the block, flashes its outline and sends out a shock ring. When the last block lands the plant powers on (bolt), then **Hydropower Plant** (Montserrat Black Italic) flickers in, followed by the Instrument Serif subtitle and the **Begin Immersion** button.
2. **Story** – one page per slide (`pages/`), Lenis smooth scrolling, Framer-Motion scroll transforms (3D fly-in/out per page, pinned horizontal card track, scroll-scrubbed text, drawing timeline, count-ups) on liquid-glass surfaces (`components/Glass.jsx`, `.liquid` in `index.css`).
3. **Working prototype** (last page, `components/PlantSection.jsx`) – the interactive cutaway. It is alive at rest (penstock flow, spillway, river, tailrace, reservoir glints, spinning runner, energy packets on the cables); the Energy Path Overlay intensifies it and adds the lightning bolt.

## Labelling and calculations
`utils/physics.js` is the single model behind the on-diagram tags, the operating-point HUD and each component's "Worked calculation" (rated point: H = 160 m, Q = 85 m³/s, D = 5.2 m penstock, 32 poles @ 50 Hz):

| Quantity | Equation | Rated value |
|---|---|---|
| Static pressure | p = ρ·g·H | 15.7 bar |
| Penstock velocity | v = Q / (πD²/4) | 4.00 m/s |
| Friction loss / net head | hf = f·(L/D)·v²/2g | 0.64 m → 159.4 m |
| Water-hammer worst case | Δp = ρ·a·Δv | 40 bar (hence slow-closing valves) |
| Wall thickness | t = p·D / (2·σ·η) at 24 bar | 44 mm |
| Hydraulic / shaft / electrical power | ρ·g·Q·Hn, ×η_t, ×η_gen | 132.9 / 124.9 / 123.0 MW |
| Runner speed | N = 120·f / poles | 187.5 rpm (ω = 19.63 rad/s) |
| Tip speed, torque, specific speed | u = ω·D/2, T = P/ω, Ns | 47.1 m/s, 6.36 MN·m, 117 |
| Generator current | I = S / (√3·V) | 5.4 kA at 13.8 kV |

The Flow Speed slider sets the gate opening φ = clamp(speed, 0.3, 1.2) so pressures, powers and currents update live; the runner stays grid-locked at 187.5 rpm.

`public/assets/plant-clean.jpg` is the deck's cutaway with the baked-in English labels inpainted away (OpenCV), so the interface's own numbered, flow-ordered labels are the only ones.
