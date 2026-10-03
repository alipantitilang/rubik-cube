# PHASE 02 — 3D Renderer / Visual Cube

## Phase status

**Pending**

This document defines the exact scope for Phase 2.

Phase 2 begins only after the logical cube model from Phase 1 is stable enough to provide deterministic cubie positions, orientations, identities, and colors.

---

# 1. Objective

Create the first complete 3D visual representation of the Rubik.

At the end of this phase, the user should be able to see a clean, correctly constructed, solved 3×3 Rubik containing exactly:

```text
8 corners
12 edges
6 centers
──────────
26 visible cubies
```

The logical center position:

```text
(0,0,0)
```

must remain empty.

The renderer must visually represent the cube without requiring the cube to be playable yet.

---

# 2. Phase boundary

## Included

- 3D scene
- renderer
- camera
- basic lighting
- 26 cubies
- cubie geometry
- stickers / face materials
- face color configuration
- cubie IDs
- logical-to-render coordinate conversion
- logical-to-render orientation conversion
- solved cube rendering
- camera initial view
- renderer resize
- high-DPI handling
- stable object mapping

## Not included

Do **not** make these Phase 2 deliverables:

- manual face dragging
- scramble generation
- Play flow
- move history
- Congratulations
- Reshuffle
- full move animation
- solving interaction
- timer
- scoring
- online features

A small renderer-only rotation test is allowed for debugging, but it must not become the final move system.

---

# 3. Renderer source of truth

The renderer consumes the logical cube state.

```text
CubeState
    ↓
Cubie data
    ↓
Renderer mapping
    ↓
3D objects
```

The renderer must never independently invent:

- cubie positions;
- cubie identities;
- sticker colors;
- puzzle orientation.

---

# 4. Required cubies

The renderer must create exactly 26 visible cubie objects.

Expected classification:

## Corners

8 objects.

Each has three visible stickers.

## Edges

12 objects.

Each has two visible stickers.

## Centers

6 objects.

Each has one visible sticker.

## Internal center

No visible cubie.

Position:

```text
(0,0,0)
```

This position may have an invisible internal pivot/core object if required by the rendering architecture.

The core is not counted as a Rubik cubie.

---

# 5. Stable cubie identity

Every visible cubie must have a stable ID.

Example conceptual IDs:

```text
corner-UFR
corner-UFL
corner-UBR
corner-UBL
corner-DFR
corner-DFL
corner-DBR
corner-DBL

edge-UR
edge-UF
edge-UL
edge-UB
edge-FR
edge-FL
edge-BR
edge-BL
edge-DR
edge-DF
edge-DL
edge-DB

center-U
center-D
center-F
center-B
center-R
center-L
```

The exact naming scheme may vary, but IDs must be deterministic.

IDs must not change because the camera moves.

---

# 6. Geometry

The cube should visually read as one Rubik rather than 26 unrelated blocks.

Recommended geometry principles:

- consistent cubie dimensions;
- small controlled gaps between cubies;
- crisp edges;
- no excessive bevel;
- no accidental intersections;
- no visible internal core.

The gap should be visually intentional.

Do not use a gap so large that the cube looks disconnected.

Do not use a gap so small that face boundaries become unclear.

---

# 7. Stickers / face surfaces

Every visible colored face should correspond to a logical sticker.

A sticker is not an arbitrary decoration.

Its color comes from the logical cube state.

The renderer must be able to answer:

```text
Which cubie owns this sticker?
Which logical face does it represent?
What color should it have?
```

This will be required later for face picking and drag interaction.

---

# 8. Face color configuration

Colors must be centralized.

Initial mapping:

```text
U = White
D = Yellow
F = Green
B = Blue
R = Red
L = Orange
```

Do not scatter raw color values across renderer files.

Use a configuration object.

Conceptual:

```ts
const CUBE_COLORS = {
  U: ...,
  D: ...,
  F: ...,
  B: ...,
  R: ...,
  L: ...
}
```

This allows future visual tuning without changing cube logic.

---

# 9. Color differentiation

The six colors must be clearly distinguishable.

Pay particular attention to:

```text
F = Green
B = Blue
```

and:

```text
R = Red
L = Orange
```

Avoid two colors becoming visually too similar because of lighting or material settings.

Color should remain readable under the chosen lighting.

---

# 10. Orientation

The renderer must correctly convert logical orientation into a 3D rotation.

A cubie's stickers must remain attached to the correct local faces.

For example, a corner with:

```text
U + F + R
```

must visibly show:

```text
white
green
red
```

on the corresponding sides in the solved state.

---

# 11. Coordinate conversion

The logical cube uses integer coordinates:

```text
-1
 0
+1
```

The renderer converts them into world-space positions.

Conceptually:

```text
worldPosition =
    logicalPosition × cubieSpacing
```

The exact spacing is configurable.

Do not hard-code spacing throughout the scene.

---

# 12. Camera

Create a stable initial camera.

The solved cube must be:

- fully visible;
- centered;
- comfortably framed;
- not clipped;
- not excessively small.

Phase 2 only requires the camera to exist.

Full camera interaction belongs to Phase 4.

---

# 13. Lighting

Use simple lighting that clearly separates:

- cubie surfaces;
- stickers;
- gaps;
- edges.

Lighting must not change the logical identity of a face.

Avoid excessive:

- bloom;
- chromatic aberration;
- fog;
- particles;
- cinematic effects.

The cube must remain readable.

---

# 14. Visual quality

Target:

- clean edges;
- stable shading;
- crisp stickers;
- balanced contrast;
- premium but restrained appearance.

The cube is the hero visual.

Do not spend Phase 2 effort on decorative UI.

---

# 15. Renderer object lifecycle

Create the 26 cubie render objects once.

Do not destroy and recreate all cubies for every future move.

Use stable object references.

Conceptually:

```text
cubie ID
    ↓
render object
```

---

# 16. State synchronization

When the logical state changes, the renderer should be able to update:

```text
position
orientation
sticker appearance
```

The renderer should not mutate the logical state.

---

# 17. Resize behavior

The renderer must respond to its actual viewport/container dimensions.

When the container changes:

1. read current width;
2. read current height;
3. update render resolution;
4. update camera aspect;
5. update camera projection;
6. preserve logical cube state.

Do not reconstruct the cube.

---

# 18. High-DPI

Support device pixel ratio.

Avoid unnecessarily huge render buffers.

Use a sensible maximum pixel ratio if needed for performance.

The exact cap should be tuned during performance testing.

---

# 19. Browser zoom

Phase 2 must not assume browser zoom is 100%.

The renderer should remain visually contained when the browser zoom changes.

---

# 20. Debug mode

During development, it is useful to expose optional diagnostics:

```text
cubie count
cubie IDs
logical positions
logical orientations
renderer object count
```

Debug diagnostics must not be required for normal operation.

---

# 21. Phase 2 validation

The following must be verified before Phase 2 is marked complete.

## Geometry

- [ ] exactly 26 visible cubies
- [ ] no visible cubie at `(0,0,0)`
- [ ] 8 corners
- [ ] 12 edges
- [ ] 6 centers
- [ ] consistent spacing
- [ ] no unintended intersections

## Stickers

- [ ] all visible stickers have correct colors
- [ ] six face colors are distinguishable
- [ ] solved cube matches conventional color mapping
- [ ] sticker orientation is correct

## Mapping

- [ ] every cubie has stable ID
- [ ] every cubie maps to one logical state object
- [ ] renderer does not invent puzzle state
- [ ] logical coordinates map correctly to world positions

## Camera

- [ ] cube is centered
- [ ] cube is fully visible
- [ ] no clipping at initial view

## Resize

- [ ] desktop resize works
- [ ] mobile-like narrow viewport works
- [ ] portrait works
- [ ] landscape works
- [ ] browser zoom does not break renderer
- [ ] high-DPI rendering remains usable

## Architecture

- [ ] renderer is separate from cube domain logic
- [ ] color configuration is centralized
- [ ] geometry configuration is centralized
- [ ] no move logic is hidden inside renderer

---

# 22. Phase 2 completion criteria

Phase 2 may be marked:

```text
COMPLETE
```

only when all validation items above pass.

The result should be:

> A visually correct, stable, responsive 3D solved Rubik consisting of exactly 26 visible cubies, ready for Phase 3 face-turn animation.

---

# 23. Phase 3 handoff

Phase 3 will take the renderer from:

```text
static solved cube
```

to:

```text
logical move
    ↓
animated layer rotation
    ↓
final logical state
```

Therefore Phase 2 must leave a clean way to:

- identify cubies by ID;
- group cubies by logical layer;
- temporarily attach them to a rotation pivot;
- restore exact transforms after animation.

Do not optimize the renderer in a way that makes layer-based animation difficult.

---

# 24. Phase rule

Do not declare Phase 2 complete merely because:

> “the cube looks correct.”

It must also be structurally correct.

Visual correctness and architectural correctness are both required.
