// The HUD: objective, awareness, legend, stance readout, and the two end cards.
import { AWARE, ROUTES, STANCE_LABEL, TILE } from './config.js';
import { PAL } from './art.js';
import { routeLabel } from './shots.js';

const MONO = 'ui-monospace, "SF Mono", Menlo, monospace';
const SANS = 'ui-sans-serif, system-ui, -apple-system, sans-serif';

function panel(ctx, x, y, w, h, alpha = 0.82) {
  ctx.save();
  ctx.fillStyle = `rgba(8,12,18,${alpha})`;
  ctx.strokeStyle = 'rgba(150,180,210,0.16)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  const r = 8;
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function label(ctx, text, x, y, color = PAL.dim, size = 10, font = MONO) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = `600 ${size}px ${font}`;
  ctx.textAlign = 'left';
  ctx.fillText(text, x, y);
  ctx.restore();
}

function mixed(ctx, parts, x, y, size = 13) {
  ctx.save();
  ctx.font = `500 ${size}px ${SANS}`;
  ctx.textAlign = 'left';
  let cursor = x;
  for (const [text, color] of parts) {
    ctx.fillStyle = color;
    ctx.fillText(text, cursor, y);
    cursor += ctx.measureText(text).width;
  }
  ctx.restore();
}

function swatchCrate(ctx, x, y) {
  ctx.save();
  ctx.fillStyle = PAL.crate;
  ctx.strokeStyle = PAL.crateEdge;
  ctx.lineWidth = 1.5;
  ctx.fillRect(x - 6, y - 6, 12, 12);
  ctx.strokeRect(x - 6, y - 6, 12, 12);
  ctx.strokeStyle = 'rgba(20,14,6,0.5)';
  ctx.beginPath();
  ctx.moveTo(x - 6, y);
  ctx.lineTo(x + 6, y);
  ctx.stroke();
  ctx.restore();
}

function swatchKey(ctx, x, y) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-0.3);
  ctx.fillStyle = PAL.key;
  ctx.beginPath();
  ctx.moveTo(0, -7);
  ctx.lineTo(6, 0);
  ctx.lineTo(0, 7);
  ctx.lineTo(-6, 0);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function swatchDoor(ctx, x, y) {
  ctx.save();
  ctx.strokeStyle = PAL.exit;
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 6, y - 7, 12, 14);
  ctx.fillStyle = 'rgba(65,220,176,0.22)';
  ctx.fillRect(x - 6, y - 7, 12, 14);
  ctx.restore();
}

function swatchCamera(ctx, x, y) {
  ctx.save();
  ctx.fillStyle = '#2c3948';
  ctx.strokeStyle = '#9fd4ff';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(x - 7, y - 5);
  ctx.lineTo(x + 3, y - 7);
  ctx.lineTo(x + 6, y);
  ctx.lineTo(x + 3, y + 7);
  ctx.lineTo(x - 7, y + 5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function swatchCone(ctx, x, y) {
  ctx.save();
  ctx.fillStyle = 'rgba(255,193,124,0.35)';
  ctx.strokeStyle = 'rgba(255,205,150,0.7)';
  ctx.beginPath();
  ctx.moveTo(x - 7, y + 6);
  ctx.lineTo(x + 7, y - 7);
  ctx.lineTo(x + 7, y + 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function swatchNoise(ctx, x, y) {
  ctx.save();
  ctx.strokeStyle = 'rgba(226,236,246,0.5)';
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function legendRow(ctx, items, y) {
  let x = 40;
  for (const [glyph, text] of items) {
    glyph(ctx, x, y - 3);
    label(ctx, text, x + 14, y, PAL.dim, 10.5);
    x += ctx.measureText(text).width + 46;
  }
}

function objective(world) {
  const key = world.hasKey ? 'in hand' : 'in the vault';
  return [
    ['OBJECTIVE  ', PAL.dim],
    ['take the ', PAL.text],
    ['GOLD VAULT KEY', PAL.gold],
    [' (' + key + '), then ', PAL.text],
    ['TEAL EXIT', PAL.teal],
    [' unseen', PAL.text],
  ];
}

function drawAwareness(ctx, world) {
  const x = 958;
  const y = 14;
  const w = 306;
  const h = 86;
  panel(ctx, x, y, w, h);
  label(ctx, world.hidden ? 'HIDDEN · METER DRAINING' : 'AWARENESS', x + 16, y + 24,
    world.hidden ? PAL.teal : PAL.dim, 10);

  const barX = x + 16;
  const barY = y + 34;
  const barW = w - 32;
  const barH = 16;
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  ctx.fillRect(barX, barY, barW, barH);

  const pct = world.awareness / 100;
  const fill = ctx.createLinearGradient(barX, 0, barX + barW, 0);
  if (world.awareness >= AWARE.nearMiss) {
    fill.addColorStop(0, '#f0c052');
    fill.addColorStop(1, '#ee5b41');
  } else {
    fill.addColorStop(0, '#4f8fbf');
    fill.addColorStop(1, '#8fbfe0');
  }
  ctx.fillStyle = fill;
  ctx.fillRect(barX, barY, barW * pct, barH);

  // 60% tick: the line that turns a look into a near miss.
  const tickX = barX + barW * (AWARE.nearMiss / 100);
  ctx.strokeStyle = 'rgba(238,91,65,0.8)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(tickX, barY - 4);
  ctx.lineTo(tickX, barY + barH + 4);
  ctx.stroke();
  ctx.fillStyle = 'rgba(238,91,65,0.9)';
  ctx.font = `600 9px ${MONO}`;
  ctx.textAlign = 'center';
  ctx.fillText('NEAR MISS', tickX, barY + barH + 16);

  ctx.fillStyle = PAL.text;
  ctx.font = `700 12px ${MONO}`;
  ctx.textAlign = 'right';
  ctx.fillText(Math.round(world.awareness) + '%', barX + barW, barY + 12);
  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.lineWidth = 1;
  ctx.strokeRect(barX, barY, barW, barH);

  const pace = STANCE_LABEL[world.stance] ?? 'WALK';
  const secs = world.time;
  const clock = `TIME ${String(Math.floor(secs / 60)).padStart(2, '0')}:${(secs % 60).toFixed(1).padStart(4, '0')}`;
  ctx.fillStyle = PAL.dim;
  ctx.font = `500 10.5px ${MONO}`;
  ctx.textAlign = 'left';
  ctx.fillText(`${clock}   ·   ${pace}   ·   NOISE ${world.noise.toFixed(1)}m`, barX, barY + barH + 18);
  ctx.restore();
}

function drawTitle(ctx, world) {
  const x = 16;
  const y = 14;
  const w = 520;
  const h = 86;
  panel(ctx, x, y, w, h);

  ctx.save();
  ctx.fillStyle = PAL.text;
  ctx.font = `700 17px ${SANS}`;
  ctx.textAlign = 'left';
  ctx.fillText('HUSH SHIFT', x + 16, y + 26);
  const width = ctx.measureText('HUSH SHIFT').width;
  ctx.fillStyle = PAL.dim;
  ctx.font = `500 9.5px ${MONO}`;
  ctx.fillText('ONE FLOOR · THREE WAYS · NO ALARM', x + 26 + width, y + 26);
  ctx.restore();

  mixed(ctx, objective(world), x + 16, y + 50, 12.5);

  ctx.save();
  ctx.font = `500 10px ${MONO}`;
  let chipX = x + 16;
  for (const [name, route] of Object.entries(ROUTES)) {
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    ctx.fillRect(chipX, y + 60, 96, 16);
    ctx.fillStyle = route.tint;
    ctx.fillRect(chipX, y + 60, 3, 16);
    ctx.fillStyle = PAL.dim;
    ctx.fillText(route.label, chipX + 8, y + 71.5);
    chipX += 102;
  }
  ctx.fillStyle = PAL.dim;
  ctx.fillText('WASD MOVE · SHIFT SPRINT · CTRL CROUCH · R RESTART', x + 16, y + 78);
  ctx.restore();
}

function drawLegend(ctx) {
  const x = 16;
  const y = 674;
  const w = 520;
  const h = 112;
  panel(ctx, x, y, w, h);
  label(ctx, 'LEGEND', x + 16, y + 20, PAL.dim, 10);
  legendRow(ctx, [[swatchCrate, 'COVER · blocks sight'], [swatchKey, 'GOLD VAULT KEY'], [swatchDoor, 'TEAL EXIT']], y + 42);
  legendRow(ctx, [[swatchCamera, 'CEILING CAMERA · sees over cover'], [swatchCone, 'VISION CONE'], [swatchNoise, 'NOISE RADIUS']], y + 68);
  label(ctx, 'crates, desks and pillars stop a cone; the camera sweeps above them.', x + 16, y + 94, 'rgba(133,149,166,0.75)', 10);
}

function card(ctx, accent, title, lines, hint) {
  const w = 640;
  const h = 300;
  const x = (ctx.canvas.width - w) / 2;
  const y = (ctx.canvas.height - h) / 2;
  ctx.save();
  ctx.fillStyle = 'rgba(4,7,11,0.72)';
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  panel(ctx, x, y, w, h, 0.94);
  ctx.fillStyle = accent;
  ctx.fillRect(x, y + 18, 4, h - 36);

  ctx.fillStyle = accent;
  ctx.font = `800 44px ${SANS}`;
  ctx.textAlign = 'left';
  ctx.fillText(title, x + 40, y + 78);

  ctx.font = `500 14px ${SANS}`;
  let ly = y + 118;
  for (const line of lines) {
    ctx.fillStyle = PAL.dim;
    ctx.fillText(line, x + 40, ly);
    ly += 26;
  }

  ctx.fillStyle = PAL.text;
  ctx.font = `500 13px ${SANS}`;
  ctx.fillText(hint, x + 40, y + h - 38);
  ctx.restore();
}

export function drawHud(ctx, world) {
  drawTitle(ctx, world);
  drawAwareness(ctx, world);
  drawLegend(ctx);

  const x = 956;
  const y = 112;
  const w = 308;
  panel(ctx, x, y, w, 54, 0.7);
  label(ctx, 'GOLD KEY', x + 16, y + 20, PAL.dim, 9.5);
  label(ctx, world.hasKey ? 'IN HAND — the teal exit is live' : 'IN THE VAULT (east wing)',
    x + 16, y + 38, world.hasKey ? PAL.teal : PAL.gold, 10.5);

  if (world.phase === 'caught') {
    card(ctx, PAL.alert, 'CAUGHT', [
      'The alarm went up and the floor lights came on.',
      `You were ${world.hasKey ? 'carrying the gold key' : 'still short of the vault'} after ${world.time.toFixed(1)}s.`,
    ], 'Press R to run the floor again — try the other corridor.');
    return;
  }

  if (world.phase === 'clean') {
    const near = world.nearMisses;
    card(ctx, PAL.exit, 'CLEAN EXIT', [
      `Out with the gold vault key in ${world.time.toFixed(1)} seconds.`,
      `Route taken: ${routeLabel(world)}.`,
      near === 0 ? 'No alarm raised, no cone ever reached you.' : `Near misses survived: ${near}.`,
    ], 'Press R to run another route through the same floor.');
  }
}

export { routeLabel };
