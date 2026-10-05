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
- Phase 7 — History & Solved Flow: **Complete**
- Phase 8 — UI & Responsive Product Shell: **FINAL / Complete**
- Phase 9–10: **Pending**

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

## Phase 7 result

The player-facing solve session now has:

- generic committed move history;
- scramble/player history separation;
- move counter;
- solve timer starting only after explicit Start, with paused inspection time excluded;
- solved result with time and move count;
- recent move history in the information panel;
- congratulations overlay;
- Reset / Play Again session boundary.

Scramble turns remain available through `StickerHistory` for internal auditing but are not counted as player moves.

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


### Current solve flow
After scrambling, the cube enters an inspection-only preview. The single session action button changes through **Main → Di proses → Mulai → Jeda ↔ Lanjut**. Starting the solve begins timing, enables moves, and automatically closes the session tab. Solved completion is automatic; **Atur Ulang** starts a fresh session.

- FIX-531: empty-space Rubik rotation remains available in PREVIEW and PAUSED; pointer interaction stays enabled while view-only mode blocks layer turns.


**Phase 7 fix:** Finish now accepts a visually solved cube as a fallback when strict sticker identity is not the deciding factor. Phase 8 is now finalized as the responsive product shell.
- FIX-533: Finish now accepts a solved color grouping: all nine stickers of each color must occupy the same face; no fixed world-face mapping is assumed.

### Phase 8 visual refinement — FIX-535
The current Phase 8 shell uses a cohesive retro puzzle-machine Sesi Kubus tab with tactile controls, chunky display typography, asymmetric panel shapes, and hard offset shadows. The previous lava background system and modern/glass/blue-gradient direction have been removed entirely.


### Current visual refinement — FIX-537
The main Rubik view starts slightly farther back. Every colored sticker now behaves like a small static LED: solid color with uniform emissive light, with no running animation and no gradient effect.


### Current visual refinement — FIX-538
Sticker lighting is static LED-style illumination. The running sweep from FIX-537 has been removed; sticker colors are solid and emissive.

### Current Phase 8 visual refinement — FIX-541
View controls are literal triangle/circle shapes, and the session panel uses one physically attached open/close tab with a slower unified transition.


### Current Phase 8 visual refinement — FIX-542

View controls are centered, zoom uses a full-width +/− bar, and the session panel proportions and persistent tab have been refined without changing gameplay behavior.

## FIX-543 — Grab Rotation Follows Pointer Direction

- **Status:** FIXED
- **Phase:** Phase 8 / interaction refinement
- **Problem:** Empty-space grab rotation felt inverted: dragging left/right or up/down rotated the Rubik opposite to the pointer movement.
- **Fix:** Screen-space drag deltas now map directly to the cube orientation quaternion without the previous sign inversion. A positive horizontal drag rotates the Rubik toward the right; a positive vertical drag rotates it toward the downward pointer movement.
- **Invariant:** Sticker/layer drag resolution, turn engine, camera, history, shuffle, timer, and solved-state behavior are unchanged.
- **Acceptance:** Horizontal and vertical grab-direction tests verify that the cube follows the pointer direction; full regression suite passes.


### Latest Phase 8 refinement — FIX-545

The session tab now has fixed physical slots and a stable geometry. The gameplay control is a single stateful button (`Main → Di proses → Mulai → Jeda ↔ Lanjut`), Finish has been removed in favor of automatic solved detection, Reset has a reserved slot, and the history viewport stays fixed at approximately three visible rows with internal scrolling. The attached tab can also be grabbed horizontally to open/close, while Start automatically closes it with a dedicated smooth transition.

### FIX-546

View controls were compacted without changing the fixed session-panel geometry: zoom `+`/`−` sit beside the rotate controls, and the bottom zoom rail is a standalone full-width bar.

## FIX-547 — Remove unused information menu and lift compact session panel

The unused top-right information/menu surface was removed from the product shell because the feature is not yet required. Its DOM, interaction handlers, scrim, side-menu content, and dedicated styling were removed. On compact screens the fixed session panel is positioned higher so its full border frame remains visible without changing the panel's established geometry.

### FIX-548
Compact/mobile session panel is now anchored within the visible viewport and capped to available height so the complete border remains visible without bottom overflow.


## FIX-549 — Fixed panel geometry, direct edge zoom, and pinch zoom

- Session panel uses a fixed 360px × 640px CSS design size and no longer derives its dimensions from responsive viewport calculations.
- Added a bottom breathing space so the internal zoom rail does not touch the panel border.
- Added a dedicated vertical edge zoom control on compact portrait screens and compact landscape screens, so zoom remains available without opening the session panel.
- Added two-finger pinch zoom to the camera controller; multi-touch is handed to camera zoom instead of cube/layer dragging.
- The panel content may scroll on unusually short viewports rather than changing the panel's design dimensions.

### FIX-550 panel refinement
The session panel now uses a single fixed 360×620 design geometry. Responsive behavior positions the panel within the viewport without shrinking its design size. History has a fixed three-row viewport, rotate/+/- controls share a compact row, the long zoom bar remains at the bottom, and direct edge zoom is available on compact touch layouts. The visible status paragraph was removed from the layout flow; its live region remains for accessibility announcements.
