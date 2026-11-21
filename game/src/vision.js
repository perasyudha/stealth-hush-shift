// Sight and awareness: who sees you, how fast the meter fills, and the near-miss rule.
import { AWARE } from './config.js';
import { angleDelta, coverBetween, lineBlocked, wallBlocked } from './level.js';

const STARE = AWARE.searchAt;

function guardExposure(world, g) {
  const p = world.player;
  const span = Math.hypot(p.x - g.x, p.y - g.y);
  if (span > g.range) return 0;
  const bearing = Math.atan2(p.y - g.y, p.x - g.x);
  if (angleDelta(g.angle, bearing) > (g.fov * Math.PI) / 360) return 0;
  if (lineBlocked(g.x, g.y, p.x, p.y)) return 0;
  // Behind a crate with the hood down: the guard's line never reaches you.
  if (world.stance === 'crouch' && coverBetween(p.x, p.y, g.x, g.y)) return 0;
  return Math.max(0.14, 1 - span / (g.range * 1.1));
}

function cameraExposure(world) {
  const cam = world.camera;
  const p = world.player;
  const span = Math.hypot(p.x - cam.x, p.y - cam.y);
  if (span > cam.range) return 0;
  const bearing = Math.atan2(p.y - cam.y, p.x - cam.x);
  if (angleDelta(cam.angle, bearing) > (cam.fov * Math.PI) / 360) return 0;
  if (wallBlocked(cam.x, cam.y, p.x, p.y)) return 0;
  return Math.max(0.18, 1 - span / (cam.range * 1.05));
}

export function closeToCover(world) {
  const p = world.player;
  return coverBetween(p.x, p.y, p.x + 1, p.y) || coverBetween(p.x, p.y, p.x - 1, p.y)
    || coverBetween(p.x, p.y, p.x, p.y + 1) || coverBetween(p.x, p.y, p.x, p.y - 1);
}

// Returns the events the audio and HUD layers care about.
export function updateVision(world, dt) {
  const events = [];
  const before = world.awareness;
  let exposure = 0;
  let watcher = null;

  for (const g of world.guards) {
    const seen = guardExposure(world, g);
    g.sees = seen > 0;
    g.alert = Math.min(1, Math.max(0, g.alert + (seen > 0 ? 1.5 : -0.85) * dt));
    if (seen > exposure) {
      exposure = seen;
      watcher = 'guard';
    }
  }

  const camSeen = cameraExposure(world);
  world.camera.sees = camSeen > 0;
  world.camera.alert = Math.min(1, Math.max(0, world.camera.alert + (camSeen > 0 ? 1.8 : -0.6) * dt));
  if (camSeen > exposure) {
    exposure = camSeen;
    watcher = 'camera';
  }

  world.seenBy = watcher;
  world.hidden = world.stance === 'crouch' && exposure === 0 && closeToCover(world);

  if (exposure > 0) {
    const stanceScale = world.stance === 'crouch' ? AWARE.crouchScale
      : world.stance === 'sprint' ? AWARE.sprintScale : 1;
    const rate = watcher === 'camera' ? AWARE.gainCamera : AWARE.gainGuard;
    world.awareness = Math.min(100, world.awareness + rate * exposure * stanceScale * dt);
    world.lastSeen = { x: world.player.x, y: world.player.y };
  } else {
    world.awareness = Math.max(0, world.awareness - AWARE.drain * dt);
  }

  if (before < STARE && world.awareness >= STARE) {
    events.push({ type: 'nearMiss' });
    world.nearMisses += 1;
    world.nearFlash = 1;
  }
  if (world.awareness >= AWARE.caught && world.phase === 'play') {
    world.phase = 'caught';
    events.push({ type: 'caught' });
  }

  world.nearFlash = Math.max(0, world.nearFlash - dt * 1.6);
  return events;
}
