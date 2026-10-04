# FIX LOG

**Project:** 26-Cubies Rubik Web  
**Purpose:** Mencatat seluruh perbaikan, koreksi, perubahan spesifikasi, tambahan requirement, dan keputusan revisi yang muncul selama pengerjaan tiap fase.

> File ini adalah **catatan perubahan lintas fase**. Dokumentasi fase masing-masing tetap menjadi sumber detail teknis. README menjadi sumber status proyek dan ringkasan perubahan.

---

## Cara Menggunakan Fix Log

Setiap kali sebuah fase sedang dikerjakan dan ditemukan:

- bug atau ketidaksesuaian dengan spesifikasi,
- animasi yang tidak sinkron,
- interaksi yang perlu diperbaiki,
- requirement baru,
- perubahan desain yang memengaruhi implementasi,
- edge case,
- keputusan teknis baru,
- atau tambahan acceptance criteria,

catat perubahan tersebut di file ini.

Setelah dicatat di sini:

1. **README.md** harus diperbarui pada bagian `Fix / Change Log`.
2. Dokumentasi fase terkait harus diperbarui jika perubahan tersebut mengubah aturan atau spesifikasi fase.
3. Implementasi harus mengikuti versi dokumentasi terbaru.
4. Item yang belum selesai harus tetap ditandai sebagai `OPEN`.
5. Item yang sudah diperbaiki harus ditandai `FIXED`.
6. Perubahan yang dibatalkan atau tidak lagi berlaku ditandai `CANCELLED`.
7. Jangan menghapus riwayat fix yang sudah selesai. Riwayat harus tetap dapat dilacak.

---

## Status

| Status | Arti |
|---|---|
| `OPEN` | Perlu dikerjakan / belum selesai |
| `IN PROGRESS` | Sedang dikerjakan |
| `FIXED` | Sudah diperbaiki dan diverifikasi |
| `WONT FIX` | Sengaja tidak diperbaiki karena alasan yang terdokumentasi |
| `CANCELLED` | Perubahan dibatalkan / tidak lagi berlaku |
| `DEFERRED` | Ditunda ke fase lain |

---

# Master Fix Log

| ID | Fase | Tipe | Status | Ringkasan | Dokumentasi Terkait |
|---|---|---|---|---|---|
| FIX-000 | Phase 0 | Baseline | FIXED | Sistem Fix Log dibuat sebagai bagian dari dokumentasi proyek. | `README.md`, `FIX_LOG.md` |
| FIX-200 | Phase 2 | Test | FIXED | Memperbaiki assertion test warna agar membandingkan face-to-color contract, bukan nama warna ke nilai hex. | `tests/render-model.test.js` |
| FIX-300 | Phase 3 | Animation / Renderer | FIXED | Reset transform cubie setelah face-turn agar rotasi sementara tidak terakumulasi sebagai drift visual. | `src/render/cube-renderer.js`, `PHASE_03_FACE_TURN_ANIMATION.md` |
| FIX-500 | Phase 5 | Interaction / Architecture | FIXED | Integrasi manual face gesture dengan renderer dan camera Phase 4 agar sticker drag tidak ikut mengorbit kamera. | `src/interaction/gesture.js`, `src/interaction/manual-controller.js`, `src/render/cube-renderer.js`, `src/camera-controller.js`, `PHASE_05_MANUAL_INTERACTION.md` |
| FIX-505 | Phase 5 | Interaction / Animation | FIXED | Mengubah manual face turn menjadi live drag: layer mengikuti displacement pointer dan snap/cancel saat release. | `src/interaction/gesture.js`, `src/interaction/manual-controller.js`, `src/animation/cube-turn-runtime.js`, `PHASE_05_MANUAL_INTERACTION.md` |
| FIX-506 | Phase 5 | Interaction / Coverage | FIXED | Semua sticker center, edge, dan corner menggunakan kontrak picking dan interactive turn yang sama. | `src/render/cube-renderer.js`, `src/interaction/manual-controller.js`, `tests/interactive-drag.test.js` |
| FIX-507 | Phase 5 | Gesture | FIXED | Diagonal live drag diselesaikan berdasarkan dominant axis sehingga arah drag alami tetap dapat memutar face. | `src/interaction/gesture.js`, `tests/interactive-drag.test.js` |
| FIX-508 | Phase 5 | Architecture / Interaction | FIXED | Mengganti gesture face-plane lama dengan POV front-face method: dominant camera face menjadi virtual F dan R/L/U/D/B diturunkan relatif terhadap POV. | `src/interaction/drag-move-resolver.js`, `src/interaction/manual-controller.js`, `PHASE_05_MANUAL_INTERACTION.md` |
| FIX-509 | Phase 5 / Phase 1 | Move Engine | FIXED | Menambahkan M/E/S sebagai legal slice moves dengan konvensi M mengikuti L, E mengikuti D, S mengikuti F. | `src/core/cube.js`, `05_MOVE_ENGINE.md`, `tests/cube.test.js` |
| FIX-510 | Phase 5 | Interaction / Renderer | FIXED | Picking sekarang mengembalikan `cubieType` dan `logicalPosition` agar resolver tidak menebak struktur cubie dari render transform. | `src/render/cube-renderer.js`, `tests/drag-move-resolver.test.js` |
| FIX-511 | Phase 5 | Cleanup | FIXED | Menghapus contract gesture lama yang memiliki mapping face langsung dan menjadikan POV resolver sebagai satu-satunya sumber aturan manual interaction. | `src/interaction/gesture.js`, `src/interaction/index.js`, `tests/interaction.test.js` |
| FIX-512 | Phase 5 | Cube Model / Renderer / Interaction | FIXED | Menetapkan canonical color orientation: U yellow, D white, F red, R green, B orange, L blue; hanya F/R/B/L menjadi POV front. | `src/core/cube.js`, `src/render/cube-render-model.js`, `src/interaction/drag-move-resolver.js`, `21_INTERACTION_GEOMETRY_AND_STICKER_IDENTITY.md` |
| FIX-513 | Phase 5 / Phase 1 | Move Engine / Animation | FIXED | Mengoreksi M/E/S agar hanya memutar 4 middle-slice edge cubies; center cubies tetap fixed. | `src/core/cube.js`, `src/animation/turn-animator.js`, `tests/cube.test.js`, `tests/animation.test.js` |
| FIX-514 | Phase 5 | Interaction / Coverage | FIXED | Yellow/White centers tetap draggable sebagai U/D anchors tanpa memperoleh hak menjadi POV front. | `src/interaction/drag-move-resolver.js`, `tests/drag-move-resolver.test.js` |

---

# Phase 0 — Documentation Baseline

### FIX-000
- **Status:** `FIXED`
- **Tipe:** Documentation
- **Ringkasan:** Menambahkan sistem Fix Log terpusat agar seluruh revisi dan tambahan requirement selama pengerjaan dapat dilacak.
- **Dampak:** README dan dokumentasi proyek.
- **Catatan:** Fix Log menjadi riwayat perubahan, bukan pengganti dokumentasi teknis fase.

---


## Phase 1 — Cube Core / Logical Engine

### FIX-100
- **Status:** `FIXED`
- **Tipe:** Bug / Move Engine
- **Tanggal:** 2026-10-03
- **Fase:** Phase 1 — Cube Core / Logical Engine
- **Ringkasan:** Inversi move untuk beberapa face tidak menghasilkan rotasi lawan yang benar.
- **Masalah / Alasan:** Implementasi awal menghitung modifier inverse dari jumlah quarter-turn tanpa mempertimbangkan arah base move per face. Akibatnya move seperti `D` dapat menghasilkan inverse yang salah.
- **Perubahan:** Logika `invertMove()` sekarang membandingkan inverse quarter-turn dengan definisi base face dan memilih modifier canonical ``, `'`, atau `2` secara benar.
- **Acceptance:** `M + M⁻¹ = identity` untuk seluruh face dan modifier yang diuji.
- **Dokumentasi Terkait:** `PHASE_01_CORE_ENGINE.md`, `tests/cube.test.js`

### FIX-101
- **Status:** `FIXED`
- **Tipe:** Test / State Representation
- **Tanggal:** 2026-10-03
- **Fase:** Phase 1 — Cube Core / Logical Engine
- **Ringkasan:** Pengujian awal menganggap setiap dari 9 cubie pada face harus selalu memiliki perubahan signature setelah face turn.
- **Masalah / Alasan:** Face-center cubie berputar pada sumbu normalnya; orientasi sticker tunggalnya tidak berubah secara representasional, walaupun cubie tersebut memang termasuk layer yang diputar.
- **Perubahan:** Test diubah untuk memverifikasi **layer selection** berisi tepat 9 cubies, bukan menghitung perubahan signature.
- **Acceptance:** Setiap `U/D/R/L/F/B` memilih tepat 9 cubies.
- **Dokumentasi Terkait:** `PHASE_01_CORE_ENGINE.md`, `tests/cube.test.js`

# Phase 1 — Cube Core / Logical Engine

Phase 1 fix entries are recorded above. No unresolved Phase 1 fix remains.

---

# Phase 2 — 3D Renderer / Visual Cube

### FIX-200
- **Status:** `FIXED`
- **Tipe:** Test
- **Tanggal:** 2026-10-03
- **Fase:** Phase 2 — 3D Renderer / Visual Cube
- **Ringkasan:** Assertion test warna awal membandingkan nilai nama warna dari CubeState dengan nilai hex renderer.
- **Masalah / Alasan:** Kontrak renderer memang menerima nama warna dari logical state lalu menerjemahkannya ke palette hex terpusat. Test sebelumnya salah membandingkan dua representasi berbeda.
- **Perubahan:** Test diubah untuk memvalidasi face → logical color dan memastikan setiap face memiliki entry pada `CUBE_COLORS`.
- **Acceptance:** Seluruh test Phase 1 + Phase 2 harus lulus.
- **Dokumentasi Terkait:** `PHASE_02_RENDERER.md`, `tests/render-model.test.js`.



---

# Phase 3 — Face-Turn Animation

Belum ada fix.

> Semua perubahan yang ditemukan selama Phase 3 ditambahkan di bawah bagian ini dengan ID `FIX-3xx`.

---


# Phase 3 — Face-Turn Animation

### FIX-300
- **Status:** `FIXED`
- **Tipe:** Animation / Renderer
- **Tanggal:** 2026-10-03
- **Fase:** Phase 3 — Face-Turn Animation
- **Ringkasan:** Setelah cubie keluar dari temporary turn group, transform rotasinya dapat tetap terbawa jika renderer hanya memperbarui posisi.
- **Masalah / Alasan:** Face-turn menggunakan temporary pivot group. Setelah selesai, logical sticker orientation menjadi sumber kebenaran sehingga transform rotasi visual lama harus dibuang. Jika tidak, turn berulang dapat mengakumulasi rotasi visual.
- **Perubahan:** `renderCube()` sekarang mereset `rotation` dan `scale` setiap cubie sebelum menyinkronkan sticker berdasarkan `CubeState`.
- **Acceptance:** Setelah setiap move selesai, visual state berasal dari logical state dan repeated turns tidak mengakumulasi transform error.
- **Dokumentasi Terkait:** `PHASE_03_FACE_TURN_ANIMATION.md`

---

# Phase 4 — Camera & View Controls

### FIX-400
- **Status:** `FIXED`
- **Tipe:** Enhancement / Architecture
- **Tanggal:** 2026-10-03
- **Fase:** Phase 4 — Camera & View Controls
- **Ringkasan:** Menambahkan camera state dan controller terpisah dari CubeState.
- **Perubahan:** Orbit pointer, wheel zoom, zoom percentage, preset rotation API, pitch clamp, dan reset view.
- **Acceptance:** Camera controls tidak memodifikasi logical cube state dan seluruh camera state tests lulus.
- **Dokumentasi Terkait:** `PHASE_04_CAMERA_CONTROLS.md`, `README.md`



> Semua perubahan yang ditemukan selama Phase 4 ditambahkan di bawah bagian ini dengan ID `FIX-4xx`.

---


### FIX-501
- **Status:** `FIXED`
- **Tipe:** Integration / Animation
- **Tanggal:** 2026-10-03
- **Fase:** Phase 5 — Manual Rubik Interaction
- **Ringkasan:** Entry point Phase 5 belum memasang `TurnRenderAdapter`, sehingga gesture dapat mengubah logical state setelah runtime selesai tetapi tidak menampilkan face-turn animation.
- **Masalah / Alasan:** `CubeTurnRuntime` hanya melakukan transform sementara jika adapter disediakan.
- **Perubahan:** `index.html` dan `index.html` sekarang membuat `TurnRenderAdapter` dan memasukkannya ke `CubeTurnRuntime`.
- **Acceptance:** Manual sticker drag menghasilkan animasi face-turn sebelum logical state di-commit.
- **Dokumentasi Terkait:** `PHASE_05_MANUAL_INTERACTION.md`, `index.html`, `index.html`, `tests/integration-contract.test.js`

### FIX-502
- **Status:** `FIXED`
- **Tipe:** State / Animation / Cleanup
- **Tanggal:** 2026-10-03
- **Fase:** Phase 5 / Phase 6 boundary
- **Ringkasan:** Pembatalan runtime dari `ShuffleController.reset()` dapat memutus active turn tanpa membersihkan temporary render transform.
- **Masalah / Alasan:** Mengubah `animator.active` langsung melewati lifecycle adapter dan dapat meninggalkan cubie pada transform visual parsial.
- **Perubahan:** Menambahkan `CubeTurnRuntime.cancel()` sebagai satu-satunya jalur pembatalan yang membersihkan adapter, queue, dan me-render ulang authoritative `CubeState`. `ShuffleController.reset()` sekarang menggunakan API tersebut.
- **Acceptance:** Reset saat active turn tidak meninggalkan visual transform parsial dan runtime kembali idle.
- **Dokumentasi Terkait:** `src/animation/cube-turn-runtime.js`, `src/animation/shuffle-controller.js`, `tests/animation.test.js`, `tests/shuffle-controller.test.js`

### FIX-503
### FIX-504
- **Status:** `FIXED`
- **Tipe:** Robustness / Shuffle
- **Tanggal:** 2026-10-03
- **Fase:** Phase 6 — Legal Shuffle / Play Flow
- **Ringkasan:** Seeded random dan custom random source membutuhkan validasi agar seed `0` tidak diam-diam berubah menjadi seed default dan random output invalid tidak menghasilkan state generator yang rusak.
- **Masalah / Alasan:** Seed `0` sebelumnya fallback ke default seed, sementara output random di luar `[0,1)` dapat menghasilkan index tidak valid atau perilaku tak terdefinisi.
- **Perubahan:** Seed `0` sekarang valid dan deterministic; output random divalidasi; generator memiliki batas percobaan agar constraint yang tidak dapat dipenuhi tidak menyebabkan infinite loop.
- **Acceptance:** Seed `0` reproducible, random invalid ditolak, dan random source patologis berhenti dengan error terkontrol.
- **Dokumentasi Terkait:** `src/core/shuffle.js`, `tests/shuffle.test.js`

- **Status:** `FIXED`
- **Tipe:** Refactor / Data Contract
- **Tanggal:** 2026-10-03
- **Fase:** Phase 5 — Manual Rubik Interaction
- **Ringkasan:** Manual controller menduplikasi aturan pemetaan gesture → move yang sudah tersedia di helper gesture.
- **Masalah / Alasan:** Duplikasi aturan dapat menyebabkan perbedaan behavior antara unit helper dan runtime interaction.
- **Perubahan:** `_gestureMove()` sekarang menggunakan `gestureToMove()` sebagai single mapping contract.
- **Acceptance:** Satu sumber aturan gesture-to-move digunakan oleh test helper dan controller runtime.
- **Dokumentasi Terkait:** `src/interaction/manual-controller.js`, `src/interaction/gesture.js`

# Phase 5 — Manual Rubik Interaction

### FIX-505
- **Status:** `FIXED`
- **Tipe:** Interaction / Animation
- **Tanggal:** 2026-10-04
- **Fase:** Phase 5 — Manual Rubik Interaction
- **Ringkasan:** Face turn sekarang mengikuti drag secara langsung, bukan menunggu drag selesai lalu memainkan fixed animation.
- **Perubahan:** Menambahkan `beginInteractive()`, `updateInteractive()`, dan `endInteractive()` pada `CubeTurnRuntime`; controller menghitung progress berdasarkan displacement pada bidang face.
- **Acceptance:** Layer visual bergerak searah drag, lalu snap ke 90° atau kembali tanpa mengubah `CubeState` sebelum commit.

### FIX-506
- **Status:** `FIXED`
- **Tipe:** Interaction / Coverage
- **Tanggal:** 2026-10-04
- **Fase:** Phase 5 — Manual Rubik Interaction
- **Ringkasan:** Semua visible cubie type harus dapat menjadi titik awal drag.
- **Perubahan:** Hit contract membawa `cubieType`; center, edge, dan corner sticker memakai jalur interactive turn yang sama.
- **Acceptance:** Seluruh 26 cubie visible tercakup melalui sticker yang dapat dipilih.

### FIX-507
- **Status:** `FIXED`
- **Tipe:** Gesture
- **Tanggal:** 2026-10-04
- **Fase:** Phase 5 — Manual Rubik Interaction
- **Ringkasan:** Diagonal drag tidak lagi menjadi dead-zone pada live interaction.
- **Perubahan:** `classifyDrag()` memilih dominant axis pada bidang face.
- **Acceptance:** Drag ke segala arah menghasilkan salah satu dari dua sumbu turn face yang relevan.

### FIX-500
- **Status:** `FIXED`
- **Tipe:** Interaction / Architecture
- **Tanggal:** 2026-10-03
- **Fase:** Phase 5 — Manual Rubik Interaction
- **Ringkasan:** Integrasi direct face gesture ke renderer Phase 4 membutuhkan ownership pointer yang jelas agar drag sticker tidak sekaligus menjalankan camera orbit.
- **Masalah / Alasan:** `CameraController` Phase 4 sebelumnya menangani pointer orbit secara langsung. Tanpa ownership boundary, satu pointer dapat memicu dua mode interaksi.
- **Perubahan:** `CameraController` mendapat `setPointerOrbitEnabled()`. `ManualInteractionController` menjadi pemilik pointer viewport, melakukan sticker picking, gesture projection, face-turn mapping, dan hanya meneruskan empty-scene drag ke camera.
- **Acceptance:** Sticker drag hanya menghasilkan satu legal face move; empty-scene drag hanya mengorbit kamera; tap/ambiguous gesture tidak menghasilkan move; input dikunci saat runtime busy.
- **Dokumentasi Terkait:** `PHASE_05_MANUAL_INTERACTION.md`, `07_INTERACTION_SPEC.md`



---

# Phase 6 — Legal Shuffle / Play Flow

Belum ada fix.

> Semua perubahan yang ditemukan selama Phase 6 ditambahkan di bawah bagian ini dengan ID `FIX-6xx`.

---

# Phase 7 — History & Solved Flow

Belum ada fix.

> Semua perubahan yang ditemukan selama Phase 7 ditambahkan di bawah bagian ini dengan ID `FIX-7xx`.

---

# Phase 8 — UI & Responsive Product Shell

Belum ada fix.

> Semua perubahan yang ditemukan selama Phase 8 ditambahkan di bawah bagian ini dengan ID `FIX-8xx`.

---

# Phase 9 — Accessibility & Performance

Belum ada fix.

> Semua perubahan yang ditemukan selama Phase 9 ditambahkan di bawah bagian ini dengan ID `FIX-9xx`.

---

# Phase 10 — Final QA / Release

Belum ada fix.

> Semua perubahan yang ditemukan selama Phase 10 ditambahkan di bawah bagian ini dengan ID `FIX-10xx`.

---

# Format Entry Baru

Gunakan format berikut untuk setiap fix atau tambahan:

```md
### FIX-X00
- **Status:** `OPEN`
- **Tipe:** Bug / Enhancement / Requirement / Design / Interaction / Animation / Performance / Documentation
- **Tanggal:** YYYY-MM-DD
- **Fase:** Phase X — Nama Fase
- **Ringkasan:** Deskripsi singkat.
- **Masalah / Alasan:** Kenapa perubahan diperlukan.
- **Perubahan:** Apa yang harus diubah.
- **Acceptance:** Kondisi yang harus terpenuhi setelah perubahan.
- **Dokumentasi Terkait:** File `.md` yang ikut berubah.
- **Catatan Implementasi:** Detail tambahan jika diperlukan.
```

---

# Aturan ID

ID harus unik dan mengikuti fase asal:

- Phase 0 → `FIX-0xx`
- Phase 1 → `FIX-1xx`
- Phase 2 → `FIX-2xx`
- Phase 3 → `FIX-3xx`
- Phase 4 → `FIX-4xx`
- Phase 5 → `FIX-5xx`
- Phase 6 → `FIX-6xx`
- Phase 7 → `FIX-7xx`
- Phase 8 → `FIX-8xx`
- Phase 9 → `FIX-9xx`
- Phase 10 → `FIX-10xx`

Nomor tidak boleh digunakan ulang untuk item yang berbeda.

---

# Aturan Penting

1. **Jangan memperbaiki perubahan penting tanpa mencatatnya.**
2. **Jangan menghapus fix yang sudah selesai.**
3. Jika satu fix mengubah requirement, update dokumentasi fase terkait.
4. Jika satu fix berdampak lintas fase, semua fase yang terdampak harus disebutkan.
5. README harus selalu mencerminkan status terbaru Fix Log.
6. Fix Log harus diperbarui sebelum fase dinyatakan selesai.
7. Sebuah fase tidak boleh berstatus `COMPLETE` jika masih memiliki fix `OPEN` atau `IN PROGRESS` yang termasuk scope fase tersebut.
8. Fix yang sengaja ditunda harus memiliki alasan dan fase tujuan.
9. Perubahan visual yang hanya bersifat kosmetik tetap dicatat apabila menjadi requirement final.
10. Setiap fix yang berhubungan dengan acceptance criteria harus memperbarui acceptance criteria terkait.

---

# Definition of Phase Closure

Sebelum fase ditandai `COMPLETE`:

- [ ] Semua requirement fase telah dikerjakan.
- [ ] Semua fix dalam scope fase telah berstatus `FIXED`, `WONT FIX`, atau `DEFERRED`.
- [ ] Tidak ada `OPEN` atau `IN PROGRESS` yang menghalangi acceptance fase.
- [ ] Dokumentasi fase telah diperbarui.
- [ ] README telah diperbarui.
- [ ] Fix Log telah diperbarui.
- [ ] Hasil implementasi telah diverifikasi terhadap acceptance criteria.
- [ ] Jika ada item `DEFERRED`, fase tujuan sudah dicatat dengan jelas.

---

# Change History

| Tanggal | Perubahan |
|---|---|
| 2026-10-03 | Membuat sistem Fix Log terpusat untuk seluruh fase proyek. |
| 2026-10-03 | Phase 1: memperbaiki inverse move dan memperbaiki acceptance test layer selection. |
| 2026-10-03 | Phase 3: menambahkan animation controller, temporary layer pivot, runtime commit, dan transform reset. |
| 2026-10-03 | Phase 4: menambahkan camera state/controller dengan orbit, zoom, preset rotation, dan reset. |
| 2026-10-04 | Phase 5: live drag mengikuti pointer, seluruh center/edge/corner tercakup, diagonal dominant-axis, dan interactive snap/cancel (`FIX-505`–`FIX-507`). |
| 2026-10-03 | Phase 5: mengintegrasikan sticker picking, gesture projection, manual face turns, camera ownership boundary, input locking, dan memperbaiki adapter animation integration (`FIX-501`), safe cancellation (`FIX-502`), serta single gesture mapping contract (`FIX-503`). |


# Phase 5 — POV Front-Face Redesign

### FIX-508
- **Status:** `FIXED`
- **Tipe:** Architecture / Interaction
- **Tanggal:** 2026-10-04
- **Ringkasan:** Model interaksi lama yang memakai face sticker sebagai basis tetap diganti menjadi POV front-face method.
- **Perubahan:** Kamera menentukan physical face dominan sebagai virtual `F`; projected camera right/up menentukan virtual `R/L/U/D/B`. Frame dibekukan saat pointer down.
- **Acceptance:** Mapping tetap konsisten setelah arbitrary camera rotation.

### FIX-509
- **Status:** `FIXED`
- **Tipe:** Move Engine
- **Tanggal:** 2026-10-04
- **Ringkasan:** Manual interaction membutuhkan `M`, `E`, dan `S`.
- **Perubahan:** `CubeState` sekarang mendukung slice notation dan inverse/half-turn modifiers. M follows L, E follows D, S follows F.
- **Acceptance:** Slice move ×4 dan move+inverse kembali ke state semula; slice memilih 4 middle-slice edge cubies; center cubies tetap fixed.

### FIX-510
- **Status:** `FIXED`
- **Tipe:** Renderer / Interaction Contract
- **Tanggal:** 2026-10-04
- **Ringkasan:** POV resolver membutuhkan cubie type dan logical position yang authoritative.
- **Perubahan:** `pickFace()` mengembalikan `logicalPosition` dan `cubieType`.
- **Acceptance:** Seluruh corner/edge/center mapping dapat diuji tanpa membaca transform renderer.

### FIX-511
- **Status:** `FIXED`
- **Tipe:** Cleanup / Architecture
- **Tanggal:** 2026-10-04
- **Ringkasan:** Contract `gestureToMove()` dan face tangent basis lama menjadi sumber aturan kedua yang bertentangan dengan POV model.
- **Perubahan:** Contract lama dihapus dari active interaction API. `gesture.js` hanya menangani threshold/progress; `pov-move-resolver.js` menjadi single source of truth untuk manual move resolution.

# Phase 5 — Canonical Color Orientation and Slice Correction

### FIX-512
- **Status:** `FIXED`
- **Tipe:** Cube Model / Renderer / Interaction
- **Tanggal:** 2026-10-04
- **Ringkasan:** Menetapkan orientasi warna canonical yang baru.
- **Perubahan:** `U=yellow`, `D=white`, `F=red`, `R=green`, `B=orange`, `L=blue`. Hanya `F/R/B/L` yang boleh menjadi virtual POV front; adjacency `U/D/R/L/B` mengikuti tabel warna tetap.
- **Acceptance:** Core, renderer, color tests, POV frame tests, dan dokumentasi memakai mapping yang sama.

### FIX-513
- **Status:** `FIXED`
- **Tipe:** Move Engine / Animation
- **Tanggal:** 2026-10-04
- **Ringkasan:** Memperbaiki semantik M/E/S agar center cubies tidak berpindah.
- **Perubahan:** Standard `M/E/S` sekarang hanya memutar 4 middle-slice edge cubies. Center cubies tetap pada posisi/warna face-nya.
- **Acceptance:** Logical engine dan animation adapter memilih 4 cubies untuk M/E/S; center identity tetap invariant.


### 2026-10-04 — Canonical color orientation + slice correction

- Phase 5 now uses the fixed color orientation and F/R/B/L-only POV front authority (`FIX-512`).
- M/E/S now preserve center identity and rotate only the four middle-slice edge cubies (`FIX-513`).

### FIX-514
- **Status:** `FIXED`
- **Tipe:** Interaction / Coverage
- **Tanggal:** 2026-10-04
- **Ringkasan:** Menjaga seluruh 26 visible cubies tetap memiliki jalur interaction anchor tanpa memberi U/D hak menjadi POV front.
- **Perubahan:** Yellow/White center tetap dapat di-drag sebagai direct `U/D` face anchors; front authority tetap hanya F/R/B/L.
- **Acceptance:** U/D center interaction diuji dan tidak mengubah aturan POV front selection.

### 2026-10-04 — U/D center interaction coverage

- Yellow/White centers remain draggable as direct U/D anchors without becoming POV front (`FIX-514`).
- Full regression suite: 69 passed, 0 failed.

### FIX-515
- **Status:** `FIXED`
- **Tipe:** Interaction / Direction Mapping
- **Tanggal:** 2026-10-04
- **Ringkasan:** Pada kondisi merah (`F`) sebagai virtual front, gerakan horizontal pada kolom kiri/kanan terasa berlawanan dengan arah grab pengguna.
- **Perubahan:** Untuk `frame.front === 'F'`, kolom kiri yang di-drag ke kanan sekarang memakai arah move yang menghasilkan gerakan ke kanan; kolom kanan yang di-drag ke kiri memakai arah move yang menghasilkan gerakan ke kiri. Berlaku untuk corner atas/bawah dan edge kiri/kanan. Mapping POV hijau/oranye/biru tidak diubah pada fix ini.
- **Acceptance:** Empat corner horizontal dan dua edge horizontal pada front merah diuji; regression suite 68/68 lulus.


### FIX-516
- **Status:** `FIXED`
- **Tipe:** Interaction / POV Direction Mapping
- **Tanggal:** 2026-10-04
- **Ringkasan:** Kontrak arah horizontal front-face yang sebelumnya dikoreksi untuk red/F digeneralisasi ke seluruh empat POV front yang sah: F/red, R/green, B/orange, dan L/blue.
- **Perubahan:** Untuk seluruh front, top-left drag-right → `U`, top-right drag-left → `U'`, bottom-left drag-right → `D'`, bottom-right drag-left → `D`, left middle edge drag-right → `E'`, dan right middle edge drag-left → `E`.
- **POV lock:** Frame kamera ditangkap saat sticker `pointerdown` dan tidak berubah selama gesture.
- **Acceptance:** Semua empat front diuji dengan corner atas/bawah dan edge kiri/kanan; existing vertical/side mappings tetap lulus.


### FIX-517
- **Status:** `FIXED`
- **Tipe:** Interaction / POV Vertical Direction Mapping
- **Tanggal:** 2026-10-04
- **Ringkasan:** Vertical front-face drag masih menggunakan notasi `L/R/M` yang benar untuk Red/F tetapi tidak ikut berputar ketika Front menjadi Green/R, Orange/B, atau Blue/L.
- **Perubahan:** Menambahkan canonical vertical mapping per Front. Green/R menggunakan `F/F'/B/B'/S'/S`, Orange/B menggunakan `R/R'/L/L'/M'/M`, dan Blue/L menggunakan `B/B'/F/F'/S/S'`, sehingga top-row drag-down dan bottom-row drag-up tetap mengikuti arah visual.
- **Scope:** Hanya front-face vertical corner/edge mapping. Horizontal, side-face F/B/S, front selection, dan gesture-time POV lock tidak diubah.
- **Acceptance:** 4 Front × 4 corner directions + 2 edge directions diuji; regression suite 69/69 lulus.


### FIX-518
- **Status:** `FIXED`
- **Tipe:** Interaction / Side-face F/F' Direction Mapping
- **Tanggal:** 2026-10-04
- **Ringkasan:** Vertical drag pada corner di virtual side face masih mengembalikan literal `F/F'` dan `B/B'`. Itu benar saat Red/F menjadi Front, tetapi salah ketika Front berpindah ke Green/R, Orange/B, atau Blue/L.
- **Perubahan:** Side-face corner vertical mapping sekarang menggunakan `frame.front` dan `frame.back` sebagai notasi aktif. Dengan demikian sisi yang menghadap Front aktif memakai `F/F'` saat Red, `R/R'` saat Green, `B/B'` saat Orange, dan `L/L'` saat Blue; sisi belakang memakai inverse yang sesuai.
- **Scope:** Hanya side-face corner vertical F/B-family mapping. Front horizontal/vertical, side-edge S mapping, Front detection, dan gesture-time POV lock dipertahankan.
- **Acceptance:** Seluruh right/left side corner combinations diuji untuk F/R/B/L; regression suite 71/71 lulus.


### FIX-519
- **Status:** `FIXED`
- **Tipe:** Interaction / Camera-relative POV Architecture
- **Tanggal:** 2026-10-04
- **Ringkasan:** Kontrak POV sebelumnya masih menganggap hanya F/R/B/L yang dapat menjadi Front dan memaksa U/D sebagai Up/Down. Ini tidak sesuai dengan model Rubik bebas-orientasi yang diinginkan.
- **Perubahan:** Semua enam physical faces U/D/R/L/F/B sekarang dapat menjadi Front. Resolver membentuk frame lengkap dari camera position + camera screen-right + camera screen-up, menjaga pasangan opposite dan handedness. Gesture dipahami dalam virtual frame lalu dikonversi ke physical notation.
- **Camera:** Manual controller mengirim basis world-right/world-up kamera dan mengunci frame selama gesture. Camera yaw tetap kontinu 360°; pitch diperluas hingga mendekati ±90°.
- **Dokumentasi:** `21_INTERACTION_GEOMETRY_AND_STICKER_IDENTITY.md`, `PHASE_05_MANUAL_INTERACTION.md`, `PHASE_05_AUDIT.md`, `PHASE_04_CAMERA_CONTROLS.md`, `17_ROADMAP.md`, `20_CHANGELOG.md`, `README.md`, dan file terkait diperbarui.
- **Acceptance:** 6 Front × frame invariants × horizontal/vertical front gestures × side-face rules × center interaction diuji; regression suite 67/67 lulus.


### FIX-520
- **Status:** `FIXED`
- **Tipe:** Interaction / Object Orientation Architecture
- **Tanggal:** 2026-10-04
- **Ringkasan:** Camera-relative six-face POV masih membuat U/D terasa seperti Top/Bottom karena kamera menjadi sumber orientasi utama. Ini tidak sesuai dengan konsep Rubik sebagai item void yang dapat diputar bebas.
- **Perubahan:** Menambahkan `CubeOrientationController` + quaternion state. Empty-space drag sekarang memutar `cubeGroup`; camera pointer orbit dinonaktifkan pada Phase 5. `resolvePovFrame()` menggunakan face normals setelah transform quaternion cube terhadap camera reference.
- **Kontrak:** Tidak ada warna yang menjadi Front/Back/Top/Bottom permanen. Yellow/White dapat menjadi Front hanya dengan memutar cube. Rotasi dapat melewati 360° tanpa wrapping.
- **Acceptance:** Object-relative Yellow/White Front, empty-space cube rotation, frozen gesture frame, dan regression face-turn integration lulus; suite 73/73.

## FIX-521 — Remove Front-POV dependency from manual move resolution
- **Status:** FIXED
- **Phase:** 5
- **Masalah:** Mapping sebelumnya masih bergantung pada virtual Front/Back/Up/Down. Pada orientasi tertentu, gerakan layer menjadi tidak konsisten atau salah arah.
- **Keputusan:** Move resolver sekarang memakai geometri langsung: sticker normal + screen drag + cube quaternion + cubie logical position.
- **Implementasi:** `src/interaction/drag-move-resolver.js` menggantikan `pov-move-resolver.js`. Layer axis diperoleh dari `cross(stickerNormal, dragTangent)`, kemudian di-snap ke cube axis X/Y/Z. Layer coordinate menentukan outer face atau middle slice.
- **Dampak:** Tidak ada lagi Front sebagai patokan interaksi. Semua view menggunakan aturan geometris yang sama, termasuk diagonal drag dan cube orientation bebas.
- **Validasi:** 69/69 tests passed.

### FIX-522
- **Status:** `FIXED`
- **Tipe:** Core Model / History / Renderer
- **Tanggal:** 2026-10-04
- **Ringkasan:** Mengganti history berbasis notation menjadi identity/position tracking untuk 54 sticker.
- **Perubahan:** Menambahkan `sticker-map.js`, 54 kode permanen (`rc1`, `re1`, `rc`, dst.), 54 slot (`p01..p54`), `StickerHistory`, dan `CubeState.getStickerPositions()`. Sticker identity ikut berputar tanpa berganti kode.
- **Renderer:** Warna sticker sekarang mengikuti identitas warna sticker, bukan face yang sedang ditempati.
- **Acceptance:** 54 kode unik, 54 slot unik, transisi `code: from → to`, renderer color identity, dan full regression suite lulus.

### FIX-523
- **Status:** `FIXED`
- **Tipe:** Core / Animation / Interaction / Shuffle
- **Tanggal:** 2026-10-04
- **Ringkasan:** Menghapus ketergantungan runtime Phase 5 pada notation `R/R'/L/...`.
- **Perubahan:** Menambahkan generic turn `{axis, layer, quarterTurns}` dan mengalirkannya dari drag resolver → runtime → animator → render adapter → CubeState.
- **Dampak:** Tidak ada lagi Front-based move conversion. Shuffle juga menghasilkan generic layer turns.
- **Acceptance:** Full regression suite **71/71 passed**.


### FIX-524
- **Status:** `FIXED`
- **Tipe:** Phase 5 Final / Repository Cleanup
- **Tanggal:** 2026-10-04
- **Ringkasan:** Merapikan repository setelah model sticker-position menjadi arsitektur final Phase 5.
- **Perubahan:**
  - `phase5.html` dipindahkan menjadi `index.html` sebagai satu-satunya production entry point.
  - `styles.css` dipindahkan ke root agar GitHub Pages root deployment langsung dapat menyajikan aplikasi.
  - Preview HTML Phase 3/4 dihapus karena tidak lagi diperlukan.
  - `pov-move-resolver.js` dan test-nya dihapus.
  - Legacy notation parser, inverse notation helpers, `MoveHistory`, `MoveQueue`, dan dead `getMoveDefinitions()` dihapus.
  - `face-turn-animator.js` → `turn-animator.js`.
  - `face-turn-renderer.js` → `turn-renderer.js`.
  - Local `serve` script diperbarui untuk root repository.
  - Dokumentasi aktif diselaraskan dengan direct-geometric + sticker-position architecture.
- **Acceptance:** satu `index.html`, tidak ada active legacy notation API, tidak ada obsolete POV resolver, dan full regression suite lulus.

### FIX-525
- **Status:** `FIXED`
- **Tipe:** Post-Phase 5 / Rendering Performance
- **Tanggal:** 2026-10-04
- **Scope:** Post-Phase 5 fix only. Phase 5 remains **COMPLETE** and its architecture is unchanged.
- **Masalah:** Rendering terasa berat bahkan setelah satu gerakan. Repository menjalankan render loop Three.js sendiri sekaligus loop `requestAnimationFrame` di `index.html`, sehingga scheduler logic/render terpisah. Renderer juga membuat hingga 6 sticker mesh, geometry, dan material per cubie walaupun satu cubie hanya dapat memiliki maksimal 3 sticker. Dynamic shadow mapping menambah GPU work tanpa ground plane yang membutuhkan shadow.
- **Perubahan:**
  - Menghapus render loop internal `RubikRenderer`; renderer sekarang menyediakan `renderFrame()` dan hanya satu RAF loop di `index.html` menjalankan `runtime.tick()` lalu `renderer.renderFrame()`.
  - Sticker renderer direduksi menjadi maksimal 3 mesh per cubie.
  - Geometry body, geometry sticker, body material, dan enam sticker materials sekarang di-share/reuse.
  - Shadow map dinonaktifkan karena tidak ada ground plane dan efek shadow tidak diperlukan untuk visual cube saat ini.
  - Pixel ratio renderer dibatasi hingga `1.5` untuk menghindari biaya GPU berlebihan pada layar high-DPI.
  - Cleanup renderer tidak lagi mencoba dispose shared geometry/material dari setiap cubie. Resource shared di-dispose satu kali saat renderer dispose.
- **Invariant:** Sticker identity, sticker-position model, generic `{axis, layer, quarterTurns}` turn, center movement, cube orientation quaternion, dan gesture resolution tidak diubah.
- **Acceptance:** Single RAF architecture, shared render resources, 26 cubie bodies, maksimal 3 sticker meshes/cubie, no dynamic shadow map, syntax checks, dan full regression suite lulus.


| FIX-526 | Post-Phase 5 | Interaction lifecycle / Source cleanup | FIXED | Mencegah manual interaction tertahan setelah pointer capture hilang atau window kehilangan fokus; konfigurasi gesture dan helper kecil digabung ke `manual-controller.js`, alias resolver lama dihapus, dan regression test untuk release→settle→unlock ditambahkan. Phase 5 tetap COMPLETE. | `src/interaction/manual-controller.js`, `src/interaction/drag-move-resolver.js`, `tests/interactive-drag.test.js`, `index.html`, `package.json`, `README.md`, `PHASE_05_MANUAL_INTERACTION.md` |

### FIX-527
- **Status:** `FIXED`
- **Tipe:** Post-Phase 5 / Render Loop Clock Safety
- **Tanggal:** 2026-10-04
- **Scope:** Post-Phase 5 fix only. Phase 5 remains **COMPLETE**.
- **Masalah:** Pada browser/embedded preview tertentu, loop production mencampur `performance.now()` sebagai waktu awal dengan timestamp `requestAnimationFrame()`. Kombinasi ini dapat menghasilkan `deltaMs < 0`, menyebabkan `CubeTurnRuntime.tick()` melempar error dan menghentikan RAF sehingga canvas Rubik tidak pernah dirender.
- **Perubahan:** `index.html` sekarang memakai timestamp `requestAnimationFrame()` secara konsisten dari frame ke frame. Frame pertama memakai delta `0`; delta berikutnya dibatasi `0..50 ms` sebelum dikirim ke runtime. Ini mempertahankan kontrak `CubeTurnRuntime.tick()` tanpa melemahkan validasi runtime.
- **Dampak:** Render loop tidak lagi mati karena perbedaan clock source. Initial render, interactive turn, dan frame berikutnya tetap berjalan pada satu RAF loop.
- **Acceptance:** `deltaMs` tidak pernah negatif pada production RAF loop; runtime contract tetap menolak delta negatif; full regression suite lulus; production entry point tetap satu `index.html`.

## FIX-528 — Phase 6 Solved-State Sensor
- **Status:** `FIXED`
- **Tipe:** Phase 6 / Play Flow / Solved Detection
- **Tanggal:** 2026-10-04
- **Scope:** Phase 6. Does not reopen Phase 5.
- **Masalah:** Tombol `Reset` hanya diperiksa ketika `CubeTurnRuntime.tick()` mengembalikan `result.completed`. Manual interactive turns intentionally return `completed: null` from the settling path, so the final move could restore a solved cube without the Play/Reset UI detecting it.
- **Perubahan:** Menambahkan solved-state sensor di production RAF loop. Setelah setiap `runtime.tick()` dan `shuffle.handleTick()`, selama state permainan `PLAYING`, sensor memeriksa `runtime.busy === false` lalu `runtime.cubeState.isSolved()`. Jika solved, manual interaction dikunci, Play disembunyikan, Reset ditampilkan, dan status menjadi `Solved!`.
- **Reset:** Reset clears the local solved flag before restoring a fresh solved CubeState, so the next Play session can be detected independently.
- **Invariant:** `CubeState.isSolved()` remains the authoritative solved-state predicate; no sticker/color shortcuts are used.
- **Acceptance:** Solved detection covers both animator-completed and interactive-settle completion paths; reset clears detection state; regression suite passes.


## FIX-529 — Phase 6 Final Hardening
- **Status:** `FIXED`
- **Tipe:** Phase 6 / Shuffle Quality / Session Reset
- **Tanggal:** 2026-10-04
- **Scope:** Phase 6. Does not reopen Phase 5.
- **Masalah:** Phase 6 still had four hardening gaps: a legal scramble could theoretically return to solved, controller defaults did not enforce the documented same-axis quality rule, full reset-cycle coverage was missing, and the Phase 6 documentation had not formally closed those acceptance points.
- **Perubahan:** `generateScramble()` now validates the resulting state against `CubeState.isSolved()` and regenerates within a bounded budget; `ShuffleController` defaults to same-axis avoidance; reset-cycle regression coverage verifies cancellation, solved state, cleared history, and a subsequent Play session; shuffle specification, roadmap, changelog, and acceptance documentation are synchronized.
- **Acceptance:** Full regression suite passes; Phase 6 hardening acceptance points are complete.
