# Changelog

## 2026-10-03

### Initial documentation baseline

Created the project documentation baseline for:

- 26-cubie 3×3 Rubik
- empty internal center position
- legal move engine
- legal scrambling
- smooth face-turn animation
- mouse/touch interaction
- camera rotation
- zoom
- history
- solved state
- Congratulations
- Reshuffle
- responsive layouts
- accessibility
- testing
- implementation roadmap

No application code is included yet.


## 2026-10-03 — Phase 5

- Integrated manual sticker picking with the Phase 4 renderer.
- Added camera-space gesture projection and face tangent mapping.
- Added mouse/touch face turns through `CubeTurnRuntime`.
- Added pointer ownership to prevent camera/face gesture conflicts.
- Added `FIX-500`.

### 2026-10-03 — Phase 5 audit and stabilization

- Fixed missing `FaceTurnRenderAdapter` wiring in Phase 5 entry points (`FIX-501`).
- Added safe runtime cancellation and renderer resynchronization (`FIX-502`).
- Removed duplicated gesture-to-move mapping from the manual controller (`FIX-503`).
- Added integration and edge-case tests.
- Full regression suite: 54 passed, 0 failed.
- Hardened seeded/custom scramble generation (`FIX-504`).
