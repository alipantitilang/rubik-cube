# Move Engine Specification

## Objective

Implement layer rotation without depending on Rubik notation such as `R`, `R'`, `L`, `U`, `F`, etc.

## Generic turn descriptor

Every turn is represented as:

```ts
{
  axis: 'x' | 'y' | 'z',
  layer: -1 | 0 | 1,
  quarterTurns: -1 | 1 | 2
}
```

Meaning:

- `axis` = local cube rotation axis
- `layer` = selected layer coordinate
- `quarterTurns` = direction and amount of 90° turns

This descriptor has no Front/Back/Up/Down/Left/Right semantics.

## Layer selection

```text
axis X, layer +1 → one outer layer
axis X, layer  0 → middle X slice
axis X, layer -1 → opposite outer layer

axis Y, layer +1 → one outer layer
axis Y, layer  0 → middle Y slice
axis Y, layer -1 → opposite outer layer

axis Z, layer +1 → one outer layer
axis Z, layer  0 → middle Z slice
axis Z, layer -1 → opposite outer layer
```

Outer layer turns affect 9 cubies.

A middle-layer turn affects 8 visible cubies in that slice: 4 edges plus 4 face centers. Center sticker identities move between face-position slots and are recorded by StickerHistory.

## Turn transaction

```text
Generic turn
   ↓
validate
   ↓
preview animation
   ↓
commit
   ↓
CubeState.applyTurn()
   ↓
sticker history record
```

`CubeState` changes only when the turn commits.

## Sticker movement

When a turn is committed:

1. cubie position rotates;
2. each sticker's local face rotates;
3. sticker code stays unchanged;
4. current slot is recalculated as `p01..p54`;
5. history records `code: from → to`.

Example:

```text
rc1: p01 → p37
```

## Direction

The interaction resolver determines `quarterTurns` from the actual drag vector. It never converts the result into a face notation string.

## Invariants

For every valid quarter turn:

```text
T × T × T × T = identity
```

For every non-half turn:

```text
T × inverse(T) = identity
```

For a half turn:

```text
T2 × T2 = identity
```

## Movement naming

The engine intentionally has no R/L/U/D/F/B/M/E/S notation API. All active systems exchange the generic turn descriptor directly.
