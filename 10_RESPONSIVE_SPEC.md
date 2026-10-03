# Responsive Specification

## Supported environments

- Desktop Chrome/Edge/Firefox/Safari
- Mobile browsers
- Tablet browsers
- Portrait
- Landscape
- Browser zoom
- High-DPI screens

---

## 1. Layout principle

Use a fluid layout.

The 3D viewport should calculate its available size from its parent container.

Avoid assuming:

```text
canvas width = window.innerWidth
```

because side panels and browser UI may reduce available space.

---

## 2. ResizeObserver

The renderer should observe its actual container.

On resize:

1. read container dimensions
2. update renderer resolution
3. update camera aspect
4. update projection
5. preserve camera target
6. avoid resetting puzzle state

---

## 3. Browser zoom

Browser zoom must not break:

- cube visibility
- controls
- hit targets
- text wrapping
- camera interaction

---

## 4. Orientation

### Landscape

Prefer:

```text
cube + side controls
```

### Portrait

Prefer:

```text
cube
controls below
```

---

## 5. Mobile viewport

Do not assume `100vh` is stable on mobile.

Prefer dynamic viewport units where appropriate:

```css
100dvh
```

with fallbacks where necessary.

---

## 6. Cube sizing

Cube size should respond to the smaller available viewport dimension.

Conceptually:

```text
cubeSize = min(availableWidth, availableHeight) × scale
```

Leave room for controls.

---

## 7. Safe areas

Support devices with display cutouts using safe-area insets.

---

## 8. Zoom behavior

The zoom slider changes camera distance or field of view according to the chosen camera model.

Wheel and pinch should modify the same underlying zoom value.

There must be one source of truth for zoom.

---

## 9. Orientation changes

When switching portrait ↔ landscape:

- preserve cube state
- preserve history
- preserve scramble/solved status
- preserve camera orientation when reasonable
- resize renderer

Do not restart the game.
