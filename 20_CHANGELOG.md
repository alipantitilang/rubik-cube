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


## 2026-10-04 — Phase 6 Solved-State Sensor (FIX-528)

- Solved detection now reads the authoritative `CubeState` whenever the game is in `PLAYING` and the runtime is idle.
- Manual interactive turns are detected even when `CubeTurnRuntime.tick()` returns no `completed` turn object for the commit frame.
- Reset therefore appears reliably after solving through the manual drag interaction.
- Existing Phase 6 Play/Reset flow remains unchanged otherwise.
