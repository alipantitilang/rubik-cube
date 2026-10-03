# Cube Model Specification

## 1. Coordinate system

Use a right-handed logical coordinate system.

```text
          +Y (U)
           ↑
           |
-LX ←------0------→ +X (R)
          /
        +Z (F)
```

The exact renderer coordinate system may differ, but a single conversion layer must exist.

---

## 2. Positions

All combinations of:

```text
x ∈ {-1,0,1}
y ∈ {-1,0,1}
z ∈ {-1,0,1}
```

except:

```text
(0,0,0)
```

are valid visible cubie positions.

Total:

```text
3 × 3 × 3 - 1 = 26
```

---

## 3. Cubie classification

A cubie has:

```text
number of non-zero coordinates
```

Classification:

- 3 non-zero coordinates → corner
- 2 non-zero coordinates → edge
- 1 non-zero coordinate → center
- 0 → internal core / empty position

Counts:

- corners: 8
- edges: 12
- centers: 6

---

## 4. Sticker identity

A sticker is not just a color.

It should have a stable identity tied to the original cubie.

Conceptually:

```ts
type Sticker = {
  face: Face
  color: ColorId
}
```

This makes orientation changes traceable.

---

## 5. Face definitions

```text
U = +Y
D = -Y
R = +X
L = -X
F = +Z
B = -Z
```

Canonical solved colors:

```text
U = yellow
D = white
R = green
L = blue
F = red
B = orange
```

The four side faces F/R/B/L are the only faces eligible for POV-front authority.

Each face contains 9 sticker positions conceptually.

The renderer should calculate visible sticker placement from cubie state.

---

## 6. Move notation

Face moves:

```text
U D L R F B
```

Slice moves:

```text
M E S
```

Modifiers:

```text
'   inverse
2   half turn
```

Slice conventions:

```text
M follows L
E follows D
S follows F
```

The logical core is absent, but standard `M/E/S` rotates only the four middle-slice edge cubies. The four center cubies in the geometric plane remain fixed.

---

## 7. Move metadata

Each move should define:

- face
- axis
- layer coordinate
- direction
- duration
- notation

Example concept:

```ts
{
  face: 'R',
  axis: 'x',
  layer: +1,
  quarterTurns: 1,
  notation: 'R'
}
```

---

## 8. Mathematical invariant

For a normal 3×3 cube:

- corner permutation remains valid
- edge permutation remains valid
- corner orientation sum remains valid
- edge orientation parity remains valid

The implementation must never manually mutate individual stickers in a way that violates these invariants.

---

## 9. Four-turn invariant

For every quarter turn:

```text
M × M × M × M = identity
```

Therefore:

```text
R R R R
```

must return to the exact previous logical state.

The same must hold for every face.

---

## 10. Inverse invariant

For every move:

```text
M M' = identity
```

Examples:

```text
U U'
F F'
R R'
```

---

## 11. Double-turn invariant

```text
M2 M2 = identity
```

---

## 12. Solved state

The solved state is the canonical initial state.

Do not use approximate transforms to identify solved status.
