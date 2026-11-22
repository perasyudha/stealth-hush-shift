// One mutable world: player, patrols, ceiling camera, awareness and route counters.
import { CAMERA, GUARDS, LAMPS } from './config.js';
import { glyphTiles, KEY, EXIT, START } from './level.js';

function makeGuard(def) {
  const [sx, sy] = def.path[0];
  return {
    ...def,
    x: sx,
    y: sy,
    seg: 0,
    wait: 0,
    pause: def.wait,
    heading: 0,
    angle: 0,
    alert: 0,
    lookTimer: 0,
    lookAt: null,
    stepTimer: 0.2,
    sees: false,
  };
}

export function createState() {
  const start = glyphTiles(START)[0] ?? { x: 1, y: 1 };
  const key = glyphTiles(KEY)[0] ?? { x: 27, y: 11 };
  const exit = glyphTiles(EXIT)[0] ?? { x: 30, y: 17 };
  return {
    phase: 'play',
    clock: 0,
    time: 0,
    awareness: 0,
    nearMisses: 0,
    nearFlash: 0,
    alarm: 0,
    hasKey: false,
    stance: 'walk',
    noise: 0,
    hidden: false,
    seenBy: null,
    lastSeen: null,
    player: {
      x: start.x + 0.5,
      y: start.y + 0.5,
      angle: 0,
      moving: false,
      stepTimer: 0,
      speed: 0,
    },
    guards: GUARDS.map(makeGuard),
    camera: { ...CAMERA, angle: CAMERA.phase, sees: false, alert: 0 },
    lamps: LAMPS.map((lamp) => ({ ...lamp })),
    lit: false,
    keyTile: { x: key.x + 0.5, y: key.y + 0.5 },
    exitTile: { x: exit.x + 0.5, y: exit.y + 0.5 },
    routeMeters: { front: 0, service: 0, vent: 0 },
    trail: [],
    trailTimer: 0,
    shot: null,
  };
}

// The route the run leaned on most, named for the win panel.
export function chosenRoute(state) {
  const meters = state.routeMeters;
  let best = null;
  let value = 0.5;
  for (const name of Object.keys(meters)) {
    if (meters[name] > value) {
      best = name;
      value = meters[name];
    }
  }
  return best;
}

export function isOver(state) {
  return state.phase === 'clean' || state.phase === 'caught';
}
