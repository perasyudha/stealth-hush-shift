// The still parts of the floor: tiles, walls, crates, desks, pillars, vent grates,
// the gold key, the teal exit door, door jambs, stencils, and the night light map.
import { COLS, GUARDS, ROWS, TILE, VIEW_H, VIEW_W, ROUTES } from './config.js';
import { DOORS, MAP } from './config.js';
import { isCover, isVent, isWall } from './level.js';

export const PAL = {
  ink: '#070a0f',
  floorA: '#121924',
  floorB: '#0f141d',
  vaultA: '#1e1a15',
  vaultB: '#1a1712',
  serviceA: '#131a1c',
  serviceB: '#101617',
  vent: '#0b1015',
  wall: '#232c39',
  wallTop: '#3a4657',
  wallEdge: 'rgba(180,210,235,0.16)',
  crate: '#7d6435',
  crateDark: '#5a4726',
  crateEdge: '#9c8047',
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

      if (isVent(ch)) {
        ctx.fillStyle = PAL.vent;
      } else if (zone === 'vault') {
        ctx.fillStyle = even ? PAL.vaultA : PAL.vaultB;
      } else if (zone === 'service') {
        ctx.fillStyle = even ? PAL.serviceA : PAL.serviceB;
      } else {
        ctx.fillStyle = even ? PAL.floorA : PAL.floorB;
      }
      ctx.fillRect(px, py, TILE, TILE);

      ctx.strokeStyle = 'rgba(190,215,240,0.022)';
      ctx.lineWidth = 1;
      ctx.strokeRect(px + 0.5, py + 0.5, TILE - 1, TILE - 1);
    }
  }

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

  // A soft cast shadow on the floor tile below a wall reads as height.
  if (!isWall(MAP[y + 1]?.[x])) {
    const grad = ctx.createLinearGradient(0, py + TILE, 0, py + TILE + 18);
    grad.addColorStop(0, 'rgba(0,0,0,0.42)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(px, py + TILE, TILE, 18);
  }
}

function paintCrate(ctx, x, y) {
  const px = x * TILE;
  const py = y * TILE;
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.fillRect(px + 8, py + 10, TILE - 12, TILE - 10);
  const grad = ctx.createLinearGradient(px, py, px + TILE, py + TILE);
  grad.addColorStop(0, PAL.crateEdge);
  grad.addColorStop(0.45, PAL.crate);
  grad.addColorStop(1, PAL.crateDark);
  ctx.fillStyle = grad;
  rr(ctx, px + 4, py + 4, TILE - 8, TILE - 8, 4);
  ctx.fill();
  ctx.strokeStyle = 'rgba(20,14,6,0.55)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.strokeStyle = 'rgba(20,14,6,0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(px + 6, py + 14);
  ctx.lineTo(px + TILE - 6, py + 14);
  ctx.moveTo(px + 6, py + 26);
  ctx.lineTo(px + TILE - 6, py + 26);
  ctx.stroke();
  ctx.fillStyle = 'rgba(240,220,180,0.22)';
  ctx.fillRect(px + 6, py + 6, TILE - 12, 3);
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
  const bob = Math.sin(world.clock * 2.1) * 3;
  const cy = k.y * TILE + bob;
  ctx.save();
  const glow = ctx.createRadialGradient(cx, cy, 2, cx, cy, 46);
  glow.addColorStop(0, 'rgba(244,196,85,0.5)');
  glow.addColorStop(0.5, 'rgba(244,196,85,0.14)');
  glow.addColorStop(1, 'rgba(244,196,85,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(cx - 48, cy - 48, 96, 96);

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
  const pulse = 0.5 + 0.5 * Math.sin(world.clock * 2.4);
  ctx.save();
  const glow = ctx.createRadialGradient(cx, cy, 4, cx, cy, 46);
  glow.addColorStop(0, `rgba(65,220,176,${0.4 + pulse * 0.14})`);
  glow.addColorStop(1, 'rgba(65,220,176,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(cx - 48, cy - 48, 96, 96);

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
  ctx.strokeStyle = 'rgba(244,196,85,0.22)';
  ctx.lineWidth = 2;
  ctx.strokeRect(24 * TILE + 3, 10 * TILE + 3, 7 * TILE - 6, 4 * TILE - 6);
  ctx.restore();

  paintKey(ctx, world);
  paintExit(ctx, world);

  // Route stencils on the floor name the three ways in, so the plan reads at a glance.
  stencil(ctx, 'FRONT HALL', 12 * TILE + 4, 4 * TILE + 26, 'rgba(159,192,230,0.55)', 12);
  stencil(ctx, 'SERVICE RUN', 17 * TILE + 2, 18 * TILE + 27, 'rgba(230,180,159,0.5)', 12);
  stencil(ctx, 'VENT CRAWL', 5 * TILE + 4, 11 * TILE + 26, 'rgba(159,230,205,0.6)', 12);
  stencil(ctx, 'VAULT', 25 * TILE + 6, 13 * TILE + 26, 'rgba(244,196,85,0.55)', 12);
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
  hole(p.x, p.y, 145, 0.9);
  hole(world.keyTile.x, world.keyTile.y, 120, world.hasKey ? 0.2 : 0.85);
  hole(world.exitTile.x, world.exitTile.y, 150, 0.85);
  for (const g of world.guards) hole(g.x, g.y, 74, 0.4);
  hole(world.camera.x, world.camera.y, 56, 0.3);

  ctx.drawImage(lightCanvas, 0, 0);
  ctx.globalCompositeOperation = 'source-over';
}
