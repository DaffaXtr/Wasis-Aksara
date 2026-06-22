/**
 * achievementData: Parameter kondisi pembukaan lencana/badge pencapaian pemain.
 */
export const achievementData = [
  {
    id: 'pionir_aksara',
    title: 'Pionir Aksara',
    description: 'Menyelesaikan Level 1 dan menguasai dasar-dasar Aksara Legena.',
    conditionType: 'level_complete',
    targetValue: 1,
    icon: 'badge_pionir'
  },
  {
    id: 'pemburu_bintang',
    title: 'Pemburu Bintang',
    description: 'Mendapatkan total 10 bintang dari seluruh level.',
    conditionType: 'total_stars',
    targetValue: 10,
    icon: 'badge_stars'
  },
  {
    id: 'kolektor_pusaka',
    title: 'Kolektor Pusaka',
    description: 'Mengumpulkan minimal 3 artefak pusaka Majapahit.',
    conditionType: 'artifact_count',
    targetValue: 3,
    icon: 'badge_collector'
  },
  {
    id: 'sang_wasis',
    title: 'Sang Wasis Aksara',
    description: 'Menyelesaikan Altar Pamungkas dan menamatkan petualangan.',
    conditionType: 'game_complete',
    targetValue: 1,
    icon: 'badge_master'
  }
];
