# Accessibility Specification

## Keyboard

All buttons must be keyboard reachable.

Focus should be visible.

---

## Screen readers

Controls should have meaningful labels.

Examples:

```text
Rotate cube left
Rotate cube right
Zoom in
Zoom out
Shuffle cube
Reshuffle cube
Reset camera
```

---

## Color

Do not communicate important UI state using color alone.

The Rubik itself naturally uses color as puzzle information, but UI status should also use:

- text
- icon
- position
- disabled state

---

## Reduced motion

Respect:

```text
prefers-reduced-motion
```

Cube turns remain functional but may use reduced duration.

UI transitions can be minimized.

---

## Touch

Controls need sufficiently large touch targets.

---

## Focus safety

3D pointer gestures must not trap keyboard focus.

---

## Error handling

If a rendering or interaction error occurs, provide a readable fallback message rather than leaving a blank screen.


## FIX-549 — Fixed panel geometry, direct edge zoom, and pinch zoom

- Session panel uses a fixed 360px × 640px CSS design size and no longer derives its dimensions from responsive viewport calculations.
- Added a bottom breathing space so the internal zoom rail does not touch the panel border.
- Added a dedicated vertical edge zoom control on compact portrait screens and compact landscape screens, so zoom remains available without opening the session panel.
- Added two-finger pinch zoom to the camera controller; multi-touch is handed to camera zoom instead of cube/layer dragging.
- The panel content may scroll on unusually short viewports rather than changing the panel's design dimensions.
