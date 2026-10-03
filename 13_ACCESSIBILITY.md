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
