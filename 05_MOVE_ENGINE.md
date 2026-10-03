# Move Engine Specification

## Objective

Implement a reliable Rubik move engine before UI polish. The engine is authoritative and independent of rendering and pointer interaction.

## Supported move notation

Face moves:

```text
U D R L F B
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

Examples:

```text
R R' R2
M M' M2
```

## Slice conventions

The project follows the standard conventions required by the manual POV interaction:

| Slice | Axis | Layer | Direction convention |
|---|---|---:|---|
| `M` | X | `0` | follows `L` |
| `E` | Y | `0` | follows `D` |
| `S` | Z | `0` | follows `F` |

The internal core `(0,0,0)` remains absent, but standard `M/E/S` turns rotate only the **4 middle-slice edge cubies**. Center cubies remain fixed to preserve face identity.

## Move transaction

```text
Move request
   ↓
Parse / validate
   ↓
Animation preview
   ↓
Commit
   ↓
CubeState.applyMove()
```

`CubeState` is never mutated by pointer or renderer code.

## Face layer selection

```text
R → x = +1
L → x = -1
U → y = +1
D → y = -1
F → z = +1
B → z = -1
```

Face turns affect 9 visible cubies.

Slice selection:

```text
M → x = 0
E → y = 0
S → z = 0
```

The geometric middle plane contains 8 visible positions, but standard `M/E/S` excludes the four center cubies. Each logical slice move therefore affects 4 visible edge cubies.

## Orientation

Position and sticker orientation rotate together using the same integer 90° transform.

This guarantees that a committed move changes the actual sticker colors visible on the resulting faces rather than merely changing a render transform.

## Invariants

For every supported quarter-turn move:

```text
M × M × M × M = identity
M × M' = identity
M2 × M2 = identity
```

This applies to both face and slice moves.

## Interaction boundary

The interaction system may request any supported notation, but it does not implement the move mathematics itself.

```text
POV resolver → notation → CubeTurnRuntime → CubeState
```
