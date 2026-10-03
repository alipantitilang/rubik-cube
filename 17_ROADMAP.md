# Implementation Roadmap

## Phase 0 — Documentation

Current phase.

Deliver:

- PRD
- rules
- architecture
- cube model
- move engine spec
- shuffle spec
- interaction spec
- animation spec
- UI spec
- responsive spec
- state machine
- history
- accessibility
- performance
- testing
- definition of done

---

## Phase 1 — Cube Core

Build:

1. coordinates
2. cubies
3. solved state
4. face definitions
5. move engine
6. solved checker

Do not polish UI yet.

---

## Phase 2 — Renderer

Build:

1. scene
2. camera
3. lights
4. 26 cubies
5. stickers/colors
6. exact transforms

---

## Phase 3 — Turn Animation

Build:

1. layer pivot
2. quarter turn
3. inverse
4. half turn
5. animation queue
6. state synchronization

---

## Phase 4 — Camera

Build:

- orbit
- zoom
- reset view
- rotate buttons

---

## Phase 5 — Manual Face Interaction

Build:

- raycast/picking
- face identification
- gesture projection
- direction mapping
- turn command

This is a high-risk interaction phase and needs dedicated testing.

Status: **Complete — direct geometric layer interaction**

Validation: **71 tests passed, 0 failed**

The finalized interaction contract has no virtual Front frame. A sticker drag is resolved directly from sticker normal, screen drag, cube quaternion, and cubie position into `{ axis, layer, quarterTurns }`. Empty-space drag rotates the Rubik object. All 54 stickers have stable identity codes and all 54 visible slots are `p01..p54`; committed turns record `code: from → to`.

---

## Phase 6 — Shuffle

Build:

- legal scramble generator
- deterministic seed support
- queue
- fast smooth animation
- input locking

---

## Phase 7 — UI

Build:

- Play
- history
- information
- zoom bar
- rotate controls
- Congratulations
- Reshuffle

---

## Phase 8 — Responsive

Test and tune:

- mobile portrait
- mobile landscape
- tablet
- desktop
- browser zoom
- high DPI

---

## Phase 9 — Accessibility

Add:

- keyboard
- focus
- labels
- reduced motion

---

## Phase 10 — QA

Run complete test plan.

Do not release while any move-engine invariant fails.

## Phase 5 Architecture Reset — 2026-10-04

Phase 5 no longer depends on a POV Front frame. The active interaction primitive is a generic layer turn derived from sticker geometry and drag direction.

The project now also treats all 54 visible stickers as permanent identities with stable codes and all 54 visible sticker locations as stable slot IDs `p01..p54`.

Future History/Replay phases must use these identities and positions rather than notation strings.
