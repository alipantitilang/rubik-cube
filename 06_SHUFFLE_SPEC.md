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


## Phase 6 final hardening

The default generator uses `avoidSameAxis: true` and `ensureNonSolved: true`. A generated sequence is validated against a fresh solved `CubeState`; a candidate that leaves the cube solved is rejected and regenerated within a bounded attempt budget. This guarantees that Play starts a meaningful scrambled session while preserving deterministic seeded generation.

Reset is a full session boundary: active animation is cancelled, runtime history is cleared, the authoritative cube is restored to solved state, and the UI returns to the pre-game state so a new Play session can begin cleanly.
