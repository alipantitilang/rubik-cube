# Application State Machine

## States

```text
IDLE
SCRAMBLING
PLAYING
SOLVED
```

---

## IDLE

Initial state.

Cube is solved.

User can:

- rotate camera
- zoom
- Play

---

## SCRAMBLING

The cube is executing an automatic legal scramble.

Rules:

- manual face turns disabled
- move queue active
- history not treated as player history
- Play disabled
- camera may remain active

Transition:

```text
SCRAMBLING → PLAYING
```

after final scramble move.

---

## PLAYING

User can:

- rotate camera
- zoom
- perform face turns
- view history

After every committed move:

```text
check solved
```

If solved:

```text
PLAYING → SOLVED
```

---

## SOLVED

Show Congratulations.

Disable normal face-turn interaction while completion overlay is active.

Available:

- camera
- zoom
- Reshuffle

Transition:

```text
SOLVED → SCRAMBLING
```

---

## Invalid transitions

Examples:

```text
SCRAMBLING → manual move
```

must not mutate state.

```text
SOLVED → manual move
```

must not mutate state while completion UI is active.

---

## Session reset

Reshuffle creates:

```text
new legal scramble
history = []
completion = false
```

---

## Important distinction

`gameState` and `cameraState` are separate.

Camera changes never trigger cube-state transitions.


## Phase 7 session layer

The Phase 6 shuffle state is extended with a session layer:

```text
READY → SCRAMBLING → PLAYING → SOLVED
  ↑                         |
  └──── Reset / Play Again ┘
```

`PLAYING` starts the solve timer and accepts player turns. `SOLVED` stops the timer, freezes player interaction, and preserves the completed move history until the next session boundary.
