# Phase 5 — POV Interaction Audit

## Result

**PASS — redesigned and revalidated.**

The previous Phase 5 gesture model was replaced because it treated the picked sticker face as a permanent local coordinate system. That did not match the desired physical Rubik interaction after camera rotation and could not express the M/E/S slice rules cleanly.

## Major structural changes

### 1. Single POV resolver

Added:

`src/interaction/pov-move-resolver.js`

Responsibilities:

- determine dominant physical front face from camera position, restricted to F/R/B/L;
- derive relative R/L/U/D/B faces from the fixed color adjacency table;
- freeze the POV frame for a gesture;
- resolve center/edge/corner anchors;
- map the specified front and side rules to legal notation.

### 2. Removed duplicate gesture-to-face mapping

The old `FACE_BASES` / `gestureToMove()` contract was removed from the active interaction architecture. `gesture.js` now only owns generic threshold/progress helpers.

### 3. Logical engine extension

`src/core/cube.js` now supports:

```text
M M' M2
E E' E2
S S' S2
```

with the required conventions:

```text
M follows L
E follows D
S follows F
```

### 4. Renderer picking context

Picking now exposes:

- `cubieType`
- `logicalPosition`

so interaction does not have to reconstruct state from render transforms.

## Validation

```text
71 tests passed
0 failed
```

The suite includes:

- canonical color orientation and fixed F/R/B/L front eligibility;

- logical face and slice move invariants;
- POV dominant-face selection;
- every specified front corner mapping;
- every specified front edge mapping;
- front horizontal direction consistency for all four eligible fronts (F/R/B/L);
- front vertical direction consistency for all four eligible fronts (F/R/B/L), including top/bottom corners and edges;
- every specified right/left corner mapping;
- every specified right/left edge mapping;
- center interaction, including U/D center fallback without front-face authority;
- live runtime commit/cancel;
- pointer ownership;
- camera isolation;
- existing Phase 1–6 regression tests.

## Decision

Phase 5 is considered complete under the new POV interaction contract, including the four-front horizontal and vertical direction contracts and gesture-time POV frame lock. Phase 6 may build on the finalized move notation and runtime without reintroducing the previous face-plane gesture system.


### FIX-518 — Side-face F/F' family

PASS — right/left side corner vertical interaction now resolves the active POV front/back notation rather than literal physical F/B. Red→F/F', Green→R/R', Orange→B/B', Blue→L/L'.
