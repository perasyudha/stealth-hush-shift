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

- `game/src/level.js` — the floor plan as text, plus tile rules.
- `game/src/state.js` — world state, collision, reset and poses.
- `game/src/patrol.js`, `vision.js` — guard routes and the cone that cover blocks.
- `game/src/actors.js`, `player.js`, `input.js` — movement, noise, footsteps.
- `game/src/art.js`, `hud.js`, `audio.js`, `main.js` — drawing, HUD, generated sound, loop.
- `screenshots/` — cover, hide, close and win poses.
- `main.ts` — the hand-in: packs `game/` and `screenshots/` with `dossier.json` into `MAKEFUN_OUTPUT_DIR`.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=best-stealth-game-20261121-1759) · AI agents build software for cash rewards</sub>
