// The moving parts: guard bodies and their clipped cones, the ceiling camera, the player,
// the noise ring, and the red near-miss edge.
import { AWARE, TILE } from './config.js';
import { conePolygon, isWall } from './level.js';
import { PAL } from './art.js';

function conePath(ctx, pts) {
  ctx.beginPath();
  ctx.moveTo(pts[0].x * TILE, pts[0].y * TILE);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x * TILE, pts[i].y * TILE);
  ctx.closePath();
}

export function drawGuardCone(ctx, g) {
  const pts = conePolygon(g.x, g.y, g.angle, g.fov, g.range);
  const hot = g.alert > 0.45;
  const cx = g.x * TILE;
  const cy = g.y * TILE;
  const grad = ctx.createRadialGradient(cx, cy, 8, cx, cy, g.range * TILE);
  const base = hot ? '238,91,65' : '255,193,124';
  grad.addColorStop(0, `rgba(${base},${hot ? 0.4 : 0.3})`);
  grad.addColorStop(0.55, `rgba(${base},${hot ? 0.2 : 0.13})`);
  grad.addColorStop(1, `rgba(${base},0.015)`);

  ctx.save();
  conePath(ctx, pts);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = hot ? 'rgba(238,91,65,0.75)' : 'rgba(255,205,150,0.4)';
  ctx.lineWidth = hot ? 2 : 1.4;
  ctx.stroke();
  ctx.restore();
}

export function drawCameraCone(ctx, cam) {
  const pts = conePolygon(cam.x, cam.y, cam.angle, cam.fov, cam.range, 20, isWall);
  const cx = cam.x * TILE;
  const cy = cam.y * TILE;
  const grad = ctx.createRadialGradient(cx, cy, 6, cx, cy, cam.range * TILE);
  const hot = cam.alert > 0.4;
  const base = hot ? '238,91,65' : '150,200,255';
  grad.addColorStop(0, `rgba(${base},0.34)`);
  grad.addColorStop(0.6, `rgba(${base},0.15)`);
  grad.addColorStop(1, `rgba(${base},0.01)`);

  ctx.save();
  conePath(ctx, pts);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = `rgba(${base},0.6)`;
  ctx.setLineDash([9, 5]);
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.restore();
}

export function drawGuard(ctx, g) {
  const x = g.x * TILE;
  const y = g.y * TILE;
  ctx.save();

  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.ellipse(x + 2, y + 7, 14, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  if (g.alert > 0.3) {
    ctx.strokeStyle = `rgba(238,91,65,${0.3 + g.alert * 0.55})`;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(x, y, 16 + g.alert * 3, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(g.angle);

  // Shoulders, then the head: a guard reads as a person, not a dot.
  ctx.fillStyle = PAL.guardDark;
  ctx.beginPath();
  ctx.ellipse(-1, 0, 12, 9.5, 0, 0, Math.PI * 2);
  ctx.fill();

  const body = ctx.createRadialGradient(0, -4, 2, 0, 0, 12);
  body.addColorStop(0, '#f39a7b');
  body.addColorStop(1, PAL.guard);
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(1, 0, 9.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(30,10,6,0.85)';
  ctx.lineWidth = 1.8;
  ctx.stroke();

  // Peak of the cap points the way the guard looks.
  ctx.fillStyle = PAL.guardDark;
  ctx.beginPath();
  ctx.moveTo(14, 0);
  ctx.lineTo(4, -6);
  ctx.lineTo(4, 6);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = 'rgba(255,240,230,0.85)';
  ctx.beginPath();
  ctx.arc(2, -2.5, 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = 'rgba(12,7,4,0.95)';
  ctx.font = '700 10px ui-monospace, Menlo, monospace';
  ctx.textAlign = 'center';
  ctx.fillText(g.id, x - 1, y + 3.5);
  ctx.restore();
}

export function drawCamera(ctx, cam) {
  const x = cam.x * TILE;
  const y = cam.y * TILE;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(cam.angle);
  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.ellipse(2, 6, 15, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#2c3948';
  ctx.strokeStyle = cam.alert > 0.4 ? PAL.alert : 'rgba(170,205,235,0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-11, -9);
  ctx.lineTo(9, -13);
  ctx.lineTo(13, 0);
  ctx.lineTo(9, 13);
  ctx.lineTo(-11, 9);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#0b1219';
  ctx.beginPath();
  ctx.arc(11, 0, 5.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = cam.alert > 0.4 ? PAL.alert : '#9fd4ff';
  ctx.beginPath();
  ctx.arc(11, 0, 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.fillStyle = 'rgba(180,215,255,0.85)';
  ctx.font = '700 9px ui-monospace, Menlo, monospace';
  ctx.textAlign = 'center';
  ctx.fillText('CAM', x, y + 26);
  ctx.restore();
}

export function drawPlayer(ctx, world) {
  const p = world.player;
  const x = p.x * TILE;
  const y = p.y * TILE;
  const crouched = world.stance === 'crouch' || world.stance === 'vent';
  ctx.save();

  if (world.stance === 'sprint') {
    ctx.strokeStyle = 'rgba(233,240,248,0.28)';
    ctx.lineWidth = 2;
    for (let i = 1; i <= 2; i++) {
      ctx.beginPath();
      ctx.arc(x - Math.cos(p.angle) * (10 + i * 7), y - Math.sin(p.angle) * (10 + i * 7), 8, p.angle + 0.8, p.angle - 0.8);
      ctx.stroke();
    }
  }

  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.beginPath();
  ctx.ellipse(x + 1, y + 6, crouched ? 9 : 11, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  const rad = crouched ? 9 : 11.5;
  const body = ctx.createRadialGradient(x - 3, y - 4, 2, x, y, rad + 2);
  body.addColorStop(0, '#ffffff');
  body.addColorStop(1, PAL.player);
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.arc(x, y, rad, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = PAL.playerDark;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Hood points where the player is looking.
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(p.angle);
  ctx.fillStyle = PAL.playerDark;
  ctx.beginPath();
  ctx.moveTo(rad - 2, 0);
  ctx.lineTo(rad - 8, -4.5);
  ctx.lineTo(rad - 8, 4.5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  if (world.hidden) {
    ctx.strokeStyle = 'rgba(196,255,238,0.7)';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(x, y, rad + 5, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(196,255,238,0.9)';
    ctx.font = '700 10px ui-monospace, Menlo, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('HIDDEN', x, y - rad - 12);
  }
  ctx.restore();
}

export function drawNoise(ctx, world) {
  const p = world.player;
  if (world.noise <= 0.25) return;
  const radius = world.noise * TILE * 1.15;
  const loud = world.stance === 'sprint';
  ctx.save();
  ctx.strokeStyle = loud ? 'rgba(238,91,65,0.4)' : 'rgba(226,236,246,0.2)';
  ctx.lineWidth = loud ? 2.5 : 1.5;
  ctx.setLineDash(loud ? [12, 8] : [5, 8]);
  ctx.beginPath();
  ctx.arc(p.x * TILE, p.y * TILE, radius + Math.sin(world.clock * 6) * 2, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

export function drawEffects(ctx, world) {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  if (world.phase === 'play' && world.awareness >= AWARE.nearMiss) {
    const heat = (world.awareness - AWARE.nearMiss) / (AWARE.caught - AWARE.nearMiss);
    const pulse = 0.35 + 0.25 * Math.sin(world.clock * 9) + world.nearFlash * 0.4;
    const alpha = Math.min(0.75, 0.2 + heat * 0.5 + pulse * 0.15);
    const grad = ctx.createRadialGradient(width / 2, height / 2, height * 0.28, width / 2, height / 2, height * 0.78);
    grad.addColorStop(0, 'rgba(238,91,65,0)');
    grad.addColorStop(1, `rgba(238,91,65,${alpha})`);
    ctx.save();
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  }
}
