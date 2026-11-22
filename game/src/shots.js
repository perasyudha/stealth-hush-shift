// Deterministic poses for the four screenshots: ?shot=cover|hide|close|win.
import { ROUTES } from './config.js';
import { playerLit } from './vision.js';

function freeze(world, clock) {
  world.clock = clock;
  world.shot = true;
  world.player.moving = false;
  world.player.speed = 0;
}

function place(guard, x, y, angle) {
  guard.x = x;
  guard.y = y;
  guard.angle = angle;
  guard.heading = angle;
  guard.wait = 0;
  guard.lookTimer = 0;
  guard.alert = 0;
}

function cover(world) {
  const [a, b, c] = world.guards;
  freeze(world, 12.4);
  world.time = 41.6;
  world.stance = 'crouch';
  world.noise = 0.7;
  world.awareness = 21;
  world.nearMisses = 0;
  world.hidden = true;
  // Crouched in the desk's shadow: guard C's cone runs west and dies on the desk tile in
  // front of the player, while the ceiling camera hatches straight over the crate behind it.
  world.player.x = 14.5;
  world.player.y = 8.5;
  world.player.angle = 3.1;
  place(a, 19.5, 2.5, 3.25);
  place(b, 13.5, 16.5, -0.12);
  place(c, 17.5, 8.5, Math.PI);
  world.camera.angle = 2.55;
  world.routeMeters.front = 14;
  // Three leader-line notes, drawn only on this pose, so the still explains itself.
  world.callouts = true;
}

function hide(world) {
  const [a, b, c] = world.guards;
  freeze(world, 21.8);
  world.time = 33.2;
  world.stance = 'crouch';
  world.noise = 0.7;
  world.awareness = 14;
  world.hidden = true;
  world.player.x = 6.55;
  world.player.y = 7.6;
  world.player.angle = 1.2;
  place(a, 22.5, 2.5, 3.3);
  place(b, 6.5, 17.5, 0.05);
  place(c, 11.5, 6.5, 3.05);
  world.guards[2].alert = 0.14;
  world.camera.angle = 2.9;
  world.routeMeters.front = 9;
  world.routeMeters.vent = 3;
}

function close(world) {
  const [a, b, c] = world.guards;
  freeze(world, 30.2);
  world.time = 55.1;
  world.stance = 'walk';
  world.noise = 1.9;
  world.awareness = 74;
  world.nearMisses = 1;
  world.nearFlash = 0.85;
  world.alarm = 1;
  world.seenBy = 'guard';
  world.lastSeen = { x: 9.6, y: 9.3 };
  // Standing right under the middle lamp: lit, so every cone reaches three times as far.
  world.player.x = 9.6;
  world.player.y = 9.3;
  world.player.angle = 3.0;
  place(a, 25.5, 3.5, 3.2);
  place(b, 20.5, 17.5, 3.14);
  place(c, 11.5, 6.5, 1.86);
  world.guards[2].alert = 0.92;
  world.camera.angle = 2.65;
  world.camera.alert = 0.4;
  world.routeMeters.front = 16;
  world.routeMeters.vent = 6;
}

function win(world) {
  const [a, b, c] = world.guards;
  freeze(world, 44.6);
  world.phase = 'clean';
  world.time = 58.7;
  world.hasKey = true;
  world.awareness = 0;
  world.nearMisses = 2;
  world.stance = 'walk';
  world.player.x = 30.1;
  world.player.y = 17.4;
  world.player.angle = Math.PI;
  place(a, 26.5, 2.5, 3.05);
  place(b, 24.5, 16.5, 3.1);
  place(c, 14.5, 9.5, -1.2);
  world.camera.angle = 3.3;
  world.routeMeters.front = 12;
  world.routeMeters.service = 78;
  world.trail = [
    { x: 2.5, y: 2.5 }, { x: 2.5, y: 6 }, { x: 2.5, y: 9.5 }, { x: 2.2, y: 13 },
    { x: 2.5, y: 16.6 }, { x: 7, y: 16.6 }, { x: 12, y: 17.4 }, { x: 18, y: 17.2 },
    { x: 24, y: 16.6 }, { x: 27.2, y: 16.4 }, { x: 27.2, y: 15.2 }, { x: 27.3, y: 13.6 },
    { x: 27.2, y: 11.4 }, { x: 28.4, y: 11.2 }, { x: 29.2, y: 12.6 }, { x: 28.6, y: 14.4 },
    { x: 27.4, y: 15.4 }, { x: 27.6, y: 16.6 }, { x: 29.4, y: 17.2 }, { x: 30.1, y: 17.4 },
  ];
}

const POSES = { cover, hide, close, win };

export function applyPose(world, pose) {
  const build = POSES[pose];
  if (!build) return;
  build(world);
  // Poses freeze the tick, so the light rule is resolved once, here.
  world.lit = playerLit(world);
}

export function routeLabel(world) {
  const meters = world.routeMeters;
  let best = 'front';
  let value = -1;
  for (const name of Object.keys(ROUTES)) {
    if (meters[name] > value) {
      best = name;
      value = meters[name];
    }
  }
  return ROUTES[best].label;
}
