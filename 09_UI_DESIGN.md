# UI / Visual Design Specification

## Design direction

Modern, clean, premium, game-like but not noisy.

The Rubik is the hero.

The interface should support the cube rather than compete with it.

---

## 1. Visual hierarchy

Priority:

1. Cube
2. Play / Reshuffle
3. Camera and zoom
4. History
5. Information

---

## 2. Main viewport

The 3D viewport should have enough breathing room.

Avoid putting dense UI directly over the cube.

---

## 3. Control panel

Recommended groups:

### Cube

- Play
- Reshuffle

### View

- Rotate left
- Rotate right
- Rotate up
- Rotate down
- Reset view
- Zoom slider
- Zoom reset

### Information

- Rotate & zoom instructions
- Face-turn instructions

### History

Move list.

---

## 4. Play button

Before first scramble:

```text
PLAY
```

During scramble:

```text
SCRAMBLING…
```

After scramble:

```text
PLAYING
```

When solved:

```text
RESHUFFLE
```

---

## 5. History display

Example:

```text
MOVE HISTORY

01  R
02  U
03  R'
04  U'
05  F2
```

Keep the newest move easy to locate.

On small screens, use a compact scroll area.

---

## 6. Information

Suggested content:

```text
Rotate:
Drag the empty area around the cube.

Zoom:
Use the wheel, pinch gesture, or zoom slider.

Turn a face:
Drag a visible sticker in the direction you want the face to move.
```

Keep instructional text short.

---

## 7. Congratulations

Overlay:

```text
Congratulations!

Cube solved.

[ Reshuffle ]
```

Do not overdecorate.

---

## 8. Color system

Cube face colors should be configurable.

UI colors should be separate from cube colors.

Do not let UI theme decisions alter puzzle color identity unless intentionally configured.

---

## 9. Contrast

Text and controls must meet accessible contrast targets.

Do not rely on color alone to communicate:

- active state
- disabled state
- selected state

---

## 10. Hit areas

Touch controls should have sufficiently large interactive areas.

Avoid tiny icon-only controls on mobile.

---

## 11. Responsive panel

Desktop:

```text
side panel
```

Mobile:

```text
bottom sheet / stacked controls
```

Tablet:

```text
adaptive side or bottom panel
```

Use available space rather than a fixed breakpoint-only strategy.


## Phase 8 implementation result

The production shell now follows the visual hierarchy above: the Rubik remains the hero, with state, timer, moves, history, view controls, and actions grouped into a compact responsive panel. The former notation-style history example is superseded by generic axis/layer/turn display to match the active move model.
