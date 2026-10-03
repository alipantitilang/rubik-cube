# Future Features

These are explicitly outside the initial MVP but should not be blocked by the architecture.

## Possible additions

### Timer

Track:

- inspection time
- solve time
- best time

### Undo / Redo

Use inverse move commands.

### Replay

Replay a stored move sequence.

### Solve Assistant

Display a legal solving sequence.

### Multiple Cube Sizes

Potential:

- 2×2
- 4×4
- 5×5

This should require a generalized architecture rather than rewriting the 3×3 engine.

### Themes

Change:

- UI theme
- background
- cube colors

### Statistics

Track:

- total solves
- average moves
- best solve
- best move count

### Share

Generate a shareable scramble or move sequence.

---

## Architectural requirement

Future features must not compromise the core rule:

> Cube state is authoritative and all reachable states remain legal.
