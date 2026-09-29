/**
 * Plant model — one consistent set of numbers used by the HUD, the labels and the detail panel.
 *
 * Fixed design data (rated point, φ = 1):
 *   gross head H = 160 m · discharge Q = 85 m³/s · penstock D = 5.2 m, L = 340 m, f = 0.012
 *   runner D = 4.8 m · generator 32 poles on a 50 Hz grid · η_gen = 98.5 %
 *
 * `phi` is the operating point as a fraction of rated discharge (gate opening).
 */
export const G = 9.81;
export const RHO = 1000;

export const DESIGN = {
  H: 160, Q: 85, Dp: 5.2, Lp: 340, f: 0.012, Dr: 4.8, poles: 32, freq: 50,
  etaGen: 0.985, pf: 0.95, Vgen: 13.8e3, Vgrid: 400e3, sigma: 160e6, jointEff: 0.9, waveSpeed: 1000,
};

/** Francis part-load efficiency: peaks at rated flow and sags away from it. */
const etaTurbine = (phi) => 0.94 - 0.35 * (phi - 1) ** 2;

export function plant(phi = 1) {
  const d = DESIGN;
  const Q = d.Q * phi;
  const A = (Math.PI * d.Dp ** 2) / 4;               // penstock flow area  A = πD²/4
  const v = Q / A;                                    // mean velocity       v = Q / A
  const hf = d.f * (d.Lp / d.Dp) * (v ** 2 / (2 * G)); // Darcy–Weisbach loss hf = f·(L/D)·v²/2g
  const Hn = d.H - hf;                                // net head            Hn = H − hf
  const pStatic = (RHO * G * d.H) / 1e5;              // static pressure     p = ρ·g·H  [bar]
  const pInlet = (RHO * G * Hn - 0.5 * RHO * v ** 2) / 1e5; // running pressure at the spiral case [bar]
  const dpSurge = (RHO * d.waveSpeed * v) / 1e5;      // Joukowsky surge     Δp = ρ·a·Δv  [bar] (instant closure, worst case)
  const pDesign = 24;                                 // adopted design pressure incl. surge allowance [bar]
  const wall = (pDesign * 1e5 * d.Dp) / (2 * d.sigma * d.jointEff) * 1000; // hoop stress   t = p·D / 2σ·η  [mm]
  const Ph = (RHO * G * Q * Hn) / 1e6;                // hydraulic power     P = ρ·g·Q·Hn  [MW]
  const eta = etaTurbine(phi);
  const Pshaft = Ph * eta;                            // shaft power         [MW]
  const Pel = Pshaft * d.etaGen;                      // electrical output   [MW]
  const S = Pel / d.pf;                               // apparent power      [MVA]
  const I = (S * 1e6) / (Math.sqrt(3) * d.Vgen);      // line current        I = S / (√3·V)  [A]
  const rpm = (120 * d.freq) / d.poles;               // synchronous speed   N = 120·f / poles  [rpm]
  const omega = (2 * Math.PI * rpm) / 60;             // angular speed       [rad/s]
  const u = omega * (d.Dr / 2);                       // runner tip speed    u = ω·D/2  [m/s]
  const torque = (Pshaft * 1e6) / omega / 1e6;        // shaft torque        T = P / ω  [MN·m]
  const Ns = (rpm * Math.sqrt(Pshaft * 1000)) / Hn ** 1.25; // specific speed (metric) Ns = N·√P[kW] / Hn^1.25
  const phiU = u / Math.sqrt(2 * G * Hn);             // speed ratio         u / √(2gHn)
  const eKwhPerM3 = (RHO * G * d.H) / 3.6e6;          // stored energy per m³ of water  [kWh]
  const vTail = Q / (20 * 3.5);                       // tailrace 20 m × 3.5 m channel  [m/s]
  return { phi, Q, A, v, hf, Hn, pStatic, pInlet, dpSurge, pDesign, wall, Ph, eta, Pshaft, Pel, S, I, rpm, omega, u, torque, Ns, phiU, eKwhPerM3, vTail };
}
