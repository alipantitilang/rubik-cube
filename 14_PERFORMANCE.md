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


## FIX-549 — Fixed panel geometry, direct edge zoom, and pinch zoom

- Session panel uses a fixed 360px × 640px CSS design size and no longer derives its dimensions from responsive viewport calculations.
- Added a bottom breathing space so the internal zoom rail does not touch the panel border.
- Added a dedicated vertical edge zoom control on compact portrait screens and compact landscape screens, so zoom remains available without opening the session panel.
- Added two-finger pinch zoom to the camera controller; multi-touch is handed to camera zoom instead of cube/layer dragging.
- The panel content may scroll on unusually short viewports rather than changing the panel's design dimensions.
