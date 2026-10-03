# PHASE 03 — Face-Turn Animation

## Phase status

**Complete**

Phase 3 connects the legal logical move engine from Phase 1 with the physical 3D renderer from Phase 2.

---

## 1. Objective

A legal Rubik move must look like a physical layer rotation rather than an instantaneous teleport. The logical state remains authoritative and is committed only when the animation reaches its exact end.

Supported move forms:

```text
R   R'   R2
U   U'   U2
D   D'   D2
L   L'   L2
F   F'   F2
B   B'   B2
```

---

## 2. Architecture

```text
CubeState
   │
   ├── legal move definition
   │
   ▼
TurnAnimator
   │
   ├── queue
   ├── duration
   ├── progress
   └── easing
   │
   ▼
TurnRenderAdapter
   │
   ├── select 9 layer cubies
   ├── move temporary pivot group
   └── rotate layer physically
   │
   ▼
CubeTurnRuntime
   │
   ├── commit CubeState at completion
   └── re-render exact logical state
```

The renderer must not become a second source of truth.

---

## 3. Layer pivot

A face turn temporarily moves exactly 9 visible cubies into a dedicated pivot group.

The pivot is placed at the center of the selected layer:

- X axis: `R/L`
- Y axis: `U/D`
- Z axis: `F/B`

The selected cubies are attached while preserving world transforms. The pivot then rotates around its local axis.

---

## 4. Animation timing

Default duration:

```text
220 ms
```

This is a baseline and may be tuned later without changing cube mathematics.

The animation uses cubic ease-in-out so that the layer accelerates and decelerates smoothly instead of starting and stopping abruptly.

The actual physical angle is derived from the legal move:

```text
quarter turn = ±90°
half turn    = 180°
```

No arbitrary final angle is accepted.

---

## 5. State synchronization

This is a critical rule.

During an active animation:

```text
visual transform = temporary
CubeState        = previous committed state
```

Only when progress reaches `1.0`:

```text
finish animation
       ↓
apply logical move
       ↓
re-render from CubeState
```

This prevents logical state from drifting away from the visible cube during interpolation.

---

## 6. Queue behavior

Multiple legal moves can be queued.

Example:

```text
R → U → R' → U'
```

Only one move owns the active pivot at a time. The next move starts after the previous move is committed.

The animation system must not create overlapping layer pivots for sequential moves.

---

## 7. Floating-point drift prevention

The renderer is allowed to use floating-point interpolation while the animation is active.

At completion, however, the logical state is reconstructed from exact integer cube coordinates and exact sticker orientations. The renderer then resets cubie transforms and derives their final visual state from `CubeState`.

Therefore repeated turns do not accumulate transform error.

---

## 8. Input locking boundary

Phase 3 provides the animation busy state:

```text
isAnimating
busy
queuedCount
```

Later interaction phases may use these flags to decide whether direct face input is accepted. Phase 3 itself does not implement mouse/touch gesture recognition.

---

## 9. Files

```text
src/animation/turn-animator.js
src/animation/cube-turn-runtime.js
src/render/turn-renderer.js
tests/animation.test.js
public/phase3.html
```

---

## 10. Acceptance checklist

- [x] 90° turns supported.
- [x] 180° turns supported.
- [x] Inverse turns supported.
- [x] Exactly 9 cubies selected for every face turn.
- [x] Temporary pivot group used for physical rotation.
- [x] CubeState is not mutated before animation completion.
- [x] CubeState is committed exactly once at completion.
- [x] Animation queue is FIFO.
- [x] Ease-in-out interpolation is deterministic.
- [x] Renderer resets final transforms from logical state.
- [x] Repeated/inverse animation sequences preserve logical correctness.
- [x] Automated regression suite passes.

---

## 11. Explicit non-goals

The following remain for later phases:

- camera orbit/zoom controls;
- mouse/touch face dragging;
- scramble generation;
- play button;
- history UI;
- congratulations UI;
- responsive product shell;
- accessibility controls.
