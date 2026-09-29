/** Copy lifted from the Hydro Power Plant deck (slide numbers in comments). */
export const AGENDA = [
  ['01', 'Introduction to hydropower', '2 min', 'intro'],
  ['02', 'Working principle', '3 min', 'principle'],
  ['03', 'Plant components', '3 min', 'components'],
  ['04', 'Types of plants', '2 min', 'types'],
  ['05', 'Advantages & disadvantages', '2 min', 'tradeoffs'],
  ['06', 'Global impact & future', '3 min', 'stats'],
  ['07', 'Working prototype', '5 min', 'plant'],
];

// slide 5 – 6 main components
export const MAIN_COMPONENTS = [
  { n: '01', title: 'Dam / Reservoir', text: 'Stores water in a reservoir and creates the head (height difference).', photo: 'reservoir' },
  { n: '02', title: 'Intake Gate', text: 'Controls water entering the penstock.', photo: 'intake' },
  { n: '03', title: 'Penstock', text: 'Carries high-pressure water to the turbine.', photo: 'penstock' },
  { n: '04', title: 'Turbine', text: 'Converts water energy into mechanical rotation.', photo: 'turbine' },
  { n: '05', title: 'Generator', text: 'Converts mechanical rotation into electrical energy.', photo: 'generator' },
  { n: '06', title: 'Transformer / Transmission', text: 'Raises voltage and sends electricity to the grid.', photo: 'transformer' },
];

// slide 6 – working principle
export const PRINCIPLE = [
  { n: '01', title: 'Water storage', text: 'A dam stores river water in a reservoir, creating a height difference (head) that stores potential energy.', photo: 'step1', tag: 'Potential energy' },
  { n: '02', title: 'Intake & penstock', text: 'Water flows through an intake gate into a penstock — a large pipe that channels water to the turbine.', photo: 'step2', tag: 'Pressure + speed' },
  { n: '03', title: 'Turbine rotation', text: 'The high-pressure water strikes the turbine blades, converting potential energy into mechanical rotation.', photo: 'step3', tag: 'Mechanical energy' },
  { n: '04', title: 'Electricity generation', text: 'The turbine shaft spins a generator, converting mechanical energy into electrical energy via electromagnetic induction.', photo: 'step4', tag: 'Electrical energy' },
];

// slide 7
export const TYPES = {
  cols: ['High-head', 'Low-head', 'Pumped storage'],
  rows: [
    ['Head (height)', ['100m+', 'Under 30m', 'Reversible']],
    ['Dam size', ['Yes', 'No', 'Yes']],
    ['Large reservoir', ['Yes', 'No', 'No']],
    ['Energy storage', ['No', 'No', 'Yes']],
    ['Best for', ['Mountains', 'Rivers', 'Peak demand']],
  ],
};

// slide 8
export const TRADEOFFS = {
  pros: { kicker: 'Advantages', title: 'Why hydropower', items: ['Renewable and sustainable energy source', 'Very low operating cost after construction', 'Long lifespan — 50 to 100 years', 'Flood control and irrigation support', 'No fuel needed — zero direct emissions'] },
  cons: { kicker: 'Disadvantages', title: 'The challenges', items: ['High initial construction cost', 'Large land area flooded for reservoirs', 'Disrupts river ecosystems and fish migration', 'Dependent on rainfall and water availability', 'Risk of displacement of local communities'] },
};

// slide 9
export const STATS = [
  { v: 16, pre: '', suf: '%', label: 'Of world electricity', sub: 'Largest renewable share', ring: 0.16 },
  { v: 60, pre: '', suf: '%', label: 'Of all renewables', sub: 'More than wind and solar combined', ring: 0.6 },
  { v: 2, pre: '$', suf: 'T', label: 'Investment by 2030', sub: 'Projected global spending', ring: 0.72 },
  { v: 50, pre: '', suf: '+', label: 'Years lifespan', sub: 'Typical plant operational life', ring: 0.5 },
];

// slide 10
export const TIMELINE = [
  ['1882', 'First hydro plant', 'Vulcan Street Plant in Wisconsin — the world’s first commercial hydroelectric station.'],
  ['1936', 'Hoover Dam', 'A landmark megaproject proving hydropower at massive scale.'],
  ['1984', 'Three Gorges begins', 'China starts what becomes the world’s largest power station by capacity.'],
  ['2020s', 'Small & micro hydro', 'Decentralized, low-impact plants bring power to remote communities.'],
  ['Future', 'Pumped storage & tidal', 'Grid-scale storage and marine energy expand the hydropower family.'],
];
