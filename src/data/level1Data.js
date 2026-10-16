/**
 * level1Data: Isi Level 1 "Misteri Cathetan Patirtan" (Brief Prototipe).
 * DRAF SEMENTARA: 5 tembung & teks narasi menunggu naskah final dari pengembang materi.
 */
export const level1Data = {
  // Dialog di permukaan sebelum nyilem ke dhasar blumbang
  narrative: [
    'Kowe wis teka ing Candi Tikus, patirtan peninggalan Karajan Majapahit.',
    'Ing dhasar blumbang ana watu kuna sing ketutup lumut. Ayo nyilem lan temokna cathetan sing didhelikake!'
  ],
  // Tulisan pada watu yang terbuka setelah lumut diusap
  stone: {
    title: 'Cathetan Patirtan',
    instruction: 'Tulisen tembung-tembung iki nganggo aksara Jawa ing papan tulis!'
  },
  words: [
    { latin: 'patirtan', aksara: 'ꦥꦠꦶꦂꦠꦤ꧀' },
    { latin: 'Majapahit', aksara: 'ꦩꦗꦥꦲꦶꦠ꧀' },
    { latin: 'Hindu', aksara: 'ꦲꦶꦤ꧀ꦢꦸ' },
    { latin: 'blumbang', aksara: 'ꦧ꧀ꦭꦸꦩ꧀ꦧꦁ' },
    { latin: 'Trowulan', aksara: 'ꦠꦿꦺꦴꦮꦸꦭꦤ꧀' }
  ],
  scoring: { correct: 100, correctWithHint: 50 },
  // Bagian lumut yang harus diusap sebelum cathetan terbaca
  mossClearTarget: 0.6
};
