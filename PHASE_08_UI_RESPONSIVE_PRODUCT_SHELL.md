# Phase 8 — UI & Responsive Product Shell

Status: **COMPLETE — FINAL**

## Goal

Turn the stable Phase 1–7 Rubik engine into a polished product shell without changing the cube model, generic turn engine, sticker identity model, shuffle legality, or Phase 7 session state machine.

## Delivered

- Reworked the single production `index.html` into a state-driven product shell.
- Added a compact header and menu drawer with controls/help information.
- Added desktop side game panel with state badge, timer, move counter, recent history, view controls, zoom, and state-aware primary actions.
- Added mobile/tablet bottom-sheet layout and compact landscape adaptation; primary game actions now stay inside the same responsive panel instead of floating over the cube.
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
- [x] Existing 94-test regression suite passes
- [x] No new phase-specific HTML entry point

## Out of scope

- Keyboard gameplay controls
- Reduced-motion policy
- Full accessibility audit
- Sound/music
- Accounts/leaderboards
- Undo/redo/replay
- Core engine or gesture-model changes

## UI refinement pass
The Phase 8 shell now uses a translucent blurred-glass Cube Session panel. The panel has a dedicated collapse control positioned outside its left edge and a reopen control at the right edge after collapse. Opening and closing use smooth spring-like CSS easing. The background uses a dark rock field with six animated lava-like streams: red, green, blue, orange, yellow, and white, each with its own gradient and curved path. All visible interface copy is Indonesian.

### FIX-535 refinement
Phase 8 visual direction was refined after review: the Sesi Kubus panel now uses a solid modern tab/card rather than glassmorphism. Its borders, headings and controls use a coordinated animated blue-gradient treatment. The external collapse control sits on the panel's left edge and points right; the reopen control sits on the right edge and points left. The multi-color lava field is explicitly layered behind the WebGL cube so its animated channels remain visible.


## FIX-536 — Final visual direction

The Phase 8 visual direction is now a **retro puzzle-machine** theme rather than a modern/glass interface. The UI uses chunky display typography, asymmetric card corners, hard offset shadows, outlined controls, muted console colors, and tactile button states. The lava background concept was removed from the system entirely. The cube remains the visual focus on a dark, lightly gridded puzzle-console backdrop.

The collapsible Sesi Kubus panel remains part of the Phase 8 shell: its external left control closes the panel toward the right and points right; the right-edge reopen control points left and opens the panel.


### FIX-537 visual refinement
The main camera framing is intentionally a little farther away so the cube leaves more breathing room around the play area. Colored sticker squares now use static LED-style emissive lighting with solid color; there is no running highlight or gradient.


### FIX-538 visual refinement
Sticker squares use static LED-like emissive lighting. The running-light sweep was removed while preserving the farther camera framing.

### FIX-539 visual refinement
The default cube framing is intentionally farther out. View controls use directional triangle affordances for zoom and rotation, with a circular orientation reset. The session panel open/close affordances use a compact retro-console tab treatment.

### FIX-540 visual refinement
The Phase 8 view controls now use literal geometric silhouettes: triangle-only directional controls and a circular reset control. The session panel uses one attached tab rather than separate open/close items; the tab moves with the panel using the same slow easing curve, keeping the control and panel visually coupled.


### FIX-541 visual refinement
The view controls now use only literal geometric silhouettes: triangles for directional zoom/rotation and a circle for orientation reset. The session panel uses one persistent, symbol-free vertical tab marker. The tab remains clickable at the screen edge while the panel is collapsed, and panel/tab motion uses a slower 920ms shared easing so the control and panel read as one mechanism.


### FIX-542 visual refinement

The view-control composition now centers the rotate cluster, while zoom uses a full-width horizontal bar with + and − endpoints. The session panel uses a more balanced width and the persistent tab is taller/narrower with a single vertical marker.

## FIX-543 — Grab Rotation Follows Pointer Direction

- **Status:** FIXED
- **Phase:** Phase 8 / interaction refinement
- **Problem:** Empty-space grab rotation felt inverted: dragging left/right or up/down rotated the Rubik opposite to the pointer movement.
- **Fix:** Screen-space drag deltas now map directly to the cube orientation quaternion without the previous sign inversion. A positive horizontal drag rotates the Rubik toward the right; a positive vertical drag rotates it toward the downward pointer movement.
- **Invariant:** Sticker/layer drag resolution, turn engine, camera, history, shuffle, timer, and solved-state behavior are unchanged.
- **Acceptance:** Horizontal and vertical grab-direction tests verify that the cube follows the pointer direction; full regression suite passes.


## FIX-544 refinement — Stable geometry
The session panel is treated as a fixed layout surface rather than content-driven auto-size. Gameplay controls occupy predefined slots from the initial render; inactive controls retain their space as invisible placeholders. The main action remains visible across shuffle state changes and changes label instead of disappearing. The history area has a dedicated fixed-size viewport, with only its list contents changing and scrolling internally.


## FIX-545 refinement — Fixed slots and draggable session tab

The session tab is now treated as a fixed physical layout. Its slot geometry does not depend on state, button visibility, timer values, or history length. The gameplay action is one persistent control whose label follows the session lifecycle: `Main`, `Di proses`, `Mulai`, `Jeda`, and `Lanjut`. Reset owns a reserved second slot and appears with a transition. The history viewport has a fixed height sized for approximately three visible rows and scrolls internally. The manual Finish action is removed because solved completion is automatic.

The attached panel tab supports horizontal grab gestures. During a grab, the panel follows the pointer and then snaps open/closed; this drag transition is intentionally distinct from the slower automatic close that occurs when `Mulai` is pressed.

### FIX-546 — Compact view-control arrangement

The fixed session panel now keeps the gameplay area compact when the reset action is unavailable. The rotate cluster shares its row with vertically stacked zoom-in/zoom-out controls, while the range input occupies the full width on the bottom line by itself. Panel geometry remains fixed; only inactive action content collapses visually.

## FIX-547 — Remove unused information menu and lift compact session panel

The unused top-right information/menu surface was removed from the product shell because the feature is not yet required. Its DOM, interaction handlers, scrim, side-menu content, and dedicated styling were removed. On compact screens the fixed session panel is positioned higher so its full border frame remains visible without changing the panel's established geometry.

### FIX-548 viewport-fit refinement
Compact session panels must remain fully visible inside the available viewport. On short screens the panel uses a viewport-bounded responsive height rather than overflowing below the screen; state transitions do not alter that geometry.


## FIX-549 — Fixed panel geometry, direct edge zoom, and pinch zoom

- Session panel uses a fixed 360px × 640px CSS design size and no longer derives its dimensions from responsive viewport calculations.
- Added a bottom breathing space so the internal zoom rail does not touch the panel border.
- Added a dedicated vertical edge zoom control on compact portrait screens and compact landscape screens, so zoom remains available without opening the session panel.
- Added two-finger pinch zoom to the camera controller; multi-touch is handed to camera zoom instead of cube/layer dragging.
- The panel content may scroll on unusually short viewports rather than changing the panel's design dimensions.
