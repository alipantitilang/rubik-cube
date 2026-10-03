# PHASE 05 — Manual Rubik Interaction

## Status

**COMPLETE — direct geometric layer interaction**

## 1. New interaction contract

Phase 5 no longer uses Front/Back/Up/Down/Left/Right as movement references.

The user drags a visible sticker. The system determines the layer and rotation direction directly from geometry:

```text
sticker normal
     +
screen drag direction
     +
cube orientation
     ↓
world drag vector
     ↓
cube-local drag tangent
     ↓
rotation axis = stickerNormal × tangent
     ↓
snap to X/Y/Z
     ↓
cubie's coordinate on that axis
     ↓
{ axis, layer, quarterTurns }
```

## 2. No Front concept

There is no active Front face and no virtual Front frame.

The same algorithm is used whether the user sees red, orange, yellow, white, green, blue, or any combination of faces.

## 3. Direction principle

Positive rotation is chosen so the selected sticker's normal moves toward the drag tangent.

Therefore the layer visually follows the user's drag instead of depending on a named face.

## 4. Cube orientation

Empty-space drag rotates the Rubik object through `CubeOrientationController`.

```text
empty drag
   ↓
CubeOrientationController
   ↓
cubeGroup quaternion
```

Camera pointer orbit remains disabled for Phase 5. Camera zoom remains available.

## 5. Gesture freeze

At sticker `pointerdown`, the controller captures:

- camera screen-right
- camera screen-up
- cube quaternion
- physical sticker face
- cubie logical position

The captured geometry remains fixed for the gesture.

## 6. Live turn

After the movement threshold:

```text
pointer displacement
      ↓
resolveDragTurn()
      ↓
generic turn descriptor
      ↓
CubeTurnRuntime.beginInteractive()
      ↓
FaceTurnRenderAdapter
```

The logical state is unchanged during the preview.

On release:

- progress ≥ commit threshold → commit 90°;
- progress < commit threshold → cancel preview.

## 7. Middle slices

If the selected cubie's coordinate on the perpendicular axis is `0`, the turn targets the middle slice.

Only the four edge cubies participate. Centers remain fixed.

## 8. Diagonal drags

Diagonal input is projected onto the sticker plane. The perpendicular layer axis is then snapped to the nearest cube axis.

This avoids any Front-based classification.

## 9. 54-sticker tracking

Every commit updates the permanent sticker registry.

Example:

```text
rc1: p01 → p37
```

The sticker remains `rc1`; only its current position changes.

## 10. Architecture

```text
Camera = viewer/reference
CubeOrientation = visual object orientation
CubeState = logical cubie + sticker state
StickerRegistry = permanent 54 identities + 54 positions

sticker drag
  ↓
drag-move-resolver
  ↓
generic turn {axis, layer, quarterTurns}
  ↓
CubeTurnRuntime
  ↓
FaceTurnRenderAdapter
  ↓
CubeState.applyTurn()
  ↓
StickerHistory
```

## 11. Picking

Picking still exposes:

```js
{
  face,
  normal,
  cubieId,
  cubieType,
  logicalPosition,
  object
}
```

The `face` field is a local geometric surface label, not a movement command.

## 12. Files

- `src/interaction/drag-move-resolver.js`
- `src/interaction/manual-controller.js`
- `src/interaction/cube-orientation-state.js`
- `src/interaction/cube-orientation-controller.js`
- `src/core/turn.js`
- `src/core/sticker-map.js`
- `src/core/cube.js`
- `src/animation/cube-turn-runtime.js`
- `src/animation/face-turn-animator.js`
- `src/render/face-turn-renderer.js`
- `tests/drag-move-resolver.test.js`
- `tests/sticker-history.test.js`

## 13. Acceptance

- [x] No Front-based move resolution.
- [x] All visible sticker faces use one geometric rule.
- [x] Direction follows drag geometry.
- [x] Diagonal drag supported.
- [x] Cube quaternion included in resolver.
- [x] Empty-space drag rotates the cube object.
- [x] Camera pointer orbit disabled for Phase 5.
- [x] Generic turn descriptor replaces notation in Phase 5 runtime.
- [x] 54 permanent sticker codes exist.
- [x] 54 permanent position IDs `p01..p54` exist.
- [x] Committed turns record sticker `from → to` transitions.
- [x] Renderer displays sticker color by sticker identity, not current face.
- [x] Full regression suite: **72 passed, 0 failed**.
