// The HUD lives in two letterbox strips, so nothing ever covers the floor:
// top strip for objective, awareness and status, bottom strip for the legend.
import { AWARE, HUD_BOTTOM, HUD_TOP, ROUTES, STANCE_LABEL, VIEW_H, VIEW_W } from './config.js';
import { PAL } from './art.js';
import { routeLabel } from './shots.js';

const MONO = 'ui-monospace, "SF Mono", Menlo, monospace';
const SANS = 'ui-sans-serif, system-ui, -apple-system, sans-serif';

function text(ctx, value, x, y, color, size, font = SANS, align = 'left') {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = `600 ${size}px ${font}`;
  ctx.textAlign = align;
  ctx.fillText(value, x, y);
  ctx.restore();
}

function mixed(ctx, parts, x, y, size) {
  ctx.save();
  ctx.font = `500 ${size}px ${SANS}`;
  ctx.textAlign = 'left';
  let cursor = x;
  for (const [value, color] of parts) {
    ctx.fillStyle = color;
    ctx.fillText(value, cursor, y);
    cursor += ctx.measureText(value).width;
  }
  ctx.restore();
}

function rule(ctx, y) {
  ctx.save();
  ctx.strokeStyle = 'rgba(150,180,210,0.14)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, y + 0.5);
  ctx.lineTo(ctx.canvas.width, y + 0.5);
  ctx.stroke();
  ctx.restore();
}

function crate(ctx, x, y) {
  ctx.save();
  ctx.fillStyle = PAL.crate;
  ctx.strokeStyle = PAL.crateEdge;
  ctx.lineWidth = 1.4;
  ctx.fillRect(x - 6, y - 6, 12, 12);
  ctx.strokeRect(x - 6, y - 6, 12, 12);
  ctx.strokeStyle = 'rgba(20,14,6,0.55)';
  ctx.beginPath();
  ctx.moveTo(x - 6, y);
  ctx.lineTo(x + 6, y);
  ctx.stroke();
  ctx.restore();
}

function diamond(ctx, x, y) {
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

function door(ctx, x, y) {
  ctx.save();
  ctx.fillStyle = 'rgba(65,220,176,0.22)';
  ctx.fillRect(x - 6, y - 7, 12, 14);
  ctx.strokeStyle = PAL.exit;
  ctx.lineWidth = 1.8;
  ctx.strokeRect(x - 6, y - 7, 12, 14);
  ctx.restore();
}

function camera(ctx, x, y) {
  ctx.save();
  ctx.fillStyle = '#2c3948';
  ctx.strokeStyle = '#9fd4ff';
  ctx.lineWidth = 1.3;
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

function cone(ctx, x, y) {
  ctx.save();
  ctx.fillStyle = 'rgba(255,193,124,0.32)';
  ctx.strokeStyle = 'rgba(255,205,150,0.75)';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(x - 6, y + 6);
  ctx.lineTo(x + 7, y - 7);
  ctx.lineTo(x + 7, y + 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function ring(ctx, x, y) {
  ctx.save();
  ctx.strokeStyle = 'rgba(226,236,246,0.55)';
  ctx.setLineDash([3, 3]);
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.arc(x, y, 6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

const LEGEND = [
  [crate, 'COVER · stops a cone'],
  [diamond, 'GOLD VAULT KEY'],
  [door, 'TEAL EXIT'],
  [camera, 'CEILING CAMERA · sees over cover'],
  [cone, 'VISION CONE'],
  [ring, 'NOISE RADIUS'],
];

// A small chip: glyph, then name, then the tint of the thing it names.
function chip(ctx, glyph, label, x, y, tint) {
  ctx.save();
  ctx.font = `600 8.5px ${MONO}`;
  const w = Math.round(22 + ctx.measureText(label).width + 8);
  ctx.fillStyle = 'rgba(255,255,255,0.055)';
  ctx.beginPath();
  ctx.roundRect(x, y, w, 16, 3);
  ctx.fill();
  ctx.fillStyle = tint;
  ctx.fillRect(x, y, 3, 16);
  ctx.save();
  ctx.translate(x + 12, y + 8);
  ctx.scale(0.72, 0.72);
  glyph(ctx, 0, 0);
  ctx.restore();
  ctx.fillStyle = 'rgba(214,226,238,0.9)';
  ctx.fillText(label, x + 21, y + 11.4);
  ctx.restore();
  return w;
}

function routeChip(ctx, route, x, y) {
  ctx.save();
  ctx.font = `500 8.5px ${MONO}`;
  const w = Math.round(12 + ctx.measureText(route.label).width);
  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  ctx.fillRect(x, y, w, 16);
  ctx.fillStyle = route.tint;
  ctx.fillRect(x, y, 3, 16);
  ctx.fillStyle = PAL.dim;
  ctx.fillText(route.label, x + 9, y + 11.4);
  ctx.restore();
  return w;
}

function drawTopStrip(ctx, world) {
  ctx.save();
  ctx.fillStyle = '#0a0f16';
  ctx.fillRect(0, 0, ctx.canvas.width, HUD_TOP);
  ctx.restore();
  rule(ctx, HUD_TOP - 1);

  text(ctx, 'HUSH SHIFT', 22, 32, PAL.text, 20, SANS);
  text(ctx, 'ONE FLOOR · THREE WAYS TO THE GOLD VAULT KEY', 22, 52, PAL.dim, 9.5, MONO);

  const objective = world.hasKey
    ? [
      ['OBJECTIVE  ', PAL.dim],
      ['key in hand · reach the ', PAL.text],
      ['TEAL EXIT', PAL.teal],
      [' unseen', PAL.text],
    ]
    : [
      ['OBJECTIVE  ', PAL.dim],
      ['grab the ', PAL.text],
      ['GOLD VAULT KEY', PAL.gold],
      [' in the vault, then the ', PAL.text],
      ['TEAL EXIT', PAL.teal],
      [' unseen', PAL.text],
    ];
  mixed(ctx, objective, 430, 30, 11.5);

  // Under the objective: what the floor is made of (cover, key, exit), then the three ways in.
  let chipX = 430;
  const chipY = 40;
  chipX += chip(ctx, crate, 'COVER', chipX, chipY, PAL.crate) + 7;
  chipX += chip(ctx, diamond, 'VAULT KEY', chipX, chipY, PAL.key) + 7;
  chipX += chip(ctx, door, 'EXIT', chipX, chipY, PAL.teal) + 16;
  for (const route of Object.values(ROUTES)) chipX += routeChip(ctx, route, chipX, chipY) + 6;

  // Awareness meter, with the 60% line marked: past it a cone becomes a near miss.
  const barX = 966;
  const barW = 292;
  const barY = 22;
  const barH = 14;
  text(ctx, 'AWARENESS', barX, barY - 4, PAL.dim, 9.5, MONO);
  if (world.hidden) {
    const labelX = barX + 78;
    ctx.save();
    ctx.fillStyle = 'rgba(67,220,178,0.16)';
    ctx.fillRect(labelX, barY - 12, 62, 11);
    ctx.fillStyle = PAL.teal;
    ctx.font = `700 9px ${MONO}`;
    ctx.fillText('HIDDEN', labelX + 7, barY - 4);
    ctx.restore();
  }
  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.07)';
  ctx.fillRect(barX, barY, barW, barH);
  // The far side of 60 is the danger zone: shade it before the fill goes on.
  const tick = barX + barW * (AWARE.nearMiss / 100);
  ctx.fillStyle = 'rgba(238,91,65,0.07)';
  ctx.fillRect(tick, barY, barX + barW - tick, barH);
  const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
  if (world.awareness >= AWARE.nearMiss) {
    grad.addColorStop(0, '#f0c052');
    grad.addColorStop(1, '#ee5b41');
  } else {
    grad.addColorStop(0, '#4f8fbf');
    grad.addColorStop(1, '#9fd0ec');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(barX, barY, barW * (world.awareness / 100), barH);

  // The 60% threshold: a bright tick with a caret, the line a near miss starts at.
  ctx.strokeStyle = 'rgba(238,91,65,0.9)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(tick, barY - 3);
  ctx.lineTo(tick, barY + barH + 3);
  ctx.stroke();
  ctx.fillStyle = 'rgba(238,91,65,0.95)';
  ctx.beginPath();
  ctx.moveTo(tick, barY - 2);
  ctx.lineTo(tick - 3.4, barY - 7.5);
  ctx.lineTo(tick + 3.4, barY - 7.5);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.22)';
  ctx.strokeRect(barX, barY, barW, barH);
  ctx.fillStyle = 'rgba(238,91,65,0.85)';
  ctx.font = `700 8px ${MONO}`;
  ctx.textAlign = 'center';
  ctx.fillText('60', tick, barY + barH + 9);
  ctx.fillStyle = 'rgba(238,91,65,0.55)';
  ctx.fillText('100', barX + barW - 12, barY + barH + 9);
  ctx.fillStyle = PAL.text;
  ctx.font = `700 11px ${MONO}`;
  ctx.textAlign = 'right';
  ctx.fillText(Math.round(world.awareness) + '%', barX + barW - 6, barY + 11);
  ctx.restore();

  const mm = String(Math.floor(world.time / 60)).padStart(2, '0');
  const ss = (world.time % 60).toFixed(1).padStart(4, '0');
  const danger = world.awareness >= AWARE.nearMiss ? `   NEAR MISS ${world.nearMisses}` : '';
  const status = `TIME ${mm}:${ss}   ${STANCE_LABEL[world.stance] ?? 'WALK'}   NOISE ${world.noise.toFixed(1)}m${danger}`;
  text(ctx, status, barX, 56, PAL.dim, 9.5, MONO);
}

function drawBottomStrip(ctx, world) {
  const y0 = ctx.canvas.height - HUD_BOTTOM;
  ctx.save();
  ctx.fillStyle = '#0a0f16';
  ctx.fillRect(0, y0, ctx.canvas.width, HUD_BOTTOM);
  ctx.restore();
  rule(ctx, y0);

  let x = 22;
  ctx.save();
  ctx.font = `500 10px ${MONO}`;
  for (const [glyph, title] of LEGEND) {
    glyph(ctx, x, y0 + 22);
    ctx.fillStyle = 'rgba(190,206,222,0.92)';
    ctx.fillText(title, x + 16, y0 + 25);
    x += ctx.measureText(title).width + 22;
    if (x < 900) {
      ctx.fillStyle = 'rgba(150,180,210,0.3)';
      ctx.fillText('|', x, y0 + 25);
      x += 22;
    } else {
      x += 24;
    }
  }
  ctx.strokeStyle = 'rgba(150,180,210,0.18)';
  ctx.beginPath();
  ctx.moveTo(x - 8, y0 + 12);
  ctx.lineTo(x - 8, y0 + 32);
  ctx.stroke();
  ctx.restore();

  text(ctx, 'WASD move · SHIFT sprint (loud) · CTRL crouch (quiet) · R restart',
    ctx.canvas.width - 22, y0 + 25, PAL.dim, 10, MONO, 'right');
  text(ctx, 'Gold light marks the vault key, teal light marks the exit; crossed sight lines raise the alarm.',
    22, y0 + 50, 'rgba(133,149,166,0.72)', 10, MONO);

  if (world.phase === 'caught') {
    card(ctx, PAL.alert, 'CAUGHT', [
      'The alarm went up and the floor lights came on.',
      `You were ${world.hasKey ? 'carrying the gold key' : 'still short of the vault'} after ${world.time.toFixed(1)}s.`,
    ], 'Press R to run the floor again, and try another corridor.');
    return;
  }

  if (world.phase === 'clean') {
    const near = world.nearMisses;
    card(ctx, PAL.exit, near === 0 ? 'CLEAN EXIT' : 'EXIT MADE', [
      `Out with the gold vault key in ${world.time.toFixed(1)} seconds.`,
      `Route taken: ${routeLabel(world)}, traced behind this card.`,
      near === 0 ? 'The alarm never went up: no cone ever held you.' : `Cones held you ${near} time${near === 1 ? '' : 's'}; the meter never filled.`,
    ], 'Press R to run another route through the same floor.');
  }
}

function card(ctx, accent, title, lines, hint) {
  const w = 660;
  const h = 288;
  const x = (VIEW_W - w) / 2;
  const y = HUD_TOP + (VIEW_H - h) / 2;

  ctx.save();
  ctx.fillStyle = 'rgba(4,7,11,0.62)';
  ctx.fillRect(0, HUD_TOP, VIEW_W, VIEW_H);
  ctx.fillStyle = 'rgba(10,15,22,0.97)';
  ctx.strokeStyle = 'rgba(150,180,210,0.22)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = accent;
  ctx.fillRect(x, y + 16, 4, h - 32);

  ctx.fillStyle = accent;
  ctx.font = `800 42px ${SANS}`;
  ctx.textAlign = 'left';
  ctx.fillText(title, x + 36, y + 74);

  ctx.font = `500 14px ${SANS}`;
  let lineY = y + 116;
  for (const line of lines) {
    ctx.fillStyle = 'rgba(200,212,226,0.88)';
    ctx.fillText(line, x + 36, lineY);
    lineY += 26;
  }

  ctx.fillStyle = PAL.dim;
  ctx.font = `500 12.5px ${SANS}`;
  ctx.fillText(hint, x + 36, y + h - 34);
  ctx.restore();
}

export function drawHud(ctx, world) {
  drawTopStrip(ctx, world);
  drawBottomStrip(ctx, world);
}
