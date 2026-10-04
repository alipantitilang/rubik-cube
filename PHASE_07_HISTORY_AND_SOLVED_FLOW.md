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


## Post-Phase-7 gameplay flow refinement

The solve session now has an explicit inspection phase and pause/resume controls:

`READY → SCRAMBLING → PREVIEW → PLAYING ↔ PAUSED → SOLVED`

- **PREVIEW:** scramble has finished; the player may rotate/zoom the cube and inspect all colors. Sticker moves are locked.
- **START:** begins the solve timer and unlocks sticker moves.
- **PAUSE / RESUME:** pauses the solve timer and locks sticker moves while keeping cube rotation and zoom available for inspection.
- **FINISH:** manual completion fallback. It accepts completion only when the logical cube state is actually solved, so it safely covers cases where the automatic solved sensor does not fire.
- **RESET:** cancels the current session, restores a solved cube, clears move history/timer, and starts from the pre-game state.
- The timer measures active solving time only; paused inspection time is excluded.

### View rotation availability

Empty-space drag rotation is available in every non-scrambling session state: before Play, PREVIEW after scramble, PLAYING, PAUSED, after Resume, and after Reset. PREVIEW/PAUSED use view-only interaction so layer moves remain blocked while cube rotation and zoom remain available.


### Finish fallback hardening
The manual Finish control first checks the strict sticker-identity solved state. If that is not true, it also accepts the visually solved color state via `CubeState.isColorSolved()`. This keeps the core identity model strict while making the explicit Finish fallback usable for a cube that is visually solved.
