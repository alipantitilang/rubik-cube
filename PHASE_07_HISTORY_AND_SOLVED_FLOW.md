# Phase 7 — History & Solved Flow

Status: **COMPLETE**

## Scope

Phase 7 adds player-facing solve history and a complete solved-session lifecycle on top of the Phase 6 legal scramble flow.

### Delivered

- Player `MoveHistory` with generic turn objects.
- Only committed player turns are counted.
- Scramble turns are excluded from player move count.
- Half-turns count as one user move.
- Solve timer starts when scrambling ends / PLAYING begins.
- Timer stops at authoritative solved detection.
- Completed session result retains move count and elapsed time.
- Basic recent move history UI.
- Solved congratulations overlay.
- Reset/new-session boundary.
- Play Again action starts a fresh scramble session.
- StickerHistory remains available for internal sticker identity auditing.
- Regression tests for history, timer, solved lifecycle, and reset behavior.

## State flow

```text
READY
  ↓ Play
SCRAMBLING
  ↓ scramble complete
PLAYING + timer running
  ↓ committed player turns
SOLVED + timer stopped
  ↓ Reset / Play Again
READY
```

## Not included

- Undo/redo
- localStorage/cloud persistence
- leaderboard/accounts
- replay
- sound
- final responsive/accessibility polish
- advanced history visualization
