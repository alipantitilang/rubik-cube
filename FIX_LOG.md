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

---

# Phase 0 — Documentation Baseline

### FIX-000
- **Status:** `FIXED`
- **Tipe:** Documentation
- **Ringkasan:** Menambahkan sistem Fix Log terpusat agar seluruh revisi dan tambahan requirement selama pengerjaan dapat dilacak.
- **Dampak:** README dan dokumentasi proyek.
- **Catatan:** Fix Log menjadi riwayat perubahan, bukan pengganti dokumentasi teknis fase.

---

# Phase 1 — Cube Core / Logical Engine

Belum ada fix.

> Semua perubahan yang ditemukan selama Phase 1 ditambahkan di bawah bagian ini dengan ID `FIX-1xx`.

---

# Phase 2 — 3D Renderer / Visual Cube

Belum ada fix.

> Semua perubahan yang ditemukan selama Phase 2 ditambahkan di bawah bagian ini dengan ID `FIX-2xx`.

---

# Phase 3 — Face-Turn Animation

Belum ada fix.

> Semua perubahan yang ditemukan selama Phase 3 ditambahkan di bawah bagian ini dengan ID `FIX-3xx`.

---

# Phase 4 — Camera & View Controls

Belum ada fix.

> Semua perubahan yang ditemukan selama Phase 4 ditambahkan di bawah bagian ini dengan ID `FIX-4xx`.

---

# Phase 5 — Manual Rubik Interaction

Belum ada fix.

> Semua perubahan yang ditemukan selama Phase 5 ditambahkan di bawah bagian ini dengan ID `FIX-5xx`.

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
