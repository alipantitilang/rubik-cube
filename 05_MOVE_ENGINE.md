# Move Engine Specification

## Objective

Implement a reliable Rubik move engine before polishing the UI.

## 1. Command flow

```text
Move Request
    ↓
Validate
    ↓
Create Move
    ↓
Animate
    ↓
Commit State
    ↓
Update History
    ↓
Check Solved
```

## 2. Face layer selection

Example:

```text
R → x = +1
L → x = -1
U → y = +1
D → y = -1
F → z = +1
B → z = -1
```

Only cubies on the selected layer participate in that move.

A face turn therefore affects exactly 9 cubies.

---

## 3. Position rotation

For a quarter turn around an axis, rotate the integer position coordinates by 90 degrees.

Do not use floating point logical coordinates.

Logical coordinates must remain exactly:

```text
-1, 0, +1
```

after every committed move.

---

## 4. Orientation

Position rotation alone is not sufficient.

The cubie's sticker orientation must rotate with the cubie.

A cubie originally having:

```text
U + F + R
```

must become correctly oriented after a turn.

---

## 5. Rendering transform

Logical transform:

```text
integer position + discrete orientation
```

Renderer transform:

```text
world-space position + world-space quaternion
```

The conversion belongs to the renderer.

---

## 6. Move transaction

A move transaction should contain:

```ts
{
  move,
  affectedCubies,
  startState,
  animationProgress,
  committed
}
```

Only `committed = true` may modify the authoritative state.

---

## 7. Cancellation

For initial version:

> Do not cancel an active face turn.

Finish the current turn, then accept the next input.

This avoids partially committed states.

---

## 8. Queue

Automatic scramble uses:

```text
MoveQueue
```

Example:

```text
[R, U, R', U', F, ...]
```

The queue processes one animation at a time.

---

## 9. History

History stores committed player moves.

A queued automatic scramble should not be treated as player history by default.

---

## 10. Testing requirements

For every face:

- move × 4 = identity
- move + inverse = identity
- move2 × move2 = identity

For sequences:

```text
R U R' U'
```

must be deterministic.

Applying a sequence and then its exact inverse sequence must restore the original state.
