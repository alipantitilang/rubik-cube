# Color Orientation & POV Front-Face Contract

## Status

**ACTIVE — canonical orientation contract for manual interaction**

This document is the single source of truth for the solved color orientation and the rule that determines which physical face may become the POV front face.

## 1. Canonical solved orientation

The cube starts in this orientation:

```text
           U = Yellow
              ↑
L = Blue  ←  F = Red  →  R = Green
              ↓
           D = White

           B = Orange
```

Logical face-to-color mapping:

| Face code | Color | Coordinate normal |
|---|---|---|
| `U` | Yellow | +Y |
| `D` | White | -Y |
| `F` | Red | +Z |
| `B` | Orange | -Z |
| `R` | Green | +X |
| `L` | Blue | -X |

These identities are stable. Face turns do not exchange center identities.

## 2. POV front-face eligibility

Only these four physical faces can become the virtual POV front:

```text
Red    = F
Green  = R
Orange = B
Blue   = L
```

Yellow (`U`) and White (`D`) never become virtual `F`.

When the camera is elevated or lowered, the vertical camera component is ignored for front-face selection. The horizontal camera direction is compared against the four side-face normals.

This means the player may view the cube from any pitch, but the front-face authority always comes from one of the four horizontal color faces.

## 3. Fixed adjacency for every allowed front

### Red front (`F`)

```text
       Yellow / U
Blue / L  Red / F  Green / R
       White / D
       Orange / B
```

### Green front (`R`)

```text
       Yellow / U
Red / F  Green / R  Orange / B
       White / D
       Blue / L
```

### Orange front (`B`)

```text
       Yellow / U
Green / R  Orange / B  Blue / L
       White / D
       Red / F
```

### Blue front (`L`)

```text
       Yellow / U
Orange / B  Blue / L  Red / F
       White / D
       Green / R
```

The right/left relationship is fixed by cube orientation, not by camera roll.

## 4. Dominant-face rule

At the beginning of each sticker gesture:

1. Read the camera position relative to the cube target.
2. Project the viewing direction onto the horizontal XZ plane.
3. Compare it with `F/R/B/L` normals.
4. The highest-scoring eligible face becomes virtual `F`.
5. Load the fixed adjacency table for that face.
6. Freeze the resulting POV frame for the entire gesture.

At an exact tie, a deterministic priority is used so the resolver cannot oscillate between two frames:

```text
F > R > B > L
```

## 5. Why centers remain fixed

The center cubies carry the permanent face/color identity. They are visible interaction anchors, but their identity must not migrate to another face.

Therefore:

- `M`, `E`, and `S` do not move center cubies;
- they rotate the four middle-slice edge cubies;
- outer face turns rotate 9 cubies;
- the cube still contains exactly 26 visible cubies.

## 6. Interaction meaning

The POV frame is only an interpretation layer.

```text
camera + color orientation
        ↓
virtual POV frame
        ↓
selected cubie / sticker
        ↓
user drag
        ↓
standard notation
        ↓
CubeTurnRuntime
        ↓
CubeState
```

The resolver never edits colors directly.

## 7. Required consistency

Any future change to solved color orientation must update, at minimum:

- `src/core/cube.js`
- `src/render/cube-render-model.js`
- `src/interaction/pov-move-resolver.js`
- renderer color tests
- POV interaction tests
- this document
- `README.md`
- `FIX_LOG.md`
- relevant phase specifications
