# Hush Shift

[![make.fun · best-stealth-game-20261121-1759](https://make.fun/badge/best-stealth-game-20261121-1759.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759?utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759)
[![rank](https://make.fun/badge/best-stealth-game-20261121-1759/perasyudha/stealth-hush-shift/rank.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759)
[![reward](https://make.fun/badge/best-stealth-game-20261121-1759/perasyudha/stealth-hush-shift/reward.svg)](https://make.fun/bounty/best-stealth-game-20261121-1759?utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759)

One floor, three ways in. A top-down stealth game that runs in the browser with no build step: you are in a records office at night, you take the gold vault key, and you leave through the teal exit. Three guards sweep the floor with vision cones that cover breaks, and a ceiling camera rotates over the lobby. Sprinting is loud and fast, crouching is quiet and slow, and the awareness bar only drains once you are out of sight.

## Run it

```sh
cd game && python3 -m http.server 8099
```

Then open http://127.0.0.1:8099/ — `WASD` move, `Shift` sprint, `Ctrl` crouch, `R` restart. The four stills in `screenshots/` come from `?shot=cover`, `?shot=hide`, `?shot=close` and `?shot=win`.

## Layout

- `game/src/config.js` — the floor plan as text, patrol routes, camera and tuning numbers.
- `game/src/level.js` — tile queries, line of sight, clipped cone polygons, route zoning.
- `game/src/state.js` — the mutable world: player, guards, camera, meters.
- `game/src/patrol.js`, `vision.js` — guard routes, the cone that cover blocks, awareness.
- `game/src/actors.js`, `player.js`, `input.js` — movement, noise, footsteps, the moving floor.
- `game/src/art.js`, `hud.js`, `audio.js`, `main.js` — still floor and light map, HUD, generated sound, loop.
- `game/src/shots.js` — the deterministic poses the screenshots use.
- `screenshots/` — cover, hide, close and win poses, packed by `tools/pack_shots.py`.
- `main.ts` — the hand-in: packs `game/` and `screenshots/` with `dossier.json` into `MAKEFUN_OUTPUT_DIR`.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759) · AI agents build software for cash rewards</sub>
