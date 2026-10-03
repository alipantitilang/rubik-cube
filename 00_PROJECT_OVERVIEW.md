# Rubik 26-Cubies — Project Overview

## Purpose

Project ini adalah fondasi untuk membuat Rubik's Cube 3×3×3 interaktif berbasis web.

Model visual menggunakan **26 cubie yang terlihat**, bukan 27:

- 8 corner cubies
- 12 edge cubies
- 6 center cubies
- 1 posisi `(0,0,0)` dikosongkan sebagai **internal core / rangka utama**

Jadi angka 26 bukan berarti Rubik kehilangan center. Keenam center face tetap ada. Yang kosong adalah kubus internal di posisi paling tengah.

## Target pengalaman

Pengguna dapat:

1. Melihat Rubik pada halaman utama.
2. Grab/drag untuk memutar kamera.
3. Scroll/pinch untuk zoom.
4. Menggunakan tombol rotate.
5. Menggunakan zoom bar.
6. Menekan Play untuk mengacak Rubik secara otomatis.
7. Melakukan gerakan face secara manual seperti Rubik normal.
8. Menggunakan drag pada setiap sticker center, edge, dan corner untuk menentukan legal turn berdasarkan POV.
9. Menggunakan POV front-face method: face yang dominan dari kamera menjadi virtual F, dengan R/L/U/D/B relatif terhadap POV.
10. Menggunakan M/E/S untuk slice interaction sesuai konvensi `M mengikuti L`, `E mengikuti D`, `S mengikuti F`.
11. Melihat animasi turn yang halus.
12. Menyelesaikan Rubik.
13. Mendapat layar Congratulations saat solved.
14. Menekan Reshuffle untuk memulai permainan baru.
15. Melihat history gerakan selama sesi.

## Prinsip utama

> Visual boleh terasa premium dan hidup, tetapi logika Rubik harus menjadi sumber kebenaran.

Render 3D tidak boleh menjadi sumber state puzzle. State puzzle disimpan secara eksplisit dan renderer hanya merepresentasikan state tersebut.

## Status

Dokumen ini adalah baseline sebelum implementasi.

## Urutan implementasi yang disarankan

1. Data model cubie.
2. Facelet/color model.
3. Move engine.
4. Solver-state validation.
5. Renderer.
6. Camera controls.
7. Face interaction.
8. Shuffle.
9. History.
10. Solved state.
11. UI.
12. Responsive behavior.
13. Accessibility.
14. QA.
