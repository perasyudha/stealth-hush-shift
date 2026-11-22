// Hush Shift hand-in (program/v1, Node 22, standard library only).
//
// What the grader does: runs this file twice in a fresh container with the repository read-only
// at /bot and a writable /output, and both runs must write the same bytes. So the work here is
// fixed and order-dependent: copy game/ (the whole playable floor), copy screenshots/ (the four
// renders the maker took), then write dossier.json with the kit's own buildDossier, which the
// scorer re-runs and compares byte for byte.
//
// Locally: mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repo = fileURLToPath(new URL('.', import.meta.url));
const output = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's caps (reference/gate.json). Passing them to buildDossier means a dossier this
// program writes is never one the scorer would refuse for size or count.
const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
} as const;

function walkBytes(dir: string): { files: number; bytes: number } {
  let files = 0;
  let bytes = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      const inner = walkBytes(full);
      files += inner.files;
      bytes += inner.bytes;
    } else {
      files += 1;
      bytes += statSync(full).size;
    }
  }
  return { files, bytes };
}

function main(): void {
  const shots = join(repo, 'screenshots');
  if (!existsSync(shots) || !existsSync(join(repo, 'game', 'index.html'))) {
    throw new Error('hand-in needs game/index.html and screenshots/ beside main.ts');
  }

  // A stale /output from an earlier run must not leak into this one: the copy has to be exact.
  rmSync(join(output, 'game'), { recursive: true, force: true });
  rmSync(join(output, 'screenshots'), { recursive: true, force: true });
  rmSync(join(output, 'dossier.json'), { force: true });
  mkdirSync(output, { recursive: true });

  cpSync(join(repo, 'game'), join(output, 'game'), { recursive: true });
  cpSync(shots, join(output, 'screenshots'), { recursive: true });

  const game = walkBytes(join(output, 'game'));
  const images = readdirSync(join(output, 'screenshots')).filter((name) => !name.startsWith('.'));
  if (game.files > CAPS.game_max_files) throw new Error(`game/ has ${game.files} files`);
  if (game.bytes > CAPS.game_max_bytes) throw new Error(`game/ is ${game.bytes} bytes`);
  if (images.length < 3 || images.length > CAPS.screenshots.max) {
    throw new Error(`screenshots/ holds ${images.length} images, the scorer wants 3 or 4`);
  }

  const dossier = buildDossier(output, CAPS);
  writeFileSync(join(output, 'dossier.json'), dossier);

  console.log(`game/        ${game.files} files, ${game.bytes} bytes`);
  console.log(`screenshots/ ${images.length} images: ${images.join(', ')}`);
  console.log(`dossier.json ${dossier.byteLength} bytes -> ${output}`);
}

main();
