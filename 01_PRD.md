# Product Requirements Document — Interactive Rubik 3×3

## 1. Product Summary

A responsive interactive 3D Rubik's Cube web experience.

The cube behaves like a physical 3×3 Rubik:

- six colored faces

- 26 visible cubies
- center internal position empty
- legal face turns
- legal scrambles
- reversible move history
- solved-state detection

The surrounding interface should feel clean, modern, responsive, and polished.

---

## 2. Goals

### Primary goals

- Create a Rubik that can actually be played.
- Preserve mathematically valid cube states.
- Make mouse/touch interaction intuitive.
- Make every face turn smooth and deterministic.
- Make automatic scrambling visually fast but readable.
- Keep the cube usable across desktop, tablet, and mobile.
- Keep the UI independent from the cube simulation.

### Secondary goals

- Provide manual camera controls.
- Provide a zoom control in addition to wheel/pinch.
- Provide move history.
- Provide a clear solved/completed state.
- Allow replay through Reshuffle.

### Non-goals for the first implementation

- Timer competition system.
- User accounts.
- Online multiplayer.
- Global leaderboard.
- AI solving animation.
- Arbitrary invalid cube editing.
- Sticker-level customization.

---

## 3. Main Screen

### Layout

Desktop:

```text
┌────────────────────────────────────────────────────┐
│ Header / title                                     │
├──────────────────────────────┬─────────────────────┤
│                              │ Controls             │
│                              │                     │
│         3D RUBIK             │ Rotate              │
│                              │ Zoom                │
│                              │ Play / Shuffle      │
│                              │ History             │
│                              │ Information         │
│                              │                     │
└──────────────────────────────┴─────────────────────┘
```

Mobile:

```text
┌─────────────────────────────┐
│ Header                      │
├─────────────────────────────┤
│                             │
│          3D RUBIK           │
│                             │
├─────────────────────────────┤
│ Compact controls            │
│ Rotate / Zoom / Play        │
│ History / Information       │
└─────────────────────────────┘
```

The layout must adapt instead of simply shrinking desktop UI.

---

## 4. Cube

### Geometry

Use a 3×3×3 logical coordinate system:

- X = left/right
- Y = down/up
- Z = back/front

Coordinates:

- `-1`
- `0`
- `+1`

The coordinate `(0,0,0)` has no visible cubie.

All other 26 positions contain exactly one cubie.

### Visible cubies

| Type | Count |
|---|---:|
| Corners | 8 |
| Edges | 12 |
| Centers | 6 |
| Total | 26 |

---

## 5. Colors

Default conventional face mapping:

| Face | Direction | Default color |
|---|---|---|
| U | +Y | White |
| D | -Y | Yellow |
| F | +Z | Green |
| B | -Z | Blue |
| R | +X | Red |
| L | -X | Orange |

The implementation must centralize this mapping so colors can be changed later without rewriting move logic.

### Visual requirement

Each sticker has a permanent color identity. The renderer uses that identity even after the sticker moves to another face.

Default solved sticker colors:

```text
red, orange, yellow, white, green, blue
```

The color palette is centralized in the renderer configuration.


---

## 6. Interaction

### Camera

Mouse:

- Left drag on empty scene area → orbit camera.
- Wheel → zoom.

Touch:

- One-finger drag on empty scene → orbit.
- Pinch → zoom.

### Cube interaction

A drag beginning on any visible sticker is a potential Rubik layer turn. All 26 visible cubies are valid anchors:

- center
- edge
- corner

The interaction is view-independent and has no Front/Back/Up/Down/Left/Right movement reference.

The resolver combines:

1. picked sticker surface normal;
2. screen drag direction;
3. camera screen basis;
4. current cube quaternion;
5. selected cubie's logical position.

It directly produces:

```text
{ axis, layer, quarterTurns }
```

A live turn follows pointer displacement. On release it snaps to 90° when the commit threshold is reached, otherwise it returns to its starting orientation.

The logical cube state changes only on commit.


## 7. Buttons

### Play

Play means:

> Automatically scramble the cube using a legal scramble sequence.

It must not randomly assign colors.

### Reshuffle

After solved state:

- reset history
- generate a new legal scramble
- animate the scramble
- return to playable state

### Rotate controls

Provide visible controls for camera orientation.

Suggested:

- Rotate Left
- Rotate Right
- Rotate Up
- Rotate Down
- Reset View

### Zoom

Provide:

- zoom slider
- zoom in
- zoom out
- reset zoom

Mouse wheel and pinch remain available.

---

## 8. Shuffle

The scramble must be generated from legal Rubik moves.

Never shuffle by independently randomizing stickers.

### Requirements

- Legal cube state only.
- Avoid immediate inverse moves.
- Avoid excessive repeated turns on the same axis.
- Use configurable scramble length.
- Default can be around 20–25 moves.
- The exact length should be configurable.

### Visual behavior

During automatic scramble:

- moves execute quickly
- turns remain smooth
- no visual teleporting
- no overlapping conflicting face animations
- input is temporarily locked
- history may either show scramble moves or reset after scramble according to product setting

Recommended default:

> Scramble history is cleared before user play begins, so the history represents the player's own solution path.

---

## 9. Solved State

A cube is solved when every face contains one uniform face color and all cubie orientations/positions match the solved configuration.

Solved detection must come from the logical cube state.

Do not determine solved status from approximate 3D rotations.

---

## 10. Congratulations

When the cube transitions from unsolved to solved:

- finish the final turn
- verify solved state
- show Congratulations overlay
- disable conflicting cube interaction while overlay is active
- provide Reshuffle

The cube itself must not have decorative animations beyond its actual movement.

Allowed outside cube:

- overlay fade
- panel transition
- button transition
- subtle background UI effects

Not allowed on cubies:

- bounce
- glow
- particle burst
- floating
- squash/stretch
- decorative rotation unrelated to a move

---

## 11. History

History stores legal moves.

Example:

```text
R U R' U' F2
```

Requirements:

- chronological order
- newest move visible
- clear/reset when a new game begins
- support inverse notation
- support double turns
- optionally allow undo/redo in future

---

## 12. Responsive

Must support:

- desktop landscape
- desktop portrait
- tablet landscape
- tablet portrait
- mobile landscape
- mobile portrait
- browser zoom changes
- high-DPI displays

No fixed assumption that `100vw` equals the usable visual area.

Use responsive containers and resize observers where appropriate.

---

## 13. Acceptance Criteria

The product is acceptable when:

- The cube has exactly 26 visible cubies.
- The internal center coordinate has no visible cubie.
- Every legal face move produces the correct next state.
- Four quarter-turns restore the previous state.
- Two half-turns restore the previous state.
- A move followed by its inverse restores the previous state.
- Scrambles are legal and solvable.
- Manual play can solve the cube.
- Solved detection is reliable.
- Camera orbit does not mutate cube state.
- Zoom does not mutate cube state.
- No face-turn animation overlaps another face-turn animation.
- Reshuffle resets history.
- UI works on supported responsive layouts.
