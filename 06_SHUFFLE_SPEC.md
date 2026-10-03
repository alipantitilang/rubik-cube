# Shuffle Specification

## Objective

Generate legal random layer turns without exposing Rubik face notation.

## Turn representation

Each scramble item is:

```ts
{
  axis: 'x' | 'y' | 'z',
  layer: -1 | 1,
  quarterTurns: -1 | 1 | 2
}
```

Scramble generation uses outer layers only. Middle slices are reserved for direct geometric interaction.

## Constraints

Optional `avoidSameAxis` prevents consecutive turns around the same axis.

Seeded generation is deterministic.

## Playback

```text
generateScramble()
      ↓
CubeTurnRuntime.enqueue(...turns)
      ↓
animated layer turns
      ↓
CubeState commit
      ↓
StickerHistory
```

No scramble string such as `R U F2` is generated.

## UI

The UI may display a neutral summary such as:

```text
20 layer turns
```

rather than move notation.
