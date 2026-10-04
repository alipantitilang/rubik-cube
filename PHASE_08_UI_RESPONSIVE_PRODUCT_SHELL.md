# Phase 8 — UI & Responsive Product Shell

Status: **COMPLETE**

## Goal

Turn the stable Phase 1–7 Rubik engine into a polished product shell without changing the cube model, generic turn engine, sticker identity model, shuffle legality, or Phase 7 session state machine.

## Delivered

- Reworked the single production `index.html` into a state-driven product shell.
- Added a compact header and menu drawer with controls/help information.
- Added desktop side game panel with state badge, timer, move counter, recent history, view controls, and zoom.
- Added mobile/tablet bottom-sheet layout and landscape adaptation.
- Added safe-area-aware spacing and dynamic viewport sizing with `100dvh`.
- Added cube rotation controls that operate on the Rubik object, not the camera.
- Added camera zoom slider and reset control using the existing camera zoom source of truth.
- Preserved wheel/touchpad zoom through the existing camera controller.
- Added clear READY, SCRAMBLING, PREVIEW, PLAYING, PAUSED, and SOLVED presentation states.
- Kept empty-space cube rotation available in every non-scrambling state; PREVIEW/PAUSED remain view-only for layer movement.
- Kept history generic (`X/Y/Z`, layer, turn amount) rather than reintroducing face notation.
- Added a compact solved result with time and move count plus Play Again/Reset.
- Kept UI controls out of the cube gesture surface and preserved the existing interaction ownership model.
- Removed the obsolete `src/interaction/gesture.js` module, which had already been superseded by `manual-controller.js`.

## Responsive targets

- Desktop: cube-first viewport with right-side game panel.
- Tablet: adaptive panel with reduced secondary controls.
- Mobile portrait: bottom-sheet game panel with primary actions above it.
- Mobile landscape: compact side panel so the cube keeps useful vertical space.
- Browser zoom/high-DPI: fluid CSS sizing, container-based renderer resize, and existing renderer pixel-ratio cap.

## State presentation

```text
READY
  ↓ Play
SCRAMBLING
  ↓ scramble complete
PREVIEW
  ↓ Start
PLAYING ↔ PAUSED
  ↓ solved
SOLVED
  ↓ Reset / Play Again
READY
```

The UI does not create a parallel gameplay state machine; `ShuffleController` remains authoritative.

## Acceptance

- [x] Polished control panel
- [x] Information/status presentation
- [x] Timer and move counter
- [x] Recent history presentation
- [x] View rotation controls
- [x] Zoom slider/reset
- [x] Menu shell
- [x] Solved result overlay
- [x] Desktop layout
- [x] Tablet adaptation
- [x] Mobile portrait adaptation
- [x] Mobile landscape adaptation
- [x] Safe-area handling
- [x] Dynamic viewport sizing
- [x] Existing 90-test regression suite passes
- [x] No new phase-specific HTML entry point

## Out of scope

- Keyboard gameplay controls
- Reduced-motion policy
- Full accessibility audit
- Sound/music
- Accounts/leaderboards
- Undo/redo/replay
- Core engine or gesture-model changes
