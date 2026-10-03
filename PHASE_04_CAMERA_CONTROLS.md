# PHASE 04 — Camera & View Controls

## Status

**COMPLETE**

## Goal

Menyediakan kontrol kamera yang halus, responsif, dan terpisah dari logical Rubik state.

## Implemented

- Orbit kamera dengan pointer/mouse drag.
- Scroll wheel untuk zoom.
- Touch/pointer compatible input melalui Pointer Events.
- Zoom state dengan range terkontrol.
- Continuous yaw orbit; rotate buttons only apply relative yaw increments.
- Reset camera view.
- Camera state terpisah dari `CubeState`.
- Pitch clamp mendekati ±90° agar kamera dapat melihat dari atas/bawah tanpa membalik melewati pole.
- Resize/high-DPI tetap ditangani renderer.
- `touch-action: none` pada viewport agar gesture custom tidak direbut browser.

## Camera State Contract

State kamera terdiri dari:

- `yaw`
- `pitch`
- `distance`
- `target`
- `minDistance`
- `maxDistance`

Perubahan camera state tidak boleh mengubah `CubeState`.

## Controls Contract

| Input | Behavior |
|---|---|
| Left pointer drag | Orbit yaw/pitch |
| Wheel | Zoom in/out |
| Zoom slider | Direct zoom percentage |
| Rotate Left/Right | Relative yaw increment; yaw may pass 360° |
| Reset View | Kembali ke default camera |

## Scope Exclusions

- Tidak mengubah sticker/cubie state.
- Tidak melakukan face turn.
- Tidak melakukan scramble.
- Tidak menentukan gesture face-turn Rubik; itu Phase 5.

## Acceptance Criteria

- [x] Camera state independen dari cube state.
- [x] Pointer drag mengubah orbit.
- [x] Wheel mengubah distance.
- [x] Distance selalu berada dalam range.
- [x] Pitch mendekati ±90° tanpa melewati pole.
- [x] Reset mengembalikan preset awal.
- [x] Zoom percentage dapat dipetakan dua arah.
- [x] Test camera state lulus.

## Handoff ke Phase 5

Phase 5 menggunakan pointer events pada cube viewport untuk membedakan **camera drag** dan **POV-relative cube interaction**, tanpa mengubah camera state contract. Phase 5 mengambil snapshot kamera saat gesture dimulai dan menurunkannya menjadi virtual F/R/L/U/D/B.

## Phase 5 ownership note

Phase 4 retains a reusable camera orbit controller, but Phase 5 intentionally disables pointer camera orbit. In Phase 5, the camera is a viewer/reference and empty-space drag rotates the Rubik object via `CubeOrientationController`. Zoom remains camera-owned.
