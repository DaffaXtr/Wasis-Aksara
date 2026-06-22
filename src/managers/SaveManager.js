/**
 * SaveManager: Mengelola penyimpanan progres game (enkripsi ringan menggunakan Base64 & serialisasi JSON ke LocalStorage).
 */
class SaveManager {
  constructor() {
    this.storageKey = 'wasis_aksara_save_data';
    this.defaultState = {
      currentLevel: 1,
      stars: [0, 0, 0, 0, 0],
      score: 0,
      artifacts: [],
      achievements: []
    };
  }

  /**
   * Mengambil data progres saat ini. Jika kosong, mengembalikan state default.
   */
  load() {
    try {
      const rawData = localStorage.getItem(this.storageKey);
      if (!rawData) {
        return { ...this.defaultState };
      }
      // Deskripsi ringan (Base64 decode)
      const decodedData = atob(rawData);
      return JSON.parse(decodedData);
    } catch (error) {
      console.error('SaveManager: Gagal memuat save data, menggunakan data default.', error);
      return { ...this.defaultState };
    }
  }

  /**
   * Menyimpan progres ke LocalStorage dengan enkripsi ringan.
   * @param {Object} state - State game saat ini
   */
  save(state) {
    try {
      const serialized = JSON.stringify(state);
      // Enkripsi ringan (Base64 encode)
      const encodedData = btoa(serialized);
      localStorage.setItem(this.storageKey, encodedData);
      console.log('SaveManager: Progres berhasil disimpan.');
      return true;
    } catch (error) {
      console.error('SaveManager: Gagal menyimpan data.', error);
      return false;
    }
  }

  /**
   * Meriset seluruh progres game.
   */
  reset() {
    try {
      localStorage.removeItem(this.storageKey);
      console.log('SaveManager: Progres berhasil diriset.');
      return { ...this.defaultState };
    } catch (error) {
      console.error('SaveManager: Gagal meriset data.', error);
      return { ...this.defaultState };
    }
  }
}

// Export single instance (Core Singleton pattern)
export default new SaveManager();
