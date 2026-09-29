/**
 * Energy-path geometry in the 1400 × 764 design space of the illustration.
 * `kind` drives colour: water = blue→cyan, transfer = cyan→white (kinetic hand-off), power = yellow.
 */
export const FLOW_PATHS = [
  { id: 'intake',   kind: 'water',    d: 'M215 318 L300 312 L392 330' },
  { id: 'penstock', kind: 'water',    d: 'M392 330 C470 350 540 395 620 450 C690 498 745 520 800 530' },
  { id: 'turbine',  kind: 'transfer', d: 'M800 530 C775 545 790 572 820 566 C850 560 852 535 828 530' },
  { id: 'spill',    kind: 'spill',    d: 'M668 228 C692 268 716 310 738 352' },
  { id: 'river',    kind: 'river',    d: 'M1060 438 C1092 500 1160 558 1232 610 C1300 660 1360 690 1410 704' },
  { id: 'tailrace', kind: 'water',    d: 'M832 560 C845 620 870 662 925 668 L1010 672 L1170 692' },
];

/** Jagged current path: generator → cables → transformer → transmission lines. */
export const POWER_PATH = [
  [832, 372], [838, 322], [884, 300], [938, 288], [962, 236], [986, 196], [1024, 158], [1078, 118], [1150, 92], [1230, 70],
];
