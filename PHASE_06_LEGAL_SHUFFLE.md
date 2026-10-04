# Phase 6 — Legal Shuffle / Play Flow

## Status

**COMPLETE**

## Tujuan

Menambahkan alur Play yang mengacak Rubik hanya melalui gerakan legal, menganimasikan seluruh scramble secara halus, mengunci input manual selama scramble, lalu menyerahkan kontrol kembali kepada pemain.

## Implementasi

### 1. Legal scramble generator

File: `src/core/shuffle.js`

- Menghasilkan generic layer turns tanpa notation wajah.
- Tidak pernah mengubah sticker atau posisi cubie secara langsung.
- Panjang scramble dapat dikonfigurasi.
- Same-axis consecutive moves dilarang secara default.
- Immediate inverse turn dilarang.
- Same-axis consecutive moves dapat dilarang melalui `avoidSameAxis`.
- Mendukung seeded PRNG untuk reproduksi deterministic.

### 2. Shuffle controller

File: `src/animation/shuffle-controller.js`

State:

- `idle`
- `scrambling`
- `playing`

Tanggung jawab:

- menerima Play;
- membuat scramble legal;
- memasukkan seluruh scramble ke `CubeTurnRuntime`;
- mempercepat durasi animasi scramble tanpa mengubah mekanisme face-turn;
- mengunci `ManualInteractionController` selama scramble;
- membuka kembali interaksi setelah seluruh move selesai.

### 3. Play flow

`index.html` sekarang menggunakan entry point utama aplikasi.

Play:

`idle → scrambling → playing`

Production entry point: `index.html`. The Play/Reset controls live on the main cube screen; no phase-specific HTML is created.

Selama `scrambling`:

- tombol Play dinonaktifkan dan menampilkan `Scrambling…`;
- drag sticker tidak dapat melakukan move;
- scramble tetap menggunakan animasi face-turn yang sama;
- CubeState hanya berubah ketika setiap animasi selesai.

Setelah scramble selesai:

- state menjadi `playing`;
- tombol Play tetap tersembunyi selama sesi permainan;
- interaksi manual aktif kembali;
- cube berada pada state yang mathematically reachable dari solved state.

### Main-screen Play / Reset flow

- Saat halaman pertama dibuka, tombol `Play` terlihat pada layar utama.
- Menekan `Play` langsung menyembunyikan tombol tersebut.
- Tombol tetap tersembunyi selama scramble dan selama pemain menyelesaikan cube.
- Setelah setiap `CubeTurnRuntime.tick()`, solved-state sensor memeriksa `CubeState.isSolved()` saat sesi berada pada state `playing` dan runtime sudah tidak busy. Ini mencakup completion dari animator maupun interactive-settle.
- `Reset` mengembalikan CubeState ke solved state, membersihkan history runtime, mengunci kembali manual interaction, menyembunyikan `Reset`, dan menampilkan `Play` untuk sesi baru.

## Kecepatan animasi

Default manual move tetap menggunakan durasi Phase 3.

Shuffle menggunakan durasi khusus `90 ms` per move agar terasa cepat namun tetap terlihat sebagai rangkaian face-turn nyata.

Durasi manual dipulihkan setelah scramble selesai.

## Deterministic seed

Contoh konsep:

```js
const scramble = generateScramble({ length: 20, seed: 20261003 });
```

Seed yang sama menghasilkan sequence yang sama sehingga bug atau hasil scramble tertentu dapat direproduksi saat testing.

## History

Move history pemain belum diaktifkan pada Phase 6. Itu sengaja ditunda ke Phase 7.

Scramble juga tidak dianggap sebagai player history.

## Acceptance Criteria

- [x] Play menghasilkan sequence legal.
- [x] Immediate inverse turn dilarang.
- [x] Same-axis consecutive turn dilarang secara default.
- [x] Scramble tidak mengubah CubeState secara langsung.
- [x] Scramble dimainkan melalui `CubeTurnRuntime`.
- [x] Tidak ada face yang sama dua kali berturut-turut.
- [x] Panjang scramble configurable.
- [x] Seeded scramble deterministic.
- [x] Input manual terkunci selama scramble.
- [x] Input manual aktif kembali setelah scramble selesai.
- [x] State berpindah dari `idle` ke `scrambling` lalu `playing`.
- [x] Scramble menghasilkan state yang valid dan reachable.
- [x] Tidak ada halaman `phase6.html`; aplikasi utama tetap satu entry point.
- [x] Play berada pada layar utama, bukan di panel informasi.
- [x] Play menghilang saat sesi dimulai.
- [x] Solved-state sensor berjalan setelah setiap runtime tick selama sesi `playing`.
- [x] Reset muncul hanya setelah cube solved.
- [x] Reset mengembalikan cube ke solved state dan membuka sesi baru melalui Play.

## Test Coverage

Phase 6 menambahkan test untuk:

- legal move generation;
- consecutive-face prevention;
- optional axis prevention;
- deterministic seed;
- reachable cube state;
- inverse scramble;
- Play state transition;
- input locking;
- completion and return to playing;
- reset.

Core shuffle and Play-flow regression are included in the full suite. Implementation is complete. Phase 6 UI flow is complete: Play → animated scramble → manual interaction → solved detection → Reset → new Play session. Final release QA remains in Phase 10.
