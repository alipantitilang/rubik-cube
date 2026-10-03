# Cube Model Specification

## 1. Logical geometry

The cube uses a right-handed 3D coordinate system. Valid visible cubie positions are all combinations of `x/y/z ∈ {-1,0,1}` except `(0,0,0)`.

```text
3 × 3 × 3 - 1 = 26 visible cubies
```

Classification:
- 3 non-zero coordinates → 8 corners
- 2 non-zero coordinates → 12 edges
- 1 non-zero coordinate → 6 centers
- `(0,0,0)` → empty internal core/reference only

## 2. Sticker identity is separate from face orientation

There are exactly **54 visible color stickers**. A sticker has a permanent identity code; its current face and position can change.

Examples:

```text
rc1 = red corner 1
re1 = red edge 1
rc  = red center
oc1 = orange corner 1
...
```

The code never changes when the cube turns.

## 3. Position slots

The solved cube has exactly 54 stable position slots:

```text
p01 ... p54
```

Slots are grouped by solved color only for identity/indexing:

| Slots | Solved color |
|---|---|
| p01–p09 | red |
| p10–p18 | orange |
| p19–p27 | yellow |
| p28–p36 | white |
| p37–p45 | green |
| p46–p54 | blue |

This grouping is **not** a movement reference. It does not define Front, Back, Top, Bottom, Left, or Right.

Within every nine-slot face grid:

```text
c1  e1  c2
 e4  c  e2
c4  e3  c3
```

Therefore the red solved face starts as:

```text
rc1→p01  re1→p02  rc2→p03
re4→p04  rc →p05  re2→p06
rc4→p07  re3→p08  rc3→p09
```

## 4. Permanent vs current data

For every sticker:

```ts
{
  code: 'rc1',
  color: 'red',
  initialPosition: 'p01',
  currentPosition: 'p37'
}
```

`code`, `color`, and `initialPosition` are stable. `currentPosition` changes after turns.

## 5. Internal face labels

The renderer and geometric math still need local surface normals:

```text
U = +Y
D = -Y
R = +X
L = -X
F = +Z
B = -Z
```

These are **local geometric labels**, not user-facing movement commands and not permanent world directions.

Canonical solved colors remain:

```text
U = yellow
D = white
R = green
L = blue
F = red
B = orange
```

## 6. Orientation principle

The Rubik is a free object. There is no permanent Front/Back/Up/Down/Left/Right in the interaction model.

`CubeOrientationController` stores visual object orientation separately from `CubeState`.

## 7. Source of truth

- `CubeState` → cubie/sticker logical state
- sticker registry → 54 permanent sticker identities and 54 slot IDs
- `CubeOrientation` → visual object orientation
- renderer → projection only

No renderer transform is allowed to become logical state.
