// The floor as data: glyph lookups, line of sight, cone polygons and route zones.
import { MAP, COLS, ROWS, TILE } from './config.js';

export const WALL = '#';
export const VENT = 'v';
export const COVER = 'CDP';
export const KEY = 'L';
export const EXIT = 'X';
export const START = 's';

const chars = MAP.map((row) => [...row]);

if (chars.length !== ROWS) throw new Error('floor rows ' + chars.length + ' != ' + ROWS);
for (const row of chars) {
  if (row.length !== COLS) throw new Error('floor row width ' + row.length + ' != ' + COLS);
}

export function tileAt(tx, ty) {
  if (tx < 0 || ty < 0 || tx >= COLS || ty >= ROWS) return WALL;
  return chars[ty][tx];
}

export const isWall = (ch) => ch === WALL;
export const isCover = (ch) => COVER.includes(ch);
export const isVent = (ch) => ch === VENT;
export const blocksSight = (ch) => ch === WALL || COVER.includes(ch);
export const blocksWalk = (ch) => ch === WALL || COVER.includes(ch);

// Where each glyph sits, found once for state setup.
export function glyphTiles(glyph) {
  const found = [];
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) if (chars[y][x] === glyph) found.push({ x, y });
  }
  return found;
}

// Sampling ray: a guard sees along it only until a wall or a cover tile.
export function lineBlocked(x0, y0, x1, y1) {
  const span = Math.hypot(x1 - x0, y1 - y0);
  const steps = Math.max(1, Math.ceil((span * TILE) / 5));
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const tx = Math.floor(x0 + (x1 - x0) * t);
    const ty = Math.floor(y0 + (y1 - y0) * t);
    if (blocksSight(tileAt(tx, ty))) return true;
  }
  return false;
}

// The ceiling camera looks over crates, so it is stopped by walls alone.
export function wallBlocked(x0, y0, x1, y1) {
  const span = Math.hypot(x1 - x0, y1 - y0);
  const steps = Math.max(1, Math.ceil((span * TILE) / 5));
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const tx = Math.floor(x0 + (x1 - x0) * t);
    const ty = Math.floor(y0 + (y1 - y0) * t);
    if (isWall(tileAt(tx, ty))) return true;
  }
  return false;
}

// Cone outline clipped per ray, so the drawn cone ends exactly where vision ends.
export function conePolygon(x, y, angle, fovDeg, range, rays = 26) {
  const half = (fovDeg * Math.PI) / 360;
  const points = [{ x, y }];
  for (let i = 0; i <= rays; i++) {
    const a = angle - half + (i / rays) * half * 2;
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    let reach = range;
    for (let s = 0.35; s <= range; s += 0.12) {
      if (blocksSight(tileAt(Math.floor(x + cos * s), Math.floor(y + sin * s)))) {
        reach = s;
        break;
      }
    }
    points.push({ x: x + cos * reach, y: y + sin * reach });
  }
  return points;
}

// Angular distance between a heading and the direction to a target.
export function angleDelta(a, b) {
  let d = (b - a + Math.PI * 3) % (Math.PI * 2);
  return Math.abs(d - Math.PI);
}

// Named route under a floor position, for the win panel and route meters.
export function routeAt(fx, fy) {
  const tx = Math.floor(fx);
  const ty = Math.floor(fy);
  if (isVent(tileAt(tx, ty))) return 'vent';
  if (ty <= 4 || (tx >= 28 && ty <= 9)) return 'front';
  if (ty >= 16) return 'service';
  return null;
}

// Crouching beside cover hides you from a guard looking your way.
export function coverBetween(px, py, gx, gy) {
  const dx = gx - px;
  const dy = gy - py;
  const len = Math.hypot(dx, dy) || 1;
  const step = 0.55;
  const nx = px + (dx / len) * step;
  const ny = py + (dy / len) * step;
  return isCover(tileAt(Math.floor(nx), Math.floor(ny)));
}
