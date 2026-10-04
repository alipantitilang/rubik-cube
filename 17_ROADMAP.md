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

## Phase 5 — Manual Rubik Interaction

Build:

- raycast/picking
- direct geometric drag resolution
- generic layer turn
- cube object orientation
- live drag and snap/cancel
- 54 sticker identity tracking
- 54 position tracking
- movable center stickers
- sticker transition history
- production entry-point cleanup

Status: **FINAL / Complete**

Phase 5 no longer depends on notation or a virtual Front frame.

## Phase 6 — Legal Shuffle / Play Flow

Status: **Complete**

Build:

- legal generic scramble generator
- deterministic seed support
- queued playback through `CubeTurnRuntime`
- fast smooth animation
- input locking
- Play state flow `idle → scrambling → playing`
- minimal production Play control in `index.html`

---

## Phase 7 — History & Solved Flow

Status: **Complete**

Build:

- player move history lifecycle
- solved detection flow after player turns
- move counter
- solve timer
- Congratulations state/overlay
- recent move history presentation
- Reshuffle / Play Again action contract
- reset/reshuffle state handling
- completed session result
- regression tests

---

## Phase 8 — UI & Responsive Product Shell

Status: **Complete**

Delivered:

- polished control/game panel
- state-driven status presentation
- timer and move counter
- recent history presentation
- cube rotation controls
- zoom slider and reset
- menu/help drawer
- solved result overlay
- responsive desktop/tablet/mobile layouts
- portrait and landscape adaptation
- safe-area and dynamic viewport handling

Validated with the existing 90-test regression suite.

## Phase 9 — Accessibility & Performance

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


### Phase 7 gameplay refinement
Inspection preview, explicit Start timing, Pause/Resume pause flow, Finish fallback, and reset lifecycle are included in the Phase 7 implementation.
