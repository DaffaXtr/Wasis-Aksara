/**
 * AudioManager: Mengatur pemutaran musik latar (BGM) dan efek suara (SFX).
 */
class AudioManager {
  constructor() {
    this.soundManager = null;
    this.bgmVolume = 0.5;
    this.sfxVolume = 0.8;
    this.isMuted = false;
    this.currentBgm = null;
  }

  /**
   * Menginisialisasi AudioManager dengan Sound Manager milik Phaser.
   * @param {Phaser.Sound.BaseSoundManager} phaserSoundManager 
   */
  init(phaserSoundManager) {
    this.soundManager = phaserSoundManager;
    console.log('AudioManager: Diinisialisasi dengan Phaser Sound Manager.');
  }

  /**
   * Memutar BGM tertentu.
   * @param {string} key - Aset BGM yang dimuat di Phaser
   * @param {boolean} loop - Mengulang pemutaran (default: true)
   */
  playBGM(key, loop = true) {
    if (!this.soundManager || this.isMuted) return;
    
    if (this.currentBgm && this.currentBgm.key === key && this.currentBgm.isPlaying) {
      // BGM yang sama sedang diputar, tidak perlu memulai ulang
      return;
    }
    
    this.stopBGM();
    
    try {
      this.currentBgm = this.soundManager.add(key, {
        volume: this.bgmVolume,
        loop: loop
      });
      this.currentBgm.play();
      console.log(`AudioManager: Memutar BGM '${key}'.`);
    } catch (e) {
      console.warn(`AudioManager: Gagal memutar BGM '${key}'. Aset mungkin belum dimuat.`, e);
    }
  }

  /**
   * Menghentikan BGM yang sedang diputar.
   */
  stopBGM() {
    if (this.currentBgm) {
      this.currentBgm.stop();
      this.currentBgm.destroy();
      this.currentBgm = null;
      console.log('AudioManager: BGM dihentikan.');
    }
  }

  /**
   * Memutar efek suara (SFX) sekali pemutaran.
   * @param {string} key - Aset SFX yang dimuat di Phaser
   */
  playSFX(key) {
    if (!this.soundManager || this.isMuted) return;

    try {
      this.soundManager.play(key, { volume: this.sfxVolume });
      console.log(`AudioManager: Memutar SFX '${key}'.`);
    } catch (e) {
      console.warn(`AudioManager: Gagal memutar SFX '${key}'. Aset mungkin belum dimuat.`, e);
    }
  }

  /**
   * Membisukan atau membunyikan seluruh audio.
   */
  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.soundManager) {
      this.soundManager.mute = this.isMuted;
    }
    console.log(`AudioManager: Status bisu diubah menjadi ${this.isMuted}.`);
    return this.isMuted;
  }
}

// Export single instance (Core Singleton pattern)
export default new AudioManager();
