# PHASE 05 — Final Manual Rubik Interaction

## Status

**COMPLETE — final direct-geometric sticker/position model**

Phase 5 is the finalized interaction foundation for the current project architecture.

## 1. Core contract

There is no movement reference named Front, Back, Up, Down, Left, or Right.

A sticker drag is resolved directly from geometry:

```text
picked sticker
    ↓
sticker local normal
    +
screen drag
    +
camera screen basis
    +
cube quaternion
    +
cubie logical position
    ↓
cube-local drag tangent
    ↓
rotation axis = stickerNormal × tangent
    ↓
snap to X / Y / Z
    ↓
layer coordinate -1 / 0 / +1
    ↓
{ axis, layer, quarterTurns }
```

The turn descriptor is the only movement command required by Phase 5.

## 2. Cube orientation

The Rubik is the object being rotated.

```text
Camera = viewer/reference
CubeOrientation = visual object orientation
CubeState = logical puzzle state
```

Dragging empty viewport rotates `cubeGroup` through `CubeOrientationController`.

Camera pointer orbit is disabled for the final Phase 5 interaction model. Camera zoom remains available.

The cube quaternion can accumulate through multiple full rotations without yaw wrapping.

## 3. Sticker drag

At `pointerdown`, the controller captures:

- picked physical sticker face;
- cubie type;
- cubie logical position;
- camera screen-right;
- camera screen-up;
- cube quaternion.

That geometry is frozen for the gesture.

Later visual changes cannot silently change the turn being previewed.

## 4. Direction

The resolver projects the screen drag into cube-local space and onto the sticker plane.

The rotation axis is derived geometrically:

```text
axis = stickerNormal × dragTangent
```

The axis is snapped to the nearest local cube axis.

The cubie's coordinate on that axis selects the layer.

The resulting quarter-turn direction makes the selected sticker surface follow the user's drag direction.

## 5. Center, edge, and corner anchors

All 26 visible cubies can start a gesture.

For an outer layer:

```text
9 cubies
```

For a middle slice:

```text
4 edge cubies
+
4 center cubies
=
8 cubies
```

Center cubies are therefore movable. A center sticker can change face-position slot after a turn.

## 6. Sticker identity model

There are exactly 54 permanent sticker identities.

Examples:

```text
red:
rc1 rc2 rc3 rc4
re1 re2 re3 re4
rc

orange:
oc1 ... oe4 oc

yellow:
yc1 ... ye4 yc

white:
wc1 ... we4 wc

green:
gc1 ... ge4 gc

blue:
bc1 ... be4 bc
```

The code never changes.

## 7. Position model

There are exactly 54 permanent physical sticker slots:

```text
p01 ... p54
```

In the solved state, each sticker has one initial slot.

Example:

```text
rc1 → p01
re1 → p02
rc  → p05
```

After a committed turn:

```text
rc1: p01 → p37
```

Only the position changes.

## 8. History

`StickerHistory` records every changed sticker for every committed turn:

```js
{
  code: 'rc1',
  from: 'p01',
  to: 'p37'
}
```

Per-sticker history can reconstruct the sticker's complete path:

```text
rc1
p01 → p37
p37 → p39
p39 → p10
...
```

The six center stickers use exactly the same mechanism.

## 9. Rendering rule

Sticker material color is derived from the sticker's permanent color identity.

It is never inferred from the local face it currently occupies.

This allows a red sticker to occupy a position that was originally orange, yellow, green, blue, or white.

## 10. Animation and commit

The interaction pipeline is:

```text
pointerdown
  ↓
pick sticker
  ↓
freeze gesture geometry
  ↓
resolveDragTurn()
  ↓
generic turn
  ↓
CubeTurnRuntime.beginInteractive()
  ↓
TurnRenderAdapter
  ↓
live preview
  ↓
pointerup
  ├─ commit → CubeState.applyTurn() → StickerHistory
  └─ cancel → restore preview
```

`CubeState` is not mutated during the preview.

## 11. Picking contract

Picking returns:

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

`face` is a local geometric surface label only. It is not a movement notation.

## 12. Active implementation

```text
src/core/cube.js
src/core/turn.js
src/core/sticker-map.js

src/interaction/gesture.js
src/interaction/drag-move-resolver.js
src/interaction/manual-controller.js
src/interaction/cube-orientation-state.js
src/interaction/cube-orientation-controller.js

src/animation/turn-animator.js
src/animation/cube-turn-runtime.js

src/render/cube-render-model.js
src/render/cube-renderer.js
src/render/turn-renderer.js

index.html
styles.css
```

## 13. Cleanup decisions

The final Phase 5 architecture removes:

- `pov-move-resolver.js`;
- virtual Front/Back/Up/Down/Left/Right movement mapping;
- notation-based movement APIs;
- obsolete Phase 3/4/5 preview HTML pages;
- duplicated generic animation/render adapter naming;
- legacy move-history containers that are not used by the sticker-position model.

Historical documentation may still mention earlier architectures because the Fix Log is intentionally immutable history.

## 14. Acceptance

- [x] No Front-based movement resolution.
- [x] No notation dependency.
- [x] All visible sticker faces use one geometric rule.
- [x] Direction follows drag geometry.
- [x] Diagonal drag supported.
- [x] Cube quaternion included in resolver.
- [x] Empty-space drag rotates the cube object.
- [x] Camera pointer orbit disabled for Phase 5.
- [x] Generic turn descriptor is the movement command.
- [x] 54 permanent sticker codes exist.
- [x] 54 permanent position IDs `p01..p54` exist.
- [x] Center stickers move with middle slices.
- [x] StickerHistory records `code: from → to`.
- [x] Renderer color follows sticker identity.
- [x] One production HTML entry point remains: `index.html`.
- [x] Full regression suite passes after cleanup.
