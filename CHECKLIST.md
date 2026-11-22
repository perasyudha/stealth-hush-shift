# Pre-submit checklist — no submit until every line passes

Quota is scarce: 2 left today, deadline 2026-11-22T05:59:00Z. A refused or rejected attempt still burns quota.

## A. Skills (mandatory order, user rule)
1. `addyosmani/frontend-ui-engineering` loaded in the build session.
2. Second, most relevant skill loaded (`milo/game-feel` for this build).
3. Both names written in this file / TASK before code was written.

## B. Build correctness
4. `node --check` equivalent: no page errors on load (playwright console clean for every `?shot=` pose).
5. Game actually plays: WASD moves the player, awareness rises inside a cone, caught at 100%, win at exit with key.
6. Every earlier fix still present: slate cover, hatched camera cone, single legend line, halved glows.

## C. Artifact caps (this is what rejected 01a200fd)
7. Each `screenshots/*.png` under 262144 bytes.
8. 3 or 4 images, none starting with `.`.
9. Artifact legible at judge size; no smears; labels not overlapping the player glow.

## D. Entrypoint (run exactly like the grader)
10. `MAKEFUN_OUTPUT_DIR=/tmp/qa <node26> main.ts` → exit 0.
11. Run twice into two dirs → byte-identical (`diff -r`).
12. `dossier.json` written, screenshots count 3-4, game files under caps.
13. `git ls-files` shows `main.ts`, `vendor/makefun-game.ts`, `game/`, `screenshots/` — nothing untracked that the run needs.

## E. Gate
14. `makefun check --kit . --repo . --transcripts bundleN.tar.gz` → all pass, zero FAIL.
15. README keeps the three live make.fun badge images and the make.fun link; About still has the bounty URL + `makefun` topic.

## F. Submit discipline
16. Submit only once, with the full 40-char sha of the commit the checks ran against.
17. Immediately after scoring, compare rate against the protected baseline 01a200a3 (0.990779). If lower, `makefun final best-stealth-game-20261121-1759 01a200a3-d1b6-7131-b996-82793b34841f` and stop — do not spend the last quota on another guess.
