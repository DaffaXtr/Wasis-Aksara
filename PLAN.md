# Rencana Pengembangan Wasis Aksara

Acuan: *Brief Prototipe* (menu, 4 level permainan, evaluasi).

## Keputusan yang sudah disepakati

| # | Keputusan |
|---|---|
| 1 | Input jawaban Level 1 tetap memakai **papan tulis kanvas** yang sudah ada. |
| 2 | Untuk sementara **keempat level berlatar Candi Tikus**. Nama candi tiap level cukup diubah di `src/data/levelData.js`. |
| 3 | Konten Level 1 lama (4 tembung + 1 ukara, hadiah lentera) **diganti total** oleh brief baru. |
| 4 | TTS Level 4: **1 kotak = 1 suku kata aksara** (mis. `ꦕ`, `ꦤ꧀ꦢꦶ`). |
| 5 | Alur akhir semua level disamakan: soal → papan skor + jawaban bener → item → peta. |

## Tahapan

### Tahap 0 — Fondasi bersama
- [x] Game menjadi 4 level / 4 candi (`levelData`, node peta, skor & bintang, batas level berikutnya). Save lama dikonversi otomatis.
- [x] `SaveManager` v2: skor & bintang per level, rekap jawaban per soal, item yang didapat, hasil evaluasi.
- [x] Betulkan `aksaraData.js` + util aksara (normalisasi Unicode, pembanding jawaban, pemecah suku kata aksara).
- [x] Komponen bersama: Popup Sejarah Candi, Feedback "Wangsulanmu Bener / Salah", Papan Skor + jawaban bener, Modal Item.
- [x] Hapus scene yang tidak ada di brief (Level 5, Final Challenge).
- [x] Perbaiki ikon tombol keluar Level 1 (tag `<svg>` pembuka hilang).

### Tahap 1 — Menu utama
- [x] Tombol utama: Mulai Petualangan, Peta Jelajah Candi, Materi, Evaluasi (sementara pesan "durung kasedhiya" sampai Tahap 8).
- [x] Navigasi: CP, TP, Kamus, Profil Pangembang (foto opsional, fallback inisial); Pandhuan Dolanan 6 langkah; tombol Swara (bisu juga berlaku untuk SFX).
- [x] Panel progres pemain dari save (candi rampung + ikon item).
- [x] Isi teks di `src/data/menuData.js`; modal informasi memakai panel gelap agar teks panjang mudah dibaca.
- Catatan: tombol Achievement & Koleksi lama dilepas dari menu (scene-nya masih ada, belum dipakai).

### Tahap 2 — Peta 4 candi
- [x] `map-4candi.webp`: candi 5, jalurnya, pita "Saat Ini", dan teks bawaan dihapus dari `map.webp` (skrip: `tools/clean_map.py`).
- [x] Judul, penghitung pusaka x/4, dan papan nama candi dirender DOM di atas gambar.
- [x] Status per candi: terkunci (kabut + gembok), aktif (denyut + pita "Saat Ini"), rampung (bintang + ikon item); tooltip candi yang letaknya tinggi tampil di bawah.
- [x] Gambar peta ada di dalam overlay 1280×720 sehingga posisi node tetap pas di rasio layar mana pun.

### Perbaikan umum (bersama Tahap 2)
- [x] Latar PNG besar (prolog 1–9, bg_home, Bg_CandiTikusNew, CandiTikus-Glow) dikonversi ke WebP: 29,5 MB → 3,6 MB. PNG asli sudah dihapus.
- [x] Musik latar dimuat setelah menu tampil (tidak lagi menahan layar pemuatan).
- [x] Scene yang tidak ada di brief dihapus: Achievement, Inventory, Kamus (scene), `achievementData.js`.
- [x] README disesuaikan (4 pusaka, peta baru, autosave).

### Perbaikan umum (lanjutan)
- [x] Muat ulang di tengah level/rekap kembali ke peta (bukan langsung masuk level); menu & prolog kembali ke menu. Musik latar juga dimulai dari peta.
- [x] Tombol Swara ada di HUD tiap level; status bisu disimpan (`wasis_aksara_muted`, terpisah dari save) dan musik langsung terdengar saat dinyalakan lagi.
- [x] Tombol keluar level meminta konfirmasi (`confirmLeaveLevel`, `showConfirm` di `overlayKit.js`).
- [x] Tombol "Reset" di menu utama untuk membusak progres (dengan konfirmasi) — untuk uji coba bergantian di kelas.
- [x] `favicon.svg` ditambahkan; PNG duplikat, aset Kenney yang tak dirujuk, `ui/Button|Panel|DialogBox|StarRating.js`, kombo `ScoreManager`, dan `targetScore` dihapus. `dist/` 47 MB → 10 MB.

### Tahap 3 — Popup Sejarah + 3D/AR
- [x] Model 3D sederhana Candi Tikus dibuat dengan skrip (`tools/build_candi_tikus.mjs` → `public/assets/models/candi-tikus.glb`, ±270 KB, ±3.800 segitiga): kolam berundak 2 teras, tangga utara, 2 kolam kecil berpancuran, bangunan induk + menara tengah & 8 menara kecil, parit berair. Skala 1:30 (±1,3 m) untuk AR.
- [x] Popup sejarah: tombol **Deleng 3D** memuat `<model-viewer>` (chunk terpisah, offline): bisa diputar/zoom, tombol **Deleng ing AR** muncul di HP yang mendukung (Android: Scene Viewer/WebXR, iOS: Quick Look dengan USDZ yang dibuat otomatis). Tautan `Deleng versi scan asli` membuka embed Sketchfab (Om Husnul) bila online.
- [ ] Uji AR di HP Android & iPhone sungguhan (belum bisa diuji di desktop).

### Tahap 4 — Level 1: Misteri Cathetan Patirtan
- [x] Popup sejarah → dialog permukaan → "Nyilem" → adegan dhasar blumbang (CSS: latar diburamkan, berkas cahaya, gelembung, ganggang).
- [x] Watu berlumut: kanvas lumut diusap (mouse/sentuh), terbuka setelah 60% bersih; berisi perintah + daftar 5 tembung.
- [x] Papan tulis 5 tembung: sekali kirim per tembung, umpan balik "Wangsulanmu Bener/Salah", hint mengurangi biji (100 → 50).
- [x] Papan skor menampilkan tulisan pemain (dipangkas) + aksara bener; bintang dari jumlah bener; item **Kunci**.
- Konten di `src/data/level1Data.js` (5 tembung masih draf: patirtan, Majapahit, Hindu, blumbang, Trowulan).

### Tahap 5 — Level 2: Ndandani Prasasti Kuno
- [x] Popup sejarah → kothak prasasti (SVG, tutup terbuka + cahaya) → popup perintah → gulungan berisi 5 ukara rumpang (aksara + Latin).
- [x] Papan prasasti: ukara siji-siji, seret aksara (pointer events, jalan di layar sentuh) atau klik aksara ke papan kosong → "Priksa" → umpan balik.
- [x] 4 pilihan per soal (kunci + 3 pengecoh beda sandhangan/pasangan), diacak; biji 100 per bener; bintang dari jumlah bener; item **Kaca Pembesar**.
- Konten di `src/data/level2Data.js` (5 ukara masih draf).

### Tahap 6 — Level 3: Nemokke Ukara
- [x] Popup sejarah → gulungan kertas (klik) → perintah pada kertas yang membentang.
- [x] 5 ukara di papan prasasti; klik tembung yang salah → panel keyboard aksara → "Priksa" → umpan balik. Bener jika memilih tembung yang salah DAN menulis ulang dengan tepat.
- [x] Keyboard aksara reusable (`src/ui/aksaraKeyboard.js`): tab Legena / Sandhangan / Pasangan, pangkon (pangkon + ZWNJ, tidak jadi pasangan), pada, ⌫ per ketikan, busak kabeh.
- [x] Tutorial keyboard 3 langkah muncul saat keyboard pertama dibuka + tombol "?".
- [x] Papan skor menampilkan alasan kesalahan; item **Gulungan Kertas**.
- [x] `normalizeAksara` mempertahankan ZWNJ di antara pangkon dan aksara (membedakan pangkon tampil vs pasangan).
- Konten di `src/data/level3Data.js` (5 ukara masih draf).

### Tahap 7 — Level 4: TTS Aksara Jawa
- [x] Popup sejarah → langsung TTS 10×7, 10 pitakon (4 mendatar, 6 menurun), 1 kotak = 1 suku kata aksara, 9 persilangan.
- [x] Pilih pitakon/kotak (klik ulang kotak persilangan = ganti arah) → ketik dengan keyboard aksara (kotak terisi live per suku kata) → "Priksa" sekali; jumlah kotak harus pas.
- [x] Setelah diperiksa, wangsulan bener tampil di grid (hijau/merah; kotak hijau tidak diturunkan jadi merah).
- [x] Papan skor → item **Mahkota** → **Rekap Petualangan** (EndingScene): 4 level, bintang, bener, skor, item, total; avatar memakai mahkota + memegang gulungan kertas (SVG sementara). Save mencatat `gameCompleted`.
- Konten di `src/data/level4Data.js` (pitakon draf). Susunan grid dibuat dengan generator; jika tembung diganti, grid harus disusun ulang.

### Tahap 8 — Evaluasi
Kuis aksara Jawa & isi game; nilai disimpan, bisa diulang.

### Tahap 9 — Uji coba & penyempurnaan
`npm run build`, uji laptop + HP/tablet lanskap (sentuh, drag, keyboard aksara), SFX, README.

## Konten & aset yang dibutuhkan dari pengembang

- [ ] Soal L1: 5 tembung final (Latin → aksara) — saat ini draf
- [ ] Uji papan tulis dengan siswa: ambang kemiripan goresan mungkin perlu dilonggarkan karena tiap tembung hanya sekali kirim
- [ ] Soal L2: 5 kalimat rumpang final + pilihan + kunci — saat ini draf (Mojokerto, sumber, candi, adus ing, Kanjeng)
- [ ] Soal L3: 5 ukara final + letak salah + jawaban bener — saat ini draf
- [ ] Soal L4: 10 pitakon TTS final — saat ini draf (Tikus, agama, patirtan, wulan, kutha, adus, Majapahit, Trowulan, taman, kraton)
- [ ] Soal Evaluasi
- [ ] Teks sejarah tiap candi (saat ini memakai draf sementara Candi Tikus)
- [ ] Foto pengembang
- [ ] Model 3D candi (`.glb`, opsional `.usdz` untuk iOS)
- [ ] Gambar latar: bawah kolam, kotak prasasti, gulungan
- [ ] (Opsional) Gambar peta 4 candi versi final — `map-4candi.webp` adalah hasil edit `map.webp`; ilustrasi candi 1–4 masih bangunan berbeda (Wringin Lawang, Jago, Penataran, Prambanan) dan candi 1 masih bercahaya + bendera
- [ ] Cek conto aksara di Materi (`src/data/menuData.js`) dan teks Pandhuan Dolanan
- [ ] Sprite avatar Baskara memakai mahkota + gulungan (sementara SVG di atas sprite), ikon 4 item (sementara emoji)
- [ ] Konfirmasi materi: "nya" muncul di kaidah pasangan no. 2 dan no. 3
