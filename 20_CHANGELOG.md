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

- Fixed missing `TurnRenderAdapter` wiring in Phase 5 entry points (`FIX-501`).
- Added safe runtime cancellation and renderer resynchronization (`FIX-502`).
- Removed duplicated gesture-to-move mapping from the manual controller (`FIX-503`).
- Added integration and edge-case tests.
- Full regression suite: 54 passed, 0 failed.
- Hardened seeded/custom scramble generation (`FIX-504`).


## 2026-10-04 — Phase 5 POV Front-Face Redesign

- Replaced the previous face-plane gesture mapping with a view-independent POV front-face method (`FIX-508`).
- Added standard slice moves `M`, `E`, and `S` to the logical move engine (`FIX-509`).
- Picking now exposes logical cubie position and cubie type (`FIX-510`).
- Removed the previous duplicate face gesture mapping contract (`FIX-511`).
- Added exhaustive automated tests for the specified front corner/edge rules and right/left side F/B/S rules.
- Regression suite: **61 passed, 0 failed**.


### 2026-10-04 — Phase 5 canonical color orientation and slice correction

- Established the canonical solved orientation: U yellow, D white, F red, R green, B orange, L blue.
- Restricted POV front-face authority to F/R/B/L; U/D never become virtual front.
- Replaced camera-roll-derived side mapping with fixed color adjacency for all four eligible front faces.
- Updated generic slice semantics so M/E/S-style middle slices rotate 8 visible cubies: four edges plus four face centers, allowing center sticker identities to move between face-position slots.
- Added `21_INTERACTION_GEOMETRY_AND_STICKER_IDENTITY.md` as the canonical orientation contract.
- Expanded POV and slice regression coverage; suite now passes 65/65.

### 2026-10-04 — Red-front horizontal drag correction

- Corrected horizontal front-face direction when red/F is the active POV front (`FIX-515`).
- Left column drag-right and right column drag-left now resolve to moves whose visible layer motion follows the grab direction.
- Vertical front-face mapping is unchanged. Green/orange/blue POV horizontal mappings are intentionally not changed in this fix.
- Regression suite: **69 passed, 0 failed**.


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
- Regression suite: **69 passed, 0 failed**.


### 2026-10-04 — Active POV side-face F/F' correction

- Added `FIX-518` for side-face corner vertical interaction when the camera is slightly angled.
- Side corners now resolve front-facing turns using the active POV Front notation: F/F' for Red, R/R' for Green, B/B' for Orange, and L/L' for Blue.
- Back-facing counterparts use the active POV Back notation.
- Preserved front-face mappings, side-edge S/S' mapping, and POV frame locking.
- Regression suite: **71 passed, 0 failed**.


### 2026-10-04 — Six-face view-independent POV + 360° orbit

- Replaced the F/R/B/L-only POV authority with all six physical faces U/D/R/L/F/B.
- Replaced fixed color adjacency with a view-independent right/up frame derived from screen basis vectors.
- Yellow and White can now become Front through normal camera orbit; no special fallback path is required.
- Manual controller now freezes the complete view-independent frame at pointer-down and passes camera world-right/world-up into the resolver.
- Virtual gesture notation is converted to physical face/slice notation after the frame is resolved.
- Camera yaw remains continuous through 360°; pitch now approaches ±90° so U/D can become Front.
- Added six-front regression coverage and updated Phase 5 canonical documentation.
- Full regression suite: **67 passed, 0 failed**.


### 2026-10-04 — Object-relative Rubik orientation

- Added quaternion-based `CubeOrientationController`; the Rubik object is now the thing users rotate.
- Phase 5 no longer uses empty-space drag to orbit the camera.
- `resolvePovFrame()` derives Front/Back/Up/Down/Left/Right from transformed cube face normals relative to the fixed camera.
- Yellow and White can become Front without moving the camera above/below the cube.
- Cube orientation can pass through 360° without a yaw wrap.
- Face-turn animation remains in cube-local axes under the rotated `cubeGroup`.
- Regression suite: **73 passed, 0 failed**.

## 2026-10-04 — FIX-521: View-independent drag geometry

Manual interaction Phase 5 dipindahkan dari virtual Front/Back/Up/Down mapping ke direct geometric drag resolution.

- `pov-move-resolver.js` diganti menjadi `drag-move-resolver.js`.
- Tidak ada lagi Front sebagai referensi wajib.
- Drag screen ditransformasikan ke cube-local space.
- Layer axis ditentukan dari `cross(stickerNormal, dragTangent)`.
- Posisi cubie pada axis menentukan outer layer atau middle slice.
- Arah drag menentukan base/inverse move.
- Diagonal drag didukung.
- Cube quaternion diperhitungkan tanpa membuat POV frame baru.
- Regression suite: 69/69 passed.

### 2026-10-04 — Generic layer turns + 54-sticker position history

Phase 5 mengalami perubahan arsitektur lanjutan:

- Tidak ada lagi Front/Back/Up/Down/Left/Right sebagai referensi gerakan.
- `resolveDragTurn()` menghasilkan `{ axis, layer, quarterTurns }` langsung dari geometri drag.
- Animator, runtime, dan render adapter memakai generic turn descriptor.
- Shuffle generation tidak lagi menghasilkan notation string.
- Ditambahkan 54 sticker identities permanen: `rc1`, `re1`, `rc`, dan padanan lima warna lainnya.
- Ditambahkan 54 position IDs permanen: `p01..p54`.
- `StickerHistory` mencatat perubahan setiap sticker sebagai `code: from → to`.
- Renderer sekarang mengambil warna dari identitas sticker, sehingga warna tetap benar ketika sticker berpindah face.
- `parseMove()` dipertahankan hanya sebagai compatibility adapter lama; Phase 5 tidak menggunakannya.

Validasi:

```text
71 tests passed
0 failed
```


## FIX-521 — Center sticker movement

The generic sticker-position model no longer treats centers as fixed during middle-slice turns. Each middle slice carries four edge cubies and four face-center cubies. Center sticker identities therefore move between `p01..p54` and are captured by StickerHistory like every other sticker.


## 2026-10-04 — Phase 5 Final Repository Cleanup (FIX-524)

- `phase5.html` became the production `index.html`; no new HTML preview is created.
- `styles.css` moved to repository root for a simple GitHub Pages root deployment.
- Removed obsolete Phase 3/4 preview HTML files.
- Removed the obsolete POV resolver and its tests.
- Removed the legacy face-notation parser, inverse-notation helpers, and unused move-history containers.
- Renamed generic animation/render modules to `turn-animator.js` and `turn-renderer.js`.
- Updated the development server to serve the repository root.
- Active documentation now describes the direct-geometric generic-turn and 54-sticker position architecture.
- Cleanup regression: **69 passed, 0 failed**.


## 2026-10-04 — Phase 6 Legal Shuffle / Play Flow

- Completed generic legal scramble generation without move notation.
- Default scramble avoids consecutive axes and immediate inverse turns.
- Added deterministic seeded scramble support and regression coverage.
- Wired `ShuffleController` into the existing `index.html` entry point.
- Added minimal Play control: `idle → scrambling → playing`.
- Manual interaction is locked during automatic scramble and restored after completion.
- Scramble playback continues through `CubeTurnRuntime`; CubeState remains authoritative.
- No new phase HTML file was created.


## 2026-10-04 — Phase 6 Main-Screen Play / Reset Flow

- Moved Play from the information panel to the main cube screen.
- Play now disappears immediately when a game session starts.
- Manual interaction is locked before Play, during scramble, and after the cube is solved.
- Added solved-state detection after completed player turns.
- Added main-screen Reset control that appears only after a solved cube.
- Reset returns the authoritative CubeTurnRuntime to a fresh solved CubeState and clears runtime history.
- No new HTML file was created.

## 2026-10-04 — FIX-528: Solved-state sensor

- Fixed Phase 6 Reset visibility when the final player move completes through the interactive settle path.
- Added a per-frame solved-state sensor after `CubeTurnRuntime.tick()` and `ShuffleController.handleTick()`.
- The sensor waits for `PLAYING` + `!runtime.busy` and uses `CubeState.isSolved()` as the sole solved predicate.
- Once solved, manual interaction is locked, `Reset` appears, `Play` remains hidden, and status becomes `Solved!`.
- Reset clears the local solved latch before returning to the pre-game solved state.


## 2026-10-04 — Phase 6 Final Hardening

- Scramble generator now rejects a candidate sequence if applying it to solved CubeState would leave the cube solved; this prevents a valid-but-useless scramble from starting a session.
- `ShuffleController` now enables same-axis avoidance by default, matching the Phase 6 scramble quality contract.
- Reset/session regression coverage now verifies cancellation, fresh solved state, cleared runtime history, and readiness for a new Play session.
- Phase 6 acceptance criteria and documentation updated to mark scramble quality, reset state integrity, and end-to-end flow as complete.


## 2026-10-04 — Phase 7: History & Solved Flow

- Added `MoveHistory` for committed player turns using generic `{ axis, layer, quarterTurns }`.
- Scramble commits remain in internal `StickerHistory` but are excluded from player move count.
- Added `SolveTimer`; timer starts when scramble playback enters `PLAYING` and stops when the authoritative cube is solved.
- Added session result data with start/completion timestamps, scramble, moves, move count, solved flag, and elapsed time.
- Added recent move history, move counter, timer, and solved result UI to the existing `index.html`.
- Added congratulations overlay with Play Again and Reset actions.
- Reset now clears player history, timer, completed session, and solved presentation.
- Added Phase 7 unit/integration regression tests.
- Phase 7 acceptance: **complete**.


### Phase 7 gameplay refinement
- Added post-scramble inspection preview before timing starts.
- Added Pause/Resume with active-time-only timer accounting.
- Added Finish fallback with logical solved-state validation.
- Added Reset session boundary and view-only inspection mode.

- FIX-531: empty-space Rubik rotation remains available in PREVIEW and PAUSED; pointer interaction stays enabled while view-only mode blocks layer turns.


## 2026-10-05 — Phase 8: UI & Responsive Product Shell

- Rebuilt the production `index.html` around a cube-first responsive product shell.
- Added state-driven presentation for Ready, Scrambling, Preview, Playing, Paused, and Solved.
- Added desktop side panel plus tablet/mobile bottom-sheet and landscape adaptations.
- Added timer, move counter, recent generic move history, status badge, and solved result presentation.
- Added cube-object rotation buttons and camera zoom slider/reset using existing controllers.
- Added menu/help drawer and safe-area/dynamic-viewport support.
- Preserved empty-space cube rotation in all non-scrambling states.
- Removed obsolete `src/interaction/gesture.js`.
- Phase 8 acceptance: **complete / final**.
- Refined game-action layout so Play/Start/Pause/Finish/Reset remain inside the responsive game panel across desktop, tablet, portrait, and landscape layouts.
- Added state-specific badge treatment for Preview and Paused states.
- Added a Phase 8 integration contract for the responsive shell.
- Full regression: **94/94 tests pass**.


### FIX-532
- Hardened Phase 7 Finish fallback to accept a visually solved cube using `CubeState.isColorSolved()` while retaining strict sticker identity for the core `isSolved()` check.
- FIX-533: Finish now accepts a solved color grouping: all nine stickers of each color must occupy the same face; no fixed world-face mapping is assumed.

### Phase 8 UI refinement — modern glass session + Indonesian UI
- Added a collapsible Cube Session glass panel with a left-edge toggle and right-edge reopen control.
- Added smooth open/close transitions.
- Replaced the dark static background with six independently graded, animated lava-like color streams (red, green, blue, orange, yellow, white) over a dark rock texture.
- Localized visible interface text to Indonesian.
- Preserved Phase 7 gameplay/state/logic.

### FIX-535 — Phase 8 visual refinement
- Corrected session tab arrow directions.
- Reworked the Sesi Kubus panel into a non-glass modern tab with animated blue-gradient visual language.
- Restored visibility of the red/green/blue/orange/yellow/white flowing lava background by correcting layer stacking.
- Preserved all Phase 7 gameplay behavior.


### FIX-536 — Phase 8 retro puzzle theme
- Removed the lava background system completely.
- Removed the modern/glass/animated-blue visual direction.
- Introduced a cohesive retro puzzle-machine visual theme across buttons, cards, typography, menu, session tab, and controls.
- Kept the session tab collapse/reopen interaction and corrected directional semantics.
- No gameplay or Phase 7 logic changes.


### FIX-537
- Increased the default camera distance so the main Rubik view feels less crowded.
- Added a continuous running highlight across every colored sticker square.
- Kept the effect shader-based to avoid adding dynamic scene lights.

### FIX-538
- Replaced running sticker highlights with static LED-like emissive lighting.
- Sticker colors remain solid with no moving light and no gradient effect.

### FIX-539 — Farther default zoom and directional controls
- Main render starts farther out.
- Zoom supports a wider close/far range with dedicated triangle controls.
- Rotate controls use directional triangles; reset uses a circle.
- Session panel toggle/open tabs refined to match the retro puzzle-machine theme.

### FIX-540 — Literal Triangle/Circle Controls + Unified Panel Tab
- Replaced view-control button silhouettes with literal triangle and circle shapes.
- Unified the session open/close control into one tab attached to the panel.
- Removed the visually separate reopen item.
- Slowed and softened the panel transition and tab-arrow rotation so both feel like one continuous mechanism.


### FIX-541 — Shape Control Cleanup + Persistent Session Tab
- Removed remaining legacy triangle/pseudo-symbol styling from the view controls.
- Made each zoom/rotate control itself a literal triangle and reset itself a literal circle.
- Replaced the session tab symbol with a single long vertical marker line.
- Kept the same physical tab visible and clickable after the panel collapses instead of hiding it with the panel.
- Slowed and softened the panel/tab transition to 920ms with a smooth cubic-bezier easing.


### FIX-542 — View control and session panel refinement

- Centered rotate control cluster.
- Replaced zoom-end triangles with +/− controls and extended the zoom bar across the panel.
- Refined session panel proportions and tactile button feedback.
- Refined persistent panel tab dimensions and motion.

## FIX-543 — Grab Rotation Follows Pointer Direction

- **Status:** FIXED
- **Phase:** Phase 8 / interaction refinement
- **Problem:** Empty-space grab rotation felt inverted: dragging left/right or up/down rotated the Rubik opposite to the pointer movement.
- **Fix:** Screen-space drag deltas now map directly to the cube orientation quaternion without the previous sign inversion. A positive horizontal drag rotates the Rubik toward the right; a positive vertical drag rotates it toward the downward pointer movement.
- **Invariant:** Sticker/layer drag resolution, turn engine, camera, history, shuffle, timer, and solved-state behavior are unchanged.
- **Acceptance:** Horizontal and vertical grab-direction tests verify that the cube follows the pointer direction; full regression suite passes.


### FIX-544 — Stable panel and history layout
- Fixed the session panel geometry so state changes no longer resize the tab/panel.
- Added reserved empty button slots so controls appear in predetermined positions without shifting other UI.
- Kept the main button visible during shuffle with state labels `Main`, `Proses…`, and `Siap`.
- Added a fixed-size history display area; only history contents change within it.

## FIX-545 — Stable tab slots and grab-to-close session panel

- Rebuilt the session tab around fixed physical slots so state changes never resize the tab.
- Unified `Main / Di proses / Mulai / Jeda / Lanjut` into one primary button.
- Removed the manual Finish button; solved completion is automatic.
- Added a reserved Reset slot with transition-based appearance.
- Fixed history viewport to approximately three visible rows with internal scrolling.
- Added horizontal grab interaction to open/close the attached session tab.
- Starting a solve automatically closes the tab with a distinct smooth transition.

## FIX-546 — Compact view controls

- Removed the visible empty reset-slot gap when the reset action is unavailable.
- Moved zoom `+`/`−` into a vertical stack beside the rotate controls.
- Kept a clean, full-width zoom range as the bottom-most view control with no adjacent buttons or label.
- Preserved the fixed session-panel geometry and all existing interaction behavior.

## FIX-547 — Remove unused information menu and lift compact session panel

The unused top-right information/menu surface was removed from the product shell because the feature is not yet required. Its DOM, interaction handlers, scrim, side-menu content, and dedicated styling were removed. On compact screens the fixed session panel is positioned higher so its full border frame remains visible without changing the panel's established geometry.

## FIX-548 — Compact panel viewport fit
- Prevented the session panel from extending below the visible screen on short/mobile viewports.
- Kept the panel state geometry stable while bounding its responsive height to the available viewport.


## FIX-549 — Fixed panel geometry, direct edge zoom, and pinch zoom

- Session panel uses a fixed 360px × 640px CSS design size and no longer derives its dimensions from responsive viewport calculations.
- Added a bottom breathing space so the internal zoom rail does not touch the panel border.
- Added a dedicated vertical edge zoom control on compact portrait screens and compact landscape screens, so zoom remains available without opening the session panel.
- Added two-finger pinch zoom to the camera controller; multi-touch is handed to camera zoom instead of cube/layer dragging.
- The panel content may scroll on unusually short viewports rather than changing the panel's design dimensions.
