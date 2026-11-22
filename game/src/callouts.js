// Leader-line notes for the cover still only: no boxes, no panels, just small-caps type on
// the floor with a hairline running to the thing it names. The pose should explain itself.
import { HUD_TOP, TILE } from './config.js';

const MONO = 'ui-monospace, "SF Mono", Menlo, monospace';

// One note: label set at (x, y), then a hairline polyline into a 2.4px tip on the subject.
function note(ctx, text, x, y, align, leader, tint) {
  const label = text.toUpperCase();
  ctx.save();
  ctx.font = `600 10px ${MONO}`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0.7px';
  const width = ctx.measureText(label).width;
  const left = align === 'right' ? x - width : align === 'center' ? x - width / 2 : x;

  // The halo is what keeps 10px type readable over a tiled floor and a wall band.
  ctx.lineJoin = 'round';
  ctx.strokeStyle = 'rgba(3,6,10,0.85)';
  ctx.lineWidth = 3.4;
  ctx.strokeText(label, left, y);
  ctx.fillStyle = 'rgba(238,245,252,0.98)';
  ctx.fillText(label, left, y);
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';

  ctx.strokeStyle = 'rgba(206,224,242,0.44)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  leader.forEach(([lx, ly], index) => {
    if (index === 0) ctx.moveTo(lx, ly);
    else ctx.lineTo(lx, ly);
  });
  ctx.stroke();

  const [tipX, tipY] = leader[leader.length - 1];
  ctx.fillStyle = tint;
  ctx.beginPath();
  ctx.arc(tipX, tipY, 2.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawCallouts(ctx, world) {
  if (!world.callouts) return;

  const px = world.player.x * TILE;
  const py = HUD_TOP + world.player.y * TILE;
  const cx = world.camera.x * TILE;
  const cy = HUD_TOP + world.camera.y * TILE;
  const kx = world.keyTile.x * TILE;
  const ky = HUD_TOP + world.keyTile.y * TILE;

  // 1. You: crouched behind the crate, exactly where guard C's cone dies.
  note(ctx, 'You: hidden where the cone stops at cover', px, py + 96, 'center',
    [[px, py + 84], [px, py + 52], [px, py + 28]], 'rgba(226,238,250,0.9)');

  // 2. The camera: its hatch runs over the crate and pillar the guard cannot see through.
  note(ctx, 'Camera: hatch means it sees over cover', cx - 30, cy - 44, 'right',
    [[cx - 40, cy - 36], [cx - 120, cy - 20], [cx - 164, cy + 34]], 'rgba(160,205,255,0.9)');

  // 3. The key, then the two clear legs out to the teal exit.
  note(ctx, 'Gold key: two legs, then the teal exit', kx + 138, ky - 32, 'right',
    [[kx + 132, ky - 40], [kx + 70, ky - 16], [kx + 14, ky - 2]], 'rgba(244,196,85,0.95)');
}
