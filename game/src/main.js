// Entry point: build the floor, run the frame loop, and hand events to sound and HUD.
import { AWARE, CANVAS_H, CANVAS_W, HUD_TOP } from './config.js';
import { createState } from './state.js';
import { bindInput, readMove } from './input.js';
import { updatePlayer } from './player.js';
import { updateGuards } from './patrol.js';
import { updateVision } from './vision.js';
import { paintFloor, paintPatrolPaths, paintProps, paintLightmap } from './art.js';
import {
  drawCamera,
  drawCameraCone,
  drawEffects,
  drawGuard,
  drawGuardCone,
  drawTrail,
  drawNoise,
  drawPlayer,
} from './actors.js';
import { drawHud } from './hud.js';
import {
  alarmTick,
  caughtStinger,
  cleanStinger,
  guardStep,
  initAudio,
  keyChime,
  nearMiss,
  playerStep,
  resumeAudio,
} from './audio.js';
import { applyPose } from './shots.js';

const canvas = document.getElementById('floor');
canvas.width = CANVAS_W;
canvas.height = CANVAS_H;
const ctx = canvas.getContext('2d');
const pose = new URLSearchParams(location.search).get('shot');

function freshWorld() {
  const world = createState();
  if (pose) applyPose(world, pose);
  return world;
}

let world = freshWorld();
initAudio();

bindInput({
  onRestart: () => {
    world = freshWorld();
  },
  onFirstKey: resumeAudio,
});

function playSounds(events) {
  for (const event of events) {
    if (event.type === 'step') playerStep(event.stance);
    else if (event.type === 'guardStep') guardStep(event.guard, world.player);
    else if (event.type === 'nearMiss') nearMiss();
    else if (event.type === 'key') keyChime();
    else if (event.type === 'caught') caughtStinger();
    else if (event.type === 'clean') cleanStinger();
  }
}

function tick(dt) {
  world.clock += dt;
  if (world.phase !== 'play') return;
  world.time += dt;

  const events = [];
  updatePlayer(world, dt, readMove(), events);
  updateGuards(world, dt, events);
  const sightEvents = updateVision(world, dt);
  events.push(...sightEvents);

  if (world.awareness >= AWARE.nearMiss && world.phase === 'play') alarmTick();
  playSounds(events);
}

function draw() {
  ctx.save();
  ctx.translate(0, HUD_TOP);
  paintFloor(ctx, world);
  paintPatrolPaths(ctx);
  paintProps(ctx, world);
  paintLightmap(ctx, world);

  drawTrail(ctx, world);
  drawCameraCone(ctx, world.camera);
  for (const guard of world.guards) drawGuardCone(ctx, guard);

  drawCamera(ctx, world.camera);
  for (const guard of world.guards) drawGuard(ctx, guard);
  drawNoise(ctx, world);
  drawPlayer(ctx, world);
  ctx.restore();

  drawHud(ctx, world);
  drawEffects(ctx, world);
}

let last = performance.now();

function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
  last = now;
  if (pose) {
    // A posed screenshot keeps its actors still; only the small animations advance.
    world.clock += dt * 0.6;
  } else {
    tick(dt);
  }
  draw();
  requestAnimationFrame(frame);
}

requestAnimationFrame(frame);
