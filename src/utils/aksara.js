/**
 * Util Aksara Jawa: normalisasi, pembanding jawaban, dan pemecah suku kata (kluster aksara).
 */

const PANGKON = '\uA9C0';
const ZWNJ = '\u200C';

// Aksara dasar: legena, murda, swara, ha/nga lelet, dll. (U+A984–U+A9B2)
const isBase = (char) => char >= '\uA984' && char <= '\uA9B2';
// Penanda yang menempel pada aksara sebelumnya: cecak telu, sandhangan, layar, cecak, wignyan, cakra, keret, pengkal.
const isMark = (char) => (char >= '\uA980' && char <= '\uA983') || (char >= '\uA9B3' && char <= '\uA9BF');

/**
 * Menyeragamkan teks aksara: NFC, hapus karakter tak terlihat dan spasi.
 * ZWNJ dipertahankan hanya di antara pangkon dan aksara berikutnya, karena di situ ia
 * membedakan pangkon yang tampil (ꦏ꧀\u200Cꦩ) dari pasangan (ꦏ꧀ꦩ).
 * Pada (꧈ ꧉) ikut dibuang bila `ignorePada` true.
 */
export function normalizeAksara(text = '', { ignorePada = false } = {}) {
  let result = text.normalize('NFC').replace(/[\u200B\u200D\uFEFF]/g, '').replace(/\s+/g, '');
  result = result.replace(/\u200C/g, (match, offset, whole) => (whole[offset - 1] === PANGKON && isBase(whole[offset + 1] || '') ? match : ''));
  if (ignorePada) result = result.replace(/[\uA9C1-\uA9CD]/g, '');
  return result;
}

export function isSameAksara(answer, key, options) {
  return normalizeAksara(answer, options) === normalizeAksara(key, options);
}

/**
 * Memecah teks aksara menjadi kluster yang tampil sebagai satu kesatuan visual (1 kotak TTS),
 * mis. 'ꦕꦤ꧀ꦢꦶ' → ['ꦕ', 'ꦤ꧀ꦢꦶ'] dan 'ꦥꦠꦶꦂꦠꦤ꧀' → ['ꦥ', 'ꦠꦶꦂ', 'ꦠ', 'ꦤ꧀'].
 * Aksara + pangkon + aksara (pasangan) digabung dalam satu kluster, kecuali dipisah ZWNJ
 * (pangkon yang sengaja ditampilkan, mis. 'ꦠ꧀\u200Cꦤ꧀ꦝꦶ' → ['ꦠ꧀', 'ꦤ꧀ꦝꦶ']).
 */
export function splitAksara(text = '') {
  const chars = [...text.normalize('NFC').replace(/[\u200B\u200D\uFEFF]/g, '').replace(/\s+/g, '')];
  const clusters = [];
  let current = '';

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    if (char === ZWNJ) {
      if (current) clusters.push(current);
      current = '';
    } else if (isMark(char) && current) {
      current += char;
    } else if (char === PANGKON && current) {
      current += char;
      // Pangkon diikuti aksara dasar = pasangan, tetap satu kluster.
      if (isBase(chars[i + 1] || '')) current += chars[++i];
    } else {
      if (current) clusters.push(current);
      current = char;
    }
  }
  if (current) clusters.push(current);
  return clusters;
}
