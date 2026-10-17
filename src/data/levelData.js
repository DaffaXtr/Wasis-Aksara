/**
 * candiData: Informasi sejarah candi yang ditampilkan pada popup sebelum level dimulai.
 * model3d: model .glb yang dimuat <model-viewer> saat pemain menekan "Deleng 3D" (bisa diputar & AR).
 *          scan (opsional): embed Sketchfab hasil pindai asli, dibuka dari tautan di bawah viewer (butuh internet).
 *          Tanpa model3d, popup hanya menampilkan gambar.
 * DRAF SEMENTARA: teks sejarah menunggu naskah final dari pengembang.
 */
export const candiData = {
  tikus: {
    name: 'Candi Tikus',
    location: 'Trowulan, Mojokerto',
    image: '/assets/images/CandiTikus-Glow.webp',
    model3d: {
      // Dibuat ulang dengan: node tools/build_candi_tikus.mjs
      src: '/assets/models/candi-tikus.glb',
      scan: {
        embedUrl: 'https://sketchfab.com/models/98beaa2f618945cea6e470e89c214dbd/embed',
        credit: 'Model scan: "Candi Tikus Low Resolution" dening Om Husnul (Sketchfab)'
      }
    },
    history: [
      'Candi Tikus yaiku patirtan (papan adus suci) peninggalan Karajan Majapahit ing Trowulan, Mojokerto.',
      'Candi iki ditemokake taun 1914. Jenenge asale saka crita warga sing nemokake candi iki nalika mburu tikus sing akeh banget ing papan kono.',
      'Bangunan candi digawe saka bata abang, wujude kaya blumbang sing ana undhak-undhakane. Bangunan ing tengah dipercaya minangka lambang Gunung Mahameru, sumbering banyu urip.'
    ]
  }
};

/**
 * levelData: Konfigurasi level permainan sesuai Brief Prototipe.
 * reward: item yang didapat pemain setelah menyelesaikan level.
 * map: posisi pada map-4candi.webp dalam persen — temple: titik tengah bangunan [x, y],
 *      plate: kotak papan nama bawaan gambar [x0, y0, x1, y1] yang ditutup papan nama DOM.
 */
export const levelData = [
  {
    level: 1,
    sceneKey: 'Level1Scene',
    candi: 'tikus',
    title: 'Misteri Cathetan Patirtan',
    description: 'Usap lumut ing watu dhasar blumbang, banjur tulis 5 tembung Latin dadi aksara Jawa.',
    reward: { id: 'kunci', name: 'Kunci', icon: '🔑' },
    map: { temple: [19.7, 63.5], plate: [11.96, 71.41, 27.87, 76.3] }
  },
  {
    level: 2,
    sceneKey: 'Level2Scene',
    candi: 'tikus',
    title: 'Ndandani Prasasti Kuno',
    description: 'Bukak kothak prasasti, banjur jangkepi 5 ukara rumpang kanthi nyeret aksara sing trep.',
    reward: { id: 'kaca_pembesar', name: 'Kaca Pembesar', icon: '🔍' },
    map: { temple: [36.2, 39.5], plate: [30.74, 47.82, 41.51, 52.39] }
  },
  {
    level: 3,
    sceneKey: 'Level3Scene',
    candi: 'tikus',
    title: 'Nemokke Ukara',
    description: 'Golekana aksara sing salah ing 5 ukara, banjur bener-ake nganggo keyboard aksara.',
    reward: { id: 'gulungan_kertas', name: 'Gulungan Kertas', icon: '📜' },
    map: { temple: [61.6, 21.5], plate: [55.56, 29.97, 67.46, 34.75] }
  },
  {
    level: 4,
    sceneKey: 'Level4Scene',
    candi: 'tikus',
    title: 'TTS Aksara Jawa',
    description: 'Rampungna 10 pitakon teka-teki silang nganggo aksara Jawa.',
    reward: { id: 'mahkota', name: 'Mahkota', icon: '👑' },
    map: { temple: [81.3, 40.4], plate: [74.64, 49.42, 87.92, 54.2] }
  }
];

export const TOTAL_LEVELS = levelData.length;

export const getLevel = (level) => levelData.find((item) => item.level === level);
export const getCandi = (level) => candiData[getLevel(level)?.candi];
