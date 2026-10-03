# PHASE 01 — Cube Core / Logical Engine

## Status

**COMPLETE** — initial implementation and automated invariant tests passed.

## Objective

Build the authoritative mathematical model of the 3×3×3 Rubik before any renderer or interaction layer is implemented.

## Scope

- 26 visible cubies.
- Empty internal `(0,0,0)` position.
- Stable cubie IDs based on original coordinates.
- Six face definitions: `U D R L F B`.
- Legal move notation: quarter turn, inverse, half turn.
- Position rotation using integer coordinates only.
- Sticker orientation rotation together with each cubie.
- Immutable-style state transitions: `applyMove()` returns a new `CubeState`.
- Solved-state detection.
- Move inversion and sequence inversion.
- Basic committed move history container.
- Basic FIFO move queue container.
- Automated invariant tests.

## Implementation

Source:

- `src/core/cube.js`

Tests:

- `tests/cube.test.js`

Run:

```bash
npm test
```

## State Model

Each cubie contains:

```js
{
  id,
  position: [x, y, z],
  stickers: {
    Face: Color
  }
}
```

The logical coordinates are always integers from `-1` to `1`, excluding `(0,0,0)`.

## Move Conventions

The engine uses standard face names and a fixed internal rotation convention:

| Face | Axis | Layer | Base quarter turn |
|---|---|---:|---:|
| `R` | X | `+1` | `-90°` |
| `L` | X | `-1` | `+90°` |
| `U` | Y | `+1` | `+90°` |
| `D` | Y | `-1` | `-90°` |
| `F` | Z | `+1` | `-90°` |
| `B` | Z | `-1` | `+90°` |

The inverse modifier `'` negates the base rotation. The `2` modifier performs a 180° turn.

## Important Architectural Boundary

The engine does **not** know anything about:

- Three.js or another renderer.
- DOM elements.
- Mouse/touch input.
- Camera controls.
- Animation frames.
- UI state.

The engine only owns the logical cube state and legal state transitions.

## Acceptance Checklist

- [x] Exactly 26 cubies.
- [x] No cubie at `(0,0,0)`.
- [x] 8 corners, 12 edges, 6 centers.
- [x] Stable cubie IDs.
- [x] Legal face move parser.
- [x] Position rotation remains integer/discrete.
- [x] Sticker orientation rotates with the cubie.
- [x] Every face move affects exactly 9 cubies.
- [x] `M × M × M × M = identity` for every face.
- [x] `M × M⁻¹ = identity` for every supported move.
- [x] `M2 × M2 = identity`.
- [x] Arbitrary tested sequence followed by its exact inverse restores solved state.
- [x] Solved-state detection works.
- [x] Move history container exists.
- [x] FIFO move queue exists.
- [x] Automated tests pass.

## Handoff to Phase 2

Phase 2 may consume the following stable engine API:

```js
createSolvedCube()
parseMove(notation)
invertMove(move)
invertSequence(sequence)
CubeState.applyMove(move)
CubeState.applySequence(sequence)
CubeState.getCubie(id)
CubeState.getCubieAt(position)
CubeState.isSolved()
CubeState.signature()
```

The renderer must treat `CubeState` as authoritative and must never independently invent cube state.
