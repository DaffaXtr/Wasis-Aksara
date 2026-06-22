# Wasis Aksara - Petualangan Belajar Aksara Jawa 🏛️

**Wasis Aksara** adalah sebuah game edukasi interaktif berbasis web browser bertema sejarah Kerajaan Majapahit. Game ini dirancang khusus untuk membantu pemain mempelajari Aksara Jawa kuno melalui petualangan karakter Baskara dalam mengumpulkan 5 pusaka aksara yang tersebar di candi-candi suci.

Game ini dikembangkan menggunakan **Phaser 3** untuk rendering grafis kanvas (gameplay) dan **Tailwind CSS v4** untuk rendering antarmuka pengguna (UI) DOM overlay yang responsif dan berestetika premium.

---

## 🚀 Fitur Utama

- **Transisi Scene yang Mulus (Smooth Transitions)**: Perpindahan antar scene disinkronkan secara presisi menggunakan kombinasi efek Phaser Camera Fade (`fadeIn`/`fadeOut`) dan transisi opacity CSS pada UI overlay DOM.
- **Peta Seleksi Level Interaktif**: Peta seleksi tingkat permainan berbasis gambar `map.webp` lengkap dengan:
  - **Logic Penguncian**: Level baru hanya akan terbuka jika level sebelumnya telah berhasil diselesaikan.
  - **Visual State**: Cincin denyut cahaya emas (`animate-ping`) untuk level aktif dan overlay gembok untuk level terkunci.
  - **Tooltip Detail**: Hover card yang menampilkan informasi tantangan, deskripsi materi, perolehan bintang, dan skor terbaik.
- **Autosave Progress**: Penyimpanan otomatis data permainan (tingkat level terbuka, perolehan bintang emas, skor terbaik, total skor) yang terintegrasi dengan LocalStorage browser.
- **Latar Belakang Prolog Dinamis**: Alur cerita prolog 9 langkah yang memuat gambar latar belakang dinamis (`prolog1.webp` s.d `prolog9.webp`) secara halus dengan efek cross-fade dual-layer CSS.
- **Penguncian Orientasi Layar (Landscape Orientation Lock)**: Game berjalan optimal pada mode lanskap. Jika mendeteksi orientasi potret pada perangkat mobile, layar peringatan rotasi interaktif akan muncul.
- **Manajemen Audio Cerdas**: Dukungan musik latar belakang (BGM) dengan bypass kebijakan autoplay browser modern (diaktifkan otomatis saat interaksi pertama pengguna).

---

## 🛠️ Tech Stack & Arsitektur

- **Game Engine**: [Phaser v3.90.0](https://phaser.io/)
- **CSS Framework**: [Tailwind CSS v4.3.1](https://tailwindcss.com/)
- **Bundler / Build Tool**: [Vite v8.0.16](https://vite.dev/)
- **Bahasa**: Vanilla JavaScript (ES6 Modules)

---

## 📁 Struktur Direktori

```text
Wasis-Aksara/
├── public/
│   └── assets/
│       ├── audio/       # BGM & SFX (.mp3)
│       ├── fonts/       # Berkas font lokal (.woff2)
│       ├── images/      # Gambar latar belakang & SVG Buttons
│       └── sprites/     # Aset sprite karakter & animasi gameplay
├── src/
│   ├── config/          # Konfigurasi Phaser game engine
│   ├── data/            # Data konstanta materi aksara & level
│   ├── managers/        # Objek pengelola (Save, Audio, Score, Hint)
│   ├── scenes/          # Modul Scene Phaser (Boot, Preload, Menu, Map, Levels, dll.)
│   ├── templates/       # Berkas template HTML modular (raw string imports)
│   ├── ui/              # Komponen widget UI reusable
│   ├── index.css        # Konfigurasi tema Tailwind CSS v4 & At-rules
│   └── main.js          # Entry point inisialisasi game
├── index.html           # Berkas HTML utama (viewport & overlay container)
├── vite.config.js       # Konfigurasi plugin & build bundler Vite
└── package.json         # Konfigurasi dependensi npm
```

---

## 🎨 Token & Tema Desain

Menggunakan tema visual bernuansa kerajaan kuno Majapahit dan material bebatuan candi:
- **Majapahit Gold**: `#D4A64A` (Utama), `#F2D28A` (Terang), `#8B6A2B` (Gelap)
- **Stone Theme**: `#3E3228` (Gelap), `#E8E1D4` (Terang)
- **Typography**: 
  - `Cinzel` untuk judul utama dan teks formal kerajaan.
  - `Marcellus` untuk judul sub-kategori/lokasi candi.
  - `Poppins` untuk teks narasi, tombol, dan tooltip detail.
  - `javanese` untuk penulisan Aksara Jawa.

---

## 🏁 Cara Menjalankan Project

### Prasyarat
Pastikan Anda sudah menginstal [Node.js](https://nodejs.org/) di perangkat Anda.

### 1. Instalasi Dependensi
Jalankan perintah berikut di terminal pada direktori proyek untuk menginstal modul pendukung:
```bash
npm install
```

### 2. Jalankan Mode Pengembangan (Local Dev Server)
Jalankan server lokal untuk melakukan pengujian game di browser Anda:
```bash
npm run dev
```
Buka browser pada alamat yang tertera (biasanya `http://localhost:5173/`).

### 3. Kompilasi Produksi (Build Output)
Untuk mengompilasi proyek menjadi aset statis production-ready:
```bash
npm run build
```
Hasil build akan berada di direktori `dist/`.

### 4. Preview Build Produksi
Untuk menjalankan uji coba hasil build produksi secara lokal:
```bash
npm run preview
```
