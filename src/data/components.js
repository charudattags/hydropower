/**
 * Single source of truth for the six plant components.
 *
 * Coordinates are fractions (0–1) of the cutaway illustration (1400 × 764 design space),
 * so they stay glued to the artwork at any rendered size:
 *
 *   hotspot : { x, y, w, h, rot }  – centre + size of the clickable/glowing zone (rot in degrees)
 *   camera  : { x, y, zoom }       – the point the "camera" flies to in the focused state
 *
 * Specs are illustrative figures for a mid-size high-head plant (≈125 MW) and are internally
 * consistent (P = ρ·g·Q·H·η).
 */
export const COMPONENTS = [
  {
    id: 'reservoir',
    n: '01',
    title: 'Reservoir',
    tagline: 'Dam & stored water',
    basic: { label: 'Energy form', value: 'Potential energy' },
    summary: 'Stores river water behind the dam and creates the head — the height difference that powers everything downstream.',
    energy: 'Gravitational potential',
    formula: 'E = m · g · h',
    hotspot: { x: 0.125, y: 0.3, w: 0.2, h: 0.22, rot: 0 },
    camera: { x: 0.17, y: 0.33, zoom: 1.9 },
    photo: 'reservoir',
    specs: [
      { label: 'Gross head', value: 160, unit: 'm' },
      { label: 'Live storage', value: 1.8, unit: 'bn m³', decimals: 1 },
      { label: 'Dam crest length', value: 480, unit: 'm' },
      { label: 'Full supply level', value: 412, unit: 'm a.s.l.' },
    ],
    facts: [
      'Every extra metre of head adds proportionally to available power.',
      'Spillway gates release flood surplus without touching the turbines.',
    ],
  },
  {
    id: 'intake',
    n: '02',
    title: 'Intake',
    tagline: 'Gate & trash rack',
    basic: { label: 'Function', value: 'Flow regulation' },
    summary: 'A gated structure with a trash rack that filters debris and meters how much water enters the penstock.',
    energy: 'Potential → pressure',
    formula: 'Q = A · v',
    hotspot: { x: 0.235, y: 0.43, w: 0.1, h: 0.17, rot: -8 },
    camera: { x: 0.26, y: 0.45, zoom: 2.4 },
    photo: 'intake',
    specs: [
      { label: 'Gate opening', value: '4.5 × 6.0', unit: 'm' },
      { label: 'Rack bar spacing', value: 100, unit: 'mm' },
      { label: 'Approach velocity', value: 1.5, unit: 'm/s', decimals: 1 },
      { label: 'Closure time', value: 90, unit: 's' },
    ],
    facts: [
      'Slow approach velocity keeps fish and debris from being pinned to the rack.',
      'Emergency gates can close against full flow to isolate the penstock.',
    ],
  },
  {
    id: 'penstock',
    n: '03',
    title: 'Penstock',
    tagline: 'High-pressure conduit',
    basic: { label: 'Energy form', value: 'Pressure + kinetic' },
    summary: 'A steel pipe that channels water down the slope, converting stored height into pressure and speed.',
    energy: 'Potential → kinetic',
    formula: 'v = √(2 · g · h)',
    hotspot: { x: 0.4, y: 0.56, w: 0.28, h: 0.13, rot: 31 },
    camera: { x: 0.4, y: 0.56, zoom: 2.0 },
    photo: 'penstock',
    specs: [
      { label: 'Diameter', value: 5.2, unit: 'm', decimals: 1 },
      { label: 'Wall thickness', value: 38, unit: 'mm' },
      { label: 'Design pressure', value: 16, unit: 'bar' },
      { label: 'Flow velocity', value: 4.0, unit: 'm/s', decimals: 1 },
    ],
    facts: [
      'Walls thicken toward the bottom where static pressure is highest.',
      'Surge tanks and slow valve closure prevent destructive water hammer.',
    ],
  },
  {
    id: 'turbine',
    n: '04',
    title: 'Turbine',
    tagline: 'Francis runner',
    basic: { label: 'Energy form', value: 'Kinetic → mechanical' },
    summary: 'Pressurised water sweeps through the runner blades and turns the shaft — the heart of the conversion.',
    energy: 'Kinetic → mechanical',
    formula: 'P = ρ · g · Q · H · η',
    hotspot: { x: 0.575, y: 0.69, w: 0.12, h: 0.17, rot: 0 },
    camera: { x: 0.585, y: 0.68, zoom: 2.7 },
    photo: 'turbine',
    specs: [
      { label: 'Type', value: 'Francis', unit: '' },
      { label: 'Runner diameter', value: 4.8, unit: 'm', decimals: 1 },
      { label: 'Rotational speed', value: 187.5, unit: 'rpm', decimals: 1 },
      { label: 'Discharge', value: 85, unit: 'm³/s' },
      { label: 'Shaft output', value: 126, unit: 'MW' },
      { label: 'Efficiency', value: 94, unit: '%' },
    ],
    facts: [
      'Wicket gates steer the flow onto the blades and set the power output.',
      'A draft tube behind the runner recovers leftover velocity as suction.',
    ],
  },
  {
    id: 'generator',
    n: '05',
    title: 'Generator',
    tagline: 'Synchronous alternator',
    basic: { label: 'Energy form', value: 'Mechanical → electrical' },
    summary: 'The shaft spins a magnetised rotor inside copper windings, inducing alternating current by electromagnetic induction.',
    energy: 'Mechanical → electrical',
    formula: 'ε = −N · dΦ/dt',
    hotspot: { x: 0.595, y: 0.485, w: 0.155, h: 0.16, rot: 0 },
    camera: { x: 0.6, y: 0.5, zoom: 2.5 },
    photo: 'generator',
    specs: [
      { label: 'Rating', value: 130, unit: 'MVA' },
      { label: 'Terminal voltage', value: 13.8, unit: 'kV', decimals: 1 },
      { label: 'Frequency', value: 50, unit: 'Hz' },
      { label: 'Poles', value: 32, unit: '' },
      { label: 'Power factor', value: 0.95, unit: '', decimals: 2 },
      { label: 'Efficiency', value: 98.5, unit: '%', decimals: 1 },
    ],
    facts: [
      'Pole count locks speed to grid frequency: 187.5 rpm × 32 poles ÷ 120 = 50 Hz.',
      'Output is stepped up by the transformer before entering transmission lines.',
    ],
  },
  {
    id: 'tailrace',
    n: '06',
    title: 'Tailrace',
    tagline: 'Draft tube & outflow',
    basic: { label: 'Function', value: 'Water returns to river' },
    summary: 'A calm channel that carries spent water back downstream, leaving the river’s volume unchanged.',
    energy: 'Residual kinetic',
    formula: 'Q_out = Q_in',
    hotspot: { x: 0.8, y: 0.885, w: 0.2, h: 0.1, rot: 0 },
    camera: { x: 0.78, y: 0.82, zoom: 2.1 },
    photo: 'tailrace',
    specs: [
      { label: 'Discharge', value: 85, unit: 'm³/s' },
      { label: 'Exit velocity', value: 1.2, unit: 'm/s', decimals: 1 },
      { label: 'Channel length', value: 600, unit: 'm' },
      { label: 'Water consumed', value: 0, unit: '%' },
    ],
    facts: [
      'Hydropower uses water’s energy, not the water — flow is returned intact.',
      'Controlled releases protect downstream habitat and riverbanks.',
    ],
  },
];

/** Stage design space — every overlay coordinate is authored against these numbers. */
export const STAGE = { w: 1400, h: 764, aspect: 1400 / 764 };
