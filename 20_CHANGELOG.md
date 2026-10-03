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


## 2026-10-04 — Phase 5 POV Front-Face Redesign

- Replaced the previous face-plane gesture mapping with a camera-relative POV front-face method (`FIX-508`).
- Added standard slice moves `M`, `E`, and `S` to the logical move engine (`FIX-509`).
- Picking now exposes logical cubie position and cubie type (`FIX-510`).
- Removed the previous duplicate face gesture mapping contract (`FIX-511`).
- Added exhaustive automated tests for the specified front corner/edge rules and right/left side F/B/S rules.
- Regression suite: **61 passed, 0 failed**.


### 2026-10-04 — Phase 5 canonical color orientation and slice correction

- Established the canonical solved orientation: U yellow, D white, F red, R green, B orange, L blue.
- Restricted POV front-face authority to F/R/B/L; U/D never become virtual front.
- Replaced camera-roll-derived side mapping with fixed color adjacency for all four eligible front faces.
- Corrected M/E/S semantics so center cubies remain fixed and only the four middle-slice edge cubies rotate.
- Added `21_COLOR_ORIENTATION_AND_POV.md` as the canonical orientation contract.
- Expanded POV and slice regression coverage; suite now passes 65/65.

### 2026-10-04 — Red-front horizontal drag correction

- Corrected horizontal front-face direction when red/F is the active POV front (`FIX-515`).
- Left column drag-right and right column drag-left now resolve to moves whose visible layer motion follows the grab direction.
- Vertical front-face mapping is unchanged. Green/orange/blue POV horizontal mappings are intentionally not changed in this fix.
- Regression suite: **68 passed, 0 failed**.


### 2026-10-04 — Four-front horizontal POV direction generalization

- Generalized the red-front horizontal drag correction to all eligible POV fronts: F/red, R/green, B/orange, and L/blue (`FIX-516`).
- Left-column drag-right and right-column drag-left now follow the user's visual grab direction for every front.
- Preserved the existing vertical and side-face mappings.
- Documented the gesture-time POV frame lock: camera movement during a drag cannot change the active front.


### 2026-10-04 — Four-front vertical POV direction correction

- Added `FIX-517` for front-face vertical direction mapping.
- Red/F keeps the established vertical behavior.
- Green/R, Orange/B, and Blue/L now use rotated vertical notation so top-row drag-down and bottom-row drag-up preserve the user's visual direction.
- Added exhaustive four-front vertical corner/edge regression coverage.
- Regression suite: **70 passed, 0 failed**.


### 2026-10-04 — Active POV side-face F/F' correction

- Added `FIX-518` for side-face corner vertical interaction when the camera is slightly angled.
- Side corners now resolve front-facing turns using the active POV Front notation: F/F' for Red, R/R' for Green, B/B' for Orange, and L/L' for Blue.
- Back-facing counterparts use the active POV Back notation.
- Preserved front-face mappings, side-edge S/S' mapping, and POV frame locking.
- Regression suite: **71 passed, 0 failed**.
