import { TOTAL_LEVELS, getLevel } from '../data/levelData.js';

const SAVE_VERSION = 2;

/**
 * SaveManager: Mengelola penyimpanan progres game (enkripsi ringan menggunakan Base64 & serialisasi JSON ke LocalStorage).
 */
class SaveManager {
  constructor() {
    this.storageKey = 'wasis_aksara_save_data';
  }

  get defaultState() {
    return {
      version: SAVE_VERSION,
      currentLevel: 1,
      stars: Array(TOTAL_LEVELS).fill(0),
      scores: Array(TOTAL_LEVELS).fill(0),
      score: 0,
      items: [],
      // { [level]: { score, stars, answers: [{ question, playerAnswer, correctAnswer, correct }], completedAt } }
      levelResults: {},
      evaluation: null
    };
  }

  /**
   * Mengonversi save versi lama (5 level, artifacts) ke struktur 4 level.
   */
  migrate(data) {
    if (data.version === SAVE_VERSION) return data;
    const fresh = this.defaultState;
    const fit = (values) => fresh.stars.map((_, index) => values?.[index] || 0);
    const scores = fit(data.scores);
    return {
      ...fresh,
      currentLevel: Math.min(Math.max(data.currentLevel || 1, 1), TOTAL_LEVELS),
      stars: fit(data.stars),
      scores,
      score: scores.reduce((sum, value) => sum + value, 0),
      lastActiveScene: data.lastActiveScene
    };
  }

  /**
   * Mengambil data progres saat ini. Jika kosong, mengembalikan state default.
   */
  load() {
    try {
      const rawData = localStorage.getItem(this.storageKey);
      if (!rawData) {
        return this.defaultState;
      }
      // Deskripsi ringan (Base64 decode, aman untuk karakter Unicode seperti aksara Jawa)
      const decodedData = decodeURIComponent(escape(atob(rawData)));
      return this.migrate(JSON.parse(decodedData));
    } catch (error) {
      console.error('SaveManager: Gagal memuat save data, menggunakan data default.', error);
      return this.defaultState;
    }
  }

  /**
   * Menyimpan progres ke LocalStorage dengan enkripsi ringan.
   * @param {Object} state - State game saat ini
   */
  save(state) {
    try {
      const serialized = JSON.stringify(state);
      // Enkripsi ringan (Base64 encode, aman untuk karakter Unicode seperti aksara Jawa)
      const encodedData = btoa(unescape(encodeURIComponent(serialized)));
      localStorage.setItem(this.storageKey, encodedData);
      console.log('SaveManager: Progres berhasil disimpan.');
      return true;
    } catch (error) {
      console.error('SaveManager: Gagal menyimpan data.', error);
      return false;
    }
  }

  /**
   * Menyimpan hasil satu level: skor & bintang terbaik, rekap jawaban terakhir,
   * item hadiah, dan membuka level berikutnya.
   * @returns {{ save: Object, newItem: boolean }}
   */
  recordLevelResult(level, { score = 0, stars = 0, answers = [] } = {}) {
    const state = this.load();
    const index = level - 1;
    state.stars[index] = Math.max(state.stars[index] || 0, stars);
    state.scores[index] = Math.max(state.scores[index] || 0, score);
    state.score = state.scores.reduce((sum, value) => sum + value, 0);
    // Gambar goresan papan tulis tidak disimpan agar LocalStorage tetap kecil.
    const storedAnswers = answers.map(({ playerImage, ...answer }) => answer);
    state.levelResults[level] = { score, stars, answers: storedAnswers, completedAt: new Date().toISOString() };

    const reward = getLevel(level)?.reward;
    const newItem = Boolean(reward) && !state.items.includes(reward.id);
    if (newItem) state.items.push(reward.id);

    if (level === state.currentLevel && level < TOTAL_LEVELS) {
      state.currentLevel = level + 1;
    }
    if (level === TOTAL_LEVELS) state.gameCompleted = true;

    this.save(state);
    return { save: state, newItem };
  }

  /**
   * Meriset seluruh progres game.
   */
  reset() {
    try {
      localStorage.removeItem(this.storageKey);
      console.log('SaveManager: Progres berhasil diriset.');
    } catch (error) {
      console.error('SaveManager: Gagal meriset data.', error);
    }
    return this.defaultState;
  }
}

// Export single instance (Core Singleton pattern)
export default new SaveManager();
