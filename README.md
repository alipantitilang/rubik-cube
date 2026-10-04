# Rubik 26-Cubies

Interactive 3D Rubik project with a generic, view-independent layer-turn model and permanent sticker/position tracking.

## Current status

- Phase 0 — Documentation Baseline: **Complete**
- Phase 1 — Cube Core: **Complete**
- Phase 2 — 3D Renderer: **Complete**
- Phase 3 — Generic Turn Animation: **Complete**
- Phase 4 — Camera/View capability: **Complete as reusable infrastructure**
- Phase 5 — Manual Rubik Interaction: **FINAL / Complete**
- Phase 6 — Legal Shuffle / Play Flow: **Complete**
- Phase 7–10: **Pending**

The overall product is not final until the remaining phases and the Definition of Done are complete.

## Final Phase 5 model

The interaction model intentionally has no movement Front/Back/Up/Down/Left/Right.

A sticker drag becomes:

```text
sticker normal
+ screen drag
+ camera screen basis
+ cube quaternion
+ cubie position
        ↓
generic layer turn
{ axis, layer, quarterTurns }
```

The cube itself is the object users rotate. The camera is only the viewer/reference; pointer camera orbit is disabled in the Phase 5 interaction mode. Zoom remains camera-owned.

## 54 sticker identities

Every visible color block has a permanent code.

Example red face:

```text
rc1 rc2 rc3 rc4
re1 re2 re3 re4
rc
```

Equivalent codes exist for orange, yellow, white, green, and blue.

Every visible sticker position has a permanent slot:

```text
p01 ... p54
```

Solved example:

```text
rc1 → p01
re1 → p02
rc  → p05
```

After movement:

```text
rc1: p01 → p37
```

The sticker code never changes. Only its position changes.

Center stickers use the same model. A middle slice carries 4 edge cubies + 4 center cubies, so center stickers can move between face-position slots.

## Repository structure

```text
.
├── index.html
├── styles.css
├── package.json
├── *.md                         # project specification/history
├── src/
│   ├── core/
│   │   ├── cube.js              # authoritative logical state
│   │   ├── turn.js              # generic axis/layer turn
│   │   └── sticker-map.js       # 54 identities + 54 positions
│   ├── animation/
│   │   ├── turn-animator.js
│   │   ├── cube-turn-runtime.js
│   │   └── shuffle-controller.js
│   ├── interaction/
│   │   ├── drag-move-resolver.js
│   │   ├── manual-controller.js
│   │   ├── cube-orientation-state.js
│   │   └── cube-orientation-controller.js
│   ├── render/
│   │   ├── cube-render-model.js
│   │   ├── cube-renderer.js
│   │   └── turn-renderer.js
│   ├── camera-controller.js
│   └── camera-view-state.js
└── tests/
    └── *.test.js
```

There is intentionally **one production HTML entry point**: `index.html`.

Future changes should update this HTML rather than creating another phase preview HTML. The production entry point is always `index.html`.

## GitHub Pages

The project entry point is now at repository root:

```text
/index.html
/styles.css
/src/...
```

This layout is suitable for GitHub Pages configured to publish the repository root.

## Development

Install dependencies:

```bash
npm install
```

Run the full regression suite:

```bash
npm test
```

Current cleanup regression:

```text
69 passed
0 failed
```

## Architecture rules

1. `CubeState` is authoritative.
2. Exactly 26 visible cubies exist.
3. `(0,0,0)` remains the empty internal position.
4. Movement uses generic `{ axis, layer, quarterTurns }`.
5. No notation parser is part of the active engine.
6. Sticker identity is permanent.
7. Position IDs `p01..p54` are permanent physical slots.
8. Center stickers are movable identities.
9. Renderer color follows sticker identity.
10. Animation never mutates logical state before commit.
11. Empty-space drag rotates the cube object.
12. Camera pointer orbit is not used for Phase 5 gesture ownership.

## Documentation source of truth

Start with:

1. `00_PROJECT_OVERVIEW.md`
2. `01_PRD.md`
3. `02_RULES.md`
4. `03_ARCHITECTURE.md`
5. `04_CUBE_MODEL.md`
6. `05_MOVE_ENGINE.md`
7. `07_INTERACTION_SPEC.md`
8. `12_HISTORY_SPEC.md`
9. `PHASE_05_MANUAL_INTERACTION.md`
10. `PHASE_05_AUDIT.md`
11. `FIX_LOG.md`

`FIX_LOG.md` remains historical and is not rewritten to erase previous architectures.

## Cleanup policy

The project no longer creates separate HTML files for each phase.

When a phase changes the active product:

- update `index.html`;
- update existing source modules;
- remove obsolete modules;
- update tests;
- update documentation;
- keep historical change records in `FIX_LOG.md` and `20_CHANGELOG.md`.

## Phase 5 final acceptance

- [x] Direct geometric sticker drag
- [x] No Front-based movement model
- [x] Generic layer turns
- [x] Object-relative cube orientation
- [x] 360°+ cube orientation
- [x] Center movement
- [x] 54 sticker identities
- [x] 54 position IDs
- [x] Sticker transition history
- [x] Sticker-identity-based rendering
- [x] One production HTML entry point
- [x] Obsolete preview files removed
- [x] Obsolete POV resolver removed
- [x] Legacy notation API removed
- [x] Regression suite passes

## Fix history

All fixes remain traceable in `FIX_LOG.md`.

The current Phase 5 architecture is the result of the later direct-geometric and sticker-position decisions, not the earlier POV/notation experiments.

## Repository cleanup status

The production entry point remains `index.html`; phase-specific HTML files are not recreated.

Current source modules are intentionally separated by responsibility:
- `src/core/` — cube state, sticker identity, generic turns, and Phase 6 shuffle generation.
- `src/animation/` — turn animation/runtime and Phase 6 shuffle lifecycle.
- `src/interaction/` — geometric drag resolution, manual pointer ownership, and cube orientation.
- `src/render/` — render model, Three.js renderer, and temporary turn adapter.
- `src/camera-*` — camera state and camera input.

`src/interaction/gesture.js` was removed in FIX-526 because its only production responsibility was small gesture configuration/helper logic now owned by `manual-controller.js`.

Phase 6 shuffle modules are wired into the single production entry point. The Play control starts a legal animated scramble on the main screen, hides for the active session, locks manual turns during playback, then returns the cube to the playable state. When the cube is solved, Reset appears to start a new session.
