# Shuffle / Scramble Specification

## Goal

Generate a legal scramble, never a random color arrangement.

## 1. Scramble algorithm

Start from solved state.

Repeatedly choose legal moves until target length is reached.

Recommended initial target:

```text
20–25 moves
```

Make this configurable.

---

## 2. Constraints

Avoid:

### Immediate inverse

Do not generate:

```text
R R'
```

or:

```text
U' U
```

### Same-face repetition

Prefer not to generate:

```text
R R R
```

unless intentionally representing a valid combined sequence.

### Excessive same-axis repetition

Optionally prevent sequences such as:

```text
R L R L R
```

from dominating the scramble.

This is a quality rule, not a mathematical solvability requirement.

---

## 3. Legal-state guarantee

Because the scramble is produced by legal moves from solved state:

```text
Solved → legal moves → reachable state
```

the result is always solvable.

No external solver is required just to guarantee scramble solvability.

---

## 4. Randomness

Use a suitable random source.

Allow a deterministic seed in development/testing.

Example:

```text
seed = "debug-001"
```

This allows reproducible bugs.

---

## 5. Scramble animation

The user should perceive:

- fast movement
- smooth turns
- clear direction
- no skipped visual frames

Recommended behavior:

- moderate turn duration
- very small inter-move gap
- sequential queue
- no overlapping layer turns

---

## 6. Input state

During scramble:

```text
cube interaction = locked
manual face moves = disabled
```

Camera interaction may remain available if safe.

---

## 7. Post-scramble

After final scramble move:

1. wait for animation completion
2. set status to `playing`
3. clear player history
4. enable manual interaction

---

## 8. Reshuffle

Reshuffle always starts a new session.

Required effects:

```text
new scramble
history = []
status = playing after scramble
completion overlay = hidden
```

---

## 9. Important rule

Never use:

```text
randomColor(face)
```

as a scramble implementation.

That can create impossible cube states.
