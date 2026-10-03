# Interaction Specification

## 1. Interaction modes

The application has three primary interaction modes:

```text
CAMERA
FACE TURN
UI CONTROL
```

The system must resolve which mode owns the pointer gesture.

---

## 2. Camera orbit

### Desktop

Start:

- pointer down on empty scene area

Continue:

- pointer movement

Result:

- camera orbit

Release:

- stop orbit

### Mobile

One-finger drag on empty scene:

- camera orbit

---

## 3. Face-turn gesture

Start:

- pointer down on a visible cubie/sticker

Track:

- starting face
- starting local coordinate
- movement vector
- projected movement inside face plane

When movement exceeds threshold:

```text
gesture becomes FACE TURN
```

Once classified as a face turn, it must not switch back to camera orbit during the same gesture.

---

## 4. Threshold

Use a configurable threshold.

Conceptual:

```text
threshold = max(physical minimum, viewport-scaled minimum)
```

Avoid a threshold so small that tiny finger tremors trigger moves.

Avoid a threshold so large that mobile users cannot reliably turn a face.

---

## 5. Direction mapping

The selected sticker face provides the plane.

Example:

```text
F face:
  horizontal drag → U/D? depending on selected row/column
  vertical drag → L/R? depending on selected region
```

The exact mapping must be derived mathematically from:

- face normal
- face tangent
- face bitangent
- pointer displacement

Do not hard-code a separate arbitrary rule for every face if a generic basis can be created.

---

## 6. Row/column selection

The starting cubie's position identifies the layer that is turned.

For example:

- starting on F/R/U sticker → choose the appropriate visible layer
- drag direction determines the face-turn direction

The interaction should emulate a physical cube rather than rotate only the selected cubie.

---

## 7. Click

A click/tap without enough movement must not trigger a face turn.

Potential future behavior:

- select/highlight
- no action

Initial implementation:

```text
tap = no cube move
```

---

## 8. Gesture priority

Recommended priority:

```text
UI controls
    ↓
active face-turn gesture
    ↓
camera gesture
```

A pointer started on a UI element must never leak into the 3D scene.

---

## 9. Touch prevention

Prevent browser gestures only where necessary.

Do not globally disable:

- scrolling
- pinch zoom
- browser navigation

Use local gesture handling on the 3D viewport.

---

## 10. Camera controls

Buttons:

```text
← Rotate
→ Rotate
↑ Rotate
↓ Rotate
Reset
```

Zoom:

```text
−
slider
+
Reset
```

---

## 11. Keyboard

Optional but recommended:

```text
Arrow keys → camera
+ / -       → zoom
R U F etc.  → face moves
```

Keyboard shortcuts must not trigger when typing into a text field.

---

## 12. Input lock

During active move animation:

- queue or ignore new face gestures according to implementation
- never partially start two conflicting turns

Recommended initial behavior:

```text
active turn → ignore new face-turn gesture
```

This is simpler and safer.

---

## 13. Reduced motion

If `prefers-reduced-motion` is active:

- keep cube turns functional
- shorten animation duration
- remove nonessential UI transitions

Never disable core interaction.


---

## Phase 5 Implementation Notes

The manual interaction contract is implemented in:

- `src/interaction/gesture.js`
- `src/interaction/manual-controller.js`
- `src/render/cube-renderer.js`

The renderer performs sticker raycasting and returns the selected logical face plus its world-space normal.

The interaction controller then:

1. reserves the pointer;
2. projects movement into the selected face plane;
3. classifies the gesture;
4. maps it through the shared `gestureToMove()` contract;
5. sends the move to `CubeTurnRuntime`.

Empty-scene pointer drags are delegated to the existing Phase 4 camera controller.

During an active turn, the viewport is input-locked to prevent conflicting gestures.

The current implementation uses:

```text
tap <= 8 px
turn threshold >= 12 px
dominance ratio = 1.15
```

These values remain configurable through `GESTURE_CONFIG`.
