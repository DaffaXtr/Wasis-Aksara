/**
 * HintManager: Mengelola sistem bantuan (hints) dan kontrol waktu tunggu (cooldown).
 */
class HintManager {
  constructor() {
    this.cooldownDuration = 15; // Durasi cooldown standar dalam detik
    this.lastHintTime = 0; // Epoch timestamp ketika hint terakhir dipanggil
  }

  /**
   * Memeriksa apakah tombol bantuan dapat dipanggil sekarang.
   * @param {number} currentTime - Waktu saat ini (detik / milidetik)
   * @returns {boolean}
   */
  canUseHint(currentTime = Date.now()) {
    const elapsedSeconds = (currentTime - this.lastHintTime) / 1000;
    return elapsedSeconds >= this.cooldownDuration;
  }

  /**
   * Mengambil durasi cooldown sisa dalam detik.
   * @param {number} currentTime - Waktu saat ini (detik / milidetik)
   * @returns {number}
   */
  getRemainingCooldown(currentTime = Date.now()) {
    const elapsedSeconds = (currentTime - this.lastHintTime) / 1000;
    const remaining = this.cooldownDuration - elapsedSeconds;
    return Math.max(0, Math.ceil(remaining));
  }

  /**
   * Memanggil bantuan, memperbarui timestamp waktu pemanggilan terakhir.
   * @param {number} currentTime - Waktu saat ini (detik / milidetik)
   * @returns {boolean} - true jika berhasil digunakan, false jika sedang cooldown
   */
  triggerHint(currentTime = Date.now()) {
    if (this.canUseHint(currentTime)) {
      this.lastHintTime = currentTime;
      console.log('HintManager: Bantuan digunakan. Cooldown dimulai.');
      return true;
    }
    console.warn('HintManager: Gagal memanggil bantuan, tombol masih dalam durasi cooldown.');
    return false;
  }

  /**
   * Meriset status cooldown agar bantuan dapat langsung digunakan.
   */
  resetCooldown() {
    this.lastHintTime = 0;
    console.log('HintManager: Cooldown bantuan diriset.');
  }
}

// Export single instance (Core Singleton pattern)
export default new HintManager();
