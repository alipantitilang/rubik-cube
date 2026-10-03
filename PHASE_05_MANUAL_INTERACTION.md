# PHASE 05 — Manual Rubik Interaction

## Status

**COMPLETE — canonical POV Front-Face Method**

Phase 5 converts direct pointer/touch manipulation into standard Rubik notation using a frozen POV frame and the project's canonical color orientation.

## 1. Canonical solved orientation

```text
U = Yellow
D = White
F = Red
R = Green
B = Orange
L = Blue
```

Only the four horizontal color faces may become the virtual POV front:

```text
Red    → F
Green  → R
Orange → B
Blue   → L
```

Yellow and White never become virtual `F`.

The complete color/facing contract lives in `21_COLOR_ORIENTATION_AND_POV.md`.

## 2. POV frame

At pointer-down on a sticker:

1. Read camera position relative to the cube target.
2. Ignore vertical camera component for front selection.
3. Compare horizontal viewing direction against physical `F/R/B/L` normals.
4. The dominant eligible face becomes virtual `F`.
5. Load its fixed adjacency:

| Virtual front | Up | Right | Left | Down | Back |
|---|---|---|---|---|---|
| `F` (red) | `U` yellow | `R` green | `L` blue | `D` white | `B` orange |
| `R` (green) | `U` yellow | `B` orange | `F` red | `D` white | `L` blue |
| `B` (orange) | `U` yellow | `L` blue | `R` green | `D` white | `F` red |
| `L` (blue) | `U` yellow | `F` red | `B` orange | `D` white | `R` green |

6. Freeze the frame for the whole pointer gesture.

At an exact horizontal tie the deterministic priority is:

```text
F > R > B > L
```

## 3. Picking contract

`RubikRenderer.pickFace(clientX, clientY)` returns:

```js
{
  face,
  normal,
  cubieId,
  cubieType,
  logicalPosition,
  object
}
```

`cubieType` is:

```text
center | edge | corner
```

All 26 visible cubies are valid interaction anchors. The internal `(0,0,0)` core does not exist as a visible object.

## 4. Gesture ownership

```text
pointer down on sticker
    → manual face interaction

pointer down on empty viewport
    → camera orbit
```

Once a pointer starts on a sticker, camera orbit cannot steal that pointer.

## 5. Live drag

After the gesture threshold:

```text
pointer displacement
      ↓
POV move resolver
      ↓
standard notation
      ↓
interactive layer rotation
```

The layer follows the pointer continuously.

On release:

- progress `>= 0.5` → snap to 90° and commit;
- progress `< 0.5` → return to the starting orientation and do not commit.

`CubeState` changes only after commit.

## 6. Standard notation

Supported output:

```text
R R' L L' U U' D D' F F' B B'
M M' E E' S S'
```

Slice conventions:

```text
M follows L
E follows D
S follows F
```

The logical engine and animation layer share the same slice membership rule: `M/E/S` rotate 4 middle-slice edge cubies. Center cubies remain fixed.

## 7. Front-face corner rules

For the current virtual `F`:

| Selected corner | Drag | Move |
|---|---|---|
| left-top | right | `U'` |
| right-top | left | `U` |
| left-bottom | right | `D` |
| right-bottom | left | `D'` |
| left-top | down | `L` |
| right-top | down | `R'` |
| left-bottom | up | `L'` |
| right-bottom | up | `R` |

Reverse drags resolve to the inverse of the listed move.

## 8. Front-face edge rules

| Selected edge | Drag | Move |
|---|---|---|
| top | down | `M` |
| left | right | `E` |
| bottom | up | `M'` |
| right | left | `E'` |

Reverse drags resolve to the inverse.

## 9. Situational right-side rules

When the current front remains dominant and the picked sticker is on virtual right:

### Corner

| Selected corner | Drag | Move |
|---|---|---|
| left-top | down | `F` |
| right-top | down | `B'` |
| left-bottom | up | `F'` |
| right-bottom | up | `B` |

### Edge

```text
top    + down → S
bottom + up   → S'
```

Reverse drags resolve to the inverse.

## 10. Situational left-side rules

When the current front remains dominant and the picked sticker is on virtual left:

### Corner

| Selected corner | Drag | Move |
|---|---|---|
| left-top | down | `F'` |
| right-top | down | `B` |
| left-bottom | up | `F` |
| right-bottom | up | `B'` |

### Edge

```text
top    + up   → S'
bottom + down → S
```

Reverse drags resolve to the inverse.

## 11. Center interaction

A center sticker is a direct face anchor. For an eligible front/side face, horizontal drag direction determines the face turn and its inverse.

### Red-front horizontal direction lock (`FIX-515`)

When the virtual front is physical `F` (red), horizontal movement follows the same visual direction as the user's grab:

| Front position | Grab direction | Expected visible row/column motion |
|---|---|---|
| Top-left corner | right | right |
| Top-right corner | left | left |
| Bottom-left corner | right | right |
| Bottom-right corner | left | left |
| Left edge | right | right |
| Right edge | left | left |

This is implemented as a red-front-specific correction in `pov-move-resolver.js`. The existing vertical mapping is unchanged. The F/R/B/L frame system remains intact, but green/orange/blue horizontal behavior is intentionally left unchanged until separately validated.

Yellow/White centers remain valid visible interaction anchors but do not receive POV-front authority. Their detailed fallback gesture behavior is intentionally not allowed to redefine the canonical front-face table.

## 12. Direction interpretation

Diagonal movement is not rejected. The dominant screen axis at the movement threshold determines horizontal versus vertical interpretation, and that axis remains locked for the gesture.

## 13. Data flow

```text
CameraController
      ↓
POVMoveResolver.resolvePovFrame()
      ↓
ManualInteractionController
      ↓
selected cubie + cubie type + logical position
      ↓
POV move table
      ↓
R/R'/L/L'/U/U'/D/D'/F/F'/B/B'/M/M'/E/E'/S/S'
      ↓
CubeTurnRuntime
      ↓
CubeState
      ↓
Renderer
```

Interaction code never edits sticker colors directly.

## 14. Acceptance

- [x] 26 visible cubies remain the interaction domain.
- [x] Center, edge, and corner anchors are identified from authoritative logical data.
- [x] Only F/R/B/L can become POV front.
- [x] Yellow/White never become POV front.
- [x] Fixed color adjacency is preserved under all four front orientations.
- [x] Front corner table matches the specified rules.
- [x] Front edge M/E table matches the specified rules.
- [x] Right/left side F/B/S table matches the specified rules.
- [x] M/E/S use standard direction conventions.
- [x] M/E/S keep center cubies fixed.
- [x] Live drag follows pointer progress.
- [x] Release snaps or cancels deterministically.
- [x] Camera and cube pointer ownership do not conflict.
- [x] Logical state changes only on commit.

Current automated regression:

```text
68 tests passed
0 failed
```
