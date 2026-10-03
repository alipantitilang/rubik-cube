# Interaction Specification

## 1. Interaction modes

```text
CAMERA
FACE / SLICE TURN
UI CONTROL
```

## 2. Camera ownership

Pointer down on empty viewport starts camera orbit.

Pointer down on a sticker starts a possible cube gesture and reserves the pointer for the cube.

A face gesture cannot fall back to camera orbit after it crosses the movement threshold.

## 3. POV front-face method

Every new sticker gesture computes a frozen POV frame:

```text
camera position
    ↓
dominant physical face
    ↓
virtual F
    ↓
virtual R / L / U / D / B
```

The labels are relative to the current view.

The camera may be rotated to any orientation between gestures without changing the logical cube state.

## 4. Cubie coverage

All visible cubies are valid gesture anchors:

- 6 centers
- 12 edges
- 8 corners

The internal core is never an interaction target.

## 5. Pointer data

Picking must provide:

```js
{
  face,
  cubieId,
  cubieType,
  logicalPosition,
  normal
}
```

## 6. Direction resolution

The screen displacement is classified into a dominant horizontal or vertical axis after the movement threshold is crossed.

Diagonal gestures are accepted and resolved by dominant axis.

The selected axis remains fixed for the gesture.

## 7. Move resolution

The selected sticker, cubie type, cubie position, POV frame, and drag direction determine the standard move notation.

Supported outputs:

```text
R R' L L' U U' D D' F F' B B'
M M' E E' S S'
```

The exact corner/edge mappings are normative and documented in `PHASE_05_MANUAL_INTERACTION.md`.

## 8. Live drag

Once the gesture starts:

```text
progress = dominantPointerDistance / pixelsPerQuarterTurn
```

The selected layer visually follows that progress continuously.

## 9. Release

```text
progress >= 0.5 → commit 90° move
progress < 0.5  → cancel / return to start
```

The logical state changes only on commit.

## 10. Camera conflict prevention

The manual interaction controller disables Phase 4 pointer-orbit ownership while installed and explicitly performs camera orbit only for empty-scene gestures.

Wheel zoom remains owned by `CameraController`.

## 11. Input lock

While `CubeTurnRuntime.busy` is true, new cube gestures are ignored.

No two interactive turns may be active simultaneously.

## 12. Accessibility and touch

Pointer Events are used for mouse and touch.

The viewport uses local custom gesture handling. UI controls remain separate from the cube interaction layer.
