# PHASE 01 — Cube Core / Logical Engine

## Status

**COMPLETE** — the logical engine is authoritative and now includes standard face and slice notation required by the finalized Phase 5 interaction model.

## Objective

Build the mathematical model of the 3×3×3 Rubik before renderer and interaction logic.

## Scope

- 26 visible cubies.
- Empty internal `(0,0,0)` position.
- Stable cubie IDs.
- Face moves `U D R L F B`.
- Slice moves `M E S`.
- Inverse and half-turn modifiers.
- Integer position rotation.
- Sticker orientation rotation.
- Solved detection.
- Move inversion and sequence inversion.
- Move history and FIFO queue containers.

## Slice conventions

```text
M follows L
E follows D
S follows F
```

Slice layers are the zero coordinate of their axis. Standard `M/E/S` rotates the four middle-slice edge cubies; center cubies remain fixed to the core.

## Acceptance

- [x] 26 visible cubies.
- [x] 8 corners / 12 edges / 6 centers.
- [x] No cubie at `(0,0,0)`.
- [x] Face moves remain legal.
- [x] M/E/S parse and apply correctly.
- [x] Face turns select 9 visible cubies.
- [x] Slice turns select 4 middle-slice edge cubies and keep centers fixed.
- [x] Move/inverse identity holds for face and slice moves.
- [x] Four-turn identity holds for face and slice moves.
- [x] State remains integer/discrete.
- [x] Sticker orientation follows every move.
