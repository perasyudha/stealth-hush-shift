// The still parts of the floor: tiles, walls, crates, desks, pillars, vent grates,
// the gold key, the teal exit door, door jambs, stencils, and the night light map.
import { COLS, GUARDS, ROWS, TILE, VIEW_H, VIEW_W, ROUTES } from './config.js';
import { DOORS, MAP } from './config.js';
import { isCover, isVent, isWall } from './level.js';

export const PAL = {
  ink: '#070a0f',
  floorA: '#121924',
  floorB: '#0f141d',
  vaultA: '#1b1f26',
  vaultB: '#181c22',
  serviceA: '#131a1c',
  serviceB: '#101617',
  vent: '#0b1015',
  wall: '#232c39',
  wallTop: '#3a4657',
  wallEdge: 'rgba(180,210,235,0.16)',
  crate: '#4f6076',
  crateDark: '#3b4a5c',
  crateEdge: '#67798f',
  desk: '#33404b',
  deskTop: '#41505d',
  paper: 'rgba(226,236,246,0.55)',
  pillar: '#38434f',
  pillarTop: '#4b5764',
  ventLip: 'rgba(150,180,205,0.22)',
  key: '#f4c455',
  keyDeep: '#b8862a',
  exit: '#41dcb0',
  exitDeep: '#128f74',
  guard: '#d9644a',
  guardDark: '#3a160f',
  player: '#e9f0f8',
  playerDark: '#2b3948',
  cone: 'rgba(255,193,124,',
  camera: 'rgba(160,205,255,',
  alert: '#ee5b41',
  text: '#e6edf5',
  dim: '#8595a6',
  gold: '#f0c052',
  teal: '#43dcb2',
};

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function zoneOf(x, y) {
  if (x >= 24 && y >= 9 && y <= 13) return 'vault';
  if (y >= 16) return 'service';
  return 'floor';
}

// A stable per-tile hash: the floor keeps the same grain in every frame and every still.
function grain(x, y) {
  let h = Math.imul(x + 0x9e37, 374761393) ^ Math.imul(y + 0x85eb, 668265263);
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const shades = new Map();

// Nudge a hex tone up or down, so one tile is a touch warmer or cooler than its neighbour.
function shade(hex, amount) {
  const key = `${hex}:${amount.toFixed(3)}`;
  const hit = shades.get(key);
  if (hit) return hit;
  const value = parseInt(hex.slice(1), 16);
  const channel = (shift) => {
    const base = (value >> shift) & 0xff;
    const moved = Math.round(base * (1 + amount) + (amount > 0 ? amount * 26 : amount * 8));
    return Math.min(255, Math.max(0, moved));
  };
  const out = `rgb(${channel(16)},${channel(8)},${channel(0)})`;
  shades.set(key, out);
  return out;
}

export function paintFloor(ctx, world) {
  ctx.fillStyle = PAL.ink;
  ctx.fillRect(0, 0, VIEW_W, VIEW_H);

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const ch = MAP[y][x];
      if (isWall(ch)) continue;
      const px = x * TILE;
      const py = y * TILE;
      const even = (x + y) % 2 === 0;
      const zone = zoneOf(x, y);
      const tone = (grain(x, y) - 0.5) * 0.17;

      let base;
      if (isVent(ch)) base = PAL.vent;
      else if (zone === 'vault') base = even ? PAL.vaultA : PAL.vaultB;
      else if (zone === 'service') base = even ? PAL.serviceA : PAL.serviceB;
      else base = even ? PAL.floorA : PAL.floorB;

      ctx.fillStyle = shade(base, tone);
      ctx.fillRect(px, py, TILE, TILE);

      // Grout: a dark seam on the top and left, a hairline catch on the far edges.
      ctx.strokeStyle = 'rgba(3,6,10,0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px + 0.5, py);
      ctx.lineTo(px + 0.5, py + TILE);
      ctx.moveTo(px, py + 0.5);
      ctx.lineTo(px + TILE, py + 0.5);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(186,214,240,0.045)';
      ctx.beginPath();
      ctx.moveTo(px + TILE - 0.5, py);
      ctx.lineTo(px + TILE - 0.5, py + TILE);
      ctx.moveTo(px, py + TILE - 0.5);
      ctx.lineTo(px + TILE, py + TILE - 0.5);
      ctx.stroke();
    }
  }

  // Every fourth seam is a drawn grid line, with a surveyor's tick at the crossings:
  // the plan reads as a blueprint rather than a set of flat squares.
  ctx.save();
  ctx.strokeStyle = 'rgba(126,170,212,0.06)';
  ctx.lineWidth = 1;
  for (let x = 4; x < COLS; x += 4) {
    ctx.beginPath();
    ctx.moveTo(x * TILE + 0.5, 0);
    ctx.lineTo(x * TILE + 0.5, VIEW_H);
    ctx.stroke();
  }
  for (let y = 4; y < ROWS; y += 4) {
    ctx.beginPath();
    ctx.moveTo(0, y * TILE + 0.5);
    ctx.lineTo(VIEW_W, y * TILE + 0.5);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(158,196,230,0.1)';
  for (let y = 4; y < ROWS; y += 4) {
    for (let x = 4; x < COLS; x += 4) {
      const cx = x * TILE;
      const cy = y * TILE;
      if (isWall(MAP[y][x])) continue;
      ctx.beginPath();
      ctx.moveTo(cx - 5, cy);
      ctx.lineTo(cx + 5, cy);
      ctx.moveTo(cx, cy - 5);
      ctx.lineTo(cx, cy + 5);
      ctx.stroke();
    }
  }
  ctx.restore();

  // Warehouse grating and the long service run get a floor texture, not flat squares.
  ctx.save();
  ctx.strokeStyle = 'rgba(190,215,240,0.055)';
  ctx.lineWidth = 1;
  for (let y = 6; y <= 9; y++) {
    for (let x = 3; x <= 22; x++) {
      if (isWall(MAP[y][x])) continue;
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const ly = y * TILE + 9 + i * 9;
        ctx.moveTo(x * TILE + 6, ly);
        ctx.lineTo(x * TILE + TILE - 6, ly);
      }
      ctx.stroke();
    }
  }
  ctx.restore();
}

// Faint dotted patrol lines: the route a guard walks is learnable from the floor.
export function paintPatrolPaths(ctx) {
  ctx.save();
  for (const guard of GUARDS) {
    const tint = ROUTES[guard.route]?.tint ?? '#9fc0e6';
    ctx.strokeStyle = tint;
    ctx.globalAlpha = 0.22;
    ctx.setLineDash([4, 9]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    guard.path.forEach(([x, y], index) => {
      if (index === 0) ctx.moveTo(x * TILE, y * TILE);
      else ctx.lineTo(x * TILE, y * TILE);
    });
    ctx.closePath();
    ctx.stroke();
  }
  ctx.restore();
}

function paintDoorMat(ctx, x, y) {
  const px = x * TILE;
  const py = y * TILE;
  ctx.save();
  ctx.fillStyle = 'rgba(150,205,240,0.2)';
  ctx.fillRect(px + 5, py + 5, TILE - 10, TILE - 10);
  ctx.strokeStyle = 'rgba(180,225,255,0.55)';
  ctx.setLineDash([3, 4]);
  ctx.lineWidth = 1.2;
  ctx.strokeRect(px + 6.5, py + 6.5, TILE - 13, TILE - 13);
  ctx.restore();
}

function paintWall(ctx, x, y) {
  const px = x * TILE;
  const py = y * TILE;
  ctx.fillStyle = PAL.wall;
  ctx.fillRect(px, py, TILE, TILE);
  ctx.fillStyle = PAL.wallTop;
  ctx.fillRect(px, py, TILE, 5);
  ctx.fillStyle = 'rgba(0,0,0,0.22)';
  ctx.fillRect(px, py + TILE - 4, TILE, 4);
  ctx.strokeStyle = PAL.wallEdge;
  ctx.strokeRect(px + 0.5, py + 0.5, TILE - 1, TILE - 1);

  // A soft cast shadow on the floor below and right of a wall reads as height.
  if (!isWall(MAP[y + 1]?.[x])) {
    const grad = ctx.createLinearGradient(0, py + TILE, 0, py + TILE + 26);
    grad.addColorStop(0, 'rgba(0,0,0,0.5)');
    grad.addColorStop(0.4, 'rgba(0,0,0,0.22)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(px, py + TILE, TILE, 26);
  }
  if (!isWall(MAP[y]?.[x + 1])) {
    const side = ctx.createLinearGradient(px + TILE, 0, px + TILE + 14, 0);
    side.addColorStop(0, 'rgba(0,0,0,0.34)');
    side.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = side;
    ctx.fillRect(px + TILE, py, 14, TILE);
  }
}

function paintCrate(ctx, x, y) {
  const px = x * TILE;
  const py = y * TILE;
  // Slight size jitter per tile: the yard was stacked by hand, not by a grid tool.
  const inset = 3 + grain(x, y) * 4;
  const radius = 3 + grain(y, x) * 2;
  const lean = (grain(x + 7, y + 3) - 0.5) * 3;
  const w = TILE - inset * 2;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(px + inset + 4, py + inset + 6, w - 3, w - 3);
  const grad = ctx.createLinearGradient(px + inset, py + inset, px + inset + w, py + inset + w);
  grad.addColorStop(0, PAL.crateEdge);
  grad.addColorStop(0.45, PAL.crate);
  grad.addColorStop(1, PAL.crateDark);
  ctx.fillStyle = grad;
  rr(ctx, px + inset, py + inset, w, w, radius);
  ctx.fill();
  ctx.strokeStyle = 'rgba(10,16,24,0.6)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(10,16,24,0.34)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(px + inset + 2, py + inset + w * 0.36 + lean);
  ctx.lineTo(px + inset + w - 2, py + inset + w * 0.36 + lean);
  ctx.moveTo(px + inset + 2, py + inset + w * 0.66 + lean);
  ctx.lineTo(px + inset + w - 2, py + inset + w * 0.66 + lean);
  ctx.stroke();
  ctx.fillStyle = 'rgba(206,226,246,0.2)';
  ctx.fillRect(px + inset + 2, py + inset + 2, w - 4, 3);
  ctx.restore();
}

function paintDesk(ctx, x, y) {
  const px = x * TILE;
  const py = y * TILE;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.32)';
  ctx.fillRect(px + 7, py + 11, TILE - 8, TILE - 10);
  ctx.fillStyle = PAL.desk;
  rr(ctx, px + 4, py + 6, TILE - 8, TILE - 14, 3);
  ctx.fill();
  ctx.fillStyle = PAL.deskTop;
  ctx.fillRect(px + 4, py + 6, TILE - 8, 5);
  ctx.fillStyle = PAL.paper;
  ctx.fillRect(px + 10, py + 16, 12, 8);
  ctx.fillRect(px + 24, py + 19, 8, 5);
  ctx.fillStyle = 'rgba(120,200,190,0.5)';
  ctx.beginPath();
  ctx.arc(px + 22, py + 13, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function paintPillar(ctx, x, y) {
  const cx = x * TILE + TILE / 2;
  const cy = y * TILE + TILE / 2;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.4)';
  ctx.beginPath();
  ctx.ellipse(cx + 3, cy + 6, 16, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  const grad = ctx.createRadialGradient(cx - 5, cy - 6, 3, cx, cy, 18);
  grad.addColorStop(0, PAL.pillarTop);
  grad.addColorStop(1, PAL.pillar);
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(200,220,240,0.18)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, 9, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function paintVent(ctx, x, y) {
  const px = x * TILE;
  const py = y * TILE;
  ctx.save();
  ctx.fillStyle = PAL.vent;
  ctx.fillRect(px, py, TILE, TILE);
  ctx.strokeStyle = 'rgba(140,175,205,0.16)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 5; i++) {
    const ly = py + 8 + i * 6;
    ctx.beginPath();
    ctx.moveTo(px + 3, ly);
    ctx.lineTo(px + TILE - 3, ly);
    ctx.stroke();
  }
  ctx.strokeStyle = 'rgba(150,190,220,0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(px, py + 3);
  ctx.lineTo(px + TILE, py + 3);
  ctx.moveTo(px, py + TILE - 3);
  ctx.lineTo(px + TILE, py + TILE - 3);
  ctx.stroke();
  ctx.fillStyle = 'rgba(150,190,220,0.28)';
  ctx.beginPath();
  ctx.moveTo(px + 26, py + 13);
  ctx.lineTo(px + 32, py + 18);
  ctx.lineTo(px + 26, py + 23);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function paintDoorJamb(ctx, x, y) {
  const px = x * TILE;
  const py = y * TILE;
  ctx.save();
  ctx.fillStyle = 'rgba(120,170,205,0.16)';
  ctx.fillRect(px + 2, py + 2, 6, TILE - 4);
  ctx.fillRect(px + TILE - 8, py + 2, 6, TILE - 4);
  ctx.strokeStyle = 'rgba(160,205,235,0.28)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(px + 2.5, py + 2.5, TILE - 5, TILE - 5);
  ctx.restore();
}

function paintKey(ctx, world) {
  const k = world.keyTile;
  if (world.hasKey) return;
  const cx = k.x * TILE;
  const pulse = 0.5 + 0.5 * Math.sin(world.clock * 0.9);
  const bob = Math.sin(world.clock * 0.9) * 2.6;
  const cy = k.y * TILE + bob;
  ctx.save();
  const glow = ctx.createRadialGradient(cx, cy, 2, cx, cy, 24);
  glow.addColorStop(0, `rgba(244,196,85,${0.4 + pulse * 0.18})`);
  glow.addColorStop(0.5, `rgba(244,196,85,${0.11 + pulse * 0.06})`);
  glow.addColorStop(1, 'rgba(244,196,85,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(cx - 26, cy - 26, 52, 52);

  // One slow brass ring per beat: the key breathes instead of blinking.
  ctx.strokeStyle = `rgba(244,196,85,${0.1 + pulse * 0.16})`;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(cx, cy, 14 + pulse * 6, 0, Math.PI * 2);
  ctx.stroke();

  ctx.translate(cx, cy);
  ctx.rotate(-0.3);
  ctx.fillStyle = PAL.key;
  ctx.beginPath();
  ctx.moveTo(0, -10);
  ctx.lineTo(8, 0);
  ctx.lineTo(0, 10);
  ctx.lineTo(-8, 0);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = PAL.keyDeep;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.beginPath();
  ctx.moveTo(-2, -5);
  ctx.lineTo(2, -1);
  ctx.lineTo(-2, 3);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.fillStyle = 'rgba(244,196,85,0.75)';
  ctx.font = '600 9px ui-monospace, Menlo, monospace';
  ctx.textAlign = 'center';
  ctx.fillText('GOLD KEY', cx, k.y * TILE + 26);
  ctx.restore();
}

function paintExit(ctx, world) {
  const e = world.exitTile;
  const cx = e.x * TILE;
  const cy = e.y * TILE;
  const pulse = 0.5 + 0.5 * Math.sin(world.clock * 0.8);
  ctx.save();
  const glow = ctx.createRadialGradient(cx, cy, 3, cx, cy, 24);
  glow.addColorStop(0, `rgba(65,220,176,${0.3 + pulse * 0.2})`);
  glow.addColorStop(1, 'rgba(65,220,176,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(cx - 26, cy - 26, 52, 52);

  // The same slow beat as the key, in teal: the way out is alive too.
  ctx.strokeStyle = `rgba(65,220,176,${0.09 + pulse * 0.15})`;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(cx, cy, 15 + pulse * 6, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#0c1f1c';
  rr(ctx, cx - 15, cy - 15, 30, 30, 4);
  ctx.fill();
  ctx.strokeStyle = PAL.exit;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Chevrons pointing out of the building.
  ctx.strokeStyle = `rgba(65,220,176,${0.55 + pulse * 0.4})`;
  ctx.lineWidth = 2;
  for (let i = 0; i < 2; i++) {
    const off = 4 - pulse * 2 + i * 6;
    ctx.beginPath();
    ctx.moveTo(cx - 6 + off, cy - 5);
    ctx.lineTo(cx + off, cy);
    ctx.lineTo(cx - 6 + off, cy + 5);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(65,220,176,0.85)';
  ctx.font = '600 9px ui-monospace, Menlo, monospace';
  ctx.textAlign = 'center';
  ctx.fillText('EXIT', cx, cy + 26);
  ctx.restore();
}

function stencil(ctx, text, x, y, tint, size = 11) {
  ctx.save();
  ctx.fillStyle = tint;
  ctx.font = `700 ${size}px ui-monospace, Menlo, monospace`;
  ctx.textAlign = 'left';
  ctx.fillText(text, x, y);
  ctx.restore();
}

// Two small staging clusters fill the bare start corner: a loaded pallet and cartons by
// the top wall, a cable drum and bucket by the aisle. Decoration only, so nothing blocks.
function paintStagingProps(ctx) {
  ctx.save();

  // Cluster one: pallet of cartons left by the start gap.
  const ax = 2.4 * TILE;
  const ay = 3.1 * TILE;
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.fillRect(ax + 4, ay + 22, 46, 12);
  ctx.fillStyle = '#2b3543';
  rr(ctx, ax, ay + 16, 46, 13, 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(158,186,214,0.28)';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(10,16,24,0.5)';
  for (let i = 1; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(ax + i * 11.5, ay + 17);
    ctx.lineTo(ax + i * 11.5, ay + 28);
    ctx.stroke();
  }
  const carton = (x, y, w, h, tone) => {
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    ctx.fillRect(x + 2, y + 3, w, h);
    ctx.fillStyle = tone;
    rr(ctx, x, y, w, h, 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(186,210,234,0.26)';
    ctx.stroke();
    ctx.fillStyle = 'rgba(200,222,244,0.14)';
    ctx.fillRect(x + 3, y + h * 0.42, w - 6, 2);
  };
  carton(ax + 3, ay - 4, 21, 18, '#48586a');
  carton(ax + 22, ay + 2, 16, 13, '#3f4d5d');

  // Cluster two: drum of spare cable and a mop bucket.
  const bx = 6.3 * TILE;
  const by = 3.25 * TILE;
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(bx + 3, by + 4, 15, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#33404f';
  ctx.beginPath();
  ctx.arc(bx, by, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(176,204,232,0.34)';
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(176,204,232,0.2)';
  ctx.beginPath();
  ctx.arc(bx, by, 8.5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#222b36';
  ctx.beginPath();
  ctx.arc(bx, by, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath();
  ctx.ellipse(bx + 28, by + 3, 10, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3a4552';
  ctx.beginPath();
  ctx.moveTo(bx + 19, by - 5);
  ctx.lineTo(bx + 34, by - 5);
  ctx.lineTo(bx + 32, by + 5);
  ctx.lineTo(bx + 21, by + 5);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(186,210,234,0.3)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(186,210,234,0.26)';
  ctx.beginPath();
  ctx.arc(bx + 26.5, by - 6, 7.5, Math.PI * 1.05, Math.PI * 1.95);
  ctx.stroke();

  // A loose run of cable on the floor ties the two clusters together.
  ctx.strokeStyle = 'rgba(140,168,196,0.22)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(ax + 50, ay + 26);
  ctx.bezierCurveTo(ax + 84, ay + 34, bx - 24, by + 22, bx - 12, by + 6);
  ctx.stroke();
  ctx.restore();
}

export function paintProps(ctx, world) {
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const ch = MAP[y][x];
      if (isWall(ch)) paintWall(ctx, x, y);
      else if (ch === 'C') paintCrate(ctx, x, y);
      else if (ch === 'D') paintDesk(ctx, x, y);
      else if (ch === 'P') paintPillar(ctx, x, y);
      else if (isVent(ch)) paintVent(ctx, x, y);
    }
  }
  for (const door of DOORS) {
    paintDoorMat(ctx, door.x, door.y);
    paintDoorJamb(ctx, door.x, door.y);
  }
  ctx.save();
  ctx.strokeStyle = 'rgba(152,182,214,0.22)';
  ctx.lineWidth = 2;
  ctx.strokeRect(24 * TILE + 3, 10 * TILE + 3, 7 * TILE - 6, 4 * TILE - 6);
  ctx.restore();

  paintStagingProps(ctx);

  paintKey(ctx, world);
  paintExit(ctx, world);

  // Route stencils on the floor name the three ways in, so the plan reads at a glance.
  stencil(ctx, 'FRONT HALL', 12 * TILE + 4, 4 * TILE + 26, 'rgba(159,192,230,0.55)', 12);
  stencil(ctx, 'SERVICE RUN', 17 * TILE + 2, 18 * TILE + 27, 'rgba(230,180,159,0.5)', 12);
  stencil(ctx, 'VENT CRAWL', 5 * TILE + 4, 11 * TILE + 26, 'rgba(159,230,205,0.6)', 12);
  stencil(ctx, 'VAULT', 25 * TILE + 6, 13 * TILE + 26, 'rgba(180,200,224,0.62)', 12);
}

let lightCanvas = null;

export function paintLightmap(ctx, world) {
  if (!lightCanvas) {
    lightCanvas = document.createElement('canvas');
    lightCanvas.width = VIEW_W;
    lightCanvas.height = VIEW_H;
  }
  const lc = lightCanvas.getContext('2d');
  lc.globalCompositeOperation = 'source-over';
  lc.clearRect(0, 0, VIEW_W, VIEW_H);
  lc.fillStyle = 'rgba(4,7,12,0.55)';
  lc.fillRect(0, 0, VIEW_W, VIEW_H);

  lc.globalCompositeOperation = 'destination-out';
  const hole = (x, y, radius, strength) => {
    const grad = lc.createRadialGradient(x * TILE, y * TILE, 0, x * TILE, y * TILE, radius);
    grad.addColorStop(0, `rgba(0,0,0,${strength})`);
    grad.addColorStop(0.65, `rgba(0,0,0,${strength * 0.55})`);
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    lc.fillStyle = grad;
    lc.beginPath();
    lc.arc(x * TILE, y * TILE, radius, 0, Math.PI * 2);
    lc.fill();
  };

  const p = world.player;
  hole(p.x, p.y, 74, 0.9);
  hole(world.keyTile.x, world.keyTile.y, 60, world.hasKey ? 0.2 : 0.85);
  hole(world.exitTile.x, world.exitTile.y, 74, 0.85);
  for (const g of world.guards) hole(g.x, g.y, 74, 0.4);
  hole(world.camera.x, world.camera.y, 56, 0.3);

  ctx.drawImage(lightCanvas, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
}

// A slight darkening at the canvas edge: the floor sits in a room, not on a page.
export function paintVignette(ctx) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const grad = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.46, w / 2, h / 2, Math.hypot(w, h) * 0.6);
  grad.addColorStop(0, 'rgba(3,5,9,0)');
  grad.addColorStop(0.62, 'rgba(3,5,9,0.06)');
  grad.addColorStop(1, 'rgba(3,5,9,0.22)');
  ctx.save();
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}
