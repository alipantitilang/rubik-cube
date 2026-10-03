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
- Preset rotation API untuk tombol UI.
- Reset camera view.
- Camera state terpisah dari `CubeState`.
- Pitch clamp untuk mencegah kamera terbalik.
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
| Rotate Left/Right | Preset yaw increment |
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
- [x] Pitch memiliki batas aman.
- [x] Reset mengembalikan preset awal.
- [x] Zoom percentage dapat dipetakan dua arah.
- [x] Test camera state lulus.

## Handoff ke Phase 5

Phase 5 dapat menggunakan pointer events pada cube viewport untuk membedakan **camera drag** dan **face interaction**, tanpa mengubah camera state contract.
