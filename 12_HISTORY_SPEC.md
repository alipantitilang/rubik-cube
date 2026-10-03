# Move History Specification

## Purpose

Show the moves the player has performed during the current solve session.

## Data

Each history entry should contain:

```ts
{
  index: number
  move: Move
  notation: string
  timestamp?: number
}
```

Timestamp is optional.

---

## Rules

### Before scramble

History:

```text
[]
```

### During scramble

Do not expose scramble moves as player moves by default.

### After scramble

First user move becomes history item 1.

### On solved

History remains visible so the user can review the solve.

### On reshuffle

History resets to:

```text
[]
```

---

## Formatting

Use standard notation:

```text
R
R'
R2
```

Do not display internal enum names.

---

## Future features

Potential later additions:

- Undo
- Redo
- Copy sequence
- Replay
- Move count
- Best session

These are not required for MVP.
