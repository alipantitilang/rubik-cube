# Performance Specification

## Target

The experience should feel responsive on modern desktop and mobile hardware.

## Priorities

1. Correctness
2. Input responsiveness
3. Stable frame rate
4. Visual quality

---

## Rendering

Only 26 cubies need to be represented.

Avoid creating unnecessary objects per frame.

---

## Reuse

Reuse:

- geometry
- materials where possible
- stable render objects

Do not recreate all cubies after every move.

---

## Animation loop

Animation should be driven by the renderer's frame loop.

Do not use many independent timers to animate individual cubies.

---

## Resize

Avoid expensive full-scene reconstruction on resize.

Only update:

- renderer dimensions
- camera projection
- relevant layout values

---

## History

Move history is tiny and should not affect performance.

---

## Debug mode

Development mode may expose:

- current move
- current state
- cubie IDs
- coordinate positions
- orientation
- queue status
- FPS

Debug UI must not ship as visible production UI.
