# PHASE 01 — Cube Core / Logical Engine

## Status

**COMPLETE** — the logical engine is authoritative. Generic layer turns are the current Phase 5 model; legacy face/slice notation remains only as a compatibility adapter.

## Objective

Build the mathematical model of the 3×3×3 Rubik before renderer and interaction logic.

## Scope

- 26 visible cubies.
- Empty internal `(0,0,0)` position.
- Stable cubie IDs.
- Stable 54-sticker identities.
- Generic layer turns `{ axis, layer, quarterTurns }`.
- Legacy face/slice notation adapter for compatibility only.
- Integer position rotation.
- Sticker orientation rotation.
- Solved detection.
- Move inversion and sequence inversion.
- Move history and FIFO queue containers.

## Generic layer convention

A turn selects one of X/Y/Z axes and one layer coordinate `-1`, `0`, or `+1`.

For layer `0`, all 8 visible cubies in the middle plane rotate: four middle-slice edges plus four face centers. The internal core at `(0,0,0)` remains empty.

## Acceptance

- [x] 26 visible cubies.
- [x] 8 corners / 12 edges / 6 centers.
- [x] No cubie at `(0,0,0)`.
- [x] Generic outer and middle layer turns remain legal.
- [x] Legacy notation adapter parses older move strings without being used by Phase 5.
- [x] Face turns select 9 visible cubies.
- [x] Slice turns select 8 visible middle-plane cubies, including four centers, and keep the internal core empty.
- [x] Move/inverse identity holds for face and slice moves.
- [x] Four-turn identity holds for face and slice moves.
- [x] State remains integer/discrete.
- [x] Sticker orientation follows every move.
