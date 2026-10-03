# Animation Specification

## Core Principle

The Rubik itself has only one type of animation:

> physical layer movement.

This includes outer face turns and the middle slice turns `M`, `E`, and `S`. Outer face turns contain 9 visible cubies; standard middle-slice turns animate 4 edge cubies while the four center cubies remain fixed.

Everything else is UI animation.

---

## 1. Face-turn animation

A quarter turn should rotate exactly:

```text
90°
```

A half turn:

```text
180°
```

An inverse:

```text
-90°
```

---

## 2. Easing

Use a smooth physical-feeling easing.

Avoid:

- extreme elastic easing
- bounce
- overshoot
- dramatic spring

A face should arrive at its final orientation exactly.

---

## 3. Duration

Suggested starting point:

```text
quarter turn: ~160–260 ms
half turn:    ~220–320 ms
```

Tune based on actual interaction.

Do not make it so fast that the player cannot understand the move.

---

## 4. Scramble animation

Scramble may use the same core turn animation but with a faster cadence.

Important:

> Faster does not mean teleporting.

Every move still completes its geometric rotation.

---

## 5. No interpenetration

Cubies must not visibly:

- detach
- scale
- squash
- pass through impossible positions

Minor renderer precision issues should be corrected by snapping to exact final transforms after a turn.

---

## 6. Finalization

At animation end:

```text
animation transform
      ↓
logical state
      ↓
exact render transform
```

This prevents accumulated floating-point drift.

---

## 7. UI animation

Allowed:

- overlay fade
- panel slide
- button hover
- focus transition
- modal transition

Not allowed on cube:

- idle breathing
- shine sweep
- particle burst
- glow pulse
- celebratory spin

---

## 8. Congratulations

The cube itself stays still after solving.

The Congratulations layer may appear with a subtle UI transition.

---

## 9. Animation synchronization

Never let the visual cube indicate that a move finished while the logical state still represents the old state.

The commit boundary must be explicit.
