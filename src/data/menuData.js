/**
 * menuData: Isi halaman informasi di menu utama (Brief Prototipe bagian 1).
 * Teks CP, TP, profil, dan kaidah materi disalin dari brief; conto aksara & pandhuan masih draf
 * dan perlu dicek pengembang materi.
 */

export const capaianPembelajaran = {
  fase: 'Fase D',
  text: 'Peserta didik mampu menulis gagasan, pikiran, pandangan, arahan atau pesan tertulis untuk berbagai tujuan secara logis, kritis, dan kreatif menggunakan huruf latin dan Aksara Jawa/Carakan Madhurâ. Peserta didik mampu menyampaikan ungkapan rasa simpati, empati, peduli, dan pendapat pro/kontra sesuai unggah-ungguh basa/tata krama dalam memberikan penghargaan secara tertulis dalam teks multimoda. Peserta didik mampu menulis dan mengembangkan kosakata baru dengan menggunakan basa rinengga/lalongèt untuk menyajikan gagasan sesuai unggah-ungguh basa/onḍhâgghâ bhâsa. Peserta didik mampu menulis berdasarkan fakta, pengalaman, imajinasi secara indah dan menarik dalam bentuk gancaran/ghâncaran, geguritan/puisi serta tembang macapat/tembhâng macapat menggunakan kosa kata secara kreatif.'
};

export const tujuanPembelajaran = [
  'Peserta didik mampu mengenali dan menuliskan kata atau kosakata berhuruf Latin ke dalam aksara Jawa dengan bentuk aksara yang tepat sesuai kaidah penulisan.',
  'Peserta didik mampu menulis kata dan kalimat sederhana menggunakan aksara Jawa dengan menerapkan sandhangan dan pasangan secara tepat sesuai kaidah.',
  'Peserta didik mampu menghasilkan kalimat, pesan, atau teks pendek menggunakan aksara Jawa berdasarkan konteks, fakta, pengalaman, atau imajinasi secara tepat dan kreatif.'
];

export const profilPangembang = {
  name: 'Purba Larang',
  program: 'S1 Pendidikan Basa lan Sastra Jawa',
  university: 'Universitas Negeri Surabaya',
  // Taruh foto di public/assets/images/ dengan nama ini; selama belum ada, tampil inisial.
  photo: '/assets/images/profil-pengembang.webp'
};

// U+200C (ZWNJ) setelah pangkon memaksa pangkon tampil, bukan berubah jadi pasangan.
export const materi = [
  {
    title: 'Pasangan ha, sa, pa',
    rule: 'Pasangan ha, sa, lan pa ditulis ing sapinggire aksara.',
    examples: [
      { latin: 'mangan iwak', aksara: 'ꦩꦔꦤ꧀ꦲꦶꦮꦏ꧀' },
      { latin: 'adhik sinau', aksara: 'ꦲꦝꦶꦏ꧀ꦱꦶꦤꦲꦸ' },
      { latin: 'anak pinter', aksara: 'ꦲꦤꦏ꧀ꦥꦶꦤ꧀ꦠꦼꦂ' }
    ]
  },
  {
    title: 'Pasangan na, da, wa, nya',
    rule: 'Pasangan na, da, wa, lan nya ditulis ana ing ngisore aksara lan digabung karo sikil paling mburi saka aksara.',
    examples: [
      { latin: 'Hindu', aksara: 'ꦲꦶꦤ꧀ꦢꦸ' },
      { latin: 'kebon wetan', aksara: 'ꦏꦼꦧꦺꦴꦤ꧀ꦮꦺꦠꦤ꧀' },
      { latin: 'tikus nyolong', aksara: 'ꦠꦶꦏꦸꦱ꧀ꦚꦺꦴꦭꦺꦴꦁ' }
    ]
  },
  {
    title: 'Pasangan ra, ya, ga, nya',
    rule: 'Pasangan ra, ya, ga, lan nya wujude padha kaya aksara kuwi dhewe lan panulisane ana ing sangisore aksara.',
    examples: [
      { latin: 'dalan rusak', aksara: 'ꦢꦭꦤ꧀ꦫꦸꦱꦏ꧀' },
      { latin: 'anak yatim', aksara: 'ꦲꦤꦏ꧀ꦪꦠꦶꦩ꧀' },
      { latin: 'anak gedhe', aksara: 'ꦲꦤꦏ꧀ꦒꦼꦝꦺ' }
    ]
  },
  {
    title: 'Panulisan n/c + j',
    rule: 'Menawa ana huruf n/c sing diikuti j, panulisane diowahi dadi "ny". Nanging yen n/c sing diikuti j ana ing 2 tembung sing kapisah, tetep ditulis "n".',
    examples: [
      { latin: 'kanjeng', aksara: 'ꦏꦚ꧀ꦗꦼꦁ', note: 'n + j → ny' },
      { latin: 'panji', aksara: 'ꦥꦚ꧀ꦗꦶ', note: 'n + j → ny' },
      { latin: 'kebon jati', aksara: 'ꦏꦼꦧꦺꦴꦤ꧀ꦗꦠꦶ', note: '2 tembung kapisah → tetep n' }
    ]
  },
  {
    title: 'Ora oleh pasangan tumpuk',
    rule: 'Ora oleh ana pasangan tumpuk. Yen ana huruf konsonan ngarep, kudu dipangku.',
    examples: [
      { latin: 'mangkat ndhisik', aksara: 'ꦩꦁꦏꦠ꧀\u200Cꦤ꧀ꦝꦶꦱꦶꦏ꧀', note: '"t" dipangku amarga "ndh" wis nganggo pasangan' }
    ]
  }
];

export const pandhuanDolanan = [
  {
    icon: '▶',
    title: 'Miwiti Petualangan',
    text: 'Pencet "Mulai Petualangan" kanggo maca crita Baskara. Sawise prolog rampung, kowe bakal mlebu ing Peta Jelajah Candi.'
  },
  {
    icon: '🗺',
    title: 'Milih Candi',
    text: 'Pilih candi sing wis kabukak ing peta. Candi sabanjure kabukak sawise kowe ngrampungake tantangan ing candi sadurunge.'
  },
  {
    icon: '🏛',
    title: 'Sejarah lan Perintah',
    text: 'Waca sejarah candi dhisik, banjur tindakake perintah tantangan sing katon ing layar.'
  },
  {
    icon: '✍',
    title: 'Wangsulana Pitakon',
    text: 'Saben level duwe cara mangsuli dhewe: nulis ing papan tulis, nyeret aksara, nganggo keyboard aksara, lan ngisi TTS. Saben wangsulan bakal oleh umpan balik "Wangsulanmu Bener" utawa "Wangsulanmu Salah".'
  },
  {
    icon: '🏆',
    title: 'Papan Skor lan Item',
    text: 'Sawise rampung, delengen papan skor lan wangsulan sing bener. Kowe uga oleh item: Kunci, Kaca Pembesar, Gulungan Kertas, lan Mahkota.'
  },
  {
    icon: '📖',
    title: 'Sinau Maneh',
    text: 'Yen bingung, bukaken Materi utawa Kamus Aksara. Sawise kabeh candi rampung, garapen Evaluasi kanggo ngukur kawasisanmu.'
  }
];
