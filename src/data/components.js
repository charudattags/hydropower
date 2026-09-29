import { fmt } from '../utils/format';

/**
 * Single source of truth for the six plant components (shown as clickable zones).
 *
 * Coordinates are fractions (0–1) of the cutaway illustration (1400 × 764 design space), so they stay
 * glued to the artwork at any rendered size:
 *   hotspot : { x, y, w, h, rot }  – centre + size of the clickable/glowing zone (rot in degrees)
 *   camera  : { x, y, zoom }       – point the "camera" flies to in the focused state
 *   label   : { side, len, live }  – always-visible tag: side/length of its leader line + live readout
 *   specs   : rated-point design data          calc(p) : worked equations evaluated at the live operating point p
 *
 * All numbers derive from src/utils/physics.js so labels, HUD and detail panel always agree.
 */
const n1 = (v) => fmt(v, 1);

export const COMPONENTS = [
  {
    id: 'reservoir', n: '01', title: 'Reservoir', tagline: 'Dam & stored water',
    basic: { label: 'Energy form', value: 'Potential energy' },
    summary: 'Stores river water behind the dam and creates the head — the height difference that powers everything downstream.',
    energy: 'Gravitational potential', formula: 'E = m · g · h',
    hotspot: { x: 0.14, y: 0.46, w: 0.25, h: 0.62, rot: 0 },
    camera: { x: 0.16, y: 0.42, zoom: 1.9 },
    label: { side: 'l', len: 150, live: (p) => `H = 160 m · ${fmt(p.pStatic, 1)} bar` },
    photo: 'reservoir',
    specs: [
      { label: 'Gross head', value: 160, unit: 'm' },
      { label: 'Static pressure at base', value: 15.7, unit: 'bar', decimals: 1 },
      { label: 'Live storage', value: 1.8, unit: 'bn m³', decimals: 1 },
      { label: 'Energy per m³', value: 0.44, unit: 'kWh', decimals: 2 },
    ],
    calc: (p) => [
      ['Static pressure', 'p = ρ · g · H', `1000 × 9.81 × 160 = ${n1(p.pStatic)} bar`],
      ['Energy per m³', 'E = ρ · g · H', `${fmt(p.eKwhPerM3, 2)} kWh (1.57 MJ)`],
      ['Water used now', 'Q', `${n1(p.Q)} m³/s = ${fmt(p.Q * 3.6, 0)} thousand m³ per hour`],
    ],
    facts: ['Every extra metre of head adds proportionally to available power.', 'Spillway gates release flood surplus without touching the turbines.'],
  },
  {
    id: 'intake', n: '02', title: 'Intake', tagline: 'Gate & trash rack',
    basic: { label: 'Function', value: 'Flow regulation' },
    summary: 'A gated structure with a trash rack that filters debris and meters how much water enters the penstock.',
    energy: 'Potential → pressure', formula: 'Q = A · v',
    hotspot: { x: 0.225, y: 0.29, w: 0.1, h: 0.15, rot: 0 },
    camera: { x: 0.24, y: 0.3, zoom: 2.4 },
    label: { side: 'l', len: 230, live: (p) => `${n1(1.5 * p.phi)} m/s approach` },
    photo: 'intake',
    specs: [
      { label: 'Gates', value: '2 × 4.5 × 6.3', unit: 'm' },
      { label: 'Total gate area', value: 56.7, unit: 'm²', decimals: 1 },
      { label: 'Rack bar spacing', value: 100, unit: 'mm' },
      { label: 'Approach velocity', value: 1.5, unit: 'm/s', decimals: 1 },
    ],
    calc: (p) => [
      ['Discharge', 'Q = φ · Q_rated', `${n1(p.phi)} × 85 = ${n1(p.Q)} m³/s`],
      ['Gate area needed', 'A = Q / v', `${n1(p.Q)} ÷ 1.5 = ${n1(p.Q / 1.5)} m² (of 56.7 m²)`],
    ],
    facts: ['Slow approach velocity keeps fish and debris from being pinned to the rack.', 'Emergency gates can close against full flow to isolate the penstock.'],
  },
  {
    id: 'penstock', n: '03', title: 'Penstock', tagline: 'High-pressure conduit',
    basic: { label: 'Energy form', value: 'Pressure + kinetic' },
    summary: 'A steel pipe that channels water down the slope, converting stored height into pressure and speed.',
    energy: 'Potential → kinetic', formula: 'Δp = ρ · a · Δv',
    hotspot: { x: 0.447, y: 0.58, w: 0.36, h: 0.085, rot: 66 },
    camera: { x: 0.45, y: 0.55, zoom: 2.2 },
    label: { side: 'l', len: 300, live: (p) => `${n1(p.pInlet)} bar · ${n1(p.v)} m/s` },
    photo: 'penstock',
    specs: [
      { label: 'Diameter', value: 5.2, unit: 'm', decimals: 1 },
      { label: 'Length', value: 340, unit: 'm' },
      { label: 'Design pressure', value: 24, unit: 'bar' },
      { label: 'Wall thickness (base)', value: 44, unit: 'mm' },
    ],
    calc: (p) => [
      ['Velocity', 'v = Q / A,  A = πD²/4', `${n1(p.Q)} ÷ ${n1(p.A)} = ${fmt(p.v, 2)} m/s`],
      ['Friction loss', 'hf = f · (L/D) · v²/2g', `0.012 × 65.4 × ${fmt(p.v ** 2 / 19.62, 3)} = ${fmt(p.hf, 2)} m`],
      ['Pressure at turbine', 'p = ρ·g·(H−hf) − ½ρv²', `${fmt(p.pInlet, 2)} bar`],
      ['Water-hammer worst case', 'Δp = ρ · a · Δv', `1000 × 1000 × ${fmt(p.v, 1)} = ${fmt(p.dpSurge, 0)} bar → slow-closing valves`],
      ['Wall thickness', 't = p·D / (2·σ·η)', `${fmt(p.pDesign, 0)} bar → ${fmt(p.wall, 0)} mm`],
    ],
    facts: ['Walls thicken toward the bottom where static pressure is highest.', 'Surge tanks and slow valve closure prevent destructive water hammer.'],
  },
  {
    id: 'turbine', n: '04', title: 'Turbine', tagline: 'Francis runner',
    basic: { label: 'Energy form', value: 'Kinetic → mechanical' },
    summary: 'Pressurised water sweeps through the runner blades and turns the shaft — the heart of the conversion.',
    energy: 'Kinetic → mechanical', formula: 'P = ρ · g · Q · Hn · η',
    hotspot: { x: 0.598, y: 0.755, w: 0.15, h: 0.17, rot: 0 },
    camera: { x: 0.6, y: 0.74, zoom: 2.7 },
    label: { side: 'l', len: 160, live: (p) => `${n1(p.rpm)} rpm · ${fmt(p.Pshaft, 0)} MW` },
    photo: 'turbine',
    specs: [
      { label: 'Type', value: 'Francis', unit: '' },
      { label: 'Runner diameter', value: 4.8, unit: 'm', decimals: 1 },
      { label: 'Rotational speed', value: 187.5, unit: 'rpm', decimals: 1 },
      { label: 'Rated discharge', value: 85, unit: 'm³/s' },
      { label: 'Shaft output', value: 125, unit: 'MW' },
      { label: 'Peak efficiency', value: 94, unit: '%' },
    ],
    calc: (p) => [
      ['Net head', 'Hn = H − hf', `160 − ${fmt(p.hf, 2)} = ${n1(p.Hn)} m`],
      ['Hydraulic power', 'P = ρ·g·Q·Hn', `9.81 × ${n1(p.Q)} × ${n1(p.Hn)} = ${n1(p.Ph)} MW`],
      ['Shaft power', 'Pshaft = P · η', `${n1(p.Ph)} × ${fmt(p.eta, 3)} = ${n1(p.Pshaft)} MW`],
      ['Runner speed', 'N = 120·f / poles', `120 × 50 ÷ 32 = ${n1(p.rpm)} rpm (ω = ${fmt(p.omega, 2)} rad/s)`],
      ['Tip speed', 'u = ω · D/2', `${fmt(p.omega, 2)} × 2.4 = ${n1(p.u)} m/s  (u/√2gHn = ${fmt(p.phiU, 2)})`],
      ['Shaft torque', 'T = P / ω', `${fmt(p.torque, 2)} MN·m`],
      ['Specific speed', 'Ns = N·√P[kW] / Hn^1.25', `${fmt(p.Ns, 0)} → Francis range (60–400)`],
    ],
    facts: ['Wicket gates steer the flow onto the blades and set the power output.', 'A draft tube behind the runner recovers leftover velocity as suction.'],
  },
  {
    id: 'generator', n: '05', title: 'Generator', tagline: 'Synchronous alternator',
    basic: { label: 'Energy form', value: 'Mechanical → electrical' },
    summary: 'The shaft spins a magnetised rotor inside copper windings, inducing alternating current by electromagnetic induction.',
    energy: 'Mechanical → electrical', formula: 'ε = −N · dΦ/dt',
    hotspot: { x: 0.6, y: 0.565, w: 0.23, h: 0.2, rot: 0 },
    camera: { x: 0.62, y: 0.57, zoom: 2.4 },
    label: { side: 'r', len: 250, live: (p) => `${fmt(p.Pel, 0)} MW · 13.8 kV` },
    photo: 'generator',
    specs: [
      { label: 'Rating', value: 130, unit: 'MVA' },
      { label: 'Terminal voltage', value: 13.8, unit: 'kV', decimals: 1 },
      { label: 'Frequency', value: 50, unit: 'Hz' },
      { label: 'Poles', value: 32, unit: '' },
      { label: 'Power factor', value: 0.95, unit: '', decimals: 2 },
      { label: 'Efficiency', value: 98.5, unit: '%', decimals: 1 },
    ],
    calc: (p) => [
      ['Frequency', 'f = poles · N / 120', `32 × ${n1(p.rpm)} ÷ 120 = 50.0 Hz`],
      ['Electrical power', 'Pel = Pshaft · η_gen', `${n1(p.Pshaft)} × 0.985 = ${n1(p.Pel)} MW`],
      ['Apparent power', 'S = Pel / cosφ', `${n1(p.Pel)} ÷ 0.95 = ${n1(p.S)} MVA`],
      ['Line current', 'I = S / (√3 · V)', `${fmt(p.I / 1000, 2)} kA at 13.8 kV`],
      ['Grid step-up', 'V₂ / V₁ = 400 / 13.8', `× 29 → current falls to ${fmt(p.I / 29, 0)} A on the line`],
    ],
    facts: ['Pole count locks speed to grid frequency: 187.5 rpm × 32 poles ÷ 120 = 50 Hz.', 'Output is stepped up by the transformer before entering transmission lines.'],
  },
  {
    id: 'tailrace', n: '06', title: 'Tailrace', tagline: 'Draft tube & outflow',
    basic: { label: 'Function', value: 'Water returns to river' },
    summary: 'A calm channel that carries spent water back downstream, leaving the river’s volume unchanged.',
    energy: 'Residual kinetic', formula: 'Q_out = Q_in',
    hotspot: { x: 0.87, y: 0.8, w: 0.22, h: 0.32, rot: 0 },
    camera: { x: 0.84, y: 0.78, zoom: 2.2 },
    label: { side: 'r', len: 60, live: (p) => `${n1(p.Q)} m³/s · ${fmt(p.vTail, 1)} m/s` },
    photo: 'tailrace',
    specs: [
      { label: 'Rated discharge', value: 85, unit: 'm³/s' },
      { label: 'Channel section', value: '20 × 3.5', unit: 'm' },
      { label: 'Exit velocity', value: 1.2, unit: 'm/s', decimals: 1 },
      { label: 'Water consumed', value: 0, unit: '%' },
    ],
    calc: (p) => [
      ['Continuity', 'Q_out = Q_in', `${n1(p.Q)} m³/s returned`],
      ['Channel velocity', 'v = Q / (b · y)', `${n1(p.Q)} ÷ (20 × 3.5) = ${fmt(p.vTail, 2)} m/s`],
      ['Energy handed over', '1 − Pel / Ph', `${fmt((1 - p.Pel / p.Ph) * 100, 1)} % lost as heat, friction & exit velocity`],
    ],
    facts: ['Hydropower uses water’s energy, not the water — flow is returned intact.', 'Controlled releases protect downstream habitat and riverbanks.'],
  },
];

/** Unclickable reference tags that complete the labelling of the diagram (flow order: 1 → 6, then the grid). */
export const PASSIVE_LABELS = [
  { t: 'Dam', x: 0.42, y: 0.1, side: 't', len: 46 },
  { t: 'Powerhouse', x: 0.66, y: 0.5, side: 'r', len: 150 },
  { t: 'Vertical shaft', x: 0.612, y: 0.655, side: 'r', len: 190 },
  { t: 'Draft tube', x: 0.6, y: 0.86, side: 'b', len: 38 },
  { t: 'To grid', x: 0.985, y: 0.104, side: 'b', len: 30 },
];

/** Stage design space = the cropped diorama (515 × 457 source px) → 1000 × 887. */
export const STAGE = { w: 1000, h: 887, aspect: 1000 / 887 };
