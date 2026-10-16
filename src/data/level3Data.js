/**
 * level3Data: Isi Level 3 "Nemokke Ukara" (Brief Prototipe).
 * Setiap ukara dipecah menjadi tembung yang bisa diklik (`chunks`, aksara bener + Latin).
 * Batas potongan dipilih di tempat yang tidak butuh pasangan antar-potongan, sehingga
 * ukara tetap dirender utuh. Satu potongan (`wrongIndex`) ditampilkan dengan `wrong`.
 * DRAF SEMENTARA: menunggu soal final dari pengembang materi.
 */

// Pangkon yang tampil (tidak membentuk pasangan) = pangkon + ZWNJ
const ZWNJ = String.fromCharCode(0x200c);

export const level3Data = {
  command: {
    title: 'Nemokke Ukara',
    text: 'Ing gulungan iki ana 5 ukara, saben ukara ana siji tembung sing panulisane salah. Klik tembung sing salah, banjur tulisen sing bener nganggo keyboard aksara!'
  },
  sentences: [
    {
      chunks: [['ꦕꦤ꧀ꦢꦶ', 'Candi'], ['ꦠꦶꦏꦸꦱ꧀ꦢꦸꦩꦸꦤꦸꦁ', 'Tikus dumunung'], ['ꦲꦶꦁ', 'ing'], ['ꦠꦿꦺꦴꦮꦸꦭꦤ꧀', 'Trowulan']],
      wrongIndex: 0,
      wrong: 'ꦕꦤꦢꦶ',
      reason: 'Pasangan da kudu ditulis ing ngisore aksara na.'
    },
    {
      chunks: [['ꦧꦚꦸꦤꦺ', 'Banyune'], ['ꦧꦼꦤꦶꦁ', 'bening'], ['ꦭꦤ꧀ꦫꦼꦱꦶꦏ꧀', 'lan resik']],
      wrongIndex: 1,
      wrong: 'ꦧꦺꦤꦶꦁ',
      reason: '"bening" nganggo pepet, dudu taling.'
    },
    {
      chunks: [['ꦥꦫ', 'Para'], ['ꦥꦸꦠꦿꦶ', 'putri'], ['ꦲꦢꦸꦱ꧀ꦲꦶꦁ', 'adus ing'], ['ꦥꦠꦶꦂꦠꦤ꧀', 'patirtan']],
      wrongIndex: 3,
      wrong: 'ꦥꦠꦶꦫꦠꦤ꧀',
      reason: 'Sigeg "r" ing "patirtan" ditulis nganggo layar.'
    },
    {
      chunks: [['ꦏꦚ꧀ꦗꦼꦁ', 'Kanjeng'], ['ꦫꦠꦸ', 'ratu'], ['ꦠꦶꦤ꧀ꦢꦏ꧀ꦩꦼꦚꦁ', 'tindak menyang'], ['ꦕꦤ꧀ꦢꦶ', 'candi']],
      wrongIndex: 2,
      wrong: `ꦠꦶꦤ꧀ꦢꦏ꧀${ZWNJ}ꦩꦼꦚꦁ`,
      reason: 'Aksara mati ing tengah ukara ditulis nganggo pasangan, ora dipangku.'
    },
    {
      chunks: [['ꦲꦶꦁ', 'Ing'], ['ꦱꦕꦼꦝꦏꦺ', 'sacedhake'], ['ꦕꦤ꧀ꦢꦶ', 'candi'], ['ꦲꦤ', 'ana'], ['ꦮꦶꦠ꧀ꦒꦼꦝꦺ', 'wit gedhe']],
      wrongIndex: 4,
      wrong: 'ꦮꦶꦠꦒꦼꦝꦺ',
      reason: 'Aksara "t" sing mati kudu disambung pasangan ga.'
    }
  ],
  scoring: { correct: 100 }
};
