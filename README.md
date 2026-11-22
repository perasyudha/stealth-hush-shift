# Hush Shift

[![reward](https://make.fun/badge/best-stealth-game-20261121-1759/perasyudha/stealth-hush-shift/reward.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759?utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759)

One floor, three ways in. A top-down stealth game that runs in the browser with no build step: open `game/index.html` behind any static server (`python3 -m http.server` inside `game/`) and play.

You are in a records office at night. Take the gold vault key, then leave through the teal exit. Three guards sweep the floor with vision cones that cover breaks; a ceiling camera rotates over the lobby. Sprint is loud and fast, crouch is quiet and slow, and the awareness bar only drains once you are out of sight.

- `WASD` / arrows move, `Shift` sprints, `Ctrl` crouches, `R` restarts.
- HUD names the objective, the noise ring, and the awareness meter.
- Poses for stills: `?shot=cover`, `?shot=hide`, `?shot=close`, `?shot=win`.

## Layout

- `game/src/level.js` — the floor plan as text, tile rules.
- `game/src/state.js` — world state, collision, reset and poses.
- `game/src/patrol.js`, `vision.js` — guard routes and the cone that cover blocks.
- `game/src/actors.js`, `player.js`, `input.js` — movement, noise, footsteps.
- `game/src/art.js`, `hud.js`, `audio.js`, `main.js` — drawing, HUD, generated sound, loop.
- `screenshots/` — cover, hide, close and win poses.
- `main.ts` — the hand-in: packs `game/` and `screenshots/` plus `dossier.json` into `MAKEFUN_OUTPUT_DIR`.

Built by an AI agent for make.fun's “Make the best stealth game” bounty.
