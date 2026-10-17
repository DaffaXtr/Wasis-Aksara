/**
 * level4Data: Isi Level 4 "TTS Aksara Jawa" (Brief Prototipe).
 * Grid 10×7, 1 kotak = 1 suku kata aksara (kluster, lihat splitAksara).
 * Susunan dibuat otomatis agar persilangan selalu pada kluster yang sama dan
 * tidak ada tembung yang menempel sejajar. row/col = kotak pertama tembung.
 * DRAF SEMENTARA: pitakon & tembung menunggu naskah final dari pengembang materi.
 */
export const level4Data = {
  width: 10,
  height: 7,
  words: [
    { latin: 'Tikus', answer: 'ꦠꦶꦏꦸꦱ꧀', row: 4, col: 0, dir: 'across', clue: 'Jenenge candi patirtan ing Trowulan: Candi ….' },
    { latin: 'agama', answer: 'ꦲꦒꦩ', row: 2, col: 2, dir: 'across', clue: 'Hindu lan Buddha iku jenenge ….' },
    { latin: 'patirtan', answer: 'ꦥꦠꦶꦂꦠꦤ꧀', row: 4, col: 4, dir: 'across', clue: 'Papan adus suci jaman biyen, wujude Candi Tikus.' },
    { latin: 'wulan', answer: 'ꦮꦸꦭꦤ꧀', row: 2, col: 7, dir: 'across', clue: 'Rembulan; uga tegese sasi ing tanggalan.' },
    { latin: 'kutha', answer: 'ꦏꦸꦛ', row: 4, col: 1, dir: 'down', clue: 'Papan sing akeh omah lan wonge, kosok baline desa.' },
    { latin: 'adus', answer: 'ꦲꦢꦸꦱ꧀', row: 2, col: 2, dir: 'down', clue: 'Ngresiki awak nganggo banyu, kaya ing patirtan.' },
    { latin: 'Majapahit', answer: 'ꦩꦗꦥꦲꦶꦠ꧀', row: 2, col: 4, dir: 'down', clue: 'Karajan gedhe sing mbangun Candi Tikus.' },
    { latin: 'Trowulan', answer: 'ꦠꦿꦺꦴꦮꦸꦭꦤ꧀', row: 1, col: 7, dir: 'down', clue: 'Papan dumunung Candi Tikus ing Mojokerto.' },
    { latin: 'taman', answer: 'ꦠꦩꦤ꧀', row: 4, col: 6, dir: 'down', clue: 'Papan sing akeh kembang lan wit-witan.' },
    { latin: 'kraton', answer: 'ꦏꦿꦠꦺꦴꦤ꧀', row: 0, col: 9, dir: 'down', clue: 'Omahe ratu utawa raja.' }
  ],
  scoring: { correct: 100 }
};
