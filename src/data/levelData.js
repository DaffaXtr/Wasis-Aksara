/**
 * levelData: Konfigurasi data level permainan, deskripsi candi, batasan waktu (detik), dan target skor.
 */
export const levelData = [
  {
    level: 1,
    candiName: 'Candi Tikus',
    title: 'Aksara Legena lan Pasangan (Papan Tulis)',
    description: 'Baskara teka ing Candi Tikus. Temokna jejak aksara, tulis tembung Latin dadi Aksara Jawa, banjur tulis ukara kanggo entuk pusaka Lentera.',
    timeLimit: 60, // Batasan waktu dalam detik
    targetScore: 1000,
    artifactReward: 'lentera'
  },
  {
    level: 2,
    candiName: 'Candi Bajang Ratu',
    title: 'Sandhangan (Complete Link)',
    description: 'Bantu Baskara memulihkan prasasti di Candi Bajang Ratu dengan memasangkan aksara dengan simbol vokalisasi (Sandhangan) yang sesuai.',
    timeLimit: 75,
    targetScore: 1200,
    artifactReward: 'cawan_tirta_swara'
  },
  {
    level: 3,
    candiName: 'Candi Brahu',
    title: 'Pasangan (Fill in Blank)',
    description: 'Tantangan mengisi celah kalimat kuno di Candi Brahu menggunakan bentuk Pasangan aksara untuk mematikan konsonan sebelumnya.',
    timeLimit: 90,
    targetScore: 1400,
    artifactReward: 'cincin_majapahit'
  },
  {
    level: 4,
    candiName: 'Candi Wringin Lawang',
    title: 'Murda & Rekan (Formula Puzzle)',
    description: 'Selesaikan teka-teki formula aksara di Candi Wringin Lawang untuk menulis nama-nama tokoh penting (Murda) dan kosakata serapan (Rekan).',
    timeLimit: 90,
    targetScore: 1500,
    artifactReward: 'prasasti_trowulan'
  },
  {
    level: 5,
    candiName: 'Candi Kedaton',
    title: 'Aksara Swara (Audio Recognition)',
    description: 'Dengarkan petunjuk suara gaib di Candi Kedaton dan pilihlah Aksara Swara yang tepat untuk membuka jalan masuk ke Altar Pamungkas.',
    timeLimit: 120,
    targetScore: 1800,
    artifactReward: 'keris_pusaka'
  }
];
