/**
 * level2Data: Isi Level 2 "Ndandani Prasasti Kuno" (Brief Prototipe).
 * Setiap ukara rumpang: aksara sebelum & sesudah bagian kosong, kunci, dan pengecoh
 * (beda satu sandhangan/pasangan). Bagian kosong selalu di batas tembung yang tidak
 * berubah bentuk karena huruf sebelumnya, sehingga ukara bisa dirender utuh.
 * DRAF SEMENTARA: menunggu soal final dari pengembang materi.
 */
export const level2Data = {
  command: {
    title: 'Ndandani Prasasti Kuno',
    text: 'Prasasti ing kothak iki wis rusak, saperangan aksarane ilang. Seretan aksara sing trep menyang papan sing kosong supaya prasasti bisa diwaca maneh!'
  },
  sentences: [
    {
      latin: ['Candi Tikus ana ing ', '.'],
      latinAnswer: 'Mojokerto',
      before: 'ꦕꦤ꧀ꦢꦶꦠꦶꦏꦸꦱ꧀ꦲꦤꦲꦶꦁ',
      after: '꧉',
      answer: 'ꦩꦺꦴꦗꦺꦴꦏꦼꦂꦠꦺꦴ',
      distractors: ['ꦩꦗꦏꦂꦠ', 'ꦩꦺꦴꦗꦺꦴꦏꦺꦂꦠꦺꦴ', 'ꦩꦸꦗꦸꦏꦼꦂꦠꦸ']
    },
    {
      latin: ['Patirtan iki dadi ', ' banyu.'],
      latinAnswer: 'sumber',
      before: 'ꦥꦠꦶꦂꦠꦤ꧀ꦲꦶꦏꦶꦢꦢꦶ',
      after: 'ꦧꦚꦸ꧉',
      answer: 'ꦱꦸꦩ꧀ꦧꦼꦂ',
      distractors: ['ꦱꦸꦩꦧꦼꦂ', 'ꦱꦸꦩ꧀ꦧꦺꦂ', 'ꦱꦸꦩ꧀ꦧꦼꦁ']
    },
    {
      latin: ['Ing tengah blumbang ana ', ' cilik.'],
      latinAnswer: 'candi',
      before: 'ꦲꦶꦁꦠꦼꦔꦃꦧ꧀ꦭꦸꦩ꧀ꦧꦁꦲꦤ',
      after: 'ꦕꦶꦭꦶꦏ꧀꧉',
      answer: 'ꦕꦤ꧀ꦢꦶ',
      distractors: ['ꦕꦤꦢꦶ', 'ꦕꦤ꧀ꦢꦸ', 'ꦕꦁꦢꦶ']
    },
    {
      latin: ['Biyen para putri ', ' patirtan.'],
      latinAnswer: 'adus ing',
      before: 'ꦧꦶꦪꦺꦤ꧀ꦥꦫꦥꦸꦠꦿꦶ',
      after: 'ꦥꦠꦶꦂꦠꦤ꧀꧉',
      answer: 'ꦲꦢꦸꦱ꧀ꦲꦶꦁ',
      distractors: ['ꦲꦢꦸꦱꦲꦶꦁ', 'ꦲꦢꦸꦱꦶꦁ', 'ꦲꦝꦸꦱ꧀ꦲꦶꦁ']
    },
    {
      latin: ['', ' ratu tindak menyang patirtan.'],
      latinAnswer: 'Kanjeng',
      before: '',
      after: 'ꦫꦠꦸꦠꦶꦤ꧀ꦢꦏ꧀ꦩꦼꦚꦁꦥꦠꦶꦂꦠꦤ꧀꧉',
      answer: 'ꦏꦚ꧀ꦗꦼꦁ',
      distractors: ['ꦏꦤ꧀ꦗꦼꦁ', 'ꦏꦚ꧀ꦗꦺꦁ', 'ꦏꦚ꧀ꦗꦼꦤ꧀']
    }
  ],
  scoring: { correct: 100 }
};
