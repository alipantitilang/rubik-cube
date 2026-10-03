# Rubik 26-Cubies — Documentation Pack

This archive is the project's documentation source of truth.

## Start here

Read in this order:

1. `00_PROJECT_OVERVIEW.md`
2. `01_PRD.md`
3. `02_RULES.md`
4. `03_ARCHITECTURE.md`
5. `04_CUBE_MODEL.md`
6. `05_MOVE_ENGINE.md`
7. `06_SHUFFLE_SPEC.md`
8. `07_INTERACTION_SPEC.md`
9. `08_ANIMATION_SPEC.md`
10. `09_UI_DESIGN.md`
11. `10_RESPONSIVE_SPEC.md`
12. `11_STATE_MACHINE.md`
13. `12_HISTORY_SPEC.md`
14. `13_ACCESSIBILITY.md`
15. `14_PERFORMANCE.md`
16. `15_TEST_PLAN.md`
17. `16_DEFINITION_OF_DONE.md`
18. `17_ROADMAP.md`
19. `PHASE_01_CORE_ENGINE.md`
20. `PHASE_02_RENDERER.md`
21. `PHASE_03_FACE_TURN_ANIMATION.md`

## Important architectural decision

The project does **not** model the cube as 27 visible blocks.

It models a 3×3×3 logical volume with:

```text
27 positions
- 1 internal center position
= 26 visible cubies
```

The six face centers remain visible.

The empty position `(0,0,0)` is the internal core/pivot position, not a visible Rubik piece.

## Development methodology

The project will be completed **phase by phase**.

A phase is considered complete only when:

1. its implementation scope is finished;
2. its acceptance criteria pass;
3. its regression tests pass;
4. no known violation of the global project rules remains;
5. the phase is explicitly marked complete.

Do not skip ahead and create dependent features before their required foundation is stable.

### Phase 0 — Documentation Baseline

Purpose:

- establish the product requirements;
- establish technical rules;
- define cube mathematics;
- define interaction behavior;
- define animation behavior;
- define responsive behavior;
- define testing and Definition of Done.

Output:

- this documentation pack.

Status:

**Complete**

---

### Phase 1 — Cube Core / Logical Engine

Purpose:

Build the mathematical source of truth for the Rubik before rendering or interaction.

Scope:

- 3×3 coordinate model;
- 26 visible cubies;
- empty `(0,0,0)` internal position;
- cubie classification;
- sticker identity;
- solved state;
- face definitions;
- move notation;
- legal face-turn transformations;
- cubie orientation;
- inverse moves;
- double turns;
- solved checker;
- deterministic tests.

Important:

This phase must work without depending on the 3D renderer.

Output:

- a deterministic, testable cube state engine.

Status:

**Complete**

Implementation:

- `src/core/cube.js`
- `tests/cube.test.js`
- `package.json`

Validation:

- 10 automated tests passed
- 0 tests failed
- Phase 1 acceptance checklist completed

---

### Phase 2 — 3D Renderer / Visual Cube

Purpose:

Create the first real 3D representation of the 26-cubie Rubik.

Read:

`PHASE_02_RENDERER.md`

Scope:

- 3D scene;
- camera;
- lighting;
- 26 visible cubies;
- six center pieces;
- correct cubie classification visually;
- configurable face colors;
- internal empty center/core;
- stable cubie IDs;
- logical-to-render transform mapping;
- clean geometry;
- correct face/sticker orientation;
- responsive renderer resizing.

Important:

Phase 2 does **not** yet make the Rubik fully playable.

Do not implement full face-drag gameplay, legal scramble animation, history, or congratulations logic as part of this phase unless it is required purely as a renderer test.

Output:

- a stable 3D solved Rubik that visually matches the logical cube model.

Status:

**Complete**

Implementation: `src/render/cube-render-model.js`, `src/render/cube-renderer.js`, `public/index.html`, `public/styles.css`, `tests/render-model.test.js`.

Validation: **16 tests passed, 0 failed**.

Fixes during phase: `FIX-200` (renderer color assertion test corrected).

---

### Phase 3 — Face-Turn Animation

Purpose:

Connect the logical move engine to physical-looking cube movement.

Scope:

- layer pivot;
- 90° turn;
- 180° turn;
- inverse turn;
- animation queue;
- state/animation synchronization;
- exact final transform;
- no floating-point drift;
- input locking during active turn.

Output:

- every legal move can be rendered as a smooth physical face turn.
- temporary 9-cubie layer pivot;
- deterministic animation queue;
- exact logical commit at animation completion;
- transform reset to prevent accumulated floating-point drift.

Status:

**Complete**

Implementation: `src/animation/face-turn-animator.js`, `src/animation/cube-turn-runtime.js`, `src/render/face-turn-renderer.js`, `public/phase3.html`, `tests/animation.test.js`.

Validation: **22 tests passed, 0 failed** (Phase 1 + Phase 2 + Phase 3 regression suite).

Fixes during phase: `FIX-300` (reset final cubie transforms from authoritative CubeState to prevent visual rotation drift).

---

### Phase 4 — Camera & View Controls

Scope:

- mouse orbit;
- touch orbit;
- wheel zoom;
- pinch zoom;
- rotate buttons;
- zoom bar;
- reset view;
- camera/input separation.

Output:

- complete camera interaction independent from puzzle moves.

Status:

**Complete**

Implementation: `src/camera-controller.js`, `src/camera-view-state.js`, `public/phase4.html`, `tests/camera-view-state.test.js`.

Validation: camera state regression tests pass.

---

### Phase 5 — Manual Rubik Interaction

Scope:

- raycasting/picking;
- sticker identification;
- face gesture detection;
- drag threshold;
- gesture projection;
- direction mapping;
- correct layer selection;
- mouse interaction;
- touch interaction;
- conflict prevention between camera drag and face drag.

Output:

- user can physically manipulate the Rubik through direct gestures.

Status:

**Complete**

---

### Phase 6 — Legal Shuffle / Play Flow

Scope:

- legal scramble generator;
- configurable scramble length;
- deterministic seed support;
- scramble queue;
- fast but smooth scramble animation;
- input lock;
- Play button;
- transition from scrambling to playing;
- player history starts empty.

Output:

- Play produces a valid, solvable scrambled Rubik.

Status:

**Pending**

Note: legal-shuffle core files are present in the working tree, but the complete Play product flow is intentionally not considered complete until its UI and end-to-end acceptance are finalized in the dedicated Phase 6 pass.

---

### Phase 7 — History & Solved Flow

Scope:

- move history;
- solved detection integration;
- Congratulations overlay;
- Reshuffle;
- history reset;
- completion state;
- new-session lifecycle.

Output:

- complete solve → congratulations → reshuffle loop.

Status:

**Pending**

---

### Phase 8 — UI & Responsive Product Shell

Scope:

- polished control panel;
- information panel;
- responsive layout;
- desktop landscape;
- desktop portrait;
- tablet;
- mobile portrait;
- mobile landscape;
- browser zoom;
- high-DPI;
- safe areas.

Output:

- complete responsive application shell.

Status:

**Pending**

---

### Phase 9 — Accessibility & Performance

Scope:

- keyboard access;
- focus states;
- labels;
- reduced motion;
- touch target sizing;
- rendering optimization;
- resize optimization;
- production cleanup.

Output:

- accessible and performant release candidate.

Status:

**Pending**

---

### Phase 10 — Final QA / Release

Scope:

- complete regression suite;
- move-engine invariants;
- scramble validation;
- interaction testing;
- responsive testing;
- visual inspection;
- final Definition of Done;
- release cleanup.

Output:

- final production-ready Rubik experience.

Status:

**Pending**

---

## Global completion rule

The project is considered **FINAL** only when all phases are complete and the complete `Definition of Done` passes.

Until then, a phase may be considered complete independently, but the project itself remains unfinished.

## Core philosophy

```text
CubeState
   ↓
MoveEngine
   ↓
Animation
   ↓
Renderer
   ↓
Interaction / UI
```

Not:

```text
Renderer
   ↓
guess cube state
```

The logical cube state remains the authoritative source of truth throughout every phase.

## Implementation status

Documentation baseline:

**Complete**

Application implementation:

**Phase 1–5 implemented; Phase 6 core work present but product flow is still in progress; Phase 7 onward pending**


## Fix / Change Log

Setiap fase dapat menghasilkan bug fix, koreksi spesifikasi, tambahan requirement, perubahan interaksi, perubahan animasi, atau keputusan teknis baru. Seluruh perubahan tersebut wajib dicatat di [`FIX_LOG.md`](FIX_LOG.md).

**Aturan sinkronisasi:**
1. Setiap fix/addition mendapatkan ID unik.
2. `FIX_LOG.md` menjadi riwayat perubahan terpusat.
3. README selalu memuat ringkasan status perubahan terbaru.
4. Jika perubahan mengubah requirement teknis, dokumentasi fase terkait juga harus diperbarui.
5. Sebuah fase tidak boleh dianggap `COMPLETE` apabila masih memiliki fix `OPEN` atau `IN PROGRESS` yang menghalangi acceptance fase.

### Current Fix Log Status

| Area | Status |
|---|---|
| Fix Log system | Active |
| Phase 0 documentation | FIXED |
| Phase 1 | Phase 1 core fixes recorded; phase complete |
| Phase 2 | `FIX-200` FIXED; phase complete |
| Phase 3 | `FIX-300` FIXED; phase complete |
| Phase 4 | `FIX-400` FIXED; phase complete |
| Phase 5 | `FIX-500`–`FIX-518` FIXED; POV front-face interaction, canonical color orientation, four-front horizontal/vertical direction contracts, M/E/S slices, live drag, all cubie types, and audited |
| Phase 6 | `FIX-504` FIXED; core shuffle work present, product flow still pending
| Phase 7–10 | No fixes recorded yet |

**Full history:** [`FIX_LOG.md`](FIX_LOG.md)

### Initial Fix Log Entry

- `FIX-000` — Phase 0 — Menambahkan sistem Fix Log terpusat untuk melacak seluruh revisi dan tambahan requirement selama proyek berlangsung.



## Phase 1 Implementation

Phase 1 telah diimplementasikan sebagai logical engine executable di:

- `src/core/cube.js` — authoritative CubeState, move parser, move application, solved detection, move history, dan move queue.
- `tests/cube.test.js` — automated invariant tests.
- `PHASE_01_CORE_ENGINE.md` — scope, API, move convention, dan acceptance checklist.
- `package.json` — test command.

Validasi terakhir:

```text
10 tests passed
0 failed
```

Perubahan selama pengerjaan Phase 1 dicatat di [`FIX_LOG.md`](FIX_LOG.md).


## Phase 2 Implementation

Phase 2 telah diimplementasikan sebagai renderer 3D berbasis Three.js yang mengonsumsi `CubeState` dari Phase 1.

Files utama:

- `src/render/cube-render-model.js`
- `src/render/cube-renderer.js`
- `public/index.html`
- `public/styles.css`
- `tests/render-model.test.js`
- `PHASE_02_RENDERER.md`

Validasi terakhir:

```text
16 tests passed
0 failed
```

Perubahan selama Phase 2 dicatat di [`FIX_LOG.md`](FIX_LOG.md), termasuk `FIX-200`.

## Phase 5 Implementation

Phase 5 sekarang menggunakan **POV front-face method** dan telah diintegrasikan langsung dengan renderer, camera controller, move engine, dan turn runtime.

Files utama:

- `src/interaction/gesture.js`
- `src/interaction/pov-move-resolver.js`
- `src/interaction/manual-controller.js`
- `src/interaction/index.js`
- `src/render/cube-renderer.js`
- `src/render/face-turn-renderer.js`
- `src/core/cube.js`
- `src/animation/cube-turn-runtime.js`
- `public/phase5.html`
- `tests/interaction.test.js`
- `tests/manual-controller.test.js`
- `tests/interactive-drag.test.js`
- `tests/pov-move-resolver.test.js`
- `PHASE_05_MANUAL_INTERACTION.md`
- `PHASE_05_AUDIT.md`
- `21_COLOR_ORIENTATION_AND_POV.md`

### Final interaction contract

- canonical solved orientation: U yellow, D white, F red, R green, B orange, L blue;
- only physical F/R/B/L may become virtual `F`;
- fixed color adjacency determines virtual R/L/U/D/B;
- all 26 visible cubies can be interaction anchors;
- center, edge, and corner rules are resolved from cubie type/position;
- `M/E/S` are legal logical moves;
- live drag follows pointer displacement;
- release snaps or cancels;
- logical state changes only on commit.

Validasi terakhir:

```text
71 tests passed
0 failed
```

Perubahan selama Phase 5 dicatat di [`FIX_LOG.md`](FIX_LOG.md), termasuk `FIX-508`–`FIX-511`.

## Phase 4 Documentation

- [`PHASE_04_CAMERA_CONTROLS.md`](PHASE_04_CAMERA_CONTROLS.md) — camera state, orbit, zoom, reset, and control contract.

### Latest Phase 4 Fix
- `FIX-400` — Camera state/controller dipisahkan dari CubeState; pointer orbit, wheel zoom, preset rotation, dan reset view telah diverifikasi.


### Latest Phase 5 Fix
- `FIX-511` — Contract gesture lama dihapus; POV resolver menjadi single source of truth.
- `FIX-517` — Vertical front-face drag direction now follows the visual grab direction for all four eligible fronts; Red/F behavior is preserved and Green/R, Orange/B, Blue/L use the rotated notation table.
- `FIX-518` — Side-face corner vertical F/B-family turns now follow the active POV Front/Back face: F/F' for Red, R/R' for Green, B/B' for Orange, L/L' for Blue.
- `FIX-516` — Horizontal front-face drag direction now follows the visual grab direction for all four eligible fronts; POV frame is frozen per gesture.
- `FIX-510` — Picking mengekspos `cubieType` dan `logicalPosition`.
- `FIX-509` — Move engine menambahkan `M/E/S` dengan konvensi standar proyek.
- `FIX-508` — Manual interaction dirombak menjadi POV front-face method.
- `FIX-507` — Diagonal drag mengikuti dominant axis.
- `FIX-506` — Center, edge, dan corner tercakup.
- `FIX-505` — Live drag dan snap/cancel.
- `FIX-503` — Mapping lama disatukan sebelum kemudian digantikan penuh oleh POV resolver.
- `FIX-502` — Runtime cancellation aman.
- `FIX-501` — FaceTurnRenderAdapter terhubung pada entry point.
- `FIX-500` — Pointer ownership manual interaction.


### Latest interaction correction

`FIX-515` established the red/F horizontal direction correction. `FIX-516` generalizes that same visual-direction contract to green/R, orange/B, and blue/L while preserving the existing vertical and side-face mappings. The active POV frame is frozen for each gesture.
