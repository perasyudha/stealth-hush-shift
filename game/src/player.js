// Movement, stance, noise radius, picking up the gold key and slipping out the teal door.
import { NOISE, SPEED, TILE } from './config.js';
import { blocksWalk, isVent, routeAt, tileAt } from './level.js';

const RADIUS = 0.3;

function free(world, x, y) {
  for (const [dx, dy] of [[-RADIUS, -RADIUS], [RADIUS, -RADIUS], [-RADIUS, RADIUS], [RADIUS, RADIUS]]) {
    if (blocksWalk(tileAt(Math.floor(x + dx), Math.floor(y + dy)))) return false;
  }
  return true;
}

const STEP_GAP = { walk: 0.42, sprint: 0.26, crouch: 0.62, vent: 0.52 };

export function updatePlayer(world, dt, move, events) {
  if (world.phase !== 'play') return;
  const p = world.player;
  const vent = isVent(tileAt(Math.floor(p.x), Math.floor(p.y)));

  let stance = 'walk';
  if (vent) stance = 'vent';
  else if (move.crouch) stance = 'crouch';
  else if (move.sprint) stance = 'sprint';
  world.stance = stance;
  world.noise = move.moving ? NOISE[stance] : NOISE[stance] * 0.2;

  const pace = SPEED[stance];
  p.speed = move.moving ? pace : 0;
  p.moving = move.moving;

  if (move.moving) {
    const nx = p.x + move.dx * pace * dt;
    const ny = p.y + move.dy * pace * dt;
    if (free(world, nx, p.y)) p.x = nx;
    if (free(world, p.x, ny)) p.y = ny;
    p.angle = Math.atan2(move.dy, move.dx);
  }

  // Breadcrumbs: the path the run took, drawn faintly so a route can be read back.
  world.trailTimer -= dt;
  if (move.moving && world.trailTimer <= 0) {
    world.trailTimer = 0.28;
    world.trail.push({ x: p.x, y: p.y });
    if (world.trail.length > 600) world.trail.shift();
  }

  const route = routeAt(p.x, p.y);
  if (route) world.routeMeters[route] += p.speed * dt;

  p.stepTimer -= dt;
  if (move.moving && p.stepTimer <= 0) {
    p.stepTimer = STEP_GAP[stance];
    events.push({ type: 'step', stance });
  }

  const nearKey = Math.hypot(p.x - world.keyTile.x, p.y - world.keyTile.y) < 0.62;
  if (nearKey && !world.hasKey) {
    world.hasKey = true;
    events.push({ type: 'key' });
  }

  const atExit = Math.hypot(p.x - world.exitTile.x, p.y - world.exitTile.y) < 0.75;
  if (atExit && world.hasKey) {
    world.phase = 'clean';
    events.push({ type: 'clean' });
  }
}

// HUD prompt for the teal door before the key is in hand.
export function exitPrompt(world) {
  const p = world.player;
  const span = Math.hypot(p.x - world.exitTile.x, p.y - world.exitTile.y);
  if (span * TILE > 190) return null;
  return world.hasKey ? 'teal door open' : 'teal door locked: the gold key first';
}
