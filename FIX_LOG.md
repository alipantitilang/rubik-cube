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

# Phase 5 — Manual Rubik Interaction

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
| 2026-10-03 | Phase 5: mengintegrasikan sticker picking, gesture projection, manual face turns, camera ownership boundary, dan input locking. |
