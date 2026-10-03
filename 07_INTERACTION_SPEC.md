# Interaction Specification

## Core principle

The user manipulates the Rubik as a free 3D object. There is no movement reference called Front, Back, Up, Down, Left, or Right.

## Sticker drag

```text
pointerdown on sticker
      ↓
freeze view geometry
      ↓
drag vector
      ↓
sticker-plane tangent
      ↓
perpendicular layer axis
      ↓
X/Y/Z + layer coordinate
      ↓
quarter-turn direction
      ↓
generic turn
```

The result is `{ axis, layer, quarterTurns }`.

## Empty-space drag

Empty viewport drag rotates the cube object through its quaternion orientation controller.

Camera pointer orbit is disabled in Phase 5.

## Gesture ownership

- sticker hit → layer-turn gesture
- empty viewport → cube orientation gesture
- input lock → neither gesture may start

## Gesture freeze

Sticker gestures capture camera screen basis and cube orientation at pointerdown. The interpretation cannot change because of later view changes.

## Direction

The layer rotates so the touched sticker's surface normal moves toward the projected drag direction. This makes the layer follow the user's drag regardless of which faces are visible.

## Center / edge / corner

All 26 visible cubies can be selected. The cubie coordinate on the computed layer axis determines which row/slice is affected.

## Diagonal drag

Diagonal drag is allowed. The resolver projects the drag onto the sticker plane and snaps the resulting perpendicular axis to X/Y/Z.

## Logical commit

The render preview may animate continuously, but `CubeState` is updated only on commit.

After commit, `StickerHistory` records each changed sticker:

```text
stickerCode: oldPosition → newPosition
```

## No notation dependency

Phase 5 does not create or consume `R`, `R'`, `L`, `U`, `D`, `F`, `B`, `M`, `E`, or `S` strings.
