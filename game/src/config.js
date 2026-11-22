// Every tuned number and the floor plan live here, so the systems files stay behavioural.
export const TILE = 40;
export const COLS = 32;
export const ROWS = 20;
export const VIEW_W = COLS * TILE;
export const VIEW_H = ROWS * TILE;
// The HUD lives in two letterbox strips, so the floor is never covered.
export const HUD_TOP = 72;
export const HUD_BOTTOM = 64;
export const CANVAS_W = VIEW_W;
export const CANVAS_H = HUD_TOP + VIEW_H + HUD_BOTTOM;

// Legend: # wall, . floor, C crate, D desk, P pillar, v vent crawl,
// L gold vault key, X teal exit door, s player start.
export const MAP = [
  '################################',
  '#s..C.C..#..D...#..D...P......##',
  '#..CC.........................##',
  '#........#....................##',
  '#.....C..#....D.#.....D..P....##',
  '#..##########################.##',
  '#......................######.##',
  '#......CC.P.CC...D.....######.##',
  '#...CC...P..C..D..C..P.######.##',
  '#......................######..#',
  '#..#####################.......#',
  '#...vvvvvvvvvvvvvvvvvv.....L...#',
  '#..#####################.C.....#',
  '#.....CC.......C.......#.......#',
  '#......................####.####',
  '#..###.#############.######.####',
  '#..............................#',
  '#.............................X#',
  '#......D.C..D...D.....D..C.....#',
  '################################',
];

// The three named ways in: the HUD legend and the win panel use these names.
export const ROUTES = {
  front: { label: 'FRONT HALL', blurb: 'desks and pillars, two guards', tint: '#9fc0e6' },
  service: { label: 'SERVICE RUN', blurb: 'long south run, one guard', tint: '#e6b49f' },
  vent: { label: 'VENT CRAWL', blurb: 'crawl only, no sight lines', tint: '#9fe6cd' },
};

// Door frames: drawn as jambs so every route entrance reads at a glance.
export const DOORS = [
  { x: 9, y: 2, name: 'start gap' },
  { x: 16, y: 1, name: 'partition' },
  { x: 16, y: 4, name: 'partition' },
  { x: 29, y: 9, name: 'vault north' },
  { x: 23, y: 11, name: 'vault west' },
  { x: 27, y: 14, name: 'vault south' },
  { x: 6, y: 15, name: 'aisle gap' },
  { x: 20, y: 15, name: 'aisle gap' },
];

export const GUARDS = [
  {
    id: 'A',
    route: 'front',
    path: [[11.5, 2.5], [27.5, 2.5], [27.5, 3.5], [11.5, 3.5]],
    speed: 1.75,
    fov: 64,
    range: 7.4,
    wait: 0.7,
    sweep: 0.38,
    phase: 0,
  },
  {
    id: 'B',
    route: 'service',
    path: [[3.5, 16.5], [28.5, 16.5], [28.5, 17.5], [3.5, 17.5]],
    speed: 1.5,
    fov: 58,
    range: 8.2,
    wait: 1.1,
    sweep: 0.3,
    phase: 1.9,
  },
  {
    id: 'C',
    route: 'front',
    path: [[6.5, 6.5], [20.5, 6.5], [20.5, 9.5], [6.5, 9.5]],
    speed: 2.0,
    fov: 76,
    range: 9.4,
    wait: 0.35,
    sweep: 0.46,
    phase: 3.4,
  },
];

export const CAMERA = {
  x: 22.55,
  y: 7.5,
  fov: 44,
  range: 7.0,
  spin: 0.42,
  sweep: 0.85,
  phase: 0.6,
};

// Lamps: three fixed warm pools on the floor. Standing in one lights you up: every guard's
// reach triples, so the dark is the only quiet place to stand. Tile units.
export const LAMPS = [
  { x: 9.5, y: 9.2 },
  { x: 20.5, y: 2.4 },
  { x: 22.5, y: 16.5 },
];

// radius: pool that lights the player (tiles). reach: detection multiplier while lit.
export const LIGHT = { radius: 2.2, reach: 3 };

export const SPEED = { walk: 4.3, sprint: 8.4, crouch: 1.55, vent: 1.85 };
export const NOISE = { walk: 1.9, sprint: 4.8, crouch: 0.7, vent: 0.45 };
export const STANCE_LABEL = {
  walk: 'WALK',
  sprint: 'SPRINT · loud',
  crouch: 'CROUCH · quiet',
  vent: 'VENT · crawling',
};

// Awareness: gain per second at point blank, scaled down by range and stance.
export const AWARE = {
  gainGuard: 46,
  gainCamera: 58,
  drain: 19,
  crouchScale: 0.55,
  sprintScale: 1.35,
  nearMiss: 60,
  caught: 100,
  searchAt: 55,
};
