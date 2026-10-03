# Phase 5 — Manual Rubik Interaction

## Status

**COMPLETE**

Phase 5 integrates direct mouse/touch manipulation with the existing Phase 4 camera and Phase 3 turn runtime.

## Scope

Implemented:

- Three.js sticker raycasting/picking.
- Visible sticker face identification.
- Camera-space gesture projection into the selected face plane.
- Configurable drag threshold.
- Horizontal/vertical dominance classification.
- Ambiguous diagonal rejection.
- Face-specific tangent basis.
- Legal face move generation (`U/D/R/L/F/B` plus inverse).
- Pointer capture.
- Mouse interaction.
- Touch/Pointer Events interaction.
- Camera drag on empty scene.
- Face drag ownership once a sticker is selected.
- Input lock while a turn is active.
- Direct handoff to `CubeTurnRuntime`.
- No direct `CubeState` mutation from the interaction layer.

## Interaction ownership

The viewport resolves a pointer gesture as:

```text
UI controls
    ↓
active face gesture
    ↓
camera gesture on empty scene
```

A pointer that starts on a sticker is reserved for a possible face turn.

A pointer that starts on empty scene becomes camera orbit.

The two modes cannot run simultaneously for the same pointer.

## Picking contract

`RubikRenderer.pickFace(clientX, clientY)`:

1. converts client coordinates to normalized device coordinates;
2. raycasts the cube;
3. accepts visible sticker meshes only;
4. returns:
   - logical face;
   - world-space face normal;
   - cubie id;
   - intersected object.

The renderer does not change `CubeState`.

## Gesture classification

Defaults:

```text
maxTapDistancePx = 8
minDistancePx    = 12
dominanceRatio   = 1.15
```

Classification:

```text
tap          → no move
undetermined → keep waiting
horizontal   → face turn
vertical     → face turn
ambiguous    → no move
```

This prevents accidental moves from small pointer tremors and diagonal ambiguity.

## Projection

The pointer delta is first converted from screen space using the active camera's world-space right/up vectors.

Then the movement is projected onto the selected sticker's face plane:

```text
screen delta
    ↓
camera world basis
    ↓
face-plane projection
    ↓
face tangent basis
    ↓
horizontal / vertical gesture
```

This keeps gesture interpretation stable while the camera is orbiting.

## Face basis

Each face has a tangent basis:

| Face | Right | Up |
|---|---|---|
| U | +X | -Z |
| D | +X | +Z |
| R | -Z | +Y |
| L | +Z | +Y |
| F | +X | +Y |
| B | -X | +Y |

The interaction convention is:

- drag toward face-up → base face move;
- drag toward face-down → inverse face move;
- drag toward face-right → inverse face move;
- drag toward face-left → base face move.

The resulting command is always legal move notation and is passed to the existing animation runtime.

## Animation integration

The interaction controller does not apply moves directly.

Instead:

```text
pointer gesture
    ↓
gesture mapping
    ↓
runtime.enqueue(move)
    ↓
FaceTurnAnimator
    ↓
CubeTurnRuntime
    ↓
CubeState.applyMove() after animation
    ↓
renderer.renderCube()
```

This preserves the architecture rule that `CubeState` is authoritative.

## Camera conflict prevention

Phase 4's `CameraController` now exposes:

```js
cameraController.setPointerOrbitEnabled(false)
```

Phase 5 owns the primary pointer lifecycle and calls camera orbit explicitly only when the gesture started outside the cube.

Wheel zoom remains available through `CameraController`.

When `ManualInteractionController` is disposed, pointer orbit ownership is returned to the Phase 4 camera controller.

## Input locking

While `CubeTurnRuntime.busy` is true:

- new face gestures do not start;
- camera gestures do not start from the viewport;
- an already active turn is allowed to finish normally.

No partial second turn can be started.

## Tap behavior

A tap without sufficient movement produces no cube move.

No selection animation is introduced in this phase.

## Files

### Interaction

- `src/interaction/gesture.js`
- `src/interaction/manual-controller.js`
- `src/interaction/index.js`

### Renderer

- `src/render/cube-renderer.js` — sticker raycasting/picking.

### Camera

- `src/camera-controller.js` — pointer-orbit ownership control.

### Preview

- `public/phase5.html` — manual interaction preview with real face-turn render adapter.
- `public/index.html`

### Tests

- `tests/interaction.test.js`
- `tests/manual-controller.test.js`

## Acceptance checklist

- [x] Sticker can be picked through renderer raycasting.
- [x] Face is identified from the actual sticker.
- [x] Tap does not trigger a move.
- [x] Small movement stays below the turn threshold.
- [x] Ambiguous diagonal movement is rejected.
- [x] Horizontal/vertical gestures map to legal moves.
- [x] Camera orientation is included in gesture projection.
- [x] Sticker drag does not orbit camera.
- [x] Empty-scene drag orbits camera.
- [x] Pointer capture is used.
- [x] Touch uses Pointer Events.
- [x] Active animation locks new gestures.
- [x] Interaction does not mutate CubeState directly.
- [x] Turn is committed through CubeTurnRuntime.
- [x] Existing Phase 1–4 tests remain passing.

## Validation

Latest automated result:

```text
37 tests passed
0 failed
```

## Audit fixes

### FIX-501 — Face-turn render adapter wiring
The Phase 5 entry points now construct `FaceTurnRenderAdapter` and pass it to `CubeTurnRuntime`. Without this adapter, the logical move would commit but the physical face-turn animation would not be rendered.

### FIX-503 — Single gesture mapping contract
`ManualInteractionController` now delegates move mapping to `gestureToMove()` instead of maintaining a second mapping implementation.

## Known boundary

This phase intentionally does not add:

- scramble generation;
- move history UI;
- solved overlay;
- Play/Reshuffle flow;
- final responsive product shell.

Those belong to later phases.
