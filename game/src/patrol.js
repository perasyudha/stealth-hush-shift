// Patrols: waypoint walking, the head sweep, listening to noise, and guard footsteps.
import { AWARE, TILE } from './config.js';

const dist = (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay);

function walkGuard(g, dt) {
  if (g.wait > 0) {
    g.wait = Math.max(0, g.wait - dt);
    return;
  }
  const next = g.path[(g.seg + 1) % g.path.length];
  const dx = next[0] - g.x;
  const dy = next[1] - g.y;
  const span = Math.hypot(dx, dy);
  if (span < 0.06) {
    g.seg = (g.seg + 1) % g.path.length;
    g.wait = g.pause;
    return;
  }
  const pace = g.speed * (g.alert > 0.6 ? 0.4 : 1);
  const step = Math.min(span, pace * dt);
  g.x += (dx / span) * step;
  g.y += (dy / span) * step;
  g.heading = Math.atan2(dy, dx);
}

function listen(g, world, dt) {
  const p = world.player;
  const noise = world.noise * TILE;
  const away = dist(g.x, g.y, p.x, p.y) * TILE;
  if (world.noise > 0.6 && away < noise + 40) {
    g.lookAt = { x: p.x, y: p.y };
    g.lookTimer = Math.max(g.lookTimer, 0.55);
  }
  if (g.lookTimer > 0) {
    g.lookTimer = Math.max(0, g.lookTimer - dt);
  }
}

export function updateGuards(world, dt, events) {
  for (const g of world.guards) {
    walkGuard(g, dt);
    listen(g, world, dt);

    const sweep = Math.sin(world.clock * 1.15 + g.phase) * g.sweep;
    let target = g.wait > 0 ? g.heading : g.heading + sweep;

    // A suspicious guard stops sweeping and stares where it last heard or saw you.
    const watching = world.awareness >= AWARE.searchAt && world.lastSeen;
    if (watching) {
      const stare = Math.atan2(world.lastSeen.y - g.y, world.lastSeen.x - g.x);
      target = stare;
      g.alert = Math.max(g.alert, 0.75);
    } else if (g.lookTimer > 0 && g.lookAt) {
      target = Math.atan2(g.lookAt.y - g.y, g.lookAt.x - g.x);
    }

    // Turn towards the target angle instead of snapping to it.
    let delta = target - g.angle;
    delta = Math.atan2(Math.sin(delta), Math.cos(delta));
    const turn = Math.min(Math.abs(delta), dt * (watching ? 4.2 : 2.6));
    g.angle += Math.sign(delta) * turn;

    g.stepTimer -= dt;
    if (g.stepTimer <= 0) {
      const moved = g.wait <= 0 ? 1 : 0.3;
      g.stepTimer = (1.05 - g.speed * 0.12) / (moved ? 1 : 2.2);
      events.push({ type: 'guardStep', guard: g, dist: dist(g.x, g.y, world.player.x, world.player.y) });
    }
  }
  world.camera.angle += world.camera.spin * dt;
  world.camera.alert = Math.max(0, world.camera.alert - dt * 0.8);
}
