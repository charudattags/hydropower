/**
 * Energy-path geometry in the 1000 × 887 design space of the diorama (fractions of the image × design size).
 * `kind` drives colour/behaviour: water = blue→cyan streaks, transfer = kinetic hand-off at the runner,
 * surface = calm streaks across a water top face, power = the yellow current.
 */
export const FLOW_PATHS = [
  { id: 'intake',   kind: 'water',   d: 'M110 252 C170 250 240 250 290 256' },
  { id: 'penstock', kind: 'water',   d: 'M290 256 C330 262 352 290 382 360 C410 430 440 520 484 592 C508 634 540 662 568 674' },
  { id: 'turbine',  kind: 'transfer', d: 'M568 674 C570 650 626 650 628 674 C626 698 570 698 568 674' },
  { id: 'draft',    kind: 'water',   d: 'M590 704 C592 750 614 782 690 794 C760 802 810 794 850 780' },
  { id: 'tail1',    kind: 'surface', d: 'M760 545 C830 548 900 578 985 606', spread: 34 },
  { id: 'tail2',    kind: 'surface', d: 'M730 692 C800 722 880 752 972 768', spread: 22 },
  { id: 'pond',     kind: 'pond',    d: 'M40 160 C150 118 290 78 430 44', spread: 26 },
];

/** Where the always-on ambient details live (design px). */
export const TURBINE = { x: 598, y: 674, r: 26 };
export const ROTOR = { x: 598, y: 510, rx: 50, ry: 13 };

/** Jagged current path: generator → out through the roof → across the void to the grid. */
export const POWER_PATH = [
  [598, 440], [604, 396], [640, 352], [700, 322], [768, 268], [830, 226], [880, 168], [935, 120], [990, 92],
];
