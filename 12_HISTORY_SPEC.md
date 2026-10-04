# History Specification — Phase 7

## Two history layers

The project keeps two different histories:

1. **StickerHistory** — internal state-audit history for all committed turns, including scramble turns.
2. **MoveHistory** — player-facing solve history. It records only committed player turns after the scramble has finished.

Neither history uses move notation.

## Player move event

```ts
{
  index: 1,
  turn: {
    axis: 'y',
    layer: 1,
    quarterTurns: 1
  },
  timestamp: 0
}
```

One committed user action is one move, including a half-turn (`quarterTurns: 2`).

Cancelled or unfinished gestures are never recorded.

## Scramble separation

Scramble turns still pass through `CubeTurnRuntime` so the logical and rendered cube remain synchronized. They are not added to `MoveHistory`.

The Phase 7 session begins when `ShuffleController` changes to `PLAYING`.

## Timer

The solve timer starts when the scramble completes and the session enters `PLAYING`. It therefore includes the user's thinking time before the first move.

The timer stops when `CubeState.isSolved()` becomes true after a committed player turn.

## Session record

```ts
{
  startedAt,
  completedAt,
  scramble,
  moves,
  moveCount,
  solved,
  elapsedMs
}
```

A completed session keeps its result in memory until Reset/new session. No localStorage persistence is required in Phase 7.

## Solved flow

When the authoritative cube reaches solved state:

- state becomes solved;
- player interaction is disabled;
- timer stops;
- move history remains available;
- result UI shows elapsed time and move count;
- a new session can be started through Reset / Play Again.

## Reset

Reset is a session boundary. It:

- cancels active animation;
- returns CubeState to solved;
- clears MoveHistory;
- clears StickerHistory;
- resets the timer;
- clears the completed-session result;
- returns to READY/pre-game state.

Sticker identity codes and position IDs are never regenerated.
